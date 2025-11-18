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
