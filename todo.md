# TODO - Sistema de Indicações Sua Saúde Vital

## Funcionalidades Principais

- [x] Configurar schema do banco de dados para indicações
- [x] Implementar rotas tRPC para criar e listar indicações
- [x] Adicionar logo da Sua Saúde Vital no site
- [x] Criar formulário de indicação com campos:
  - Nome da pessoa indicada
  - WhatsApp da pessoa indicada
  - Tipo de plano (Familiar/Individual)
  - Categoria (Empresarial/Pessoa Física)
  - Campo de observações
- [x] Implementar painel administrativo para visualizar indicações
- [x] Adicionar filtros e busca no painel administrativo
- [x] Exibir informações do parceiro que fez a indicação
- [x] Criar sistema de autenticação para parceiros
- [x] Testar todas as funcionalidades
- [x] Salvar checkpoint final

## Notificações Personalizadas

- [x] Implementar notificação ao proprietário quando nova indicação é criada
- [x] Implementar schema de notificações no banco de dados
- [x] Criar sistema de notificações in-app para parceiros
- [x] Notificar parceiros quando status de indicação mudar
- [x] Adicionar badge de notificações não lidas no header
- [x] Criar página de visualização de notificações
- [x] Testar todas as notificações
- [x] Salvar checkpoint com sistema de notificações

## Ajustes de Nomenclatura

- [x] Alterar "plano de saúde" para "plano de assinatura" em todas as páginas
- [x] Atualizar textos do formulário
- [x] Atualizar descrições e labels

## Correção de Texto de Compartilhamento

- [x] Encontrar e corrigir "plano de saúde" no texto de compartilhamento/meta tags
- [x] Atualizar título e descrição do site
- [x] Testar compartilhamento do link

## Melhorias e Novas Funcionalidades

- [x] Alterar status das indicações para: Falando com Vendedor, Venda fechada, Não respondeu vendedor, Não comprou
- [x] Atualizar schema do banco de dados com novos status
- [x] Criar role "vendedor" no sistema
- [x] Implementar controle de acesso para vendedor (apenas visualizar e alterar status)
- [x] Criar credenciais para vendedor (comercial@suasaudevital.com.br)
- [x] Implementar envio de email quando nova indicação é criada
- [x] Implementar envio de email quando status é alterado
- [x] Configurar emails: administrativo@suasaudevital.com.br e comercial@suasaudevital.com.br
- [x] Adicionar botão de exportação para Excel/CSV
- [x] Criar dashboard de estatísticas por parceiro
- [x] Melhorar logo - aumentar tamanho e ajustar fundo
- [x] Testar todas as novas funcionalidades
- [x] Salvar checkpoint final com todas as melhorias

## Correção do Logo

- [x] Substituir logo atual pelo logo correto fornecido
- [x] Garantir que o logo seja exibido corretamente em todas as páginas
- [x] Testar visualização do logo
- [x] Salvar checkpoint com logo corrigido

## Reorganização de Status e Emails Automáticos

- [x] Reorganizar status das indicações com mais detalhes:
  - Aguardando Contato
  - Em Negociação
  - Venda com Objeções (envia email)
  - Venda Fechada
  - Não Comprou (envia email)
  - Cliente Sem Interesse (envia email)
- [x] Implementar envio de email para administrativo quando status problemático
- [x] Implementar envio de email para parceiro quando status problemático
- [x] Atualizar schema do banco de dados com novos status
- [x] Atualizar todas as páginas com novos status
- [x] Testar sistema de emails
- [x] Salvar checkpoint final

## Ajustes de UX e Logo

- [x] Remover fundo branco do logo
- [x] Aumentar tamanho do logo na página inicial para melhor visibilidade
- [x] Adicionar orientação no campo "Tipo de Assinatura" (empresarial = nome da empresa)
- [x] Adicionar campo condicional para nome da empresa quando escolher "Empresarial"
- [x] Pré-preencher campo de observações com exemplos:
  - "Tem 5 filhos pequenos e um marido"
  - "Quer dar para empregada doméstica e avó"
  - "Tem mãe acamada"
- [x] Testar todos os ajustes
- [x] Salvar checkpoint final

## Reverter Logo Original

- [x] Voltar a usar logo original fornecido (logo-vital.png)
- [x] Manter tamanho aumentado (h-24)
- [x] Testar visualização
- [x] Salvar checkpoint final

## Sistema de Comissões e PIX

- [x] Adicionar campo de valor de comissão na tabela de indicações
- [x] Adicionar campo de tipo de comissão (valor fixo ou percentual)
- [x] Adicionar campo de chave PIX na tabela de usuários
- [x] Implementar campo de comissão na área admin para cada indicação
- [x] Criar cálculo automático de comissões por parceiro
- [x] Adicionar campo de chave PIX no perfil do parceiro
- [x] Criar página de relatório de comissões
- [x] Testar cálculos e funcionalidades
- [x] Salvar checkpoint final

