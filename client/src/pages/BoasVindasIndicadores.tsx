import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";

/**
 * Página de boas-vindas para vendedores/promotores
 * Explica as modalidades (venda direta e indicação) e direciona para login
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
                Plataforma de Comissionamento
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
              Ser um Promotor Vital é simples, seguro e gera recompensas reais.
            </h2>
            
            <div className="space-y-4 text-left">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Se você já conhece a qualidade do <strong>Hospital Censit</strong>, o atendimento da <strong>equipe Vital</strong> e a tranquilidade de ter <strong>saúde acessível 24h</strong>, por que não compartilhar essa experiência com quem você gosta e ganhar uma comissão por sua indicação ou venda?
              </p>

              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                Com o <strong style={{ color: '#2B9C9C' }}>Programa de Comissões das Assinaturas Vital</strong>, cada pessoa indicada e confirmada como assinante gera <strong>benefícios reais</strong> para você. E mais: se você optar por realizar a venda por completo, sua comissão é ainda maior! É a forma que encontramos de agradecer pela <strong>confiança</strong> e por nos ajudar a fortalecer o ecossistema de saúde do Vale do Itajaí.
              </p>

              <div className="bg-gradient-to-r from-[#2B9C9C]/10 to-[#D4C5A0]/10 p-6 rounded-lg space-y-3">
                <h3 className="text-xl font-bold" style={{ color: '#2B9C9C' }}>
                  🔸 Como funciona?
                </h3>
                
                <ul className="space-y-2 text-sm md:text-base text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Você envia a indicação ou realiza a venda, por esta <strong>plataforma oficial</strong> (somente indicações ou vendas cadastradas por aqui são válidas).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No caso de <strong>indicação</strong>, nossa equipe comercial entra em contato de forma <strong>profissional e acolhedora</strong> com quem você indicar!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Acompanhamos a pessoa indicada durante todo o processo — explicação, dúvidas, assinatura.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Após a confirmação da compra e término do período de cancelamento gratuito, registramos sua bonificação.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>No caso de você fazer a <strong>venda completa</strong>, também após o término do período de cancelamento, iremos atualizar as informações na sua área do promotor, e você:</span>
                  </li>
                  <li className="flex items-start ml-6">
                    <span className="mr-2">•</span>
                    <span>Recebe sua comissão de forma <strong>organizada e transparente</strong>.</span>
                  </li>
                </ul>
              </div>

              <div className="text-center py-4">
                <p className="text-lg md:text-xl font-semibold" style={{ color: '#2B9C9C' }}>
                  Venda, indique! Seja um PROMOTOR VITAL! Compartilhe cuidado. Vamos juntos levar saúde de qualidade a preço acessível a cada vez mais pessoas!
                </p>
                <p className="text-base md:text-lg font-semibold text-gray-800 mt-2">
                  Ganhe com isso — de forma <strong>justa, transparente e oficial</strong>.
                </p>
              </div>

              <p className="text-center text-base font-medium" style={{ color: '#2B9C9C' }}>
                Sua Saúde Vital — cuidando de quem cuida.
              </p>

              {/* Link para Tabela de Comissões */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-700 mb-2">
                  📊 Quer saber <strong>quanto você pode ganhar</strong> por plano?
                </p>
                <button
                  onClick={() => setLocation("/tabela-comissoes")}
                  className="text-[#1e9d9f] hover:underline font-bold text-base"
                >
                  Ver Tabela Completa de Comissões →
                </button>
              </div>
            </div>

            {/* Botões de Acesso */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/login-indicador")}
                className="bg-[#1e9d9f] hover:bg-[#178a8c] text-white px-8 py-6 text-lg"
              >
                Fazer Login
              </Button>
              
              <Button
                onClick={() => setLocation("/admin")}
                variant="outline"
                className="border-2 border-[#1e9d9f] text-[#1e9d9f] hover:bg-[#1e9d9f] hover:text-white px-8 py-6 text-lg"
              >
                📊 Área Administrativa
              </Button>
            </div>

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
