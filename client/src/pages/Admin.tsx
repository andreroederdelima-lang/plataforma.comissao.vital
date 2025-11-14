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
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const statusLabels = {
  pendente: "Pendente",
  em_analise: "Em Análise",
  aprovada: "Aprovada",
  recusada: "Recusada",
};

const statusColors = {
  pendente: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  em_analise: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  aprovada: "bg-green-500/10 text-green-700 border-green-500/20",
  recusada: "bg-red-500/10 text-red-700 border-red-500/20",
};

const tipoPlanoLabels = {
  familiar: "Familiar",
  individual: "Individual",
};

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

  const handleStatusChange = (id: number, status: "pendente" | "em_analise" | "aprovada" | "recusada") => {
    updateStatusMutation.mutate({ id, status });
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
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-12 w-auto" />
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
                Visualize e gerencie todas as indicações dos parceiros
              </CardDescription>
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
                    <p className="text-3xl font-bold text-yellow-600">
                      {indicacoes.filter(i => i.indicacao.status === "pendente").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Pendentes</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {indicacoes.filter(i => i.indicacao.status === "em_analise").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Em Análise</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {indicacoes.filter(i => i.indicacao.status === "aprovada").length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Aprovadas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
                        <TableHead>Plano</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Observações</TableHead>
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
                            <Select
                              value={item.indicacao.status}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  item.indicacao.id,
                                  value as "pendente" | "em_analise" | "aprovada" | "recusada"
                                )
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="aprovada">Aprovada</SelectItem>
                                <SelectItem value="recusada">Recusada</SelectItem>
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
