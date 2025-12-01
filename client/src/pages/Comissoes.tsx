import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
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
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, DollarSign, Loader2, LogOut } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { Link } from "wouter";

export default function Comissoes() {
  const { user, loading, logout } = useAuth();
  const { data: comissoes, isLoading } = trpc.indicacoes.getComissoes.useQuery();
  const { data: configs } = trpc.comissaoConfig.list.useQuery();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Acesso restrito a administradores
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Agrupar comissões por parceiro
  const comissoesPorParceiro = comissoes?.reduce((acc: any, item: any) => {
    const parceiroId = item.parceiro?.id;
    if (!parceiroId) return acc;

    if (!acc[parceiroId]) {
      acc[parceiroId] = {
        parceiro: item.parceiro,
        indicacoes: [],
        totalComissao: 0,
      };
    }

    // Calcular comissão automaticamente baseado no tipo de plano + categoria
    let valorComissao = 0;
    
    // Primeiro tenta usar valor manual (se definido)
    if (item.indicacao.tipoComissao && item.indicacao.valorComissao) {
      valorComissao = item.indicacao.valorComissao;
    } else {
      // Caso contrário, usa valor configurado para a combinação nomePlano + tipoPlano + categoria
      const config = configs?.find(c => 
        c.nomePlano === item.indicacao.nomePlano &&
        c.tipoPlano === item.indicacao.tipoPlano &&
        c.categoria === item.indicacao.categoria
      );
      if (config) {
        valorComissao = config.valorComissao;
      }
    }
    
    acc[parceiroId].indicacoes.push({
      ...item.indicacao,
      valorComissaoCalculado: valorComissao,
    });
    acc[parceiroId].totalComissao += valorComissao;

    return acc;
  }, {});

  const parceiros = Object.values(comissoesPorParceiro || {}) as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-24 cursor-pointer" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatório de Comissões</h1>
                <p className="text-sm text-gray-600">Vendas fechadas e comissões por parceiro</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBadge />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">{user.name || user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Botão Voltar */}
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Admin
            </Button>
          </Link>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {comissoes?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Vendas Fechadas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {parceiros.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Parceiros com Vendas</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {(parceiros.reduce((sum, p) => sum + p.totalComissao, 0) / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total de Comissões</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Comissões por Parceiro */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Comissões por Parceiro</CardTitle>
              <CardDescription>
                Detalhamento de vendas fechadas e comissões a pagar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parceiros.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma venda fechada com comissão definida ainda.
                </div>
              ) : (
                <div className="space-y-6">
                  {parceiros.map((item) => (
                    <div key={item.parceiro.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{item.parceiro.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.parceiro.email}</p>
                          {item.parceiro.chavePix && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>PIX:</strong> {item.parceiro.chavePix}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            R$ {(item.totalComissao / 100).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.indicacoes.length} venda(s)
                          </p>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>WhatsApp</TableHead>
                            <TableHead>Tipo Plano</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor Comissão</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {item.indicacoes.map((indicacao: any) => (
                            <TableRow key={indicacao.id}>
                              <TableCell className="font-medium">
                                {indicacao.nomeIndicado}
                              </TableCell>
                              <TableCell>{indicacao.whatsappIndicado}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {indicacao.tipoPlano === "familiar" ? "Familiar" : "Individual"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(indicacao.createdAt).toLocaleDateString("pt-BR")}
                              </TableCell>
                              <TableCell>
                                {indicacao.valorComissaoCalculado > 0 ? (
                                  <span className="font-semibold text-green-600">
                                    R$ {(indicacao.valorComissaoCalculado / 100).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Não configurado</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2024 Sua Saúde Vital - Plataforma de Comissionamento
        </div>
      </footer>
    </div>
  );
}
