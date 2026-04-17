import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";

const VITAL = {
  turquoise: "#2B9C9C",
  beige: "#D4C5A0",
};

export default function LandingPromotor() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex flex-col">
      <header className="bg-white border-b-4 shadow-sm" style={{ borderColor: VITAL.turquoise }}>
        <div className="container mx-auto px-4 py-6 flex items-center justify-center gap-4">
          <img src={APP_LOGO} alt="Vital" className="h-20" />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: VITAL.turquoise }}>
              Programa de Promotores Vital
            </h1>
            <p className="text-sm text-gray-600 mt-1">Indique quem você ama. Ganhe por isso.</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold" style={{ color: VITAL.turquoise }}>
                Indique e seja reconhecido.
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                No Programa Vital, cada pessoa que você indica e se torna assinante
                gera <strong>um benefício real</strong> pra você: uma{" "}
                <strong>mensalidade grátis</strong> ou um{" "}
                <strong>pagamento via PIX</strong> — combinado com um vendedor nosso
                caso a caso.
              </p>
            </div>

            <div
              className="bg-gradient-to-r p-6 rounded-lg space-y-3"
              style={{
                backgroundImage: `linear-gradient(to right, ${VITAL.turquoise}15, ${VITAL.beige}15)`,
              }}
            >
              <h3 className="text-xl font-bold" style={{ color: VITAL.turquoise }}>
                Como funciona
              </h3>
              <ol className="space-y-3 text-sm md:text-base text-gray-700 list-decimal pl-5">
                <li>Você cria sua conta em 30 segundos.</li>
                <li>Indica amigos, familiares, colegas que podem querer um plano.</li>
                <li>Nossa equipe comercial faz o atendimento — com cuidado, sem te enrolar.</li>
                <li>
                  Quando a venda fecha e passa o período de segurança, um vendedor
                  combina com você <strong>qual benefício</strong> quer: mensalidade
                  grátis ou PIX.
                </li>
                <li>
                  Continua indicando, continua ganhando. Simples assim.
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg text-sm text-gray-800">
              <p>
                <strong>Importante:</strong> o benefício é por indicação que vira
                venda — não é pagamento mensal fixo. Quanto mais você indicar, mais
                ganha. Pare de indicar, para de ganhar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setLocation("/cadastro")}
                className="flex-1 text-white px-8 py-6 text-lg"
                style={{ backgroundColor: VITAL.turquoise }}
              >
                Quero ser Promotor
              </Button>
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="flex-1 border-2 px-8 py-6 text-lg"
                style={{ borderColor: VITAL.turquoise, color: VITAL.turquoise }}
              >
                Já tenho conta
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              Ao criar sua conta você concorda que o benefício por indicação será
              combinado caso-a-caso com um vendedor Vital.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Sua Saúde Vital — Programa de Promotores
        </div>
      </footer>
    </div>
  );
}
