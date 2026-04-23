# Architecture - Plataforma Comissao Vital

## Overview

Monolithic full-stack app: React SPA + Express API server in a single codebase.
Client communicates with server exclusively via tRPC (type-safe RPC), except file uploads
which use a standard Express route.

```
Browser (React SPA)
  |
  |-- tRPC Client (@trpc/react-query + TanStack Query)
  |     |
  |     v
  |   /api/trpc  -->  Express + tRPC adapter  -->  appRouter  -->  Drizzle ORM  -->  MySQL
  |
  |-- POST /api/upload  -->  multer  -->  Forge Storage Proxy
  |
  |-- /api/oauth/callback  -->  OAuth flow (Manus)
```

## Server Architecture

### Entry Point
`server/_core/index.ts` - Express app with:
1. JSON body parser (50MB limit)
2. Cookie parser
3. OAuth routes
4. Upload route (`/api/upload`)
5. tRPC middleware (`/api/trpc`)
6. Vite dev server (development) or static file serving (production)

### tRPC Layer
- `server/_core/trpc.ts` - Base router, procedures (public/protected)
- `server/_core/context.ts` - Extracts JWT from cookie, resolves user
- `server/routers.ts` - Root `appRouter` with inline routers (auth, indicacoes, comissaoConfig, notificacoes, usuarios, ranking)
- `server/routers/*.ts` - Separate router files (admin, comissoes, materiais, relatorios, etc.)

### Database
- Drizzle ORM with MySQL dialect
- Lazy singleton connection in `server/db.ts`
- Schema defined in `drizzle/schema.ts`
- Migrations managed by drizzle-kit (SQL files in `drizzle/`)

### Authentication
- JWT-based, stored in HTTP cookie
- Login: email + bcrypt password verification -> JWT token -> cookie
- Context middleware reads cookie, verifies JWT, attaches user to context
- Three roles: `promotor` (default), `comercial`, `admin`
- Role-based access enforced in each procedure

### Storage
- `server/storage.ts` - Proxy to Forge API (BUILT_IN_FORGE_API_URL)
- Upload route in `server/routes/upload.ts` uses multer for multipart
- Files stored under `materiais/` prefix with random names

### Email
- `server/email.ts` - Nodemailer SMTP transport
- `server/_core/email.ts` - Business email functions (new indicacao, status change, venda fechada)
- Resend API available as alternative

## Client Architecture

### Routing
- wouter (lightweight React router)
- All routes defined in `client/src/App.tsx`
- No nested routing - flat route structure

### State Management
- TanStack Query for server state (via tRPC)
- React context for theme
- No global client state library

### UI Components
- shadcn/ui components in `client/src/components/ui/`
- Radix UI primitives
- Tailwind CSS 4 for styling
- Lucide icons
- Recharts for data visualization

### Layouts
- `AdminLayout.tsx` - Admin panel wrapper
- `DashboardLayout.tsx` - General dashboard
- `PainelVendedorLayout.tsx` - Promoter/seller panel

### Key Pages by Role

**Promotor (Seller)**:
- Dashboard with stats, recent indicacoes
- Create new indicacao (lead referral)
- View own indicacoes and commissions
- Download marketing materials, QR codes
- Profile management

**Comercial (Sales)**:
- Classify leads (hot/cold)
- Validate direct sales
- View all indicacoes

**Admin**:
- Full user management (CRUD, role changes, activate/deactivate)
- Commission configuration per plan type
- Approve commissions
- Marketing materials management (upload banners, videos, PDFs)
- Reports and monitoring
- Rankings (top sellers, top referrers)

## Data Flow: Indicacao Lifecycle

```
Promotor creates indicacao
  -> status: "aguardando_contato"
  -> email notification to owner/team
  |
Comercial classifies lead (quente/frio)
  -> determines commission split percentage
  |
Comercial/Admin updates status
  -> "em_negociacao" | "venda_com_objecoes" | "venda_fechada" | "nao_comprou" | "cliente_sem_interesse"
  -> in-app notification to promotor
  -> email notification on problematic statuses
  |
If "venda_fechada":
  -> Commission calculated (plan value * percentage * lead type split)
  -> Admin approves commission payment
```

## Build & Deploy

- **Dev**: `tsx watch` for server hot reload + Vite HMR for client
- **Build**: Vite builds client to `dist/public/`, esbuild bundles server to `dist/index.js`
- **Production**: Single `node dist/index.js` serves both API and static files
- Port auto-detection: tries PORT env var, falls back to scanning 3000-3019
