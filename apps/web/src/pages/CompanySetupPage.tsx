/**
 * @file Formulário reutilizável para onboarding e criação de empresa adicional.
 */

import { FormEvent, useState } from "react";
import {
  createCompanySetup,
  type CompanySetupMode,
  type CompanySetupResult,
} from "../lib/companySetupApi";
import { validateNif } from "../lib/mf5FormValidators";
import { PageFrame, StatusMessage } from "../ui/opsaUi";

type FieldErrors = Record<string, string>;

export interface CompanySetupPageProps {
  mode: CompanySetupMode;
  onCreated?: (result: CompanySetupResult) => void | Promise<void>;
}

function text(form: FormData, field: string) {
  return String(form.get(field) ?? "").trim();
}

/**
 * Valida os campos que podem ser confirmados no browser. O backend continua a
 * ser a autoridade para NIF, ownership e regras fiscais.
 *
 * @param form - Formulário submetido.
 * @returns Erros indexados pelo nome do campo.
 */
function validateCompanyForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  const requiredFields = [
    ["name", "Indica o nome da empresa."],
    ["legalName", "Indica a denominação legal."],
    ["addressLine1", "Indica a morada."],
    ["postalCode", "Indica o código postal."],
    ["city", "Indica a localidade."],
  ] as const;
  for (const [field, message] of requiredFields) {
    if (!text(form, field)) errors[field] = message;
  }
  if (text(form, "name") && text(form, "name").length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  }
  const nifError = validateNif(text(form, "nif"));
  if (nifError) errors.nif = nifError.message;
  if (text(form, "postalCode") && !/^\d{4}-\d{3}$/.test(text(form, "postalCode"))) {
    errors.postalCode = "Usa o formato português 0000-000.";
  }

  const month = Number(text(form, "fiscalYearStartMonth"));
  const day = Number(text(form, "fiscalYearStartDay"));
  const fiscalDate = new Date(Date.UTC(2025, month - 1, day));
  if (
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    fiscalDate.getUTCMonth() !== month - 1 ||
    fiscalDate.getUTCDate() !== day
  ) {
    errors.fiscalYearStartDay = "Indica um dia e mês fiscal válidos.";
  }
  return errors;
}

function describedBy(field: string, errors: FieldErrors) {
  return errors[field] ? `${field}-error` : undefined;
}

/**
 * Mostra uma mensagem de campo ligada ao respetivo controlo.
 *
 * @param props - Nome do campo e mapa atual de erros.
 * @returns Mensagem acessível ou null.
 */
function FieldError({ field, errors }: { field: string; errors: FieldErrors }) {
  return errors[field] ? (
    <span id={`${field}-error`} role="alert">{errors[field]}</span>
  ) : null;
}

/**
 * Cria uma empresa pronta para a demonstração sem depender do router.
 *
 * @param props - Modo do endpoint e callback de integração após sucesso.
 * @returns Página isolada pronta a montar em onboarding ou `/companies/new`.
 */
