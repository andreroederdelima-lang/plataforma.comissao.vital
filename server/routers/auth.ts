import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { sign } from "jsonwebtoken";
import { ENV } from "../_core/env";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

/**
 * Router de autenticação com email/senha para vendedores
 */
export const authRouter = router({
  /**
   * Login com email e senha (para vendedores)
   */
  loginWithPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados indisponível",
        });
      }

      // Buscar usuário por email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Verificar se usuário está ativo
      if (user.isActive === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário desativado. Entre em contato com o administrador.",
        });
      }

      // Verificar se usuário tem senha cadastrada
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este usuário não possui senha cadastrada. Use login OAuth.",
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(
        input.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Atualizar último login
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      // Gerar JWT token
      const token = sign(
        {
          openId: user.openId,
          email: user.email,
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
        },
        ENV.jwtSecret,
        { expiresIn: "7d" }
      );

      // Definir cookie de sessão
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),

  /**
   * Trocar senha (usuário logado)
   */
  changePassword: publicProcedure
    .input(
      z.object({
        currentPassword: z.string().optional(),
        newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Você precisa estar logado para trocar a senha",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados indisponível",
        });
      }

      // Buscar usuário atual
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Se usuário já tem senha, verificar senha atual
      if (user.passwordHash && input.currentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(
          input.currentPassword,
          user.passwordHash
        );

        if (!isCurrentPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }
      }

      // Hash da nova senha
      const passwordHash = await bcrypt.hash(input.newPassword, 10);

      // Atualizar senha
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "Senha alterada com sucesso",
      };
    }),

  /**
   * Solicitar recuperação de senha (enviar email)
   */
  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados indisponível",
        });
      }

      // Buscar usuário por email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      // Sempre retornar sucesso (segurança: não revelar se email existe)
      if (!user) {
        return {
          success: true,
          message: "Se o email estiver cadastrado, você receberá instruções para recuperar sua senha",
        };
      }

      // TODO: Implementar envio de email com link de recuperação
      // Por enquanto, apenas retornar sucesso
      console.log(`[Password Reset] Solicitação para: ${input.email}`);

      return {
        success: true,
        message: "Se o email estiver cadastrado, você receberá instruções para recuperar sua senha",
      };
    }),
});
