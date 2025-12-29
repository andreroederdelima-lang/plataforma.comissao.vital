import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, CheckCircle2, DollarSign, Calendar, CreditCard, User } from "lucide-react";

const statusLabels = {
  aguardando_contato: "Aguardando Contato",
  em_negociacao: "Em Negociação",
  venda_com_objecoes: "Venda com Objeções",
  venda_fechada: "Venda Fechada",
  nao_comprou: "Não Comprou",
  cliente_sem_interesse: "Cliente Sem Interesse",
};

const getNomeProdutoCompleto = (nomePlano: string, tipoPlano: string, categoria: string) => {
  const planoLabels: Record<string, string> = { essencial: "Essencial", premium: "Premium" };
  const plano = planoLabels[nomePlano] || nomePlano;
  const tipo = tipoPlano === "familiar" ? "Familiar" : "Individual";
  const pessoas = tipoPlano === "familiar" ? "(até 4 pessoas)" : "(1 pessoa)";
  const cat = categoria === "empresarial" ? " - Empresarial" : "";
  return `${plano} ${tipo} ${pessoas}${cat}`;
};

export default function AdminAprovarComissoes() {
  const [modalAberto, setModalAberto] = useState(false);
  const [indicacaoSelecionada, setIndicacaoSelecionada] = useState<any>(null);
  const [percentualSelecionado, setPercentualSelecionado] = useState<string>("100");

  const { data: pendentes, isLoading, refetch } = trpc.admin.listarPendentesAprovacao.useQuery();

  const aprovarMutation = trpc.admin.aprovarComissao.useMutation({
    onSuccess: (data) => {
      toast.success(`Comissão aprovada! Valor: R$ ${(data.valorComissao / 100).toFixed(2)}`);
      setModalAberto(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar comissão");
    },
  });

  const abrirModal = (indicacao: any) => {
    setIndicacaoSelecionada(indicacao);
    // Definir percentual padrão baseado no tipo
    const isVenda = indicacao.dataVenda !== null;
    setPercentualSelecionado(isVenda ? "100" : "50");
    setModalAberto(true);
  };

  const confirmarAprovacao = () => {
    if (!indicacaoSelecionada) return;

    aprovarMutation.mutate({
      indicacaoId: indicacaoSelecionada.id,
      percentualComissao: parseInt(percentualSelecionado),
    });
  };

  const calcularValorComissao = () => {
    if (!indicacaoSelecionada?.valorPlano) return 0;
    return (indicacaoSelecionada.valorPlano * parseInt(percentualSelecionado)) / 100;
  };

  const formatarData = (data: Date | null) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const calcularDiasDesdeVenda = (dataVenda: Date | null) => {
    if (!dataVenda) return 0;
    return Math.floor((Date.now() - new Date(dataVenda).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2B9C9C]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprovar Comissões</h1>
        <p className="text-muted-foreground mt-2">
          Vendas e indicações pendentes de aprovação (após período de carência de 7 dias)
        </p>
      </div>

      {!pendentes || pendentes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Nenhuma comissão pendente</p>
            <p className="text-muted-foreground mt-2">
              Todas as vendas foram aprovadas ou ainda estão no período de carência
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendentes.map((indicacao) => {
            const isVenda = indicacao.dataVenda !== null;
            const diasDesdeVenda = calcularDiasDesdeVenda(indicacao.dataVenda);

            return (
              <Card key={indicacao.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {isVenda ? (
                          <span className="text-2xl">💰</span>
                        ) : (
                          <span className="text-2xl">📝</span>
                        )}
                        {indicacao.nomeIndicado}
                      </CardTitle>

                    </div>
                    <Badge variant="outline" className="text-sm">
                      {getNomeProdutoCompleto(indicacao.nomePlano, indicacao.tipoPlano, indicacao.categoria)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dados da Venda */}
                  {isVenda && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-700">
                          <Calendar className="h-4 w-4" />
                          Data da Venda:
                        </span>
                        <span className="font-semibold">{formatarData(indicacao.dataVenda)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          Valor do Plano:
                        </span>
                        <span className="font-semibold text-lg text-green-700">
                          R$ {((indicacao.valorPlano || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-700">
                          <CreditCard className="h-4 w-4" />
                          Pagamento:
                        </span>
                        <span className="font-semibold uppercase">{indicacao.formaPagamento}</span>
                      </div>
                      <div className="pt-2 border-t border-green-300">
                        <p className="text-xs text-green-700 font-medium">
                          ✅ {diasDesdeVenda} dias desde a venda (período de carência cumprido)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botão de Aprovação */}
                  <Button
                    onClick={() => abrirModal(indicacao)}
                    className="w-full bg-[#2B9C9C] hover:bg-[#2B9C9C]/90"
                    size="lg"
                  >
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Aprovar Comissão
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Aprovação */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Aprovar Comissão</DialogTitle>
            <DialogDescription>
              Defina o percentual da comissão para {indicacaoSelecionada?.nomeIndicado}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações da Venda */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Produto:</span>
                <span className="font-medium">
                  {indicacaoSelecionada &&
                    getNomeProdutoCompleto(
                      indicacaoSelecionada.nomePlano,
                      indicacaoSelecionada.tipoPlano,
                      indicacaoSelecionada.categoria
                    )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor do Plano:</span>
                <span className="font-semibold text-lg">
                  R$ {((indicacaoSelecionada?.valorPlano || 0) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Seletor de Percentual */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Percentual da Comissão</Label>
              <RadioGroup value={percentualSelecionado} onValueChange={setPercentualSelecionado}>
                {/* Venda Direta - 100% */}
                {indicacaoSelecionada?.dataVenda && (
                  <div className="flex items-start space-x-2 p-3 border-2 border-green-500 bg-green-50 rounded-lg">
                    <RadioGroupItem value="100" id="p100" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="p100" className="cursor-pointer font-semibold text-green-700">
                        💰 Venda Direta - 100%
                      </Label>
                      <p className="text-xs text-green-600 mt-1">
                        Vendedor fechou a venda diretamente
                      </p>
                    </div>
                  </div>
                )}

                {/* Indicação - Cliente Pronto - 50% */}
                {!indicacaoSelecionada?.dataVenda && (
                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value="50" id="p50" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="p50" className="cursor-pointer font-semibold">
                        📝 Cliente Pronto - 50%
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliente veio pronto para comprar
                      </p>
                    </div>
                  </div>
                )}

                {/* Indicação - Venda Difícil - 30% */}
                {!indicacaoSelecionada?.dataVenda && (
                  <div className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value="30" id="p30" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="p30" className="cursor-pointer font-semibold">
                        🔨 Venda Difícil - 30%
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vendedor Vital teve muita dificuldade para fechar
                      </p>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Valor Calculado */}
            <div className="bg-[#2B9C9C]/10 border-2 border-[#2B9C9C] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Valor da Comissão:</span>
                <span className="text-2xl font-bold text-[#2B9C9C]">
                  R$ {(calcularValorComissao() / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {percentualSelecionado}% de R$ {((indicacaoSelecionada?.valorPlano || 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarAprovacao}
              disabled={aprovarMutation.isPending}
              className="bg-[#2B9C9C] hover:bg-[#2B9C9C]/90"
            >
              {aprovarMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprovando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirmar Aprovação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
