import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Página de conferência de vendas para Admin
 * Permite aprovar vendas uma a uma após conferir CPF e status ativo no plano
 */
export default function AdminConferirVendas() {
  const { user, loading: authLoading } = useAuth();
  const [vendasSelecionadas, setVendasSelecionadas] = useState<number[]>([]);

  // Buscar vendas pendentes de aprovação (dataAprovacao = null)
  const { data: vendasPendentes, isLoading, refetch } = trpc.admin.listarVendasPendentes.useQuery();

  // Mutation para aprovar vendas
  const aprovarMutation = trpc.admin.aprovarVendasConferidas.useMutation({
    onSuccess: () => {
      toast.success("Vendas aprovadas com sucesso!");
      setVendasSelecionadas([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao aprovar vendas");
    },
  });

  const toggleVenda = (id: number) => {
    setVendasSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((v: number) => v !== id) : [...prev, id]
    );
  };

  const toggleTodas = () => {
    if (!vendasPendentes) return;
    if (vendasSelecionadas.length === vendasPendentes.length) {
      setVendasSelecionadas([]);
    } else {
      setVendasSelecionadas(vendasPendentes.map((v) => v.indicacao.id));
    }
  };

  const aprovarSelecionadas = () => {
    if (vendasSelecionadas.length === 0) {
      toast.error("Selecione pelo menos uma venda para aprovar");
      return;
    }
    aprovarMutation.mutate({ indicacaoIds: vendasSelecionadas });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔍 Conferir e Aprovar Vendas</CardTitle>
            <CardDescription>
              Confira o CPF do cliente e status ativo no plano antes de aprovar as comissões
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !vendasPendentes || vendasPendentes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">✅ Nenhuma venda pendente de aprovação</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Ações em lote */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleTodas}
                    >
                      {vendasSelecionadas.length === vendasPendentes.length
                        ? "Desmarcar Todas"
                        : "Selecionar Todas"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {vendasSelecionadas.length} de {vendasPendentes.length} selecionadas
                    </span>
                  </div>
                  <Button
                    onClick={aprovarSelecionadas}
                    disabled={vendasSelecionadas.length === 0 || aprovarMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {aprovarMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aprovando...
                      </>
                    ) : (
                      `✅ Aprovar ${vendasSelecionadas.length > 0 ? `(${vendasSelecionadas.length})` : ""}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de vendas */}
            <div className="space-y-4">
              {vendasPendentes.map((item: any) => {
                const { indicacao, parceiro } = item;
                const isVenda = indicacao.tipo === "venda";
                const isSelecionada = vendasSelecionadas.includes(indicacao.id);

                return (
                  <Card
                    key={indicacao.id}
                    className={`transition-all ${
                      isSelecionada ? "border-green-500 border-2 bg-green-50" : ""
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelecionada}
                          onCheckedChange={() => toggleVenda(indicacao.id)}
                          className="mt-1"
                        />

                        {/* Informações */}
                        <div className="flex-1 space-y-3">
                          {/* Cabeçalho */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                isVenda
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {isVenda ? "🎯 Venda 100%" : "📝 Indicação"}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ID: {indicacao.id}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(indicacao.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>

                          {/* Dados do Cliente */}
                          <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                            <div>
                              <p className="text-xs text-muted-foreground">Cliente</p>
                              <p className="font-semibold">{indicacao.nomeIndicado}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">CPF</p>
                              <p className="font-semibold font-mono">
                                {indicacao.cpfCliente || "Não informado"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Plano</p>
                              <p className="font-semibold">
                                {indicacao.nomePlano === "essencial" ? "Essencial" : "Premium"}{" "}
                                {indicacao.tipoPlano === "familiar" ? "Familiar" : "Individual"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Categoria</p>
                              <p className="font-semibold">
                                {indicacao.categoria === "empresarial" ? "Empresarial" : "Pessoa Física"}
                              </p>
                            </div>
                            {indicacao.valorPlanoManual && (
                              <div>
                                <p className="text-xs text-muted-foreground">Valor Manual</p>
                                <p className="font-semibold">
                                  R$ {(indicacao.valorPlanoManual / 100).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Dados do Vendedor */}
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 mb-1">Vendedor Principal</p>
                            <p className="font-semibold">{parceiro?.name || "Sem nome"}</p>
                            <p className="text-sm text-muted-foreground">{parceiro?.email}</p>
                            {parceiro?.cpf && (
                              <p className="text-sm text-muted-foreground">CPF: {parceiro.cpf}</p>
                            )}
                            {parceiro?.chavePix && (
                              <p className="text-sm text-muted-foreground">PIX: {parceiro.chavePix}</p>
                            )}
                          </div>

                          {/* Segundo Vendedor */}
                          {indicacao.vendedorSecundarioId && (
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-xs text-purple-600 mb-1">Segundo Vendedor (50/50)</p>
                              <p className="font-semibold">ID: {indicacao.vendedorSecundarioId}</p>
                              <p className="text-sm text-muted-foreground">
                                Comissão será dividida automaticamente
                              </p>
                            </div>
                          )}

                          {/* Instruções */}
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              ⚠️ <strong>Antes de aprovar:</strong> Confira se o CPF está correto e se o cliente permanece ativo no plano
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
