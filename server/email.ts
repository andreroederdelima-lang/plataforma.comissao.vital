import nodemailer from "nodemailer";

// Configurar transporter do nodemailer com Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true para porta 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar e-mail genérico usando nodemailer + Gmail SMTP
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("[Email] Credenciais SMTP não configuradas");
      return false;
    }

    const fromName = process.env.SMTP_FROM_NAME || "Sua Saúde Vital";
    const fromEmail = process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html || params.text.replace(/\n/g, "<br>"),
    });

    console.log(`[Email] E-mail enviado com sucesso para ${params.to} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar e-mail para ${params.to}:`, error);
    return false;
  }
}

/**
 * Enviar convite para novo vendedor
 */
export async function sendVendedorInvite(params: {
  nome: string;
  email: string;
}): Promise<boolean> {
  const { nome, email } = params;

  const loginUrl = process.env.VITE_OAUTH_PORTAL_URL || "https://manus.im";

  const subject = "Bem-vindo ao Sistema de Indicações - Sua Saúde Vital";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2B9C9C 0%, #1e7e7e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: #2B9C9C; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .step { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #2B9C9C; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo!</h1>
          <p>Sistema de Indicações de Parceiros</p>
        </div>
        <div class="content">
          <h2>Olá, ${nome}!</h2>
          
          <p>Você foi cadastrado como <strong>parceiro vendedor</strong> no Sistema de Indicações da Sua Saúde Vital!</p>
          
          <p>Agora você pode receber e gerenciar indicações de clientes interessados em nossos planos de saúde.</p>
          
          <h3>📋 Próximos passos:</h3>
          <div class="step">Clique no botão abaixo para acessar o sistema</div>
          <div class="step">Faça login com sua conta Manus (se não tiver, crie uma gratuitamente)</div>
          <div class="step">Comece a registrar suas indicações e acompanhar comissões!</div>
          
          <center>
            <a href="${loginUrl}" class="button">Acessar Sistema</a>
          </center>
          
          <p><strong>Seu e-mail cadastrado:</strong> ${email}</p>
          
          <p>Se tiver dúvidas, entre em contato com o administrativo.</p>
          
          <p>Boas vendas! 🚀</p>
        </div>
        <div class="footer">
          <p>© 2024 Sua Saúde Vital - Sistema de Indicações de Parceiros</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject,
    text: `Olá ${nome},\n\nVocê foi cadastrado como parceiro vendedor no Sistema de Indicações da Sua Saúde Vital!\n\nAcesse: ${loginUrl}\n\nSeu e-mail: ${email}\n\nBoas vendas!`,
    html,
  });
}

/**
 * Enviar e-mail de boas-vindas para indicador
 */
export async function sendIndicadorBoasVindas(params: {
  nome: string;
  email: string;
}): Promise<boolean> {
  const { nome, email } = params;

  const loginUrl = `${process.env.VITE_OAUTH_PORTAL_URL || "http://localhost:3000"}/login-indicador`;

  const subject = "Bem-vindo ao Programa de Indicações Vital! 🎉";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2B9C9C;">Bem-vindo, ${nome}!</h2>
      
      <p>Sua conta foi criada com sucesso no <strong>Programa de Indicações Vital</strong>!</p>
      
      <p>Agora você pode:</p>
      <ul>
        <li>Acessar materiais de divulgação</li>
        <li>Gerar QR Codes personalizados</li>
        <li>Acompanhar suas indicações</li>
        <li>Visualizar suas comissões</li>
      </ul>
      
      <p style="margin-top: 30px;">
        <a href="${loginUrl}" style="background-color: #2B9C9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Acessar Painel
        </a>
      </p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Indique. Compartilhe cuidado. Vamos juntos levar saúde de qualidade a preço acessível a cada vez mais pessoas!
      </p>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>Sua Saúde Vital</strong> — cuidando de quem cuida.
      </p>
    </div>
  `;

  const text = `
Bem-vindo, ${nome}!

Sua conta foi criada com sucesso no Programa de Indicações Vital!

Agora você pode:
- Acessar materiais de divulgação
- Gerar QR Codes personalizados
- Acompanhar suas indicações
- Visualizar suas comissões

Acesse seu painel: ${loginUrl}

Indique. Compartilhe cuidado. Vamos juntos levar saúde de qualidade a preço acessível a cada vez mais pessoas!

Sua Saúde Vital — cuidando de quem cuida.
  `;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Enviar e-mail de recuperação de senha
 */
export async function sendRecuperacaoSenha(params: {
  nome: string;
  email: string;
  token: string;
}): Promise<boolean> {
  const { nome, email, token } = params;

  // Usar URL do site publicado ou localhost em desenvolvimento
  const baseUrl = process.env.SITE_URL || process.env.PUBLIC_URL || "https://indicacao.suasaudevital.com.br";
  const resetUrl = `${baseUrl}/recuperar-senha?token=${token}`;

  const subject = "Recuperação de Senha - Vital";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2B9C9C;">Recuperação de Senha</h2>
      
      <p>Olá, ${nome}!</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Programa de Indicações Vital</strong>.</p>
      
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      
      <p style="margin-top: 30px;">
        <a href="${resetUrl}" style="background-color: #2B9C9C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Redefinir Senha
        </a>
      </p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Este link é válido por <strong>1 hora</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá a mesma.
      </p>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        <strong>Sua Saúde Vital</strong> — cuidando de quem cuida.
      </p>
    </div>
  `;

  const text = `
Olá, ${nome}!

Recebemos uma solicitação para redefinir a senha da sua conta no Programa de Indicações Vital.

Acesse o link abaixo para criar uma nova senha:
${resetUrl}

Este link é válido por 1 hora.

Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá a mesma.

Sua Saúde Vital — cuidando de quem cuida.
  `;

  return sendEmail({ to: email, subject, text, html });
}
