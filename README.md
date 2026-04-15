# Plataforma de Comissionamento Vital

Plataforma full-stack para gestão de indicações, vendas e comissões de planos
de saúde da Sua Saúde Vital. Permite que promotores cadastrem indicações e
vendas, acompanhem o status e suas comissões, e que administradores gerenciem
todo o fluxo.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Wouter + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + tRPC + Drizzle ORM
- **Banco de dados:** MySQL
- **Autenticação:** JWT (cookie httpOnly) com bcrypt; OAuth opcional (Manus)
- **Integrações opcionais:** SMTP (nodemailer), AWS S3, OpenAI

## Pré-requisitos

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- MySQL 8+ acessível (local ou remoto)

## Instalação

```bash
# 1) Clonar
git clone <repo-url>
cd plataforma.comissao.vital

# 2) Instalar dependências
pnpm install

# 3) Criar arquivo de ambiente
cp .env.example .env
# Edite .env e configure no mínimo DATABASE_URL e JWT_SECRET

# 4) Criar o banco de dados (se ainda não existe)
mysql -u root -p -e "CREATE DATABASE vital_comissoes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5) Aplicar migrações (gera + executa)
pnpm run db:push
```

## Variáveis de ambiente

Variáveis mínimas (em `.env`):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Sim | Segredo para assinar tokens JWT |
| `NODE_ENV` | Não | `development` ou `production` |
| `PORT` | Não | Porta HTTP (padrão 3000; incrementa se ocupada) |
| `VITE_APP_TITLE` | Não | Título da aplicação |

Variáveis opcionais (recursos que só funcionam se configurados):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME` — envio
  de e-mails (boas-vindas, recuperação de senha, notificações)
- `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`
  — login via OAuth Manus (sem essas, o sistema cai para login por e-mail/senha)
- `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` — notificações ao owner
  via Manus Forge (sem essas, notificações são apenas silenciosamente ignoradas)
- `SITE_URL` — URL base usada em links de e-mail (padrão produção:
  `https://indicacao.suasaudevital.com.br`)

Veja `.env.example` para o template completo.

## Executar em desenvolvimento

```bash
pnpm run dev
```

O servidor sobe em `http://localhost:3000/` (ou porta seguinte se ocupada).
Vite roda em modo de desenvolvimento com HMR.

## Build e produção

```bash
pnpm run build   # compila client (Vite) e bundle do servidor (esbuild)
pnpm run start   # executa dist/index.js com NODE_ENV=production
```

## Scripts úteis

| Script | O que faz |
|---|---|
| `pnpm run dev` | Servidor em modo desenvolvimento |
| `pnpm run build` | Build de produção |
| `pnpm run start` | Iniciar build de produção |
| `pnpm run check` | Verificação TypeScript (`tsc --noEmit`) |
| `pnpm run format` | Prettier em todo o projeto |
| `pnpm run test` | Rodar testes (Vitest) |
| `pnpm run db:push` | Gerar migrações + aplicar no banco |

## Criar primeiro administrador

Com as variáveis de ambiente configuradas e o banco pronto:

```bash
node scripts/criar-admin.mjs
```

Ou configure manualmente um usuário com `role='admin'` na tabela `users`.
Consulte `CREDENCIAIS.md` para credenciais de desenvolvimento.

## Estrutura de pastas

```
.
├── client/               # Frontend React
│   ├── src/
│   │   ├── pages/        # Páginas / views
│   │   ├── components/   # Componentes reutilizáveis (ui/ = shadcn)
│   │   ├── hooks/        # React hooks
│   │   ├── lib/          # tRPC client, utilitários
│   │   └── contexts/     # Contextos React
│   └── index.html
├── server/               # Backend Express + tRPC
│   ├── _core/            # Bootstrap, env, auth, cookies
│   ├── routers/          # Routers tRPC (auth, admin, comissões…)
│   ├── routes/           # Rotas Express (upload)
│   ├── db.ts             # Acesso ao banco (Drizzle)
│   └── email.ts          # Envio de e-mails
├── shared/               # Código compartilhado client/server
├── drizzle/              # Schema e migrações
├── scripts/              # Scripts utilitários (criar admin, etc.)
└── vite.config.ts
```

## Fluxo principal

1. **Cadastro:** promotor cria conta em `/cadastro-indicador` (bcrypt)
2. **Login:** `/login-indicador` → cookie JWT httpOnly
3. **Registrar indicação ou venda:** `/indicar`
4. **Acompanhar status:** `/minhas-indicacoes` e `/painel-promotor`
5. **Admin aprova vendas e configura comissões:** `/admin/*`
6. **Comissões exibidas:** `/comissoes`

## Estado de funcionalidades

| Fluxo | Status |
|---|---|
| Login / cadastro / recuperação de senha | Operacional |
| Painel do promotor | Operacional |
| Registro de indicações e vendas | Operacional |
| Admin: usuários, comissões, relatórios, ranking | Operacional |
| Classificação de leads (quente/frio) | Operacional |
| Notificações in-app | Operacional |
| Materiais de divulgação / apoio / QR codes | Operacional |
| Envio de e-mail | Requer SMTP configurado |
| OAuth externo | Opcional (desativado por padrão) |

## Troubleshooting

- **"Banco de dados não disponível"** — confira `DATABASE_URL`; rode `pnpm run db:push`.
- **Porta 3000 ocupada** — o servidor tenta portas 3000-3019 automaticamente.
- **Cookies não persistem em HTTP local** — já tratado: em HTTP, o backend usa
  `SameSite=Lax` ao invés de `None`.
- **E-mails não chegam** — configure `SMTP_*`. Sem SMTP, cadastros e
  recuperação funcionam mas sem notificação por e-mail.

## Licença

MIT
