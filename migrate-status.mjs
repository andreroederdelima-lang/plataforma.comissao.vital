import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Iniciando migração de status...');

try {
  // Passo 1: Adicionar novos valores ao enum
  console.log('Passo 1: Adicionando novos valores ao enum...');
  await connection.query(`
    ALTER TABLE indicacoes 
    MODIFY COLUMN status ENUM(
      'pendente', 
      'em_analise', 
      'aprovada', 
      'recusada',
      'falando_com_vendedor',
      'venda_fechada',
      'nao_respondeu_vendedor',
      'nao_comprou'
    ) NOT NULL DEFAULT 'pendente'
  `);
  
  // Passo 2: Atualizar dados existentes
  console.log('Passo 2: Atualizando dados existentes...');
  await connection.query(`UPDATE indicacoes SET status = 'falando_com_vendedor' WHERE status IN ('pendente', 'em_analise')`);
  await connection.query(`UPDATE indicacoes SET status = 'venda_fechada' WHERE status = 'aprovada'`);
  await connection.query(`UPDATE indicacoes SET status = 'nao_comprou' WHERE status = 'recusada'`);
  
  // Passo 3: Remover valores antigos do enum
  console.log('Passo 3: Removendo valores antigos do enum...');
  await connection.query(`
    ALTER TABLE indicacoes 
    MODIFY COLUMN status ENUM(
      'falando_com_vendedor',
      'venda_fechada',
      'nao_respondeu_vendedor',
      'nao_comprou'
    ) NOT NULL DEFAULT 'falando_com_vendedor'
  `);
  
  console.log('✅ Migração concluída com sucesso!');
} catch (error) {
  console.error('❌ Erro na migração:', error);
  process.exit(1);
} finally {
  await connection.end();
}
