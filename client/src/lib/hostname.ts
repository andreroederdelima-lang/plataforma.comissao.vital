/**
 * Detecta se o frontend está rodando no subdomínio do promotor.
 *
 * Regras atuais:
 *  - `indique.*`                     → true  (trilha de promotor)
 *  - qualquer outro host             → false (trilha admin/vendedor)
 *
 * Também aceita override via `?promotor=1` (útil em dev local e QA).
 */
export function isIndiqueHost(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  if (params.get("promotor") === "1") return true;
  if (params.get("promotor") === "0") return false;

  return window.location.hostname.toLowerCase().startsWith("indique.");
}
