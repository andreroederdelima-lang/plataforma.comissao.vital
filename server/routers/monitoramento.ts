import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { indicacoes, users } from "../../drizzle/schema";
import { desc, sql, and, gte, lte, eq } from "drizzle-orm";
import { z } from "zod";

export const monitoramentoRouter = router({
  /**
   * Buscar estatísticas gerais do sistema
   */
  estatisticasGerais: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total de vendas e indicações
    const totais = await db
      .select({
        totalVendas: sql<number>`COUNT(CASE WHEN ${indicacoes.tipo} = 'venda' THEN 1 END)`,
        totalIndicacoes: sql<number>`COUNT(CASE WHEN ${indicacoes.tipo} = 'indicacao' THEN 1 END)`,
        totalComissoes: sql<number>`SUM(CASE WHEN ${indicacoes.dataAprovacao} IS NOT NULL THEN ${indicacoes.valorComissao} ELSE 0 END)`,
        totalPendentes: sql<number>`COUNT(CASE WHEN ${indicacoes.status} = 'pendente' THEN 1 END)`,
      })
      .from(indicacoes);

    // Total de vendedores ativos (que têm pelo menos uma indicação/venda)
    const vendedoresAtivos = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${indicacoes.parceiroId})`,
      })
      .from(indicacoes);

    return {
      totalVendas: Number(totais[0]?.totalVendas || 0),
      totalIndicacoes: Number(totais[0]?.totalIndicacoes || 0),
      totalComissoes: Number(totais[0]?.totalComissoes || 0),
      totalPendentes: Number(totais[0]?.totalPendentes || 0),
      vendedoresAtivos: Number(vendedoresAtivos[0]?.count || 0),
    };
  }),

  /**
   * Buscar atividades recentes (últimas vendas/indicações cadastradas)
   */
  atividadesRecentes: adminProcedure
    .input(
      z.object({
        limite: z.number().default(20),
        tipo: z.enum(["todos", "venda", "indicacao"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: indicacoes.id,
          tipo: indicacoes.tipo,
          nomeCliente: indicacoes.nomeIndicado,
          nomePlano: indicacoes.nomePlano,
          tipoPlano: indicacoes.tipoPlano,
          status: indicacoes.status,
          createdAt: indicacoes.createdAt,
          vendedorId: indicacoes.parceiroId,
          vendedorNome: users.name,
          comissaoVendedor: indicacoes.valorComissao,
        })
        .from(indicacoes)
        .leftJoin(users, eq(indicacoes.parceiroId, users.id))
        .orderBy(desc(indicacoes.createdAt))
        .limit(input.limite);

      if (input.tipo && input.tipo !== "todos") {
        query = query.where(eq(indicacoes.tipo, input.tipo)) as typeof query;
      }

      const atividades = await query;

      return atividades.map((a) => ({
        ...a,
        vendedorNome: a.vendedorNome || "Vendedor Desconhecido",
      }));
    }),

  /**
   * Buscar ranking de vendedores (mais ativos)
   */
  rankingVendedores: adminProcedure
    .input(
      z.object({
        periodo: z.enum(["hoje", "semana", "mes", "todos"]).default("mes"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calcular data de início baseado no período
      let dataInicio: Date | null = null;
      const hoje = new Date();
      
      if (input.periodo === "hoje") {
        dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
      } else if (input.periodo === "semana") {
        dataInicio = new Date(hoje.setDate(hoje.getDate() - 7));
      } else if (input.periodo === "mes") {
        dataInicio = new Date(hoje.setMonth(hoje.getMonth() - 1));
      }

      let query = db
        .select({
          vendedorId: indicacoes.parceiroId,
          vendedorNome: users.name,
          totalVendas: sql<number>`COUNT(CASE WHEN ${indicacoes.tipo} = 'venda' THEN 1 END)`,
          totalIndicacoes: sql<number>`COUNT(CASE WHEN ${indicacoes.tipo} = 'indicacao' THEN 1 END)`,
          totalComissoes: sql<number>`SUM(CASE WHEN ${indicacoes.dataAprovacao} IS NOT NULL THEN ${indicacoes.valorComissao} ELSE 0 END)`,
        })
        .from(indicacoes)
        .leftJoin(users, eq(indicacoes.parceiroId, users.id))
        .groupBy(indicacoes.parceiroId, users.name)
        .orderBy(desc(sql<number>`COUNT(*)`));

      if (dataInicio) {
        query = query.where(gte(indicacoes.createdAt, dataInicio)) as typeof query;
      }

      const ranking = await query;

      return ranking.map((r, index) => ({
        posicao: index + 1,
        vendedorId: r.vendedorId,
        vendedorNome: r.vendedorNome || "Vendedor Desconhecido",
        totalVendas: Number(r.totalVendas || 0),
        totalIndicacoes: Number(r.totalIndicacoes || 0),
        totalComissoes: Number(r.totalComissoes || 0),
        total: Number(r.totalVendas || 0) + Number(r.totalIndicacoes || 0),
      }));
    }),
});
