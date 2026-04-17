import { describe, it, expect } from "vitest";
import {
  ROLES_LEGADOS,
  ROLES_NOVOS,
  ROLES_VALIDOS,
  isAdmin,
  isAdminComercial,
  isAdminPlataforma,
  isEquipeInterna,
  isPromotor,
  isVendedor,
  isVendedorExterno,
  isVendedorInterno,
  podeAprovarComissao,
  podeClassificarLead,
  podeDefinirBeneficioPromotor,
} from "../../shared/roles";

describe("ROLES_VALIDOS — constantes", () => {
  it("inclui os 3 valores legados", () => {
    for (const r of ROLES_LEGADOS) {
      expect(ROLES_VALIDOS).toContain(r);
    }
  });

  it("inclui os 4 valores novos", () => {
    for (const r of ROLES_NOVOS) {
      expect(ROLES_VALIDOS).toContain(r);
    }
  });

  it("tem exatamente 7 valores durante a transição", () => {
    expect(ROLES_VALIDOS).toHaveLength(7);
  });
});

describe("isAdmin — engloba legados + novos admins", () => {
  it("reconhece legado 'admin' como admin", () => {
    expect(isAdmin("admin")).toBe(true);
  });

  it("reconhece legado 'comercial' como admin (diretor comercial)", () => {
    expect(isAdmin("comercial")).toBe(true);
  });

  it("reconhece novo 'admin_plataforma'", () => {
    expect(isAdmin("admin_plataforma")).toBe(true);
  });

  it("reconhece novo 'admin_comercial'", () => {
    expect(isAdmin("admin_comercial")).toBe(true);
  });

  it("recusa promotor e vendedores", () => {
    expect(isAdmin("promotor")).toBe(false);
    expect(isAdmin("vendedor_interno")).toBe(false);
    expect(isAdmin("vendedor_externo")).toBe(false);
  });

  it("tolerante a null/undefined", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin("")).toBe(false);
  });
});

describe("isAdminPlataforma — só técnico", () => {
  it("aceita legado 'admin' e novo 'admin_plataforma'", () => {
    expect(isAdminPlataforma("admin")).toBe(true);
    expect(isAdminPlataforma("admin_plataforma")).toBe(true);
  });

  it("recusa admin_comercial (não é plataforma)", () => {
    expect(isAdminPlataforma("admin_comercial")).toBe(false);
    expect(isAdminPlataforma("comercial")).toBe(false);
  });
});

describe("isAdminComercial — só comercial", () => {
  it("aceita legado 'comercial' e novo 'admin_comercial'", () => {
    expect(isAdminComercial("comercial")).toBe(true);
    expect(isAdminComercial("admin_comercial")).toBe(true);
  });

  it("recusa admin_plataforma (não é comercial)", () => {
    expect(isAdminComercial("admin")).toBe(false);
    expect(isAdminComercial("admin_plataforma")).toBe(false);
  });
});

describe("isVendedor — interno ou externo", () => {
  it("aceita os dois tipos de vendedor", () => {
    expect(isVendedor("vendedor_interno")).toBe(true);
    expect(isVendedor("vendedor_externo")).toBe(true);
  });

  it("recusa admin, promotor, comercial (legados)", () => {
    expect(isVendedor("admin")).toBe(false);
    expect(isVendedor("comercial")).toBe(false);
    expect(isVendedor("promotor")).toBe(false);
  });

  it("isVendedorInterno vs isVendedorExterno discriminam", () => {
    expect(isVendedorInterno("vendedor_interno")).toBe(true);
    expect(isVendedorInterno("vendedor_externo")).toBe(false);
    expect(isVendedorExterno("vendedor_externo")).toBe(true);
    expect(isVendedorExterno("vendedor_interno")).toBe(false);
  });
});

describe("isPromotor — escopo estreito", () => {
  it("aceita só 'promotor'", () => {
    expect(isPromotor("promotor")).toBe(true);
  });

  it("não confunde com vendedores", () => {
    expect(isPromotor("vendedor_interno")).toBe(false);
    expect(isPromotor("vendedor_externo")).toBe(false);
  });
});

describe("podeAprovarComissao — equivale a isAdmin", () => {
  it("reflete isAdmin", () => {
    for (const r of ROLES_VALIDOS) {
      expect(podeAprovarComissao(r)).toBe(isAdmin(r));
    }
  });
});

describe("podeDefinirBeneficioPromotor — vendedores + admin", () => {
  it("aceita vendedor_interno e vendedor_externo", () => {
    expect(podeDefinirBeneficioPromotor("vendedor_interno")).toBe(true);
    expect(podeDefinirBeneficioPromotor("vendedor_externo")).toBe(true);
  });

  it("aceita admin (ambos os tipos)", () => {
    expect(podeDefinirBeneficioPromotor("admin")).toBe(true);
    expect(podeDefinirBeneficioPromotor("admin_plataforma")).toBe(true);
    expect(podeDefinirBeneficioPromotor("admin_comercial")).toBe(true);
    expect(podeDefinirBeneficioPromotor("comercial")).toBe(true);
  });

  it("recusa o próprio promotor (quem recebe não decide)", () => {
    expect(podeDefinirBeneficioPromotor("promotor")).toBe(false);
  });
});

describe("isEquipeInterna — Vital contrata; parceiros não", () => {
  it("admin e vendedor_interno são equipe", () => {
    expect(isEquipeInterna("admin")).toBe(true);
    expect(isEquipeInterna("admin_plataforma")).toBe(true);
    expect(isEquipeInterna("admin_comercial")).toBe(true);
    expect(isEquipeInterna("comercial")).toBe(true);
    expect(isEquipeInterna("vendedor_interno")).toBe(true);
  });

  it("vendedor_externo e promotor são parceiros", () => {
    expect(isEquipeInterna("vendedor_externo")).toBe(false);
    expect(isEquipeInterna("promotor")).toBe(false);
  });
});

describe("podeClassificarLead — hoje só admin", () => {
  it("aceita admin, recusa vendedor e promotor", () => {
    expect(podeClassificarLead("admin")).toBe(true);
    expect(podeClassificarLead("comercial")).toBe(true);
    expect(podeClassificarLead("admin_plataforma")).toBe(true);
    expect(podeClassificarLead("admin_comercial")).toBe(true);
    expect(podeClassificarLead("vendedor_interno")).toBe(false);
    expect(podeClassificarLead("vendedor_externo")).toBe(false);
    expect(podeClassificarLead("promotor")).toBe(false);
  });
});

describe("Invariantes cruzadas", () => {
  it("isAdminPlataforma + isAdminComercial cobrem isAdmin", () => {
    for (const r of ROLES_VALIDOS) {
      expect(isAdmin(r)).toBe(isAdminPlataforma(r) || isAdminComercial(r));
    }
  });

  it("ninguém é simultaneamente admin e vendedor", () => {
    for (const r of ROLES_VALIDOS) {
      expect(isAdmin(r) && isVendedor(r)).toBe(false);
    }
  });

  it("ninguém é simultaneamente admin e promotor", () => {
    for (const r of ROLES_VALIDOS) {
      expect(isAdmin(r) && isPromotor(r)).toBe(false);
    }
  });

  it("vendedor e promotor são mutuamente exclusivos", () => {
    for (const r of ROLES_VALIDOS) {
      expect(isVendedor(r) && isPromotor(r)).toBe(false);
    }
  });
});
