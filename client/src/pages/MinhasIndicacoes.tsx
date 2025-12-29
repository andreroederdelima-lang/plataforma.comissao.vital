import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, LogOut, UserCircle, DollarSign, FileText, Calendar, CreditCard } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { Link } from "wouter";

const statusLabels = {
  aguardando_contato: "Aguardando Contato",
  em_negociacao: "Em Negociação",
  venda_com_objecoes: "Venda com Objeções",
  venda_fechada: "Venda Fechada",
  nao_comprou: "Não Comprou",
  cliente_sem_interesse: "Cliente Sem Interesse",
};

const statusVariants = {
  aguardando_contato: "secondary" as const,
  em_negociacao: "default" as const,
  venda_com_objecoes: "default" as const,
  venda_fechada: "default" as const,
  nao_comprou: "destructive" as const,
  cliente_sem_interesse: "destructive" as const,
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
  familiar: "Familiar (até 4 pessoas)",
  individual: "Individual (1 pessoa)",
};

const nomePlanoLabels = {
  essencial: "Essencial",
  premium: "Premium",
};

const categoriaLabels = {
  empresarial: "Empresarial",
  pessoa_fisica: "Pessoa Física",
};

// Função para gerar nome completo do produto
const getNomeProdutoCompleto = (nomePlano: string, tipoPlano: string, categoria: string) => {
  const plano = nomePlanoLabels[nomePlano as keyof typeof nomePlanoLabels] || nomePlano;
  const tipo = tipoPlano === "familiar" ? "Familiar" : "Individual";
  const pessoas = tipoPlano === "familiar" ? "(até 4 pessoas)" : "(1 pessoa)";
  const cat = categoria === "empresarial" ? " - Empresarial" : "";
  return `${plano} ${tipo} ${pessoas}${cat}`;
};

export default function MinhasIndicacoes() {
  const { user, loading: authLoading, logout } = useAuth();
  const { data: indicacoes, isLoading } = trpc.indicacoes.listMine.useQuery();

  if (authLoading || isLoading) {
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
              <p className="text-sm text-muted-foreground">Minhas Indicações</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
              <NotificationBadge />
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Painel Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-6xl">
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
              <CardTitle className="text-2xl">Vendas e Indicações</CardTitle>
              <CardDescription>
                Acompanhe suas vendas diretas (💰 100% comissão) e indicações (📝 50% comissão)
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Cards de Estatísticas */}
          {indicacoes && indicacoes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{indicacoes.length}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total</div>
                  </div>
                </CardContent>
              </Card>

              {/* Indicações (sem dataVenda) */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">
                      {indicacoes.filter(i => !i.dataVenda).length}
                    </div>
                    <div className="text-sm text-blue-700 mt-1 font-medium">📝 Indicações</div>
                    <div className="text-xs text-blue-600 mt-0.5">50% comissão</div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendas Fechadas (com dataVenda) */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {indicacoes.filter(i => i.dataVenda && i.status === 'venda_fechada').length}
                    </div>
                    <div className="text-sm text-green-700 mt-1 font-medium">🎯 Vendas Fechadas</div>
                    <div className="text-xs text-green-600 mt-0.5">100% comissão</div>
                  </div>
                </CardContent>
              </Card>

              {/* Em Negociação */}
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600">
                      {indicacoes.filter(i => i.status === 'em_negociacao' || i.status === 'aguardando_contato').length}
                    </div>
                    <div className="text-sm text-orange-700 mt-1 font-medium">Em Negociação</div>
                    <div className="text-xs text-orange-600 mt-0.5">Aguardando fechamento</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Indicações List */}
          {!indicacoes || indicacoes.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Você ainda não fez nenhuma indicação.
                </p>
                <Link href="/">
                  <Button className="mt-4">Fazer Primeira Indicação</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {indicacoes.map((indicacao) => {
                // Verificar se é venda (tem dataVenda preenchida)
                const isVenda = !!indicacao.dataVenda;
                const dataVenda = indicacao.dataVenda ? new Date(indicacao.dataVenda) : null;
                const valorEmReais = indicacao.valorPlano ? (indicacao.valorPlano / 100).toFixed(2) : null;
                
                // Calcular dias desde a venda
                const diasDesdeVenda = dataVenda ? Math.floor((Date.now() - dataVenda.getTime()) / (1000 * 60 * 60 * 24)) : null;
                const podeAprovar = diasDesdeVenda !== null && diasDesdeVenda >= 7;
                
                return (
                <Card key={indicacao.id} className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Ícone e Título */}
                        <div className="flex items-center gap-2">
                          {isVenda ? (
                            <div className="text-2xl">💰</div>
                          ) : (
                            <div className="text-2xl">📝</div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold">{indicacao.nomeIndicado}</h3>
                            <p className="text-sm text-muted-foreground">
                              WhatsApp: {indicacao.whatsappIndicado}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* Badge de Tipo */}
                          {isVenda ? (
                            <Badge className="bg-green-600 text-white hover:bg-green-700">
                              🎯 Venda Direta (100%)
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
                              📝 Indicação (50%)
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-sm">
                            {getNomeProdutoCompleto(indicacao.nomePlano, indicacao.tipoPlano, indicacao.categoria)}
                          </Badge>
                        </div>

                        {/* Dados de Venda */}
                        {isVenda && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Data da Venda:</span>
                              <span>{dataVenda?.toLocaleDateString("pt-BR")}</span>
                              {diasDesdeVenda !== null && (
                                <Badge variant="outline" className="ml-2">
                                  {diasDesdeVenda} {diasDesdeVenda === 1 ? "dia" : "dias"} atrás
                                </Badge>
                              )}
                            </div>
                            {valorEmReais && (
                              <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Valor:</span>
                                <span className="text-green-700 font-semibold">R$ {valorEmReais}</span>
                              </div>
                            )}
                            {indicacao.formaPagamento && (
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Pagamento:</span>
                                <span>{indicacao.formaPagamento === "pix" ? "PIX" : "Cartão de Crédito"}</span>
                              </div>
                            )}
                            {!podeAprovar && diasDesdeVenda !== null && (
                              <div className="text-xs text-orange-600 mt-2">
                                ⚠️ Período de carência: aguarde {7 - diasDesdeVenda} {7 - diasDesdeVenda === 1 ? "dia" : "dias"} para aprovação
                              </div>
                            )}
                            {podeAprovar && indicacao.status !== "venda_fechada" && (
                              <div className="text-xs text-green-600 mt-2">
                                ✅ Venda pode ser aprovada pelo admin
                              </div>
                            )}
                          </div>
                        )}
                        
                        {indicacao.observacoes && (
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Observações:</span> {indicacao.observacoes}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Enviado em {new Date(indicacao.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>

                      <div>
                        <Badge className={statusColors[indicacao.status]}>
                          {statusLabels[indicacao.status]}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
