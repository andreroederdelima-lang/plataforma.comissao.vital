import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { APP_LOGO } from "@/const";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
};

export default function LoginIndicador() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo, ${data.user.nome}!`);
      // Recarregar página para atualizar contexto de autenticação
      // Redirecionar baseado no role
      if (data.user.role === 'admin' || data.user.role === 'comercial' || data.user.role === 'vendedor') {
        window.location.href = "/admin";
      } else {
        window.location.href = "/materiais-divulgacao";
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-20 mx-auto cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Login</h1>
          <p className="text-muted-foreground mt-1">Programa de Indicações Vital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Digite seu e-mail e senha para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <Link href="/esqueci-senha" className="text-xs text-[#2B9C9C] hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Ainda não tem uma conta?{" "}
                <Link href="/cadastro-indicador" className="text-[#2B9C9C] hover:underline font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
              
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para início
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Informação adicional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Indique. Compartilhe cuidado. Ganhe com isso.
          </p>
        </div>
      </div>
    </div>
  );
}
