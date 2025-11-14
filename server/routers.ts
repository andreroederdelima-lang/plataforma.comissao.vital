import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createIndicacao, getAllIndicacoes, getIndicacoesByParceiro, updateIndicacaoStatus, createNotificacao, getNotificacoesByUser, countUnreadNotificacoes, markNotificacaoAsRead, markAllNotificacoesAsRead } from "./db";
import { notifyOwner } from "./_core/notification";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  indicacoes: router({
    /**
     * Criar uma nova indicação (requer autenticação)
     */
    create: protectedProcedure
      .input(z.object({
        nomeIndicado: z.string().min(1, "Nome é obrigatório"),
        whatsappIndicado: z.string().min(1, "WhatsApp é obrigatório"),
        tipoPlano: z.enum(["familiar", "individual"]),
        categoria: z.enum(["empresarial", "pessoa_fisica"]),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createIndicacao({
          parceiroId: ctx.user.id,
          nomeIndicado: input.nomeIndicado,
          whatsappIndicado: input.whatsappIndicado,
          tipoPlano: input.tipoPlano,
          categoria: input.categoria,
          observacoes: input.observacoes || null,
        });

        // Notificar o proprietário sobre a nova indicação
        const parceiroNome = ctx.user.name || ctx.user.email || "Parceiro";
        await notifyOwner({
          title: "Nova Indicação Recebida",
          content: `${parceiroNome} enviou uma nova indicação: ${input.nomeIndicado} (${input.tipoPlano} - ${input.categoria})`,
        });

        return { success: true };
      }),

    /**
     * Listar todas as indicações (apenas admin)
     */
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem ver todas as indicações",
        });
      }

      return await getAllIndicacoes();
    }),

    /**
     * Listar indicações do parceiro logado
     */
    listMine: protectedProcedure.query(async ({ ctx }) => {
      return await getIndicacoesByParceiro(ctx.user.id);
    }),

    /**
     * Atualizar status de uma indicação (apenas admin)
     */
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "em_analise", "aprovada", "recusada"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem atualizar o status",
          });
        }

        await updateIndicacaoStatus(input.id, input.status);
        
        // Buscar a indicação para notificar o parceiro
        const allIndicacoes = await getAllIndicacoes();
        const indicacao = allIndicacoes.find(i => i.indicacao.id === input.id);
        
        if (indicacao && indicacao.parceiro) {
          const statusLabels = {
            pendente: "Pendente",
            em_analise: "Em Análise",
            aprovada: "Aprovada",
            recusada: "Recusada",
          };
          
          await createNotificacao({
            userId: indicacao.indicacao.parceiroId,
            titulo: "Status de Indicação Atualizado",
            mensagem: `A indicação de ${indicacao.indicacao.nomeIndicado} foi atualizada para: ${statusLabels[input.status]}`,
            tipo: "status_alterado",
            indicacaoId: input.id,
          });
        }
        
        return { success: true };
      }),
  }),

  notificacoes: router({
    /**
     * Listar notificações do usuário logado
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificacoesByUser(ctx.user.id);
    }),

    /**
     * Contar notificações não lidas
     */
    countUnread: protectedProcedure.query(async ({ ctx }) => {
      return await countUnreadNotificacoes(ctx.user.id);
    }),

    /**
     * Marcar notificação como lida
     */
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificacaoAsRead(input.id, ctx.user.id);
        return { success: true };
      }),

    /**
     * Marcar todas as notificações como lidas
     */
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificacoesAsRead(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
