/**
 * @file Componentes visuais partilhados para manter a interface OPSA alinhada ao mockup aprovado.
 */

import type { ReactNode } from "react";

/**
 * Tons visuais aceites pelos componentes transversais da OPSA.
 */
export type Tone = "neutral" | "success" | "warning" | "danger";

/* =========================
   PAGE FRAME
========================= */

export interface PageFrameProps {
  title: string;
  eyebrow?: string;
  description?: string;
  headingId?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Gera um identificador HTML estável a partir de um título legível.
 */
function toHeadingId(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${normalized || "opsa-page"}-heading`;
}

/**
 * Moldura base de páginas OPSA.
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

        {actions ? (
          <div className="pageFrame__actions">{actions}</div>
        ) : null}
      </header>

      <div className="pageFrame__body">{children}</div>
    </section>
  );
}

/* =========================
   STATUS MESSAGE
========================= */

export interface StatusMessageProps {
  tone: Tone;
  title: string;
  children: ReactNode;
}

/**
 * Feedback acessível para estados da UI.
 */
export function StatusMessage({
  tone,
  title,
  children,
}: StatusMessageProps) {
  const role = tone === "danger" ? "alert" : "status";
  const live = tone === "danger" ? "assertive" : "polite";

  return (
    <div
      className={`statusMessage statusMessage--${tone}`}
      role={role}
      aria-live={live}
    >
      <strong className="statusMessage__title">{title}</strong>
      <div className="statusMessage__body">{children}</div>
    </div>
  );
}

/* =========================
   ACTION TOOLBAR
========================= */

export interface ActionToolbarProps {
  children: ReactNode;
}

export function ActionToolbar({ children }: ActionToolbarProps) {
  return <div className="actionToolbar">{children}</div>;
}

/* =========================
   MODULE BADGE
========================= */

export interface ModuleBadgeProps {
  label: string;
  tone?: Tone;
}

/**
 * Badge visual de estado/categoria.
 */
export function ModuleBadge({
  label,
  tone = "neutral",
}: ModuleBadgeProps) {
  return (
    <span className={`moduleBadge moduleBadge--${tone}`}>
      {label}
    </span>
  );
}

/* =========================
   AI SOURCE QUALITY
========================= */

export interface AiSourceQuality {
  confidence: "low" | "medium" | "high";
  limitation: string;
  source: {
    type: string;
    id: string;
    label: string;
  };
}

export interface AiSourceQualityPanelProps {
  quality?: AiSourceQuality | null;
}

/**
 * Painel de governação da qualidade da IA.
 */
export function AiSourceQualityPanel({
  quality,
}: AiSourceQualityPanelProps) {
  if (!quality) {
    return (
      <StatusMessage
        tone="warning"
        title="Fonte por confirmar"
      >
        Esta recomendação não trouxe metadados de qualidade suficientes.
        Revê a origem antes de tomar uma decisão.
      </StatusMessage>
    );
  }

  return (
    <aside
      className="aiSourceQuality"
      aria-label="Qualidade da fonte da IA"
    >
      <ModuleBadge
        label={`Confiança ${quality.confidence}`}
        tone="warning"
      />

      <p>
        Fonte: {quality.source.label} (
        {quality.source.type}/{quality.source.id})
      </p>

      <p>{quality.limitation}</p>

      <p>A IA recomenda; a decisão continua humana.</p>
    </aside>
  );
}