import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";

/**
 * Página de boas-vindas para promotores e vendedores
 * Explica os papéis e direciona para login
 */
export default function BoasVindasIndicadores() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <img src={APP_LOGO} alt="Vital" className="h-20" />
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e9d9f]">
                Sistema de Indicações
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <h2 className="text-3xl font-bold" style={{ color: '#2B9C9C' }}>
              Indicar a Vital é simples, seguro e agora recompensa você.
            </h2>
            
            <div className="space-y-4 text-left">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Se você já conhece a qualidade do <strong>Hospital Censit</strong>, o atendimento da <strong>equipe Vital</strong> e a tranquilidade de ter <strong>saúde acessível 24h</strong>, por que não compartilhar essa experiência com quem você gosta?
              </p>

              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Com o <strong style={{ color: '#2B9C9C' }}>Programa de Indicação das Assinaturas Vital</strong>, cada pessoa indicada e confirmada como assinante gera <strong>benefícios reais</strong> para você.
                É a forma que encontramos de agradecer pela <strong>confiança</strong> e por nos ajudar a fortalecer o ecossistema de saúde do Vale do Itajaí.
              </p>

              <div className="bg-gradient-to-r from-[#2B9C9C]/10 to-[#D4C5A0]/10 p-6 rounded-lg space-y-3">
                <h3 className="text-xl font-bold" style={{ color: '#2B9C9C' }}>
                  🔸 Como funciona?
                </h3>
                
                <ul className="space-y-2 text-sm md:text-base text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Você envia a indicação pela <strong>plataforma oficial de indicações</strong> (somente indicações cadastradas por aqui são válidas)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Nossa equipe entra em contato de forma <strong>profissional e acolhedora</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Acompanhamos a pessoa indicada durante todo o processo — explicação, dúvidas, assinatura</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Após a confirmação da compra, registramos sua <strong>bonificação</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Você recebe sua comissão de forma <strong>organizada e transparente</strong> até o <strong>quinto dia útil do próximo mês</strong></span>
                  </li>
                </ul>
              </div>

              <div className="text-center py-4">
                <p className="text-lg md:text-xl font-semibold" style={{ color: '#2B9C9C' }}>
                  Indique. Compartilhe cuidado. Vamos juntos levar saúde de qualidade a preço acessível a cada vez mais pessoas!
                </p>
                <p className="text-base md:text-lg font-semibold text-gray-800 mt-2">
                  Ganhe com isso — de forma <strong>justa, transparente e oficial</strong>.
                </p>
              </div>

              <p className="text-center text-base font-medium" style={{ color: '#2B9C9C' }}>
                Sua Saúde Vital — cuidando de quem cuida.
              </p>

              {/* Observação sobre lead frio */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  <em>Observação importante: Em casos de lead frio ou com múltiplas objeções, as porcentagens de comissão (indicador x vendedor) podem ser invertidas.</em>
                </p>
              </div>
            </div>

            {/* Botão de Login */}
            <Button
              onClick={() => setLocation("/login-indicador")}
              className="bg-[#1e9d9f] hover:bg-[#178a8c] text-white px-8 py-6 text-lg"
            >
              Fazer Login
            </Button>

            {/* Link para Cadastro */}
            <div className="pt-4">
              <p className="text-sm text-gray-600">
                Ainda não tem cadastro?{" "}
                <button
                  onClick={() => setLocation("/cadastro-indicador")}
                  className="text-[#1e9d9f] hover:underline font-semibold"
                >
                  Cadastre-se aqui
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
