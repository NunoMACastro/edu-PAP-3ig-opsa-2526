#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re

TODAY = "2026-04-13"
SPRINT_WINDOW_BY_MACRO = {
    "MF0": "S01-S02",
    "MF1": "S03-S04",
    "MF2": "S05-S06",
    "MF3": "S07-S08",
    "MF4": "S08-S09",
    "MF5": "S09-S10",
    "MF6": "S10-S11",
    "MF7": "S11-S12",
    "MF8": "S12",
}


def extract_header_value(text: str, key: str) -> str:
    m = re.search(rf"^- `{re.escape(key)}`: `([^`]+)`", text, flags=re.MULTILINE)
    return m.group(1).strip() if m else ""


def set_header_value(text: str, key: str, value: str) -> str:
    pattern = rf"(^- `{re.escape(key)}`: `)[^`]*(`)$"
    replacement = rf"\g<1>{value}\2"
    return re.sub(pattern, replacement, text, count=1, flags=re.MULTILINE)


def ensure_line_after(text: str, anchor_key: str, new_line: str) -> str:
    if new_line in text:
        return text
    anchor = re.search(rf"^- `{re.escape(anchor_key)}`: `[^`]+`$", text, flags=re.MULTILINE)
    if not anchor:
        return text
    insert_at = anchor.end()
    return text[:insert_at] + "\n" + new_line + text[insert_at:]


def enrich_guide(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text

    macro = path.parent.name
    prioridade = extract_header_value(text, "prioridade") or "P1"
    core_or_reforco = "Reforco" if prioridade == "P0" else "Core"

    text = set_header_value(text, "last_updated", TODAY)
    text = set_header_value(text, "sprint", SPRINT_WINDOW_BY_MACRO.get(macro, "S12"))
    text = set_header_value(text, "core_or_reforco", core_or_reforco)
    text = set_header_value(text, "guia_path", f"docs/planificacao/guias-bk/{macro}/{path.name}")

    if "## Bloco pedagogico" not in text:
        text += """

## Bloco pedagogico
### Objetivo
### Pre-requisitos
### Erros comuns
### Check de compreensao
### Tempo estimado
"""

    if "## Bloco operacional" not in text:
        text += """

## Bloco operacional
### Entrada
### Passos
### Validacao
### Handoff
"""

    if "## Snippet tecnico aplicavel" not in text:
        text += """

## Snippet tecnico aplicavel
```ts
// Inserir snippet real do BK
```
"""

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "guias-bk"
    guides = sorted(root.glob("MF*/BK-MF*-*.md"))

    changed = 0
    for guide in guides:
        if enrich_guide(guide):
            changed += 1

    print(f"Guias verificados/atualizados: {changed} ficheiros modificados de {len(guides)}.")


if __name__ == "__main__":
    main()
