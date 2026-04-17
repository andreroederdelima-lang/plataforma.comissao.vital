# TODO — Plataforma de Comissionamento Vital

**Data:** 2026-04-16
**Branch:** `claude/prepare-vendor-platform-RfUBj`
**Stack:** Vite + React 19 + tRPC 11 + Express + Drizzle + MySQL (TiDB Cloud)
**Objetivo:** deixar a plataforma pronta para uso real pelos vendedores da Rede Vital.

Legendas:
- 🔴 **BLOQUEADOR** — impede uso em produção ou corrompe a experiência do vendedor
- 🟠 **ALTA** — deve ser corrigido antes de escalar para mais usuários
- 🟡 **MÉDIA** — qualidade/manutenção; adia sem bloquear
- 🟢 **BAIXA** — polimento

---

## 🔴 BLOQUEADORES

### B1. Bug de display: promotor vê comissão 100× inflacionada
- **Onde:** `client/src/pages/Comissoes.tsx:135` e `:173`
- **O que:** o backend grava `valorComissao` em **centavos** (ex.: `28990` = R$ 289,90). A view de admin divide por 100 (linhas 266, 303, 338), mas a view do promotor chama `.toFixed(2)` direto sobre centavos.
- **Impacto:** vendedor vê "R$ 28.990,00" quando deveria ver "R$ 289,90". Expectativa salarial inflada → conflito certo.
- **Correção:** dividir por 100 como o resto do app.
- **Status:** ✅ **CORRIGIDO** nesta passada (fix seguro de display, a lógica de cálculo no backend não foi tocada).

### B2. Não existe integração com rede.vital
- **Onde:** nenhum arquivo do repo referencia `rede.vital` / `redevital`. O domínio real usado é `suasaudevital.com.br` (`server/email.ts:195`, queries em `.manus/db/`).
- **O que:** o "checkout" é um link manual (`configuracoes_gerais.linkCheckoutBase` + `?ref={código}`). Não há webhook, API, tracking automatizado ou reconciliação de vendas com sistema externo.
- **Impacto:** toda venda depende de alguém entrar no admin e mudar o status de `aguardando_contato → venda_fechada` manualmente. Não escala.
- **Correção:** decidir com o time comercial qual a integração esperada. Opções:
  1. Webhook do gateway de pagamento → PATCH automático em `indicacoes.status`;
  2. Endpoint público `/api/webhook/venda-confirmada` validado por HMAC;
  3. Polling/import CSV se o gateway não expõe webhook.
- **Status:** ⚠️ **AGUARDA DECISÃO DE PRODUTO** (não é código — é definição).

### B3. Comissão "zerada" em produção
- **Onde:** `comissaoConfig.valorComissao`, `planosSaude.bonificacaoPadrao`, `configuracoes_gerais.valorPlano*` — todos com default `0`.
- **O que:** `RELATORIO_AUDITORIA.md` já reportava isso em 11/12/2025. Se os valores não forem configurados, `classificarLead()`/`validarVenda()` (server/db.ts:695-827) gravam comissão = 0.
- **Correção:** rodar `seed-planos-comissoes.mjs` em produção (ou criar um seed idempotente) para garantir valores mínimos. Validar no admin antes de liberar cadastro público.
- **Status:** aguarda confirmação de valores oficiais pelo time Vital.

### B4. Nomenclatura fragmentada "indicador/promotor/vendedor"
- **Onde:**
  - Rotas: `/cadastro-indicador`, `/login-indicador`, `/boas-vindas-indicadores`, mas também `/painel-promotor`, `/vendedor`, `/comissoes`.
  - Router tRPC: `authIndicadoresRouter` lado a lado com páginas "Vendedor".
  - `CREDENCIAIS.md:21` referencia `/painel-vendedor` que **não existe** (a rota real é `/painel-promotor`).
  - Sidebar (`PainelVendedorLayout.tsx:119,176`) condiciona label "Promotor"/"Vendedor" por `meuIndicador.tipo`, que vem de `role === "comercial"` (ver `server/routers.ts:520`). Ou seja, o vendedor comum vê "Promotor", e apenas o comercial vê "Vendedor". Incoerente com a copy de landing que fala "PROMOTOR VITAL" para todos.
