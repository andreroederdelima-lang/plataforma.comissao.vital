import { useAuth } from "@/_core/hooks/useAuth";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  UserPlus,
  ShoppingCart,
  Award
} from "lucide-react";
import { useLocation } from "wouter";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
  white: "#FFFFFF",
  darkGray: "#333333",
  mediumGray: "#666666",
  lightGray: "#F5F5F5",
};

export default function DashboardPromotor() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Queries
  const { data: minhasIndicacoes = [], isLoading: loadingIndicacoes } = 
    trpc.indicacoes.listarIndicacoes.useQuery();
  
  const { data: configs } = trpc.comissaoConfig.list.useQuery();

  if (loading || loadingIndicacoes) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PainelVendedorLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Calcular estatísticas
  const totalIndicacoes = minhasIndicacoes.length;
  const indicacoesPendentes = minhasIndicacoes.filter((i: any) => i.status === "pendente").length;
  const indicacoesEmAndamento = minhasIndicacoes.filter((i: any) => 
    i.status === "em_contato" || i.status === "aguardando_documentos"
  ).length;
  const vendasFechadas = minhasIndicacoes.filter((i: any) => i.status === "venda_fechada").length;

  // Calcular comissões
  let totalComissoes = 0;
  let comissoesPendentes = 0;
  let comissoesPagas = 0;

  minhasIndicacoes.forEach((indicacao: any) => {
    if (indicacao.status === "venda_fechada") {
      let valorComissao = 0;
      
      if (indicacao.tipoComissao && indicacao.valorComissao) {
        valorComissao = indicacao.valorComissao;
      } else {
        const config = configs?.find(c => 
          c.nomePlano === indicacao.nomePlano &&
          c.tipoPlano === indicacao.tipoPlano &&
          c.categoria === indicacao.categoria
        );
        if (config) {
          valorComissao = config.valorComissao;
        }
      }
      
      totalComissoes += valorComissao;
      
      // Aqui você pode adicionar lógica para diferenciar comissões pagas vs pendentes
      // Por enquanto, todas as vendas fechadas são consideradas pendentes
      comissoesPendentes += valorComissao;
    }
  });

  // Taxa de conversão
  const taxaConversao = totalIndicacoes > 0 
    ? ((vendasFechadas / totalIndicacoes) * 100).toFixed(1)
    : "0.0";

  return (
    <PainelVendedorLayout>
      <div className="container py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard do Promotor</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe suas indicações, vendas e comissões
            </p>
          </div>

          {/* Escolha de Modalidade */}
          <Card className="border-2" style={{ borderColor: VITAL_COLORS.turquoise }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: VITAL_COLORS.turquoise }}>🎯</span>
                Escolha sua Modalidade
              </CardTitle>
              <CardDescription>
                Selecione como deseja trabalhar: apenas indicando contatos ou realizando vendas completas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Modalidade: Indicar */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/indicar")}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full" style={{ backgroundColor: `${VITAL_COLORS.turquoise}20` }}>
                        <UserPlus className="h-6 w-6" style={{ color: VITAL_COLORS.turquoise }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Indicar Contato</CardTitle>
                        <CardDescription className="text-sm">
                          Comissão menor, sem esforço de venda
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você envia o contato e nossa equipe comercial faz todo o trabalho de venda. 
                      Ideal para quem tem uma rede de contatos mas prefere não fazer vendas.
                    </p>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      style={{ borderColor: VITAL_COLORS.turquoise, color: VITAL_COLORS.turquoise }}
                    >
                      Fazer Indicação
                    </Button>
                  </CardContent>
                </Card>

                {/* Modalidade: Vender */}
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2" style={{ borderColor: VITAL_COLORS.turquoise }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full" style={{ backgroundColor: VITAL_COLORS.turquoise }}>
                        <ShoppingCart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Vender Completo</CardTitle>
                        <CardDescription className="text-sm">
                          Comissão maior, você fecha a venda
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você realiza todo o processo de venda e recebe uma comissão significativamente maior. 
                      Ideal para quem tem experiência em vendas e quer maximizar ganhos.
                    </p>
                    <Button 
                      className="w-full" 
                      style={{ backgroundColor: VITAL_COLORS.turquoise }}
                    >
                      Registrar Venda
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Indicações */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Indicações</p>
                    <p className="text-3xl font-bold text-gray-900">{totalIndicacoes}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendas Fechadas */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas Fechadas</p>
                    <p className="text-3xl font-bold text-green-600">{vendasFechadas}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Taxa de Conversão */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                    <p className="text-3xl font-bold" style={{ color: VITAL_COLORS.turquoise }}>
                      {taxaConversao}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${VITAL_COLORS.turquoise}20` }}>
                    <Award className="h-6 w-6" style={{ color: VITAL_COLORS.turquoise }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total de Comissões */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Comissões</p>
                    <p className="text-3xl font-bold text-green-600">
                      R$ {(totalComissoes / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhamento de Comissões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Comissões Pendentes
                </CardTitle>
                <CardDescription>
                  Aguardando término do período de cancelamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  R$ {(comissoesPendentes / 100).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {indicacoesEmAndamento} indicações em andamento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Comissões Pagas
                </CardTitle>
                <CardDescription>
                  Já liberadas para saque
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  R$ {(comissoesPagas / 100).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Disponível para saque
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Indicações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Indicações/Vendas Recentes</CardTitle>
              <CardDescription>
                Acompanhe o status de suas últimas indicações e vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {minhasIndicacoes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Você ainda não tem indicações cadastradas.
                  <br />
                  <Button 
                    className="mt-4" 
                    style={{ backgroundColor: VITAL_COLORS.turquoise }}
                    onClick={() => setLocation("/indicar")}
                  >
                    Fazer Primeira Indicação
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Comissão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {minhasIndicacoes.slice(0, 10).map((indicacao: any) => {
                      let valorComissao = 0;
                      
                      if (indicacao.tipoComissao && indicacao.valorComissao) {
                        valorComissao = indicacao.valorComissao;
                      } else if (indicacao.status === "venda_fechada") {
                        const config = configs?.find(c => 
                          c.nomePlano === indicacao.nomePlano &&
                          c.tipoPlano === indicacao.tipoPlano &&
                          c.categoria === indicacao.categoria
                        );
                        if (config) {
                          valorComissao = config.valorComissao;
                        }
                      }

                      return (
                        <TableRow key={indicacao.id}>
                          <TableCell className="font-medium">
                            {indicacao.nomeIndicado}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {indicacao.nomePlano === "essencial" ? "Essencial" : "Premium"} -{" "}
                              {indicacao.tipoPlano === "familiar" ? "Familiar" : "Individual"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                indicacao.status === "venda_fechada" ? "default" :
                                indicacao.status === "pendente" ? "secondary" :
                                "outline"
                              }
                            >
                              {indicacao.status === "venda_fechada" ? "Venda Fechada" :
                               indicacao.status === "pendente" ? "Pendente" :
                               indicacao.status === "em_contato" ? "Em Contato" :
                               indicacao.status === "aguardando_documentos" ? "Aguardando Docs" :
                               indicacao.status === "nao_converteu" ? "Não Converteu" :
                               indicacao.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(indicacao.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {valorComissao > 0 ? (
                              <span className="font-semibold text-green-600">
                                R$ {(valorComissao / 100).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PainelVendedorLayout>
  );
}
