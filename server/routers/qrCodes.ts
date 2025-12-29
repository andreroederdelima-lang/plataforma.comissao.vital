import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { qrCodes } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const qrCodesRouter = router({
  // Listar QR Codes (público - promotores veem apenas ativos, admin vê todos)
  listar: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const isAdmin = ctx.user?.role === "admin";
    
    if (isAdmin) {
      // Admin vê todos
      return await db.select().from(qrCodes).orderBy(qrCodes.ordem);
    } else {
      // Promotores veem apenas ativos
      return await db.select().from(qrCodes).where(eq(qrCodes.ativo, 1)).orderBy(qrCodes.ordem);
    }
  }),

  // Criar QR Code (apenas admin)
  criar: adminProcedure
    .input(
      z.object({
        titulo: z.string().min(1, "Título é obrigatório"),
        descricao: z.string().optional(),
        link: z.string().url("Link inválido"),
        ativo: z.number().default(1),
        ordem: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.insert(qrCodes).values(input);
      return { success: true };
    }),

  // Atualizar QR Code (apenas admin)
  atualizar: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().min(1, "Título é obrigatório").optional(),
        descricao: z.string().optional(),
        link: z.string().url("Link inválido").optional(),
        ativo: z.number().optional(),
        ordem: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const { id, ...data } = input;
      await db.update(qrCodes).set(data).where(eq(qrCodes.id, id));
      return { success: true };
    }),

  // Excluir QR Code (apenas admin)
  excluir: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(qrCodes).where(eq(qrCodes.id, input.id));
      return { success: true };
    }),
});