- **Impacto:** usuário se confunde ao ler o cadastro, o email de convite e o menu.
- **Correção:** escolher **um** termo canônico (sugestão: **"Vendedor"**, já que a URL do projeto é `plataforma.comissao.vital` e a tabela é de comissionamento) e aplicar:
  - renomear rotas públicas com alias temporários;
  - renomear enum `users.role` (promotor → vendedor) via migration nova;
  - renomear router `authIndicadores` → `authVendedores` com import shim.
- **Status:** pendente — operação grande, quebra sessões antigas; precisa de janela de deploy.

### B5. Zero testes em lógica de comissão
- **Onde:** `server/tests/` tem apenas `materiaisDivulgacao.test.ts` (CRUD de textos). Nada cobrindo `classificarLead`, `validarVenda`, `aprovarComissao`, split quente/frio, split 50/50 com `vendedorSecundarioId`.
- **Impacto:** qualquer refactor na engine de comissão quebra produção em silêncio.
- **Correção mínima:** criar `server/tests/comissoes.test.ts` com casos:
  - venda direta → 100% da `bonificacaoPadrao`;
  - indicação quente → `percentualIndicador` de `bonificacaoPadrao`;
  - indicação fria → idem com `configuracaoComissoes.frio`;
  - carência de 7 dias em `aprovarComissao`;
  - bloqueio de dupla aprovação.
- **Status:** pendente.

---

## 🟠 ALTA

### A1. Segredos e dump de banco versionados no repo
- **Onde:**
  - `CREDENCIAIS.md` commitado com `admin@vital.com / admin123` em plaintext.
  - `.manus/db/*.json` (27+ arquivos) contém SQL com host real da TiDB, usuário, `passwordHash` bcrypt de usuários de produção e `DELETE FROM users` executados.
- **Impacto:** exposição de dados sensíveis + superfície de ataque.
- **Correção aplicada parcialmente:** `.manus/` adicionado ao `.gitignore` nesta passada. Ainda precisa:
  - remover `.manus/` do histórico do git (`git filter-repo` ou `git rm -r --cached .manus`);
  - trocar a senha `admin123`;
  - remover `CREDENCIAIS.md` do versionamento (mover para um vault).
- **Status:** ⚠️ ação humana necessária.

### A2. `server/routers.ts` é um monólito de 989 linhas
- **Onde:** `server/routers.ts` — mistura auth, indicações, comissão, notificações, usuários, ranking em um arquivo só. Os routers modulares em `server/routers/` existem, mas esse arquivo centraliza a maior parte.
- **Impacto:** merge conflicts, difícil de revisar, acoplamento com `db.ts` (1000+ linhas provável).
- **Correção:** extrair `indicacoes`, `usuarios`, `auth`, `notificacoes`, `ranking`, `comissaoConfig` para arquivos dedicados em `server/routers/`.

### A3. `Home.tsx` (formulário de cadastro de venda/indicação) tem 704 linhas
- **Onde:** `client/src/pages/Home.tsx`.
- **O que:** formulário controlado monolítico sem `react-hook-form`/`zod` (apesar de ambos estarem no `package.json`). Validação inexistente; branches `isVenda` espalhadas por toda a UI.
- **Correção:** migrar para `react-hook-form` + `zodResolver` + componentizar (`<DadosCliente>`, `<DadosPlano>`, `<DadosVenda>`).

### A4. Painel do admin precisa de configuração inicial para funcionar
- **Onde:** `AdminConfiguracoes.tsx` / `configuracoes_gerais`.
- **O que:** sem preencher `linkCheckoutBase`, `whatsappNumero`, valores de planos e a tabela `comissaoConfig`, o cadastro falha silenciosamente (valor_plano = null/0).
- **Correção:** bloquear rota de cadastro (`/indicar`) com um banner "Configuração pendente" se algum desses campos estiver vazio; mostrar para o admin um checklist de setup obrigatório.

