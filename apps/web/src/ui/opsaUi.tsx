/**
 * @file Componentes de interface transversais da MF5 para manter os módulos OPSA consistentes.
 */

import { ReactNode } from "react";

/**
 * Tons visuais aceites pelos componentes transversais da OPSA.
 */
export type Tone = "neutral" | "success" | "warning" | "danger";

/**
 * Props da moldura comum de página.
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
 * Gera um identificador HTML estável a partir de um título legível.
 *
 * @param title - Título visível da página.
 * @returns Identificador seguro para ligar `section` e `h2`.
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
 * Cria a moldura comum das páginas de operação da OPSA.
 *
 * @param props - Título, identificador opcional, contexto, ações e conteúdo da página.
 * @returns Secção React com cabeçalho, descrição opcional e conteúdo do módulo.
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
        <section
            className="panel pageFrame"
            aria-labelledby={safeHeadingId}
        >
            <header className="sectionHeader pageFrame__header">
                <div>
                    <p className="eyebrow">{eyebrow}</p>

                    <h2 id={safeHeadingId}>{title}</h2>

                    {description ? (
                        <p className="pageFrame__description">
                            {description}
                        </p>
                    ) : null}
                </div>

                {actions ? (
                    <div className="pageFrame__actions">{actions}</div>
                ) : null}
            </header>

            {/* O conteúdo continua a vir da página concreta; a moldura só normaliza estrutura visual. */}
            {children}
        </section>
    );
}

/**
 * Props da mensagem de estado reutilizável.
 */
export interface StatusMessageProps {
    tone: Tone;
    title: string;
    children: ReactNode;
}

/**
 * Apresenta feedback visual consistente para sucesso, aviso, erro ou estado neutro.
 *
 * @param props - Tom visual, título curto e conteúdo explicativo.
 * @returns Caixa de estado com role acessível.
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
            <strong className="statusMessage__title">
                {title}
            </strong>

            <div className="statusMessage__body">
                {children}
            </div>
        </div>
    );
}

/**
 * Props da barra de ações.
 */
export interface ActionToolbarProps {
    children: ReactNode;
}

/**
 * Agrupa comandos primários e secundários sem mudar a ordem visual entre módulos.
 */
export function ActionToolbar({ children }: ActionToolbarProps) {
    return <div className="actionToolbar">{children}</div>;
}

/**
 * Props do distintivo de módulo.
 */
export interface ModuleBadgeProps {
    label: string;
    tone?: Tone;
}

/**
 * Mostra estado ou categoria de módulo sem obrigar cada página a criar estilos próprios.
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