import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { APP_LOGO } from "@/const";

const VITAL_COLORS = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
};

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const solicitarMutation = trpc.authIndicadores.solicitarRecuperacao.useMutation({
    onSuccess: () => {
      setEnviado(true);
      toast.success("E-mail de recuperação enviado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao solicitar recuperação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    solicitarMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-20 mx-auto cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Recuperar Senha</h1>
          <p className="text-muted-foreground mt-1">Programa de Indicações Vital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Esqueceu sua senha?</CardTitle>
            <CardDescription>
              {enviado
                ? "Verifique seu e-mail"
                : "Digite seu e-mail para receber um link de recuperação"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enviado ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center py-6">
                  <div className="h-16 w-16 rounded-full bg-[#2B9C9C]/10 flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-[#2B9C9C]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">E-mail enviado!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enviamos um link de recuperação para <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Verifique sua caixa de entrada e spam. O link é válido por 1 hora.
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEnviado(false)}
                >
                  Enviar novamente
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={solicitarMutation.isPending}
                  className="w-full"
                  style={{ backgroundColor: VITAL_COLORS.turquoise }}
                >
                  {solicitarMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center space-y-2">
              <Link href="/login-indicador" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