### A5. Admin não tem confirmação antes de pagar / registrar pagamento
- **Onde:** `AdminAprovarComissoes.tsx`, `admin.aprovarComissao`.
- **O que:** aprovação marca `dataAprovacao` mas não há campo `dataPagamento`/`pagoEm`, nem controle de quem pagou. O fluxo "Admin paga via PIX manual" do `PLANO_SIMPLIFICACAO.md` não está implementado.
- **Correção:** adicionar colunas `dataPagamento`, `pagoPorUserId`, `comprovantePagamento` em `indicacoes` e uma tela de conciliação.

### A6. Múltiplos arquivos `.md` de auditoria desalinhados
- **Onde:** `AUDITORIA_COMPLETA_SISTEMA.md`, `CHECKLIST_PRAGMATICA.md`, `PLANO_SIMPLIFICACAO.md`, `PROBLEMAS_NAVEGACAO.md`, `RELATORIO_AUDITORIA.md`, `RELATORIO_MUDANCAS_BIBLIOTECA.md`, `todo.md` (2.6k linhas), `CREDENCIAIS.md`.
- **Impacto:** fonte da verdade é este arquivo (`TODO_COMISSAO.md`). Os outros estão desatualizados e contradizem o estado real.
- **Correção sugerida:** mover para `docs/archive/` ou deletar.
- **Status:** não aplicado automaticamente por cautela — decidir com o time.

---

## 🟡 MÉDIA

### M1. 35 migrations Drizzle com nomes aleatórios
- **Onde:** `drizzle/0000_spicy_serpent_society.sql` … `0034_serious_maverick.sql`.
- **Impacto:** impossível entender histórico de schema sem abrir cada arquivo. `pnpm-lock.yaml` está no repo, mas o snapshot Drizzle (`drizzle/meta/_journal.json`) precisa estar coerente com produção.
- **Correção:** após o próximo deploy estável, considerar consolidar em `0000_baseline.sql` + migrations posteriores nomeadas ("add_validado_vendedor", "rename_indicacao_para_venda" etc.).

### M2. Scripts `.mjs` soltos na raiz
- **Onde:** `create-vendedor.mjs`, `migrate-status.mjs`, `migrate-new-status.mjs`, `seed-planos-comissoes.mjs`, `test-email.mjs`, `test-resend.mjs`.
- **Impacto:** não está claro quais são one-shot já executados. `migrate-status.mjs` + `migrate-new-status.mjs` sugerem execução incompleta.
- **Correção:** mover para `scripts/` com README explicando quando rodar; deletar os dois migrate se já foram aplicados.

### M3. Página `/vendedor` e `/classificar-lead/:id` duplicam fluxos
- **Onde:** `Vendedor.tsx` (422 linhas) e `ClassificarLead.tsx`.
- **O que:** `PLANO_SIMPLIFICACAO.md` já marcava para remover. O layout atual empurra o usuário pelo `/painel-promotor`.
- **Correção:** deprecar `/vendedor` com redirect → `/painel-promotor` e remover `ClassificarLead` em favor de um modal dentro do admin.

### M4. Componentes "Manus" residuais
- **Onde:** `client/src/components/ManusDialog.tsx`, `vite-plugin-manus-runtime` em `vite.config.ts`, `VITE_OAUTH_PORTAL_URL=https://manus.im`.
- **Impacto:** dependência opcional do template Manus. OAuth local funciona, então Manus OAuth é dead code em produção.
- **Correção:** decidir se o sistema ainda usa OAuth Manus. Se não, remover `_core/oauth.ts`, plugin e `ManusDialog`.

### M5. Faltam índices no schema
- **Onde:** `drizzle/schema.ts`.
- **O que:** nenhum índice explícito em `indicacoes.parceiroId`, `indicacoes.status`, `users.email` (apesar de frequentemente consultado). Só há `unique` em `openId` e `tipoLead`.
- **Correção:** adicionar índices nas colunas mais filtradas (`parceiroId`, `status`, `dataVenda`, `dataAprovacao`).

### M6. `getComissoes` usa `filter()` em memória
- **Onde:** `server/routers.ts:486-488` — `getAllIndicacoes()` traz tudo e filtra no Node.
- **Correção:** `WHERE status = 'venda_fechada'` no SQL.

