import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2 } from "lucide-react";

/**
 * Página de login simples com email/senha para vendedores
 */
export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [esqueceuSenha, setEsqueceuSenha] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login realizado com sucesso!");
      
      // Redirecionar baseado no role
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
      
      // Recarregar página para atualizar contexto de autenticação
      setTimeout(() => window.location.reload(), 100);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      toast.error("Preencha email e senha");
      return;
    }

    loginMutation.mutate({ email, senha });
  };

  const handleEsqueceuSenha = () => {
    if (!email) {
      toast.error("Digite seu email primeiro");
      return;
    }

    toast.info("Entre em contato com o administrador para recuperar sua senha");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-teal-800">
            {APP_TITLE}
          </CardTitle>
          <CardDescription>
            {esqueceuSenha
              ? "Digite seu email para recuperar a senha"
              : "Entre com seu email e senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="email"
              />
            </div>

            {!esqueceuSenha && (
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={loginMutation.isPending}
                  autoComplete="current-password"
                />
              </div>
            )}

            {!esqueceuSenha ? (
              <>
                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loginMutation.isPending}
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

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setEsqueceuSenha(true)}
                >
                  Esqueci minha senha
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={handleEsqueceuSenha}
                >
                  Recuperar Senha
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-muted-foreground"
                  onClick={() => setEsqueceuSenha(false)}
                >
                  Voltar para login
                </Button>
              </>
            )}
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Não tem uma conta?</p>
            <p className="mt-1">Entre em contato com o administrador</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
