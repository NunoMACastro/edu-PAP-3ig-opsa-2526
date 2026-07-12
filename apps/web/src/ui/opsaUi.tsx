/**
 * @file Componentes de interface transversais da MF5 para manter os modulos OPSA consistentes.
 */

import type { ReactNode } from "react";
import { formatDisplayValue } from "../lib/formatters";
import type { ActionFeedbackState } from "./useActionFeedback";

/**
 * Tons visuais aceites pelos componentes transversais da OPSA.
 */
export type Tone = "neutral" | "success" | "warning" | "danger";

/**
 * Props da moldura comum de pagina.
 */
export interface PageFrameProps {
  title: string;
  eyebrow?: string;
  description?: string;
  headingId?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Gera um identificador HTML estavel a partir de um titulo legivel.
 *
 * @param title - Titulo visivel da pagina.
 * @returns Identificador seguro para ligar `section` e `h2`.
 */
function toHeadingId(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // O fallback mantem a acessibilidade mesmo quando o titulo nao tem letras ou numeros.
  return `${normalized || "opsa-page"}-heading`;
}

/**
 * Cria a moldura comum das paginas de operacao da OPSA.
 *
 * @param props - Titulo, identificador opcional, contexto, acoes e conteudo da pagina.
 * @returns Seccao React com cabecalho, descricao opcional e conteudo do modulo.
 */
export function PageFrame({
  title,
  eyebrow = "OPSA",
  description,
  headingId,
  actions,
  children,
}: PageFrameProps) {
  const safeHeadingId = headingId ?? toHeadingId(title);

  return (
    <section className="panel pageFrame" aria-labelledby={safeHeadingId}>
      <header className="sectionHeader pageFrame__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={safeHeadingId}>{title}</h2>
          {description ? (
            <p className="pageFrame__description">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="pageFrame__actions">{actions}</div> : null}
      </header>
      {/* O conteudo continua a vir da pagina concreta; a moldura so normaliza estrutura visual. */}
      <div className="pageFrame__body">{children}</div>
    </section>
  );
}

/**
 * Props da mensagem de estado reutilizavel.
 */
export interface StatusMessageProps {
  tone: Tone;
  title: string;
  children: ReactNode;
}

/**
 * Apresenta feedback visual consistente para sucesso, aviso, erro ou estado neutro.
 *
 * @param props - Tom visual, titulo curto e conteudo explicativo.
 * @returns Caixa de estado com role acessivel.
 */
export function StatusMessage({ tone, title, children }: StatusMessageProps) {
  // Erros usam alert para serem anunciados com prioridade por tecnologias de apoio.
  const role = tone === "danger" ? "alert" : "status";
  const live = tone === "danger" ? "assertive" : "polite";

  return (
    <div className={`statusMessage statusMessage--${tone}`} role={role} aria-live={live}>
      {/* O titulo textual evita que o estado dependa apenas da cor da mensagem. */}
      <strong className="statusMessage__title">{title}</strong>
      <div className="statusMessage__body">{children}</div>
    </div>
  );
}

/**
 * Apresenta feedback operacional e mantém diagnóstico técnico recolhido.
 */
export function ActionFeedbackMessage({ feedback }: { feedback: ActionFeedbackState }) {
  if (!feedback.message) return null;
  return (
    <StatusMessage tone={feedback.tone} title={feedback.title}>
      <p>{feedback.message}</p>
      {feedback.technical ? (
        <details className="technicalDetails">
          <summary>Detalhes técnicos</summary>
          <p>
            {feedback.technical.status ? `HTTP ${feedback.technical.status}` : ""}
            {feedback.technical.status && feedback.technical.code ? " · " : ""}
            {feedback.technical.code ?? ""}
          </p>
        </details>
      ) : null}
    </StatusMessage>
  );
}

/**
 * Props da barra de acoes.
 */
export interface ActionToolbarProps {
  children: ReactNode;
}

/**
 * Agrupa comandos primarios e secundarios sem mudar a ordem visual entre modulos.
 *
 * @param props - Botoes ou ligacoes de acao.
 * @returns Barra de acoes reutilizavel.
 */
export function ActionToolbar({ children }: ActionToolbarProps) {
  return <div className="actionToolbar">{children}</div>;
}

/**
 * Estado vazio com explicação e ação opcional orientadas ao contexto.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="empty emptyState" aria-label={title}>
      <strong>{title}</strong>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </section>
  );
}

/**
 * Props do distintivo de modulo.
 */
export interface ModuleBadgeProps {
  label: string;
  tone?: Tone;
}

/**
 * Mostra estado ou categoria de modulo sem obrigar cada pagina a criar estilos proprios.
 *
 * @param props - Texto do distintivo e tom visual.
 * @returns Distintivo textual pequeno.
 */
export function ModuleBadge({ label, tone = "neutral" }: ModuleBadgeProps) {
  // O tom fica limitado a valores conhecidos para evitar classes CSS inventadas por engano.
  return <span className={`moduleBadge moduleBadge--${tone}`}>{label}</span>;
}

/**
 * Metadados de qualidade da fonte que chegam do guardrail de IA da MF8.
 */
export interface AiSourceQuality {
  confidence: "low" | "medium" | "high";
  limitation: string;
  source: {
    type: string;
    id: string;
    label: string;
  };
}

/**
 * Props do painel de qualidade de fonte de IA.
 */
export interface AiSourceQualityPanelProps {
  quality?: AiSourceQuality | null;
}

/**
 * Mostra a fonte e a limitação de uma recomendação de IA sem permitir execução automática.
 *
 * @param props - Qualidade da fonte recebida da API.
 * @returns Painel textual de governação para recomendações de IA.
 */
export function AiSourceQualityPanel({ quality }: AiSourceQualityPanelProps) {
  if (!quality) {
    return (
      <StatusMessage tone="warning" title="Fonte por confirmar">
        Esta recomendação não trouxe metadados de qualidade suficientes. Revê a origem antes de
        tomar uma decisão.
      </StatusMessage>
    );
  }

  return (
    <aside className="aiSourceQuality" aria-label="Qualidade da fonte da IA">
      {/* A confiança é apresentada como texto para não depender apenas da cor. */}
      <ModuleBadge label={`Confiança ${quality.confidence}`} tone="warning" />
      <p>
        Fonte: {quality.source.label} ({quality.source.type}/{quality.source.id})
      </p>
      <p>{quality.limitation}</p>
      <p>A IA recomenda; a decisão continua humana.</p>
    </aside>
  );
}

const SENSITIVE_RESULT_KEY =
  /(password|token|secret|cookie|authorization|csrf|session|contentbase64|storagekey|databaseurl|xml)/i;

function humanizeResultKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function renderStructuredValue(value: unknown, key: string, depth: number): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value !== "object") return formatDisplayValue(key, value);

