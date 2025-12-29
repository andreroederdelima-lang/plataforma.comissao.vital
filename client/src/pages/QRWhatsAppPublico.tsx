import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { Download, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";

/**
 * Página PÚBLICA de QR Code do WhatsApp Comercial
 * Acessível sem login para compartilhamento livre
 */
export default function QRWhatsAppPublico() {
  const canvasWhatsAppRef = useRef<HTMLCanvasElement>(null);

  // Buscar configurações públicas do WhatsApp (sem autenticação)
  const { data: config, isLoading } = trpc.configuracoesGerais.getWhatsAppPublico.useQuery();

  // Gerar QR Code do WhatsApp
  useEffect(() => {
    if (!config?.whatsappNumero || !canvasWhatsAppRef.current) return;

    const whatsappUrl = `https://wa.me/${config.whatsappNumero}${
      config.whatsappMensagem ? `?text=${encodeURIComponent(config.whatsappMensagem)}` : ""
    }`;

    QRCode.toCanvas(canvasWhatsAppRef.current, whatsappUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1e9d9f",
        light: "#ffffff",
      },
    });
  }, [config]);

  // Função para baixar QR Code
  const downloadQRCode = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1e9d9f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.98_0.01_165)] to-[oklch(0.95_0.02_165)]">
      {/* Header */}
      <header className="bg-white border-b-4 border-[#1e9d9f] shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <img src={APP_LOGO} alt="Vital" className="h-16 md:h-20" />
            <div className="text-center">
              <h1 className="text-xl md:text-3xl font-bold text-[#1e9d9f]">
                WhatsApp Comercial Vital
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Fale conosco e conheça nossos planos de saúde
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center bg-gradient-to-r from-[#1e9d9f]/5 to-[#D4C5A0]/5">
              <div className="flex justify-center mb-4">
                <div className="bg-[#1e9d9f] p-4 rounded-full">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl md:text-3xl text-[#1e9d9f]">
                Fale Conosco pelo WhatsApp
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Escaneie o QR Code abaixo ou clique no botão para iniciar uma conversa
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                {/* QR Code do WhatsApp */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md border-2 border-[#1e9d9f]/20">
                    <canvas ref={canvasWhatsAppRef} className="max-w-full h-auto" />
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600">
                      Número: <span className="font-semibold text-[#1e9d9f]">+55 47 93385-3726</span>
                    </p>
                    {config?.whatsappMensagem && (
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Mensagem automática: "{config.whatsappMensagem}"
                      </p>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <Button
                      onClick={() =>
                        window.open(
                          `https://wa.me/${config?.whatsappNumero}${
                            config?.whatsappMensagem
                              ? `?text=${encodeURIComponent(config.whatsappMensagem)}`
                              : ""
                          }`,
                          "_blank"
                        )
                      }
                      className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white"
                      size="lg"
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Abrir WhatsApp
                    </Button>

                    <Button
                      onClick={() => downloadQRCode(canvasWhatsAppRef.current, "qrcode-whatsapp-vital.png")}
                      variant="outline"
                      className="flex-1 border-2 border-[#1e9d9f] text-[#1e9d9f] hover:bg-[#1e9d9f] hover:text-white"
                      size="lg"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Baixar QR Code
                    </Button>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-gradient-to-r from-[#1e9d9f]/10 to-[#D4C5A0]/10 p-6 rounded-lg space-y-3">
                  <h3 className="font-bold text-lg text-[#1e9d9f]">
                    💚 Por que escolher a Vital?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2 text-[#1e9d9f]">✓</span>
                      <span>Atendimento 24h no Hospital Censit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#1e9d9f]">✓</span>
                      <span>Planos acessíveis para toda a família</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#1e9d9f]">✓</span>
                      <span>Equipe médica experiente e acolhedora</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-[#1e9d9f]">✓</span>
                      <span>Saúde de qualidade no Vale do Itajaí</span>
                    </li>
                  </ul>
                </div>

                {/* Call to Action */}
                <div className="text-center pt-4">
                  <p className="text-base font-semibold text-gray-800">
                    Sua Saúde Vital — cuidando de quem cuida.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link para voltar */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-[#1e9d9f] hover:underline text-sm font-medium"
            >
              ← Voltar para página inicial
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
