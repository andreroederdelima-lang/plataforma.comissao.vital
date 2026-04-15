import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { indicacoes, InsertIndicacao, InsertNotificacao, InsertUser, notificacoes, users, comissaoConfig, InsertComissaoConfig, materiais, InsertMaterial, planosSaude, configuracaoComissoes, materiaisDivulgacao, materiaisDiversos, materiaisPromotores, configuracoesGerais, materiaisApoio, InsertMaterialApoio } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

export async function updateUserRole(userId: number, role: "promotor" | "admin" | "comercial") {
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
 * Verificar se CPF já existe no banco de dados
 */
export async function verificarCpfDuplicado(cpf: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(indicacoes)
    .where(eq(indicacoes.cpfCliente, cpf))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Criar uma nova indicação
 */
export async function createIndicacao(data: InsertIndicacao) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Validar CPF duplicado se fornecido
  if (data.cpfCliente) {
    const existente = await verificarCpfDuplicado(data.cpfCliente);
    if (existente) {
      throw new Error(`CPF ${data.cpfCliente} já cadastrado no sistema (ID: ${existente.id}, Cliente: ${existente.nomeIndicado})`);
    }
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
 * Criar ou atualizar configuração de comissão com valor base e percentual
 */
export async function upsertComissaoConfigWithBase(
  nomePlano: "essencial" | "premium",
  tipoPlano: "familiar" | "individual",
  categoria: "empresarial" | "pessoa_fisica",
  valorBase?: number,
  percentualComissao?: number,
  valorComissao?: number
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

  // Preparar objeto de atualização
  const updateData: any = { updatedAt: new Date() };
  
  if (valorBase !== undefined) {
    updateData.valorBase = valorBase;
  }
  if (percentualComissao !== undefined) {
    updateData.percentualComissao = percentualComissao;
  }
  if (valorComissao !== undefined) {
    updateData.valorComissao = valorComissao;
  }
  
  // Se tem valorBase e percentual, calcular valorComissao automaticamente
  if (valorBase !== undefined && percentualComissao !== undefined) {
    updateData.valorComissao = Math.round((valorBase * percentualComissao) / 100);
  }

  if (existing.length > 0) {
    // Atualizar existente
    await db.update(comissaoConfig)
      .set(updateData)
      .where(eq(comissaoConfig.id, existing[0].id));
  } else {
    // Inserir novo
    const insertData: any = { nomePlano, tipoPlano, categoria };
    if (valorBase !== undefined) insertData.valorBase = valorBase;
    if (percentualComissao !== undefined) insertData.percentualComissao = percentualComissao;
    if (valorComissao !== undefined) insertData.valorComissao = valorComissao;
    
    // Calcular valorComissao se tiver base e percentual
    if (valorBase !== undefined && percentualComissao !== undefined) {
      insertData.valorComissao = Math.round((valorBase * percentualComissao) / 100);
    }
    
    await db.insert(comissaoConfig).values(insertData);
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
 * Criar novo usuário (promotor ou comercial)
 */
export async function createVendedor(name: string, email: string, chavePix?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Gerar openId temporário baseado no email
  const openId = `user_${email.replace(/[@.]/g, "_")}_${Date.now()}`;

  await db.insert(users).values({
    openId,
    name,
    email,
    role: "promotor",
    chavePix: chavePix || null,
    loginMethod: "email",
    isActive: 1,
  });
}

/**
 * Criar novo usuário com senha (promotor ou comercial)
 */
export async function createVendedorWithPassword(
  name: string,
  email: string,
  passwordHash: string,
  chavePix?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Gerar openId temporário baseado no email
  const openId = `user_${email.replace(/[@.]/g, "_")}_${Date.now()}`;

  await db.insert(users).values({
    openId,
    name,
    email,
    role: "promotor",
    chavePix: chavePix || null,
    passwordHash,
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

/**
 * Classificar lead como quente ou frio e calcular comissão automaticamente
 */
export async function classificarLead(
  indicacaoId: number,
  classificacao: "quente" | "frio",
  observacoesVendedor?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Buscar indicação atual
  const indicacaoAtual = await db
    .select()
    .from(indicacoes)
    .where(eq(indicacoes.id, indicacaoId))
    .limit(1);

  if (indicacaoAtual.length === 0) {
    throw new Error("Indicação não encontrada");
  }

  const indicacao = indicacaoAtual[0];

  // Buscar plano correspondente
  const plano = await db
    .select()
    .from(planosSaude)
    .where(
      eq(planosSaude.tipo, indicacao.nomePlano)
    )
    .limit(1);

  if (plano.length === 0) {
    throw new Error("Plano não encontrado");
  }

  // Buscar configuração de comissão
  const config = await db
    .select()
    .from(configuracaoComissoes)
    .where(eq(configuracaoComissoes.tipoLead, classificacao))
    .limit(1);

  if (config.length === 0) {
    throw new Error("Configuração de comissão não encontrada");
  }

  // Calcular comissão baseado no tipo
  const bonificacaoTotal = plano[0].bonificacaoPadrao; // em centavos
  let valorComissao: number;
  
  // Se for VENDA DIRETA, vendedor recebe 100% da comissão
  if (indicacao.tipo === "venda") {
    valorComissao = bonificacaoTotal; // 100% para o vendedor
  } else {
    // Se for INDICAÇÃO, dividir conforme Lead Quente/Frio
    const percentualIndicador = config[0].percentualIndicador; // ex: 70 para 70%
    valorComissao = Math.round((bonificacaoTotal * percentualIndicador) / 100);
  }

  const updateData: any = {
    classificacaoLead: classificacao,
    dataClassificacao: new Date(),
    tipoComissao: "valor_fixo" as const,
    valorComissao: valorComissao,
  };

  // Se houver observações do comercial, adicionar às observações existentes
  if (observacoesVendedor) {
    const obsAntigas = indicacao.observacoes || "";
    const obsNovas = obsAntigas
      ? `${obsAntigas}\n\n[Comercial]: ${observacoesVendedor}`
      : `[Comercial]: ${observacoesVendedor}`;
    updateData.observacoes = obsNovas;
  }

  await db
    .update(indicacoes)
    .set(updateData)
    .where(eq(indicacoes.id, indicacaoId));
}

/**
 * Validar venda direta (confirma 100% comissão para vendedor)
 */
export async function validarVenda(indicacaoId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Buscar indicação atual
  const indicacaoAtual = await db
    .select()
    .from(indicacoes)
    .where(eq(indicacoes.id, indicacaoId))
    .limit(1);

  if (indicacaoAtual.length === 0) {
    throw new Error("Indicação não encontrada");
  }

  const indicacao = indicacaoAtual[0];

  if (indicacao.tipo !== "venda") {
    throw new Error("Apenas vendas diretas podem ser validadas");
  }

  // Buscar plano correspondente
  const plano = await db
    .select()
    .from(planosSaude)
    .where(eq(planosSaude.tipo, indicacao.nomePlano))
    .limit(1);

  if (plano.length === 0) {
    throw new Error("Plano não encontrado");
  }

  // Calcular 100% da comissão para vendedor
  const valorComissao = plano[0].bonificacaoPadrao; // 100% em centavos

  await db
    .update(indicacoes)
    .set({
      validadoVendedor: 1,
      dataValidacao: new Date(),
      tipoComissao: "valor_fixo" as const,
      valorComissao: valorComissao,
      percentualComissao: 100,
    })
    .where(eq(indicacoes.id, indicacaoId));
}

/**
 * Converter venda direta para indicação (muda tipo e remove validação)
 */
export async function converterParaIndicacao(indicacaoId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Buscar indicação atual
  const indicacaoAtual = await db
    .select()
    .from(indicacoes)
    .where(eq(indicacoes.id, indicacaoId))
    .limit(1);

  if (indicacaoAtual.length === 0) {
    throw new Error("Indicação não encontrada");
  }

  const indicacao = indicacaoAtual[0];

  if (indicacao.tipo !== "venda") {
    throw new Error("Apenas vendas diretas podem ser convertidas");
  }

  // Converter para indicação e resetar validação
  await db
    .update(indicacoes)
    .set({
      tipo: "indicacao" as const,
      validadoVendedor: 0,
      dataValidacao: null,
      tipoComissao: null,
      valorComissao: null,
      percentualComissao: null,
      classificacaoLead: null,
      dataClassificacao: null,
    })
    .where(eq(indicacoes.id, indicacaoId));
}


// ==================== MATERIAIS DE DIVULGAÇÃO ====================

export async function getMateriais() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(materiaisDivulgacao).limit(1);
  return result[0] || { id: 0, centralArgumentos: "", promocaoVigente: "", updatedAt: new Date() };
}

export async function updateCentralArgumentos(conteudo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se existe registro
  const existing = await db.select().from(materiaisDivulgacao).limit(1);
  
  if (existing.length === 0) {
    await db.insert(materiaisDivulgacao).values({
      centralArgumentos: conteudo,
      promocaoVigente: "",
    });
  } else {
    await db
      .update(materiaisDivulgacao)
      .set({ centralArgumentos: conteudo })
      .where(eq(materiaisDivulgacao.id, existing[0].id));
  }
}

export async function updatePromocaoVigente(conteudo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se existe registro
  const existing = await db.select().from(materiaisDivulgacao).limit(1);
  
  if (existing.length === 0) {
    await db.insert(materiaisDivulgacao).values({
      centralArgumentos: "",
      promocaoVigente: conteudo,
    });
  } else {
    await db
      .update(materiaisDivulgacao)
      .set({ promocaoVigente: conteudo })
      .where(eq(materiaisDivulgacao.id, existing[0].id));
  }
}

export async function listMateriaisDiversos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(materiaisDiversos)
    .orderBy(materiaisDiversos.ordem, materiaisDiversos.createdAt);
}

export async function createMaterialDiverso(data: {
  titulo: string;
  descricao?: string;
  tipo: string;
  conteudo: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(materiaisDiversos).values(data);
}

export async function updateMaterialDiverso(data: {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: string;
  conteudo: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(materiaisDiversos)
    .set({
      titulo: data.titulo,
      descricao: data.descricao,
      tipo: data.tipo,
      conteudo: data.conteudo,
    })
    .where(eq(materiaisDiversos.id, data.id));
}

export async function deleteMaterialDiverso(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(materiaisDiversos).where(eq(materiaisDiversos.id, id));
}

export async function listMeusMateriaisPromotores(promotorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(materiaisPromotores)
    .where(eq(materiaisPromotores.promotorId, promotorId))
    .orderBy(materiaisPromotores.createdAt);
}

export async function createMaterialPromotor(data: {
  promotorId: number;
  titulo: string;
  conteudo: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(materiaisPromotores).values(data);
}

export async function updateMaterialPromotor(
  data: {
    id: number;
    titulo: string;
    conteudo: string;
  },
  promotorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o material pertence ao promotor
  const material = await db
    .select()
    .from(materiaisPromotores)
    .where(eq(materiaisPromotores.id, data.id))
    .limit(1);

  if (material.length === 0 || material[0].promotorId !== promotorId) {
    throw new Error("Material não encontrado ou sem permissão");
  }

  await db
    .update(materiaisPromotores)
    .set({
      titulo: data.titulo,
      conteudo: data.conteudo,
    })
    .where(eq(materiaisPromotores.id, data.id));
}

export async function deleteMaterialPromotor(id: number, promotorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o material pertence ao promotor
  const material = await db
    .select()
    .from(materiaisPromotores)
    .where(eq(materiaisPromotores.id, id))
    .limit(1);

  if (material.length === 0 || material[0].promotorId !== promotorId) {
    throw new Error("Material não encontrado ou sem permissão");
  }

  await db.delete(materiaisPromotores).where(eq(materiaisPromotores.id, id));
}


// ============================================================================
// Configurações Gerais
// ============================================================================

/**
 * Obter configurações gerais do sistema
 * Cria registro padrão se não existir
 */
export async function getConfiguracoesGerais() {
  const db = await getDb();
  if (!db) return null;

  const configs = await db.select().from(configuracoesGerais).limit(1);
  
  if (configs.length === 0) {
    // Criar configuração padrão
    await db.insert(configuracoesGerais).values({
      linkCheckoutBase: null,
      diasCancelamentoGratuito: 7,
      valorPlanoEssencial: "0.00",
      valorPlanoVital: "0.00",
      valorPlanoPremium: "0.00",
      valorPlanoEmpresarial: "0.00",
      whatsappNumero: null,
      whatsappMensagem: null,
    });
    return {
      id: 1,
      linkCheckoutBase: null,
      diasCancelamentoGratuito: 7,
      valorPlanoEssencial: "0.00",
      valorPlanoVital: "0.00",
      valorPlanoPremium: "0.00",
      valorPlanoEmpresarial: "0.00",
      whatsappNumero: null,
      whatsappMensagem: null,
      updatedAt: new Date(),
    };
  }
  
  return configs[0];
}

/**
 * Atualizar link base de checkout
 */
export async function atualizarLinkCheckoutBase(linkBase: string | null) {
  const db = await getDb();
  if (!db) return false;

  const config = await getConfiguracoesGerais();
  if (!config) return false;

  await db.update(configuracoesGerais)
    .set({ linkCheckoutBase: linkBase })
    .where(eq(configuracoesGerais.id, config.id));
  
  return true;
}

/**
 * Atualizar dias de cancelamento gratuito
 */
export async function atualizarDiasCancelamento(dias: number) {
  const db = await getDb();
  if (!db) return false;

  const config = await getConfiguracoesGerais();
  if (!config) return false;

  await db.update(configuracoesGerais)
    .set({ diasCancelamentoGratuito: dias })
    .where(eq(configuracoesGerais.id, config.id));
  
  return true;
}

/**
 * Gerar link de checkout personalizado para um usuário
 * Formato: código único de 8 caracteres alfanuméricos
 */
export async function gerarLinkCheckoutPersonalizado(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar código único
  const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Atualizar usuário com o código
  await db.update(users)
    .set({ linkCheckoutPersonalizado: codigo })
    .where(eq(users.id, userId));
  
  return codigo;
}

/**
 * Obter link completo de checkout de um usuário
 */
export async function getLinkCheckoutCompleto(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return null;

  const config = await getConfiguracoesGerais();
  if (!config || !config.linkCheckoutBase) return null;

  // Se usuário não tem código, gerar um
  let codigo = user[0].linkCheckoutPersonalizado;
  if (!codigo) {
    codigo = await gerarLinkCheckoutPersonalizado(userId);
  }

  // Montar link completo
  const linkBase = config.linkCheckoutBase;
  const separador = linkBase.includes('?') ? '&' : '?';
  return `${linkBase}${separador}ref=${codigo}`;
}


// ==================== MATERIAIS DE APOIO ====================

/**
 * Listar todos os materiais de apoio (banners e vídeos)
 */
export async function listarMateriaisApoio() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(materiaisApoio).orderBy(desc(materiaisApoio.ordem), desc(materiaisApoio.createdAt));
}

/**
 * Adicionar novo material de apoio
 */
export async function adicionarMaterialApoio(material: InsertMaterialApoio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(materiaisApoio).values(material);
  return result;
}

/**
 * Atualizar material de apoio
 */
export async function atualizarMaterialApoio(id: number, data: Partial<InsertMaterialApoio>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(materiaisApoio).set(data).where(eq(materiaisApoio.id, id));
}

/**
 * Deletar material de apoio
 */
export async function deletarMaterialApoio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(materiaisApoio).where(eq(materiaisApoio.id, id));
}

/**
 * Obter material de apoio por ID
 */
export async function getMaterialApoioById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(materiaisApoio).where(eq(materiaisApoio.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}


export async function getRankingVendedores(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const { sql, isNotNull } = await import("drizzle-orm");

  // Buscar vendas fechadas (dataVenda não nula)
  const result = await db
    .select({
      parceiroId: indicacoes.parceiroId,
      nome: users.name,
      email: users.email,
      totalVendas: sql<number>`COUNT(*)`.as("totalVendas"),
      totalComissoes: sql<number>`SUM(${indicacoes.valorComissao})`.as("totalComissoes"),
    })
    .from(indicacoes)
    .innerJoin(users, eq(indicacoes.parceiroId, users.id))
    .where(and(
      isNotNull(indicacoes.dataVenda),
      eq(indicacoes.status, "venda_fechada")
    ))
    .groupBy(indicacoes.parceiroId, users.name, users.email)
    .orderBy(sql`totalComissoes DESC`)
    .limit(limit);

  return result.map(r => ({
    ...r,
    totalComissoes: r.totalComissoes || 0,
  }));
}

export async function getRankingIndicadores(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const { sql, isNull } = await import("drizzle-orm");

  // Buscar indicações convertidas (dataVenda nula mas status = venda_fechada)
  const result = await db
    .select({
      parceiroId: indicacoes.parceiroId,
      nome: users.name,
      email: users.email,
      totalIndicacoes: sql<number>`COUNT(*)`.as("totalIndicacoes"),
      totalComissoes: sql<number>`SUM(${indicacoes.valorComissao})`.as("totalComissoes"),
    })
    .from(indicacoes)
    .innerJoin(users, eq(indicacoes.parceiroId, users.id))
    .where(and(
      isNull(indicacoes.dataVenda),
      eq(indicacoes.status, "venda_fechada")
    ))
    .groupBy(indicacoes.parceiroId, users.name, users.email)
    .orderBy(sql`totalComissoes DESC`)
    .limit(limit);

  return result.map(r => ({
    ...r,
    totalComissoes: r.totalComissoes || 0,
  }));
}


// ============================================
// Admin Login & Password Management
// ============================================

/**
 * Cria hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verifica se senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Login de admin com email e senha
 * Retorna usuário se credenciais válidas, null caso contrário
 */
export async function loginAdminWithPassword(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot login: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return null; // Usuário não encontrado
    }

    const user = result[0];

    // Verificar se é admin
    if (user.role !== 'admin') {
      return null; // Não é admin
    }

    // Verificar se está ativo
    if (user.isActive !== 1) {
      return null; // Usuário desativado
    }

    // Verificar senha
    if (!user.passwordHash) {
      return null; // Usuário sem senha cadastrada
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return null; // Senha incorreta
    }

    // Atualizar lastSignedIn
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));

    return user;
  } catch (error) {
    console.error("[Database] Failed to login admin:", error);
    return null;
  }
}

/**
 * Define senha para um usuário admin
 */
export async function setAdminPassword(email: string, password: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set password: database not available");
    return false;
  }

  try {
    const passwordHash = await hashPassword(password);
    
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, email));

    return true;
  } catch (error) {
    console.error("[Database] Failed to set admin password:", error);
    return false;
  }
}

/**
 * Gera token de recuperação de senha (simples, sem tabela separada)
 * Retorna token que expira em 1 hora
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Envia email de recuperação de senha
 * (Implementação simplificada - você pode integrar com serviço de email real)
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  // TODO: Integrar com serviço de email (SendGrid, AWS SES, etc.)
  // Por enquanto, apenas loga o token
  console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
  console.log(`[Password Reset] Link: https://seu-dominio.com/redefinir-senha-admin?token=${resetToken}&email=${email}`);
  
  // Você pode usar o sistema de notificação do Manus para enviar email
  // ou integrar com Resend API que já está configurado
  
  return true;
}
