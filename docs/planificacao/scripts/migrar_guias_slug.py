#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import unicodedata

TODAY = "2026-04-17"

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

MACRO_FOCUS = {
    "MF0": "fundacoes de autenticacao, perfis, empresa e dados mestre",
    "MF1": "fluxo comercial (vendas/compras) com impacto contabilistico imediato",
    "MF2": "stock, analitica e contabilidade operacional",
    "MF3": "tesouraria, integracoes e relatorio funcional",
    "MF4": "inteligencia operacional, alertas e governanca de operacoes",
    "MF5": "experiencia de utilizacao e fluxos transversais de negocio",
    "MF6": "desempenho, seguranca e robustez tecnica",
    "MF7": "compliance, interoperabilidade e modularidade",
    "MF8": "operacao final, i18n e fecho para defesa PAP",
}

MACRO_OBJECTIVE = {
    "MF0": "Instalar base segura de identidade e dados mestre para desbloquear todo o ERP.",
    "MF1": "Fechar o ciclo comercial minimo com impacto contabilistico validado.",
    "MF2": "Garantir integridade de inventario e contabilidade operacional por evento.",
    "MF3": "Consolidar tesouraria, integracoes e reporting financeiro auditavel.",
    "MF4": "Operacionalizar IA assistiva com explicabilidade e controlo de risco.",
    "MF5": "Tornar a UX previsivel, clara e orientada a fluxos reais de trabalho.",
    "MF6": "Assegurar robustez tecnica de performance, seguranca e continuidade.",
    "MF7": "Fechar compliance legal, interoperabilidade e arquitetura modular.",
    "MF8": "Preparar operacao final, observabilidade e fecho para defesa PAP.",
}


def split_md_row(line: str) -> list[str]:
    return [p.strip() for p in line.strip().strip("|").split("|")]


def parse_backlog_rows(backlog_path: Path) -> list[dict[str, str]]:
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
        cols = split_md_row(line)
        if len(cols) != len(headers):
            continue
        rows.append(dict(zip(headers, cols)))
    return rows


def parse_items(raw: str) -> list[str]:
    raw = raw.strip()
    if raw == "-":
        return []
    return [x.strip() for x in raw.split(",") if x.strip()]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "sem-titulo"


def normalize_req(req_field: str) -> str:
    reqs = parse_items(req_field)
    return reqs[0] if reqs else "RF00"


def get_old_rel_path(cell: str, macro: str, bk_id: str) -> str:
    m = re.search(r"\(([^)]+)\)", cell)
    if m:
        return m.group(1)
    return f"../guias-bk/{macro}/{bk_id}.md"


