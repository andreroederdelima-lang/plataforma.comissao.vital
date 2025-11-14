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
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de indicações de planos de saúde
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
  /** Categoria: Empresarial ou Pessoa Física */
  categoria: mysqlEnum("categoria", ["empresarial", "pessoa_fisica"]).notNull(),
  /** Observações adicionais sobre a indicação */
  observacoes: text("observacoes"),
  /** Status da indicação para controle de comissionamento */
  status: mysqlEnum("status", ["pendente", "em_analise", "aprovada", "recusada"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Indicacao = typeof indicacoes.$inferSelect;
export type InsertIndicacao = typeof indicacoes.$inferInsert;
