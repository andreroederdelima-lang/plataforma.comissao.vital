import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { 
  getConfiguracoesGerais, 
  atualizarLinkCheckoutBase, 
  atualizarDiasCancelamento,
  getLinkCheckoutCompleto,
  getDb
} from "../db";
import { configuracoesGerais } from "../../drizzle/schema";

export const configuracoesGeraisRouter = router({
  /**
   * Obter configurações gerais (link base e dias de cancelamento)
   */
  getConfiguracoes: protectedProcedure.query(async ({ ctx }) => {
    // Apenas admin pode visualizar configurações gerais
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Sem permissão para visualizar configurações",
      });
    }

    return await getConfiguracoesGerais();
  }),

  /**
   * Atualizar link base de checkout
   */
  atualizarLinkBase: protectedProcedure
    .input(z.object({
      linkBase: z.string().url("Link inválido"),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode editar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para editar configurações",
        });
      }

      await atualizarLinkCheckoutBase(input.linkBase);
      return { success: true };
    }),

  /**
   * Atualizar dias de cancelamento gratuito
   */
  atualizarDiasCancelamento: protectedProcedure
    .input(z.object({
      dias: z.number().int().min(0).max(365),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode editar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para editar configurações",
        });
      }

      await atualizarDiasCancelamento(input.dias);
      return { success: true };
    }),

  /**
   * Atualizar valores dos planos
   */
  atualizarValoresPlanos: protectedProcedure
    .input(z.object({
      valorEssencial: z.number().min(0),
      valorVital: z.number().min(0),
      valorPremium: z.number().min(0),
      valorEmpresarial: z.number().min(0),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode editar
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Sem permissão para editar configurações",
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      await db.update(configuracoesGerais).set({
        valorPlanoEssencial: input.valorEssencial.toFixed(2),
        valorPlanoVital: input.valorVital.toFixed(2),
        valorPlanoPremium: input.valorPremium.toFixed(2),
        valorPlanoEmpresarial: input.valorEmpresarial.toFixed(2),
      });

      return { success: true };
    }),

  /**
   * Obter link de checkout personalizado do usuário atual
   */
  getMeuLinkCheckout: protectedProcedure.query(async ({ ctx }) => {
    const linkCompleto = await getLinkCheckoutCompleto(ctx.user.id);
    
    if (!linkCompleto) {
      return {
        link: null,
        mensagem: "Link de checkout não configurado. Entre em contato com o administrador.",
      };
    }

    return {
      link: linkCompleto,
      mensagem: "Use este link para compartilhar com seus clientes. Todas as vendas serão rastreadas automaticamente.",
    };
  }),
});
