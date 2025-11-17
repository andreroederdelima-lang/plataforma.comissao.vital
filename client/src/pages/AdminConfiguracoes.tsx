import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ComissaoKey = `${string}_${string}_${string}`; // nomePlano_tipoPlano_categoria

export default function AdminConfiguracoes() {
  const { user, loading } = useAuth();
  const { data: configs, isLoading } = trpc.comissaoConfig.list.useQuery();
  
  const [valores, setValores] = useState<Record<ComissaoKey, string>>({});

  const upsertMutation = trpc.comissaoConfig.update.useMutation({
    onSuccess: () => {
      toast.success("Configuração salva com sucesso!");
      trpc.useUtils().comissaoConfig.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar configuração");
    },
  });

  // Carregar valores existentes
  useEffect(() => {
    if (configs) {
      const novosValores: Record<ComissaoKey, string> = {};
      configs.forEach(c => {
        const key: ComissaoKey = `${c.nomePlano}_${c.tipoPlano}_${c.categoria}`;
        novosValores[key] = (c.valorComissao / 100).toFixed(2);
      });
      setValores(novosValores);
    }
  }, [configs]);

  const handleSave = (
    nomePlano: "essencial" | "premium",
    tipoPlano: "familiar" | "individual",
    categoria: "empresarial" | "pessoa_fisica"
  ) => {
    const key: ComissaoKey = `${nomePlano}_${tipoPlano}_${categoria}`;
    const valor = valores[key];
    
    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    // Converter de reais para centavos
    const valorEmCentavos = Math.round(parseFloat(valor) * 100);

    upsertMutation.mutate({
      nomePlano,
      tipoPlano,
      categoria,
      valorComissao: valorEmCentavos,
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
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações de Comissão</h1>
            <p className="text-muted-foreground mt-2">
              Defina os valores de comissão para cada combinação de plano. Os valores serão aplicados automaticamente às novas indicações.
            </p>
          </div>

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
                    const valor = getValor(planoConfig.nomePlano, item.tipoPlano, item.categoria);
                    return (
                      <div key={`${planoConfig.nomePlano}_${item.tipoPlano}_${item.categoria}`} className="space-y-2 p-4 border rounded-lg">
                        <Label className="text-sm font-medium">{item.label}</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              R$
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              value={valor}
                              onChange={(e) => setValor(planoConfig.nomePlano, item.tipoPlano, item.categoria, e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSave(planoConfig.nomePlano, item.tipoPlano, item.categoria)}
                            disabled={upsertMutation.isPending}
                            className="gap-1"
                          >
                            {upsertMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Salvar
                          </Button>
                        </div>
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
