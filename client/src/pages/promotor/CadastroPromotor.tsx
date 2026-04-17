import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { APP_LOGO } from "@/const";

const VITAL = { turquoise: "#2B9C9C" };

export default function CadastroPromotor() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    senha: "",
    confirmarSenha: "",
    chavePix: "",
  });

  const cadastrar = trpc.authIndicadores.cadastrar.useMutation({
    onSuccess: () => {
      toast.success("Cadastro feito! Faça login para continuar.");
      setLocation("/login");
    },
    onError: (err) => toast.error(err.message || "Erro ao cadastrar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("WhatsApp inválido");
      return;
    }
    if (!form.chavePix.trim()) {
      toast.error("Chave PIX é obrigatória (usada caso você escolha receber via PIX)");
      return;
    }

    cadastrar.mutate({
      nome: form.nome,
      email: form.email,
      whatsapp: form.whatsapp,
      senha: form.senha,
      chavePix: form.chavePix,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-20 mx-auto cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Criar Conta</h1>
          <p className="text-muted-foreground mt-1">Programa de Promotores Vital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seus dados</CardTitle>
            <CardDescription>
              Dois minutos pra preencher. A chave PIX é pedida agora porque é usada
              quando você escolher receber em dinheiro ao invés de mensalidade grátis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="(47) 99999-9999"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={form.confirmarSenha}
                  onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                  placeholder="Repita a senha"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX *</Label>
                <Input
                  id="chavePix"
                  value={form.chavePix}
                  onChange={(e) => setForm({ ...form, chavePix: e.target.value })}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Usada só se você escolher receber em PIX em vez de mensalidade grátis.
                </p>
              </div>

              <Button
                type="submit"
                disabled={cadastrar.isPending}
                className="w-full text-white"
                style={{ backgroundColor: VITAL.turquoise }}
              >
                {cadastrar.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link href="/login" className="text-[#2B9C9C] hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
