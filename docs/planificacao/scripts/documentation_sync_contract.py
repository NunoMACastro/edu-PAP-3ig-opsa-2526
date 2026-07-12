#!/usr/bin/env python3
"""Contrato fail-closed para sincronização entre docs e a referência OPSA.

O módulo mantém as regras de drift separadas dos blockers de runtime. A função
``audit_documentation_sync`` só avalia documentação; o auditor principal decide
depois o estado global da aplicação.
"""

from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import unquote
import re


CENTRAL_CONTRACT_PATH = Path("docs/planificacao/CONTRATO-INTERFACES-IMPLEMENTACAO.md")
CANONICAL_REPORT_PATH = Path("docs/planificacao/auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md")
EVIDENCE_ROOT = Path("docs/evidence/MF8")
ARCHITECTURE_PATH = EVIDENCE_ROOT / "ARQUITETURA-TECNICA-MINIMA.md"

REQUIRED_EVIDENCE = (
    "ARQUITETURA-TECNICA-MINIMA.md",
    *(f"BK-MF8-{number:02d}.md" for number in range(1, 16)),
    "CORRECAO-ERROS-REPORT.md",
    "EXECUCAO-FINAL-TESTES.md",
    "TESTES-EM-FALTA.md",
    "UI-MOCKUP-CHECKLIST.md",
)

REQUIRED_CONTRACT_MARKERS = (
    "POST /api/onboarding/company",
    "POST /api/invitations/preview",
    "POST /api/invitations/accept",
    "GET /api/company/invitations",
    "POST /api/company/invitations",
    "POST /api/company/invitations/:id/resend",
    "POST /api/company/invitations/:id/revoke",
    "PATCH /api/company/users/:id/role",
    "DELETE /api/company/users/:id",
    "POST /api/accounting/manual-journals/:id/attachments",
    "GET /api/accounting/manual-journals/:journalId/attachments/:attachmentId/download",
    "POST /api/imports/business-data",
    "POST /api/treasury/statements/import",
    "GET /api/treasury/statement-imports",
    "GET /api/treasury/statement-imports/:id",
    "POST /api/compliance/saft/exports",
    "GET /api/compliance/saft/exports/:exportId",
    "GET /api/compliance/saft/exports/:exportId/download",
    "GET /api/health/live",
    "GET /api/health/ready",
    "GET /api/health",
    "{ items, pageInfo: { nextCursor, hasNextPage } }",
    "GET /api/compliance/saft",
    "REMOVIDO",
    "EmailOutbox",
    "SecurityAuditEvent",
    "JournalEntryRevision",
    "CompanyInvitation",
    "JournalAttachment",
    "SaftExportRun",
    "FiscalPeriod.fiscalYear",
    "20260709200000_auth_onboarding_email_outbox",
    "20260709203000_e2e_integrity_files_saft",
    "20260710090000_critical_listing_pagination",
    "20260710110000_saft_internal_source_fields",
    "20260710113000_cursor_listing_indexes",
    "20260710120000_attachment_content_idempotency",
    "20260710123000_fiscal_period_explicit_fiscal_year",
    "DATABASE_URL",
    "TEST_DATABASE_URL",
    "RESTORE_DATABASE_URL",
    "REDIS_URL",
    "REDIS_KEY_PREFIX",
    "RATE_LIMIT_HMAC_KEY",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_SECURE",
    "SMTP_REQUIRE_TLS",
    "SMTP_USER",
    "SMTP_PASSWORD",
    "EMAIL_FROM",
    "EMAIL_OUTBOX_ENCRYPTION_KEY",
    "S3_ENDPOINT",
    "S3_REGION",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_FORCE_PATH_STYLE",
    "S3_SSE",
    "BACKUP_S3_BUCKET",
    "BACKUP_S3_PREFIX",
    "BACKUP_RETENTION_DAYS",
    "APP_BASE_URL",
    "TRUST_PROXY_HOPS",
    "SAFT_EXPORT_ENABLED",
    "SAFT_XSD_PATH",
    "worker:email",
    "worker:email:drain",
)

