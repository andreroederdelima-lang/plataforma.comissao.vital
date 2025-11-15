import { notifyOwner } from "./notification";

/**
 * Enviar email para administrativo e comercial
 */
export async function sendEmailToTeam(params: {
  subject: string;
  message: string;
}) {
  const { subject, message } = params;
  
  // Enviar notificação para o proprietário (que receberá no email administrativo)
  await notifyOwner({
    title: subject,
    content: message,
  });
  
  return true;
}

/**
 * Notificar sobre nova indicação
 */
export async function notifyNewIndicacao(params: {
  nomeIndicado: string;
  nomeParceiro: string;
  tipoPlano: string;
  categoria: string;
  whatsapp: string;
}) {
  const { nomeIndicado, nomeParceiro, tipoPlano, categoria, whatsapp } = params;
  
  const message = `Nova indicação recebida!\n\nCliente indicado: ${nomeIndicado}\nIndicado por: ${nomeParceiro}\nTipo: ${tipoPlano}\nCategoria: ${categoria}\nWhatsApp: ${whatsapp}\n\nAcesse o painel para mais detalhes.`;
  
  await sendEmailToTeam({
    subject: "Nova Indicação Recebida",
    message,
  });
}

/**
 * Notificar sobre mudança de status
 */
export async function notifyStatusChange(params: {
  nomeIndicado: string;
  nomeParceiro: string;
  novoStatus: string;
}) {
  const { nomeIndicado, nomeParceiro, novoStatus } = params;
  
  let statusMessage = "";
  
  switch (novoStatus) {
    case "venda_fechada":
      statusMessage = "comprou";
      break;
    case "nao_comprou":
      statusMessage = "não comprou";
      break;
    case "falando_com_vendedor":
      statusMessage = "está conversando com o vendedor";
      break;
    case "nao_respondeu_vendedor":
      statusMessage = "não respondeu o vendedor";
      break;
    default:
      statusMessage = novoStatus;
  }
  
  const message = `O cliente "${nomeIndicado}" indicado por "${nomeParceiro}", ${statusMessage}.`;
  
  await sendEmailToTeam({
    subject: "Status de Indicação Atualizado",
    message,
  });
}
