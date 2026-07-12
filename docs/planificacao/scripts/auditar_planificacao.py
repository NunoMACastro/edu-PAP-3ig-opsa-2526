#!/usr/bin/env python3
"""Audit OPSA planning documents and enforce release-quality documentation gates.

The command prints a machine-readable JSON report and exits with status 1 whenever
it finds documentation drift, conflict markers, unwaived blockers/advisories, an
invalid waiver configuration, or a canonical runtime decision other than the
academic ready state. Waivers are explicit, attributable and time-bounded through
``docs/planificacao/VALIDATION-WAIVERS.json``; merge conflict markers are never
waivable.
"""

from __future__ import annotations

from pathlib import Path
import argparse
import re
import json
from datetime import date, datetime
from collections import defaultdict
import unicodedata

from documentation_sync_contract import (
    audit_canonical_runtime_state,
    audit_documentation_sync,
    run_mutation_self_test,
)

EXPECTED_RF = [f"RF{i:02d}" for i in range(1, 52)]
EXPECTED_RNF = [f"RNF{i:02d}" for i in range(1, 40)]
MAX_DOC_AGE_DAYS = 30
GUIDE_FILENAME_RE = re.compile(r"^BK-MF[0-8]-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
MAX_SNIPPET_DUPLICATION = 40
DOCUMENT_TEXT_SUFFIXES = {".md", ".json", ".txt", ".yaml", ".yml"}
CONFLICT_MARKER_RE = re.compile(
    r"^(?:<<<<<<<(?: .+)?|=======|>>>>>>>(?: .+)?)\s*$",
    flags=re.MULTILINE,
)
EVIDENCE_DECISION_RE = re.compile(
    r"^(?:-\s*)?(?:Decis[aã]o(?: final)?|Resultado final):\s*`?([A-Z][A-Z0-9_]+)`?",
    flags=re.MULTILINE,
)
BLOCKING_DECISION_PREFIXES = ("BLOQUEAD", "BLOQUEANT", "FAIL", "LACUNA")
ADVISORY_DECISION_PREFIXES = ("PASS_COM_", "PODE_AVANCAR_COM_", "PENDENTE", "RESSALVA")
WAIVER_SCHEMA_VERSION = 1
MIN_WAIVER_REASON_LENGTH = 20


def repo_relative(repo: Path, path: Path) -> str:
    """Return a stable POSIX path relative to the repository root."""
    return path.resolve().relative_to(repo.resolve()).as_posix()


def normalize_issue_part(value: object) -> str:
    """Normalize arbitrary issue data into a deterministic waiver identifier part."""
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-zA-Z0-9._/=-]+", "-", text.strip()).strip("-").lower() or "unknown"


def make_issue(
    severity: str,
    category: str,
    identity: object,
    detail: object,
    *,
    path: str | None = None,
    waivable: bool = True,
) -> dict[str, object]:
    """Create one stable blocker/advisory record consumed by the waiver gate."""
    issue = {
        "issue_id": f"{severity}:{normalize_issue_part(category)}:{normalize_issue_part(identity)}",
        "severity": severity,
        "category": category,
        "detail": detail,
        "waivable": waivable,
    }
    if path:
        issue["path"] = path
    return issue


def scan_conflict_markers(repo: Path) -> list[dict[str, object]]:
    """Find unresolved merge markers in textual documentation.

    Conflict markers are never waivable because the document has no trustworthy
    canonical state until the conflict is resolved explicitly.
    """
    issues: list[dict[str, object]] = []
    docs_root = repo / "docs"

    for path in sorted(p for p in docs_root.rglob("*") if p.is_file()):
        if path.suffix.lower() not in DOCUMENT_TEXT_SUFFIXES:
            continue
        marker_lines = [
            line_number
            for line_number, line in enumerate(read(path).splitlines(), start=1)
            if CONFLICT_MARKER_RE.match(line)
        ]
        if not marker_lines:
            continue
        relative_path = repo_relative(repo, path)
        issues.append(
            make_issue(
                "blocker",
                "conflict-marker",
                relative_path,
                {"lines": marker_lines},
                path=relative_path,
                waivable=False,
            )
        )

    return issues