ARCHITECTURE_MARKERS = (
    "createApp(deps)",
    "startServer(options)",
    "EmailOutbox",
    "SecurityAuditEvent",
    "JournalEntryRevision",
    "JournalAttachment",
    "SaftExportRun",
    "BrowserRouter",
    "AuthProvider",
    "nextCursor",
    "GET /api/health/live",
    "GET /api/health/ready",
    "request",
    "prisma.$disconnect()",
    "worker:email",
    "worker:ai",
    "AiChatSession",
    "AiAnalysisRun",
    "/ai/chat",
    "299/299",
    "157/157",
    "2/7",
    "31/31",
)

GUIDE_RUNTIME_MARKERS = {
    Path("docs/planificacao/guias-bk/MF3/BK-MF3-06-exportar-saf-t-pt-de-faturacao-e-contabilidade.md"): (
        "INVALID_SAFT_REQUEST",
        "INVALID_SAFT_EXPORT_TYPE",
    ),
}

LEGACY_GUIDE_PATTERNS = (
    ("saft-get", re.compile(r"\bGET\s+/api/compliance/saft(?:\s|`|$)", re.IGNORECASE), "GET /api/compliance/saft"),
    ("saft-mvp", re.compile(r"1\.04_01-MVP", re.IGNORECASE), "1.04_01-MVP"),
    ("base64-file", re.compile(r"\b(?:file|content|payload|xlsx|attachment)Base64\b|\bbase64\s*:\s*(?:file|content|payload)", re.IGNORECASE), "file payload Base64"),
    ("raw-upload", re.compile(r"express\.raw\s*\(", re.IGNORECASE), "express.raw upload"),
    ("trust-proxy-one", re.compile(r"trust\s+proxy[\"'`\s,():=]{1,16}1\b", re.IGNORECASE), "trust proxy = 1"),
    ("restore-list-only", re.compile(r"pg_restore\s+--list", re.IGNORECASE), "restore por listagem"),
    ("saft-invalid-request-code", re.compile(r"\bINVALID_SAFT_EXPORT_REQUEST\b"), "código SAF-T inexistente"),
)

LEGACY_MUTATION_SAMPLES = {
    "saft-get": "GET /api/compliance/saft",
    "saft-mvp": "1.04_01-MVP",
    "base64-file": "fileBase64",
    "raw-upload": "express.raw({ type: 'application/pdf' })",
    "trust-proxy-one": "trust proxy = 1",
    "restore-list-only": "pg_restore --list",
    "saft-invalid-request-code": "INVALID_SAFT_EXPORT_REQUEST",
}

CURRENT_EVIDENCE_PLACEHOLDERS = (
    re.compile(r"PASS/FAIL", re.IGNORECASE),
    re.compile(r"\bPREENCHER\b", re.IGNORECASE),
    re.compile(r"Registar\s+output", re.IGNORECASE),
)

STALE_CURRENT_RESULTS = (
    "118 testes",
    "79 testes",
    "11 testes",
    "overall_pass=true",
)

AUTHENTICATED_URL_RE = re.compile(
    r"\b[a-z][a-z0-9+.-]*://[^\s/:@`<>]+:[^\s/@`<>]+@[^\s`<>)\]}'\"]+",
    re.IGNORECASE,
)
BEARER_LITERAL_RE = re.compile(r"\bAuthorization\s*:\s*Bearer\s+(?!<|\$\{|\[redacted\])[A-Za-z0-9._~-]{8,}", re.IGNORECASE)
COOKIE_LITERAL_RE = re.compile(r"\b(?:Cookie|Set-Cookie)\s*:\s*(?!<|\$\{|\[redacted\])[^\n`]*(?:sid|session|token)=[A-Za-z0-9._~-]{4,}", re.IGNORECASE)
SECRET_ASSIGNMENT_RE = re.compile(
    r"\b(?:SMTP_PASSWORD|S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY|RATE_LIMIT_HMAC_KEY|EMAIL_OUTBOX_ENCRYPTION_KEY|OPSA_SESSION_COOKIES_JSON)\s*=\s*(?!<|\$\{|\[redacted\]|REDACTED\b|$)[^\s`]+",
    re.IGNORECASE,
)
LIST_RESPONSE_IDENTIFIERS = (
    "accounts",
    "customers",
    "suppliers",
    "items",
    "documents",
    "saleDocuments",
    "purchaseDocuments",
    "movements",
    "journals",
    "entries",
    "rows",
    "logs",
    "auditLogs",
    "integrationLogs",
    "imports",
    "statementImports",
    "openItems",
    "records",
)
JSON_RESPONSE_CALL_RE = re.compile(
    r"(?:res|response)(?:\.status\([^)]*\))?\.json\(\s*(?P<body>.{1,800}?)\s*\)",
    re.IGNORECASE | re.DOTALL,
)
# Imagens (`![]`) e capturas de terminal com Markdown escapado (`\[]`) não são
# links navegáveis e, por isso, ficam fora do verificador.
MARKDOWN_LINK_RE = re.compile(r"(?<![!\\])\[[^\]]+\]\(([^)]+)\)")
FENCED_CODE_RE = re.compile(r"^(?:```|~~~).*?^(?:```|~~~)\s*$", re.MULTILINE | re.DOTALL)