def choose_snippet(row: dict[str, str]) -> tuple[str, str, str, str]:
    titulo = row["titulo"].lower()
    bk_id = row["bk_id"]
    req = normalize_req(row["rf_rnf"])
    macro = row["macro"]

    if any(k in titulo for k in ["login", "password", "cookies", "sess", "permiss", "papel"]):
        return (
            "Guard de permissao e sessao",
            "ts",
            f"""const BK_ID = '{bk_id}';

export function validarSessao(user: {{ id: string; roles: string[] }} | null, roleNecessario: string) {{
  if (!user) throw new Error('Sessao invalida');
  if (!user.roles.includes(roleNecessario)) throw new Error('Acesso negado');
  return {{ ok: true, bk: BK_ID }};
}}

// Exemplo de uso no endpoint associado ao requisito {req}
const sessao = validarSessao(ctx.user, 'ADMIN');
""",
            "Usar este guard no endpoint principal do BK para bloquear acessos sem sessao/permissao e manter comportamento previsivel.",
        )

    if any(k in titulo for k in ["fatura", "iva", "compra", "venda", "pagamento", "lancamento"]):
        return (
            "Validacao fiscal minima antes de lancar documento",
            "ts",
            f"""type LinhaDocumento = {{ conta: string; base: number; taxaIVA: number }};

export function validarDocumentoFiscal(linhas: LinhaDocumento[], bkId = '{bk_id}') {{
  if (!linhas.length) throw new Error('Documento sem linhas');
  for (const l of linhas) {{
    if (l.base <= 0) throw new Error(`Base invalida em ${{l.conta}}`);
    if (l.taxaIVA < 0 || l.taxaIVA > 1) throw new Error(`Taxa IVA invalida em ${{l.conta}}`);
  }}
  return {{ bkId, totalIVA: linhas.reduce((acc, l) => acc + l.base * l.taxaIVA, 0) }};
}}
""",
            "Aplicar antes de persistir documento para evitar registos contabilisticos inconsistentes e garantir rastreio do requisito.",
        )

    if any(k in titulo for k in ["stock", "armaz", "fifo", "contagem", "ajuste"]):
        return (
            "Movimento de stock com bloqueio de saldo negativo",
            "sql",
            f"""-- BK: {bk_id}
BEGIN;

UPDATE stock_saldo
SET quantidade = quantidade + :delta,
    updated_at = NOW()
WHERE empresa_id = :empresa_id
  AND artigo_id = :artigo_id;

-- Negativo controlado
DO $$
DECLARE q numeric;
BEGIN
  SELECT quantidade INTO q
  FROM stock_saldo
  WHERE empresa_id = :empresa_id AND artigo_id = :artigo_id;
  IF q < 0 THEN
    RAISE EXCEPTION 'Saldo negativo nao permitido no BK {bk_id}';
  END IF;
END $$;

COMMIT;
""",
            "Executar em transacao para preservar integridade do inventario e impedir estados invalidos apos movimento.",
        )

    if any(k in titulo for k in ["banc", "extrat", "reconcil", "tesouraria"]):
        return (
            "Emparelhamento simples de movimentos bancarios",
            "ts",
            f"""type Movimento = {{ id: string; valor: number; data: string; descricao: string }};

export function sugerirCorrespondencias(extrato: Movimento[], pendentes: Movimento[]) {{
  return extrato.map((m) => {{
    const match = pendentes.find((p) => p.valor === m.valor && p.data === m.data);
    return {{ bk: '{bk_id}', movimento: m.id, documento: match?.id ?? null }};
  }});
}}
""",
            "Serve como base para reconciliacao automatica, mantendo criterio deterministico (valor+data) antes de regras avancadas.",
        )

    if any(k in titulo for k in ["import", "csv", "excel", "upload", "saf-t", "export"]):
        return (
            "Validacao de cabecalho de importacao",
            "ts",
            f"""const CAMPOS_MINIMOS = ['codigo', 'descricao', 'valor'];

export function validarCabecalhoImportacao(headers: string[]) {{
  const faltam = CAMPOS_MINIMOS.filter((c) => !headers.includes(c));
  if (faltam.length) {{
    throw new Error(`BK {bk_id}: cabecalho invalido, faltam ${{faltam.join(', ')}}`);
  }}
  return {{ ok: true, bk: '{bk_id}' }};
}}
""",
            "Aplicar no inicio do fluxo de importacao/exportacao para bloquear ficheiros invalidos antes de tocar nos dados de negocio.",
        )

    if any(k in titulo for k in ["alert", "notific", "insight", "lembrete", "ia "]):
        return (
            "Regra de alerta com limiar explicito",
            "ts",
            f"""type Regra = {{ nome: string; limite: number }};

export function avaliarAlerta(valorAtual: number, regra: Regra) {{
  const ativo = valorAtual >= regra.limite;
  return {{
    bkId: '{bk_id}',
    regra: regra.nome,
    ativo,
    mensagem: ativo ? `Alerta ativo: ${{regra.nome}}` : 'Sem alerta',
  }};
}}
""",
            "Usar para gerar alertas auditaveis com criterio transparente (limiar), evitando decisoes opacas na camada de IA/operacao.",
        )

    if any(k in titulo for k in ["https", "bcrypt", "csrf", "xss", "api", "credenciais", "auditoria", "backup", "retencao"]):
        return (
            "Hardening basico de seguranca",
            "ts",
            f"""import bcrypt from 'bcryptjs';

export async function hashPasswordSegura(password: string) {{
  if (password.length < 12) throw new Error('Password abaixo do minimo');
  const hash = await bcrypt.hash(password, 12);
  return {{ bk: '{bk_id}', hash }};
}}

export function exigirTLS(proto: string) {{
  if (proto !== 'https') throw new Error('Canal nao seguro');
}}
""",
            "Integrar no fluxo do BK para garantir requisitos minimos de seguranca (hash forte + transporte seguro).",
        )

    if any(k in titulo for k in ["dashboard", "kpi", "balanco", "balancete", "razao", "relatorio", "margens"]):
        return (
            "Consulta agregada para KPI",
            "sql",
            f"""-- BK: {bk_id}
SELECT
  DATE_TRUNC('month', data_lancamento) AS mes,
  SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) AS receita,
  SUM(CASE WHEN tipo = 'CUSTO' THEN valor ELSE 0 END) AS custo,
  SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END)
    - SUM(CASE WHEN tipo = 'CUSTO' THEN valor ELSE 0 END) AS margem
FROM fact_lancamentos
WHERE empresa_id = :empresa_id
GROUP BY 1
ORDER BY 1;
""",
            "Base para painel mensal: calcula receita/custo/margem de forma reprodutivel para validacao funcional do BK.",
        )

    if any(k in titulo for k in ["portugues", "datas", "moedas", "i18n", "europeu"]):
        return (
            "Formatacao PT-PT de data e moeda",
            "ts",
            f"""export function formatarValorPT(valor: number) {{
  return new Intl.NumberFormat('pt-PT', {{ style: 'currency', currency: 'EUR' }}).format(valor);
}}

export function formatarDataPT(iso: string) {{
  return new Intl.DateTimeFormat('pt-PT', {{ dateStyle: 'short' }}).format(new Date(iso));
}}

// BK {bk_id}: usar estas funcoes em listagens e detalhes
""",
            "Garantir consistencia visual/legal no padrao europeu para todos os campos de data/moeda do BK.",
        )

    if macro in {"MF0", "MF1"}:
        return (
            "Contrato de comando com validacao de permissao",
            "ts",
            f"""type Contexto = {{ userId: string; roles: string[]; empresaId: string }};

export function validarComando(ctx: Contexto, role: string) {{
  if (!ctx.userId || !ctx.empresaId) throw new Error('Contexto incompleto');
  if (!ctx.roles.includes(role)) throw new Error(`Permissao insuficiente para {req}`);
  return {{ bkId: '{bk_id}', ok: true }};
}}
""",
            "Garante pré-condições de identidade e autorização antes de executar regras de negócio.",
        )

    if macro in {"MF2", "MF3"}:
        return (
            "Validador transacional de consistencia financeira",
            "sql",
            f"""-- BK: {bk_id}
BEGIN;

SELECT 1
FROM empresas
WHERE id = :empresa_id
FOR UPDATE;

-- Validacoes de consistencia específicas do requisito {req}
-- devem ocorrer antes de qualquer COMMIT.

COMMIT;
""",
            "Usar como envelope transacional para preservar consistência em operações de stock/tesouraria/contabilidade.",
        )

    return (
        "Validador de output auditavel",
        "ts",
        f"""type Resultado = {{ status: 'ok' | 'erro'; mensagem: string; fonte?: string }};

export function validarResultado(res: Resultado) {{
  if (res.status === 'ok' && !res.mensagem) throw new Error('Mensagem obrigatoria');
  if (res.status === 'ok' && !res.fonte) throw new Error('Fonte obrigatoria para rastreabilidade');
  return {{ bk: '{bk_id}', validado: true }};
}}
""",
        "Impõe resposta auditável e rastreável em fluxos de IA/governança/operação final.",
    )