def scan_evidence_decisions(repo: Path) -> list[dict[str, object]]:
    """Collect explicit blocking or qualified decisions from current MF8 evidence.

    Only structured decision fields are parsed. Mentions inside explanatory prose do
    not become release state, which avoids false positives in risk descriptions.
    """
    issues: list[dict[str, object]] = []
    evidence_root = repo / "docs" / "evidence" / "MF8"
    seen_decisions: set[tuple[str, str, str]] = set()

    if not evidence_root.exists():
        return issues

    for path in sorted(evidence_root.glob("*.md")):
        relative_path = repo_relative(repo, path)
        for match in EVIDENCE_DECISION_RE.finditer(read(path)):
            decision = match.group(1)
            if decision.startswith(BLOCKING_DECISION_PREFIXES):
                severity = "blocker"
                category = "evidence-decision"
            elif decision.startswith(ADVISORY_DECISION_PREFIXES):
                severity = "advisory"
                category = "evidence-decision-qualified"
            else:
                continue
            decision_key = (relative_path, decision, severity)
            if decision_key in seen_decisions:
                continue
            seen_decisions.add(decision_key)
            issues.append(
                make_issue(
                    severity,
                    category,
                    f"{relative_path}:{decision}",
                    {"decision": decision},
                    path=relative_path,
                )
            )

    return issues


def parse_waiver_date(raw: object) -> date | None:
    """Parse a waiver expiration date in strict ISO YYYY-MM-DD format."""
    if not isinstance(raw, str):
        return None
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError:
        return None


def load_validation_waivers(
    repo: Path,
    waiver_path: Path,
    *,
    today: date | None = None,
) -> tuple[dict[str, dict[str, str]], list[dict[str, object]]]:
    """Load active, attributable and time-bounded validation waivers.

    Malformed, duplicate or expired entries are returned as non-waivable blockers so
    a broken waiver configuration can never turn the documentation gate green.
    """
    today = today or date.today()
    active: dict[str, dict[str, str]] = {}
    errors: list[dict[str, object]] = []
    relative_path = repo_relative(repo, waiver_path)

    if not waiver_path.exists():
        errors.append(
            make_issue(
                "blocker",
                "waiver-config",
                "missing-file",
                "Ficheiro de waivers obrigatorio em falta.",
                path=relative_path,
                waivable=False,
            )
        )
        return active, errors

    try:
        payload = json.loads(read(waiver_path))
    except (json.JSONDecodeError, OSError) as error:
        errors.append(
            make_issue(
                "blocker",
                "waiver-config",
                "invalid-json",
                str(error),
                path=relative_path,
                waivable=False,
            )
        )
        return active, errors

    if not isinstance(payload, dict) or payload.get("schema_version") != WAIVER_SCHEMA_VERSION:
        errors.append(
            make_issue(
                "blocker",
                "waiver-config",
                "invalid-schema-version",
                f"schema_version deve ser {WAIVER_SCHEMA_VERSION}.",
                path=relative_path,
                waivable=False,
            )
        )
        return active, errors

    waivers = payload.get("waivers")
    if not isinstance(waivers, list):
        errors.append(
            make_issue(
                "blocker",
                "waiver-config",
                "waivers-not-list",
                "waivers deve ser uma lista.",
                path=relative_path,
                waivable=False,
            )
        )
        return active, errors

    for index, waiver in enumerate(waivers):
        identity = f"entry-{index}"
        if not isinstance(waiver, dict):
            errors.append(
                make_issue(
                    "blocker",
                    "waiver-config",
                    identity,
                    "Cada waiver deve ser um objeto.",
                    path=relative_path,
                    waivable=False,
                )
            )
            continue

        issue_id = waiver.get("issue_id")
        owner = waiver.get("owner")
        reason = waiver.get("reason")
        expires_on = parse_waiver_date(waiver.get("expires_on"))
        fields_valid = (
            isinstance(issue_id, str)
            and bool(issue_id.strip())
            and isinstance(owner, str)
            and bool(owner.strip())
            and isinstance(reason, str)
            and len(reason.strip()) >= MIN_WAIVER_REASON_LENGTH
            and expires_on is not None
        )

        if not fields_valid:
            errors.append(
                make_issue(
                    "blocker",
                    "waiver-config",
                    identity,
                    "Waiver exige issue_id, owner, reason >= 20 chars e expires_on ISO valido.",
                    path=relative_path,
                    waivable=False,
                )
            )
            continue

        assert isinstance(issue_id, str)
        assert isinstance(owner, str)
        assert isinstance(reason, str)
        assert expires_on is not None

        if issue_id in active:
            errors.append(
                make_issue(
                    "blocker",
                    "waiver-config",
                    f"duplicate-{issue_id}",
                    "issue_id duplicado.",
                    path=relative_path,
                    waivable=False,
                )
            )
            continue
        if expires_on < today:
            errors.append(
                make_issue(
                    "blocker",
                    "waiver-config",
                    f"expired-{issue_id}",
                    {"issue_id": issue_id, "expires_on": expires_on.isoformat()},
                    path=relative_path,
                    waivable=False,
                )
            )
            continue

        active[issue_id] = {
            "owner": owner.strip(),
            "reason": reason.strip(),
            "expires_on": expires_on.isoformat(),
        }

    return active, errors


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


