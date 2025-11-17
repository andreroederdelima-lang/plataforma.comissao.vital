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

export default function AdminConfiguracoes() {
  const { user, loading } = useAuth();
  const { data: configs, isLoading } = trpc.comissaoConfig.list.useQuery();
  
  const [valorFamiliar, setValorFamiliar] = useState("");
  const [valorIndividual, setValorIndividual] = useState("");

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
      const familiar = configs.find(c => c.tipoPlano === "familiar");
      const individual = configs.find(c => c.tipoPlano === "individual");
      
      if (familiar) {
        setValorFamiliar((familiar.valorComissao / 100).toFixed(2));
      }
      if (individual) {
        setValorIndividual((individual.valorComissao / 100).toFixed(2));
      }
    }
  }, [configs]);

  const handleSave = (tipoPlano: "familiar" | "individual") => {
    const valor = tipoPlano === "familiar" ? valorFamiliar : valorIndividual;
    
    if (!valor || parseFloat(valor) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    // Converter de reais para centavos
    const valorEmCentavos = Math.round(parseFloat(valor) * 100);

    upsertMutation.mutate({
      tipoPlano,
      valorComissao: valorEmCentavos,
    });
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

  return (
    <AdminLayout>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações de Comissão</h1>
            <p className="text-muted-foreground mt-2">
              Defina os valores de comissão para cada tipo de plano. Os valores serão aplicados automaticamente às novas indicações.
            </p>
          </div>

          {/* Plano Familiar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                Plano Familiar
              </CardTitle>
              <CardDescription>
                Valor da comissão para vendas de planos familiares
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor-familiar">Valor da Comissão (R$)</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="valor-familiar"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={valorFamiliar}
                      onChange={(e) => setValorFamiliar(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave("familiar")}
                    disabled={upsertMutation.isPending}
                    className="gap-2"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exemplo: Digite 100.00 para R$ 100,00
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plano Individual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Plano Individual
              </CardTitle>
              <CardDescription>
                Valor da comissão para vendas de planos individuais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="valor-individual">Valor da Comissão (R$)</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="valor-individual"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={valorIndividual}
                      onChange={(e) => setValorIndividual(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave("individual")}
                    disabled={upsertMutation.isPending}
                    className="gap-2"
                  >
                    {upsertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Exemplo: Digite 50.00 para R$ 50,00
                </p>
              </div>
            </CardContent>
          </Card>

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
