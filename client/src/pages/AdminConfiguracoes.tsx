import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ComissaoKey = `${string}_${string}_${string}`; // nomePlano_tipoPlano_categoria

export default function AdminConfiguracoes() {
  const { user, loading } = useAuth();
  const { data: configs, isLoading } = trpc.comissaoConfig.list.useQuery();
  const utils = trpc.useUtils();
  
  const [valores, setValores] = useState<Record<ComissaoKey, string>>({});
  const [valoresBase, setValoresBase] = useState<Record<ComissaoKey, string>>({});
  const [percentuais, setPercentuais] = useState<Record<ComissaoKey, string>>({});
  
  // Estados para percentuais de comissão
  const [percentualQuenteIndicador, setPercentualQuenteIndicador] = useState("70");
  const [percentualQuenteVendedor, setPercentualQuenteVendedor] = useState("30");
  const [percentualFrioIndicador, setPercentualFrioIndicador] = useState("30");
  const [percentualFrioVendedor, setPercentualFrioVendedor] = useState("70");
  
  // Estados para configurações gerais
  const [linkCheckoutBase, setLinkCheckoutBase] = useState("");
  const [diasCancelamento, setDiasCancelamento] = useState("7");
  

  
  // Estados para WhatsApp
  const [whatsappNumero, setWhatsappNumero] = useState("");
  const [whatsappMensagem, setWhatsappMensagem] = useState("Olá! Gostaria de conhecer os planos Vital.");
  
  const { data: configsGerais } = trpc.configuracoesGerais.getConfiguracoes.useQuery();
  const atualizarLinkMutation = trpc.configuracoesGerais.atualizarLinkBase.useMutation({
    onSuccess: () => {
      toast.success("Link de checkout atualizado!");
      utils.configuracoesGerais.getConfiguracoes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar link");
    },
  });
  
  const atualizarDiasMutation = trpc.configuracoesGerais.atualizarDiasCancelamento.useMutation({
    onSuccess: () => {
      toast.success("Período de cancelamento atualizado!");
      utils.configuracoesGerais.getConfiguracoes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar período");
    },
  });
  

  
  const atualizarWhatsAppMutation = trpc.configuracoesGerais.atualizarWhatsApp.useMutation({
    onSuccess: () => {
      toast.success("Configurações de WhatsApp atualizadas!");
      utils.configuracoesGerais.getConfiguracoes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar WhatsApp");
    },
  });
  
  const { data: configsComissao } = trpc.comissoes.listarConfiguracoes.useQuery();
  const atualizarConfigMutation = trpc.comissoes.atualizarConfiguracao.useMutation({
    onSuccess: () => {
      toast.success("Percentuais de comissão atualizados!");
      utils.comissoes.listarConfiguracoes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar percentuais");
    },
  });

  const upsertMutation = trpc.comissaoConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração salva com sucesso!");
      utils.comissaoConfig.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar configuração");
    },
  });

  // Carregar configurações gerais
  useEffect(() => {
    if (configsGerais) {
      setLinkCheckoutBase(configsGerais.linkCheckoutBase || "");
      setDiasCancelamento(String(configsGerais.diasCancelamentoGratuito));

      setWhatsappNumero(configsGerais.whatsappNumero || "");
      setWhatsappMensagem(configsGerais.whatsappMensagem || "Olá! Gostaria de conhecer os planos Vital.");
    }
  }, [configsGerais]);
  
  // Carregar percentuais de comissão
  useEffect(() => {
    if (configsComissao) {
      const configQuente = configsComissao.find((c: any) => c.tipoLead === 'quente');
      const configFrio = configsComissao.find((c: any) => c.tipoLead === 'frio');
      
      if (configQuente) {
        setPercentualQuenteIndicador(String(configQuente.percentualIndicador));
        setPercentualQuenteVendedor(String(configQuente.percentualVendedor));
      }
      if (configFrio) {
        setPercentualFrioIndicador(String(configFrio.percentualIndicador));
        setPercentualFrioVendedor(String(configFrio.percentualVendedor));
      }
    }
  }, [configsComissao]);
  
  // Carregar valores existentes
  useEffect(() => {
    if (configs) {
      const novosValores: Record<ComissaoKey, string> = {};
      const novosValoresBase: Record<ComissaoKey, string> = {};
      const novosPercentuais: Record<ComissaoKey, string> = {};
      
      configs.forEach(c => {
        const key: ComissaoKey = `${c.nomePlano}_${c.tipoPlano}_${c.categoria}`;
        novosValores[key] = (c.valorComissao / 100).toFixed(2);
        novosValoresBase[key] = c.valorBase ? (c.valorBase / 100).toFixed(2) : "0.00";
        novosPercentuais[key] = c.percentualComissao?.toString() || "0";
      });
      
      setValores(novosValores);
      setValoresBase(novosValoresBase);
      setPercentuais(novosPercentuais);
    }
  }, [configs]);

  const handleSave = (
    nomePlano: "essencial" | "premium",
    tipoPlano: "familiar" | "individual",
    categoria: "empresarial" | "pessoa_fisica"
  ) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    const valorBase = valoresBase[key];
    const percentual = percentuais[key];
    
    if (!valorBase || parseFloat(valorBase) <= 0) {
      toast.error("Digite um valor base válido");
      return;
    }
    
    if (!percentual || parseFloat(percentual) < 0 || parseFloat(percentual) > 100) {
      toast.error("Digite um percentual válido (0-100)");
      return;
    }

    // Converter de reais para centavos
    const valorBaseEmCentavos = Math.round(parseFloat(valorBase) * 100);
    const percentualNum = parseFloat(percentual);

    upsertMutation.mutate({
      nomePlano,
      tipoPlano,
      categoria,
      valorBase: valorBaseEmCentavos,
      percentualComissao: percentualNum,
    });
  };

  const getValor = (nomePlano: string, tipoPlano: string, categoria: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    return valores[key] || "";
  };

  const setValor = (nomePlano: string, tipoPlano: string, categoria: string, value: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    setValores(prev => ({ ...prev, [key]: value }));
  };
  
  const getValorBase = (nomePlano: string, tipoPlano: string, categoria: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    return valoresBase[key] || "";
  };

  const setValorBase = (nomePlano: string, tipoPlano: string, categoria: string, value: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    setValoresBase(prev => ({ ...prev, [key]: value }));
  };
  
  const getPercentual = (nomePlano: string, tipoPlano: string, categoria: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    return percentuais[key] || "";
  };

  const setPercentual = (nomePlano: string, tipoPlano: string, categoria: string, value: string) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    setPercentuais(prev => ({ ...prev, [key]: value }));
  };
  
  const calcularComissao = (nomePlano: string, tipoPlano: string, categoria: string) => {
    const valorBase = getValorBase(nomePlano, tipoPlano, categoria);
    const percentual = getPercentual(nomePlano, tipoPlano, categoria);
    
    if (!valorBase || !percentual) return "0.00";
    
    const base = parseFloat(valorBase);
    const perc = parseFloat(percentual);
    
    if (isNaN(base) || isNaN(perc)) return "0.00";
    
    return ((base * perc) / 100).toFixed(2);
  };

  if (loading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Acesso restrito a administradores
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const planoConfigs = [
    {
      nomePlano: "essencial" as const,
      titulo: "Plano Essencial",
      icon: "🔵",
      items: [
        { tipoPlano: "individual" as const, categoria: "pessoa_fisica" as const, label: "Individual - Pessoa Física" },
        { tipoPlano: "familiar" as const, categoria: "pessoa_fisica" as const, label: "Familiar - Pessoa Física" },
        { tipoPlano: "individual" as const, categoria: "empresarial" as const, label: "Individual - Empresarial" },
        { tipoPlano: "familiar" as const, categoria: "empresarial" as const, label: "Familiar - Empresarial" },
      ]
    },
    {
      nomePlano: "premium" as const,
      titulo: "Plano Premium",
      icon: "⭐",
      items: [
        { tipoPlano: "individual" as const, categoria: "pessoa_fisica" as const, label: "Individual - Pessoa Física" },
        { tipoPlano: "familiar" as const, categoria: "pessoa_fisica" as const, label: "Familiar - Pessoa Física" },
        { tipoPlano: "individual" as const, categoria: "empresarial" as const, label: "Individual - Empresarial" },
        { tipoPlano: "familiar" as const, categoria: "empresarial" as const, label: "Familiar - Empresarial" },
      ]
    },
  ];

  return (
    <AdminLayout>
      <div className="container py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Botão Voltar */}
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Defina os valores de comissão para cada combinação de plano. Os valores serão aplicados automaticamente às novas indicações.
            </p>
          </div>

          {/* Configurações Gerais */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Configure o link base de checkout e o período de cancelamento gratuito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Link Base de Checkout */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔗</span>
                  <h3 className="font-semibold text-lg">Link Base de Checkout</h3>
                </div>
                <div className="space-y-2">
                  <Label>URL Base (sem o código do promotor)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://checkout.exemplo.com/planos"
                      value={linkCheckoutBase}
                      onChange={(e) => setLinkCheckoutBase(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => atualizarLinkMutation.mutate({ linkBase: linkCheckoutBase || "" })}
                      disabled={atualizarLinkMutation.isPending}
                    >
                      {atualizarLinkMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-2">Salvar</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O código do promotor será adicionado automaticamente como parâmetro ?ref=CODIGO
                  </p>
                </div>
              </div>

              {/* Período de Cancelamento Gratuito */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  <h3 className="font-semibold text-lg">Período de Cancelamento Gratuito</h3>
                </div>
                <div className="space-y-2">
                  <Label>Dias de Cancelamento Gratuito</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="365"
                      value={diasCancelamento}
                      onChange={(e) => setDiasCancelamento(e.target.value)}
                      className="w-32"
                    />
                    <Button
                      onClick={() => atualizarDiasMutation.mutate({ dias: parseInt(diasCancelamento) })}
                      disabled={atualizarDiasMutation.isPending}
                    >
                      {atualizarDiasMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="ml-2">Salvar</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Após esse período, a comissão é considerada confirmada e pode ser paga
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Configurações de WhatsApp */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📱</span>
                WhatsApp Comercial
              </CardTitle>
              <CardDescription>
                Configure o número do WhatsApp comercial e a mensagem inicial para o QR Code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Número do WhatsApp (com DDI e DDD)</Label>
                  <Input
                    type="text"
                    placeholder="Ex: 5547999999999"
                    value={whatsappNumero}
                    onChange={(e) => setWhatsappNumero(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: DDI (55) + DDD + Número (sem espaços ou caracteres especiais)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem Inicial</Label>
                  <Input
                    type="text"
                    placeholder="Olá! Gostaria de conhecer os planos Vital."
                    value={whatsappMensagem}
                    onChange={(e) => setWhatsappMensagem(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta mensagem aparecerá automaticamente quando o cliente escanear o QR Code
                  </p>
                </div>
              </div>
              <Button
                onClick={() => atualizarWhatsAppMutation.mutate({
                  numero: whatsappNumero,
                  mensagem: whatsappMensagem,
                })}
                disabled={atualizarWhatsAppMutation.isPending || !whatsappNumero || !whatsappMensagem}
                className="w-full"
              >
                {atualizarWhatsAppMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações de WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Percentuais de Divisão de Comissão */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Percentuais de Divisão de Comissão
              </CardTitle>
              <CardDescription>
                Configure como a comissão é dividida entre promotor e comercial para leads quentes e frios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lead Quente */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <h3 className="font-semibold text-lg">Lead Quente</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Promotor (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentualQuenteIndicador}
                      onChange={(e) => setPercentualQuenteIndicador(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendedor (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentualQuenteVendedor}
                      onChange={(e) => setPercentualQuenteVendedor(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const indicador = parseInt(percentualQuenteIndicador);
                    const vendedor = parseInt(percentualQuenteVendedor);
                    if (indicador + vendedor !== 100) {
                      toast.error("A soma deve ser 100%");
                      return;
                    }
                    atualizarConfigMutation.mutate({
                      tipoLead: 'quente',
                      percentualIndicador: indicador,
                      percentualVendedor: vendedor,
                    });
                  }}
                  disabled={atualizarConfigMutation.isPending}
                  size="sm"
                >
                  {atualizarConfigMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Lead Quente
                </Button>
              </div>

              <div className="border-t" />

              {/* Lead Frio */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❄️</span>
                  <h3 className="font-semibold text-lg">Lead Frio</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Promotor (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentualFrioIndicador}
                      onChange={(e) => setPercentualFrioIndicador(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendedor (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentualFrioVendedor}
                      onChange={(e) => setPercentualFrioVendedor(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const indicador = parseInt(percentualFrioIndicador);
                    const vendedor = parseInt(percentualFrioVendedor);
                    if (indicador + vendedor !== 100) {
                      toast.error("A soma deve ser 100%");
                      return;
                    }
                    atualizarConfigMutation.mutate({
                      tipoLead: 'frio',
                      percentualIndicador: indicador,
                      percentualVendedor: vendedor,
                    });
                  }}
                  disabled={atualizarConfigMutation.isPending}
                  size="sm"
                >
                  {atualizarConfigMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Lead Frio
                </Button>
              </div>

              {/* Explicação */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>⚠️ Importante:</strong> Estes percentuais serão aplicados automaticamente quando o vendedor classificar uma indicação como "quente" ou "fria". A página espelho de comissões (/tabela-comissoes) será atualizada automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cards por tipo de plano */}
          {planoConfigs.map(planoConfig => (
            <Card key={planoConfig.nomePlano}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{planoConfig.icon}</span>
                  {planoConfig.titulo}
                </CardTitle>
                <CardDescription>
                  Configure os valores de comissão para todas as variações do {planoConfig.titulo.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planoConfig.items.map(item => {
                    const valorBase = getValorBase(planoConfig.nomePlano, item.tipoPlano, item.categoria);
                    const percentual = getPercentual(planoConfig.nomePlano, item.tipoPlano, item.categoria);
                    const comissaoCalculada = calcularComissao(planoConfig.nomePlano, item.tipoPlano, item.categoria);
                    
                    return (
                      <div key={`${planoConfig.nomePlano}_${item.tipoPlano}_${item.categoria}`} className="space-y-3 p-4 border rounded-lg bg-card">
                        <Label className="text-sm font-semibold">{item.label}</Label>
                        
                        {/* Valor Base (Mensalidade) */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Valor Base (Mensalidade)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              R$
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={valorBase}
                              onChange={(e) => setValorBase(planoConfig.nomePlano, item.tipoPlano, item.categoria, e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        {/* Percentual de Comissão */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Percentual de Comissão</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={percentual}
                              onChange={(e) => setPercentual(planoConfig.nomePlano, item.tipoPlano, item.categoria, e.target.value)}
                              className="pr-8"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              %
                            </span>
                          </div>
                        </div>
                        
                        {/* Comissão Calculada (Somente Leitura) */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Comissão Resultante</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              R$
                            </span>
                            <Input
                              type="text"
                              value={comissaoCalculada}
                              disabled
                              className="pl-10 bg-muted cursor-not-allowed font-semibold text-green-600"
                            />
                          </div>
                        </div>
                        
                        {/* Botão Salvar */}
                        <Button
                          size="sm"
                          onClick={() => handleSave(planoConfig.nomePlano, item.tipoPlano, item.categoria)}
                          disabled={upsertMutation.isPending}
                          className="w-full gap-1"
                        >
                          {upsertMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                          Salvar Configuração
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Info Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-2xl">💡</div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Como funciona?</p>
                  <p className="text-sm text-muted-foreground">
                    Os valores configurados aqui serão aplicados automaticamente a todas as indicações com status "Venda Fechada". 
                    Você pode visualizar o total de comissões de cada parceiro na página de Comissões.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
