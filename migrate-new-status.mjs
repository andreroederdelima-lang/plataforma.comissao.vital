import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Iniciando migração para novos status...');

try {
  // Passo 1: Adicionar novos status ao enum
  console.log('Passo 1: Adicionando novos status ao enum...');
  await connection.query(`
    ALTER TABLE indicacoes 
    MODIFY COLUMN status ENUM(
      'falando_com_vendedor',
      'venda_fechada',
      'nao_respondeu_vendedor',
      'nao_comprou',
      'aguardando_contato',
      'em_negociacao',
      'venda_com_objecoes',
      'cliente_sem_interesse'
    ) NOT NULL DEFAULT 'aguardando_contato'
  `);
  
  // Passo 2: Migrar dados existentes
  console.log('Passo 2: Migrando dados existentes...');
  await connection.query(`UPDATE indicacoes SET status = 'aguardando_contato' WHERE status = 'falando_com_vendedor'`);
  await connection.query(`UPDATE indicacoes SET status = 'cliente_sem_interesse' WHERE status = 'nao_respondeu_vendedor'`);
  // venda_fechada e nao_comprou permanecem iguais
  
  // Passo 3: Remover status antigos
  console.log('Passo 3: Removendo status antigos...');
  await connection.query(`
    ALTER TABLE indicacoes 
    MODIFY COLUMN status ENUM(
      'aguardando_contato',
      'em_negociacao',
      'venda_com_objecoes',
      'venda_fechada',
      'nao_comprou',
      'cliente_sem_interesse'
    ) NOT NULL DEFAULT 'aguardando_contato'
  `);
  
  console.log('✅ Migração concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro na migração:', error);
  process.exit(1);
} finally {
  await connection.end();
}
