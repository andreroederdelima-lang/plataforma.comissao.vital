import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { materiaisDivulgacao, materiaisDiversos, materiaisPromotores } from "../../drizzle/schema";

export const materiaisDivulgacaoRouter = router({
  // Procedures públicos (qualquer usuário pode visualizar)
  getMateriais: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(materiaisDivulgacao).limit(1);
    return result[0] || { id: 0, centralArgumentos: "", promocaoVigente: "", updatedAt: new Date() };
  }),

  listMateriaisDiversos: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(materiaisDiversos)
      .orderBy(materiaisDiversos.ordem, materiaisDiversos.createdAt);
  }),

  // Procedures protegidos (admin/comercial podem editar)
  updateCentralArgumentos: protectedProcedure
    .input(z.object({
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin e comercial podem editar
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new Error("Sem permissão para editar");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se existe registro
      const existing = await db.select().from(materiaisDivulgacao).limit(1);
      
      if (existing.length === 0) {
        await db.insert(materiaisDivulgacao).values({
          centralArgumentos: input.conteudo,
          promocaoVigente: "",
        });
      } else {
        await db
          .update(materiaisDivulgacao)
          .set({ centralArgumentos: input.conteudo })
          .where(eq(materiaisDivulgacao.id, existing[0].id));
      }
    }),

  updatePromocaoVigente: protectedProcedure
    .input(z.object({
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin e comercial podem editar
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new Error("Sem permissão para editar");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se existe registro
      const existing = await db.select().from(materiaisDivulgacao).limit(1);
      
      if (existing.length === 0) {
        await db.insert(materiaisDivulgacao).values({
          centralArgumentos: "",
          promocaoVigente: input.conteudo,
        });
      } else {
        await db
          .update(materiaisDivulgacao)
          .set({ promocaoVigente: input.conteudo })
          .where(eq(materiaisDivulgacao.id, existing[0].id));
      }
    }),

  createMaterialDiverso: protectedProcedure
    .input(z.object({
      titulo: z.string(),
      descricao: z.string().optional(),
      tipo: z.enum(["link", "pdf", "imagem", "video", "texto"]),
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin e comercial podem criar
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new Error("Sem permissão para criar");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(materiaisDiversos).values(input);
    }),

  updateMaterialDiverso: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string(),
      descricao: z.string().optional(),
      tipo: z.enum(["link", "pdf", "imagem", "video", "texto"]),
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin e comercial podem editar
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new Error("Sem permissão para editar");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(materiaisDiversos)
        .set({
          titulo: input.titulo,
          descricao: input.descricao,
          tipo: input.tipo,
          conteudo: input.conteudo,
        })
        .where(eq(materiaisDiversos.id, input.id));
    }),

  deleteMaterialDiverso: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas admin pode deletar
      if (ctx.user.role !== "admin") {
        throw new Error("Sem permissão para deletar");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(materiaisDiversos).where(eq(materiaisDiversos.id, input.id));
    }),

  // Procedures para materiais personalizados dos promotores
  listMeusMateriais: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(materiaisPromotores)
      .where(eq(materiaisPromotores.promotorId, ctx.user.id))
      .orderBy(materiaisPromotores.createdAt);
  }),

  createMeuMaterial: protectedProcedure
    .input(z.object({
      titulo: z.string(),
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(materiaisPromotores).values({
        promotorId: ctx.user.id,
        ...input,
      });
    }),

  updateMeuMaterial: protectedProcedure
    .input(z.object({
      id: z.number(),
      titulo: z.string(),
      conteudo: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o material pertence ao promotor
      const material = await db
        .select()
        .from(materiaisPromotores)
        .where(eq(materiaisPromotores.id, input.id))
        .limit(1);

      if (material.length === 0 || material[0].promotorId !== ctx.user.id) {
        throw new Error("Material não encontrado ou sem permissão");
      }

      await db
        .update(materiaisPromotores)
        .set({
          titulo: input.titulo,
          conteudo: input.conteudo,
        })
        .where(eq(materiaisPromotores.id, input.id));
    }),

  deleteMeuMaterial: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verificar se o material pertence ao promotor
      const material = await db
        .select()
        .from(materiaisPromotores)
        .where(eq(materiaisPromotores.id, input.id))
        .limit(1);

      if (material.length === 0 || material[0].promotorId !== ctx.user.id) {
        throw new Error("Material não encontrado ou sem permissão");
      }

      await db.delete(materiaisPromotores).where(eq(materiaisPromotores.id, input.id));
    }),
});
