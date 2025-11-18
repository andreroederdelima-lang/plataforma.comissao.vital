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
 * Enviar email para o parceiro
 */
export async function sendEmailToParceiro(params: {
  parceiroEmail: string;
  subject: string;
  message: string;
}) {
  try {
    const { sendEmail } = await import("../email");
    const sent = await sendEmail({
      to: params.parceiroEmail,
      subject: params.subject,
      text: params.message,
    });
    return sent;
  } catch (error) {
    console.error(`[Email] Erro ao enviar e-mail para parceiro ${params.parceiroEmail}:`, error);
    return false;
  }
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
    case "aguardando_contato":
      statusMessage = "está aguardando contato";
      break;
    case "em_negociacao":
      statusMessage = "está em negociação";
      break;
    case "venda_com_objecoes":
      statusMessage = "está com objeções na venda";
      break;
    case "venda_fechada":
      statusMessage = "comprou";
      break;
    case "nao_comprou":
      statusMessage = "não comprou";
      break;
    case "cliente_sem_interesse":
      statusMessage = "não tem interesse";
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

/**
 * Notificar vendedor sobre venda fechada com valor de comissão
 */
export async function notifyVendaFechada(params: {
  nomeIndicado: string;
  nomeParceiro: string;
  parceiroEmail: string;
  valorComissao: number;
  tipoComissao: string;
}) {
  const { nomeIndicado, nomeParceiro, parceiroEmail, valorComissao, tipoComissao } = params;
  
  const valorFormatado = tipoComissao === "percentual" 
    ? `${valorComissao}%`
    : `R$ ${valorComissao.toFixed(2).replace('.', ',')}`;
  
  const messageToPartner = `🎉 Parabéns ${nomeParceiro}!

A venda do cliente "${nomeIndicado}" que você indicou foi FECHADA!

💰 Sua comissão: ${valorFormatado}

Continue indicando e ganhe mais! Cada indicação é uma nova oportunidade de ganho.

Obrigado por ser nosso parceiro!
Equipe Sua Saúde Vital`;
  
  // Enviar email para o vendedor/parceiro
  await sendEmailToParceiro({
    parceiroEmail,
    subject: "🎉 Venda Fechada - Comissão Conquistada!",
    message: messageToPartner,
  });
  
  // Notificar administrativo
  const messageToAdmin = `Venda fechada! Cliente "${nomeIndicado}" indicado por "${nomeParceiro}". Comissão: ${valorFormatado}`;
  await sendEmailToTeam({
    subject: "Venda Fechada - Comissão a Pagar",
    message: messageToAdmin,
  });
}

/**
 * Notificar parceiro e administrativo sobre status problemático
 */
export async function notifyProblematicStatus(params: {
  nomeIndicado: string;
  nomeParceiro: string;
  parceiroEmail: string;
  novoStatus: string;
}) {
  const { nomeIndicado, nomeParceiro, parceiroEmail, novoStatus } = params;
  
  let statusMessage = "";
  let messageToPartner = "";
  
  switch (novoStatus) {
    case "venda_com_objecoes":
      statusMessage = "está com objeções na venda";
      messageToPartner = `Olá ${nomeParceiro},\n\nO cliente "${nomeIndicado}" que você indicou está com algumas objeções durante a negociação.\n\nPor favor, entre em contato com ele para esclarecer possíveis dúvidas e incentivá-lo a finalizar a compra.\n\nObrigado!\nEquipe Sua Saúde Vital`;
      break;
    case "nao_comprou":
      statusMessage = "não comprou";
      messageToPartner = `Olá ${nomeParceiro},\n\nInfelizmente o cliente "${nomeIndicado}" que você indicou não finalizou a compra.\n\nPor favor, entre em contato com ele para entender os motivos e ver se é possível reverter a situação.\n\nObrigado!\nEquipe Sua Saúde Vital`;
      break;
    case "cliente_sem_interesse":
      statusMessage = "não tem interesse";
      messageToPartner = `Olá ${nomeParceiro},\n\nO cliente "${nomeIndicado}" que você indicou demonstrou não ter interesse no plano.\n\nPor favor, entre em contato com ele para entender melhor suas necessidades e ver se podemos oferecer uma solução adequada.\n\nObrigado!\nEquipe Sua Saúde Vital`;
      break;
    default:
      return;
  }
  
  // Enviar email para administrativo
  const messageToAdmin = `O cliente "${nomeIndicado}" indicado por "${nomeParceiro}", ${statusMessage}.`;
  await sendEmailToTeam({
    subject: "Atenção: Status Problemático de Indicação",
    message: messageToAdmin,
  });
  
  // Enviar email para o parceiro
  await sendEmailToParceiro({
    parceiroEmail,
    subject: "Ação Necessária: Sua Indicação",
    message: messageToPartner,
  });
}