## Atualização de Logo

- [x] Copiar novo logo "VITAL - Cuidado e Proteção" para o projeto
- [x] Atualizar const.ts com novo logo
- [x] Verificar que o logo está sendo exibido em todas as páginas
- [x] Testar visualização
- [x] Salvar checkpoint final

## Atualização para Logo Horizontal

- [x] Copiar logo horizontal para o projeto
- [x] Atualizar const.ts
- [x] Testar visualização
- [x] Salvar checkpoint

## Atualização para Logo VITAL - Serviços Médicos

- [x] Copiar novo logo para o projeto
- [x] Atualizar const.ts
- [x] Testar visualização
- [x] Salvar checkpoint

## Sistema de Configuração de Comissões por Tipo de Plano

- [x] Criar tabela comissaoConfig no banco de dados (tipo de plano, valor)
- [x] Implementar procedures para gerenciar configurações de comissão
- [x] Criar interface no painel admin para editar valores de comissão por plano
- [x] Atualizar cálculo automático de comissões baseado nos valores configurados
- [x] Atualizar página de relatório de comissões para usar novos valores
- [x] Testar cálculo automático com diferentes cenários
- [x] Salvar checkpoint

## Remover Campos Manuais de Comissão da Tabela

- [x] Remover coluna de comissão manual (Tipo + Valor) da tabela de indicações
- [x] Adicionar coluna mostrando valor calculado automaticamente baseado no tipo de plano
- [x] Testar visualização
- [x] Salvar checkpoint

## Menu Lateral e Página de Configurações de Comissão

- [x] Criar componente de menu lateral (sidebar) para o painel admin
- [x] Adicionar abas no menu: Indicações, Configurações, Estatísticas, Comissões
- [x] Criar página dedicada /admin/configuracoes para configurações de comissão
- [x] Implementar campos de entrada em formato R$ (reais) ao invés de centavos
- [x] Adicionar conversão automática de R$ para centavos no frontend
- [x] Remover seção de configuração da página Admin principal
- [x] Testar navegação entre abas
- [x] Salvar checkpoint

## Expandir Tipos de Planos e Categorias de Comissão

- [x] Atualizar schema para incluir tipo de plano (Essencial/Premium) na tabela comissaoConfig
- [x] Atualizar schema para suportar combinações: Essencial Individual, Essencial Familiar, Essencial Empresarial Individual, Essencial Empresarial Familiar, Premium Individual, Premium Familiar, Premium Empresarial Individual, Premium Empresarial Familiar
- [x] Atualizar procedures do backend para novos campos
- [x] Atualizar interface de configurações com cards organizados por tipo e categoria
- [x] Adicionar campo "Tipo de Plano" no formulário de indicações
- [x] Ajustar cálculo automático para considerar tipo de plano + categoria
- [x] Testar todas as combinações
- [x] Salvar checkpoint

## Corrigir Layout da Tabela de Indicações

- [x] Ajustar largura e scroll da tabela no painel admin
- [x] Garantir que coluna de Comissão seja totalmente visível
- [x] Testar responsividade em mobile e web
- [x] Salvar checkpoint

## Adicionar Usuário Comercial com Permissões Limitadas

- [x] Adicionar comercial@suasaudevital.com.br ao banco de dados como admin
- [x] Criar campo de permissão no schema (admin_completo vs admin_comercial)
- [x] Implementar lógica de permissões no backend
- [x] Ocultar botões de exclusão para admin comercial no frontend (não há botões de exclusão no sistema)
- [x] Testar login e permissões do usuário comercial
- [x] Salvar checkpoint

## Painel de Gerenciamento de Usuários

- [x] Adicionar campo isActive ao schema de users
- [x] Criar procedures para listar, criar, editar, ativar/desativar usuários
- [x] Criar página AdminUsuarios.tsx com tabela de usuários
- [x] Implementar formulário de criação de novo vendedor
- [x] Implementar edição de informações do usuário
- [x] Implementar toggle ativar/desativar usuário
- [ ] Implementar sistema de envio de convites por e-mail (requer configuração SMTP - implementar depois)
- [x] Adicionar aba "Usuários" no menu lateral do admin
- [x] Testar todas as funcionalidades
- [x] Salvar checkpoint

## Sistema de Convites por E-mail

- [x] Instalar biblioteca nodemailer
- [x] Criar módulo de envio de e-mails (server/email.ts)
- [x] Criar template de e-mail de convite
- [x] Integrar envio de e-mail ao criar novo vendedor
- [x] Solicitar credenciais SMTP do Gmail
- [ ] Testar envio de convite
- [x] Salvar checkpoint

## Integrar SMTP com Notificações de Parceiros

- [x] Adicionar função genérica de envio de e-mail no módulo email.ts
- [x] Atualizar _core/email.ts para usar SMTP real ao invés de console.log
- [x] Testar envio de e-mail para parceiro (integração completa)
- [x] Salvar checkpoint

