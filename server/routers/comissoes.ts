import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { planosSaude, configuracaoComissoes } from "../../drizzle/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const comissoesRouter = router({
  /**
   * Listar todos os planos de saúde (público)
   */
  listarPlanos: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const planos = await db
      .select()
      .from(planosSaude)
      .where(eq(planosSaude.isActive, 1))
      .orderBy(planosSaude.ordem);

    return planos;
  }),

  /**
   * Listar configurações de comissões (público)
   */
  listarConfiguracoes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const configs = await db.select().from(configuracaoComissoes);
    return configs;
  }),

  /**
   * Atualizar configuração de comissão (admin apenas)
   */
  atualizarConfiguracao: protectedProcedure
    .input(
      z.object({
        tipoLead: z.enum(["quente", "frio"]),
        percentualIndicador: z.number().min(0).max(100),
        percentualVendedor: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem atualizar configurações");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Validar que a soma é 100%
      if (input.percentualIndicador + input.percentualVendedor !== 100) {
        throw new Error("A soma dos percentuais deve ser 100%");
      }

      await db
        .update(configuracaoComissoes)
        .set({
          percentualIndicador: input.percentualIndicador,
          percentualVendedor: input.percentualVendedor,
        })
        .where(eq(configuracaoComissoes.tipoLead, input.tipoLead));

      return { success: true };
    }),

  /**
   * Atualizar plano de saúde (admin apenas)
   */
  atualizarPlano: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        precoMensal: z.number().min(0),
        bonificacaoPadrao: z.number().min(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem atualizar planos");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .update(planosSaude)
        .set({
          precoMensal: input.precoMensal,
          bonificacaoPadrao: input.bonificacaoPadrao,
        })
        .where(eq(planosSaude.id, input.id));

      return { success: true };
    }),
});
