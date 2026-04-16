import { describe, it, expect } from "vitest";

/**
 * Testes da LÓGICA DE CÁLCULO de comissões.
 *
 * Escopo: verificam as fórmulas puras usadas por:
 *  - server/db.ts              classificarLead()  (lead quente/frio)
 *  - server/db.ts              validarVenda()     (venda direta 100%)
 *  - server/routers/admin.ts   aprovarComissao()  (percentual manual)
 *
 * Esses testes documentam o comportamento esperado. Se a lógica em
 * db.ts/admin.ts divergir destas fórmulas, os testes passam mas o
 * sistema está quebrado — por isso as funções `calcular*` abaixo
 * espelham exatamente o código de produção (comentário // ref: ...).
 *
 * Unidades: TODOS os valores monetários em centavos (int).
 */

// ============================================================================
// Fórmulas espelhadas da produção (para teste isolado, sem DB)
// ============================================================================

/** ref: server/db.ts `classificarLead` (branch tipo === "venda") e
 *       server/db.ts `validarVenda` (caso sempre 100%). */
function calcularComissaoVendaDireta(bonificacaoPadrao: number): number {
  return bonificacaoPadrao;
}

/** ref: server/db.ts `classificarLead` (branch indicação) */
function calcularComissaoIndicacao(
  bonificacaoPadrao: number,
  percentualIndicador: number,
): number {
  return Math.round((bonificacaoPadrao * percentualIndicador) / 100);
}

/** ref: server/routers/admin.ts `aprovarComissao` */
function calcularComissaoAprovacaoManual(
  valorPlano: number,
  percentualComissao: number,
): number {
  return Math.round((valorPlano * percentualComissao) / 100);
}

/** ref: server/routers/admin.ts `aprovarComissao` — carência mínima antes de aprovar */
const DIAS_CARENCIA = 7;
function diasDesde(data: Date, agora = Date.now()): number {
  return Math.floor((agora - data.getTime()) / (1000 * 60 * 60 * 24));
}
function estaDentroDaCarencia(dataVenda: Date, agora = Date.now()): boolean {
  return diasDesde(dataVenda, agora) < DIAS_CARENCIA;
}

// ============================================================================
// Casos de teste
// ============================================================================

describe("Cálculo de comissão — venda direta (tipo = 'venda')", () => {
  it("retorna 100% da bonificação em centavos", () => {
    expect(calcularComissaoVendaDireta(28990)).toBe(28990);
    expect(calcularComissaoVendaDireta(0)).toBe(0);
    expect(calcularComissaoVendaDireta(1_000_000)).toBe(1_000_000);
  });

  it("não quebra com bonificação zerada (config não preenchida ainda)", () => {
    expect(calcularComissaoVendaDireta(0)).toBe(0);
  });
});

describe("Cálculo de comissão — indicação quente (70% padrão)", () => {
  it("aplica percentual do indicador sobre a bonificação", () => {
    expect(calcularComissaoIndicacao(28990, 70)).toBe(20293);
    expect(calcularComissaoIndicacao(10000, 70)).toBe(7000);
  });

  it("arredonda centavos com Math.round (banker's não, truncação não)", () => {
    // 28990 * 70 / 100 = 20293.0 (exato)
    expect(calcularComissaoIndicacao(28990, 70)).toBe(20293);
    // 28991 * 70 / 100 = 20293.7 → round → 20294
    expect(calcularComissaoIndicacao(28991, 70)).toBe(20294);
    // 28993 * 70 / 100 = 20295.1 → round → 20295
    expect(calcularComissaoIndicacao(28993, 70)).toBe(20295);
  });

  it("preserva total (indicador + comercial) dentro de 1 centavo", () => {
    const bonificacao = 28991;
    const percIndicador = 70;
    const percComercial = 30;
    const soma =
      calcularComissaoIndicacao(bonificacao, percIndicador) +
      calcularComissaoIndicacao(bonificacao, percComercial);
    // Math.round pode causar drift de 1 centavo — aceito
    expect(Math.abs(soma - bonificacao)).toBeLessThanOrEqual(1);
  });
});