## Resolver Problema de Envio de E-mail

- [x] Criar script de teste SMTP
- [x] Testar com credenciais atuais
- [x] Verificar erro específico (espaços extras em SMTP_HOST)
- [x] Migrar para Resend (API Key recebida)
- [x] Adaptar módulo email.ts para Resend
- [x] Configurar RESEND_API_KEY
- [x] Testar envio com Resend (sucesso!)
- [x] Salvar checkpoint

## Melhorias de UX e Funcionalidades

- [x] Adicionar botão na página inicial para vendedor acessar seu painel
- [x] Corrigir botão de e-mail no gerenciamento de usuários (deve reenviar convite)
- [x] Implementar funcionalidade de exclusão de usuários com confirmação

## Botão de Login Visível na Página Inicial

- [x] Adicionar botão de login visível na página inicial (antes do login) para vendedores e admins acessarem o sistema

## Botão de Acesso à Área do Vendedor na Página Inicial

- [x] Adicionar botão destacado no início da página de indicação para vendedores acessarem sua área

## Ajustes de Visibilidade e Responsividade

- [x] Tornar banner de acesso à área do vendedor visível para todos os usuários
- [x] Corrigir layout responsivo do banner para mobile (evitar elementos tortos)

## Correção de Navegação do Botão do Vendedor

- [x] Verificar e corrigir navegação do botão de acesso ao painel do vendedor
- [x] Garantir que a rota /vendedor existe e está configurada corretamente

## Correções de Layout Mobile e Navegação

- [x] Corrigir header desalinhado no mobile (texto sobrepondo logo e links)
- [x] Corrigir botão "Acessar Painel do Vendedor" que não está redirecionando

## Menu Hambúrguer Mobile e Correção de Navegação

- [x] Corrigir botão "Acessar Painel do Vendedor" no banner que ainda não está funcionando
- [x] Adicionar menu hambúrguer no mobile para acessar "Minhas Indicações" e "Meu Perfil"

## Correção para Role 'Comercial'

- [x] Verificar se página /vendedor existe
- [x] Corrigir lógica do botão para reconhecer role 'comercial' (não apenas 'vendedor')
- [x] Testar navegação com usuário comercial

## Problema Persistente: Botão do Vendedor Não Abre Página

- [x] Investigar por que o botão "Acessar Painel do Vendedor" ainda não está funcionando
- [x] Verificar se há erros no console do navegador
- [x] Confirmar que a rota /vendedor está corretamente configurada
- [x] Testar navegação programática
- [x] Corrigir verificação de role na página Vendedor.tsx para aceitar 'comercial'

## Liberar Página Admin para Vendedores/Comerciais com Restrições

- [x] Modificar página Admin.tsx para aceitar vendedores e comerciais
- [x] Ocultar botões de deletar indicações para não-admins
- [x] Ocultar menu "Usuários" para não-admins
- [x] Ocultar menu "Configurações" para não-admins
- [x] Atualizar botão da home para redirecionar vendedores/comerciais para /admin
- [x] Testar acesso completo com usuário comercial

## Problema: Acesso Negado para Usuário Vendedor Ativo

- [x] Investigar por que usuário com role "vendedor" ativo ainda recebe mensagem de acesso negado
- [x] Verificar se o role está sendo salvo corretamente no banco de dados
- [x] Verificar se há problema de cache ou sessão antiga
- [ ] Testar logout e login novamente (solução: usuário precisa fazer logout e login para renovar sessão)

## Invalidação Automática de Sessão ao Alterar Role

- [x] Adicionar campo lastRoleChange ao schema de usuários
- [x] Atualizar procedure de edição de usuário para registrar timestamp de mudança de role
- [x] Modificar verificação de autenticação para comparar timestamp da sessão com lastRoleChange
- [x] Testar: admin altera role → usuário é deslogado automaticamente

## Simplificação do Sistema de Vendedores

- [ ] Adicionar coluna de classificação/status na tabela de indicações do painel admin
- [ ] Permitir admin alterar status das indicações diretamente
- [ ] Criar tabela de vendedores separada (apenas nome e chave PIX, sem conta Manus)
- [ ] Adicionar página de cadastro de vendedores no painel admin
- [ ] Atualizar formulário de indicação para selecionar vendedor da lista
- [ ] Testar fluxo: cadastrar vendedor → registrar indicação → classificar indicação

## Bug Crítico: Erro ao Classificar Indicação

- [x] Investigar erro "NotFoundError: Falha ao executar 'removeChild' em 'Node'" no Select de status
- [x] Corrigir problema de renderização do componente Select na tabela de indicações
- [x] Testar alteração de status de indicações

## Gamificação e Motivação de Promotores

- [x] Reorganizar tabela admin - mover coluna "Status" para logo após "Data" (início da linha)
- [x] Adicionar dashboard no painel do vendedor com valores em R$ destacados
- [x] Mostrar total de comissões ganhas (vendas fechadas)
- [x] Mostrar total em negociação (potencial de ganho)
- [x] Adicionar contador de indicações do mês
- [x] Implementar barra de progresso para meta mensal
- [x] Adicionar taxa de conversão visual

