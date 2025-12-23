# Plano de Simplificação do Sistema

## 🎯 OBJETIVO: Sistema SIMPLES e FUNCIONAL

**O que o sistema FAZ:**
1. Vendedores cadastram VENDAS ou INDICAÇÕES
2. Admin vê tudo, aprova e gerencia comissões
3. FIM!

---

## ✂️ O QUE REMOVER (Complexidade Desnecessária)

### Páginas/Features para REMOVER ou SIMPLIFICAR:
- ❌ `/vendedor` (rota separada confusa)
- ❌ `/classificar-lead/:id` (muito complexo)
- ❌ Múltiplos tipos de usuário (promotor/comercial/admin) → SIMPLIFICAR para: **Vendedor** e **Admin**
- ❌ Sistema de "leads" e "classificação" → SIMPLIFICAR para: **Venda** ou **Indicação**
- ❌ Materiais de apoio duplicados (admin e vendedor)
- ❌ Notificações complexas

### Páginas para MANTER (Essenciais):

**VENDEDOR:**
- ✅ `/` - Página inicial (explicação simples)
- ✅ `/cadastro` - Cadastro de vendedor
- ✅ `/login` - Login
- ✅ `/painel` - Dashboard do vendedor
- ✅ `/cadastrar-venda` - Cadastrar VENDA (100% comissão)
- ✅ `/cadastrar-indicacao` - Cadastrar INDICAÇÃO (50% comissão)
- ✅ `/minhas-vendas` - Ver vendas cadastradas
- ✅ `/minhas-comissoes` - Ver comissões a receber
- ✅ `/materiais` - Materiais de divulgação (Admin edita + Vendedor adiciona próprios)
- ✅ `/meu-link` - Link de checkout personalizado + QR Code
- ✅ `/meus-materiais` - Uploads e textos livres do vendedor
- ✅ `/perfil` - Editar perfil e chave PIX

**ADMIN:**
- ✅ `/admin` - Dashboard admin (ver todas vendas/indicações)
- ✅ `/admin/vendedores` - Gerenciar vendedores
- ✅ `/admin/configuracoes` - Configurar comissões, link checkout, campos editáveis
- ✅ `/admin/materiais` - Gerenciar materiais (textos, links, uploads FLEXÍVEIS)

---

## 📝 MUDANÇAS DE NOMENCLATURA

### Renomear TUDO:
- ❌ "Indicador" → ✅ "Vendedor"
- ❌ "Promotor" → ✅ "Vendedor"
- ❌ "Lead" → ✅ "Venda" ou "Indicação"
- ❌ "Indicação" (termo principal) → ✅ "Venda" (termo principal) + "Indicação" (secundário)

### Textos principais:
- **"Seja um Vendedor Vital!"**
- **"Venda e ganhe 100% de comissão"**
- **"Ou apenas indique e ganhe 50%"**

---

## 🔧 FLUXO SIMPLIFICADO

### VENDEDOR:
1. Cadastra-se
2. Acessa painel
3. Escolhe: **"Cadastrar Venda"** (destaque) ou **"Cadastrar Indicação"** (secundário)
4. Preenche dados do cliente
5. Aguarda aprovação do Admin
6. Recebe comissão via PIX

### ADMIN:
1. Vê todas vendas/indicações pendentes
2. Aprova ou rejeita
3. Sistema calcula comissão automaticamente
4. Admin paga via PIX (manual)
5. Marca como "Pago"

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Limpeza e Renomeação
- [ ] Remover rotas desnecessárias do App.tsx
- [ ] Renomear "Indicador" → "Vendedor" em TODOS os arquivos
- [ ] Simplificar schema do banco (remover campos desnecessários)
- [ ] Remover sistema de "classificar lead"

### Fase 2: Páginas Essenciais
- [ ] Criar página `/cadastrar-venda` (destaque)
- [ ] Criar página `/cadastrar-indicacao` (secundário)
- [ ] Simplificar dashboard do vendedor
- [ ] Simplificar dashboard do admin

### Fase 3: Flexibilidade (IMPORTANTE!)
- [ ] Admin pode editar materiais de apoio (textos, links, uploads)
- [ ] Vendedor tem espaço para textos livres (anotações)
- [ ] Vendedor pode fazer uploads próprios
- [ ] Página de link personalizado + QR Code para vendedor
- [ ] Admin pode adicionar campos editáveis customizados
- [ ] Sistema FLEXÍVEL (nada rígido)

### Fase 4: Testes e Entrega
- [ ] Testar fluxo completo
- [ ] Testar em mobile
- [ ] Salvar checkpoint

---

## 🚀 RESULTADO ESPERADO

**Sistema SIMPLES que qualquer um entende:**
- Vendedor: "Vou vender ou indicar?"
- Admin: "Vou aprovar e pagar"
- FIM!