def normalize_semantic_text(value: str) -> str:
    """Normalize PT-PT prose for semantic checks without requiring broken ASCII copy."""
    ascii_text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", ascii_text.lower()).strip()


def extract_semantic_headings(text: str) -> list[str]:
    """Return normalized Markdown headings independently of level and accents."""
    return [
        normalize_semantic_text(match.group(1))
        for match in re.finditer(r"^#{2,6}\s+(.+?)\s*$", text, flags=re.MULTILINE)
    ]


def heading_matches(headings: list[str], *prefixes: str) -> bool:
    """Check whether a guide has a heading matching one of the semantic variants."""
    normalized_prefixes = tuple(normalize_semantic_text(prefix) for prefix in prefixes)
    return any(heading.startswith(normalized_prefixes) for heading in headings)


def missing_required_guide_sections(text: str) -> list[str]:
    """Validate the active tutorial contract while accepting equivalent historic labels.

    OPSA guides were hydrated in three editorial waves. Their heading levels and a
    few labels differ, but all valid variants express the same contract. Requiring
    the retired ``Bloco pedagogico``/``Snippet tecnico`` literals generated hundreds
    of false advisories and encouraged deliberately unaccented Portuguese.
    """
    headings = extract_semantic_headings(text)
    normalized_text = normalize_semantic_text(text)
    checks = {
        "objetivo": heading_matches(headings, "objetivo", "o que vamos fazer neste bk"),
        "importancia": heading_matches(headings, "importancia", "porque e que isto e importante"),
        "scope_in": heading_matches(headings, "scope-in", "o que entra (scope)"),
        "scope_out": heading_matches(headings, "scope-out", "o que nao entra (scope-out)"),
        "estado_antes_depois": (
            heading_matches(headings, "estado antes e depois")
            or (
                heading_matches(headings, "estado antes")
                and heading_matches(headings, "estado depois")
            )
            or (
                "estado esperado antes do bk:" in normalized_text
                and "estado esperado depois do bk:" in normalized_text
            )
        ),
        "pre_requisitos": heading_matches(headings, "pre-requisitos", "pre-leitura minima"),
        "glossario": heading_matches(headings, "glossario"),
        "conceitos_teoricos": heading_matches(headings, "conceitos teoricos essenciais"),
        "arquitetura": (
            heading_matches(headings, "arquitetura do bk")
            or "impacto na arquitetura:" in normalized_text
        ),
        "ficheiros": (
            heading_matches(headings, "ficheiros a criar/editar/rever")
            or "ficheiros a criar/editar/rever:" in normalized_text
        ),
        "tutorial_linear": heading_matches(
            headings,
            "tutorial tecnico linear",
            "passos lineares",
        ),
        "criterios_aceite": heading_matches(headings, "criterios de aceite"),
        "validacao_final": heading_matches(headings, "validacao final"),
        "evidence": heading_matches(headings, "evidence para pr/defesa"),
        "handoff": heading_matches(headings, "handoff"),
        "changelog": heading_matches(headings, "changelog"),
    }
    return [name for name, present in checks.items() if not present]


