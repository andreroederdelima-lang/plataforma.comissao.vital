import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { beneficioPromotor, indicacoes, users } from "../../drizzle/schema";
import {
  isAdmin,
  isPromotor,
  podeDefinirBeneficioPromotor,
} from "../../shared/roles";

/**
 * Router de benefícios do promotor.
 *
 * Contexto de negócio:
 *  - O promotor NÃO recebe comissão recorrente. Recebe 1 benefício por
 *    indicação que vire venda_fechada.
 *  - O benefício é "mensalidade grátis" OU "PIX", decidido caso-a-caso
 *    pelo vendedor em diálogo com o promotor.
 *  - Só vale enquanto o promotor continuar trazendo novas indicações
 *    (regra de negócio, ainda não imposta pelo schema).
 */
export const beneficiosPromotorRouter = router({
  /**
   * Lista benefícios do promotor logado.
   */
  meus: protectedProcedure.query(async ({ ctx }) => {
    if (!isPromotor(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas promotores podem ver seus benefícios",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco de dados não disponível",
      });
    }

    return await db
      .select()
      .from(beneficioPromotor)
      .where(eq(beneficioPromotor.promotorId, ctx.user.id))
      .orderBy(desc(beneficioPromotor.createdAt));
  }),

  /**
   * Lista todos os benefícios pendentes (admin + vendedores).
   */
  listarPendentes: protectedProcedure.query(async ({ ctx }) => {
    if (!podeDefinirBeneficioPromotor(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso restrito a admin/vendedor",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco de dados não disponível",
      });
    }

    return await db
      .select({
        beneficio: beneficioPromotor,
        promotor: {
          id: users.id,
          name: users.name,
          email: users.email,
          chavePix: users.chavePix,
        },
      })
      .from(beneficioPromotor)
      .leftJoin(users, eq(beneficioPromotor.promotorId, users.id))
      .where(eq(beneficioPromotor.status, "pendente"))
      .orderBy(desc(beneficioPromotor.createdAt));
  }),

  /**
   * Registra um novo benefício. Chamado pelo vendedor após conversar com
   * o promotor e decidir se dá mensalidade grátis ou PIX.
   *
   * A indicação precisa existir, ser do tipo="indicacao", estar como
   * "venda_fechada" e ainda não ter benefício associado.
   */
  registrar: protectedProcedure
    .input(
      z.object({
        indicacaoId: z.number().int().positive(),
        tipoBeneficio: z.enum(["mensalidade_gratis", "pix"]),
        valorCentavos: z.number().int().nonnegative().optional(),
        observacoes: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!podeDefinirBeneficioPromotor(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas admin/vendedor pode registrar benefício",
        });
      }

      if (input.tipoBeneficio === "pix" && !input.valorCentavos) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "valorCentavos é obrigatório quando tipoBeneficio='pix'",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [indicacao] = await db
        .select()
        .from(indicacoes)
        .where(eq(indicacoes.id, input.indicacaoId))
        .limit(1);

      if (!indicacao) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Indicação não encontrada" });
      }

      if (indicacao.tipo !== "indicacao") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Benefícios só se aplicam a indicações (não a vendas diretas)",
        });
      }

      if (indicacao.status !== "venda_fechada") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Só é possível registrar benefício após venda fechada",
        });
      }

      const [existente] = await db
        .select()
        .from(beneficioPromotor)
        .where(eq(beneficioPromotor.indicacaoId, input.indicacaoId))
        .limit(1);

      if (existente) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um benefício registrado para esta indicação",
        });
      }

      const [promotor] = await db
        .select({ chavePix: users.chavePix })
        .from(users)
        .where(eq(users.id, indicacao.parceiroId))
        .limit(1);

      await db.insert(beneficioPromotor).values({
        indicacaoId: input.indicacaoId,
        promotorId: indicacao.parceiroId,
        definidoPorUserId: ctx.user.id,
        tipoBeneficio: input.tipoBeneficio,
        valorCentavos:
          input.tipoBeneficio === "pix" ? input.valorCentavos! : null,
        chavePix:
          input.tipoBeneficio === "pix" ? (promotor?.chavePix ?? null) : null,
        observacoes: input.observacoes ?? null,
      });

      return { success: true };
    }),

  /**
   * Marca benefício como pago (admin/vendedor). Registra data de pagamento
   * e link/identificador do comprovante.
   */
  marcarComoPago: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        comprovantePagamento: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!podeDefinirBeneficioPromotor(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas admin/vendedor pode marcar benefício como pago",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [beneficio] = await db
        .select()
        .from(beneficioPromotor)
        .where(eq(beneficioPromotor.id, input.id))
        .limit(1);

      if (!beneficio) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Benefício não encontrado" });
      }

      if (beneficio.status !== "pendente") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Benefício já está em status '${beneficio.status}'`,
        });
      }

      await db
        .update(beneficioPromotor)
        .set({
          status: "pago",
          dataPagamento: new Date(),
          comprovantePagamento: input.comprovantePagamento ?? null,
        })
        .where(eq(beneficioPromotor.id, input.id));

      return { success: true };
    }),

  /**
   * Cancela benefício (ex.: indicação cancelada, inadimplência).
   * Só admin pode — vendedor não deve derrubar seus próprios registros.
   */
  cancelar: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        motivo: z.string().max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isAdmin(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas admin pode cancelar benefícios",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const [beneficio] = await db
        .select()
        .from(beneficioPromotor)
        .where(eq(beneficioPromotor.id, input.id))
        .limit(1);

      if (!beneficio) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Benefício não encontrado" });
      }

      if (beneficio.status === "pago") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Benefício já foi pago; use reembolso em vez de cancelar",
        });
      }

      const observacoesNovas = beneficio.observacoes
        ? `${beneficio.observacoes}\n\n[Cancelado]: ${input.motivo}`
        : `[Cancelado]: ${input.motivo}`;

      await db
        .update(beneficioPromotor)
        .set({
          status: "cancelado",
          observacoes: observacoesNovas,
        })
        .where(eq(beneficioPromotor.id, input.id));

      return { success: true };
    }),
});
