import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, ThermometerSnowflake, Flame } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function ClassificarLead() {
  const { user, loading: authLoading } = useAuth();
  const [, params] = useRoute("/classificar-lead/:id");
  const [, setLocation] = useLocation();
  
  const indicacaoId = params?.id ? parseInt(params.id) : null;

  const { data: indicacao, isLoading } = trpc.indicacoes.getById.useQuery(
    { id: indicacaoId! },
    { enabled: !!indicacaoId }
  );

  const [classificacao, setClassificacao] = useState<"quente" | "frio" | "">("");
  const [observacoes, setObservacoes] = useState("");

  const classificarMutation = trpc.indicacoes.classificarLead.useMutation({
    onSuccess: () => {
      toast.success("Lead classificado com sucesso!");
      setLocation("/vendedor");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao classificar lead");
    },
  });

  const handleSubmit = () => {
    if (!classificacao) {
      toast.error("Selecione a classificação do lead");
      return;
    }

    if (!indicacaoId) {
      toast.error("ID da indicação inválido");
      return;
    }

    classificarMutation.mutate({
      id: indicacaoId,
      classificacao,
      observacoes: observacoes.trim() || undefined,
    });
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || (user.role !== "comercial" && user.role !== "admin")) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Acesso restrito a comerciais e administradores
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!indicacao) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Indicação não encontrada
              </p>
              <Button
                onClick={() => setLocation("/vendedor")}
                className="w-full mt-4"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Se já foi classificado
  if (indicacao.classificacaoLead) {
    return (
      <AdminLayout>
        <div className="container py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Lead Já Classificado</CardTitle>
              <CardDescription>
                Este lead já foi classificado anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente</Label>
                <p className="text-lg font-medium">{indicacao.nomeIndicado}</p>
              </div>
              <div>
                <Label>Classificação Atual</Label>
                <div className="flex items-center gap-2 mt-1">
                  {indicacao.classificacaoLead === "quente" ? (
                    <>
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-orange-600">Lead Quente</span>
                    </>
                  ) : (
                    <>
                      <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-blue-600">Lead Frio</span>
                    </>
                  )}
                </div>
              </div>
              {indicacao.dataClassificacao && (
                <div>
                  <Label>Data da Classificação</Label>
                  <p>{new Date(indicacao.dataClassificacao).toLocaleDateString("pt-BR")}</p>
                </div>
              )}
              <Button
                onClick={() => setLocation("/vendedor")}
                className="w-full"
              >
                Voltar para Painel
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Classificar Lead</CardTitle>
            <CardDescription>
              Classifique o lead para definir a divisão de comissão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações da Indicação */}
            <div className="space-y-2">
              <Label>Cliente Indicado</Label>
              <p className="text-lg font-medium">{indicacao.nomeIndicado}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>WhatsApp</Label>
                <p className="text-sm">{indicacao.whatsappIndicado}</p>
              </div>
              <div>
                <Label>Plano</Label>
                <p className="text-sm capitalize">
                  {indicacao.nomePlano} - {indicacao.tipoPlano}
                </p>
              </div>
            </div>

            {indicacao.observacoes && (
              <div>
                <Label>Observações do Indicador</Label>
                <p className="text-sm text-muted-foreground">{indicacao.observacoes}</p>
              </div>
            )}

            <div className="border-t pt-6" />

            {/* Classificação do Lead */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Como você classifica este lead?
              </Label>

              <RadioGroup value={classificacao} onValueChange={(value) => setClassificacao(value as "quente" | "frio")}>
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-orange-300 transition cursor-pointer">
                  <RadioGroupItem value="quente" id="quente" />
                  <div className="flex-1">
                    <label htmlFor="quente" className="flex items-center gap-2 cursor-pointer">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-orange-600">Lead Quente</span>
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliente interessado, com orçamento, pronto para comprar. Processo de venda simples.
                    </p>
                    <p className="text-xs text-orange-600 font-medium mt-2">
                      Comissão: Indicador 70% / Vendedor 30%
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:border-blue-300 transition cursor-pointer">
                  <RadioGroupItem value="frio" id="frio" />
                  <div className="flex-1">
                    <label htmlFor="frio" className="flex items-center gap-2 cursor-pointer">
                      <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-blue-600">Lead Frio</span>
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliente com objeções, sem conhecimento prévio, processo de venda complexo.
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-2">
                      Comissão: Indicador 30% / Vendedor 70%
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Observações do Vendedor */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">
                Observações sobre o Atendimento (Opcional)
              </Label>
              <Textarea
                id="observacoes"
                placeholder="Ex: Cliente tinha dúvidas sobre cobertura, precisou de 3 reuniões..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation("/vendedor")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={classificarMutation.isPending || !classificacao}
                className="flex-1"
              >
                {classificarMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar Classificação"
                )}
              </Button>
            </div>

            {/* Aviso */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>⚠️ Atenção:</strong> A classificação do lead define automaticamente como a comissão será dividida entre você e o indicador. Esta ação não pode ser desfeita.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