def build_operational_steps(row: dict[str, str], deps_fmt: str, req: str) -> list[str]:
    bk_id = row["bk_id"]
    macro = row["macro"]
    titulo = row["titulo"]

    base = [
        f"Confirmar no `BACKLOG-MVP` e na `MATRIZ-CANONICA-BK` o escopo do `{bk_id}` e o requisito `{req}`.",
        f"Validar dependencias técnicas (`{deps_fmt}`) e preparar dados de teste mínimos para `{titulo}`.",
    ]

    by_macro = {
        "MF0": [
            "Implementar regras de identidade/perfil com validações de acesso e segregação por empresa.",
            "Executar smoke de autenticação/gestão base e comprovar persistência correta dos dados mestre.",
        ],
        "MF1": [
            "Implementar fluxo comercial fim-a-fim com cálculo fiscal e registo contabilístico associado.",
            "Validar transição de estados/documentos e coerência entre documento comercial e lançamento.",
        ],
        "MF2": [
            "Implementar regra operacional de stock/centro analítico/lançamento garantindo consistência transacional.",
            "Validar impacto em saldos e trilho de auditoria após a operação principal.",
        ],
        "MF3": [
            "Implementar integração/importação/exportação com validação estrutural e rastreio de erros.",
            "Validar reconciliação/relatório resultante com dados de referência controlados.",
        ],
        "MF4": [
            "Implementar fluxo de IA/alerta/tarefa com fonte explícita e critério de decisão audível.",
            "Validar que a resposta/alerta é explicável e não executa alterações contabilísticas automáticas.",
        ],
        "MF5": [
            "Implementar comportamento UX transversal (validação, feedback, consistência visual e erro claro).",
            "Executar testes de usabilidade rápida em cenário real de operação (desktop e tablet).",
        ],
        "MF6": [
            "Aplicar hardening/performance no ponto crítico do BK com medição objetiva do limiar definido.",
            "Executar teste negativo de segurança/performance e registar evidência comparativa antes/depois.",
        ],
        "MF7": [
            "Implementar requisito de compliance/interoperabilidade preservando formato e integridade de dados.",
            "Validar compatibilidade legal/técnica com output verificável (ficheiro, log ou endpoint).",
        ],
        "MF8": [
            "Implementar requisito de fecho operacional (observabilidade, deploy, i18n ou governança final).",
            "Validar comportamento em cenário de fecho PAP com evidência pronta para defesa.",
        ],
    }

    tail = [
        "Executar pelo menos 1 teste de smoke orientado ao caso principal do BK.",
        "Executar cenários negativos obrigatórios e registar resultado observado (mensagem/código/efeito).",
    ]
    return base + by_macro.get(macro, []) + tail


