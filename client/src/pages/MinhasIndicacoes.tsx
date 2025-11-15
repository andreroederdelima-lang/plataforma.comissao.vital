import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, LogOut, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { Link } from "wouter";

const statusLabels = {
  falando_com_vendedor: "Falando com Vendedor",
  venda_fechada: "Venda Fechada",
  nao_respondeu_vendedor: "Não Respondeu Vendedor",
  nao_comprou: "Não Comprou",
};

const statusVariants = {
  falando_com_vendedor: "default" as const,
  venda_fechada: "default" as const,
  nao_respondeu_vendedor: "secondary" as const,
  nao_comprou: "destructive" as const,
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
              <CardTitle className="text-2xl">Minhas Indicações</CardTitle>
              <CardDescription>
                Acompanhe o status de todas as suas indicações
              </CardDescription>
            </CardHeader>
          </Card>

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
              {indicacoes.map((indicacao) => (
                <Card key={indicacao.id} className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">{indicacao.nomeIndicado}</h3>
                          <p className="text-sm text-muted-foreground">
                            WhatsApp: {indicacao.whatsappIndicado}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {tipoPlanoLabels[indicacao.tipoPlano]}
                          </Badge>
                          <Badge variant="outline">
                            {categoriaLabels[indicacao.categoria]}
                          </Badge>
                        </div>

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
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
