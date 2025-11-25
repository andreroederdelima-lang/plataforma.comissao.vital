import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { APP_LOGO } from "@/const";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
};

export default function RecuperarSenha() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Extrair token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, []);

  const redefinirMutation = trpc.authIndicadores.redefinirSenha.useMutation({
    onSuccess: () => {
      setSucesso(true);
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => {
        setLocation("/login-indicador");
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (!token) {
      toast.error("Token inválido");
      return;
    }

    redefinirMutation.mutate({
      token,
      novaSenha,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>O link de recuperação é inválido ou expirou</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/esqueci-senha">
              <Button className="w-full" style={{ backgroundColor: VITAL_COLORS.turquoise }}>
                Solicitar novo link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-20 mx-auto cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Nova Senha</h1>
          <p className="text-muted-foreground mt-1">Programa de Indicações Vital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              {sucesso ? "Senha alterada com sucesso!" : "Digite sua nova senha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sucesso ? (
              <div className="flex flex-col items-center text-center py-6">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Senha redefinida!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sua senha foi alterada com sucesso.
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Digite a senha novamente"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={redefinirMutation.isPending}
                  className="w-full"
                  style={{ backgroundColor: VITAL_COLORS.turquoise }}
                >
                  {redefinirMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </form>
            )}

            {!sucesso && (
              <div className="mt-6 text-center">
                <Link href="/login-indicador" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
