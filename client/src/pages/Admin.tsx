import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
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
import { ArrowLeft, BarChart3, DollarSign, Download, Loader2, LogOut, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

function ComissaoAutoCell({ indicacao }: { indicacao: any }) {
  const { data: configs } = trpc.comissaoConfig.list.useQuery();
  
  // Calcular comissão automaticamente baseado no tipo de plano + categoria
  let valorComissao = 0;
  
  // Primeiro tenta usar valor manual (se definido)
  if (indicacao.tipoComissao && indicacao.valorComissao) {
    valorComissao = indicacao.valorComissao;
  } else {
    // Caso contrário, usa valor configurado para a combinação nomePlano + tipoPlano + categoria
    const config = configs?.find(c => 
      c.nomePlano === indicacao.nomePlano &&
      c.tipoPlano === indicacao.tipoPlano &&
      c.categoria === indicacao.categoria
    );
    if (config) {
      valorComissao = config.valorComissao;
    }
  }
  
  if (valorComissao === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Não configurado
      </div>
    );
  }
  
  return (
    <div className="text-sm">
      <p className="font-semibold text-green-600">
        R$ {(valorComissao / 100).toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        {indicacao.tipoPlano === "familiar" ? "Familiar" : "Individual"}
      </p>
    </div>
  );
}

const statusLabels = {
  aguardando_contato: "Aguardando Contato",
  em_negociacao: "Em Negociação",
  venda_com_objecoes: "Venda com Objeções",
  venda_fechada: "Venda Fechada",
  nao_comprou: "Não Comprou",
  cliente_sem_interesse: "Cliente Sem Interesse",
};

const statusColors = {
  aguardando_contato: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  em_negociacao: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  venda_com_objecoes: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  venda_fechada: "bg-green-500/10 text-green-700 border-green-500/20",
  nao_comprou: "bg-red-500/10 text-red-700 border-red-500/20",
  cliente_sem_interesse: "bg-red-500/10 text-red-700 border-red-500/20",
};

const tipoPlanoLabels = {
  familiar: "Familiar",
  individual: "Individual",
};

// Componente ComissaoConfigSection removido - agora está em /admin/configuracoes

const categoriaLabels = {
  empresarial: "Empresarial",
  pessoa_fisica: "Pessoa Física",
};

export default function Admin() {
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

  const handleExportExcel = () => {
    if (!indicacoes || indicacoes.length === 0) {
      toast.error("Nenhuma indicação para exportar");
      return;
    }

    const data = indicacoes.map((item) => ({
      Data: new Date(item.indicacao.createdAt).toLocaleDateString("pt-BR"),
      Parceiro: item.parceiro?.name || "N/A",
      "Email Parceiro": item.parceiro?.email || "N/A",
      "Nome Indicado": item.indicacao.nomeIndicado,
      WhatsApp: item.indicacao.whatsappIndicado,
      "Tipo Assinatura": tipoPlanoLabels[item.indicacao.tipoPlano],
      Categoria: categoriaLabels[item.indicacao.categoria],
      Observações: item.indicacao.observacoes || "-",
      Status: statusLabels[item.indicacao.status],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicações");
    
    const fileName = `indicacoes_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success("Arquivo Excel exportado com sucesso!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Verificar se é admin, promotor ou comercial
  if (!user || (user.role !== "admin" && user.role !== "promotor" && user.role !== "comercial")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-8">
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Gerenciar Vendas e Indicações</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as vendas e indicações dos parceiros
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
              <Link href="/estatisticas">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Estatísticas
                </Button>
              </Link>
              <Link href="/comissoes">
                <Button variant="outline" size="sm" className="gap-2">
                  <DollarSign className="h-4 w-4" />
                  Comissões
                </Button>
              </Link>
                  {indicacoes && indicacoes.length > 0 && (
                    <Button onClick={handleExportExcel} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Excel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics */}
          {indicacoes && indicacoes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card className="bg-card/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="pt-6 px-0">
              {!indicacoes || indicacoes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground px-6">
                  Nenhuma indicação registrada ainda.
                </div>
              ) : (
                <div className="overflow-x-auto px-6">
                  <Table className="min-w-[1400px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-[200px]">Status</TableHead>
                        <TableHead>Parceiro</TableHead>
                        <TableHead>Nome Indicado</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Assinatura</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {indicacoes.map((item) => {
                        const isVenda = item.indicacao.dataVenda !== null;
                        return (
                        <TableRow key={item.indicacao.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(item.indicacao.createdAt).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {isVenda ? (
                              <Badge className="bg-green-600 text-white hover:bg-green-700 gap-1">
                                <span>🎯</span> Venda (100%)
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-600 text-white hover:bg-blue-700 gap-1">
                                <span>📝</span> Indicação (50%)
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <select
                              value={item.indicacao.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  item.indicacao.id,
                                  e.target.value as "aguardando_contato" | "em_negociacao" | "venda_com_objecoes" | "venda_fechada" | "nao_comprou" | "cliente_sem_interesse"
                                )
                              }
                              disabled={updateStatusMutation.isPending}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              style={{
                                backgroundColor: item.indicacao.status === 'venda_fechada' ? '#dcfce7' : 
                                                item.indicacao.status === 'em_negociacao' ? '#dbeafe' :
                                                item.indicacao.status === 'venda_com_objecoes' ? '#fed7aa' :
                                                item.indicacao.status === 'nao_comprou' || item.indicacao.status === 'cliente_sem_interesse' ? '#fee2e2' : '#f3f4f6',
                                color: item.indicacao.status === 'venda_fechada' ? '#166534' : 
                                       item.indicacao.status === 'em_negociacao' ? '#1e40af' :
                                       item.indicacao.status === 'venda_com_objecoes' ? '#9a3412' :
                                       item.indicacao.status === 'nao_comprou' || item.indicacao.status === 'cliente_sem_interesse' ? '#991b1b' : '#374151'
                              }}
                            >
                              <option value="aguardando_contato">Aguardando Contato</option>
                              <option value="em_negociacao">Em Negociação</option>
                              <option value="venda_com_objecoes">Venda com Objeções</option>
                              <option value="venda_fechada">Venda Fechada</option>
                              <option value="nao_comprou">Não Comprou</option>
                              <option value="cliente_sem_interesse">Cliente Sem Interesse</option>
                            </select>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.parceiro?.name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.parceiro?.email || ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.indicacao.nomeIndicado}
                          </TableCell>
                          <TableCell>{item.indicacao.whatsappIndicado}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {tipoPlanoLabels[item.indicacao.tipoPlano]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {categoriaLabels[item.indicacao.categoria]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">
                              {item.indicacao.observacoes || "-"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <ComissaoAutoCell indicacao={item.indicacao} />
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