def _read(path: Path) -> str:
    """Read one UTF-8 documentation file."""
    return path.read_text(encoding="utf-8")


def _relative(repo: Path, path: Path) -> str:
    """Return one stable repository-relative path."""
    return path.resolve().relative_to(repo.resolve()).as_posix()


def _issue(category: str, path: Path, repo: Path, detail: object, identity: str) -> dict[str, object]:
    """Build one deterministic documentation-sync issue."""
    return {
        "category": category,
        "path": _relative(repo, path),
        "detail": detail,
        "identity": identity,
    }


def historical_report_paths(repo: Path) -> list[Path]:
    """Return reports that are preserved solely as superseded snapshots."""
    guides = repo / "docs" / "planificacao" / "guias-bk"
    audits = repo / "docs" / "planificacao" / "auditorias"
    paths: set[Path] = set()
    for pattern in (
        "AUDITORIA-HIDRATACAO-MF*.md",
        "AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
        "CORRECAO-AUDITORIA-IMPLEMENTACAO-real_dev-MF*.md",
        "IMPLEMENTACAO-REAL_DEV-MF*.md",
    ):
        paths.update(guides.glob(pattern))
    paths.update(audits.glob("AUDITORIA-IMPLEMENTACAO*.md"))
    return sorted(path for path in paths if path.is_file())


def _scan_local_links(repo: Path) -> list[dict[str, object]]:
    """Find broken Markdown links between files under docs/."""
    issues: list[dict[str, object]] = []
    docs = repo / "docs"
    for source in sorted(docs.rglob("*.md")):
        prose = FENCED_CODE_RE.sub("", _read(source))
        for target_raw in MARKDOWN_LINK_RE.findall(prose):
            target = target_raw.strip().split(maxsplit=1)[0].strip("<>")
            if not target or target.startswith(("#", "http://", "https://", "mailto:", "app://")):
                continue
            target = unquote(target.split("#", 1)[0].split("?", 1)[0])
            if not target:
                continue
            resolved = (repo / target.lstrip("/")) if target.startswith("/") else (source.parent / target)
            if resolved.exists():
                continue
            issues.append(
                _issue(
                    "broken-link",
                    source,
                    repo,
                    {"target": target},
                    f"{_relative(repo, source)}:{target}",
                )
            )
    return issues


def raw_list_response_bodies(text: str) -> list[str]:
    """Return JSON response bodies that expose a list without pageInfo."""
    identifiers = "|".join(re.escape(value) for value in LIST_RESPONSE_IDENTIFIERS)
    list_value = re.compile(rf"\b(?:{identifiers})\b", re.IGNORECASE)
    raw: list[str] = []
    for match in JSON_RESPONSE_CALL_RE.finditer(text):
        body = match.group("body")
        if "pageInfo" in body or not list_value.search(body):
            continue
        # A criação/edição de um artigo singular não é confundida com o plural
        # `items`; a regra procura apenas identificadores de coleções fechados.
        raw.append(re.sub(r"\s+", " ", body).strip()[:240])
    return raw