def render_guide(row: dict[str, str], new_filename: str) -> str:
    bk_id = row["bk_id"]
    macro = row["macro"]
    titulo = row["titulo"]
    prioridade = row["prioridade"]
    core_or_reforco = "Reforco" if prioridade == "P0" else "Core"
    sprint = SPRINT_WINDOW_BY_MACRO[macro]
    deps = parse_items(row["dependencias"])
    deps_fmt = ", ".join(deps) if deps else "-"
    req = normalize_req(row["rf_rnf"])
    fase = row["fase_documental"]
    proximo = row["proximo_bk"]
    foco_macro = MACRO_FOCUS.get(macro, "execucao funcional com rastreabilidade")

    steps = build_operational_steps(row, deps_fmt, req)
    if prioridade == "P0":
        steps.extend(
            [
                "Aplicar reforço técnico (robustez/performance/segurança) no risco principal identificado para este BK.",
                "Atualizar evidence (`pr`, `proof`, `neg`) com artefactos concretos e verificaveis.",
            ]
        )

    snippet_nome, snippet_lang, snippet_code, snippet_exp = choose_snippet(row)

    tempo_core = "60-90 min" if prioridade == "P0" else "45-70 min"
    tempo_reforco = "+20-40 min" if prioridade == "P0" else "n/a"

    negativos_min = "3" if prioridade == "P0" else "2"

    steps_md = "\n".join([f"{i+1}. {step}" for i, step in enumerate(steps)])

    return f"""# {bk_id} - {titulo}

## Header
- `doc_id`: `GUIA-{bk_id}`
- `bk_id`: `{bk_id}`
- `macro`: `{macro}`
- `owner`: `{row['owner']}`
- `apoio`: `{row['apoio']}`
- `prioridade`: `{prioridade}`
- `estado`: `{row['estado']}`
- `esforco`: `{row['esforco']}`
- `dependencias`: `{deps_fmt}`
- `rf_rnf`: `{row['rf_rnf']}`
- `fase_documental`: `{fase}`
- `sprint`: `{sprint}`
- `core_or_reforco`: `{core_or_reforco}`
- `proximo_bk`: `{proximo}`
- `guia_path`: `docs/planificacao/guias-bk/{macro}/{new_filename}`
- `last_updated`: `{TODAY}`

## Contexto do BK
- Entrega alvo: implementar `{titulo}` com rastreabilidade direta ao requisito `{req}`.
- Foco tecnico da macro: {foco_macro}.
- Regra de governanca: nao alterar IDs nem contratos de dados (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).

## Bloco pedagogico
### Objetivo
Executar `{titulo}` com autonomia técnica, garantindo cobertura do requisito `{req}` e evidência objetiva para avaliação.
- Intenção pedagógica da macro `{macro}`: {MACRO_OBJECTIVE.get(macro, 'fecho técnico e documental com rastreabilidade')}.

### Pre-requisitos
- Ler o requisito `{req}` e rever o contexto em `MATRIZ-CANONICA-BK.md` e `BACKLOG-MVP.md`.
- Validar dependencias declaradas: `{deps_fmt}`.
- Preparar ambiente para smoke test e validacao negativa.

### Erros comuns
- Fechar o BK sem validar cenario negativo.
- Alterar metadados no guia sem refletir backlog/matriz.
- Submeter evidence sem provas objetivas (ex.: output real, screenshot, log, teste).

### Check de compreensao
- [ ] Sei justificar porque este BK existe no fluxo da macro `{macro}`.
- [ ] Sei mostrar onde esta o requisito `{req}` no sistema.
- [ ] Sei demonstrar pelo menos 1 negativo relevante do BK.

### Tempo estimado
- `Core`: `{tempo_core}`.
- `Reforco`: `{tempo_reforco}`.

## Bloco operacional
### Entrada
- BK: `{bk_id}`
- Requisito: `{row['rf_rnf']}`
- Dependencias: `{deps_fmt}`
- Artefactos de referencia: `MATRIZ-CANONICA-BK.md`, `BACKLOG-MVP.md`, `PLANO-SPRINTS.md`

### Passos
{steps_md}

### Validacao
- [ ] Smoke: fluxo principal executa sem erro bloqueante.
- [ ] Negativos: minimo `{negativos_min}` cenarios com resultado controlado.
- [ ] Tecnico: metadados e contratos de dados estao alinhados entre backlog/matriz/guia.
- [ ] Evidencia: `pr`, `proof`, `neg` preenchidos com artefactos reais.

### Handoff
- Proximo BK recomendado: `{proximo}`
- Registar no handoff: estado de dependencias, risco aberto e decisao tomada.
- Se houver bloqueio >48h, escalar no scorecard da sprint.

## Snippet tecnico aplicavel
**{snippet_nome}**

```{snippet_lang}
{snippet_code.rstrip()}
```

{snippet_exp}

## Criterios de aceite
- BK implementado no scope definido, sem romper dependencias.
- Validacao de smoke e negativos concluida.
- Contrato de dados canónico mantido (`bk_id/mf/sprint/owner/rf_rnf/deps/guia_path/core_or_reforco`).
- Evidence pronta para revisao tecnica e defesa PAP.

## Evidence para PR/defesa
- `pr`: link do commit/PR com resumo objetivo da alteracao.
- `proof`: prova funcional (output, screenshot, log, ou teste automatizado).
- `neg`: cenario negativo executado com resultado esperado.

## Changelog
- `{TODAY}`: guia migrado para naming com slug e template pedagogico-operacional executavel.
"""