## Notificações Automáticas e Ranking

- [x] Simplificar botões de acesso na página inicial (remover confusão entre "Login" e "Acessar Painel")
- [x] Implementar notificação automática por e-mail quando indicação mudar para "Venda Fechada"
- [x] E-mail deve informar vendedor sobre valor da comissão conquistada
- [ ] Criar página de ranking com top 5 vendedores do mês (quem fechou vendas)
- [ ] Criar página de ranking com top 5 promotores do mês (quem indicou assinaturas)
- [ ] Mostrar total de comissões de cada um no ranking
- [ ] Adicionar filtro por período no ranking (mês atual, últimos 30 dias, trimestre)

## Integração Futura com Kommo CRM

- [ ] Pesquisar documentação da API do Kommo
- [ ] Criar procedure para sincronizar leads do Kommo
- [ ] Implementar webhook para receber atualizações do Kommo
- [ ] Gamificar vendedores baseado em métricas do CRM

## Ajustes de Texto no Formulário

- [x] Alterar "Preencha os dados da pessoa que você está declarando para o plano de assinatura Sua Saúde Vital" para "Preencha os dados da pessoa que você está indicando as assinaturas Vital"
- [x] Adicionar "(provável ou de maior interesse)" após "Tipo de Plano"

## Definições de Promotor e Vendedor

- [x] Alterar "Bem-vindo, Parceiro!" para "Boas-vindas Promotor e/ou Vendedor!"
- [x] Adicionar definições pequenas e discretas explicando a diferença entre Promotor e Vendedor

## Sistema de Materiais de Divulgação

### Backend e Banco de Dados
- [x] Criar tabela materiais no schema do banco de dados
- [x] Criar router server/routers/materiais.ts com procedures
- [x] Registrar router materiais no router principal
- [x] Executar migração do banco de dados

### Frontend
- [x] Criar página AdminMateriais.tsx para gerenciamento
- [x] Criar página MateriaisDivulgacao.tsx pública
- [x] Adicionar rotas no App.tsx
- [x] Integrar com tRPC no frontend
- [x] Adicionar procedures meuIndicador e listarIndicacoes
- [x] Alterar página inicial para BoasVindasIndicadores
- [x] Adicionar menu de navegação no AdminLayout

### Testes e Finalização
- [ ] Testar upload de materiais
- [ ] Testar listagem pública
- [ ] Testar CRUD completo
- [x] Salvar checkpoint

## Sistema de Upload de Materiais (Admin)

- [ ] Criar página AdminMateriais.tsx com formulário de upload
- [ ] Adicionar procedure tRPC para upload de arquivos
- [ ] Implementar integração com S3 storage
- [ ] Adicionar validações de tipo e tamanho de arquivo
- [ ] Criar interface de listagem e gerenciamento
- [ ] Adicionar rota /admin/materiais
- [ ] Testar upload de imagens e PDFs

## Sistema de Autenticação de Indicadores (E-mail + Senha)

### Backend
- [x] Adicionar campo senha (hash) na tabela users
- [x] Criar tabela password_reset_tokens
- [x] Instalar bcrypt para hash de senhas
- [x] Criar procedure cadastrarIndicador
- [x] Criar procedure loginIndicador
- [x] Criar procedure solicitarRecuperacaoSenha
- [x] Criar procedure redefinirSenha
- [x] Criar sistema de sessão JWT

### Frontend
- [x] Criar página /cadastro-indicador
- [x] Criar página /login-indicador
- [x] Criar página /esqueci-senha
- [x] Criar página /recuperar-senha
- [x] Adicionar validações de formulário
- [x] Implementar feedback visual

### E-mails
- [x] Template de boas-vindas
- [x] Template de recuperação de senha

### Testes
- [ ] Testar fluxo de cadastro
- [ ] Testar fluxo de login
- [ ] Testar recuperação de senha

## Ajustes Solicitados

- [x] Tornar Chave PIX obrigatória no cadastro de indicador (frontend e backend)

## Correções Urgentes

- [x] Corrigir redirecionamento OAuth após login de indicador (não deve tentar logar pela Manus)
- [x] Adicionar campo editável de Chave PIX na página de perfil do indicador (já existia)
- [ ] Testar fluxo completo de login e edição de perfil

## Sistema Completo de Comissões

### Banco de Dados
- [x] Criar tabela planos_saude com todos os planos (8 planos)
- [x] Criar tabela configuracao_comissoes (lead quente 70/30, lead frio 30/70, venda direta 100%)
- [x] Popular tabela planos com dados do PDF

