import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, QrCode, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import PainelVendedorLayout from "@/components/PainelVendedorLayout";

export default function QRCodes() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [downloadingCheckout, setDownloadingCheckout] = useState(false);
  const [downloadingWhatsApp, setDownloadingWhatsApp] = useState(false);

  // Buscar QR Codes dinâmicos
  const { data: qrCheckout, isLoading: loadingCheckout } = trpc.configuracoesGerais.gerarQRCodeCheckout.useQuery();
  const { data: qrWhatsApp, isLoading: loadingWhatsApp } = trpc.configuracoesGerais.gerarQRCodeWhatsApp.useQuery();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login-indicador");
    }
  }, [user, loading, setLocation]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <PainelVendedorLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PainelVendedorLayout>
    );
  }

  // Se não autenticado, não renderizar nada (vai redirecionar)
  if (!user) {
    return null;
  }

  const handleDownloadCheckout = async () => {
    if (!qrCheckout?.qrCode) return;
    setDownloadingCheckout(true);
    try {
      const link = document.createElement('a');
      link.href = qrCheckout.qrCode;
      link.download = 'QRCode-Checkout-Vital.png';
      link.click();
      toast.success("QR Code de Checkout baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar QR Code");
    } finally {
      setDownloadingCheckout(false);
    }
  };

  const handleDownloadWhatsApp = async () => {
    if (!qrWhatsApp?.qrCode) return;
    setDownloadingWhatsApp(true);
    try {
      const link = document.createElement('a');
      link.href = qrWhatsApp.qrCode;
      link.download = 'QRCode-WhatsApp-Vital.png';
      link.click();
      toast.success("QR Code de WhatsApp baixado com sucesso!");
    } catch (error) {
      toast.error("Erro ao baixar QR Code");
    } finally {
      setDownloadingWhatsApp(false);
    }
  };

  const handlePrintCheckout = () => {
    if (!qrCheckout?.qrCode) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>QR Code - Checkout Vital</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .logo { max-width: 200px; margin-bottom: 30px; }
            .qrcode { max-width: 400px; margin: 20px 0; border: 4px solid #1e9d9f; border-radius: 12px; }
            h1 { color: #1e9d9f; font-size: 28pt; margin: 20px 0; }
            p { font-size: 14pt; color: #666; margin: 10px 0; }
            .footer { margin-top: 40px; font-size: 10pt; color: #999; }
          </style>
        </head>
        <body>
          <img src="${APP_LOGO}" alt="Vital Logo" class="logo" />
          <h1>Acesse Nossos Planos</h1>
          <p>Escaneie o QR Code para conhecer nossas assinaturas</p>
          <img src="${qrCheckout.qrCode}" alt="QR Code Checkout" class="qrcode" />
          <p style="font-weight: bold; color: #1e9d9f; font-size: 16pt;">Vem ser VITAL!</p>
          <div class="footer">
            <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
            <p>Vale do Itajaí - Santa Catarina</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintWhatsApp = () => {
    if (!qrWhatsApp?.qrCode) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>QR Code - WhatsApp Vital</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .logo { max-width: 200px; margin-bottom: 30px; }
            .qrcode { max-width: 400px; margin: 20px 0; border: 4px solid #25D366; border-radius: 12px; }
            h1 { color: #25D366; font-size: 28pt; margin: 20px 0; }
            p { font-size: 14pt; color: #666; margin: 10px 0; }
            .footer { margin-top: 40px; font-size: 10pt; color: #999; }
          </style>
        </head>
        <body>
          <img src="${APP_LOGO}" alt="Vital Logo" class="logo" />
          <h1>Fale com Nossos Especialistas</h1>
          <p>Escaneie o QR Code para entrar em contato via WhatsApp</p>
          <img src="${qrWhatsApp.qrCode}" alt="QR Code WhatsApp" class="qrcode" />
          <p style="font-weight: bold; color: #25D366; font-size: 16pt;">Vem ser VITAL!</p>
          <div class="footer">
            <p>© 2025 Sua Saúde Vital - Todos os direitos reservados</p>
            <p>Vale do Itajaí - Santa Catarina</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleShareCheckout = () => {
    if (!qrCheckout?.link) return;
    if (navigator.share) {
      navigator.share({
        title: 'Link de Checkout - Vital',
        text: 'Conheça nossos planos de assinatura!',
        url: qrCheckout.link,
      }).catch(() => {
        navigator.clipboard.writeText(qrCheckout.link);
        toast.success("Link copiado!");
      });
    } else {
      navigator.clipboard.writeText(qrCheckout.link);
      toast.success("Link copiado!");
    }
  };

  const handleShareWhatsApp = () => {
    if (!qrWhatsApp?.link) return;
    if (navigator.share) {
      navigator.share({
        title: 'WhatsApp - Vital',
        text: 'Fale com nossos especialistas!',
        url: qrWhatsApp.link,
      }).catch(() => {
        navigator.clipboard.writeText(qrWhatsApp.link);
        toast.success("Link copiado!");
      });
    } else {
      navigator.clipboard.writeText(qrWhatsApp.link);
      toast.success("Link copiado!");
    }
  };

  return (
    <PainelVendedorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <img src={APP_LOGO} alt="Vital Logo" className="h-24 w-auto mb-6" />
          <h1 className="text-4xl font-bold text-primary mb-2">QR Codes Dinâmicos</h1>
          <p className="text-muted-foreground max-w-2xl">
            QR Codes personalizados que atualizam automaticamente conforme as configurações do admin
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* QR Code de Checkout Personalizado */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">🔗 Checkout Personalizado</CardTitle>
              <CardDescription>
                QR Code do seu link de checkout com rastreamento automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingCheckout ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : qrCheckout ? (
                <>
                  {/* QR Code Image */}
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-lg border-4 border-primary shadow-lg">
                      <img
                        src={qrCheckout.qrCode}
                        alt="QR Code Checkout"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Link personalizado com seu código único:
                    </p>
                    <p className="font-mono text-xs text-primary break-all">
                      {qrCheckout.link}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button onClick={handleDownloadCheckout} disabled={downloadingCheckout} className="w-full" size="lg">
                      {downloadingCheckout ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      Baixar PNG
                    </Button>
                    <Button onClick={handlePrintCheckout} variant="outline" className="w-full" size="lg">
                      <Printer className="h-5 w-5 mr-2" />
                      Imprimir
                    </Button>
                    <Button onClick={handleShareCheckout} variant="outline" className="w-full" size="lg">
                      <Share2 className="h-5 w-5 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Link de checkout não configurado. Entre em contato com o administrador.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code do WhatsApp */}
          <Card className="border-2 border-green-500/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <QrCode className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl">📱 WhatsApp Comercial</CardTitle>
              <CardDescription>
                QR Code para contato direto com a equipe de vendas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingWhatsApp ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                </div>
              ) : qrWhatsApp ? (
                <>
                  {/* QR Code Image */}
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-lg border-4 border-green-500 shadow-lg">
                      <img
                        src={qrWhatsApp.qrCode}
                        alt="QR Code WhatsApp"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  {/* Informações */}
                  <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                    <p className="text-sm text-muted-foreground mb-2">
                      Ao escanear, o cliente será direcionado para o WhatsApp com a mensagem:
                    </p>
                    <p className="font-medium text-green-700">
                      "{qrWhatsApp.mensagem}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Número: {qrWhatsApp.numero}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button onClick={handleDownloadWhatsApp} disabled={downloadingWhatsApp} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      {downloadingWhatsApp ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      Baixar PNG
                    </Button>
                    <Button onClick={handlePrintWhatsApp} variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" size="lg">
                      <Printer className="h-5 w-5 mr-2" />
                      Imprimir
                    </Button>
                    <Button onClick={handleShareWhatsApp} variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" size="lg">
                      <Share2 className="h-5 w-5 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    WhatsApp não configurado. Entre em contato com o administrador.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dicas de Uso */}
          <Card className="border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="text-xl">💡 Dicas de Uso dos QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>QR Code de Checkout:</strong> Use para compartilhar seu link personalizado. Todas as vendas serão rastreadas automaticamente com seu código único.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>QR Code de WhatsApp:</strong> Facilita o contato direto do cliente com a equipe comercial. A mensagem inicial é configurada pelo admin.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Atualização Automática:</strong> Quando o admin alterar o link de checkout ou o número do WhatsApp, seus QR Codes serão atualizados automaticamente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Impressão:</strong> Imprima em papel de qualidade para melhor leitura. Coloque em locais visíveis durante eventos e apresentações.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Compartilhamento Digital:</strong> Compartilhe em redes sociais, grupos de WhatsApp e adicione ao seu material de divulgação.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Botão Voltar */}
        <div className="flex justify-center mt-8">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Voltar
          </Button>
        </div>
      </div>
    </PainelVendedorLayout>
  );
}