def audit_documentation_sync(repo: Path) -> dict[str, object]:
    """Audit only documentation drift and return a pass independent of runtime."""
    issues: list[dict[str, object]] = []
    contract_path = repo / CENTRAL_CONTRACT_PATH
    if not contract_path.is_file():
        issues.append(_issue("missing-contract", contract_path, repo, "Contrato central ausente.", "central-contract"))
        contract_text = ""
    else:
        contract_text = _read(contract_path)
    for marker in REQUIRED_CONTRACT_MARKERS:
        if marker not in contract_text:
            issues.append(_issue("missing-contract-marker", contract_path, repo, {"marker": marker}, marker))
    if contract_text and not re.search(
        r"GET /api/compliance/saft[^\n]{0,180}\bREMOVIDO\b",
        contract_text,
        flags=re.IGNORECASE,
    ):
        issues.append(
            _issue(
                "removed-contract-semantics",
                contract_path,
                repo,
                "O endpoint SAF-T legado não está ligado semanticamente a REMOVIDO.",
                "saft-get-removed",
            )
        )

    docs = repo / "docs"
    guides_root = docs / "planificacao" / "guias-bk"
    guide_paths = sorted(guides_root.glob("MF*/BK-MF*-*.md"))
    guide_path_set = set(guide_paths)
    historical_path_set = set(historical_report_paths(repo))
    legacy_scan_exclusions = {
        contract_path,
        repo / "docs/planificacao/auditorias/CORRECAO-AUDITORIA-END-TO-END-REAL_DEV-2026-07-09.md",
        *historical_path_set,
    }
    legacy_scan_paths = sorted(
        path
        for path in docs.rglob("*")
        if path.is_file()
        and path.suffix.lower() in {".md", ".json", ".txt", ".yaml", ".yml"}
        and path not in legacy_scan_exclusions
    )
    for path in legacy_scan_paths:
        text = _read(path)
        if "SNAPSHOT_HISTORICO_SUPERSEDED" in text:
            continue
        for rule, pattern, label in LEGACY_GUIDE_PATTERNS:
            if pattern.search(text):
                issues.append(_issue("legacy-contract", path, repo, {"rule": rule, "value": label}, f"{rule}:{_relative(repo, path)}"))
        if path in guide_path_set:
            for index, body in enumerate(raw_list_response_bodies(text), start=1):
                issues.append(
                    _issue(
                        "pagination-envelope",
                        path,
                        repo,
                        {"response": body},
                        f"{_relative(repo, path)}:{index}",
                    )
                )

    for relative_path, markers in GUIDE_RUNTIME_MARKERS.items():
        path = repo / relative_path
        text = _read(path) if path.is_file() else ""
        for marker in markers:
            if marker not in text:
                issues.append(
                    _issue(
                        "missing-guide-runtime-marker",
                        path,
                        repo,
                        {"marker": marker},
                        f"{_relative(repo, path)}:{marker}",
                    )
                )

    evidence_root = repo / EVIDENCE_ROOT
    for name in REQUIRED_EVIDENCE:
        path = evidence_root / name
        if not path.is_file():
            issues.append(_issue("missing-evidence", path, repo, {"file": name}, name))
            continue
        text = _read(path)
        for pattern in CURRENT_EVIDENCE_PLACEHOLDERS:
            if pattern.search(text):
                issues.append(_issue("evidence-placeholder", path, repo, {"pattern": pattern.pattern}, f"{name}:{pattern.pattern}"))
        for stale in STALE_CURRENT_RESULTS:
            if stale in text:
                issues.append(_issue("stale-current-result", path, repo, {"value": stale}, f"{name}:{stale}"))

    architecture_path = repo / ARCHITECTURE_PATH
    architecture_text = _read(architecture_path) if architecture_path.is_file() else ""
    for marker in ARCHITECTURE_MARKERS:
        if marker not in architecture_text:
            issues.append(_issue("architecture-drift", architecture_path, repo, {"marker": marker}, marker))

    for path in historical_report_paths(repo):
        if "SNAPSHOT_HISTORICO_SUPERSEDED" not in _read(path):
            issues.append(_issue("historical-banner", path, repo, "Banner SUPERSEDED ausente.", _relative(repo, path)))

    for path in sorted(p for p in docs.rglob("*") if p.is_file() and p.suffix.lower() in {".md", ".json", ".txt", ".yaml", ".yml"}):
        text = _read(path)
        for name, pattern in (
            ("authenticated-url", AUTHENTICATED_URL_RE),
            ("bearer-literal", BEARER_LITERAL_RE),
            ("cookie-literal", COOKIE_LITERAL_RE),
            ("secret-assignment", SECRET_ASSIGNMENT_RE),
        ):
            if pattern.search(text):
                issues.append(_issue("sensitive-example", path, repo, {"rule": name}, f"{name}:{_relative(repo, path)}"))

    issues.extend(_scan_local_links(repo))
    return {
        "documentation_sync_pass": not issues,
        "issues": issues,
        "historical_reports": len(historical_report_paths(repo)),
        "required_evidence": len(REQUIRED_EVIDENCE),
        "guides_scanned": len(guide_paths),
    }