### Página Espelho de Comissões (Pública para Indicadores)
- [x] Criar página /tabela-comissoes (pública, sem login)
- [x] Mostrar 3 cenários: Lead Quente (70/30), Lead Frio (30/70), Venda Direta (100%)
- [x] Exibir todos os 8 planos com valores
- [x] Design motivador e visual
- [x] Sincronizar automaticamente com Admin/Configurações
- [x] Adicionar texto sobre inversão de comissões (removido da home)

### Admin - Configurações de Comissões
- [x] Adicionar seção em /admin/configuracoes para editar comissões
- [x] Campos editáveis: % Lead Quente Indicador, % Lead Quente Vendedor
- [x] Campos editáveis: % Lead Frio Indicador, % Lead Frio Vendedor
- [x] Salvar alterações no banco
- [x] Atualizar página espelho automaticamente

### Página de Classificação de Leads (Vendedor)
- [x] Criar página /classificar-lead/:id
- [x] Vendedor classifica indicação recebida
- [x] Opções: Lead Quente, Lead Frio
- [x] Campos: Observações do vendedor
- [x] Salvar classificação no banco com data
- [ ] Atualizar comissão automaticamente baseado na classificação
- [ ] Notificar indicador sobre classificação

### Ajustes
- [x] Remover texto de inversão de comissões da página inicial
- [x] Adicionar link para tabela de comissões na home
- [ ] Verificar sistema de envio de e-mails (cadastro, recuperação, notificações)

## Cálculo Automático de Comissão

- [x] Atualizar função classificarLead para buscar plano e configuração
- [x] Calcular valor da comissão do indicador baseado no percentual
- [x] Salvar valorComissao na indicação
- [ ] Testar cálculo com diferentes cenários

## Botão Classificar no Painel do Vendedor

- [x] Adicionar coluna "Ções" na tabela de indicações do vendedor
- [x] Botão "Classificar Lead" que redireciona para /classificar-lead/:id
- [x] Mostrar apenas para leads não classificados
- [x] Badge visual para leads já classificados (quente/frio)

## Configuração Gmail SMTP

- [x] Configurar credenciais Gmail SMTP no sistema
- [x] Atualizar código para usar nodemailer com Gmail
- [x] Testar envio de e-mail de recuperação de senha
- [x] Testar envio de e-mail de boas-vindas
- [x] Verificar logs e confirmar funcionamento

## Simplificação de Autenticação (E-mail/Senha para Todos)

- [ ] Criar conta admin com e-mail/senha no banco de dados
- [ ] Unificar sistema de autenticação para todos os usuários
- [ ] Atualizar frontend para usar login unificado
- [ ] Remover referências ao OAuth do código
- [ ] Testar login de todos os perfis (promotor, vendedor, comercial, admin)
- [x] Salvar checkpoint final

## Correção de Sistema de Sessão

- [ ] Adaptar sistema de sessão para funcionar sem OAuth
- [ ] Testar login admin com e-mail/senha
- [ ] Adicionar botão "Painel Administrativo" na página inicial
- [x] Salvar checkpoint

## Sistema de Sessão Completo e Área de Perfil do Usuário

- [ ] Implementar criação de cookie JWT no auth.login
- [ ] Implementar criação de cookie JWT no authIndicadores.login
- [ ] Atualizar context.ts para validar JWT corretamente
- [ ] Criar procedure para alterar senha do usuário
- [ ] Criar procedure para editar perfil do usuário
- [ ] Criar página /perfil para gerenciamento de dados pessoais
- [ ] Adicionar formulário de alteração de senha
- [ ] Adicionar formulário de edição de dados (nome, WhatsApp, chave PIX)
- [ ] Testar login admin com sessão persistente
- [ ] Testar login promotor com sessão persistente
- [ ] Testar alteração de senha
- [ ] Testar edição de perfil
- [x] Salvar checkpoint final

## Correções Urgentes de Autenticação

- [ ] Criar página de redefinição de senha (RedefinirSenha.tsx) para link do e-mail
- [ ] Configurar rota /redefinir-senha/:token no App.tsx
- [ ] Implementar procedure tRPC para validar token e alterar senha
- [ ] Investigar erro de login do administrativo@suasaudevital.com.br
- [ ] Adicionar botão "Área Administrativa" destacado na página inicial
- [ ] Testar fluxo completo de recuperação de senha
- [ ] Testar login do administrativo
- [x] Salvar checkpoint final

## Reestruturação de Roles e Materiais de Divulgação

### Reestruturação de Roles
- [x] Atualizar schema: alterar enum role para apenas 3 valores (promotor, comercial, admin)
- [ ] Migrar dados: vendedor → promotor, vendedor_interno → comercial
- [ ] Atualizar todas as verificações de permissão no backend
- [ ] Renomear "Indicador" para "Promotor" em TODOS os arquivos do frontend
- [ ] Renomear "Vendedor" para "Promotor" onde aplicável
- [ ] Atualizar página de gestão de usuários (apenas 3 roles)
- [ ] Atualizar permissões: Comercial pode qualificar indicações
- [ ] Atualizar permissões: Comercial NÃO pode deletar sem autorização

