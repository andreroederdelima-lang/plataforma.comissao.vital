import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Router de autenticação para indicadores
 * Gerencia cadastro, login e recuperação de senha
 */
export const authIndicadoresRouter = router({
  /**
   * Cadastrar novo indicador
   */
  cadastrar: publicProcedure
    .input(z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("E-mail inválido"),
      whatsapp: z.string().min(10, "WhatsApp inválido"),
      senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      chavePix: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        // Importar tabela users
        const { users } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Verificar se e-mail já existe
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "E-mail já cadastrado",
          });
        }

        // Gerar hash da senha
        const passwordHash = await bcrypt.hash(input.senha, 10);

        // Gerar openId único baseado no email
        const openId = `indicador_${input.email.replace(/[@.]/g, "_")}_${Date.now()}`;

        // Criar usuário
        await db.insert(users).values({
          openId,
          name: input.nome,
          email: input.email,
          passwordHash,
          chavePix: input.chavePix || null,
          loginMethod: "email_password",
          role: "vendedor", // Indicadores são vendedores por padrão
          isActive: 1,
        });

        // Enviar e-mail de boas-vindas (opcional)
        try {
          const { sendIndicadorBoasVindas } = await import("../email");
          await sendIndicadorBoasVindas({
            email: input.email,
            nome: input.nome,
          });
        } catch (error) {
          console.error("[AuthIndicadores] Erro ao enviar e-mail de boas-vindas:", error);
          // Não falhar o cadastro se o e-mail falhar
        }

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[AuthIndicadores] Erro no cadastro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar conta",
        });
      }
    }),

  /**
   * Login de indicador
   */
  login: publicProcedure
    .input(z.object({
      email: z.string().email("E-mail inválido"),
      senha: z.string().min(1, "Senha é obrigatória"),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        const { users } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Buscar usuário por e-mail
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha incorretos",
          });
        }

        const user = result[0];

        // Verificar se usuário está ativo
        if (user.isActive === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Conta desativada. Entre em contato com o suporte.",
          });
        }

        // Verificar se tem senha (indicador)
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Esta conta usa outro método de login",
          });
        }

        // Verificar senha
        const senhaValida = await bcrypt.compare(input.senha, user.passwordHash);
        
        if (!senhaValida) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "E-mail ou senha incorretos",
          });
        }

        // Atualizar lastSignedIn
        await db
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));

        // Retornar dados do usuário (sem senha)
        return {
          success: true,
          user: {
            id: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
            chavePix: user.chavePix,
          },
        };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[AuthIndicadores] Erro no login:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer login",
        });
      }
    }),

  /**
   * Solicitar recuperação de senha
   */
  solicitarRecuperacao: publicProcedure
    .input(z.object({
      email: z.string().email("E-mail inválido"),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        const { users, passwordResetTokens } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Buscar usuário
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1);

        // Sempre retornar sucesso (não revelar se e-mail existe)
        if (result.length === 0) {
          return { success: true };
        }

        const user = result[0];

        // Verificar se é indicador (tem senha)
        if (!user.passwordHash) {
          return { success: true };
        }

        // Gerar token único
        const token = crypto.randomBytes(32).toString("hex");
        
        // Expirar em 1 hora
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Salvar token
        await db.insert(passwordResetTokens).values({
          userId: user.id,
          token,
          expiresAt,
          used: 0,
        });

        // Enviar e-mail com link
        try {
          const { sendRecuperacaoSenha } = await import("../email");
          await sendRecuperacaoSenha({
            email: user.email!,
            nome: user.name || "Indicador",
            token,
          });
        } catch (error) {
          console.error("[AuthIndicadores] Erro ao enviar e-mail de recuperação:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao enviar e-mail de recuperação",
          });
        }

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[AuthIndicadores] Erro na recuperação:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao solicitar recuperação",
        });
      }
    }),

  /**
   * Redefinir senha com token
   */
  redefinirSenha: publicProcedure
    .input(z.object({
      token: z.string().min(1, "Token é obrigatório"),
      novaSenha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import("../db");
      const db = await getDb();
      
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Banco de dados não disponível",
        });
      }

      try {
        const { users, passwordResetTokens } = await import("../../drizzle/schema");
        const { eq, and } = await import("drizzle-orm");

        // Buscar token
        const tokenResult = await db
          .select()
          .from(passwordResetTokens)
          .where(eq(passwordResetTokens.token, input.token))
          .limit(1);

        if (tokenResult.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token inválido",
          });
        }

        const resetToken = tokenResult[0];

        // Verificar se token já foi usado
        if (resetToken.used === 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token já foi utilizado",
          });
        }

        // Verificar se token expirou
        if (new Date() > resetToken.expiresAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token expirado. Solicite um novo link de recuperação.",
          });
        }

        // Gerar novo hash
        const passwordHash = await bcrypt.hash(input.novaSenha, 10);

        // Atualizar senha
        await db
          .update(users)
          .set({ passwordHash })
          .where(eq(users.id, resetToken.userId));

        // Marcar token como usado
        await db
          .update(passwordResetTokens)
          .set({ used: 1 })
          .where(eq(passwordResetTokens.id, resetToken.id));

        return { success: true };
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("[AuthIndicadores] Erro ao redefinir senha:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao redefinir senha",
        });
      }
    }),
});
