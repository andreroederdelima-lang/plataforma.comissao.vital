/**
 * Roles da plataforma (fase de transição).
 *
 * O sistema começou com 3 roles: "promotor", "comercial", "admin".
 * A nova arquitetura precisa de 5 roles distintos:
 *
 *   - promotor           (só indica; ganha 1 mensalidade grátis OU 1 PIX por
 *                         indicação confirmada, negociado caso-a-caso com
 *                         um vendedor; NÃO é recorrente; só mantém benefício
 *                         enquanto continuar trazendo novas indicações)
 *   - vendedor_interno   (funcionário Vital; fecha vendas; tem salário + bônus)
 *   - vendedor_externo   (parceiro externo; fecha vendas; ganha só comissão)
 *   - admin_comercial    (diretor/gerente comercial; aprova comissões, vê
 *                         relatórios; não é admin da plataforma)
 *   - admin_plataforma   (admin técnico; gerencia usuários, configurações,
 *                         materiais; faz tudo)
 *
 * Estratégia de migração: o enum no banco é expandido pra conter os 5 novos
 * valores além dos 3 antigos. Ninguém é renomeado de cara — os checks
 * existentes continuam funcionando. Conforme cada callsite for migrado pra
 * usar os helpers abaixo, pode-se remover os valores antigos num PR futuro.
 *
 * Mapeamento conceitual (até migração completa):
 *   "admin"      ≈ admin_plataforma
 *   "comercial"  ≈ admin_comercial
 *   "promotor"   ≈ promotor            (mesmo nome, mas escopo mais estreito:
 *                                       só indicação, não fecha vendas)
 */

export const ROLES_LEGADOS = ["promotor", "comercial", "admin"] as const;
export const ROLES_NOVOS = [
  "vendedor_interno",
  "vendedor_externo",
  "admin_comercial",
  "admin_plataforma",
] as const;

/** Todos os valores aceitos pelo enum `users.role` durante a transição. */
export const ROLES_VALIDOS = [...ROLES_LEGADOS, ...ROLES_NOVOS] as const;
export type Role = (typeof ROLES_VALIDOS)[number];

/**
 * Qualquer tipo de admin (legado "admin" = novo "admin_plataforma";
 * legado "comercial" = novo "admin_comercial").
 */
export function isAdmin(role: string | null | undefined): boolean {
  return (
    role === "admin" ||
    role === "admin_plataforma" ||
    role === "comercial" ||
    role === "admin_comercial"
  );
}

/**
 * Admin técnico da plataforma (não o comercial). Equivalente ao legado "admin".
 * Tem poderes completos: gerenciar usuários, configurações, tudo.
 */
export function isAdminPlataforma(role: string | null | undefined): boolean {
  return role === "admin" || role === "admin_plataforma";
}

/**
 * Admin comercial / diretor comercial. Aprova comissões, vê relatórios,
 * mas não gerencia a plataforma. Equivalente ao legado "comercial".
 */
export function isAdminComercial(role: string | null | undefined): boolean {
  return role === "comercial" || role === "admin_comercial";
}

/** Qualquer tipo de vendedor (interno ou externo). */
export function isVendedor(role: string | null | undefined): boolean {
  return role === "vendedor_interno" || role === "vendedor_externo";
}

/** Vendedor interno — funcionário Vital. */
export function isVendedorInterno(role: string | null | undefined): boolean {
  return role === "vendedor_interno";
}

/** Vendedor externo — parceiro de vendas. */
export function isVendedorExterno(role: string | null | undefined): boolean {
  return role === "vendedor_externo";
}

/**
 * Promotor — só indica, ganha benefício caso-a-caso por indicação
 * confirmada. Escopo mais estreito que o legado "promotor" (que
 * também podia fechar vendas diretas).
 */
export function isPromotor(role: string | null | undefined): boolean {
  return role === "promotor";
}

/**
 * Pode aprovar comissões? Admin plataforma e admin comercial podem.
 * Usado no lugar de `role === "admin" || role === "comercial"`.
 */
export function podeAprovarComissao(role: string | null | undefined): boolean {
  return isAdmin(role);
}

/**
 * Pode dialogar com promotor e definir benefício dele?
 * Vendedor (qualquer tipo) conversa com o promotor e define o benefício;
 * admin também pode sobrescrever.
 */
export function podeDefinirBeneficioPromotor(
  role: string | null | undefined,
): boolean {
  return isVendedor(role) || isAdmin(role);
}

/**
 * É "equipe interna" (Vital)? Admin plataforma, admin comercial e vendedor
 * interno são funcionários. Vendedor externo e promotor são parceiros.
 */
export function isEquipeInterna(role: string | null | undefined): boolean {
  return isAdmin(role) || isVendedorInterno(role);
}

/**
 * Pode classificar lead (quente/frio)?
 * Hoje: admin_plataforma + admin_comercial. Após migração, talvez vendedor_interno.
 */
export function podeClassificarLead(role: string | null | undefined): boolean {
  return isAdmin(role);
}
