import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { cardsRecursos } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const cardsRecursosRouter = router({
  /**
   * Listar todos os cards ativos (para promotores)
   */
  list: protectedProcedure
    .input(z.object({
      secao: z.enum(["recursos_adicionais", "landing_pages"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      let query = db
        .select()
        .from(cardsRecursos)
        .where(eq(cardsRecursos.isActive, 1))
        .orderBy(cardsRecursos.ordem, cardsRecursos.createdAt);

      if (input?.secao) {
        query = db
          .select()
          .from(cardsRecursos)
          .where(
            and(
              eq(cardsRecursos.isActive, 1),
              eq(cardsRecursos.secao, input.secao)
            )
          )
          .orderBy(cardsRecursos.ordem, cardsRecursos.createdAt);
      }

      const result = await query;
      return result;
    }),

  /**
   * Listar todos os cards (incluindo inativos) - apenas admin
   */
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database não disponível");

    const result = await db
      .select()
      .from(cardsRecursos)
      .orderBy(cardsRecursos.secao, cardsRecursos.ordem, cardsRecursos.createdAt);

    return result;
  }),

  /**
   * Criar novo card - apenas admin
   */
  create: adminProcedure
    .input(z.object({
      secao: z.enum(["recursos_adicionais", "landing_pages"]),
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      link: z.string().url("Link inválido").optional(),
      icone: z.string().optional(),
      ordem: z.number().int().min(0).default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      await db.insert(cardsRecursos).values({
        secao: input.secao,
        titulo: input.titulo,
        descricao: input.descricao || null,
        link: input.link || null,
        icone: input.icone || null,
        ordem: input.ordem,
        isActive: 1,
      });

      return { success: true };
    }),

  /**
   * Atualizar card existente - apenas admin
   */
  update: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
      secao: z.enum(["recursos_adicionais", "landing_pages"]).optional(),
      titulo: z.string().min(1).optional(),
      descricao: z.string().optional(),
      link: z.string().url("Link inválido").optional().or(z.literal("")),
      icone: z.string().optional(),
      ordem: z.number().int().min(0).optional(),
      isActive: z.number().int().min(0).max(1).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      const { id, ...updateData } = input;

      // Remover campos undefined
      const cleanData: any = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanData[key] = value === "" ? null : value;
        }
      });

      await db
        .update(cardsRecursos)
        .set(cleanData)
        .where(eq(cardsRecursos.id, id));

      return { success: true };
    }),

  /**
   * Excluir card (soft delete) - apenas admin
   */
  delete: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      // Soft delete: marcar como inativo
      await db
        .update(cardsRecursos)
        .set({ isActive: 0 })
        .where(eq(cardsRecursos.id, input.id));

      return { success: true };
    }),

  /**
   * Excluir card permanentemente - apenas admin
   */
  deletePermanent: adminProcedure
    .input(z.object({
      id: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      await db
        .delete(cardsRecursos)
        .where(eq(cardsRecursos.id, input.id));

      return { success: true };
    }),
});
