import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "vendedor", "comercial"]).default("user").notNull(),
  /** Permissão para deletar indicações (true para admin completo, false para admin comercial) */
  canDelete: int("canDelete").default(1).notNull(),
  /** Status do usuário (1 = ativo, 0 = desativado) */
  isActive: int("isActive").default(1).notNull(),
  /** Chave PIX do parceiro para recebimento de comissões */
  chavePix: varchar("chavePix", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** Timestamp da última mudança de role (para invalidar sessões antigas) */
  lastRoleChange: timestamp("lastRoleChange").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de indicações de planos de assinatura
 * Armazena todas as indicações feitas pelos parceiros
 */
export const indicacoes = mysqlTable("indicacoes", {
  id: int("id").autoincrement().primaryKey(),
  /** ID do parceiro que fez a indicação (referência ao usuário) */
  parceiroId: int("parceiroId").notNull(),
  /** Nome completo da pessoa indicada */
  nomeIndicado: varchar("nomeIndicado", { length: 255 }).notNull(),
  /** WhatsApp da pessoa indicada */
  whatsappIndicado: varchar("whatsappIndicado", { length: 20 }).notNull(),
  /** Tipo de plano: Familiar ou Individual */
  tipoPlano: mysqlEnum("tipoPlano", ["familiar", "individual"]).notNull(),
  /** Nome do plano: Essencial ou Premium */
  nomePlano: mysqlEnum("nomePlano", ["essencial", "premium"]).notNull(),
  /** Categoria: Empresarial ou Pessoa Física */
  categoria: mysqlEnum("categoria", ["empresarial", "pessoa_fisica"]).notNull(),
  /** Observações adicionais sobre a indicação */
  observacoes: text("observacoes"),
  /** Status da indicação para controle de comissionamento */
  status: mysqlEnum("status", ["aguardando_contato", "em_negociacao", "venda_com_objecoes", "venda_fechada", "nao_comprou", "cliente_sem_interesse"]).default("aguardando_contato").notNull(),
  /** Tipo de comissão: valor fixo ou percentual */
  tipoComissao: mysqlEnum("tipoComissao", ["valor_fixo", "percentual"]),
  /** Valor da comissão (em centavos se valor fixo, ou percentual se percentual) */
  valorComissao: int("valorComissao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Indicacao = typeof indicacoes.$inferSelect;
export type InsertIndicacao = typeof indicacoes.$inferInsert;

/**
 * Tabela de notificações para os usuários
 * Armazena notificações in-app sobre mudanças de status e eventos
 */
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  /** ID do usuário que receberá a notificação */
  userId: int("userId").notNull(),
  /** Título da notificação */
  titulo: varchar("titulo", { length: 255 }).notNull(),
  /** Mensagem da notificação */
  mensagem: text("mensagem").notNull(),
  /** Tipo de notificação */
  tipo: mysqlEnum("tipo", ["nova_indicacao", "status_alterado", "sistema"]).notNull(),
  /** ID da indicação relacionada (opcional) */
  indicacaoId: int("indicacaoId"),
  /** Se a notificação foi lida */
  lida: int("lida").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

/**
 * Tabela de configuração de comissões por tipo de plano
 * Armazena os valores de comissão para cada combinação de plano + tipo + categoria
 * Exemplos: Essencial Individual Pessoa Física, Premium Familiar Empresarial, etc.
 */
export const comissaoConfig = mysqlTable("comissaoConfig", {
  id: int("id").autoincrement().primaryKey(),
  /** Nome do plano: Essencial ou Premium */
  nomePlano: mysqlEnum("nomePlano", ["essencial", "premium"]).notNull(),
  /** Tipo de plano: Familiar ou Individual */
  tipoPlano: mysqlEnum("tipoPlano", ["familiar", "individual"]).notNull(),
  /** Categoria: Empresarial ou Pessoa Física */
  categoria: mysqlEnum("categoria", ["empresarial", "pessoa_fisica"]).notNull(),
  /** Valor da comissão em centavos (R$ 100,00 = 10000) */
  valorComissao: int("valorComissao").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComissaoConfig = typeof comissaoConfig.$inferSelect;
export type InsertComissaoConfig = typeof comissaoConfig.$inferInsert;

/**
 * Tabela de materiais de divulgação
 * Armazena banners, flyers, logos, PDFs e imagens para divulgação
 */
export const materiais = mysqlTable("materiais", {
  id: int("id").autoincrement().primaryKey(),
  /** Título do material */
  titulo: varchar("titulo", { length: 255 }).notNull(),
  /** Descrição do material */
  descricao: text("descricao"),
  /** Tipo do material: banner, flyer, logo, pdf, imagem */
  tipo: mysqlEnum("tipo", ["banner", "flyer", "logo", "pdf", "imagem"]).notNull(),
  /** URL do arquivo no S3 */
  url: varchar("url", { length: 500 }).notNull(),
  /** Categoria do material (opcional) */
  categoria: varchar("categoria", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Material = typeof materiais.$inferSelect;
export type InsertMaterial = typeof materiais.$inferInsert;
