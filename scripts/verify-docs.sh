#!/usr/bin/env bash
# verify-docs.sh - Verifica que a documentacao esta alinhada com o codigo
# Uso: ./scripts/verify-docs.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

check() {
  local label="$1" ok="$2"
  if [ "$ok" = "true" ]; then
    green "  [OK] $label"
  else
    red "  [FAIL] $label"
    ERRORS=$((ERRORS + 1))
  fi
}

echo ""
echo "=== Verificando documentacao do projeto ==="
echo ""

# 1. Arquivos de documentacao existem
echo "-- Arquivos de documentacao --"
check "CLAUDE.md existe" "$([ -f "$ROOT/CLAUDE.md" ] && echo true || echo false)"
check "docs/ARCHITECTURE.md existe" "$([ -f "$ROOT/docs/ARCHITECTURE.md" ] && echo true || echo false)"
check ".env.example existe" "$([ -f "$ROOT/.env.example" ] && echo true || echo false)"

# 2. Schema mencionado no CLAUDE.md bate com o real
echo ""
echo "-- Tabelas do banco (drizzle/schema.ts) --"
if [ -f "$ROOT/drizzle/schema.ts" ]; then
  SCHEMA_TABLES=$(grep -oP 'mysqlTable\(\s*"([^"]+)"' "$ROOT/drizzle/schema.ts" | sed 's/mysqlTable("//' | sed 's/"//' | sort)
  for table in $SCHEMA_TABLES; do
    check "Tabela '$table' mencionada no CLAUDE.md" \
      "$(grep -q "$table" "$ROOT/CLAUDE.md" && echo true || echo false)"
  done
else
  red "  drizzle/schema.ts nao encontrado!"
  ERRORS=$((ERRORS + 1))
fi

# 3. Routers tRPC documentados
echo ""
echo "-- Routers tRPC (server/routers.ts) --"
if [ -f "$ROOT/server/routers.ts" ]; then
  ROUTERS=$(grep -oP '^\s+(\w+):\s+\w+Router' "$ROOT/server/routers.ts" | awk '{print $1}' | tr -d ':' | sort)
  for r in $ROUTERS; do
    # Router pode estar em server/routers/ ou server/_core/
    FOUND_ROUTER=$(grep -rl "${r}Router" "$ROOT/server/" --include='*.ts' 2>/dev/null | head -1)
    check "Router '$r' definido no codigo" \
      "$([ -n "$FOUND_ROUTER" ] && echo true || echo false)"
  done
fi

# 4. Variaveis de ambiente documentadas
echo ""
echo "-- Variaveis de ambiente --"
if [ -f "$ROOT/.env.example" ]; then
  ENV_VARS=$(grep -oP '^[A-Z_]+=?' "$ROOT/.env.example" | sed 's/=$//' | sort)
  for var in $ENV_VARS; do
    # Verificar se a variavel e referenciada no codigo (excluindo node_modules)
    FOUND=$(grep -r --exclude-dir=node_modules --exclude-dir=dist "process\.env\.$var\|$var" "$ROOT/server/" "$ROOT/drizzle.config.ts" "$ROOT/test-email.mjs" "$ROOT/test-resend.mjs" --include='*.ts' --include='*.mjs' -l 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
      check "ENV $var usado no codigo" "true"
    else
      # Variaveis VITE_ podem ser usadas no client
      FOUND_CLIENT=$(grep -r --exclude-dir=node_modules "$var" "$ROOT/client/src/" --include='*.ts' --include='*.tsx' -l 2>/dev/null | head -1)
      if [ -n "$FOUND_CLIENT" ]; then
        check "ENV $var usado no client" "true"
      else
        yellow "  [WARN] ENV $var no .env.example mas nao encontrado no codigo"
      fi
    fi
  done
fi

# 5. Paginas documentadas vs reais
echo ""
echo "-- Paginas (client/src/pages/) --"
if [ -d "$ROOT/client/src/pages" ]; then
  PAGE_COUNT=$(find "$ROOT/client/src/pages" -name "*.tsx" | wc -l)
  check "Paginas existem ($PAGE_COUNT arquivos .tsx)" "$([ "$PAGE_COUNT" -gt 0 ] && echo true || echo false)"

  # Verificar rotas no App.tsx
  if [ -f "$ROOT/client/src/App.tsx" ]; then
    ROUTE_COUNT=$(grep -c '<Route ' "$ROOT/client/src/App.tsx" || true)
    check "Rotas definidas no App.tsx ($ROUTE_COUNT rotas)" "$([ "$ROUTE_COUNT" -gt 0 ] && echo true || echo false)"
  fi
fi

# 6. Dependencias chave presentes no package.json
echo ""
echo "-- Dependencias chave --"
KEY_DEPS=("@trpc/server" "@trpc/client" "drizzle-orm" "express" "react" "mysql2" "wouter" "zod")
for dep in "${KEY_DEPS[@]}"; do
  check "Dependencia '$dep' no package.json" \
    "$(grep -q "\"$dep\"" "$ROOT/package.json" && echo true || echo false)"
done

# 7. Build funcional
echo ""
echo "-- Verificacao de build --"
check "tsconfig.json existe" "$([ -f "$ROOT/tsconfig.json" ] && echo true || echo false)"
check "vite.config.ts existe" "$([ -f "$ROOT/vite.config.ts" ] && echo true || echo false)"
check "drizzle.config.ts existe" "$([ -f "$ROOT/drizzle.config.ts" ] && echo true || echo false)"

echo ""
if [ "$ERRORS" -gt 0 ]; then
  red "=== $ERRORS problema(s) encontrado(s) ==="
  exit 1
else
  green "=== Tudo verificado com sucesso ==="
  exit 0
fi