def audit_canonical_runtime_state(repo: Path) -> dict[str, object]:
    """Read the canonical report fail-closed without mixing it into doc sync."""
    path = repo / CANONICAL_REPORT_PATH
    if not path.is_file():
        return {
            "canonical_runtime_pass": False,
            "decision": None,
            "open_critical_findings": [],
            "reason": "canonical-report-missing",
        }

    text = _read(path)
    final_heading = re.search(
        r"^###\s+Decis[aã]o acad[eé]mica final\s*$",
        text,
        flags=re.IGNORECASE | re.MULTILINE,
    )
    final_text = text[final_heading.end():] if final_heading else ""
    decision_match = re.search(
        r"^Decis[aã]o:\s*`([A-Z][A-Z0-9_]+)`",
        final_text,
        flags=re.MULTILINE,
    )
    decision = decision_match.group(1) if decision_match else None

    table_match = re.search(r"^## 4\..*?\n(?P<table>.*?)(?=^## 5\.)", text, flags=re.MULTILINE | re.DOTALL)
    open_critical: list[dict[str, str]] = []
    if table_match:
        for line in table_match.group("table").splitlines():
            cells = [cell.strip().strip("`") for cell in line.strip().strip("|").split("|")]
            if len(cells) < 7 or cells[1] not in {"P0", "P1"}:
                continue
            state = cells[5]
            if state != "FECHADO":
                open_critical.append({"finding": cells[0], "severity": cells[1], "state": state})

    ready = (
        decision == "PRONTO_ACADEMICO_COM_RISCO_ACEITE"
        and not open_critical
    )
    reason = None
    if decision is None:
        reason = "canonical-decision-missing"
    elif decision != "PRONTO_ACADEMICO_COM_RISCO_ACEITE":
        reason = f"canonical-decision-{decision.lower()}"
    elif open_critical:
        reason = "canonical-critical-findings-not-closed"
    return {
        "canonical_runtime_pass": ready,
        "decision": decision,
        "open_critical_findings": open_critical,
        "reason": reason,
    }


def _build_fixture(repo: Path) -> None:
    """Create the smallest passing repository used by mutation self-tests."""
    contract = repo / CENTRAL_CONTRACT_PATH
    contract.parent.mkdir(parents=True, exist_ok=True)
    contract.write_text(
        "\n".join(REQUIRED_CONTRACT_MARKERS)
        + "\nGET /api/compliance/saft: REMOVIDO\n",
        encoding="utf-8",
    )

    guide = repo / "docs/planificacao/guias-bk/MF0/BK-MF0-01-safe.md"
    guide.parent.mkdir(parents=True, exist_ok=True)
    guide.write_text("# Guia seguro\n\nResposta `{ items, pageInfo: { nextCursor, hasNextPage } }`.\n", encoding="utf-8")

    for relative_path, markers in GUIDE_RUNTIME_MARKERS.items():
        runtime_guide = repo / relative_path
        runtime_guide.parent.mkdir(parents=True, exist_ok=True)
        runtime_guide.write_text("\n".join(markers) + "\n", encoding="utf-8")

    evidence = repo / EVIDENCE_ROOT
    evidence.mkdir(parents=True, exist_ok=True)
    for name in REQUIRED_EVIDENCE:
        (evidence / name).write_text("# Evidence corrente\n", encoding="utf-8")
    (repo / ARCHITECTURE_PATH).write_text("\n".join(ARCHITECTURE_MARKERS), encoding="utf-8")

    historical = repo / "docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md"
    historical.write_text("SNAPSHOT_HISTORICO_SUPERSEDED\n", encoding="utf-8")

    report = repo / CANONICAL_REPORT_PATH
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(
        "# Report\n\n"
        "## 4. Tabela canonica de findings\n\n"
        "| ID | Severidade | Resumo | Fase | Dependencias | Estado | Owner |\n"
        "| --- | --- | --- | --- | --- | --- | --- |\n"
        "| `OPSA-E2E-P1-001` | P1 | fixture | 1 | - | FECHADO | test |\n\n"
        "## 5. Fases\n\n"
        "### Decisão académica final\n\n"
        "Decisão: `PRONTO_ACADEMICO_COM_RISCO_ACEITE`.\n",
        encoding="utf-8",
    )


