import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Trophy, TrendingUp, Award } from "lucide-react";

export default function AdminRanking() {
  const { user, loading } = useAuth();
  
  const { data: rankingVendedores, isLoading: loadingVendedores } = trpc.ranking.vendedores.useQuery({ limit: 5 });
  const { data: rankingIndicadores, isLoading: loadingIndicadores } = trpc.ranking.indicadores.useQuery({ limit: 5 });

  if (loading || loadingVendedores || loadingIndicadores) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "comercial")) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return "🥇";
    if (posicao === 2) return "🥈";
    if (posicao === 3) return "🥉";
    return `${posicao}º`;
  };

  return (
    <AdminLayout>
      <div className="container py-8 max-w-6xl">
        <div className="space-y-6">
          {/* Botão Voltar */}
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Ranking de Promotores
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe o desempenho dos melhores vendedores e indicadores do mês
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Vendedores */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top 5 Vendedores
                </CardTitle>
                <CardDescription>
                  Promotores com mais vendas diretas fechadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!rankingVendedores || rankingVendedores.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma venda fechada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankingVendedores.map((vendedor, index) => (
                      <div
                        key={vendedor.parceiroId}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0 ? "bg-yellow-50 border-yellow-300" :
                          index === 1 ? "bg-gray-50 border-gray-300" :
                          index === 2 ? "bg-orange-50 border-orange-300" :
                          "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold w-10 text-center">
                            {getMedalIcon(index + 1)}
                          </span>
                          <div>
                            <p className="font-semibold">{vendedor.nome || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{vendedor.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {((vendedor.totalComissoes || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendedor.totalVendas} {vendedor.totalVendas === 1 ? "venda" : "vendas"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranking de Indicadores */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Top 5 Indicadores
                </CardTitle>
                <CardDescription>
                  Promotores com mais indicações convertidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!rankingIndicadores || rankingIndicadores.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma indicação convertida ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rankingIndicadores.map((indicador, index) => (
                      <div
                        key={indicador.parceiroId}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0 ? "bg-yellow-50 border-yellow-300" :
                          index === 1 ? "bg-gray-50 border-gray-300" :
                          index === 2 ? "bg-orange-50 border-orange-300" :
                          "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold w-10 text-center">
                            {getMedalIcon(index + 1)}
                          </span>
                          <div>
                            <p className="font-semibold">{indicador.nome || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{indicador.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            R$ {((indicador.totalComissoes || 0) / 100).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {indicador.totalIndicacoes} {indicador.totalIndicacoes === 1 ? "indicação" : "indicações"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Como funciona o ranking?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • <strong>Vendedores:</strong> Promotores que fecharam vendas diretas (dataVenda preenchida)
              </p>
              <p>
                • <strong>Indicadores:</strong> Promotores cujas indicações foram convertidas pela equipe comercial
              </p>
              <p>
                • Rankings ordenados por <strong>total de comissões ganhas</strong>
              </p>
              <p>
                • Apenas vendas com status "Venda Fechada" são contabilizadas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
