#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Os negativos de mutacao escrevem apenas em /tmp e provam que cada regra do
# contrato documental falha quando o respetivo marcador e removido/reintroduzido.
python3 -B docs/planificacao/scripts/auditar_planificacao.py --self-test >/dev/null

# O auditor e o unico processo final: o exit code nao pode ser mascarado pelo wrapper.
# Conflict markers, drift, blockers e advisories sem waiver valido terminam com exit code 1.
exec python3 -B docs/planificacao/scripts/auditar_planificacao.py
