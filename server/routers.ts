import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { createIndicacao, getAllIndicacoes, getIndicacoesByParceiro, updateIndicacaoStatus, createNotificacao, getNotificacoesByUser, countUnreadNotificacoes, markNotificacaoAsRead, markAllNotificacoesAsRead } from "./db";
import { notifyOwner } from "./_core/notification";
import { notifyNewIndicacao, notifyStatusChange, notifyProblematicStatus, notifyVendaFechada } from "./_core/email";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { materiaisRouter } from "./routers/materiais";
import { authIndicadoresRouter } from "./routers/authIndicadores";
import { comissoesRouter } from "./routers/comissoes";
import { materiaisDivulgacaoRouter } from "./routers/materiaisDivulgacao";
import { materiaisApoioRouter } from "./routers/materiaisApoio";
import { configuracoesGeraisRouter } from "./routers/configuracoesGerais";


export const appRouter = router({
  system: systemRouter,
  authIndicadores: authIndicadoresRouter,
  comissoes: comissoesRouter,
  configuracoesGerais: configuracoesGeraisRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    /**
     * Login unificado para todos os usuários (promotores, comerciais, admins)
     */
    login: publicProcedure
      .input(z.object({
        email: z.string().email("E-mail inválido"),
        senha: z.string().min(1, "Senha é obrigatória"),
      }))
      .mutation(async ({ input, ctx }) => {
        const bcrypt = await import("bcryptjs");
        const { getDb } = await import("./db");
        const db = await getDb();
        
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Banco de dados não disponível",
          });
        }

        const { users } = await import("../drizzle/schema");
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

        // Verificar senha
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Esta conta usa outro método de login",
          });
        }

        const senhaValida = await bcrypt.default.compare(input.senha, user.passwordHash);
        
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

        // Criar sessão JWT
        const jwt = await import("jsonwebtoken");
        
        const sessionToken = jwt.default.sign(
          {
            openId: user.openId,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "365d" }
        );

        // Definir cookie de sessão
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    /**
     * Atualizar campos personalizáveis do promotor
     */
    atualizarCamposPersonalizados: protectedProcedure
      .input(z.object({
        apresentacaoPersonal: z.string().optional(),
        diferenciais: z.string().optional(),
        ofertaEspecial: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Banco de dados não disponível",
          });
        }

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        await db
          .update(users)
          .set({
            apresentacaoPersonal: input.apresentacaoPersonal,
            diferenciais: input.diferenciais,
            ofertaEspecial: input.ofertaEspecial,
          })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),
    updateChavePix: protectedProcedure
      .input(z.object({
        chavePix: z.string().min(1, "Chave PIX é obrigatória"),
      }))
      .mutation(async ({ ctx, input }) => {
        const { updateChavePix } = await import("./db");
        await updateChavePix(ctx.user.id, input.chavePix);
        return { success: true };
      }),
    
    /**
     * Alterar senha do usuário logado
     */
    alterarSenha: protectedProcedure
      .input(z.object({
        senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
        novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
      }))
      .mutation(async ({ ctx, input }) => {
        const bcrypt = await import("bcryptjs");
        const { getDb } = await import("./db");
        const db = await getDb();
        
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Banco de dados não disponível",
          });
        }

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Buscar usuário
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        const user = result[0];

        // Verificar senha atual
        if (!user.passwordHash) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Esta conta não possui senha configurada",
          });
        }

        const senhaValida = await bcrypt.default.compare(input.senhaAtual, user.passwordHash);
        
        if (!senhaValida) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }

        // Gerar hash da nova senha
        const novoHash = await bcrypt.default.hash(input.novaSenha, 10);

        // Atualizar senha
        await db
          .update(users)
          .set({ passwordHash: novoHash })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      }),
    
    /**
     * Editar perfil do usuário logado
     */
    editarPerfil: protectedProcedure
      .input(z.object({
        nome: z.string().optional(),
        whatsapp: z.string().optional(),
        chavePix: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Banco de dados não disponível",
          });
        }

        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const updateData: any = {};
        
        if (input.nome !== undefined) updateData.name = input.nome;
        if (input.whatsapp !== undefined) updateData.whatsapp = input.whatsapp;
        if (input.chavePix !== undefined) updateData.chavePix = input.chavePix;

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, ctx.user.id));

        return { success: true };
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
        nomePlano: z.enum(["essencial", "premium"]),
        tipoPlano: z.enum(["familiar", "individual"]),
        categoria: z.enum(["empresarial", "pessoa_fisica"]),
        observacoes: z.string().optional(),
        // Campos específicos para vendas
        dataVenda: z.string().optional(),
        valorPlano: z.string().optional(),
        formaPagamento: z.enum(["pix", "cartao", "boleto"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Converter dataVenda string para Date se fornecida
        const dataVendaDate = input.dataVenda ? new Date(input.dataVenda) : null;
        
        // Converter valorPlano string para centavos se fornecido
        const valorPlanoInt = input.valorPlano ? Math.round(parseFloat(input.valorPlano) * 100) : null;
        
        const result = await createIndicacao({
          parceiroId: ctx.user.id,
          nomeIndicado: input.nomeIndicado,
          whatsappIndicado: input.whatsappIndicado,
          nomePlano: input.nomePlano,
          tipoPlano: input.tipoPlano,
          categoria: input.categoria,
          observacoes: input.observacoes || null,
          dataVenda: dataVendaDate,
          valorPlano: valorPlanoInt,
          formaPagamento: input.formaPagamento || null,
        });

        // Notificar o proprietário e equipe sobre a nova indicação
        const parceiroNome = ctx.user.name || ctx.user.email || "Parceiro";
        await notifyNewIndicacao({
          nomeIndicado: input.nomeIndicado,
          nomeParceiro: parceiroNome,
          tipoPlano: input.tipoPlano === "familiar" ? "Familiar" : "Individual",
          categoria: input.categoria === "empresarial" ? "Empresarial" : "Pessoa Física",
          whatsapp: input.whatsappIndicado,
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
        status: z.enum(["aguardando_contato", "em_negociacao", "venda_com_objecoes", "venda_fechada", "nao_comprou", "cliente_sem_interesse"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores e comerciais podem atualizar o status",
          });
        }

        await updateIndicacaoStatus(input.id, input.status);
        
        // Buscar a indicação para notificar o parceiro
        const allIndicacoes = await getAllIndicacoes();
        const indicacao = allIndicacoes.find(i => i.indicacao.id === input.id);
        
        if (indicacao && indicacao.parceiro) {
          const statusLabels = {
            aguardando_contato: "Aguardando Contato",
            em_negociacao: "Em Negociação",
            venda_com_objecoes: "Venda com Objeções",
            venda_fechada: "Venda Fechada",
            nao_comprou: "Não Comprou",
            cliente_sem_interesse: "Cliente Sem Interesse",
          };
          
          // Notificar o parceiro
          await createNotificacao({
            userId: indicacao.indicacao.parceiroId,
            titulo: "Status de Indicação Atualizado",
            mensagem: `A indicação de ${indicacao.indicacao.nomeIndicado} foi atualizada para: ${statusLabels[input.status]}`,
            tipo: "status_alterado",
            indicacaoId: input.id,
          });
          
          // Verificar se é venda fechada
          if (input.status === "venda_fechada") {
            // Notificar promotor sobre venda fechada com valor de comissão
            await notifyVendaFechada({
              nomeIndicado: indicacao.indicacao.nomeIndicado,
              nomeParceiro: indicacao.parceiro?.name || "Parceiro",
              parceiroEmail: indicacao.parceiro?.email || "",
              valorComissao: indicacao.indicacao.valorComissao || 0,
              tipoComissao: indicacao.indicacao.tipoComissao || "valor_fixo",
            });
          }
          // Verificar se é um status problemático
          else if (["venda_com_objecoes", "nao_comprou", "cliente_sem_interesse"].includes(input.status)) {
            // Notificar parceiro e administrativo sobre status problemático
            await notifyProblematicStatus({
              nomeIndicado: indicacao.indicacao.nomeIndicado,
              nomeParceiro: indicacao.parceiro?.name || "Parceiro",
              parceiroEmail: indicacao.parceiro?.email || "",
              novoStatus: input.status,
            });
          } else {
            // Notificar sobre a mudança de status normal
            await notifyStatusChange({
              nomeIndicado: indicacao.indicacao.nomeIndicado,
              nomeParceiro: indicacao.parceiro?.name || "Parceiro",
              novoStatus: statusLabels[input.status],
            });
          }
        }
        
        return { success: true };
      }),

    /**
     * Atualizar comissão de uma indicação (apenas admin)
     */
    updateComissao: protectedProcedure
      .input(z.object({
        id: z.number(),
        tipoComissao: z.enum(["valor_fixo", "percentual"]),
        valorComissao: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem atualizar comissões",
          });
        }

        const { updateIndicacaoComissao } = await import("./db");
        await updateIndicacaoComissao(input.id, input.tipoComissao, input.valorComissao);
        return { success: true };
      }),

    /**
     * Listar vendas fechadas com comissões (apenas admin)
     */
    getComissoes: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem visualizar comissões",
        });
      }

      const allIndicacoes = await getAllIndicacoes();
      return allIndicacoes.filter(i => i.indicacao.status === "venda_fechada");
    }),

    /**
     * Buscar dados do indicador logado
     */
    meuIndicador: protectedProcedure.query(async ({ ctx }) => {
      const { getUserById } = await import("./db");
      const user = await getUserById(ctx.user.id);
      
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Buscar estatísticas básicas
      const minhasIndicacoes = await getIndicacoesByParceiro(ctx.user.id);
      const totalIndicacoes = minhasIndicacoes.length;
      const vendasFechadas = minhasIndicacoes.filter(i => i.status === "venda_fechada").length;
      const emNegociacao = minhasIndicacoes.filter(i => i.status === "em_negociacao").length;
      
      // Calcular total de comissões ganhas
      const totalComissoes = minhasIndicacoes
        .filter(i => i.status === "venda_fechada" && i.valorComissao)
        .reduce((sum, i) => sum + (i.valorComissao || 0), 0);

      return {
        id: user.id,
        nome: user.name,
        email: user.email,
        chavePix: user.chavePix,
        tipo: user.role === "comercial" ? "comercial" : "promotor",
        codigoIndicacao: `IND${user.id.toString().padStart(6, "0")}`,
        estatisticas: {
          totalIndicacoes,
          vendasFechadas,
          emNegociacao,
          totalComissoes,
          taxaConversao: totalIndicacoes > 0 ? (vendasFechadas / totalIndicacoes) * 100 : 0,
        },
      };
    }),

    /**
     * Buscar indicação por ID (comercial ou admin)
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores e comerciais podem visualizar indicações",
          });
        }

        const allIndicacoes = await getAllIndicacoes();
        const indicacao = allIndicacoes.find(i => i.indicacao.id === input.id);
        
        if (!indicacao) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Indicação não encontrada",
          });
        }

        return indicacao.indicacao;
      }),

    /**
     * Classificar lead como quente ou frio (comercial ou admin)
     */
    classificarLead: protectedProcedure
      .input(z.object({
        id: z.number(),
        classificacao: z.enum(["quente", "frio"]),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores e comerciais podem classificar leads",
          });
        }

        const { classificarLead } = await import("./db");
        await classificarLead(input.id, input.classificacao, input.observacoes);
        
        return { success: true };
      }),

    /**
     * Listar indicações do indicador logado com detalhes
     */
    listarIndicacoes: protectedProcedure.query(async ({ ctx }) => {
      const indicacoes = await getIndicacoesByParceiro(ctx.user.id);
      
      return indicacoes.map(ind => ({
        id: ind.id,
        nomeIndicado: ind.nomeIndicado,
        whatsappIndicado: ind.whatsappIndicado,
        nomePlano: ind.nomePlano,
        tipoPlano: ind.tipoPlano,
        categoria: ind.categoria,
        status: ind.status,
        valorComissao: ind.valorComissao,
        observacoes: ind.observacoes,
        createdAt: ind.createdAt,
        updatedAt: ind.updatedAt,
        dataAtualizacao: ind.updatedAt, // Para compatibilidade com PainelVendedorLayout
      }));
    }),
  }),

  comissaoConfig: router({
    /**
     * Listar configurações de comissão (apenas admin)
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem visualizar configurações",
        });
      }

      const { getComissaoConfigs } = await import("./db");
      return await getComissaoConfigs();
    }),

    /**
     * Atualizar configuração de comissão por tipo de plano (apenas admin)
     */
    update: protectedProcedure
      .input(z.object({
        nomePlano: z.enum(["essencial", "premium"]),
        tipoPlano: z.enum(["familiar", "individual"]),
        categoria: z.enum(["empresarial", "pessoa_fisica"]),
        valorComissao: z.number().min(0, "Valor deve ser positivo"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem atualizar configurações",
          });
        }

        const { upsertComissaoConfig } = await import("./db");
        await upsertComissaoConfig(input.nomePlano, input.tipoPlano, input.categoria, input.valorComissao);
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

  /**
   * Gerenciamento de usuários (apenas admin)
   */
  usuarios: router({
    /**
     * Listar todos os usuários
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem listar usuários",
        });
      }

      const { getAllUsers } = await import("./db");
      return await getAllUsers();
    }),

    /**
     * Criar novo usuário
     */
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("E-mail inválido"),
        chavePix: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem criar usuários",
          });
        }

        const { createVendedor } = await import("./db");
        await createVendedor(input.name, input.email, input.chavePix);
        
        // Enviar e-mail de convite
        try {
          const { sendVendedorInvite } = await import("./email");
          const emailSent = await sendVendedorInvite({ email: input.email, nome: input.name });
          return { success: true, emailSent };
        } catch (error) {
          console.error("[Usuarios] Erro ao enviar e-mail de convite:", error);
          return { success: true, emailSent: false };
        }
      }),

    /**
     * Atualizar informações do usuário
     */
    update: protectedProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        chavePix: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem atualizar usuários",
          });
        }

        const { updateUser } = await import("./db");
        await updateUser(input.userId, input);
        return { success: true };
      }),

    /**
     * Ativar/Desativar usuário
     */
    toggleActive: protectedProcedure
      .input(z.object({
        userId: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem ativar/desativar usuários",
          });
        }

        const { toggleUserActive } = await import("./db");
        await toggleUserActive(input.userId, input.isActive);
        return { success: true };
      }),

    /**
     * Reenviar convite por e-mail
     */
    resendInvite: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem reenviar convites",
          });
        }

        const { getUserById } = await import("./db");
        const user = await getUserById(input.userId);
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        if (!user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não possui e-mail cadastrado",
          });
        }

        try {
          const { sendVendedorInvite } = await import("./email");
          const emailSent = await sendVendedorInvite({ 
            email: user.email, 
            nome: user.name || user.email 
          });
          return { success: true, emailSent };
        } catch (error) {
          console.error("[Usuarios] Erro ao reenviar convite:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao enviar e-mail de convite",
          });
        }
      }),

    /**
     * Atualizar role do usuário
     */
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["promotor", "admin", "comercial"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem alterar roles",
          });
        }

        const { updateUserRole } = await import("./db");
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    /**
     * Excluir usuário
     */
    delete: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem excluir usuários",
          });
        }

        // Verificar se o usuário tem permissão de deletar (canDelete)
        const { getUserById } = await import("./db");
        const currentUser = await getUserById(ctx.user.id);
        
        if (currentUser?.canDelete === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para excluir usuários",
          });
        }

        // Não permitir excluir a si mesmo
        if (input.userId === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Você não pode excluir seu próprio usuário",
          });
        }

        const { deleteUser } = await import("./db");
        await deleteUser(input.userId);
        return { success: true };
      }),
  }),

  /**
   * Router de materiais de divulgação
   */
  materiais: materiaisRouter,
  materiaisDivulgacao: materiaisDivulgacaoRouter,
  
  /**
   * Router de materiais de apoio (banners e vídeos)
   */
  materiaisApoio: materiaisApoioRouter,
});

export type AppRouter = typeof appRouter;
