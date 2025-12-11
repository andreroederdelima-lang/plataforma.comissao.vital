import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { listarMateriaisApoio, adicionarMaterialApoio, deletarMaterialApoio } from "../db";

/**
 * Router para gerenciar materiais de apoio (banners e vídeos)
 */
export const materiaisApoioRouter = router({
  /**
   * Listar todos os materiais de apoio
   * Acessível por todos os usuários autenticados
   */
  list: protectedProcedure.query(async () => {
    return await listarMateriaisApoio();
  }),

  /**
   * Adicionar novo material de apoio
   * Apenas admin pode adicionar
   */
  add: protectedProcedure
    .input(z.object({
      tipo: z.enum(["banner", "video"]),
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      categoria: z.enum(["redes_sociais", "explicativo", "institucional"]),
      urlArquivo: z.string().url("URL inválida"),
      thumbnailUrl: z.string().url("URL inválida").optional(),
      tamanhoBytes: z.number().optional(),
      ordem: z.number().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem adicionar materiais",
        });
      }

      await adicionarMaterialApoio(input);
      return { success: true };
    }),

  /**
   * Deletar material de apoio
   * Apenas admin pode deletar
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar materiais",
        });
      }

      await deletarMaterialApoio(input.id);
      return { success: true };
    }),
});
