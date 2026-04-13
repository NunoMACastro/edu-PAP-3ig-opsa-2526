#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re

TODAY = "2026-04-13"
SPRINT_WINDOW_BY_MACRO = {
    "MF0": "S01-S02",
    "MF1": "S03-S04",
    "MF2": "S04-S06",
    "MF3": "S06-S08",
    "MF4": "S08-S09",
    "MF5": "S09-S10",
    "MF6": "S10-S11",
    "MF7": "S11-S12",
    "MF8": "S12",
}


def add_header_line_if_missing(text: str, anchor_pattern: str, new_line: str) -> str:
    if new_line in text:
        return text
    m = re.search(anchor_pattern, text)
    if not m:
        return text
    return text[: m.end()] + "\n" + new_line + text[m.end() :]


def enrich_guide(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    text = re.sub(r"- `last_updated`: `[^`]+`", f"- `last_updated`: `{TODAY}`", text, count=1)

    macro = path.parent.name
    bk_id = path.stem
    guide_path = f"docs/planificacao/guias-bk/{macro}/{path.name}"

    m_prio = re.search(r"- `prioridade`: `([^`]+)`", text)
    prioridade = m_prio.group(1).strip() if m_prio else "P1"
    core = "Reforco" if prioridade == "P0" else "Core"
    sprint = SPRINT_WINDOW_BY_MACRO.get(macro, "S12")

    text = add_header_line_if_missing(
        text,
        r"- `fase_documental`: `[^`]+`",
        f"- `sprint`: `{sprint}`",
    )
    text = add_header_line_if_missing(
        text,
        r"- `proximo_bk`: `[^`]+`",
        f"- `guia_path`: `{guide_path}`",
    )
    text = add_header_line_if_missing(
        text,
        r"- `sprint`: `[^`]+`",
        f"- `core_or_reforco`: `{core}`",
    )

    if "## Pre-requisitos operacionais" not in text:
        deps = "-"
        m_deps = re.search(r"- `dependencias`: `([^`]+)`", text)
        if m_deps:
            deps = m_deps.group(1).strip()

        pedagogic_block = f"""
## Pre-requisitos operacionais
- Dependencias tecnicas declaradas: `{deps}`.
- Contexto minimo lido: RF/RNF do BK + matriz + backlog + guia anterior.
- Ambiente local pronto para executar smoke e cenarios negativos.

## Objetivo pedagogico (12o ano)
- Consolidar autonomia na execucao do BK com rastreabilidade e evidence.
- Treinar decisao tecnica com validacao de erros e qualidade de entrega.

## Tempo estimado
- `Core`: 45-90 minutos (execucao minima + validacao).
- `Reforco` (apenas P0): +20-40 minutos para robustez extra e defesa.

## Erros comuns a evitar
- Fechar BK sem validar cenarios negativos.
- Alterar metadados no guia sem alinhar backlog/matriz.
- Entregar evidencia incompleta (`pr`, `proof`, `neg`).

## Check de compreensao (rapido)
- [ ] Sei explicar em 60 segundos o objetivo e impacto deste BK.
- [ ] Sei indicar o RF/RNF coberto e as dependencias do BK.
- [ ] Sei demonstrar um negativo relevante e o respetivo resultado esperado.
"""
        text = text.replace("## Pre-leitura minima (10-15 min)", pedagogic_block + "\n## Pre-leitura minima (10-15 min)")

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "guias-bk"
    guides = sorted(root.glob("MF*/BK-*.md"))

    changed = 0
    for guide in guides:
        if enrich_guide(guide):
            changed += 1

    print(f"Guias atualizados: {changed} ficheiros modificados de {len(guides)}.")


if __name__ == "__main__":
    main()
