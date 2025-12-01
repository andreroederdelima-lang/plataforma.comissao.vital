import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getConfiguracoesGerais, atualizarLinkCheckoutBase, atualizarDiasCancelamento, getLinkCheckoutCompleto } from "../db";

/**
 * Router para gerenciar configurações gerais do sistema
 * Apenas admins podem editar
 */
export const configuracoesGeraisRouter = router({
  /**
   * Obter configurações gerais
   */
  get: protectedProcedure.query(async () => {
    const config = await getConfiguracoesGerais();
    if (!config) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Configurações não encontradas",
      });
    }
    return config;
  }),

  /**
   * Atualizar link base de checkout
   * Apenas admin pode executar
   */
  atualizarLinkCheckoutBase: protectedProcedure
    .input(z.object({
      linkBase: z.string().url("Link inválido").nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem editar configurações",
        });
      }

      const success = await atualizarLinkCheckoutBase(input.linkBase);
      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar link de checkout",
        });
      }

      return { success: true };
    }),

  /**
   * Atualizar dias de cancelamento gratuito
   * Apenas admin pode executar
   */
  atualizarDiasCancelamento: protectedProcedure
    .input(z.object({
      dias: z.number().int().min(0).max(365),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem editar configurações",
        });
      }

      const success = await atualizarDiasCancelamento(input.dias);
      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar dias de cancelamento",
        });
      }

      return { success: true };
    }),

  /**
   * Obter link de checkout personalizado do usuário logado
   */
  getMeuLinkCheckout: protectedProcedure.query(async ({ ctx }) => {
    const link = await getLinkCheckoutCompleto(ctx.user.id);
    return { link };
  }),
});