def extract_meaningful_code_blocks(text: str) -> list[str]:
    """Return non-placeholder fenced blocks used as executable technical guidance."""
    blocks = re.findall(r"```[^\n]*\n(.*?)```", text, flags=re.DOTALL)
    placeholder_phrases = ("adicionar aqui", "trecho real e aplicavel")
    return [
        block
        for block in blocks
        if block.strip()
        and not any(phrase in normalize_semantic_text(block) for phrase in placeholder_phrases)
    ]


def has_non_placeholder_technical_content(text: str) -> bool:
    """Require concrete fenced technical content, not a retired standalone section."""
    return bool(extract_meaningful_code_blocks(text))


def extract_tutorial_step_count(text: str) -> int:
    """Count actual ``Passo N`` headings instead of every numbered sub-item."""
    return len(
        {
            int(match.group(1))
            for match in re.finditer(r"^#{3,6}\s+Passo\s+(\d+)\b", text, flags=re.MULTILINE | re.IGNORECASE)
        }
    )


def extract_negative_scenario_count(text: str) -> int:
    """Estimate documented negative coverage from explicit minima and step bodies."""
    normalized_text = normalize_semantic_text(text.replace("`", ""))
    number_words = {
        "um": 1,
        "uma": 1,
        "dois": 2,
        "duas": 2,
        "tres": 3,
        "quatro": 4,
        "cinco": 5,
        "seis": 6,
        "sete": 7,
        "oito": 8,
    }
    number_token = r"(\d+|um|uma|dois|duas|tres|quatro|cinco|seis|sete|oito)"
    patterns = (
        rf"negativ[^.\n]{{0,35}}?minim[^\d\n]{{0,12}}{number_token}",
        rf"pelo menos\s+{number_token}\s+(?:cenarios?\s+)?negativ",
        rf"{number_token}\s+cenarios?\s+negativ",
        rf"{number_token}\s+negativ",
    )
    explicit_counts: list[int] = []
    for pattern in patterns:
        for match in re.finditer(pattern, normalized_text):
            raw = match.group(1)
            explicit_counts.append(int(raw) if raw.isdigit() else number_words[raw])

    structured_count = len(
        re.findall(
            r"^7\.\s+Cen[aá]rio negativo/erro esperado\.?\s*$",
            text,
            flags=re.MULTILINE | re.IGNORECASE,
        )
    )
    return max([structured_count, *explicit_counts], default=0)


def extract_final_handoff(text: str) -> str:
    """Return the final Handoff section, independent of heading level."""
    matches = list(re.finditer(r"^#{2,6}\s+Handoff\s*$", text, flags=re.MULTILINE | re.IGNORECASE))
    if not matches:
        return ""
    start = matches[-1].end()
    next_heading = re.search(r"^#{2,6}\s+", text[start:], flags=re.MULTILINE)
    end = start + next_heading.start() if next_heading else len(text)
    return text[start:end]


def extract_first_technical_block(text: str) -> str:
    """Return a normalized representative block for excessive-duplication checks."""
    blocks = extract_meaningful_code_blocks(text)
    if not blocks:
        return ""
    return re.sub(r"\s+", " ", blocks[0]).strip()


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


def scorecard_issues(score_text: str, sprint_plan_text: str) -> list[str]:
    """Validate score weights and planned loads against the canonical sprint plan."""
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

    plan_rows = parse_table_rows(
        sprint_plan_text,
        "| sprint | periodo | foco_macro | objetivo_operacional | carga_planeada_u | gate |",
    )
    score_rows = parse_table_rows(
        score_text,
        (
            "| sprint | estado_sprint | cobertura | coerencia | pedagogia_guidance_step_by_step | "
            "adequacao_12o | governanca | carga_planeada_u | carga_real_u | desvio_u | "
            "risco_semaforo | acao_corretiva |"
        ),
    )
    plan_loads = {row["sprint"]: row["carga_planeada_u"] for row in plan_rows}
    score_loads = {row["sprint"]: row["carga_planeada_u"] for row in score_rows}
    for sprint, expected_load in sorted(plan_loads.items()):
        actual_load = score_loads.get(sprint)
        if actual_load is None:
            issues.append(f"missing_scorecard_sprint:{sprint}")
        elif actual_load != expected_load:
            issues.append(
                f"scorecard_planned_load_mismatch:{sprint}(expected={expected_load},actual={actual_load})"
            )
    for sprint in sorted(set(score_loads) - set(plan_loads)):
        issues.append(f"unexpected_scorecard_sprint:{sprint}")
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