def rewrite_guides_and_collect_mapping(plan_root: Path, rows: list[dict[str, str]]) -> dict[str, str]:
    guides_root = plan_root / "guias-bk"
    mapping: dict[str, str] = {}

    for row in rows:
        bk_id = row["bk_id"]
        macro = row["macro"]
        slug = slugify(row["titulo"])
        new_filename = f"{bk_id}-{slug}.md"
        old_rel = get_old_rel_path(row["guia"], macro, bk_id)
        new_rel = f"../guias-bk/{macro}/{new_filename}"
        mapping[old_rel] = new_rel

        macro_dir = guides_root / macro
        macro_dir.mkdir(parents=True, exist_ok=True)
        target_path = macro_dir / new_filename

        content = render_guide(row, new_filename)
        target_path.write_text(content, encoding="utf-8")

        # Limpar variantes antigas do mesmo BK (rename idempotente).
        for candidate in macro_dir.glob(f"{bk_id}*.md"):
            if candidate.name != new_filename:
                candidate.unlink()

    return mapping


def replace_references(plan_root: Path, mapping: dict[str, str]) -> int:
    replaced_files = 0
    candidates = list(plan_root.rglob("*.md")) + list(plan_root.rglob("*.py"))

    for path in candidates:
        text = path.read_text(encoding="utf-8")
        original = text
        for old_rel, new_rel in mapping.items():
            text = text.replace(old_rel, new_rel)

            old_no_prefix = old_rel.replace("../", "")
            new_no_prefix = new_rel.replace("../", "")
            text = text.replace(
                f"docs/planificacao/{old_no_prefix}",
                f"docs/planificacao/{new_no_prefix}",
            )

            old_short = old_rel.replace("../guias-bk/", "")
            new_short = new_rel.replace("../guias-bk/", "")
            text = text.replace(old_short, new_short)

        if text != original:
            path.write_text(text, encoding="utf-8")
            replaced_files += 1

    return replaced_files


