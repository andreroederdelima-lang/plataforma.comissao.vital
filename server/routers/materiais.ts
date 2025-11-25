import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  getAllMateriais, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial 
} from "../db";

/**
 * Router de materiais de divulgação
 * Gerencia banners, flyers, logos, PDFs e imagens para divulgação
 */
export const materiaisRouter = router({
  /**
   * Listar todos os materiais (público)
   */
  listar: publicProcedure.query(async () => {
    return await getAllMateriais();
  }),

  /**
   * Criar novo material (apenas admin)
   */
  criar: protectedProcedure
    .input(z.object({
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      tipo: z.enum(["banner", "flyer", "logo", "pdf", "imagem"]),
      url: z.string().url("URL inválida"),
      categoria: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar materiais",
        });
      }

      await createMaterial({
        titulo: input.titulo,
        descricao: input.descricao || null,
        tipo: input.tipo,
        url: input.url,
        categoria: input.categoria || null,
      });

      return { success: true };
    }),

  /**
   * Atualizar material existente (apenas admin)
   */
  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      tipo: z.enum(["banner", "flyer", "logo", "pdf", "imagem"]),
      url: z.string().url("URL inválida"),
      categoria: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar materiais",
        });
      }

      await updateMaterial(input.id, {
        titulo: input.titulo,
        descricao: input.descricao || null,
        tipo: input.tipo,
        url: input.url,
        categoria: input.categoria || null,
      });

      return { success: true };
    }),

  /**
   * Excluir material (apenas admin)
   */
  excluir: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem excluir materiais",
        });
      }

      await deleteMaterial(input.id);

      return { success: true };
    }),
});
