import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { indicacoes, users } from "../../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const relatoriosRouter = router({
  /**
   * Gerar relatório de comissões por vendedor/indicador em período
   */
  gerarRelatorioComissoes: protectedProcedure
    .input(z.object({
      vendedorId: z.number(),
      dataInicio: z.string(), // formato: YYYY-MM-DD
      dataFim: z.string(), // formato: YYYY-MM-DD
    }))
    .query(async ({ ctx, input }) => {
      // Apenas admin e comercial podem gerar relatórios
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores e comerciais podem gerar relatórios",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar dados do vendedor/indicador
      const vendedor = await db
        .select()
        .from(users)
        .where(eq(users.id, input.vendedorId))
        .limit(1);

      if (vendedor.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vendedor não encontrado",
        });
      }

      // Buscar indicações/vendas aprovadas no período
      const comissoes = await db
        .select({
          id: indicacoes.id,
          tipo: indicacoes.tipo,
          nomeCliente: indicacoes.nomeIndicado,
          cpfCliente: indicacoes.cpfCliente,
          nomePlano: indicacoes.nomePlano,
          tipoPlano: indicacoes.tipoPlano,
          categoria: indicacoes.categoria,
          valorComissao: indicacoes.valorComissao,
          valorPlanoManual: indicacoes.valorPlanoManual,
          vendedorSecundarioId: indicacoes.vendedorSecundarioId,
          dataVenda: indicacoes.dataVenda,
          dataAprovacao: indicacoes.dataAprovacao,
          createdAt: indicacoes.createdAt,
        })
        .from(indicacoes)
        .where(
          and(
            eq(indicacoes.parceiroId, input.vendedorId),
            sql`${indicacoes.dataAprovacao} IS NOT NULL`, // Apenas comissões aprovadas
            gte(indicacoes.dataAprovacao, new Date(input.dataInicio)),
            lte(indicacoes.dataAprovacao, new Date(input.dataFim + "T23:59:59"))
          )
        );

      // Calcular total (considerando divisão com segundo vendedor)
      const totalComissaoVendedor = comissoes.reduce((acc, c) => {
        const temSegundoVendedor = !!c.vendedorSecundarioId;
        const valorVendedor = temSegundoVendedor 
          ? Math.round((c.valorComissao || 0) / 2)
          : (c.valorComissao || 0);
        return acc + valorVendedor;
      }, 0);

      return {
        vendedor: {
          id: vendedor[0].id,
          nome: vendedor[0].name || "Sem nome",
          cpf: vendedor[0].cpf || "Não informado",
          chavePix: vendedor[0].chavePix || "Não informado",
          email: vendedor[0].email || "Não informado",
        },
        periodo: {
          inicio: input.dataInicio,
          fim: input.dataFim,
        },
        comissoes: comissoes.map(c => {
          const temSegundoVendedor = !!c.vendedorSecundarioId;
          const valorComissaoVendedor = temSegundoVendedor 
            ? Math.round((c.valorComissao || 0) / 2)
            : (c.valorComissao || 0);
          
          return {
            id: c.id,
            tipo: c.tipo === "venda" ? "Venda Direta" : "Indicação",
            nomeCliente: c.nomeCliente,
            cpfCliente: c.cpfCliente || "Não informado",
            plano: `${c.nomePlano} - ${c.tipoPlano} - ${c.categoria}`,
            valorComissaoTotal: c.valorComissao || 0,
            valorComissaoVendedor,
            temSegundoVendedor,
            vendedorSecundarioId: c.vendedorSecundarioId,
            valorPlanoManual: c.valorPlanoManual,
            data: c.dataVenda || c.createdAt,
          };
        }),
        totalComissaoVendedor,
        totalComissaoFormatado: (totalComissaoVendedor / 100).toFixed(2),
      };
    }),

  /**
   * Listar vendedores com comissões aprovadas para seleção
   */
  listarVendedoresComComissoes: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.role !== "comercial") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores e comerciais podem acessar",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar vendedores que têm comissões aprovadas
      const vendedores = await db
        .select({
          id: users.id,
          nome: users.name,
          email: users.email,
          totalComissoes: sql<number>`COUNT(DISTINCT ${indicacoes.id})`,
        })
        .from(users)
        .leftJoin(indicacoes, eq(users.id, indicacoes.parceiroId))
        .where(sql`${indicacoes.dataAprovacao} IS NOT NULL`) // Apenas comissões aprovadas
        .groupBy(users.id);

      return vendedores;
    }),
});
