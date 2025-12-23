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

export default function CadastroIndicador() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    senha: "",
    confirmarSenha: "",
    chavePix: "",
  });

  const cadastrarMutation = trpc.authIndicadores.cadastrar.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      setLocation("/login-indicador");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.whatsapp.length < 10) {
      toast.error("WhatsApp inválido");
      return;
    }

    if (!formData.chavePix || formData.chavePix.trim().length === 0) {
      toast.error("Chave PIX é obrigatória");
      return;
    }

    cadastrarMutation.mutate({
      nome: formData.nome,
      email: formData.email,
      whatsapp: formData.whatsapp,
      senha: formData.senha,
      chavePix: formData.chavePix,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2B9C9C]/10 to-[#D4C5A0]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-20 mx-auto cursor-pointer" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Criar Conta</h1>
          <p className="text-muted-foreground mt-1">Programa de Vendedores Vital</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Vendedor</CardTitle>
            <CardDescription>Preencha seus dados para começar a vender e ganhar comissões</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(11) 98765-4321"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX *</Label>
                <Input
                  id="chavePix"
                  type="text"
                  value={formData.chavePix}
                  onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Necessário para receber suas comissões
                </p>
              </div>

              <Button
                type="submit"
                disabled={cadastrarMutation.isPending}
                className="w-full"
                style={{ backgroundColor: VITAL_COLORS.turquoise }}
              >
                {cadastrarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/login-indicador" className="text-[#2B9C9C] hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
              
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Voltar para início
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