### Sistema de Materiais de Divulgação
- [x] Criar tabela materiaisDivulgacao no schema
- [x] Criar tabela materiaisPromotores no schema
- [x] Criar procedures para Central de Argumentos (get/update)
- [x] Criar procedures para Promoção Vigente (get/update)
- [x] Criar procedures para Materiais Diversos (list/create/update/delete)
- [x] Criar procedures para Meus Materiais Personalizados (list/create/update/delete)
- [ ] Criar página MateriaisDivulgacao.tsx completa
- [ ] Implementar seção Central de Argumentos (editável por admin/comercial)
- [ ] Implementar seção Promoção Vigente (editável por admin/comercial)
- [ ] Implementar seção Materiais Diversos (editável por admin/comercial)
- [ ] Implementar seção Meus Materiais Personalizados (editável por promotor)
- [ ] Adicionar botões "Copiar" em todos os textos
- [ ] Adicionar explicação para promotores sobre uso da seção pessoal
- [ ] Testar todas as funcionalidades
- [x] Salvar checkpoint final

## Reestruturação do Sistema de Roles (3 Tipos de Usuário)

- [x] Atualizar schema do banco de dados: enum role de 4 valores para 3 valores (promotor, comercial, admin)
- [x] Remover roles antigos: "user" e "vendedor"
- [x] Adicionar novo role: "promotor" (substitui "vendedor" e "indicador")
- [x] Criar tabelas de materiais de divulgação:
  - materiaisDivulgacao (Central de Argumentos, Promoção Vigente)
  - materiaisDiversos (materiais gerais gerenciados por Admin/Comercial)
  - materiaisPromotores (materiais personalizados de cada promotor)
- [x] Criar router tRPC materiaisDivulgacaoRouter com procedures CRUD
- [x] Implementar procedures para Central de Argumentos
- [x] Implementar procedures para Promoção Vigente
- [x] Implementar procedures para Materiais Diversos
- [x] Implementar procedures para Materiais Personalizados dos Promotores
- [x] Atualizar enum do banco de dados via SQL: ALTER TABLE users MODIFY COLUMN role
- [x] Corrigir todas as referências a "vendedor" no código do servidor:
  - server/routers.ts (comentários e verificações de role)
  - server/db.ts (comentários e nomes de função)
  - server/routers/authIndicadores.ts (role padrão no cadastro)
  - server/_core/email.ts (comentários)
  - server/email.ts (templates de e-mail)
- [x] Corrigir todas as referências a "vendedor" no código do frontend:
  - client/src/pages/Home.tsx (verificação de role)
  - client/src/pages/Admin.tsx (verificação de role)
  - client/src/pages/Vendedor.tsx (verificação de role)
  - client/src/pages/AdminUsuarios.tsx (filtro de estatísticas)
  - client/src/pages/ClassificarLead.tsx (verificação de role e mensagem)
  - client/src/pages/LoginIndicador.tsx (redirecionamento por role)
- [x] Criar migração SQL manual para atualizar enum no banco de dados
- [x] Adicionar migração ao journal de migrações
- [x] Aplicar migração ao banco de dados
- [x] Verificar que TypeScript não reporta mais erros
- [x] Testar servidor após todas as correções
- [ ] Criar página de Materiais de Divulgação (próximo passo)
- [ ] Implementar sistema de permissões para Comercial (não pode deletar sem autorização)
- [ ] Renomear "Indicador" para "Promotor" em todo o frontend (textos de UI)
- [ ] Testar fluxo completo com os 3 tipos de usuário

## Página de Materiais de Divulgação

- [x] Criar página MateriaisDivulgacao.tsx
- [x] Implementar seção Central de Argumentos (editável por Admin/Comercial, read-only para Promotor)
- [x] Implementar seção Promoção Vigente (editável por Admin/Comercial)
- [x] Implementar seção Materiais Diversos (lista gerenciada por Admin/Comercial)
- [x] Implementar seção Meus Materiais Personalizados (cada Promotor adiciona seus próprios)
- [x] Adicionar botões de copiar texto em todas as seções
- [x] Implementar modal de edição para Central de Argumentos
- [x] Implementar modal de edição para Promoção Vigente
- [x] Implementar modal de adição de Materiais Diversos
- [x] Implementar modal de adição de Materiais Personalizados
- [x] Adicionar rota /materiais-divulgacao no App.tsx
- [x] Adicionar link no menu de navegação (AdminLayout ou PainelVendedorLayout)
- [x] Testar permissões (Admin/Comercial pode editar, Promotor só visualiza)
- [x] Testar botões de copiar
- [x] Testar adição e exclusão de materiais
- [x] Salvar checkpoint

## Renomeação de "Indicador" para "Promotor" na Interface

