import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Target,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminMonitoramento() {
  const [periodoRanking, setPeriodoRanking] = useState<
    "hoje" | "semana" | "mes" | "todos"
  >("mes");
  const [tipoAtividade, setTipoAtividade] = useState<
    "todos" | "venda" | "indicacao"
  >("todos");

  // Queries
  const { data: estatisticas, refetch: refetchEstatisticas } =
    trpc.monitoramento.estatisticasGerais.useQuery();
  const { data: atividades, refetch: refetchAtividades } =
    trpc.monitoramento.atividadesRecentes.useQuery({
      limite: 20,
      tipo: tipoAtividade,
    });
  const { data: ranking, refetch: refetchRanking } =
    trpc.monitoramento.rankingVendedores.useQuery({
      periodo: periodoRanking,
    });

  const refetchAll = () => {
    refetchEstatisticas();
    refetchAtividades();
    refetchRanking();
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const getBadgeVariant = (tipo: string) => {
    return tipo === "venda" ? "default" : "secondary";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      aguardando_contato: { label: "Aguardando Contato", variant: "secondary" },
      em_negociacao: { label: "Em Negociação", variant: "default" },
      venda_com_objecoes: { label: "Venda com Objeções", variant: "outline" },
      venda_fechada: { label: "Venda Fechada", variant: "default" },
      nao_comprou: { label: "Não Comprou", variant: "destructive" },
      cliente_sem_interesse: { label: "Sem Interesse", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">
            📊 Monitoramento em Tempo Real
          </h1>
          <p className="text-gray-600 mt-1">
            Acompanhe todas as atividades e movimentações do sistema
          </p>
        </div>
        <Button onClick={refetchAll} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendas</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas?.totalVendas || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Vendas diretas fechadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas?.totalIndicacoes || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Indicações cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estatisticas?.vendedoresAtivos || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Com atividade registrada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões Aprovadas</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {formatCurrency(estatisticas?.totalComissoes)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total a pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {estatisticas?.totalPendentes || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Aguardando contato</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline de Atividades Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Atividades Recentes
              </CardTitle>
              <Select
                value={tipoAtividade}
                onValueChange={(value: "todos" | "venda" | "indicacao") =>
                  setTipoAtividade(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="venda">Vendas</SelectItem>
                  <SelectItem value="indicacao">Indicações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {atividades && atividades.length > 0 ? (
                atividades.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(atividade.tipo || "indicacao")}>
                          {atividade.tipo === "venda" ? "🎯 Venda" : "📝 Indicação"}
                        </Badge>
                        {getStatusBadge(atividade.status || "aguardando_contato")}
                      </div>
                      <p className="font-medium text-gray-900">
                        {atividade.nomeCliente}
                      </p>
                      <p className="text-sm text-gray-600">
                        {atividade.nomePlano} - {atividade.tipoPlano}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Vendedor: <span className="font-medium">{atividade.vendedorNome}</span>
                      </p>
                      {atividade.comissaoVendedor && (
                        <p className="text-xs text-teal-600 font-medium mt-1">
                          Comissão: {formatCurrency(atividade.comissaoVendedor)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {atividade.createdAt
                          ? format(new Date(atividade.createdAt), "dd/MM/yyyy", {
                              locale: ptBR,
                            })
                          : "-"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {atividade.createdAt
                          ? format(new Date(atividade.createdAt), "HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma atividade registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ranking de Vendedores */}
        <Card>
          <CardHeader>
            <div className="space-y-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Ranking de Vendedores
              </CardTitle>
              <Select
                value={periodoRanking}
                onValueChange={(value: "hoje" | "semana" | "mes" | "todos") =>
                  setPeriodoRanking(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Última Semana</SelectItem>
                  <SelectItem value="mes">Último Mês</SelectItem>
                  <SelectItem value="todos">Todos os Tempos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {ranking && ranking.length > 0 ? (
                ranking.map((vendedor) => (
                  <div
                    key={vendedor.vendedorId}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                      {vendedor.posicao}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {vendedor.vendedorNome}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <span className="text-green-600 font-medium">
                          {vendedor.totalVendas} vendas
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600 font-medium">
                          {vendedor.totalIndicacoes} indicações
                        </span>
                      </div>
                      <p className="text-xs text-teal-600 font-medium mt-1">
                        {formatCurrency(vendedor.totalComissoes)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhum vendedor ativo no período
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