def rewrite_guias_readme(plan_root: Path, rows: list[dict[str, str]]) -> None:
    by_macro: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        by_macro.setdefault(row["macro"], []).append(row)

    lines = [
        "# GUIAS-BK-README",
        "",
        "## Header",
        "- `doc_id`: `GUIAS-BK-README`",
        "- `path`: `docs/planificacao/guias-bk/README.md`",
        "- `area`: `project`",
        "- `owner`: `Nuno`",
        "- `status`: `ativo`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Padrão de naming dos guias BK",
        "- Formato obrigatório: `BK-MF*-**-slug-semantico.md`.",
        "- Exemplo: `BK-MF3-03-importar-extratos-bancarios-csv-ofx-e-fazer-reconciliacao-automatica.md`.",
        "- Regra: manter ID canónico (`BK-MF*-**`) e acrescentar slug PT-PT semântico.",
        "",
        "## Contrato editorial",
        "- Todos os guias devem conter `Bloco pedagogico` e `Bloco operacional`.",
        "- Snippet técnico obrigatório e aplicável ao BK real (não placeholder).",
        "- Reutilização técnica orientada por `SNIPPETS-POR-MACRO.md`.",
        "- Campos de header obrigatórios: `bk_id`, `macro`, `sprint`, `owner`, `rf_rnf`, `dependencias`, `guia_path`, `core_or_reforco`.",
        "",
        "## Indice completo por macro",
    ]

    for macro in sorted(by_macro.keys()):
        lines.append(f"### {macro}")
        for row in by_macro[macro]:
            filename = f"{row['bk_id']}-{slugify(row['titulo'])}.md"
            lines.append(f"- [{row['bk_id']} - {row['titulo']}](" + f"{macro}/{filename}" + ")")
        lines.append("")

    lines.extend(
        [
            "## Changelog",
            f"- `{TODAY}`: índice e naming migrados para padrão com slug semântico.",
            f"- `{TODAY}`: contrato editorial reforçado com bloco pedagógico/operacional e snippet obrigatório.",
            "",
        ]
    )

    (plan_root / "guias-bk" / "README.md").write_text("\n".join(lines), encoding="utf-8")


def rewrite_template(plan_root: Path) -> None:
    content = f"""# BK-MF*-** - Titulo do BK

## Header
- `doc_id`: `GUIA-BK-MF*-**`
- `bk_id`: `BK-MF*-**`
- `macro`: `MF*`
- `owner`: `...`
- `apoio`: `...`
- `prioridade`: `P0|P1|P2`
- `estado`: `TODO|IN_PROGRESS|DONE|BLOCKED`
- `esforco`: `S|M|L`
- `dependencias`: `BK-...`
- `rf_rnf`: `RFxx|RNFxx`
- `fase_documental`: `Fase 1|Fase 2|Fase 3`
- `sprint`: `Sxx-Syy`
- `core_or_reforco`: `Core|Reforco`
- `proximo_bk`: `BK-...|-`
- `guia_path`: `docs/planificacao/guias-bk/MF*/BK-MF*-**-slug-semantico.md`
- `last_updated`: `{TODAY}`

## Contexto do BK
- Entrega alvo e requisito.
- Foco tecnico da macro.
- Regra de governanca de metadados.

## Bloco pedagogico
### Objetivo
### Pre-requisitos
### Erros comuns
### Check de compreensao
### Tempo estimado

## Bloco operacional
### Entrada
### Passos
### Validacao
### Handoff

## Snippet tecnico aplicavel
```ts
// Trecho real e aplicavel ao BK
```

## Criterios de aceite
## Evidence para PR/defesa
## Changelog
"""
    (plan_root / "guias-bk" / "_TEMPLATE-BK.md").write_text(content, encoding="utf-8")