def issue_identity(value: object) -> str:
    """Serialize an issue payload deterministically for stable waiver IDs."""
    if isinstance(value, (dict, list)):
        return json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"))
    return str(value)


def build_plan_validation_issues(
    repo: Path,
    coverage: dict[str, list[object]],
    consistency: dict[str, list[object]],
    guides_quality: dict[str, list[object]],
) -> list[dict[str, object]]:
    """Convert legacy validation findings into explicit blocker/advisory records."""
    issues: list[dict[str, object]] = []

    for category, entries in coverage.items():
        for entry in entries:
            issues.append(make_issue("blocker", f"coverage-{category}", issue_identity(entry), entry))

    blocking_consistency_categories = (
        "matriz_backlog_mismatches",
        "broken_guia_links",
        "invalid_dependencies",
        "cycles",
        "scorecard_contract_issues",
        "declared_totals_issues",
        "rnf_index_anchor_issues",
    )
    for category in blocking_consistency_categories:
        for entry in consistency.get(category, []):
            issues.append(make_issue("blocker", category, issue_identity(entry), entry))

    for raw_path in consistency.get("outdated_docs", []):
        path = Path(str(raw_path))
        relative_path = repo_relative(repo, path)
        issues.append(
            make_issue(
                "advisory",
                "outdated-doc",
                relative_path,
                "Documento sem last_updated recente.",
                path=relative_path,
            )
        )

    blocking_guide_categories = ("guide_header_issues", "naming_issues", "missing_guides")
    for category in blocking_guide_categories:
        for entry in guides_quality.get(category, []):
            issues.append(make_issue("blocker", category, issue_identity(entry), entry))

    for entry in guides_quality.get("guide_content_issues", []):
        issues.append(make_issue("advisory", "guide-content", issue_identity(entry), entry))

    return issues


