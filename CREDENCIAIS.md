# Credenciais de Acesso - Plataforma de Comissionamento Vital

## Usuário Administrador

**Email:** admin@vital.com  
**Senha:** admin123  
**Role:** admin  
**Permissões:** Acesso completo a todas as funcionalidades

## Áreas Disponíveis

### Área Admin (/admin)
- **Indicações:** Gerenciar todas as indicações dos promotores
- **Usuários:** Gerenciar promotores e comerciais
- **Configurações:** Editar percentuais de comissão, link de checkout, período de cancelamento
- **Estatísticas:** Visualizar métricas da plataforma
- **Comissões:** Gerenciar tabela de comissões por plano
- **Materiais:** Gerenciar materiais de divulgação
- **QR Codes:** Gerar QR codes para promotores

### Área do Promotor (/painel-vendedor)
- **Dashboard:** Estatísticas e escolha de modalidade (Indicar/Vender)
- **Minhas Indicações:** Listar indicações e vendas
- **Materiais de Divulgação:** Central de Argumentos, Promoção Vigente, Link personalizado
- **Perfil:** Editar dados pessoais e chave PIX
- **Comissões:** Visualizar comissões acumuladas

## Fluxos Testados e Funcionando ✅

1. **Página Inicial** - Exibindo corretamente com novo título "Plataforma de Comissionamento"
2. **Cadastro de Promotor** - Formulário completo funcionando
3. **Login** - Autenticação por e-mail/senha funcionando
4. **Área Admin** - Acesso protegido e menu de navegação completo
5. **Proteção de Rotas** - Acesso negado para usuários não autenticados

## Próximos Passos

1. Testar cadastro de um promotor de teste
2. Testar registro de indicações
3. Testar registro de vendas
4. Validar cálculo de comissões
5. Testar todas as páginas do menu Admin
