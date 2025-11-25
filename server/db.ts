import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { indicacoes, InsertIndicacao, InsertNotificacao, InsertUser, notificacoes, users, comissaoConfig, InsertComissaoConfig, materiais, InsertMaterial } from "../drizzle/schema";
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

export async function updateUserRole(userId: number, role: "user" | "admin" | "vendedor" | "comercial") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user role: database not available");
    return;
  }

  await db.update(users)
    .set({ 
      role, 
      lastRoleChange: new Date() // Atualiza timestamp para invalidar sessões antigas
    })
    .where(eq(users.id, userId));
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

/**
 * Atualizar comissão de uma indicação
 */
export async function updateIndicacaoComissao(id: number, tipoComissao: "valor_fixo" | "percentual", valorComissao: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(indicacoes)
    .set({ tipoComissao, valorComissao })
    .where(eq(indicacoes.id, id));
}

/**
 * Calcular comissões por parceiro
 */
export async function getComissoesPorParceiro() {
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
        chavePix: users.chavePix,
      },
    })
    .from(indicacoes)
    .leftJoin(users, eq(indicacoes.parceiroId, users.id))
    .where(eq(indicacoes.status, "venda_fechada"));

  return result;
}

/**
 * Atualizar chave PIX do usuário
 */
export async function updateChavePix(userId: number, chavePix: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ chavePix })
    .where(eq(users.id, userId));
}

/**
 * Listar configurações de comissão
 */
export async function getComissaoConfigs() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(comissaoConfig);
  return result;
}

/**
 * Criar ou atualizar configuração de comissão por tipo de plano
 */
export async function upsertComissaoConfig(
  nomePlano: "essencial" | "premium",
  tipoPlano: "familiar" | "individual",
  categoria: "empresarial" | "pessoa_fisica",
  valorComissao: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Buscar se já existe uma configuração com essa combinação
  const existing = await db.select()
    .from(comissaoConfig)
    .where(
      and(
        eq(comissaoConfig.nomePlano, nomePlano),
        eq(comissaoConfig.tipoPlano, tipoPlano),
        eq(comissaoConfig.categoria, categoria)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Atualizar existente
    await db.update(comissaoConfig)
      .set({ valorComissao, updatedAt: new Date() })
      .where(eq(comissaoConfig.id, existing[0].id));
  } else {
    // Inserir novo
    await db.insert(comissaoConfig)
      .values({ nomePlano, tipoPlano, categoria, valorComissao });
  }
}

/**
 * Obter valor de comissão por combinação de plano + tipo + categoria
 */
export async function getComissaoByTipoPlano(
  nomePlano: "essencial" | "premium",
  tipoPlano: "familiar" | "individual",
  categoria: "empresarial" | "pessoa_fisica"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(comissaoConfig)
    .where(
      and(
        eq(comissaoConfig.nomePlano, nomePlano),
        eq(comissaoConfig.tipoPlano, tipoPlano),
        eq(comissaoConfig.categoria, categoria)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Listar todos os usuários (para admin)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt));
}

/**
 * Criar novo vendedor
 */
export async function createVendedor(name: string, email: string, chavePix?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Gerar openId temporário baseado no email
  const openId = `vendedor_${email.replace(/[@.]/g, "_")}_${Date.now()}`;

  await db.insert(users).values({
    openId,
    name,
    email,
    role: "vendedor",
    chavePix: chavePix || null,
    loginMethod: "email",
    isActive: 1,
  });
}

/**
 * Atualizar informações do usuário
 */
export async function updateUser(
  userId: number,
  data: { name?: string; email?: string; chavePix?: string }
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.chavePix !== undefined) updateData.chavePix = data.chavePix;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Ativar/Desativar usuário
 */
export async function toggleUserActive(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ isActive: isActive ? 1 : 0, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Buscar usuário por ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Excluir usuário
 */
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(users)
    .where(eq(users.id, userId));
}

/**
 * ========================================
 * MATERIAIS DE DIVULGAÇÃO
 * ========================================
 */

/**
 * Listar todos os materiais
 */
export async function getAllMateriais() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(materiais)
    .orderBy(desc(materiais.createdAt));
}

/**
 * Criar novo material
 */
export async function createMaterial(data: InsertMaterial) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(materiais).values(data);
}

/**
 * Atualizar material existente
 */
export async function updateMaterial(
  materialId: number,
  data: Partial<InsertMaterial>
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(materiais)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(materiais.id, materialId));
}

/**
 * Excluir material
 */
export async function deleteMaterial(materialId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .delete(materiais)
    .where(eq(materiais.id, materialId));
}