- [x] Identificar todos os arquivos do frontend que contêm "Indicador"
- [x] Substituir "Indicador" por "Promotor" em títulos de páginas
- [x] Substituir "Indicador" por "Promotor" em labels de formulários
- [x] Substituir "Indicador" por "Promotor" em mensagens e textos explicativos
- [x] Substituir "Indicador" por "Promotor" em botões e links
- [x] Verificar mudanças no navegador
- [x] Salvar checkpoint

## Atualização da Página Inicial com Nomenclatura de Promotor

- [x] Atualizar título principal de "Indicar a Vital" para "Ser um Promotor Vital"
- [x] Atualizar texto explicativo para mencionar indicação E venda completa
- [x] Ajustar seção "Como funciona?" para incluir ambas modalidades
- [x] Atualizar CTA final para "Venda, indique! Seja um PROMOTOR VITAL!"
- [x] Verificar mudanças no navegador
- [x] Salvar checkpoint

## Sistema de Links de Checkout Personalizados e Área do Promotor

### Schema e Backend
- [x] Adicionar tabela `configuracoes` com campos linkCheckoutBase e diasCancelamentoGratuito
- [x] Adicionar campo `linkCheckoutPersonalizado` na tabela users
- [x] Criar procedure para gerar link único para cada promotor/vendedor
- [x] Criar procedures para gerenciar configurações (getLinkCheckoutBase, atualizarLinkCheckoutBase, getDiasCancelamento, atualizarDiasCancelamento)
- [x] Criar procedure para obter link personalizado do promotor

### Área Admin
- [x] Adicionar seção de Configurações Gerais em AdminConfiguracoes.tsx
- [x] Adicionar campo editável para Link Base de Checkout
- [x] Adicionar campo editável para Dias de Cancelamento Gratuito
- [ ] Testar edição de configurações

### Área de Materiais de Divulgação
- [x] Adicionar seção "Meu Link de Checkout Personalizado" em MateriaisDivulgacao.tsx
- [x] Exibir link completo com código do promotor
- [x] Adicionar botão de copiar link
- [x] Adicionar explicação sobre uso do link

### Dashboard do Promotor
- [ ] Criar página DashboardPromotor.tsx
- [ ] Adicionar escolha de modalidade: "Indicar" ou "Vender"
- [ ] Exibir link de checkout personalizado
- [ ] Criar seção de acompanhamento de comissões (indicações e vendas)
- [ ] Mostrar estatísticas: total de indicações, vendas, comissões pendentes, comissões pagas
- [ ] Adicionar filtros por período e status
- [ ] Adicionar rota /painel-promotor no App.tsx

### Testes e Finalização
- [x] Testar geração de links personalizados
- [x] Testar edição de configurações pelo Admin
- [x] Testar cópia de link na área de Materiais
- [ ] Testar dashboard do Promotor
- [x] Salvar checkpoint


## Dashboard do Promotor e Atualização de Título

### Atualização de Título
- [x] Atualizar título no header (Home.tsx) de "Sistema de Indicações" para "Plataforma de Comissionamento"
- [x] Atualizar meta tags e título da página
- [x] Atualizar referências em outros componentes

### Página Dashboard do Promotor
- [x] Criar página DashboardPromotor.tsx
- [x] Adicionar seção de escolha de modalidade (Indicar ou Vender)
- [x] Implementar cards de estatísticas (Total Acumulado, Pendentes, Pagas)
- [x] Criar tabela de indicações/vendas com status
- [x] Adicionar gráfico de conversão
- [ ] Implementar seção de ranking de performance

### Backend - Procedures
- [x] Criar procedure para obter estatísticas de comissões do promotor (já existe: listarIndicacoes)
- [x] Criar procedure para listar indicações/vendas do promotor (já existe: listarIndicacoes)
- [ ] Criar procedure para obter dados de ranking

### Integração
- [x] Adicionar rota /painel-promotor no App.tsx
- [x] Adicionar link no menu PainelVendedorLayout
- [x] Testar todas as funcionalidades
- [x] Salvar checkpoint


## Revisão Completa e Correção de Acessos

### Problemas Identificados
- [ ] Sistema de login não está funcionando
- [ ] Área Admin não está acessível
- [ ] Fluxos de navegação precisam ser revisados

### Correções de Autenticação
- [ ] Verificar e corrigir sistema de login atual
- [ ] Simplificar autenticação (usar sistema mais confiável)
- [ ] Garantir acesso à área Admin
- [ ] Criar usuários de teste funcionais

### Revisão de Navegação
- [x] Testar página inicial e todos os botões
- [x] Testar fluxo de cadastro de promotor (formulário funcionando)
- [x] Testar fluxo de login (página de login funcionando)
- [x] Testar proteção de acesso à área Admin (acesso negado sem autenticação)
- [ ] Criar usuário admin de teste
- [ ] Testar área do promotor (dashboard, indicações, materiais)
- [ ] Testar área Admin (todas as páginas e funcionalidades)
- [ ] Testar registro de indicações
- [ ] Testar registro de vendas

