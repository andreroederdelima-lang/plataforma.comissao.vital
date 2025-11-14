import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, Check, CheckCheck, Loader2, LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const tipoIcons = {
  nova_indicacao: "🎉",
  status_alterado: "📝",
  sistema: "ℹ️",
};

export default function Notificacoes() {
  const { user, loading: authLoading, logout } = useAuth();
  const { data: notificacoes, isLoading } = trpc.notificacoes.list.useQuery();
  const utils = trpc.useUtils();

  const markAsReadMutation = trpc.notificacoes.markAsRead.useMutation({
    onSuccess: () => {
      utils.notificacoes.list.invalidate();
      utils.notificacoes.countUnread.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notificacoes.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações marcadas como lidas");
      utils.notificacoes.list.invalidate();
      utils.notificacoes.countUnread.invalidate();
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

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
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Sua Saúde Vital</h1>
              <p className="text-sm text-muted-foreground">Notificações</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
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
      <main className="container py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>

            {notificacoes && notificacoes.some(n => n.lida === 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Header */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Notificações</CardTitle>
                  <CardDescription>
                    Acompanhe as atualizações sobre suas indicações
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Notificações List */}
          {!notificacoes || notificacoes.length === 0 ? (
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Você não tem notificações ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notificacoes.map((notificacao) => (
                <Card
                  key={notificacao.id}
                  className={`bg-card/80 backdrop-blur-sm transition-all ${
                    notificacao.lida === 0
                      ? "border-primary/30 shadow-sm"
                      : "opacity-70"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-2xl flex-shrink-0">
                        {tipoIcons[notificacao.tipo]}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-base">
                              {notificacao.titulo}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notificacao.mensagem}
                            </p>
                          </div>
                          
                          {notificacao.lida === 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notificacao.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(notificacao.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {notificacao.lida === 1 && (
                            <Badge variant="outline" className="text-xs">
                              Lida
                            </Badge>
                          )}
                        </div>
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
