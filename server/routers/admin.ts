import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { indicacoes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Router para operações administrativas
 * Apenas usuários com role 'admin' ou 'comercial' podem acessar
 */

// Middleware para verificar se é admin ou comercial
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem executar esta ação.",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Aprovar comissão de uma venda/indicação
   * Calcula automaticamente o valor da comissão baseado no percentual
   */
  aprovarComissao: adminProcedure
    .input(
      z.object({
        indicacaoId: z.number(),
        percentualComissao: z.number().min(1).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Buscar indicação
      const [indicacao] = await db
        .select()
        .from(indicacoes)
        .where(eq(indicacoes.id, input.indicacaoId))
        .limit(1);

      if (!indicacao) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Indicação não encontrada",
        });
      }

      // Verificar se já foi aprovada
      if (indicacao.dataAprovacao) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta comissão já foi aprovada",
        });
      }

      // Verificar se tem mais de 7 dias
      if (indicacao.dataVenda) {
        const diasDesdeVenda = Math.floor(
          (Date.now() - indicacao.dataVenda.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diasDesdeVenda < 7) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Aguarde ${7 - diasDesdeVenda} dias para aprovar esta comissão (período de carência)`,
          });
        }
      }

      // Calcular valor da comissão
      let valorComissao = 0;
      if (indicacao.valorPlano) {
        valorComissao = Math.round((indicacao.valorPlano * input.percentualComissao) / 100);
      }

      // Atualizar indicação
      await db
        .update(indicacoes)
        .set({
          dataAprovacao: new Date(),
          valorComissao,
          percentualComissao: input.percentualComissao,
        })
        .where(eq(indicacoes.id, input.indicacaoId));

      return {
        success: true,
        valorComissao,
        percentualComissao: input.percentualComissao,
      };
    }),

  /**
   * Listar vendas/indicações pendentes de aprovação
   * Apenas vendas com mais de 7 dias e ainda não aprovadas
   */
  listarPendentesAprovacao: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco de dados não disponível",
      });
    }

    // Buscar todas as vendas (dataVenda não nula) que ainda não foram aprovadas
    const todasIndicacoes = await db.select().from(indicacoes);

    // Filtrar apenas vendas com mais de 7 dias e não aprovadas
    const pendentes = todasIndicacoes.filter((indicacao) => {
      if (!indicacao.dataVenda || indicacao.dataAprovacao) {
        return false;
      }
      const diasDesdeVenda = Math.floor(
        (Date.now() - indicacao.dataVenda.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diasDesdeVenda >= 7;
    });

    return pendentes;
  }),

  /**
   * Promover usuário a Admin
   */
  promoverAdmin: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const { users } = await import("../../drizzle/schema");
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Rebaixar Admin para Promotor
   */
  rebaixarPromotor: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      const { users } = await import("../../drizzle/schema");
      await db
        .update(users)
        .set({ role: "promotor" })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  /**
   * Listar vendas pendentes de conferência (dataAprovacao = null)
   * Retorna vendas diretas e indicações que ainda não foram aprovadas
   */
  listarVendasPendentes: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Banco de dados não disponível",
      });
    }

    const { users } = await import("../../drizzle/schema");
    const { isNull } = await import("drizzle-orm");
    
    // Buscar todas as vendas/indicações não aprovadas com dados do vendedor
    const result = await db
      .select({
        indicacao: indicacoes,
        parceiro: {
          id: users.id,
          name: users.name,
          email: users.email,
          cpf: users.cpf,
          chavePix: users.chavePix,
        },
      })
      .from(indicacoes)
      .leftJoin(users, eq(indicacoes.parceiroId, users.id))
      .where(isNull(indicacoes.dataAprovacao));

    return result;
  }),

  /**
   * Aprovar vendas conferidas em lote
   * Marca dataAprovacao para as vendas selecionadas
   */
  aprovarVendasConferidas: adminProcedure
    .input(z.object({
      indicacaoIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      // Aprovar todas as vendas selecionadas
      for (const id of input.indicacaoIds) {
        await db
          .update(indicacoes)
          .set({ dataAprovacao: new Date() })
          .where(eq(indicacoes.id, id));
      }

      return { success: true, count: input.indicacaoIds.length };
    }),
});