### Validação Final
- [ ] Testar fluxo completo end-to-end
- [ ] Documentar credenciais de acesso
- [ ] Salvar checkpoint


## Materiais de Apoio (Banners e Vídeos)

### Schema e Backend
- [x] Criar tabela `materiaisApoio` no schema
- [x] Adicionar campos: id, tipo (banner/video), titulo, descricao, categoria, urlArquivo, thumbnailUrl, tamanhoBytes, createdAt
- [x] Aplicar migração do schema
- [x] Criar procedures para listar materiais
- [x] Criar procedures para adicionar material (Admin)
- [x] Criar procedures para deletar material (Admin)

### Página Admin
- [x] Criar página AdminMateriaisApoio.tsx
- [x] Implementar upload de banners (imagens)
- [x] Implementar upload de vídeos
- [x] Adicionar categorização (Redes Sociais, Explicativos, Institucionais)
- [x] Implementar preview de materiais
- [x] Implementar exclusão de materiais

### Página Promotor
- [x] Criar página MateriaisApoio.tsx
- [x] Implementar seção de Banners com grid de imagens
- [x] Implementar seção de Vídeos com thumbnails
- [x] Adicionar filtro por categoria
- [x] Implementar preview e download de materiais
- [x] Adicionar rota /materiais-apoio no App.tsx
- [x] Adicionar link no menu PainelVendedorLayout

### Testes
- [ ] Testar upload de banner pelo Admin
- [ ] Testar upload de vídeo pelo Admin
- [ ] Testar visualização e download pelo Promotor
- [ ] Salvar checkpoint


## Auditoria Completa do Sistema

### Área do Promotor
- [ ] Testar login com usuário promotor
- [ ] Verificar Dashboard do Promotor (estatísticas, escolha de modalidade)
- [ ] Testar registro de nova indicação
- [ ] Verificar lista de indicações e status
- [ ] Testar página de Materiais de Divulgação
- [ ] Testar página de Materiais de Apoio
- [ ] Verificar clareza de valores de comissão
- [ ] Testar página de Comissões

### Área Admin
- [ ] Testar login com usuário admin (admin@vital.com)
- [ ] Verificar página de Indicações
- [ ] Testar gerenciamento de Usuários
- [ ] Verificar Configurações (comissões, link checkout, período cancelamento)
- [ ] Testar página de Materiais de Apoio (upload)
- [ ] Verificar página de Estatísticas
- [ ] Testar classificação de leads

### Clareza e Transparência
- [ ] Verificar se valores de comissão estão claros em todas as telas
- [ ] Verificar se status das indicações está claro
- [ ] Verificar se fluxo de pagamento está explicado
- [ ] Verificar se tabela de comissões é acessível

### Problemas Identificados
- [ ] Listar todos os problemas encontrados
- [ ] Corrigir problemas críticos
- [ ] Documentar problemas não-críticos para futuro


## Transformação em Plataforma White Label

### Valores Pré-configurados
- [x] Inserir valores de comissão padrão para Plano Essencial (Individual PF: R$ 50, Familiar PF: R$ 80, Individual Empresarial: R$ 60, Familiar Empresarial: R$ 100)
- [x] Inserir valores de comissão padrão para Plano Premium (Individual PF: R$ 80, Familiar PF: R$ 120, Individual Empresarial: R$ 90, Familiar Empresarial: R$ 150)
- [x] Configurar link de checkout padrão editável
- [x] Configurar período de cancelamento padrão (7 dias)

### Estrutura de Materiais de Apoio
- [x] Criar categorias pré-definidas (Redes Sociais, Explicativo, Institucional)
- [x] Adicionar títulos sugeridos para Banners (Instagram Stories, Feed, WhatsApp Status, Facebook, LinkedIn)
- [x] Adicionar títulos sugeridos para Vídeos (Institucional, Como Funciona, Depoimentos, Tutorial, FAQ)
- [x] Preparar interface para Admin fazer upload depois

### Área Personalizável do Promotor
- [ ] Adicionar schema para campos personalizados do promotor (apresentacao, diferenciais, ofertaEspecial)
- [ ] Criar procedures para salvar/editar campos personalizados
- [ ] Adicionar seção "Minha Apresentação Pessoal" editável pelo promotor
- [ ] Adicionar seção "Meus Diferenciais" editável pelo promotor
- [ ] Adicionar seção "Minha Oferta Especial" editável pelo promotor
- [ ] Adicionar área para links personalizados do promotor

### Conteúdo Inicial Editável
- [ ] Preencher Central de Argumentos com template inicial
- [ ] Preencher Promoção Vigente com template inicial
- [ ] Garantir que Admin pode editar completamente
- [ ] Testar edição e visualização

### Testes e Finalização
- [ ] Testar configuração completa pelo Admin
- [ ] Testar personalização pelo Promotor
- [ ] Verificar que tudo está pronto para uso White Label
- [ ] Salvar checkpoint final
