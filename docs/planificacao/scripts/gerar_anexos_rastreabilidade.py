#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
from collections import defaultdict

TODAY = "2026-04-19"

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


def split_md_row(line: str) -> list[str]:
    parts = [p.strip() for p in line.strip().strip("|").split("|")]
    return parts


def extract_global_backlog_rows(backlog_path: Path) -> list[dict[str, str]]:
    lines = backlog_path.read_text(encoding="utf-8").splitlines()

    header_idx = None
    for i, line in enumerate(lines):
        if line.startswith("| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | proximo_bk | guia |"):
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError("Tabela global de backlog nao encontrada.")

    end_idx = None
    for i in range(header_idx + 2, len(lines)):
        if lines[i].startswith("## MF0"):
            end_idx = i
            break
    if end_idx is None:
        raise RuntimeError("Fim da tabela global de backlog nao encontrado.")

    headers = split_md_row(lines[header_idx])
    rows: list[dict[str, str]] = []
    for line in lines[header_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        parts = split_md_row(line)
        if len(parts) != len(headers):
            continue
        rows.append(dict(zip(headers, parts)))

    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip()
    if raw == "-":
        return []
    return [item.strip() for item in raw.split(",") if item.strip()]


def normalize_guia_path(md_link_cell: str) -> str:
    m = re.search(r"\(([^)]+)\)", md_link_cell)
    if not m:
        return ""
    rel = m.group(1)
    rel = rel.replace("../", "")
    return f"docs/planificacao/{rel}"


def core_or_reforco(prioridade: str) -> str:
    return "Reforco" if prioridade.strip() == "P0" else "Core"


def fmt_md_table(headers: list[str], rows: list[list[str]]) -> str:
    out = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def write_contract(rows: list[dict[str, str]], out_path: Path) -> None:
    table_rows: list[list[str]] = []
    for r in rows:
        deps = ", ".join(parse_items(r["dependencias"])) or "-"
        reqs = ", ".join(parse_items(r["rf_rnf"]))
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                SPRINT_WINDOW_BY_MACRO[r["macro"]],
                r["owner"],
                reqs,
                deps,
                normalize_guia_path(r["guia"]),
                core_or_reforco(r["prioridade"]),
            ]
        )

    content = f"""# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Formalizar os campos obrigatorios por BK para manter coerencia entre `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `PLANO-SPRINTS` e `guias-bk`.

## Campos obrigatorios
- `bk_id`: identificador unico do backlog item.
- `mf`: macro funcional (`MF0..MF8`).
- `sprint`: janela de sprints onde o BK deve ser executado.
- `owner`: responsavel principal pelo BK.
- `rf_rnf[]`: requisitos RF/RNF cobertos pelo BK.
- `deps[]`: dependencias tecnicas explicitas.
- `guia_path`: caminho canónico do guia BK.
- `core_or_reforco`: `Reforco` para P0; `Core` para P1/P2.

## Regras de consistencia
1. `bk_id` deve existir simultaneamente na matriz, backlog e guia correspondente.
2. `owner`, `rf_rnf[]` e `deps[]` devem ser iguais entre matriz e backlog.
3. `guia_path` deve apontar para um ficheiro existente.
4. `core_or_reforco` e derivado da prioridade (`P0=Reforco`; `P1/P2=Core`).
5. Alteracoes em RF/RNF ou BK obrigam regeneracao dos anexos no mesmo commit.

## Matriz canónica de campos BK
{fmt_md_table([
    'bk_id', 'mf', 'sprint', 'owner', 'rf_rnf[]', 'deps[]', 'guia_path', 'core_or_reforco'
], table_rows)}

## Changelog
- `2026-04-13`: Contrato de campos BK formalizado com regra de derivacao Core/Reforco.
"""
    out_path.write_text(content, encoding="utf-8")


