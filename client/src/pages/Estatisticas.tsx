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
import { ArrowLeft, Loader2, LogOut, TrendingUp, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { Link, useLocation } from "wouter";
import { useMemo } from "react";

export default function Estatisticas() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: indicacoes, isLoading } = trpc.indicacoes.listAll.useQuery();

  // Calcular estatísticas por parceiro
  const estatisticasPorParceiro = useMemo(() => {
    if (!indicacoes) return [];

    const stats = new Map<number, {
      parceiro: { id: number; name: string; email: string };
      total: number;
      vendaFechada: number;
      naoComprou: number;
      falandoComVendedor: number;
      naoRespondeu: number;
      taxaConversao: number;
    }>();

    indicacoes.forEach((item) => {
      const parceiroId = item.indicacao.parceiroId;
      
      if (!stats.has(parceiroId)) {
        stats.set(parceiroId, {
          parceiro: {
            id: parceiroId,
            name: item.parceiro?.name || "N/A",
            email: item.parceiro?.email || "N/A",
          },
          total: 0,
          vendaFechada: 0,
          naoComprou: 0,
          falandoComVendedor: 0,
          naoRespondeu: 0,
          taxaConversao: 0,
        });
      }

      const stat = stats.get(parceiroId)!;
      stat.total++;

      switch (item.indicacao.status) {
        case "venda_fechada":
          stat.vendaFechada++;
          break;
        case "nao_comprou":
          stat.naoComprou++;
          break;
        case "aguardando_contato":
        case "em_negociacao":
          stat.falandoComVendedor++;
          break;
        case "venda_com_objecoes":
        case "cliente_sem_interesse":
          stat.naoRespondeu++;
          break;
      }
    });

    // Calcular taxa de conversão
    stats.forEach((stat) => {
      const finalizadas = stat.vendaFechada + stat.naoComprou;
      stat.taxaConversao = finalizadas > 0 ? (stat.vendaFechada / finalizadas) * 100 : 0;
    });

    // Ordenar por total de indicações
    return Array.from(stats.values()).sort((a, b) => b.total - a.total);
  }, [indicacoes]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-16 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Sua Saúde Vital</h1>
              <p className="text-sm text-muted-foreground">Estatísticas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{user.name || user.email}</span>
              <Badge variant="outline" className="ml-1">Admin</Badge>
            </div>
            <NotificationBadge />
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>

          {/* Header */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Estatísticas por Parceiro</CardTitle>
                  <CardDescription>
                    Ranking de parceiros por número de indicações e taxa de conversão
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Table */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              {!estatisticasPorParceiro || estatisticasPorParceiro.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma estatística disponível.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Parceiro</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Venda Fechada</TableHead>
                        <TableHead className="text-center">Falando com Vendedor</TableHead>
                        <TableHead className="text-center">Não Respondeu</TableHead>
                        <TableHead className="text-center">Não Comprou</TableHead>
                        <TableHead className="text-center">Taxa de Conversão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estatisticasPorParceiro.map((stat, index) => (
                        <TableRow key={stat.parceiro.id}>
                          <TableCell className="font-bold text-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{stat.parceiro.name}</p>
                              <p className="text-xs text-muted-foreground">{stat.parceiro.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-primary">
                            {stat.total}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/20">
                              {stat.vendaFechada}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                              {stat.falandoComVendedor}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                              {stat.naoRespondeu}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="default" className="bg-red-500/10 text-red-700 border-red-500/20">
                              {stat.naoComprou}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-bold text-lg">
                                {stat.taxaConversao.toFixed(1)}%
                              </span>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(stat.taxaConversao, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