### M7. `listarPendentesAprovacao` também filtra em memória
- **Onde:** `server/routers/admin.ts:117-128`.
- **Correção:** filtrar via SQL (`isNotNull(dataVenda)`, `isNull(dataAprovacao)`, `dataVenda <= NOW() - INTERVAL 7 DAY`).

### M8. Landing page não mostra valores calculados
- **Onde:** `BoasVindasIndicadores.tsx`.
- **O que:** só diz "comissão", "benefícios reais". Não exibe intervalo concreto ("Ganhe R$ X a R$ Y por venda"). `TabelaComissoes.tsx` tem os números, mas o usuário só chega lá clicando em um link secundário.
- **Correção:** trazer um bloco com 3 valores destaque (min, média, máx) na própria landing.

### M9. Footer com ano fixo "© 2024"
- **Onde:** `client/src/pages/Comissoes.tsx:359`.
- **Correção aplicada:** trocar por `new Date().getFullYear()`.
- **Status:** ✅ **CORRIGIDO**.

---

## 🟢 BAIXA

### L1. `.gitignore` não cobria `.manus/`
- **Status:** ✅ **CORRIGIDO**.

### L2. `CREDENCIAIS.md:21` menciona rota inexistente `/painel-vendedor`
- **Correção aplicada:** atualizado para `/painel-promotor` (que é a rota real em `App.tsx:48`).
- **Status:** ✅ **CORRIGIDO**.

### L3. Textos "indicador" ainda em botões secundários
- **Onde:** `BoasVindasIndicadores.tsx:113` ("Vendedor/Promotor"). Copy aceitável, mas `authIndicadoresRouter` no backend é nome interno confuso.

### L4. Dois pacotes de bcrypt instalados
- **Onde:** `package.json` lista `bcrypt@^6` **e** `bcryptjs@^3`. Só `bcryptjs` é usado no código (`routers.ts:48,766`).
- **Correção:** remover `bcrypt` + `@types/bcrypt`.

### L5. `@types/google.maps` em devDependencies, mas `Map.tsx` (único consumidor) provavelmente só é usado em uma página opcional
- **Correção:** verificar uso; remover se morto.

### L6. Prettier config sem ESLint
- **Onde:** `.prettierrc` existe, mas não há `eslint.config.*`. Convém pelo menos um `eslint:recommended` para detectar `// TODO` esquecidos e variáveis não usadas.

### L7. Falta favicon customizado e meta tags SEO em `client/index.html`
- **Impacto:** aparência no compartilhamento do link (WhatsApp, Instagram) é genérica.

### L8. `NotificationBadge` faz polling a cada 30s (`PainelVendedorLayout.tsx:36`)
- **Impacto:** sobrecarga leve no TiDB. Considerar SSE/WebSocket num futuro.

---

## ⚠️ NÃO TOQUEI (precisa de autorização explícita)

- Lógica de cálculo em `server/db.ts:695-827` (`classificarLead`, `validarVenda`). Conforme instrução, qualquer mudança nesses trechos deve ser aprovada antes.
- Schema do banco (`drizzle/schema.ts`). Mudanças aqui geram migration nova e risco de downtime.
- Tabela `comissaoConfig`/`planosSaude` em produção — valores zerados são problema de seed, não de código.
- `CREDENCIAIS.md` e `.manus/` — apenas ignorei via `.gitignore`; remover do histórico exige decisão e `git filter-repo`.

---

## ✅ APLICADO NESTA PASSADA

1. `.gitignore` — adicionado `.manus/` e `CREDENCIAIS.md` para evitar novos commits de segredos.
2. `client/src/pages/Comissoes.tsx` — corrigido display 100× inflacionado na view do promotor (linhas 135 e 173). DB e backend não foram tocados.
3. `client/src/pages/Comissoes.tsx` — footer `© 2024` → `© {new Date().getFullYear()}`.
4. `CREDENCIAIS.md` — corrigida rota `/painel-vendedor` → `/painel-promotor`.
5. `TODO_COMISSAO.md` — este arquivo, fonte única da verdade do backlog.
