import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Users, Zap } from "lucide-react";

export default function TabelaComissoes() {
  const { data: planos, isLoading: loadingPlanos } = trpc.comissoes.listarPlanos.useQuery();
  const { data: configs, isLoading: loadingConfigs } = trpc.comissoes.listarConfiguracoes.useQuery();

  if (loadingPlanos || loadingConfigs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const configQuente = configs?.find((c: any) => c.tipoLead === 'quente');
  const configFrio = configs?.find((c: any) => c.tipoLead === 'frio');

  const formatarDinheiro = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const calcularComissao = (valorTotal: number, percentual: number) => {
    return formatarDinheiro((valorTotal * percentual) / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <img src={APP_LOGO} alt="Vital Logo" className="h-20" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Tabela de Comissões</h1>
              <p className="text-sm text-gray-600">Veja quanto você pode ganhar indicando Vital</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Banner Destaque: Promotor Pode Vender ou Indicar */}
        <div className="max-w-5xl mx-auto mb-8">
          <Card className="border-4 border-primary shadow-2xl bg-gradient-to-r from-teal-50 to-blue-50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-primary mb-3">
                  🎯 Como Promotor, Você Pode Escolher!
                </h2>
                <p className="text-xl text-gray-700 font-semibold">
                  Você decide como quer ganhar: <span className="text-orange-600">indicando</span> ou <span className="text-green-600 font-bold">vendendo</span>
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Opção 1: Apenas Indicar */}
                <div className="bg-white p-6 rounded-lg border-2 border-orange-300 shadow-md">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">👥</div>
                    <h3 className="text-2xl font-bold text-orange-600 mb-2">Apenas Indicar</h3>
                    <p className="text-sm text-gray-600">Você passa o contato, o comercial fecha</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Menos trabalho</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Comissão dividida com comercial</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span className="font-semibold text-orange-600">Você ganha 30% a 70% da comissão</span>
                    </p>
                  </div>
                </div>

                {/* Opção 2: Vender Diretamente */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-4 border-green-500 shadow-lg relative">
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold shadow-md">
                    🔥 MAIS LUCRATIVO!
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">💰</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Vender Diretamente</h3>
                    <p className="text-sm text-gray-600">Você fecha a venda sozinho</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Cliente finaliza no checkout</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Sem intermediação</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="font-bold text-green-700 text-lg">Você ganha 100% da comissão! 🎉</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-lg text-gray-700">
                  <strong className="text-primary">Dica de Ouro:</strong> Quanto mais você se envolver no processo de venda, 
                  <span className="text-green-600 font-bold"> maior será sua comissão!</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Introdução Motivadora */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            📈 Entenda os 3 Cenários de Comissionamento
          </h2>
          <p className="text-lg text-gray-600">
            Veja abaixo quanto você pode ganhar em cada situação
          </p>
        </div>

        {/* 3 Cenários de Comissionamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Cenário 1: Venda Direta (100%) */}
          <Card className="border-2 border-green-500 shadow-lg">
            <CardHeader className="bg-green-50">
              <div className="flex justify-center mb-2">
                <Zap className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-center text-green-700">
                💯 Venda Direta no Checkout
              </CardTitle>
              <CardDescription className="text-center">
                Você fecha a venda sozinho
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600 mt-2">da comissão para você</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-semibold mb-2">✅ Vantagens:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Processo rápido e simples</li>
                  <li>• Sem intermediação</li>
                  <li>• Comissão integral</li>
                  <li>• Cliente finaliza sozinho</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cenário 2: Lead Quente (70/30) */}
          <Card className="border-2 border-orange-500 shadow-lg">
            <CardHeader className="bg-orange-50">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-12 w-12 text-orange-600" />
              </div>
              <CardTitle className="text-center text-orange-700">
                🔥 Indicação Quente
              </CardTitle>
              <CardDescription className="text-center">
                Cliente interessado e pronto
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div>
                    <div className="text-3xl font-bold text-orange-600">{configQuente?.percentualIndicador}%</div>
                    <div className="text-xs text-gray-600">Você</div>
                  </div>
                  <div className="text-2xl text-gray-400">/</div>
                  <div>
                    <div className="text-3xl font-bold text-gray-500">{configQuente?.percentualVendedor}%</div>
                    <div className="text-xs text-gray-600">Vendedor</div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-semibold mb-2">🔥 Exemplos:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cliente pediu orçamento</li>
                  <li>• Visitou site e preencheu formulário</li>
                  <li>• Já conhece os serviços</li>
                  <li>• Data agendada para apresentação</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cenário 3: Lead Frio (30/70) */}
          <Card className="border-2 border-blue-500 shadow-lg">
            <CardHeader className="bg-blue-50">
              <div className="flex justify-center mb-2">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-center text-blue-700">
                ❄️ Indicação Fria
              </CardTitle>
              <CardDescription className="text-center">
                Cliente com objeções
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{configFrio?.percentualIndicador}%</div>
                    <div className="text-xs text-gray-600">Você</div>
                  </div>
                  <div className="text-2xl text-gray-400">/</div>
                  <div>
                    <div className="text-3xl font-bold text-gray-500">{configFrio?.percentualVendedor}%</div>
                    <div className="text-xs text-gray-600">Vendedor</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 font-semibold mb-2">❄️ Características:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Sem conhecimento prévio</li>
                  <li>• Múltiplas objeções</li>
                  <li>• Processo de venda complexo</li>
                  <li>• Requer apresentação completa</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Observação Importante */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700">
                <strong>⚠️ Observação importante:</strong> Em casos de lead frio ou com múltiplas objeções, 
                as porcentagens de comissão (promotor x comercial) são invertidas. O comercial recebe {configFrio?.percentualVendedor}% 
                e o promotor {configFrio?.percentualIndicador}% devido ao trabalho adicional necessário para fechar a venda.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Planos e Valores */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6">📊 Valores por Plano</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-lg">
              <thead className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
                <tr>
                  <th className="px-4 py-4 text-left">Plano</th>
                  <th className="px-4 py-4 text-right">Preço Mensal</th>
                  <th className="px-4 py-4 text-right bg-green-600">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg">🔥 Venda Direta</span>
                      <span className="text-xs font-normal">(100% para você)</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span>Lead Quente</span>
                      <span className="text-xs font-normal">(Você {configQuente?.percentualIndicador}%)</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span>Lead Frio</span>
                      <span className="text-xs font-normal">(Você {configFrio?.percentualIndicador}%)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {planos?.map((plano: any, index: number) => (
                  <tr key={plano.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-4 font-medium text-gray-900">{plano.nome}</td>
                    <td className="px-4 py-4 text-right text-gray-600">
                      {formatarDinheiro(plano.precoMensal)}
                    </td>
                    <td className="px-4 py-4 text-right bg-green-50 border-l-4 border-green-500">
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-green-600">
                          {formatarDinheiro(plano.bonificacaoPadrao)}
                        </span>
                        <span className="text-xs text-green-700 font-semibold">⭐ MELHOR GANHO</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-orange-600">
                        {calcularComissao(plano.bonificacaoPadrao, configQuente?.percentualIndicador || 70)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-lg font-bold text-blue-600">
                        {calcularComissao(plano.bonificacaoPadrao, configFrio?.percentualIndicador || 30)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legenda Visual */}
          <div className="mt-6 flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700"><strong>Verde:</strong> Você vende = 100% da comissão</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-700"><strong>Laranja:</strong> Lead quente = até 70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700"><strong>Azul:</strong> Lead frio = 30%</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary to-teal-600 text-white">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-2xl font-bold mb-4">🚀 Pronto para Começar a Ganhar?</h3>
              <p className="text-lg mb-6">
                Cadastre-se agora e comece a indicar! Quanto mais você se envolver, mais você ganha.
              </p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/cadastro-indicador" 
                  className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
                >
                  Cadastrar Agora
                </a>
                <a 
                  href="/login-indicador" 
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  Já Tenho Conta
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
