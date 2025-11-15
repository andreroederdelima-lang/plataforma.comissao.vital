import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { users } from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('Criando usuário vendedor...');

try {
  // Criar usuário vendedor com email comercial@suasaudevital.com.br
  // O openId será o email, já que usaremos autenticação via Manus OAuth
  const vendedorOpenId = 'vendedor-comercial-suasaudevital';
  
  await connection.query(`
    INSERT INTO users (openId, name, email, role, loginMethod)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      email = VALUES(email),
      role = VALUES(role)
  `, [vendedorOpenId, 'Comercial', 'comercial@suasaudevital.com.br', 'vendedor', 'email']);
  
  console.log('✅ Usuário vendedor criado com sucesso!');
  console.log('Email: comercial@suasaudevital.com.br');
  console.log('Role: vendedor');
  console.log('\nNOTA: O usuário precisará fazer login via Manus OAuth.');
  console.log('Para configurar acesso direto, você precisará configurar as credenciais no painel de administração.');
} catch (error) {
  console.error('❌ Erro ao criar usuário:', error);
  process.exit(1);
} finally {
  await connection.end();
}
