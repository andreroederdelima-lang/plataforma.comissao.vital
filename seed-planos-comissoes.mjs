import mysql from 'mysql2/promise';

// Conectar ao banco
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🌱 Populando tabelas de planos e comissões...\n');

// 1. Popular planos_saude
const planos = [
  {
    nome: 'Essencial Individual',
    categoria: 'individual',
    tipo: 'essencial',
    precoMensal: 12900, // R$ 129,00
    bonificacaoPadrao: 5000, // R$ 50,00
    percentualPrimeiroMes: 387, // 38,7%
    ordem: 1,
  },
  {
    nome: 'Essencial Familiar',
    categoria: 'familiar',
    tipo: 'essencial',
    precoMensal: 25900,
    bonificacaoPadrao: 7000,
    percentualPrimeiroMes: 270,
    ordem: 2,
  },
  {
    nome: 'Premium Individual',
    categoria: 'individual',
    tipo: 'premium',
    precoMensal: 15990,
    bonificacaoPadrao: 6000,
    percentualPrimeiroMes: 375,
    ordem: 3,
  },
  {
    nome: 'Premium Familiar',
    categoria: 'familiar',
    tipo: 'premium',
    precoMensal: 28990,
    bonificacaoPadrao: 8000,
    percentualPrimeiroMes: 276,
    ordem: 4,
  },
  {
    nome: 'Essencial Empresarial (Ind.)',
    categoria: 'empresarial_individual',
    tipo: 'essencial',
    precoMensal: 9990,
    bonificacaoPadrao: 4000,
    percentualPrimeiroMes: 400,
    ordem: 5,
  },
  {
    nome: 'Essencial Empresarial Familiar',
    categoria: 'empresarial_familiar',
    tipo: 'essencial',
    precoMensal: 22990,
    bonificacaoPadrao: 6000,
    percentualPrimeiroMes: 261,
    ordem: 6,
  },
  {
    nome: 'Premium Empresarial (Ind.)',
    categoria: 'empresarial_individual',
    tipo: 'premium',
    precoMensal: 11990,
    bonificacaoPadrao: 5000,
    percentualPrimeiroMes: 417,
    ordem: 7,
  },
  {
    nome: 'Premium Empresarial Familiar',
    categoria: 'empresarial_familiar',
    tipo: 'premium',
    precoMensal: 24990,
    bonificacaoPadrao: 6500,
    percentualPrimeiroMes: 260,
    ordem: 8,
  },
];

for (const plano of planos) {
  const sql = `
    INSERT INTO planos_saude (nome, categoria, tipo, precoMensal, bonificacaoPadrao, percentualPrimeiroMes, ordem, isActive)
    VALUES ('${plano.nome}', '${plano.categoria}', '${plano.tipo}', ${plano.precoMensal}, ${plano.bonificacaoPadrao}, ${plano.percentualPrimeiroMes}, ${plano.ordem}, 1)
    ON DUPLICATE KEY UPDATE 
      precoMensal = ${plano.precoMensal},
      bonificacaoPadrao = ${plano.bonificacaoPadrao},
      percentualPrimeiroMes = ${plano.percentualPrimeiroMes}
  `;
  
  await connection.execute(sql);
  console.log(`✅ Plano inserido: ${plano.nome}`);
}

// 2. Popular configuracao_comissoes
const configs = [
  {
    tipoLead: 'quente',
    percentualIndicador: 70,
    percentualVendedor: 30,
    descricao: 'Lead quente: cliente interessado, com orçamento e pronto para comprar. Indicador recebe 70% e vendedor 30%.',
  },
  {
    tipoLead: 'frio',
    percentualIndicador: 30,
    percentualVendedor: 70,
    descricao: 'Lead frio: cliente com objeções, sem conhecimento prévio ou processo de venda complexo. Indicador recebe 30% e vendedor 70%.',
  },
];

for (const config of configs) {
  const sql = `
    INSERT INTO configuracao_comissoes (tipoLead, percentualIndicador, percentualVendedor, descricao)
    VALUES ('${config.tipoLead}', ${config.percentualIndicador}, ${config.percentualVendedor}, '${config.descricao}')
    ON DUPLICATE KEY UPDATE 
      percentualIndicador = ${config.percentualIndicador},
      percentualVendedor = ${config.percentualVendedor},
      descricao = '${config.descricao}'
  `;
  
  await connection.execute(sql);
  console.log(`✅ Configuração inserida: Lead ${config.tipoLead}`);
}

console.log('\n🎉 Seed concluído com sucesso!');
await connection.end();
