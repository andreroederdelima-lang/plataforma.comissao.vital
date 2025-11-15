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
- [ ] Salvar checkpoint final