def _assert_mutation(repo: Path, category: str, mutate, restore) -> None:
    """Require one controlled mutation to trigger the expected category."""
    mutate()
    categories = {str(issue["category"]) for issue in audit_documentation_sync(repo)["issues"]}
    restore()
    if category not in categories:
        raise AssertionError(f"Mutação não detetada: {category}")


def run_mutation_self_test() -> dict[str, int]:
    """Prove every sync rule with non-destructive mutations in a temp repo."""
    assertions = 0
    with TemporaryDirectory(prefix="opsa-doc-sync-") as temp:
        repo = Path(temp)
        _build_fixture(repo)
        baseline = audit_documentation_sync(repo)
        if not baseline["documentation_sync_pass"]:
            raise AssertionError(f"Fixture base inválida: {baseline['issues']}")

        guide = repo / "docs/planificacao/guias-bk/MF0/BK-MF0-01-safe.md"
        safe_guide = _read(guide)
        for rule, _pattern, _label in LEGACY_GUIDE_PATTERNS:
            mutation = LEGACY_MUTATION_SAMPLES[rule]
            _assert_mutation(
                repo,
                "legacy-contract",
                lambda value=mutation: guide.write_text(safe_guide + "\n" + value, encoding="utf-8"),
                lambda: guide.write_text(safe_guide, encoding="utf-8"),
            )
            assertions += 1

        contract = repo / CENTRAL_CONTRACT_PATH
        full_contract = _read(contract)
        _assert_mutation(
            repo,
            "missing-contract",
            contract.unlink,
            lambda: contract.write_text(full_contract, encoding="utf-8"),
        )
        assertions += 1
        for marker in REQUIRED_CONTRACT_MARKERS:
            _assert_mutation(
                repo,
                "missing-contract-marker",
                lambda value=marker: contract.write_text(full_contract.replace(value, ""), encoding="utf-8"),
                lambda: contract.write_text(full_contract, encoding="utf-8"),
            )
            assertions += 1
        _assert_mutation(
            repo,
            "removed-contract-semantics",
            lambda: contract.write_text(
                full_contract.replace(
                    "GET /api/compliance/saft: REMOVIDO",
                    "GET /api/compliance/saft: ATIVO",
                ),
                encoding="utf-8",
            ),
            lambda: contract.write_text(full_contract, encoding="utf-8"),
        )
        assertions += 1

        evidence = repo / EVIDENCE_ROOT / "BK-MF8-05.md"
        safe_evidence = _read(evidence)
        for placeholder in ("PASS/FAIL", "PREENCHER", "Registar output"):
            _assert_mutation(
                repo,
                "evidence-placeholder",
                lambda value=placeholder: evidence.write_text(safe_evidence + value, encoding="utf-8"),
                lambda: evidence.write_text(safe_evidence, encoding="utf-8"),
            )
            assertions += 1
        for stale in STALE_CURRENT_RESULTS:
            _assert_mutation(
                repo,
                "stale-current-result",
                lambda value=stale: evidence.write_text(safe_evidence + value, encoding="utf-8"),
                lambda: evidence.write_text(safe_evidence, encoding="utf-8"),
            )
            assertions += 1

        missing = repo / EVIDENCE_ROOT / "BK-MF8-06.md"
        missing_text = _read(missing)
        _assert_mutation(repo, "missing-evidence", missing.unlink, lambda: missing.write_text(missing_text, encoding="utf-8"))
        assertions += 1

        historical = repo / "docs/planificacao/guias-bk/AUDITORIA-HIDRATACAO-MF0.md"
        historical_text = _read(historical)
        _assert_mutation(repo, "historical-banner", lambda: historical.write_text("snapshot", encoding="utf-8"), lambda: historical.write_text(historical_text, encoding="utf-8"))
        assertions += 1

        for secret in (
            "postgresql://user:password@example.invalid/db",
            "Authorization: Bearer literal-token-value",
            "Cookie: sid=literal-session",
            "SMTP_PASSWORD=literal-password",
        ):
            _assert_mutation(
                repo,
                "sensitive-example",
                lambda value=secret: guide.write_text(safe_guide + "\n" + value, encoding="utf-8"),
                lambda: guide.write_text(safe_guide, encoding="utf-8"),
            )
            assertions += 1

        for raw_response in (
            "res.json(customers)",
            "res.status(200).json(customers)",
            "res.json({ customers })",
            "res.json({ items })",
            "res.status(200).json({ accounts: rows })",
        ):
            _assert_mutation(
                repo,
                "pagination-envelope",
                lambda value=raw_response: guide.write_text(safe_guide + "\n" + value + "\n", encoding="utf-8"),
                lambda: guide.write_text(safe_guide, encoding="utf-8"),
            )
            assertions += 1

        for relative_path, markers in GUIDE_RUNTIME_MARKERS.items():
            runtime_guide = repo / relative_path
            full_runtime_guide = _read(runtime_guide)
            for marker in markers:
                _assert_mutation(
                    repo,
                    "missing-guide-runtime-marker",
                    lambda value=marker: runtime_guide.write_text(
                        full_runtime_guide.replace(value, ""),
                        encoding="utf-8",
                    ),
                    lambda: runtime_guide.write_text(full_runtime_guide, encoding="utf-8"),
                )
                assertions += 1

        architecture = repo / ARCHITECTURE_PATH
        full_architecture = _read(architecture)
        for marker in ARCHITECTURE_MARKERS:
            _assert_mutation(
                repo,
                "architecture-drift",
                lambda value=marker: architecture.write_text(full_architecture.replace(value, ""), encoding="utf-8"),
                lambda: architecture.write_text(full_architecture, encoding="utf-8"),
            )
            assertions += 1

        _assert_mutation(
            repo,
            "broken-link",
            lambda: guide.write_text(safe_guide + "\n[partido](missing.md)\n", encoding="utf-8"),
            lambda: guide.write_text(safe_guide, encoding="utf-8"),
        )
        assertions += 1

        report = repo / CANONICAL_REPORT_PATH
        ready_report = _read(report)
        if not audit_canonical_runtime_state(repo)["canonical_runtime_pass"]:
            raise AssertionError("Fixture canónica ready foi rejeitada.")
        assertions += 1
        report.unlink()
        if audit_canonical_runtime_state(repo)["canonical_runtime_pass"]:
            raise AssertionError("Report canónico ausente não falhou fechado.")
        assertions += 1
        report.write_text(ready_report, encoding="utf-8")
        report.write_text(ready_report.replace("PRONTO_ACADEMICO_COM_RISCO_ACEITE", "NO_GO"), encoding="utf-8")
        if audit_canonical_runtime_state(repo)["canonical_runtime_pass"]:
            raise AssertionError("NO_GO canónico não bloqueou overall.")
        assertions += 1
        report.write_text(ready_report.replace("Decisão:", "Estado:"), encoding="utf-8")
        if audit_canonical_runtime_state(repo)["canonical_runtime_pass"]:
            raise AssertionError("Decisão canónica ausente não falhou fechada.")
        assertions += 1
        report.write_text(ready_report.replace("FECHADO", "IMPLEMENTADO"), encoding="utf-8")
        if audit_canonical_runtime_state(repo)["canonical_runtime_pass"]:
            raise AssertionError("Finding P1 não fechado não bloqueou overall.")
        assertions += 1
        report.write_text(ready_report, encoding="utf-8")

    return {"mutation_assertions": assertions}