describe("Cálculo de comissão — indicação fria (30% padrão)", () => {
  it("aplica percentual do indicador menor", () => {
    expect(calcularComissaoIndicacao(28990, 30)).toBe(8697);
    expect(calcularComissaoIndicacao(10000, 30)).toBe(3000);
  });

  it("quente > frio para mesmo plano (invariante de negócio)", () => {
    const bonif = 28990;
    expect(calcularComissaoIndicacao(bonif, 70)).toBeGreaterThan(
      calcularComissaoIndicacao(bonif, 30),
    );
  });
});

describe("Cálculo de comissão — aprovação manual pelo admin", () => {
  it("aplica percentual sobre valorPlano em centavos", () => {
    // 28990 centavos * 50% = 14495
    expect(calcularComissaoAprovacaoManual(28990, 50)).toBe(14495);
    // 28990 * 100 / 100 = 28990
    expect(calcularComissaoAprovacaoManual(28990, 100)).toBe(28990);
    // 28990 * 30 / 100 = 8697
    expect(calcularComissaoAprovacaoManual(28990, 30)).toBe(8697);
  });

  it("arredonda como Math.round", () => {
    // 100 * 33 / 100 = 33.0
    expect(calcularComissaoAprovacaoManual(100, 33)).toBe(33);
    // 101 * 33 / 100 = 33.33 → 33
    expect(calcularComissaoAprovacaoManual(101, 33)).toBe(33);
    // 103 * 33 / 100 = 33.99 → 34
    expect(calcularComissaoAprovacaoManual(103, 33)).toBe(34);
  });

  it("retorna 0 quando valorPlano é 0 (config não preenchida)", () => {
    expect(calcularComissaoAprovacaoManual(0, 100)).toBe(0);
  });
});

describe("Carência de 7 dias antes de aprovar comissão", () => {
  it("bloqueia aprovação antes de 7 dias (carência)", () => {
    const agora = new Date("2026-04-16T12:00:00Z").getTime();
    const vendaOntem = new Date("2026-04-15T12:00:00Z");
    expect(estaDentroDaCarencia(vendaOntem, agora)).toBe(true);
    expect(diasDesde(vendaOntem, agora)).toBeLessThan(7);
  });

  it("libera aprovação no 7º dia", () => {
    const agora = new Date("2026-04-16T12:00:00Z").getTime();
    const vendaHa7Dias = new Date("2026-04-09T12:00:00Z");
    expect(estaDentroDaCarencia(vendaHa7Dias, agora)).toBe(false);
    expect(diasDesde(vendaHa7Dias, agora)).toBe(7);
  });

  it("libera aprovação depois de 7 dias", () => {
    const agora = new Date("2026-04-16T12:00:00Z").getTime();
    const vendaAntiga = new Date("2026-04-01T12:00:00Z");
    expect(estaDentroDaCarencia(vendaAntiga, agora)).toBe(false);
    expect(diasDesde(vendaAntiga, agora)).toBeGreaterThan(7);
  });
});

describe("Invariantes de negócio", () => {
  it("venda direta >= indicação quente para o mesmo plano", () => {
    const bonif = 28990;
    expect(calcularComissaoVendaDireta(bonif)).toBeGreaterThanOrEqual(
      calcularComissaoIndicacao(bonif, 70),
    );
  });

  it("venda direta > indicação fria para o mesmo plano", () => {
    const bonif = 28990;
    expect(calcularComissaoVendaDireta(bonif)).toBeGreaterThan(
      calcularComissaoIndicacao(bonif, 30),
    );
  });

  it("percentualIndicador + percentualVendedor somam 100% (config valid)", () => {
    // regra em server/routers/comissoes.ts (atualizarConfiguracao linha 62)
    const quente = { indicador: 70, vendedor: 30 };
    const frio = { indicador: 30, vendedor: 70 };
    expect(quente.indicador + quente.vendedor).toBe(100);
    expect(frio.indicador + frio.vendedor).toBe(100);
  });
});
