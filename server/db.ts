import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { indicacoes, InsertIndicacao, InsertNotificacao, InsertUser, notificacoes, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Criar uma nova indicação
 */
export async function createIndicacao(data: InsertIndicacao) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(indicacoes).values(data);
  return result;
}

/**
 * Listar todas as indicações (para admin)
 */
export async function getAllIndicacoes() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select({
      indicacao: indicacoes,
      parceiro: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(indicacoes)
    .leftJoin(users, eq(indicacoes.parceiroId, users.id))
    .orderBy(desc(indicacoes.createdAt));

  return result;
}

/**
 * Listar indicações de um parceiro específico
 */
export async function getIndicacoesByParceiro(parceiroId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(indicacoes)
    .where(eq(indicacoes.parceiroId, parceiroId))
    .orderBy(desc(indicacoes.createdAt));

  return result;
}

/**
 * Atualizar status de uma indicação (para admin)
 */
export async function updateIndicacaoStatus(id: number, status: "aguardando_contato" | "em_negociacao" | "venda_com_objecoes" | "venda_fechada" | "nao_comprou" | "cliente_sem_interesse") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(indicacoes)
    .set({ status, updatedAt: new Date() })
    .where(eq(indicacoes.id, id));

  return result;
}

/**
 * Criar uma nova notificação
 */
export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(notificacoes).values(data);
  return result;
}

/**
 * Listar notificações de um usuário
 */
export async function getNotificacoesByUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.userId, userId))
    .orderBy(desc(notificacoes.createdAt));

  return result;
}

/**
 * Contar notificações não lidas de um usuário
 */
export async function countUnreadNotificacoes(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(notificacoes)
    .where(and(eq(notificacoes.userId, userId), eq(notificacoes.lida, 0)));

  return result.length;
}

/**
 * Marcar notificação como lida
 */
export async function markNotificacaoAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(notificacoes)
    .set({ lida: 1 })
    .where(and(eq(notificacoes.id, id), eq(notificacoes.userId, userId)));

  return result;
}

/**
 * Marcar todas as notificações como lidas
 */
export async function markAllNotificacoesAsRead(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .update(notificacoes)
    .set({ lida: 1 })
    .where(eq(notificacoes.userId, userId));

  return result;
}
