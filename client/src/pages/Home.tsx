import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut, UserCircle } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [nomeIndicado, setNomeIndicado] = useState("");
  const [whatsappIndicado, setWhatsappIndicado] = useState("");
  const [tipoPlano, setTipoPlano] = useState<"familiar" | "individual">("individual");
  const [categoria, setCategoria] = useState<"empresarial" | "pessoa_fisica">("pessoa_fisica");
  const [observacoes, setObservacoes] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.indicacoes.create.useMutation({
    onSuccess: () => {
      toast.success("Indicação enviada com sucesso!");
      // Limpar formulário
      setNomeIndicado("");
      setWhatsappIndicado("");
      setTipoPlano("individual");
      setCategoria("pessoa_fisica");
      setObservacoes("");
      utils.indicacoes.listMine.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar indicação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomeIndicado || !whatsappIndicado) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      nomeIndicado,
      whatsappIndicado,
      tipoPlano,
      categoria,
      observacoes,
    });
  };

  if (loading) {
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
              <p className="text-sm text-muted-foreground">Sistema de Indicações</p>
            </div>
          </div>
          
          {isAuthenticated && user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
              <NotificationBadge />
              <Link href="/minhas-indicacoes">
                <Button variant="outline" size="sm">
                  Minhas Indicações
                </Button>
              </Link>
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
        {!isAuthenticated ? (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo, Parceiro!</CardTitle>
              <CardDescription>
                Faça login para começar a registrar suas indicações
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Registrar Nova Indicação</CardTitle>
                <CardDescription className="text-base">
                  Preencha os dados da pessoa que você está indicando para o plano de assinatura Sua Saúde Vital
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Form */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base font-semibold">
                      Nome Completo da Pessoa Indicada *
                    </Label>
                    <Input
                      id="nome"
                      value={nomeIndicado}
                      onChange={(e) => setNomeIndicado(e.target.value)}
                      placeholder="Ex: João da Silva"
                      required
                      className="text-base"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-base font-semibold">
                      WhatsApp da Pessoa Indicada *
                    </Label>
                    <Input
                      id="whatsapp"
                      value={whatsappIndicado}
                      onChange={(e) => setWhatsappIndicado(e.target.value)}
                      placeholder="Ex: (11) 99999-9999"
                      required
                      className="text-base"
                    />
                  </div>

                  {/* Tipo de Assinatura */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Tipo de Assinatura *</Label>
                    <RadioGroup
                      value={tipoPlano}
                      onValueChange={(value) => setTipoPlano(value as "familiar" | "individual")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="individual" id="individual" />
                        <Label htmlFor="individual" className="cursor-pointer font-normal">
                          Individual
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="familiar" id="familiar" />
                        <Label htmlFor="familiar" className="cursor-pointer font-normal">
                          Familiar
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Categoria *</Label>
                    <RadioGroup
                      value={categoria}
                      onValueChange={(value) => setCategoria(value as "empresarial" | "pessoa_fisica")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pessoa_fisica" id="pessoa_fisica" />
                        <Label htmlFor="pessoa_fisica" className="cursor-pointer font-normal">
                          Pessoa Física
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="empresarial" id="empresarial" />
                        <Label htmlFor="empresarial" className="cursor-pointer font-normal">
                          Empresarial
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-base font-semibold">
                      Observações
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Informações adicionais sobre a indicação..."
                      rows={4}
                      className="text-base resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Indicação"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-sm border-t border-border mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Sua Saúde Vital - Sistema de Indicações de Parceiros</p>
        </div>
      </footer>
    </div>
  );
}
