import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

async function criarAdmin() {
  const email = "admin@vital.com";
  const senha = "admin123";
  const senhaHash = await bcrypt.hash(senha, 10);

  // Verificar se já existe
  const existente = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existente.length > 0) {
    console.log("✅ Usuário admin já existe");
    console.log("Email:", email);
    console.log("Senha:", senha);
    console.log("Role:", existente[0].role);
    return;
  }

  // Criar novo admin
  await db.insert(users).values({
    openId: "admin-test-" + Date.now(),
    name: "Administrador Teste",
    email: email,
    senha: senhaHash,
    whatsapp: "(47) 99999-9999",
    chavePix: "admin@vital.com",
    role: "admin",
    loginMethod: "senha",
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log("Email:", email);
  console.log("Senha:", senha);
  console.log("Role: admin");
}

criarAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erro:", err);
    process.exit(1);
  });