def write_rf_annex(rows: list[dict[str, str]], out_path: Path) -> None:
    rf_map: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        for req in parse_items(r["rf_rnf"]):
            if req.startswith("RF"):
                rf_map[req].append(r["bk_id"])

    ordered = sorted(rf_map.items(), key=lambda x: int(x[0][2:]))
    table_rows = [[req, str(len(bks)), ", ".join(bks)] for req, bks in ordered]

    content = f"""# ANEXO-RF-PARA-BKS

## Header
- `doc_id`: `ANEXO-RF-PARA-BKS`
- `path`: `docs/planificacao/backlogs/ANEXO-RF-PARA-BKS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade bidirecional `RF -> BKs`, gerada automaticamente a partir do backlog canónico.

## Mapeamento RF -> BKs
{fmt_md_table(['rf', 'total_bk', 'bks'], table_rows)}

## Changelog
- `2026-04-13`: Anexo canónico criado por geracao automatica.
"""
    out_path.write_text(content, encoding="utf-8")


def write_rnf_annex(rows: list[dict[str, str]], out_path: Path) -> None:
    rnf_map: dict[str, list[str]] = defaultdict(list)
    for r in rows:
        for req in parse_items(r["rf_rnf"]):
            if req.startswith("RNF"):
                rnf_map[req].append(r["bk_id"])

    ordered = sorted(rnf_map.items(), key=lambda x: int(x[0][3:]))
    table_rows = [[req, str(len(bks)), ", ".join(bks)] for req, bks in ordered]

    content = f"""# ANEXO-RNF-PARA-BKS

## Header
- `doc_id`: `ANEXO-RNF-PARA-BKS`
- `path`: `docs/planificacao/backlogs/ANEXO-RNF-PARA-BKS.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade bidirecional `RNF -> BKs`, gerada automaticamente a partir do backlog canónico.

## Mapeamento RNF -> BKs
{fmt_md_table(['rnf', 'total_bk', 'bks'], table_rows)}

## Changelog
- `2026-04-13`: Anexo canónico criado por geracao automatica.
"""
    out_path.write_text(content, encoding="utf-8")


def write_bk_sprint_owner_annex(rows: list[dict[str, str]], out_path: Path) -> None:
    table_rows: list[list[str]] = []
    for r in rows:
        table_rows.append(
            [
                r["bk_id"],
                r["macro"],
                SPRINT_WINDOW_BY_MACRO[r["macro"]],
                r["owner"],
                r["apoio"],
                r["prioridade"],
                core_or_reforco(r["prioridade"]),
                ", ".join(parse_items(r["rf_rnf"])),
                ", ".join(parse_items(r["dependencias"])) or "-",
                normalize_guia_path(r["guia"]),
            ]
        )

    content = f"""# ANEXO-BK-SPRINT-OWNER

## Header
- `doc_id`: `ANEXO-BK-SPRINT-OWNER`
- `path`: `docs/planificacao/backlogs/ANEXO-BK-SPRINT-OWNER.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Rastreabilidade operacional `BK -> Sprint -> Owner`, com contrato de carga pedagogica `Core/Reforco`.

## Mapeamento canónico BK -> Sprint -> Owner
{fmt_md_table([
    'bk_id', 'mf', 'sprint', 'owner', 'apoio', 'prioridade', 'core_or_reforco', 'rf_rnf[]', 'deps[]', 'guia_path'
], table_rows)}

## Changelog
- `2026-04-13`: Anexo canónico criado por geracao automatica.
"""
    out_path.write_text(content, encoding="utf-8")


def main() -> None:
    plan_root = Path(__file__).resolve().parents[1]
    backlog_path = plan_root / "backlogs" / "BACKLOG-MVP.md"
    rows = extract_global_backlog_rows(backlog_path)

    backlogs_dir = plan_root / "backlogs"
    write_contract(rows, backlogs_dir / "CONTRATO-CAMPOS-BK.md")
    write_rf_annex(rows, backlogs_dir / "ANEXO-RF-PARA-BKS.md")
    write_rnf_annex(rows, backlogs_dir / "ANEXO-RNF-PARA-BKS.md")
    write_bk_sprint_owner_annex(rows, backlogs_dir / "ANEXO-BK-SPRINT-OWNER.md")

    print(f"Anexos gerados com sucesso para {len(rows)} BK.")


if __name__ == "__main__":
    main()
