/**
 * @file Componentes de interface transversais da MF5 para manter os modulos OPSA consistentes.
 */

import type { ReactNode } from "react";

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
