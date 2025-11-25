import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  getAllMateriais, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial 
} from "../db";
import { storagePut } from "../storage";

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
   * Criar novo material com upload (apenas admin)
   */
  criar: protectedProcedure
    .input(z.object({
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      tipo: z.enum(["banner", "flyer", "logo", "pdf", "imagem"]),
      categoria: z.string().optional(),
      fileData: z.string(), // Base64 data URL
      fileName: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar materiais",
        });
      }

      try {
        // Extrair dados do base64
        const base64Data = input.fileData.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const extension = input.fileName.split(".").pop();
        const fileKey = `materiais/${input.tipo}/${timestamp}-${randomSuffix}.${extension}`;

        // Fazer upload para S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Salvar no banco de dados
        await createMaterial({
          titulo: input.titulo,
          descricao: input.descricao || null,
          tipo: input.tipo,
          url: url,
          categoria: input.categoria || null,
        });

        return { success: true, url };
      } catch (error) {
        console.error("[Materiais] Erro no upload:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer upload do arquivo",
        });
      }
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
