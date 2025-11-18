import { Resend } from "resend";

console.log("🔍 Testando Resend...\n");

const RESEND_API_KEY = process.env.RESEND_API_KEY;

console.log("📋 Configuração:");
console.log(`   API Key: ${RESEND_API_KEY ? "***" + RESEND_API_KEY.slice(-6) : "NÃO CONFIGURADO"}\n`);

if (!RESEND_API_KEY) {
  console.error("❌ Erro: RESEND_API_KEY não configurado!");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

console.log("📧 Enviando e-mail de teste...");
try {
  const { data, error } = await resend.emails.send({
    from: "Teste <onboarding@resend.dev>",
    to: "comercial@suasaudevital.com.br",
    subject: "✅ Teste Resend - Sistema de Indicações",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0d9488;">✅ Teste de Configuração Resend</h2>
        <p>Este é um e-mail de teste para verificar se o Resend está funcionando corretamente.</p>
        <p><strong>Sistema:</strong> Sua Saúde Vital - Sistema de Indicações</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString("pt-BR")}</p>
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          Se você recebeu este e-mail, significa que o sistema de envio de e-mails está configurado corretamente!
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Erro ao enviar:", error);
    process.exit(1);
  }

  console.log("✅ E-mail enviado com sucesso!");
  console.log(`   ID: ${data.id}\n`);
  console.log("🎉 Resend está funcionando perfeitamente!");
} catch (error) {
  console.error("❌ Erro:", error.message);
  process.exit(1);
}