def apply_validation_waivers(
    issues: list[dict[str, object]],
    active_waivers: dict[str, dict[str, str]],
    waiver_path: str,
) -> tuple[list[dict[str, object]], list[dict[str, object]], list[dict[str, object]]]:
    """Split issues into waived/unwaived sets and reject stale waiver identifiers."""
    known_ids = {str(issue["issue_id"]) for issue in issues}
    waived: list[dict[str, object]] = []
    unwaived: list[dict[str, object]] = []
    stale: list[dict[str, object]] = []

    for issue in issues:
        issue_id = str(issue["issue_id"])
        waiver = active_waivers.get(issue_id)
        if waiver and bool(issue.get("waivable", True)):
            waived_issue = dict(issue)
            waived_issue["waiver"] = waiver
            waived.append(waived_issue)
        else:
            unwaived.append(issue)

    for issue_id in sorted(set(active_waivers) - known_ids):
        stale.append(
            make_issue(
                "blocker",
                "waiver-config",
                f"stale-{issue_id}",
                {"issue_id": issue_id, "reason": "Waiver nao corresponde a um finding atual."},
                path=waiver_path,
                waivable=False,
            )
        )

    return waived, unwaived, stale


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Valida planificação, evidence e sincronização documental OPSA.",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Executa negativos de mutação do contrato documental num diretório temporário.",
    )
    args = parser.parse_args()
    if args.self_test:
        print(json.dumps(run_mutation_self_test(), indent=2, ensure_ascii=False))
        return

    repo = Path(__file__).resolve().parents[3]
    plan = repo / "docs" / "planificacao"
    backlogs = plan / "backlogs"
    guides_root = plan / "guias-bk"

    rf_codes = extract_codes(repo / "docs" / "RF.md", "RF")
    rnf_codes = extract_codes(repo / "docs" / "RNF.md", "RNF")

    matriz_rows = parse_table_rows(
        read(backlogs / "MATRIZ-CANONICA-BK.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado_alunos | esforco | dependencias | rf_rnf | fase_documental | proximo_bk_recomendado |",
    )
    backlog_rows = parse_table_rows(
        read(backlogs / "BACKLOG-MVP.md"),
        "| bk_id | macro | titulo | owner | apoio | prioridade | estado_alunos | esforco | dependencias | rf_rnf | fase_documental | proximo_bk | guia |",
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
            or m["estado_alunos"] != b["estado_alunos"]
            or m["prioridade"] != b["prioridade"]
            or sorted(parse_items(m["rf_rnf"])) != sorted(parse_items(b["rf_rnf"]))
        ):
            mismatches.append(
                {
                    "bk_id": bk_id,
                    "type": "field_mismatch",
                    "matrix": {"owner": m["owner"], "estado_alunos": m["estado_alunos"], "prioridade": m["prioridade"], "rf_rnf": m["rf_rnf"]},
                    "backlog": {"owner": b["owner"], "estado_alunos": b["estado_alunos"], "prioridade": b["prioridade"], "rf_rnf": b["rf_rnf"]},
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
        final_handoff = extract_final_handoff(text)
        if header_proximo and header_proximo != "-" and header_proximo not in final_handoff:
            guide_content_issues.append({"bk_id": bk_id, "issue": "handoff_missing_expected_next_bk"})

        if "Conseguir explicar e executar o BK" in text:
            guide_content_issues.append({"bk_id": bk_id, "issue": "generic_objective_phrase_legacy"})

        missing_sections = missing_required_guide_sections(text)
        if missing_sections:
            guide_content_issues.append(
                {
                    "bk_id": bk_id,
                    "issue": f"missing_required_sections({','.join(missing_sections)})",
                }
            )

        if not has_non_placeholder_technical_content(text):
            guide_content_issues.append({"bk_id": bk_id, "issue": "missing_or_placeholder_technical_content"})
        else:
            snippet = extract_first_technical_block(text)
            if snippet:
                snippet_histogram[snippet].append(bk_id)

        tutorial_steps = extract_tutorial_step_count(text)
        negative_scenarios = extract_negative_scenario_count(text)
        required_negatives = 3 if row["prioridade"] == "P0" else 2
        if tutorial_steps < 2:
            guide_content_issues.append(
                {"bk_id": bk_id, "issue": f"tutorial_minimum_steps(step={tutorial_steps},required=2)"}
            )
        if negative_scenarios < required_negatives:
            guide_content_issues.append(
                {
                    "bk_id": bk_id,
                    "issue": (
                        f"negative_scenarios_below_priority_minimum"
                        f"(neg={negative_scenarios},required={required_negatives})"
                    ),
                }
            )

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
    sprint_plan_text = read(plan / "sprints" / "PLANO-SPRINTS.md")
    scorecard_contract_issues = scorecard_issues(scorecard_text, sprint_plan_text)
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

    blocking_consistency_pass = (
        not mismatches
        and not broken_guia_links
        and not deps_invalid
        and not cycles
        and not scorecard_contract_issues
        and not declared_totals_issues
        and not rnf_index_anchor_consistency_issues
    )
    blocking_guides_pass = not guide_header_issues and not naming_issues and not missing_guides
    coverage_result = {
        "missing_rf_matrix": missing_rf_matrix,
        "missing_rnf_matrix": missing_rnf_matrix,
        "missing_rf_backlog": missing_rf_backlog,
        "missing_rnf_backlog": missing_rnf_backlog,
        "invalid_refs": sorted(invalid_refs),
    }
    consistency_result = {
        "matriz_backlog_mismatches": mismatches,
        "broken_guia_links": broken_guia_links,
        "invalid_dependencies": deps_invalid,
        "cycles": cycles,
        "outdated_docs": outdated_docs,
        "scorecard_contract_issues": scorecard_contract_issues,
        "declared_totals_issues": declared_totals_issues,
        "rnf_index_anchor_issues": rnf_index_anchor_consistency_issues,
    }
    guides_quality_result = {
        "guide_header_issues": guide_header_issues,
        "guide_content_issues": guide_content_issues,
        "naming_issues": naming_issues,
        "missing_guides": missing_guides,
    }

    conflict_marker_issues = scan_conflict_markers(repo)
    evidence_decision_issues = scan_evidence_decisions(repo)
    documentation_sync_result = audit_documentation_sync(repo)
    canonical_runtime_result = audit_canonical_runtime_state(repo)
    documentation_sync_issues = [
        make_issue(
            "blocker",
            f"documentation-sync-{issue['category']}",
            issue["identity"],
            issue["detail"],
            path=str(issue["path"]),
            waivable=issue["category"] in {"broken-link", "pagination-envelope"},
        )
        for issue in documentation_sync_result["issues"]
    ]
    plan_validation_issues = build_plan_validation_issues(
        repo,
        coverage_result,
        consistency_result,
        guides_quality_result,
    )
    waiver_path = plan / "VALIDATION-WAIVERS.json"
    active_waivers, waiver_config_issues = load_validation_waivers(repo, waiver_path)
    all_issues = (
        plan_validation_issues
        + conflict_marker_issues
        + evidence_decision_issues
        + documentation_sync_issues
        + waiver_config_issues
    )
    waived_issues, unwaived_issues, stale_waiver_issues = apply_validation_waivers(
        all_issues,
        active_waivers,
        repo_relative(repo, waiver_path),
    )
    waiver_config_issues.extend(stale_waiver_issues)
    unwaived_issues.extend(stale_waiver_issues)
    unwaived_blockers = [issue for issue in unwaived_issues if issue["severity"] == "blocker"]
    unwaived_advisories = [issue for issue in unwaived_issues if issue["severity"] == "advisory"]
    documentation_sync_issue_ids = {
        str(issue["issue_id"])
        for issue in documentation_sync_issues
    }
    unwaived_documentation_sync_issues = [
        issue
        for issue in unwaived_issues
        if str(issue["issue_id"]) in documentation_sync_issue_ids
    ]

    coverage_pass = not any(coverage_result.values())
    conflict_markers_pass = not conflict_marker_issues
    blockers_pass = not unwaived_blockers
    advisory_pass = not unwaived_advisories
    waiver_config_pass = not waiver_config_issues
    documentation_sync_pass = not unwaived_documentation_sync_issues
    canonical_runtime_pass = bool(canonical_runtime_result["canonical_runtime_pass"])
    overall_pass = (
        blockers_pass
        and advisory_pass
        and waiver_config_pass
        and canonical_runtime_pass
    )

    result = {
        "counts": {
            "rf_docs": len(rf_codes),
            "rnf_docs": len(rnf_codes),
            "matriz_bk": len(matriz_rows),
            "backlog_bk": len(backlog_rows),
            "guide_bk": len(guide_files),
        },
        "coverage": coverage_result,
        "consistency": consistency_result,
        "guides_quality": guides_quality_result,
        "documentation_sync": {
            **documentation_sync_result,
            "documentation_sync_pass": documentation_sync_pass,
            "unwaived_issues": unwaived_documentation_sync_issues,
            "waived_issue_count": len(
                [
                    issue
                    for issue in waived_issues
                    if str(issue["issue_id"]) in documentation_sync_issue_ids
                ]
            ),
        },
        "canonical_runtime": canonical_runtime_result,
        "validation_policy": {
            "waiver_file": repo_relative(repo, waiver_path),
            "active_waivers": active_waivers,
            "conflict_marker_issues": conflict_marker_issues,
            "evidence_decision_issues": evidence_decision_issues,
            "waiver_config_issues": waiver_config_issues,
            "waived_issues": waived_issues,
            "unwaived_blockers": unwaived_blockers,
            "unwaived_advisories": unwaived_advisories,
        },
        "status": {
            "coverage_pass": coverage_pass,
            "consistency_pass": blocking_consistency_pass,
            "guides_pass": blocking_guides_pass,
            "naming_pass": not naming_issues,
            "conflict_markers_pass": conflict_markers_pass,
            "blockers_pass": blockers_pass,
            "advisory_pass": advisory_pass,
            "waiver_config_pass": waiver_config_pass,
            "documentation_sync_pass": documentation_sync_pass,
            "canonical_runtime_pass": canonical_runtime_pass,
            "overall_pass": overall_pass,
        },
    }

    print(json.dumps(result, indent=2, ensure_ascii=False))
    if not overall_pass:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
