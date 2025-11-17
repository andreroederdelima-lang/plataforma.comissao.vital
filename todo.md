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
- [ ] Salvar checkpoint