def write_snippets_library(plan_root: Path) -> None:
    content = f"""# SNIPPETS-POR-MACRO

## Header
- `doc_id`: `SNIPPETS-POR-MACRO`
- `path`: `docs/planificacao/guias-bk/SNIPPETS-POR-MACRO.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `{TODAY}`

## Objetivo
Catálogo curto de snippets de referência por macro para reduzir repetição, manter coerência técnica e facilitar handoff entre alunos.

## Biblioteca por macro
- `MF0-MF1`: guard de identidade/permissões e contrato de comando.
- `MF2-MF3`: transações de consistência operacional/financeira.
- `MF4-MF5`: regras de alerta/UX com output explicável.
- `MF6`: hardening de segurança e medição de limiares.
- `MF7`: validação de compliance/interoperabilidade.
- `MF8`: validação de observabilidade/fecho operacional.

## Regras de uso
1. Cada guia deve usar snippet alinhado ao risco principal do BK.
2. Snippet não substitui implementação: serve como esqueleto validável.
3. Qualquer snippet reutilizado deve ter notas específicas do BK no guia.

## Changelog
- `{TODAY}`: biblioteca criada para suportar desgenericização dos guias BK.
"""
    (plan_root / "guias-bk" / "SNIPPETS-POR-MACRO.md").write_text(content, encoding="utf-8")


def rewrite_mapa_migracao(plan_root: Path, rows: list[dict[str, str]]) -> None:
    lines = [
        "# MAPA-MIGRACAO-LEGACY-PARA-CANONICO",
        "",
        "## Header",
        "- `doc_id`: `MAPA-MIGRACAO`",
        "- `path`: `docs/planificacao/guias-bk/MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md`",
        "- `owner`: `Nuno`",
        f"- `last_updated`: `{TODAY}`",
        "",
        "## Nota de governanca",
        "- IDs BK mantidos sem alteracao (`BK-MF*-**`).",
        "- Migração aplicada apenas ao naming dos ficheiros com slug semântico.",
        "- Referencias canónicas atualizadas em backlog, anexos e scripts.",
        "",
        "## Mapa",
        "| origem_legacy | destino_canonico |",
        "| --- | --- |",
    ]

    for row in rows:
        req = normalize_req(row["rf_rnf"])
        dst = f"{row['macro']}/{row['bk_id']}-{slugify(row['titulo'])}.md"
        lines.append(f"| legacy-{req} | {dst} |")

    lines.extend(
        [
            "",
            "## Changelog",
            f"- `{TODAY}`: destinos canónicos atualizados para padrão com slug semântico.",
            "",
        ]
    )

    (plan_root / "guias-bk" / "MAPA-MIGRACAO-LEGACY-PARA-CANONICO.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    plan_root = Path(__file__).resolve().parents[1]
    backlog_path = plan_root / "backlogs" / "BACKLOG-MVP.md"

    rows = parse_backlog_rows(backlog_path)
    mapping = rewrite_guides_and_collect_mapping(plan_root, rows)
    replaced_files = replace_references(plan_root, mapping)
    rewrite_guias_readme(plan_root, rows)
    rewrite_template(plan_root)
    write_snippets_library(plan_root)
    rewrite_mapa_migracao(plan_root, rows)

    print(f"Guias migrados: {len(rows)}")
    print(f"Referencias atualizadas em ficheiros: {replaced_files}")


if __name__ == "__main__":
    main()
