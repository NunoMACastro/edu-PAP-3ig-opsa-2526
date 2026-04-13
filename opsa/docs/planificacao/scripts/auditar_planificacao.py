#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import json
from collections import defaultdict

EXPECTED_RF = [f"RF{i:02d}" for i in range(1, 65)]
EXPECTED_RNF = [f"RNF{i:02d}" for i in range(1, 41)]
TODAY = "2026-04-13"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_codes(path: Path, prefix: str) -> list[str]:
    text = read(path)
    return sorted(set(re.findall(rf"\b{prefix}\d{{2}}\b", text)))


def parse_table_rows(md_text: str, header_start: str, stop_heading: str | None = None) -> list[dict[str, str]]:
    lines = md_text.splitlines()
    start_idx = None
    for i, line in enumerate(lines):
        if line.startswith(header_start):
            start_idx = i
            break
    if start_idx is None:
        return []

    end_idx = len(lines)
    if stop_heading:
        for i in range(start_idx + 2, len(lines)):
            if lines[i].startswith(stop_heading):
                end_idx = i
                break

    headers = [p.strip() for p in lines[start_idx].strip().strip("|").split("|")]
    rows = []
    for line in lines[start_idx + 2 : end_idx]:
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if len(parts) != len(headers):
            continue
        rows.append(dict(zip(headers, parts)))
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip()
    if raw == "-":
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def normalize_guia_path(cell: str) -> str:
    m = re.search(r"\(([^)]+)\)", cell)
    if not m:
        return ""
    rel = m.group(1).replace("../", "")
    return f"docs/planificacao/{rel}"


