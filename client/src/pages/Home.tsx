import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, LogOut, Menu, UserCircle, X } from "lucide-react";
import { NotificationBadge } from "@/components/NotificationBadge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useSearch } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nomeIndicado, setNomeIndicado] = useState("");
  const [whatsappIndicado, setWhatsappIndicado] = useState("");
  const [nomePlano, setNomePlano] = useState<"essencial" | "premium">("essencial");
  const [tipoPlano, setTipoPlano] = useState<"familiar" | "individual">("individual");
  const [categoria, setCategoria] = useState<"empresarial" | "pessoa_fisica">("pessoa_fisica");
  const [observacoes, setObservacoes] = useState("");
  
  // Campos específicos para venda
  const [dataVenda, setDataVenda] = useState("");
  const [dataAproximada, setDataAproximada] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<"pix" | "cartao">("pix");
  
  // Tipo de cadastro (venda ou indicação) - agora controlado por estado local
  const [tipoCadastro, setTipoCadastro] = useState<"venda" | "indicacao">("indicacao");
  const isVenda = tipoCadastro === "venda";

  const utils = trpc.useUtils();
  
  // Carregar valores dos planos do banco
  const { data: configuracoesGerais } = trpc.configuracoesGerais.getConfiguracoes.useQuery();
  
  // Valor do plano é calculado automaticamente no backend baseado nas configurações
  
  const createMutation = trpc.indicacoes.create.useMutation({
    onSuccess: () => {
      toast.success("CADASTRO CONCLUÍDO");
      // Limpar formulário
      setNomeIndicado("");
      setWhatsappIndicado("");
      setNomePlano("essencial");
      setTipoPlano("individual");
      setCategoria("pessoa_fisica");
      setObservacoes("");
      // Limpar campos
      setDataVenda("");
      setDataAproximada("");
      setCpfCliente("");
      setFormaPagamento("pix");
      utils.indicacoes.listMine.invalidate();
      // Atualizar página após pequeno delay para mostrar toast
      setTimeout(() => window.location.reload(), 1500);
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
    
    // Validar CPF (sempre obrigatório)
    if (!cpfCliente) {
      toast.error("Por favor, preencha o CPF do cliente");
      return;
    }
    
    // Validar campos de venda se for venda
    if (isVenda && !dataVenda) {
      toast.error("Por favor, preencha a data da venda");
      return;
    }
    
    if (isVenda && !formaPagamento) {
      toast.error("Por favor, selecione a forma de pagamento");
      return;
    }

    createMutation.mutate({
      nomeIndicado,
      whatsappIndicado,
      nomePlano,
      tipoPlano,
      categoria,
      observacoes,
      tipo: tipoCadastro, // Enviar tipo: "venda" ou "indicacao"
      cpfCliente, // CPF sempre obrigatório
      // Enviar campos de venda se for venda
      ...(isVenda && {
        dataVenda,
        formaPagamento,
      }),
      // Enviar data aproximada se for indicação
      ...(!isVenda && dataAproximada && {
        dataAproximada,
      }),
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
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <img src={APP_LOGO} alt="Sua Saúde Vital" className="h-12 md:h-16 flex-shrink-0" />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-bold text-foreground">Sua Saúde Vital</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Plataforma de Comissionamento</p>
              </div>
            </div>
            
            {/* Botão de Acesso */}
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" asChild>
                  <a href="/login-indicador">🔐 Área Restrita</a>
                </Button>
              </div>
            )}
            
            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                <NotificationBadge />
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/minhas-indicacoes">
                    <Button variant="ghost" size="sm">Vendas e Indicações</Button>
                  </Link>
                  <Link href="/perfil">
                    <Button variant="ghost" size="sm">Meu Perfil</Button>
                  </Link>
                </div>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="default" size="sm">
                      Painel Admin
                    </Button>
                  </Link>
                )}
                {(user.role === "promotor" || user.role === "comercial") && (
                  <Link href="/admin">
                    <Button variant="default" size="sm">
                      Painel
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isAuthenticated && user && mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container py-4 space-y-2">
            <Link href="/minhas-indicacoes">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                Vendas e Indicações
              </Button>
            </Link>
            <Link href="/perfil">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                Meu Perfil
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { logout(); setMobileMenuOpen(false); }}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-8 max-w-4xl">
        {!isAuthenticated ? (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Boas-vindas Promotor e/ou Vendedor!</CardTitle>
              <CardDescription className="space-y-2">
                <p>Faça login para começar a registrar suas indicações</p>
                <p className="text-xs text-muted-foreground/70">
                  <span className="font-medium">Promotor:</span> Indica clientes e recebe comissão por vendas fechadas. 
                  <span className="font-medium ml-2">Vendedor:</span> Fecha vendas e gerencia o processo comercial.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Button size="lg" asChild>
                <a href="/login-indicador">Fazer Login</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Cadastrar Venda ou Indicação</CardTitle>
                <CardDescription className="text-base space-y-2">
                  <p className="font-semibold text-green-600">💰 VENDA DIRETA: Ganhe 100% da comissão fechando a venda completa!</p>
                  <p className="text-sm">Ou apenas indique e ganhe comissão quando nossa equipe fechar a venda</p>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Seletor de Tipo de Cadastro */}
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Tipo de Cadastro</Label>
                  <RadioGroup
                    value={tipoCadastro}
                    onValueChange={(value) => setTipoCadastro(value as "venda" | "indicacao")}
                    className="grid grid-cols-2 gap-4"
                  >
                    <Label
                      htmlFor="indicacao"
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        tipoCadastro === "indicacao"
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="indicacao" id="indicacao" className="sr-only" />
                      <div className="text-3xl mb-2">📝</div>
                      <div className="font-semibold">Indicação</div>
                      <div className="text-xs text-center text-muted-foreground mt-1">
                        Ganhe comissão quando fecharmos
                      </div>
                    </Label>
                    <Label
                      htmlFor="venda"
                      className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        tipoCadastro === "venda"
                          ? "border-green-600 bg-green-50"
                          : "border-muted hover:border-green-600/50"
                      }`}
                    >
                      <RadioGroupItem value="venda" id="venda" className="sr-only" />
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="font-semibold text-green-700">Venda Direta</div>
                      <div className="text-xs text-center text-green-600 mt-1">
                        Ganhe 100% da comissão!
                      </div>
                    </Label>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo de Cadastro */}
                  <div className="space-y-3 p-4 border-2 rounded-lg bg-primary/5">
                    <Label className="text-base font-bold text-primary">Tipo de Cadastro *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Escolha se você está <strong>indicando</strong> uma pessoa para nossa equipe entrar em contato, ou se já <strong>fechou a venda</strong> diretamente.
                    </p>
                    <RadioGroup
                      value={tipoCadastro}
                      onValueChange={(value) => setTipoCadastro(value as "venda" | "indicacao")}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start space-x-2 p-4 border-2 rounded-lg hover:bg-accent/10 cursor-pointer bg-white">
                        <RadioGroupItem value="indicacao" id="indicacao" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="indicacao" className="cursor-pointer font-bold text-lg">
                            📝 Indicação
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Você indica o contato e <strong>nossa equipe fecha a venda</strong>. Comissão dividida conforme Lead Quente/Frio.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-4 border-2 rounded-lg hover:bg-accent/10 cursor-pointer bg-white border-green-500">
                        <RadioGroupItem value="venda" id="venda" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="venda" className="cursor-pointer font-bold text-lg text-green-700">
                            🎯 Venda Direta (100% comissão)
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Você <strong>já fechou a venda</strong> completa. Recebe <strong className="text-green-700">100% da comissão</strong>!
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base font-semibold">
                      Nome Completo da Pessoa (Indicada ou Compradora) *
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
                      WhatsApp da Pessoa (Indicada ou Compradora) *
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

                  {/* CPF */}
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-base font-semibold">
                      CPF do Cliente *
                    </Label>
                    <Input
                      id="cpf"
                      value={cpfCliente}
                      onChange={(e) => setCpfCliente(e.target.value)}
                      placeholder="Ex: 000.000.000-00"
                      required
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      O CPF é usado para conferência e auditoria das vendas/indicações
                    </p>
                  </div>

                  {/* Nome do Plano */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Tipo de Plano *</Label>
                    <RadioGroup
                      value={nomePlano}
                      onValueChange={(value) => setNomePlano(value as "essencial" | "premium")}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="essencial" id="essencial" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="essencial" className="cursor-pointer font-semibold">
                            Essencial
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plano básico com cobertura essencial
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="premium" id="premium" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="premium" className="cursor-pointer font-semibold">
                            Premium
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plano completo com cobertura ampliada
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Tipo de Assinatura */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Tipo de Assinatura *</Label>
                    <RadioGroup
                      value={tipoPlano}
                      onValueChange={(value) => setTipoPlano(value as "familiar" | "individual")}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="individual" id="individual" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="individual" className="cursor-pointer font-semibold">
                            Individual
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cobertura para 1 pessoa
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="familiar" id="familiar" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="familiar" className="cursor-pointer font-semibold">
                            Familiar
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cobertura para até 4 pessoas
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Categoria */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Categoria *</Label>
                    <RadioGroup
                      value={categoria}
                      onValueChange={(value) => setCategoria(value as "empresarial" | "pessoa_fisica")}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="pessoa_fisica" id="pessoa_fisica" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="pessoa_fisica" className="cursor-pointer font-semibold">
                            Pessoa Física
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plano individual ou familiar para pessoa física
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                        <RadioGroupItem value="empresarial" id="empresarial" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="empresarial" className="cursor-pointer font-semibold">
                            Empresarial
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Plano negociado com gestor da empresa (Essencial ou Premium)
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Campo CPF (opcional para ambos) */}
                  <div className="space-y-2">
                    <Label htmlFor="cpfCliente" className="text-base font-semibold">
                      CPF do Cliente (opcional)
                    </Label>
                    <Input
                      id="cpfCliente"
                      type="text"
                      value={cpfCliente}
                      onChange={(e) => setCpfCliente(e.target.value)}
                      placeholder="000.000.000-00"
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Para conferência e auditoria
                    </p>
                  </div>

                  {/* Campos específicos para VENDA */}
                  {isVenda && (
                    <div className="space-y-2">
                      <Label htmlFor="dataVenda" className="text-base font-semibold">
                        Data da Venda *
                      </Label>
                      <Input
                        id="dataVenda"
                        type="date"
                        value={dataVenda}
                        onChange={(e) => setDataVenda(e.target.value)}
                        required={isVenda}
                        className="text-base"
                      />
                    </div>
                  )}

                  {/* Campo data aproximada para INDICAÇÕES */}
                  {!isVenda && (
                    <div className="space-y-2">
                      <Label htmlFor="dataAproximada" className="text-base font-semibold">
                        Data Aproximada (opcional)
                      </Label>
                      <Input
                        id="dataAproximada"
                        type="date"
                        value={dataAproximada}
                        onChange={(e) => setDataAproximada(e.target.value)}
                        className="text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Para referência e acompanhamento
                      </p>
                    </div>
                  )}

                  {/* Observações - apenas para indicações */}
                  {/* Campos específicos para VENDA DIRETA */}
                  {isVenda && (
                    <div className="space-y-4 p-4 border-2 border-green-500 rounded-lg bg-green-50">
                      <h3 className="font-bold text-green-700 text-lg">🎯 Dados da Venda Direta</h3>
                      
                      {/* Data da Venda */}
                      <div className="space-y-2">
                        <Label htmlFor="dataVenda" className="text-base font-semibold">
                          Data da Venda *
                        </Label>
                        <Input
                          id="dataVenda"
                          type="date"
                          value={dataVenda}
                          onChange={(e) => setDataVenda(e.target.value)}
                          required
                          className="text-base"
                        />
                      </div>

                      {/* Forma de Pagamento */}
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Forma de Pagamento *</Label>
                        <RadioGroup
                          value={formaPagamento}
                          onValueChange={(value) => setFormaPagamento(value as "pix" | "cartao")}
                          className="flex flex-col gap-3"
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-white cursor-pointer">
                            <RadioGroupItem value="pix" id="pix" />
                            <Label htmlFor="pix" className="cursor-pointer font-semibold flex-1">
                              💳 PIX
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-white cursor-pointer">
                            <RadioGroupItem value="cartao" id="cartao" />
                            <Label htmlFor="cartao" className="cursor-pointer font-semibold flex-1">
                              💳 Cartão de Crédito
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}

                  {/* Campo Data Aproximada para INDICAÇÃO */}
                  {!isVenda && (
                    <div className="space-y-2">
                      <Label htmlFor="dataAproximada" className="text-base font-semibold">
                        Data Aproximada (opcional)
                      </Label>
                      <Input
                        id="dataAproximada"
                        type="date"
                        value={dataAproximada}
                        onChange={(e) => setDataAproximada(e.target.value)}
                        className="text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Data aproximada da indicação, para referência
                      </p>
                    </div>
                  )}

                  {/* Observações */}
                  {!isVenda && (
                    <div className="space-y-2">
                      <Label htmlFor="observacoes" className="text-base font-semibold">
                        Observações
                      </Label>
                      <Textarea
                        id="observacoes"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Exemplos: Tem 5 filhos pequenos e um marido | Quer dar para empregada doméstica e avó | Tem mãe acamada | Nome da empresa (se empresarial)"
                        rows={4}
                        className="text-base resize-none"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className={`w-full text-base ${
                      isVenda ? "bg-green-600 hover:bg-green-700" : ""
                    }`}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : isVenda ? (
                      "🎯 Cadastrar Venda"
                    ) : (
                      "📝 Enviar Indicação"
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
          <p>© 2024 Sua Saúde Vital - Plataforma de Comissionamento</p>
        </div>
      </footer>
    </div>
  );
}