export function CompanySetupPage({ mode, onCreated }: CompanySetupPageProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [created, setCreated] = useState<CompanySetupResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const nextErrors = validateCompanyForm(form);
    setErrors(nextErrors);
    setGlobalError(null);
    setCreated(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await createCompanySetup(mode, {
        name: text(form, "name"),
        profile: {
          legalName: text(form, "legalName"),
          nif: text(form, "nif"),
          addressLine1: text(form, "addressLine1"),
          addressLine2: text(form, "addressLine2") || undefined,
          postalCode: text(form, "postalCode"),
          city: text(form, "city"),
          country: "PT",
          currency: "EUR",
          fiscalYearStartMonth: Number(text(form, "fiscalYearStartMonth")),
          fiscalYearStartDay: Number(text(form, "fiscalYearStartDay")),
        },
        prepareDemoData: form.get("prepareDemoData") === "on",
      });
      setCreated(result);
      try {
        await onCreated?.(result);
      } catch {
        setGlobalError(
          "A empresa foi criada, mas a aplicação não atualizou a navegação. Atualiza a página sem voltar a submeter.",
        );
      }
    } catch (caught) {
      setGlobalError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível criar a empresa.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === "initial" ? "Criar primeira empresa" : "Criar nova empresa";
  return (
    <PageFrame
      title={title}
      description="Configura a base empresarial, fiscal e de stock necessária para trabalhar na OPSA."
    >
      <form className="operation" onSubmit={submit} noValidate>
        <fieldset disabled={submitting}>
          <legend>Dados da empresa</legend>
          <div className="fields">
            <label>
              <span>Nome da empresa</span>
              <input
                name="name"
                required
                minLength={2}
                placeholder="Ex.: Empresa PAP 2026"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy("name", errors)}
              />
              <FieldError field="name" errors={errors} />
            </label>
            <label>
              <span>Denominação legal</span>
              <input
                name="legalName"
                required
                placeholder="Ex.: Empresa PAP 2026, Lda."
                aria-invalid={Boolean(errors.legalName)}
                aria-describedby={describedBy("legalName", errors)}
              />
              <FieldError field="legalName" errors={errors} />
            </label>
            <label>
              <span>Morada</span>
              <input
                name="addressLine1"
                required
                autoComplete="address-line1"
                placeholder="Ex.: Rua da Escola, 1"
                aria-invalid={Boolean(errors.addressLine1)}
                aria-describedby={describedBy("addressLine1", errors)}
              />
              <FieldError field="addressLine1" errors={errors} />
            </label>
            <label>
              <span>Complemento de morada (opcional)</span>
              <input name="addressLine2" autoComplete="address-line2" />
            </label>
            <label>
              <span>Código postal</span>
              <input
                name="postalCode"
                required
                autoComplete="postal-code"
                placeholder="Ex.: 1000-001"
                aria-invalid={Boolean(errors.postalCode)}
                aria-describedby={describedBy("postalCode", errors)}
              />
              <FieldError field="postalCode" errors={errors} />
            </label>
            <label>
              <span>Localidade</span>
              <input
                name="city"
                required
                autoComplete="address-level2"
                placeholder="Ex.: Lisboa"
                aria-invalid={Boolean(errors.city)}
                aria-describedby={describedBy("city", errors)}
              />
              <FieldError field="city" errors={errors} />
            </label>
          </div>
        </fieldset>

        <fieldset disabled={submitting}>
          <legend>Dados fiscais</legend>
          <div className="fields">
            <label>
              <span>NIF português</span>
              <input
                name="nif"
                required
                inputMode="numeric"
                pattern="[0-9]{9}"
                placeholder="NIF de teste com 9 algarismos"
                aria-invalid={Boolean(errors.nif)}
                aria-describedby={describedBy("nif", errors)}
              />
              <FieldError field="nif" errors={errors} />
            </label>
            <label>
              <span>País</span>
              <input value="Portugal (PT)" readOnly />
            </label>
            <label>
              <span>Moeda base</span>
              <input value="Euro (EUR)" readOnly />
            </label>
            <label>
              <span>Mês de início do exercício</span>
              <input
                name="fiscalYearStartMonth"
                type="number"
                min={1}
                max={12}
                defaultValue={1}
                required
              />
            </label>
            <label>
              <span>Dia de início do exercício</span>
              <input
                name="fiscalYearStartDay"
                type="number"
                min={1}
                max={31}
                defaultValue={1}
                required
                aria-invalid={Boolean(errors.fiscalYearStartDay)}
                aria-describedby={describedBy("fiscalYearStartDay", errors)}
              />
              <FieldError field="fiscalYearStartDay" errors={errors} />
            </label>
          </div>
        </fieldset>

        <fieldset disabled={submitting}>
          <legend>Preparação da demonstração</legend>
          <label>
            <input name="prepareDemoData" type="checkbox" />
            <span>Preparar um produto de exemplo e 20 unidades de stock inicial</span>
          </label>
          <p>
            Esta opção é apenas académica, é proibida em produção e não cria dados reais nem certificação fiscal.
          </p>
        </fieldset>

        <button type="submit" disabled={submitting}>
          {submitting ? "A criar empresa..." : "Criar e ativar empresa"}
        </button>
      </form>

      {globalError ? (
        <StatusMessage tone="danger" title="Não foi possível concluir">
          <p>{globalError}</p>
        </StatusMessage>
      ) : null}
      {created ? (
        <StatusMessage tone="success" title="Empresa criada e ativada">
          <p>
            {created.company.name} ficou pronta com exercício fiscal, contas, IVA e armazém principal.
          </p>
          {created.bootstrap.demoData.prepared ? (
            <p>O produto demonstrativo e o respetivo stock inicial também foram preparados.</p>
          ) : null}
        </StatusMessage>
      ) : null}
    </PageFrame>
  );
}
