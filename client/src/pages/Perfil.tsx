import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, LogOut, Save } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Perfil() {
  const { user, loading, logout } = useAuth();
  const [chavePix, setChavePix] = useState(user?.chavePix || "");
  const utils = trpc.useUtils();

  const updatePixMutation = trpc.auth.updateChavePix.useMutation({
    onSuccess: () => {
      toast.success("Chave PIX atualizada com sucesso!");
      utils.auth.me.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar chave PIX");
    },
  });

  const handleSave = () => {
    if (!chavePix.trim()) {
      toast.error("Por favor, insira uma chave PIX válida");
      return;
    }
    updatePixMutation.mutate({ chavePix });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
                <p className="text-sm text-gray-600">Gerencie suas informações</p>
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Botão Voltar */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Início
            </Button>
          </Link>

          {/* Informações Básicas */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Suas informações de cadastro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={user.name || "Não informado"} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={user.email || "Não informado"} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Chave PIX */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Chave PIX para Comissões</CardTitle>
              <CardDescription>
                Cadastre sua chave PIX para receber as comissões das indicações fechadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="chavePix">Chave PIX *</Label>
                <Input
                  id="chavePix"
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pode ser CPF, CNPJ, email, telefone ou chave aleatória
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={updatePixMutation.isPending}
                className="w-full"
              >
                {updatePixMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Chave PIX
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2024 Sua Saúde Vital - Sistema de Indicações de Parceiros
        </div>
      </footer>
    </div>
  );
}
