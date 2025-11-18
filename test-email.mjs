import nodemailer from "nodemailer";

console.log("🔍 Testando configuração SMTP...\n");

// Ler variáveis de ambiente
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log("📋 Configurações:");
console.log(`   Host: ${SMTP_HOST}`);
console.log(`   Port: ${SMTP_PORT}`);
console.log(`   User: ${SMTP_USER}`);
console.log(`   Pass: ${SMTP_PASS ? "***" + SMTP_PASS.slice(-4) : "NÃO CONFIGURADO"}\n`);

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.error("❌ Erro: Credenciais SMTP não configuradas!");
  console.log("\nConfigure as variáveis de ambiente:");
  console.log("  - SMTP_HOST");
  console.log("  - SMTP_PORT");
  console.log("  - SMTP_USER");
  console.log("  - SMTP_PASS");
  process.exit(1);
}

// Criar transporter
console.log("🔧 Criando transporter SMTP...");
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: parseInt(SMTP_PORT),
  secure: parseInt(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  debug: true, // Ativar logs detalhados
  logger: true, // Ativar logger
});

// Testar conexão
console.log("\n🔌 Testando conexão com servidor SMTP...");
try {
  await transporter.verify();
  console.log("✅ Conexão estabelecida com sucesso!\n");
} catch (error) {
  console.error("❌ Erro ao conectar:", error.message);
  console.log("\n💡 Possíveis soluções:");
  console.log("   1. Verifique se a senha de app está correta (16 caracteres sem espaços)");
  console.log("   2. Para Google Workspace, tente porta 465 ao invés de 587");
  console.log("   3. Verifique se a verificação em 2 etapas está ativada");
  console.log("   4. Considere usar OAuth2 para maior segurança");
  process.exit(1);
}

// Enviar e-mail de teste
console.log("📧 Enviando e-mail de teste...");
try {
  const info = await transporter.sendMail({
    from: `"Teste Sistema" <${SMTP_USER}>`,
    to: SMTP_USER, // Enviar para o próprio e-mail
    subject: "✅ Teste de Configuração SMTP - Sistema de Indicações",
    text: "Este é um e-mail de teste para verificar se a configuração SMTP está funcionando corretamente.",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0d9488;">✅ Teste de Configuração SMTP</h2>
        <p>Este é um e-mail de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
        <p><strong>Sistema:</strong> Sua Saúde Vital - Sistema de Indicações</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Se você recebeu este e-mail, significa que o sistema de envio de e-mails está configurado corretamente!
        </p>
      </div>
    `,
  });

  console.log("✅ E-mail enviado com sucesso!");
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   Response: ${info.response}\n`);
  console.log("🎉 Configuração SMTP está funcionando perfeitamente!");
} catch (error) {
  console.error("❌ Erro ao enviar e-mail:", error.message);
  console.log("\n💡 Detalhes do erro:");
  console.log(error);
  process.exit(1);
}
