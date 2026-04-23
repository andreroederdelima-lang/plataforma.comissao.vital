# Plataforma Comissao Vital (Sua Saude Vital - Indicacoes)

Sistema de comissionamento e indicacoes para planos de saude Sua Saude Vital.
Promotores indicam clientes, comerciais classificam leads, admins gerenciam comissoes.

## Quick Start

```bash
pnpm install
cp .env.example .env  # preencher variaveis
pnpm db:push          # gerar e aplicar migrations (drizzle-kit generate + migrate)
pnpm dev              # servidor dev com hot reload (tsx watch)
pnpm build            # vite build (client) + esbuild (server)
pnpm start            # node dist/index.js (producao)
pnpm test             # vitest
pnpm check            # tsc --noEmit
```

## Folder Structure

```
client/
  src/
    App.tsx              # Router principal (wouter)
    pages/               # Paginas React (34 arquivos)
    components/          # Componentes reutilizaveis
      ui/                # Radix UI + shadcn/ui components
    _core/hooks/         # useAuth.ts
    contexts/            # ThemeContext
    hooks/               # Custom hooks
    lib/                 # Utilitarios
server/
  _core/
    index.ts             # Express server bootstrap
    trpc.ts              # tRPC setup (publicProcedure, protectedProcedure)
    context.ts           # JWT auth context
    env.ts               # ENV config object
    email.ts             # Notificacoes (owner, status change)
    oauth.ts             # OAuth routes
    vite.ts              # Dev/prod static serving
  routers.ts             # appRouter principal (tRPC)
  routers/               # Sub-routers (admin, auth, comissoes, etc.)
  routes/upload.ts       # Express route para upload de arquivos (multer)
  db.ts                  # Drizzle ORM connection (MySQL)
  email.ts               # SMTP email (nodemailer)
  storage.ts             # Storage proxy (Forge API)
shared/
  types.ts               # Re-exports de schema + errors
  const.ts               # Constantes compartilhadas
  _core/                 # Shared core utilities
drizzle/
  schema.ts              # Schema Drizzle ORM (MySQL)
  relations.ts           # Relacoes entre tabelas
  *.sql                  # Migrations (35 arquivos)
```

## Stack

- **Frontend**: React 19, Vite 7, wouter (routing), TanStack Query, Tailwind CSS 4, Radix UI/shadcn
- **Backend**: Express 4, tRPC 11, Drizzle ORM, MySQL (mysql2)
- **Auth**: JWT (jsonwebtoken/jose) + bcryptjs, cookie-based sessions
- **Storage**: Forge API proxy (storagePut/storageGet em server/storage.ts)
- **Email**: Nodemailer (SMTP) + Resend API
- **PDF**: jspdf + jspdf-autotable
- **Charts**: Recharts
- **Package manager**: pnpm

## Key Patterns

### tRPC
- Router principal em `server/routers.ts`, sub-routers em `server/routers/`
- `publicProcedure` para rotas abertas, `protectedProcedure` para autenticadas
- Endpoint: `/api/trpc`
- Validacao com Zod

### Database (Drizzle + MySQL)
- Schema em `drizzle/schema.ts` (12 tabelas)
- Migrations: `pnpm db:push` (generate + migrate)
- Connection lazy em `server/db.ts`
- Valores monetarios em centavos (int)

### Auth
- Login por email/senha (bcryptjs hash)
- JWT token no cookie (COOKIE_NAME de @shared/const)
- Roles: `promotor`, `comercial`, `admin`
- Context extrai user do JWT em `server/_core/context.ts`

### File Upload
- POST `/api/upload` (multer, 50MB max)
- Tipos: imagens, PDF, video
- Storage via Forge API proxy

### Path Aliases
- `@/` -> `client/src/`
- `@shared/` -> `shared/`
- `@assets/` -> `attached_assets/`

## Database Tables

| Table | Descricao |
|-------|-----------|
| users | Usuarios (promotor/comercial/admin) |
| indicacoes | Indicacoes de clientes |
| notificacoes | Notificacoes in-app |
| comissaoConfig | Config de comissao por tipo de plano |
| planos_saude | Planos disponiveis |
| configuracao_comissoes | Percentuais indicador/vendedor |
| materiais | Materiais de divulgacao (S3) |
| materiais_divulgacao | Textos editaveis (argumentos, promo) |
| materiais_diversos | PDFs, links, videos |
| materiais_promotores | Materiais personalizados por promotor |
| materiais_apoio | Banners e videos para download |
| cards_recursos | Cards gerenciaveis (recursos/landing pages) |
| qr_codes | QR Codes personalizados |
| password_reset_tokens | Tokens de recuperacao de senha |
| configuracoes_gerais | Config global (checkout, WhatsApp, precos) |

## Routes (Frontend)

**Publicas**: `/`, `/login`, `/login-indicador`, `/cadastro-indicador`, `/esqueci-senha`, `/recuperar-senha`, `/qr-whatsapp`, `/tabela-comissoes`

**Promotor**: `/indicar`, `/minhas-indicacoes`, `/painel-promotor`, `/perfil`, `/meu-perfil`, `/comissoes`, `/materiais-divulgacao`, `/materiais-apoio`, `/qr-codes`, `/estatisticas`, `/notificacoes`

**Admin**: `/admin`, `/admin/usuarios`, `/admin/configuracoes`, `/admin/materiais`, `/admin/materiais-apoio`, `/admin/aprovar-comissoes`, `/admin/gerenciar-cards`, `/admin/ranking`, `/admin/relatorios`, `/admin/monitoramento`, `/admin/conferir-vendas`

## Scripts Utilitarios

- `scripts/criar-admin.mjs` - Criar usuario admin
- `seed-planos-comissoes.mjs` - Seed de planos e comissoes
- `create-vendedor.mjs` - Criar vendedor manual
- `migrate-status.mjs` / `migrate-new-status.mjs` - Migrations manuais

## Testing

- Vitest (`pnpm test`)
- Testes em `server/tests/`
- Config em `vitest.config.ts`
