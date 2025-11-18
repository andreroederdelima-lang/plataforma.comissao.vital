import nodemailer from "nodemailer";

/**
 * Configuração do transporte SMTP
 * Credenciais devem ser fornecidas via variáveis de ambiente
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error(
      "Credenciais SMTP não configuradas. Configure SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS nas variáveis de ambiente."
    );
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465, // true para porta 465, false para outras portas
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

/**
 * Enviar e-mail de convite para novo vendedor
 */
export async function sendVendedorInvite(
  vendedorEmail: string,
  vendedorName: string
): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const loginUrl = `${process.env.VITE_OAUTH_PORTAL_URL || "https://manus.im/login"}`;
    const systemUrl = process.env.VITE_APP_URL || "https://sua-saude-vital-indicacoes.manus.space";

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite - Sistema de Indicações Sua Saúde Vital</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Bem-vindo ao Sistema de Indicações
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Sua Saúde Vital
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Olá <strong>${vendedorName}</strong>,
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Você foi cadastrado como <strong>vendedor parceiro</strong> no Sistema de Indicações da Sua Saúde Vital! 🎉
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Para começar a usar o sistema e registrar suas indicações, siga os passos abaixo:
              </p>
              
              <!-- Steps -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #0d9488; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <h3 style="color: #0d9488; margin: 0 0 15px 0; font-size: 18px;">📋 Instruções de Primeiro Acesso</h3>
                
                <ol style="color: #555555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">
                    Acesse a plataforma Manus em: <a href="${loginUrl}" style="color: #0d9488; text-decoration: none; font-weight: bold;">${loginUrl}</a>
                  </li>
                  <li style="margin-bottom: 10px;">
                    Clique em <strong>"Criar Conta"</strong> e cadastre-se usando este e-mail: <strong>${vendedorEmail}</strong>
                  </li>
                  <li style="margin-bottom: 10px;">
                    Após criar sua conta, acesse o sistema em: <a href="${systemUrl}" style="color: #0d9488; text-decoration: none; font-weight: bold;">${systemUrl}</a>
                  </li>
                  <li>
                    Faça login com suas credenciais da Manus e comece a registrar indicações!
                  </li>
                </ol>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);">
                      Criar Minha Conta Agora
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 15px; border-radius: 4px; margin: 0 0 20px 0;">
                <p style="color: #9a3412; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong>💡 Dica:</strong> Após o primeiro acesso, você poderá visualizar suas indicações, acompanhar comissões e atualizar seus dados no menu "Meu Perfil".
                </p>
              </div>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0;">
                Se tiver alguma dúvida, entre em contato com o administrador do sistema.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
                © 2024 Sua Saúde Vital - Sistema de Indicações de Parceiros<br>
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
Bem-vindo ao Sistema de Indicações - Sua Saúde Vital

Olá ${vendedorName},

Você foi cadastrado como vendedor parceiro no Sistema de Indicações da Sua Saúde Vital!

Para começar a usar o sistema e registrar suas indicações, siga os passos abaixo:

INSTRUÇÕES DE PRIMEIRO ACESSO:

1. Acesse a plataforma Manus em: ${loginUrl}
2. Clique em "Criar Conta" e cadastre-se usando este e-mail: ${vendedorEmail}
3. Após criar sua conta, acesse o sistema em: ${systemUrl}
4. Faça login com suas credenciais da Manus e comece a registrar indicações!

DICA: Após o primeiro acesso, você poderá visualizar suas indicações, acompanhar comissões e atualizar seus dados no menu "Meu Perfil".

Se tiver alguma dúvida, entre em contato com o administrador do sistema.

---
© 2024 Sua Saúde Vital - Sistema de Indicações de Parceiros
Este é um e-mail automático, por favor não responda.
    `;

    await transporter.sendMail({
      from: `"Sua Saúde Vital" <${process.env.SMTP_USER}>`,
      to: vendedorEmail,
      subject: "🎉 Convite: Sistema de Indicações Sua Saúde Vital",
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Email] Convite enviado com sucesso para ${vendedorEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar convite para ${vendedorEmail}:`, error);
    return false;
  }
}


/**
 * Enviar e-mail genérico
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Sua Saúde Vital" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text.replace(/\n/g, "<br>"),
    });

    console.log(`[Email] E-mail enviado com sucesso para ${params.to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar e-mail para ${params.to}:`, error);
    return false;
  }
}
