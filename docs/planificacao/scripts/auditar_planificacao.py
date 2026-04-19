#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import json
from datetime import date, datetime
from collections import defaultdict

EXPECTED_RF = [f"RF{i:02d}" for i in range(1, 49)]
EXPECTED_RNF = [f"RNF{i:02d}" for i in range(1, 37)]
MAX_DOC_AGE_DAYS = 30
GUIDE_FILENAME_RE = re.compile(r"^BK-MF[0-8]-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
MAX_SNIPPET_DUPLICATION = 40


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
    raw = raw.strip().replace("`", "")
    if raw in {"", "-", "transversal"}:
        return []
    out: list[str] = []
    for part in [x.strip() for x in raw.split(",") if x.strip()]:
        m = re.fullmatch(r"(RF|RNF)(\d{2})\.\.(\d{2})", part)
        if m:
            pref, s, e = m.groups()
            for n in range(int(s), int(e) + 1):
                out.append(f"{pref}{n:02d}")
        else:
            out.extend(re.findall(r"\b(?:RF|RNF)\d{2}\b", part))
    return out


def parse_bk_dependencies(raw: str) -> list[str]:
    raw = raw.strip().replace("`", "")
    if raw in {"", "-", "transversal"}:
        return []

    deps: list[str] = []
    for part in [x.strip() for x in raw.split(",") if x.strip()]:
        range_match = re.fullmatch(r"(BK-MF[0-8])-(\d{2})\.\.(BK-MF[0-8])-(\d{2})", part)
        if range_match:
            start_prefix, start_num, end_prefix, end_num = range_match.groups()
            if start_prefix == end_prefix and int(start_num) <= int(end_num):
                for n in range(int(start_num), int(end_num) + 1):
                    deps.append(f"{start_prefix}-{n:02d}")
                continue

        deps.extend(re.findall(r"\bBK-MF[0-8]-\d{2}\b", part))

    return deps


def normalize_guia_path(cell: str) -> str:
    m = re.search(r"\(([^)]+)\)", cell)
    if not m:
        return ""
    rel = m.group(1).replace("../", "")
    return f"docs/planificacao/{rel}"


def extract_header_value(text: str, key: str) -> str:
    m = re.search(rf"^- `{re.escape(key)}`: `([^`]+)`", text, flags=re.MULTILINE)
    return m.group(1).strip() if m else ""


def has_required_blocks(text: str) -> bool:
    required = [
        "## Bloco pedagogico",
        "### Objetivo",
        "### Pre-requisitos",
        "### Erros comuns",
        "### Check de compreensao",
        "### Tempo estimado",
        "## Bloco operacional",
        "### Entrada",
        "### Passos",
        "### Validacao",
        "### Handoff",
        "## Snippet tecnico aplicavel",
    ]
    return all(section in text for section in required)


def has_non_placeholder_snippet(text: str) -> bool:
    if "## Snippet tecnico aplicavel" not in text:
        return False
    if "Adicionar aqui" in text or "Trecho real e aplicavel" in text:
        return False
    return re.search(r"```[a-zA-Z0-9]*\n.+?```", text, flags=re.DOTALL) is not None


def extract_min_negativos(text: str) -> int:
    m = re.search(r"Negativos: minimo `?(\d+)`?", text)
    return int(m.group(1)) if m else 0


def extract_first_snippet_block(text: str) -> str:
    m = re.search(r"## Snippet tecnico aplicavel.*?```[a-zA-Z0-9]*\n(.+?)```", text, flags=re.DOTALL)
    if not m:
        return ""
    snippet = re.sub(r"\s+", " ", m.group(1)).strip()
    return snippet


def parse_totals_from_plan_readme(text: str) -> dict[str, int]:
    out: dict[str, int] = {}
    for key in ("RF", "RNF"):
        m = re.search(rf"-\s*Total\s+{key}:\s*\*\*(\d+)\*\*", text)
        if m:
            out[key] = int(m.group(1))
    return out


def rnf_anchor_issues(rnf_text: str) -> list[str]:
    issues: list[str] = []
    index = ""
    m = re.search(r"## Índice\s*(.+?)\n---", rnf_text, flags=re.DOTALL)
    if m:
        index = m.group(1)
    links = re.findall(r"\[[^\]]+\]\(#([^)]+)\)", index)
    if not links:
        return ["missing_rnf_index_links"]
    anchors = re.findall(r'<a id="([^"]+)"></a>', rnf_text)
    if len(anchors) != len(set(anchors)):
        issues.append("duplicate_rnf_anchor_ids")
    aset = set(anchors)
    for link in links:
        if link not in aset:
            issues.append(f"missing_anchor_for_link:{link}")
    return issues


def scorecard_issues(score_text: str) -> list[str]:
    expected = {
        "Cobertura/rastreabilidade": 25,
        "Coerencia documental": 20,
        "Pedagogia/guidance/step-by-step": 25,
        "Adequacao ao 12o": 20,
        "Governanca/avaliacao": 10,
    }
    issues = []
    for name, weight in expected.items():
        if not re.search(rf"\|\s*{re.escape(name)}\s*\|\s*{weight}\s*\|", score_text):
            issues.append(f"missing_or_invalid_score_criterion:{name}")
    return issues


def extract_last_updated_date(md_text: str) -> date | None:
    m = re.search(r"`last_updated`:\s*`(\d{4}-\d{2}-\d{2})`", md_text)
    if not m:
        return None
    try:
        return datetime.strptime(m.group(1), "%Y-%m-%d").date()
    except ValueError:
        return None


def is_recent_last_updated(doc_date: date, today: date | None = None) -> bool:
    today = today or date.today()
    if doc_date > today:
        return False
    return (today - doc_date).days <= MAX_DOC_AGE_DAYS


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
    backlog_refs = set()
    invalid_refs = set()
    for row in matriz_rows:
        for req in parse_items(row["rf_rnf"]):
            matrix_refs.add(req)
            if req.startswith("RF") and req not in rf_expected:
                invalid_refs.add(req)
            if req.startswith("RNF") and req not in rnf_expected:
                invalid_refs.add(req)
    for row in backlog_rows:
        for req in parse_items(row["rf_rnf"]):
            backlog_refs.add(req)
            if req.startswith("RF") and req not in rf_expected:
                invalid_refs.add(req)
            if req.startswith("RNF") and req not in rnf_expected:
                invalid_refs.add(req)

    missing_rf_matrix = sorted(rf_expected - {x for x in matrix_refs if x.startswith("RF")})
    missing_rnf_matrix = sorted(rnf_expected - {x for x in matrix_refs if x.startswith("RNF")})
    missing_rf_backlog = sorted(rf_expected - {x for x in backlog_refs if x.startswith("RF")})
    missing_rnf_backlog = sorted(rnf_expected - {x for x in backlog_refs if x.startswith("RNF")})

    mismatches = []
    for bk_id, m in matriz_by_bk.items():
        b = backlog_by_bk.get(bk_id)
        if not b:
            mismatches.append({"bk_id": bk_id, "type": "missing_in_backlog"})
            continue
        if (
            m["owner"] != b["owner"]
            or m["prioridade"] != b["prioridade"]
            or sorted(parse_items(m["rf_rnf"])) != sorted(parse_items(b["rf_rnf"]))
        ):
            mismatches.append(
                {
                    "bk_id": bk_id,
                    "type": "field_mismatch",
                    "matrix": {"owner": m["owner"], "prioridade": m["prioridade"], "rf_rnf": m["rf_rnf"]},
                    "backlog": {"owner": b["owner"], "prioridade": b["prioridade"], "rf_rnf": b["rf_rnf"]},
                }
            )

    guide_files = sorted(guides_root.glob("MF*/BK-MF*-*.md"))
    legacy_files = sorted(guides_root.glob("MF*/BK-MF[0-8]-[0-9][0-9].md"))

    missing_guides = []
    broken_guia_links = []
    guide_header_issues = []
    guide_content_issues = []
    naming_issues = []

    existing_guide_paths = {f"docs/planificacao/guias-bk/{p.parent.name}/{p.name}" for p in guide_files}

    for row in backlog_rows:
        guia_path = normalize_guia_path(row["guia"])
        if guia_path not in existing_guide_paths:
            broken_guia_links.append({"bk_id": row["bk_id"], "guia_path": guia_path})

    required_headers = [
        "bk_id",
        "macro",
        "owner",
        "apoio",
        "prioridade",
        "estado",
        "esforco",
        "dependencias",
        "rf_rnf",
        "fase_documental",
        "sprint",
        "core_or_reforco",
        "proximo_bk",
        "guia_path",
        "last_updated",
    ]

    snippet_histogram: dict[str, list[str]] = defaultdict(list)

    for guide in guide_files:
        text = read(guide)
        bk_id = extract_header_value(text, "bk_id")

        if not bk_id:
            naming_issues.append({"guide": str(guide), "issue": "missing_bk_id_header"})
            continue

        row = backlog_by_bk.get(bk_id)
        if not row:
            missing_guides.append({"guide": str(guide), "reason": "bk_not_in_backlog"})
            continue

        if not GUIDE_FILENAME_RE.match(guide.name):
            naming_issues.append({"bk_id": bk_id, "issue": "filename_not_slug_pattern", "file": guide.name})
        if not guide.name.startswith(f"{bk_id}-"):
            naming_issues.append({"bk_id": bk_id, "issue": "filename_not_prefixed_by_bk_id", "file": guide.name})

        for header in required_headers:
            if not extract_header_value(text, header):
                guide_header_issues.append({"bk_id": bk_id, "missing": header})

        expected_core = "Reforco" if row["prioridade"] == "P0" else "Core"
        actual_core = extract_header_value(text, "core_or_reforco")
        if actual_core != expected_core:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": f"core_or_reforco != {expected_core}"})

        expected_path = f"docs/planificacao/guias-bk/{guide.parent.name}/{guide.name}"
        actual_path = extract_header_value(text, "guia_path")
        if actual_path != expected_path:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "guia_path_not_matching_file"})

        if sorted(parse_items(extract_header_value(text, "rf_rnf"))) != sorted(parse_items(row["rf_rnf"])):
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "rf_rnf_not_matching_backlog"})

        header_proximo = extract_header_value(text, "proximo_bk")
        if header_proximo and header_proximo != "-" and header_proximo not in matriz_by_bk:
            guide_header_issues.append({"bk_id": bk_id, "mismatch": "invalid_header_proximo_bk"})
        handoff_match = re.search(r"^- Proximo BK recomendado: `([^`]+)`", text, flags=re.MULTILINE)
        if not handoff_match:
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_handoff_proximo_bk_line"})
        else:
            handoff_proximo = handoff_match.group(1).strip()
            if header_proximo and handoff_proximo != header_proximo:
                guide_content_issues.append({"bk_id": bk_id, "issue": "handoff_proximo_bk_not_matching_header"})
            if handoff_proximo != "-" and handoff_proximo not in matriz_by_bk:
                guide_content_issues.append({"bk_id": bk_id, "issue": "invalid_handoff_proximo_bk"})

        if "Conseguir explicar e executar o BK" in text:
            guide_content_issues.append({"bk_id": bk_id, "issue": "generic_objective_phrase_legacy"})

        if not has_required_blocks(text):
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_pedagogic_or_operational_blocks"})

        if not has_non_placeholder_snippet(text):
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_or_placeholder_snippet"})
        else:
            snippet = extract_first_snippet_block(text)
            if snippet:
                snippet_histogram[snippet].append(bk_id)

        step_count = len(re.findall(r"^\d+\. ", text, flags=re.MULTILINE))
        min_negativos = extract_min_negativos(text)
        if row["prioridade"] == "P0" and (step_count < 8 or min_negativos < 3):
            guide_content_issues.append({"bk_id": bk_id, "issue": f"P0_minimos(step={step_count},neg={min_negativos})"})
        if row["prioridade"] in {"P1", "P2"} and (step_count < 6 or min_negativos < 2):
            guide_content_issues.append({"bk_id": bk_id, "issue": f"P1P2_minimos(step={step_count},neg={min_negativos})"})

    for lf in legacy_files:
        naming_issues.append({"file": str(lf), "issue": "legacy_filename_without_slug"})

    for snippet_bks in snippet_histogram.values():
        if len(snippet_bks) > MAX_SNIPPET_DUPLICATION:
            guide_content_issues.append(
                {
                    "bk_id": ",".join(sorted(snippet_bks)[:3]) + ",...",
                    "issue": f"snippet_duplication_above_threshold(count={len(snippet_bks)},threshold={MAX_SNIPPET_DUPLICATION})",
                }
            )

    deps_invalid = []
    graph: dict[str, list[str]] = defaultdict(list)
    for row in matriz_rows:
        bk_id = row["bk_id"]
        deps = parse_bk_dependencies(row["dependencias"])
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
                cycles.append(stack[stack.index(node) :] + [node])
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

    scorecard_text = read(plan / "sprints" / "SCORECARD-SPRINTS.md")
    scorecard_contract_issues = scorecard_issues(scorecard_text)
    plan_readme_text = read(plan / "README.md")
    declared_totals = parse_totals_from_plan_readme(plan_readme_text)
    declared_totals_issues: list[str] = []
    if declared_totals.get("RF") != len(rf_codes):
        declared_totals_issues.append(f"declared_total_rf_mismatch(expected={len(rf_codes)},declared={declared_totals.get('RF')})")
    if declared_totals.get("RNF") != len(rnf_codes):
        declared_totals_issues.append(
            f"declared_total_rnf_mismatch(expected={len(rnf_codes)},declared={declared_totals.get('RNF')})"
        )
    rnf_index_anchor_consistency_issues = rnf_anchor_issues(read(repo / "docs" / "RNF.md"))

    plan_docs = [
        plan / "README.md",
        plan / "PLANO-IMPLEMENTACAO-TOTAL.md",
        plan / "DISTRIBUICAO-RESPONSABILIDADES.md",
        plan / "sprints" / "PLANO-SPRINTS.md",
        plan / "sprints" / "SCORECARD-SPRINTS.md",
        plan / "sprints" / "GUIAO-DOCENTE-SEMANAL.md",
        plan / "sprints" / "OPERACAO-DEPLOY-ROLLBACK.md",
        backlogs / "MATRIZ-CANONICA-BK.md",
        backlogs / "BACKLOG-MVP.md",
        backlogs / "MF-VIEWS.md",
        backlogs / "CONTRATO-CAMPOS-BK.md",
    ]
    conformidade_doc = plan / "CONFORMIDADE-PLANIFICACAO.md"
    if conformidade_doc.exists():
        plan_docs.append(conformidade_doc)

    outdated_docs = []
    for p in plan_docs:
        text = read(p)
        last_updated = extract_last_updated_date(text)
        if not last_updated or not is_recent_last_updated(last_updated):
            outdated_docs.append(str(p))

    result = {
        "counts": {
            "rf_docs": len(rf_codes),
            "rnf_docs": len(rnf_codes),
            "matriz_bk": len(matriz_rows),
            "backlog_bk": len(backlog_rows),
            "guide_bk": len(guide_files),
        },
        "coverage": {
            "missing_rf_matrix": missing_rf_matrix,
            "missing_rnf_matrix": missing_rnf_matrix,
            "missing_rf_backlog": missing_rf_backlog,
            "missing_rnf_backlog": missing_rnf_backlog,
            "invalid_refs": sorted(invalid_refs),
        },
        "consistency": {
            "matriz_backlog_mismatches": mismatches,
            "broken_guia_links": broken_guia_links,
            "invalid_dependencies": deps_invalid,
            "cycles": cycles,
            "outdated_docs": outdated_docs,
            "scorecard_contract_issues": scorecard_contract_issues,
            "declared_totals_issues": declared_totals_issues,
            "rnf_index_anchor_issues": rnf_index_anchor_consistency_issues,
        },
        "guides_quality": {
            "guide_header_issues": guide_header_issues,
            "guide_content_issues": guide_content_issues,
            "naming_issues": naming_issues,
            "missing_guides": missing_guides,
        },
        "status": {
            "coverage_pass": not missing_rf_matrix
            and not missing_rnf_matrix
            and not missing_rf_backlog
            and not missing_rnf_backlog
            and not invalid_refs,
            "consistency_pass": not mismatches
            and not broken_guia_links
            and not deps_invalid
            and not cycles
            and not outdated_docs
            and not scorecard_contract_issues
            and not declared_totals_issues
            and not rnf_index_anchor_consistency_issues,
            "guides_pass": not guide_header_issues and not guide_content_issues and not naming_issues and not missing_guides,
            "naming_pass": not naming_issues,
            "overall_pass": not missing_rf_matrix
            and not missing_rnf_matrix
            and not missing_rf_backlog
            and not missing_rnf_backlog
            and not invalid_refs
            and not mismatches
            and not broken_guia_links
            and not deps_invalid
            and not cycles
            and not outdated_docs
            and not scorecard_contract_issues
            and not declared_totals_issues
            and not rnf_index_anchor_consistency_issues
            and not guide_header_issues
            and not guide_content_issues
            and not naming_issues
            and not missing_guides,
        },
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