def has_new_pedagogic_sections(text: str) -> bool:
    required = [
        "## Pre-requisitos operacionais",
        "## Objetivo pedagogico (12o ano)",
        "## Tempo estimado",
        "## Erros comuns a evitar",
        "## Check de compreensao (rapido)",
    ]
    return all(section in text for section in required)


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    plan = repo / "docs" / "planificacao"
    backlogs = plan / "backlogs"
    guides_root = plan / "guias-bk"

    rf_codes = extract_codes(repo / "docs" / "RF.md", "RF")
    rnf_codes = extract_codes(repo / "docs" / "RNF.md", "RNF")

    matriz_rows = parse_table_rows(
        read(backlogs / "MATRIZ-CANONICA-BK.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | proximo_bk_recomendado |",
    )
    backlog_rows = parse_table_rows(
        read(backlogs / "BACKLOG-MVP.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado | esforco | dependencias | rf_rnf | fase_documental | proximo_bk | guia |",
        "## MF0",
    )

    rf_expected = set(EXPECTED_RF)
    rnf_expected = set(EXPECTED_RNF)

    matriz_by_bk = {r["bk_id"]: r for r in matriz_rows}
    backlog_by_bk = {r["bk_id"]: r for r in backlog_rows}

    matrix_refs = set()
    invalid_refs = set()
    for row in matriz_rows:
        for req in parse_items(row["rf_rnf"]):
            matrix_refs.add(req)
            if req.startswith("RF") and req not in rf_expected:
                invalid_refs.add(req)
            if req.startswith("RNF") and req not in rnf_expected:
                invalid_refs.add(req)

    rf_covered = {x for x in matrix_refs if x.startswith("RF")}
    rnf_covered = {x for x in matrix_refs if x.startswith("RNF")}

    missing_rf = sorted(rf_expected - rf_covered)
    missing_rnf = sorted(rnf_expected - rnf_covered)

    mismatches = []
    for bk_id, m in matriz_by_bk.items():
        b = backlog_by_bk.get(bk_id)
        if not b:
            mismatches.append({"bk_id": bk_id, "type": "missing_in_backlog"})
            continue
        if m["owner"] != b["owner"] or m["prioridade"] != b["prioridade"] or m["rf_rnf"] != b["rf_rnf"]:
            mismatches.append({
                "bk_id": bk_id,
                "type": "field_mismatch",
                "matrix": {"owner": m["owner"], "prioridade": m["prioridade"], "rf_rnf": m["rf_rnf"]},
                "backlog": {"owner": b["owner"], "prioridade": b["prioridade"], "rf_rnf": b["rf_rnf"]},
            })

    guide_files = sorted(guides_root.glob("MF*/BK-*.md"))
    missing_guides = []
    broken_guia_links = []
    guide_header_issues = []
    guide_pedagogy_issues = []

    existing_guide_paths = {f"docs/planificacao/guias-bk/{p.parent.name}/{p.name}" for p in guide_files}

    for row in backlog_rows:
        guia_path = normalize_guia_path(row["guia"])
        if guia_path not in existing_guide_paths:
            broken_guia_links.append({"bk_id": row["bk_id"], "guia_path": guia_path})

    for guide in guide_files:
        text = read(guide)
        bk_id = guide.stem
        row = backlog_by_bk.get(bk_id)
        if not row:
            missing_guides.append({"guide": str(guide), "reason": "bk_not_in_backlog"})
            continue

        required_headers = [
            "`sprint`",
            "`guia_path`",
            "`core_or_reforco`",
        ]
        for header in required_headers:
            if header not in text:
                guide_header_issues.append({"bk_id": bk_id, "missing": header})

        prio = row["prioridade"]
        expected_core = "Reforco" if prio == "P0" else "Core"
        if f"- `core_or_reforco`: `{expected_core}`" not in text:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": f"core_or_reforco != {expected_core}"})

        if not has_new_pedagogic_sections(text):
            guide_pedagogy_issues.append({"bk_id": bk_id, "issue": "missing_new_sections"})

        # Minimos de passos/negativos
        step_count = len(re.findall(r"^\d+\. ", text, flags=re.MULTILINE))
        neg_count = len(re.findall(r"^- \[ \] ", text, flags=re.MULTILINE))
        if prio == "P0" and (step_count < 8 or neg_count < 3):
            guide_pedagogy_issues.append({"bk_id": bk_id, "issue": f"P0_minimos(step={step_count},neg={neg_count})"})
        if prio in {"P1", "P2"} and (step_count < 6 or neg_count < 2):
            guide_pedagogy_issues.append({"bk_id": bk_id, "issue": f"P1P2_minimos(step={step_count},neg={neg_count})"})

    # Dependencias invalidas e ciclos
    deps_invalid = []
    graph: dict[str, list[str]] = defaultdict(list)
    for row in matriz_rows:
        bk_id = row["bk_id"]
        deps = parse_items(row["dependencias"])
        for dep in deps:
            if dep not in matriz_by_bk:
                deps_invalid.append({"bk_id": bk_id, "dep": dep})
            else:
                graph[bk_id].append(dep)

    seen, visiting = set(), set()
    cycles = []

    def dfs(node: str, stack: list[str]) -> None:
        if node in visiting:
            if node in stack:
                cycles.append(stack[stack.index(node):] + [node])
            return
        if node in seen:
            return
        visiting.add(node)
        for nei in graph.get(node, []):
            dfs(nei, stack + [nei])
        visiting.remove(node)
        seen.add(node)

    for n in graph:
        dfs(n, [n])

    # Datas/coerencia
    plan_docs = [
        plan / "README.md",
        plan / "PLANO-IMPLEMENTACAO-TOTAL.md",
        plan / "RELATORIO-CONFORMIDADE-PLANIFICACAO.md",
        plan / "DISTRIBUICAO-RESPONSABILIDADES.md",
        plan / "sprints" / "PLANO-SPRINTS.md",
        backlogs / "MATRIZ-CANONICA-BK.md",
        backlogs / "BACKLOG-MVP.md",
        backlogs / "MF-VIEWS.md",
    ]
    outdated_docs = []
    missing_s12_refs = []
    for p in plan_docs:
        text = read(p)
        if f"`last_updated`: `{TODAY}`" not in text:
            outdated_docs.append(str(p))
        if "S12" not in text and p.name in {"README.md", "PLANO-SPRINTS.md", "BACKLOG-MVP.md"}:
            missing_s12_refs.append(str(p))

    result = {
        "counts": {
            "rf_docs": len(rf_codes),
            "rnf_docs": len(rnf_codes),
            "matriz_bk": len(matriz_rows),
            "backlog_bk": len(backlog_rows),
            "guide_bk": len(guide_files),
        },
        "coverage": {
            "missing_rf": missing_rf,
            "missing_rnf": missing_rnf,
            "invalid_refs": sorted(invalid_refs),
        },
        "consistency": {
            "matriz_backlog_mismatches": mismatches,
            "broken_guia_links": broken_guia_links,
            "invalid_dependencies": deps_invalid,
            "cycles": cycles,
            "outdated_docs": outdated_docs,
            "missing_s12_refs": missing_s12_refs,
        },
        "pedagogy": {
            "guide_header_issues": guide_header_issues,
            "guide_pedagogy_issues": guide_pedagogy_issues,
        },
        "status": {
            "coverage_pass": not missing_rf and not missing_rnf and not invalid_refs,
            "consistency_pass": not mismatches and not broken_guia_links and not deps_invalid and not cycles and not outdated_docs,
            "pedagogy_pass": not guide_header_issues and not guide_pedagogy_issues,
        },
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
