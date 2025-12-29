import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const perfilRouter = router({
  /**
   * Obter dados do próprio perfil
   */
  meuPerfil: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

    const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    
    if (!user || user.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
    }

    const userData = user[0];
    
    return {
      id: userData.id,
      nome: userData.name,
      email: userData.email,
      chavePix: userData.chavePix,
      role: userData.role,
      linkCheckoutPersonalizado: userData.linkCheckoutPersonalizado,
      temSenha: !!userData.passwordHash,
    };
  }),

  /**
   * Atualizar dados do próprio perfil (nome, email, PIX)
   */
  atualizarPerfil: protectedProcedure
    .input(z.object({
      nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
      email: z.string().email("Email inválido").optional(),
      chavePix: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      const updateData: any = {};
      
      if (input.nome !== undefined) {
        updateData.name = input.nome;
      }
      
      if (input.email !== undefined) {
        // Verificar se email já está em uso por outro usuário
        const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existingUser.length > 0 && existingUser[0].id !== ctx.user.id) {
          throw new TRPCError({ code: "CONFLICT", message: "Este email já está em uso por outro usuário" });
        }
        updateData.email = input.email;
      }
      
      if (input.chavePix !== undefined) {
        updateData.chavePix = input.chavePix || null;
      }

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhum dado para atualizar" });
      }

      await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));

      return { success: true, message: "Perfil atualizado com sucesso!" };
    }),

  /**
   * Alterar senha do próprio usuário
   */
  alterarSenha: protectedProcedure
    .input(z.object({
      senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
      novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
      confirmarSenha: z.string().min(1, "Confirmação de senha é obrigatória"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco de dados indisponível" });

      // Validar se nova senha e confirmação são iguais
      if (input.novaSenha !== input.confirmarSenha) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nova senha e confirmação não coincidem" });
      }

      // Buscar usuário com hash de senha
      const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      
      if (!user || user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const userData = user[0];

      // Se usuário não tem senha (OAuth), não pode alterar
      if (!userData.passwordHash) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Usuário autenticado via OAuth não pode alterar senha. Entre em contato com o administrador." 
        });
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(input.senhaAtual, userData.passwordHash);
      if (!senhaValida) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Senha atual incorreta" });
      }

      // Gerar hash da nova senha
      const novoHash = await bcrypt.hash(input.novaSenha, 10);

      // Atualizar senha
      await db.update(users).set({ passwordHash: novoHash }).where(eq(users.id, ctx.user.id));

      return { success: true, message: "Senha alterada com sucesso!" };
    }),
});
