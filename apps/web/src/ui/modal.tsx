/**
 * @file Superfícies modais acessíveis e confirmação de ações sensíveis.
 */

import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../auth/AuthProvider";

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Gere foco, Escape, focus trap e isolamento do conteúdo de fundo.
 *
 * @param open - Estado visível do modal.
 * @param dialogRef - Elemento dialog que contém os controlos.
 * @param initialFocusRef - Controlo preferido para foco inicial.
 * @param onClose - Callback de fecho por Escape.
 */
export function useModalFocus(
  open: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocus.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const background = document.querySelector<HTMLElement>(".appShell");
    background?.setAttribute("inert", "");
    initialFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      background?.removeAttribute("inert");
      previousFocus.current?.focus();
    };
  }, [dialogRef, initialFocusRef, onClose, open]);
}

export interface ModalSurfaceProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  variant?: "dialog" | "drawer";
}

/**
 * Renderiza um dialog modal num portal para o tornar independente do layout.
 */
export function ModalSurface({
  open,
  title,
  onClose,
  children,
  actions,
  variant = "dialog",
}: ModalSurfaceProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useModalFocus(open, dialogRef, closeRef, onClose);
  if (!open) return null;

  return createPortal(
    <div className="modalBackdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        ref={dialogRef}
        className={`modalSurface modalSurface--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modalSurface__header">
          <h2 id={titleId}>{title}</h2>
          <button ref={closeRef} type="button" aria-label="Fechar diálogo" onClick={onClose}>Fechar</button>
        </header>
        {children}
        {actions ? <footer className="modalSurface__actions">{actions}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  companyName?: string | null;
  entityLabel?: string | null;
  busy?: boolean;
  requireAcknowledgement?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * Pede confirmação contextual antes de mutações destrutivas ou terminais.
 */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  companyName,
  entityLabel,
  busy = false,
  requireAcknowledgement = false,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  useEffect(() => {
    if (!open) setAcknowledged(false);
  }, [open]);
  const canConfirm = !busy && (!requireAcknowledgement || acknowledged);

  return (
    <ModalSurface
      open={open}
      title={title}
      onClose={() => {
        if (!busy) onCancel();
      }}
      actions={
        <>
          <button type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
          <button
            type="button"
            className="dangerButton"
            disabled={!canConfirm}
            onClick={() => void onConfirm()}
          >
            {busy ? "A executar…" : confirmLabel}
          </button>
        </>
      }
    >
      <p>{description}</p>
      {(companyName || entityLabel) ? (
        <div className="confirmationContext">
          {entityLabel ? <p><strong>Registo:</strong> {entityLabel}</p> : null}
          {companyName ? <p><strong>Empresa:</strong> {companyName}</p> : null}
        </div>
      ) : null}
      {requireAcknowledgement ? (
        <label className="confirmationAcknowledgement">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>Confirmo a empresa e compreendo que esta alteração de estado não deve ser repetida por engano.</span>
        </label>
      ) : null}
    </ModalSurface>
  );
}

export interface ConfirmableActionButtonProps {
  label: string;
  title?: string;
  description: string;
  entityLabel?: string | null;
  disabled?: boolean;
  busy?: boolean;
  requireAcknowledgement?: boolean;
  onConfirm: () => unknown | Promise<unknown>;
}

/**
 * Liga um botão operacional ao diálogo comum sem duplicar estado modal nas páginas.
 */
export function ConfirmableActionButton({
  label,
  title = `Confirmar ${label.toLocaleLowerCase("pt-PT")}`,
  description,
  entityLabel,
  disabled = false,
  busy = false,
  requireAcknowledgement = false,
  onConfirm,
}: ConfirmableActionButtonProps) {
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  return (
    <>
      <button
        type="button"
        className="dangerButton"
        disabled={disabled || busy}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <ConfirmationDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={label}
        companyName={auth.snapshot?.company?.name}
        entityLabel={entityLabel}
        busy={busy}
        requireAcknowledgement={requireAcknowledgement}
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          const result = await onConfirm();
          if (result !== null && result !== false) setOpen(false);
        }}
      />
    </>
  );
}