  if (depth >= 3) return "Detalhes disponíveis";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Sem itens";
    return (
      <ol className="structuredResult__list">
        {value.slice(0, 50).map((item, index) => (
          <li key={index}>{renderStructuredValue(item, `${key}-${index}`, depth + 1)}</li>
        ))}
      </ol>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([entryKey]) => !SENSITIVE_RESULT_KEY.test(entryKey),
  );
  if (entries.length === 0) return "Sem detalhes públicos";

  return (
    <dl className="structuredResult__details">
      {entries.map(([entryKey, entryValue]) => (
        <div key={entryKey}>
          <dt>{humanizeResultKey(entryKey)}</dt>
          <dd>{renderStructuredValue(entryValue, entryKey, depth + 1)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Apresenta respostas de domínio sem despejar JSON técnico ou campos sensíveis no ecrã.
 *
 * @param props - Valor devolvido pela API e título acessível opcional.
 * @returns Estrutura semântica limitada a três níveis.
 */
export function StructuredResult({
  value,
  title = "Resultado da operação",
}: {
  value: unknown;
  title?: string;
}) {
  if (value === null || value === undefined) return null;
  return (
    <section className="structuredResult" aria-label={title}>
      <h3>{title}</h3>
      {renderStructuredValue(value, "resultado", 0)}
    </section>
  );
}
