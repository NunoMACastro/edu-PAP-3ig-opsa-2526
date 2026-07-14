/**
 * @file Feedback acessível por campo para formulários de domínio OPSA.
 */

import { useCallback, useRef, useState } from "react";
import type { FieldValidationError } from "../lib/mf5FormValidators";

export type FieldErrorMap = Record<string, string>;

function toFieldErrorMap(errors: FieldValidationError[]): FieldErrorMap {
  return Object.fromEntries(errors.map((error) => [error.field, error.message]));
}

export function useFormErrors() {
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  const applyErrors = useCallback((nextErrors: FieldValidationError[], form: HTMLFormElement) => {
    const next = toFieldErrorMap(nextErrors);
    setErrors(next);
    queueMicrotask(() => {
      const firstField = nextErrors[0]?.field;
      const field = firstField
        ? form.elements.namedItem(firstField)
        : null;
      if (field instanceof HTMLElement) field.focus();
      else summaryRef.current?.focus();
    });
    return nextErrors.length > 0;
  }, []);

  const clearField = useCallback((field: string) => {
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  return {
    errors,
    summaryRef,
    applyErrors,
    clearField,
    resetErrors: () => setErrors({}),
  };
}

export function FieldError({ field, message }: { field: string; message?: string }) {
  if (!message) return null;
  return <span className="fieldError" id={`${field}-error`}>{message}</span>;
}

export function FormErrorSummary({
  errors,
  summaryRef,
}: {
  errors: FieldErrorMap;
  summaryRef: React.RefObject<HTMLDivElement | null>;
}) {
  const values = Object.values(errors);
  if (values.length === 0) return null;
  return (
    <div ref={summaryRef} className="formErrorSummary" role="alert" tabIndex={-1}>
      <strong>Revê os campos indicados</strong>
      <ul>{values.map((message) => <li key={message}>{message}</li>)}</ul>
    </div>
  );
}
