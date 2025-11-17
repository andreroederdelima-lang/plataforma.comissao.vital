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
import { ArrowLeft, BarChart3, DollarSign, Download, Loader2, LogOut, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";

function ComissaoCell({ indicacao }: { indicacao: any }) {
  const [tipoComissao, setTipoComissao] = useState<"valor_fixo" | "percentual" | null>(indicacao.tipoComissao || null);
  const [valorComissao, setValorComissao] = useState<string>(indicacao.valorComissao ? String(indicacao.valorComissao) : "");
  const utils = trpc.useUtils();

  const updateComissaoMutation = trpc.indicacoes.updateComissao.useMutation({
    onSuccess: () => {
      toast.success("Comissão atualizada!");
      utils.indicacoes.listAll.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar comissão");
    },
  });

  const handleSave = () => {
    if (!tipoComissao || !valorComissao) {
      toast.error("Preencha tipo e valor da comissão");
      return;
    }
    updateComissaoMutation.mutate({
      id: indicacao.id,
      tipoComissao,
      valorComissao: parseInt(valorComissao),
    });
  };

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <Select value={tipoComissao || ""} onValueChange={(v) => setTipoComissao(v as "valor_fixo" | "percentual")}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
          <SelectItem value="percentual">Percentual (%)</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        <Input
          type="number"
          placeholder={tipoComissao === "percentual" ? "Ex: 10" : "Ex: 5000"}
          value={valorComissao}
          onChange={(e) => setValorComissao(e.target.value)}
          className="h-8"
        />
        <Button size="sm" onClick={handleSave} disabled={updateComissaoMutation.isPending} className="h-8 px-2">
          OK
        </Button>
      </div>
      {indicacao.tipoComissao && indicacao.valorComissao && (
        <p className="text-xs text-muted-foreground">
          {indicacao.tipoComissao === "percentual" ? `${indicacao.valorComissao}%` : `R$ ${(indicacao.valorComissao / 100).toFixed(2)}`}
        </p>
      )}
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

function ComissaoConfigSection() {
  const { data: configs, isLoading } = trpc.comissaoConfig.list.useQuery();
  const utils = trpc.useUtils();
  
  const [valorFamiliar, setValorFamiliar] = useState<string>("");
  const [valorIndividual, setValorIndividual] = useState<string>("");
  
  const updateMutation = trpc.comissaoConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração atualizada!");
      utils.comissaoConfig.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar configuração");
    },
  });
  
  // Atualizar valores quando configs carregarem
  useState(() => {
    if (configs) {
      const familiar = configs.find(c => c.tipoPlano === "familiar");
      const individual = configs.find(c => c.tipoPlano === "individual");
      if (familiar) setValorFamiliar(String(familiar.valorComissao));
      if (individual) setValorIndividual(String(individual.valorComissao));
    }
  });
  
  const handleSave = (tipoPlano: "familiar" | "individual", valor: string) => {
    if (!valor || parseInt(valor) < 0) {
      toast.error("Valor inválido");
      return;
    }
    updateMutation.mutate({
      tipoPlano,
      valorComissao: parseInt(valor),
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  const configFamiliar = configs?.find(c => c.tipoPlano === "familiar");
  const configIndividual = configs?.find(c => c.tipoPlano === "individual");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Plano Familiar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Plano Familiar</h3>
            <p className="text-xs text-muted-foreground">Valor da comissão em centavos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Ex: 10000 (R$ 100,00)"
            value={valorFamiliar || (configFamiliar?.valorComissao || "")}
            onChange={(e) => setValorFamiliar(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => handleSave("familiar", valorFamiliar || String(configFamiliar?.valorComissao || 0))}
            disabled={updateMutation.isPending}
          >
            Salvar
          </Button>
        </div>
        {configFamiliar && (
          <p className="text-sm text-muted-foreground">
            Valor atual: <span className="font-semibold text-foreground">R$ {(configFamiliar.valorComissao / 100).toFixed(2)}</span>
          </p>
        )}
      </div>
      
      {/* Plano Individual */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Plano Individual</h3>
            <p className="text-xs text-muted-foreground">Valor da comissão em centavos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Ex: 5000 (R$ 50,00)"
            value={valorIndividual || (configIndividual?.valorComissao || "")}
            onChange={(e) => setValorIndividual(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => handleSave("individual", valorIndividual || String(configIndividual?.valorComissao || 0))}
            disabled={updateMutation.isPending}
          >
            Salvar
          </Button>
        </div>
        {configIndividual && (
          <p className="text-sm text-muted-foreground">
            Valor atual: <span className="font-semibold text-foreground">R$ {(configIndividual.valorComissao / 100).toFixed(2)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

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

  // Verificar se é admin
  if (!user || user.role !== "admin") {
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
              <p className="text-sm text-muted-foreground">Painel Administrativo</p>
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
                  <CardTitle className="text-2xl">Gerenciar Indicações</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as indicações dos parceiros
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

          {/* Configuração de Comissões */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">Configuração de Comissões por Tipo de Plano</CardTitle>
              <CardDescription>
                Defina os valores de comissão para cada tipo de plano. Estes valores serão usados para calcular automaticamente as comissões dos parceiros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComissaoConfigSection />
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              {!indicacoes || indicacoes.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma indicação registrada ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {indicacoes.map((item) => (
                        <TableRow key={item.indicacao.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(item.indicacao.createdAt).toLocaleDateString("pt-BR")}
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
                            <ComissaoCell indicacao={item.indicacao} />
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
