import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ArrowLeft, Loader2, LogOut, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const statusLabels = {
  falando_com_vendedor: "Falando com Vendedor",
  venda_fechada: "Venda Fechada",
  nao_respondeu_vendedor: "Não Respondeu Vendedor",
  nao_comprou: "Não Comprou",
};

const statusColors = {
  falando_com_vendedor: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  venda_fechada: "bg-green-500/10 text-green-700 border-green-500/20",
  nao_respondeu_vendedor: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  nao_comprou: "bg-red-500/10 text-red-700 border-red-500/20",
};

const tipoPlanoLabels = {
  familiar: "Familiar",
  individual: "Individual",
};

const categoriaLabels = {
  empresarial: "Empresarial",
  pessoa_fisica: "Pessoa Física",
};

export default function Vendedor() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: indicacoes, isLoading } = trpc.indicacoes.listAll.useQuery();
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.indicacoes.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.indicacoes.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleStatusChange = (id: number, status: "aguardando_contato" | "em_negociacao" | "venda_com_objecoes" | "venda_fechada" | "nao_comprou" | "cliente_sem_interesse") => {
    updateStatusMutation.mutate({ id, status });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verificar se o usuário é vendedor ou comercial
  if (!user || (user.role !== "vendedor" && user.role !== "comercial")) {
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
              <p className="text-sm text-muted-foreground">Painel do Vendedor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{user.name || user.email}</span>
              <Badge variant="outline" className="ml-1">Vendedor</Badge>
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>

          {/* Header */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Gerenciar Indicações</CardTitle>
              <CardDescription>
                Visualize e atualize o status das indicações recebidas
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Dashboard Motivador */}
          {indicacoes && (() => {
            // Calcular totais de comissões
            const totalGanho = indicacoes
              .filter(i => i.indicacao.status === "venda_fechada")
              .reduce((sum, i) => sum + (i.indicacao.valorComissao || 0), 0);
            
            const totalEmNegociacao = indicacoes
              .filter(i => i.indicacao.status === "em_negociacao")
              .reduce((sum, i) => sum + (i.indicacao.valorComissao || 0), 0);
            
            const totalIndicacoes = indicacoes.length;
            const vendasFechadas = indicacoes.filter(i => i.indicacao.status === "venda_fechada").length;
            const emNegociacao = indicacoes.filter(i => i.indicacao.status === "em_negociacao").length;
            
            return (
              <div className="space-y-4">
                {/* Cards de Valores em Destaque */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700 mb-2">💰 Comissões Ganhas</p>
                        <p className="text-4xl font-bold text-green-600">
                          R$ {(totalGanho / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {vendasFechadas} vendas fechadas
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-700 mb-2">🔥 Potencial em Negociação</p>
                        <p className="text-4xl font-bold text-blue-600">
                          R$ {(totalEmNegociacao / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {emNegociacao} indicações em andamento
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-purple-700 mb-2">🎯 Total de Indicações</p>
                        <p className="text-4xl font-bold text-purple-600">
                          {totalIndicacoes}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Taxa de conversão: {totalIndicacoes > 0 ? ((vendasFechadas / totalIndicacoes) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Barra de Progresso e Motivação */}
                <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">🎖️ Continue indicando e ganhe mais!</p>
                        <p className="text-sm text-muted-foreground">
                          Próximo nível: {Math.ceil(totalIndicacoes / 10) * 10} indicações
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totalIndicacoes % 10) * 10, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Você já indicou {totalIndicacoes} pessoas! Faltam {10 - (totalIndicacoes % 10)} para o próximo marco.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
          
          {/* Estatísticas Rápidas */}
          {indicacoes && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {indicacoes.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {indicacoes.filter(i => i.indicacao.status === "em_negociacao").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Em Negociação</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {indicacoes.filter(i => i.indicacao.status === "venda_fechada").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Venda Fechada</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-600">
                      {indicacoes.filter(i => i.indicacao.status === "nao_comprou").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Não Comprou</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              {!indicacoes || indicacoes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma indicação encontrada.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Parceiro</TableHead>
                        <TableHead>Nome Indicado</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Assinatura</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {indicacoes.map((item) => (
                        <TableRow key={item.indicacao.id}>
                          <TableCell className="font-medium">
                            {new Date(item.indicacao.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.parceiro?.name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{item.parceiro?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.indicacao.nomeIndicado}
                          </TableCell>
                          <TableCell>
                            <a
                              href={`https://wa.me/${item.indicacao.whatsappIndicado.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {item.indicacao.whatsappIndicado}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tipoPlanoLabels[item.indicacao.tipoPlano]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {categoriaLabels[item.indicacao.categoria]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">
                              {item.indicacao.observacoes || "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.indicacao.status}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  item.indicacao.id,
                                  value as "aguardando_contato" | "em_negociacao" | "venda_com_objecoes" | "venda_fechada" | "nao_comprou" | "cliente_sem_interesse"
                                )
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aguardando_contato">Aguardando Contato</SelectItem>
                                <SelectItem value="em_negociacao">Em Negociação</SelectItem>
                                <SelectItem value="venda_com_objecoes">Venda com Objeções</SelectItem>
                                <SelectItem value="venda_fechada">Venda Fechada</SelectItem>
                                <SelectItem value="nao_comprou">Não Comprou</SelectItem>
                                <SelectItem value="cliente_sem_interesse">Cliente Sem Interesse</SelectItem>
                              </SelectContent>
                            </Select>
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
