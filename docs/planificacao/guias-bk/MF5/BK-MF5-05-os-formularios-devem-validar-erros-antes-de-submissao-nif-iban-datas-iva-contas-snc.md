# BK-MF5-05 - Os formulários devem validar erros antes de submissão (NIF, IBAN, datas, IVA, contas SNC).

## Header
- `doc_id`: `GUIA-BK-MF5-05`
- `bk_id`: `BK-MF5-05`
- `macro`: `MF5`
- `owner`: `Oleksii`
- `apoio`: `Pedro`
- `prioridade`: `P0`
- `estado`: `TODO`
- `esforco`: `M`
- `dependencias`: `-`
- `rf_rnf`: `RNF05`
- `fase_documental`: `Fase 2`
- `sprint`: `S09-S10`
- `core_or_reforco`: `Reforco`
- `proximo_bk`: `BK-MF5-06`
- `guia_path`: `docs/planificacao/guias-bk/MF5/BK-MF5-05-os-formularios-devem-validar-erros-antes-de-submissao-nif-iban-datas-iva-contas-snc.md`
- `last_updated`: `2026-06-20`

#### Objetivo

Neste BK vais implementar validação local dos campos críticos dos formulários OPSA antes da submissão: NIF, IBAN, datas, IVA e contas SNC. O resultado final é uma experiência mais clara para o utilizador, sem criar endpoints, sem criar modelos Prisma e sem retirar a autoridade final ao backend.

#### Importância

Validação antecipada reduz erros repetidos, evita pedidos desnecessários à API e prepara mensagens claras para o `BK-MF5-06`. Mesmo assim, validação no browser é apenas ajuda de utilização: permissões, empresa ativa da sessão, ownership, períodos fiscais, auditoria e persistência continuam a ser decididos no backend.

#### Scope-in

- Criar validadores frontend explícitos para formatos de NIF, IBAN português, datas ISO, IVA e contas SNC.
- Integrar esses validadores em formulários genéricos e dedicados antes de chamar a API.
- Reutilizar os contratos de feedback imediato e acessibilidade criados nos BKs anteriores da MF5.
- Criar smoke textual próprio para `RNF05`.
- Manter React, Vite, TypeScript e o cliente API existente.
- Produzir evidence objetiva para PR e defesa PAP.

#### Scope-out

- Criar novas regras fiscais, contabilísticas ou legais.
- Criar endpoints backend, DTOs backend, services, schemas ou modelos Prisma.
- Remover validações backend existentes.
- Trocar a stack frontend ou adicionar dependências.
- Alterar RF/RNF, backlog, matriz, sprints ou ownership dos BKs.
- Corrigir performance, acessibilidade visual ou copy final de erro para além do necessário neste BK.

#### Estado antes e depois

- Antes: formulários conseguem enviar alguns formatos claramente inválidos, deixando a rejeição e a explicação para a API.
- Depois: o frontend bloqueia formatos críticos antes da submissão, mostra uma mensagem acionável e só avança para a API quando a validação local passa.

#### Pre-requisitos

- Ler `RNF05` em `docs/RNF.md`.
- Rever `BACKLOG-MVP.md`, `MATRIZ-CANONICA-BK.md`, `CONTRATO-CAMPOS-BK.md`, `MF-VIEWS.md` e `PLANO-SPRINTS.md`.
- Confirmar que `real_dev/web/src/lib/apiClient.ts` usa cookies HttpOnly com `credentials: "include"`.
- Confirmar que `BK-MF5-03` já definiu `useActionFeedback` com `fail(error: Error, fallback?)`.
- Confirmar que `BK-MF5-04` já disponibilizou padrões de foco, legibilidade e mensagens acessíveis.
- Rever validadores backend existentes antes de escolher mensagens e formatos.

#### Glossário

- `Validação frontend`: verificação rápida no browser para ajudar o utilizador antes da submissão.
- `Validação backend`: regra final aplicada pela API para segurança, domínio e persistência.
- `NIF`: número de identificação fiscal português.
- `IBAN`: identificador de conta bancária; neste BK valida-se o formato português esperado no MVP.
- `IVA`: imposto sobre o valor acrescentado; o guia distingue identificador de taxa, basis points e percentagem visual.
- `Basis points`: unidade técnica em que `2300` representa `23,00%`.
- `Conta SNC`: código de conta usado no referencial contabilístico do projeto.
- `Smoke textual`: script curto que verifica contratos críticos por leitura estática.
- `Evidence`: prova objetiva para PR ou defesa, como output de comando, screenshot ou cenário reproduzido.

#### Conceitos teóricos essenciais

- `CANONICO`: `RNF05` exige que formulários validem erros antes da submissão.
- `CANONICO`: a stack validada é React, Vite e TypeScript em `real_dev/web`, com API Express em `real_dev/api`.
- `CANONICO`: o cliente HTTP existente usa cookies HttpOnly com `credentials: "include"`; o frontend não guarda credenciais persistentes no browser.
- `DERIVADO`: os artefactos deste BK são utilitários frontend, integrações em formulários e smoke textual, porque `RNF05` não exige novas entidades Prisma.
- `DERIVADO`: validação local deve ser explícita por campo, para não confundir identificadores, percentagens e unidades técnicas.
- Validação por substring é frágil: um campo chamado `vatRateId` não representa uma percentagem.
- Datas devem usar formato `YYYY-MM-DD` e roundtrip ISO, porque o runtime JavaScript pode normalizar datas impossíveis.
- A validação local deve bloquear apenas erros formais que o utilizador consegue corrigir no momento.
- A API continua responsável por regras de domínio, permissões, ownership, empresa ativa da sessão, auditoria e integridade dos dados.

#### Arquitetura do BK

- `real_dev/web/src/lib/mf5FormValidators.ts` concentra validadores puros e mensagens reutilizáveis.
- `real_dev/web/src/App.tsx` integra validação no `OperationForm` genérico.
- `real_dev/web/src/pages/mf1Pages.tsx`, `mf2Pages.tsx`, `mf3Pages.tsx` e `mf4Pages.tsx` passam a validar campos críticos em formulários dedicados.
- `real_dev/web/scripts/check-mf5-form-validation.mjs` confirma contratos textuais de `RNF05`.
- `real_dev/web/package.json` expõe `test:mf5:forms`.
- `real_dev/api/src/modules/*` é apenas revisto para manter alinhamento com validação backend já existente.

#### Ficheiros a criar/editar/rever

- CRIAR: `real_dev/web/src/lib/mf5FormValidators.ts`
- CRIAR: `real_dev/web/scripts/check-mf5-form-validation.mjs`
- EDITAR: `real_dev/web/src/App.tsx`
- EDITAR: `real_dev/web/src/pages/mf1Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf2Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf3Pages.tsx`
- EDITAR: `real_dev/web/src/pages/mf4Pages.tsx`
- EDITAR: `real_dev/web/package.json`
- REVER: `real_dev/api/src/modules/company-profile/companyProfileValidators.js`
- REVER: `real_dev/api/src/modules/treasury/bankAccountValidators.js`
- REVER: validators backend relacionados com datas, IVA e contas SNC.

#### Tutorial técnico linear

### Passo 1 - Inventariar campos críticos antes de escrever código

1. Objetivo funcional do passo no contexto da app.

Identificar onde existem NIF, IBAN, datas, IVA e contas SNC para não criar validação genérica que bloqueia campos válidos.

2. Ficheiros envolvidos:
    - REVER: `real_dev/web/src/App.tsx`
    - REVER: `real_dev/web/src/pages/mf1Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf2Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf3Pages.tsx`
    - REVER: `real_dev/web/src/pages/mf4Pages.tsx`

3. Instruções do que fazer.

Lista os nomes reais de campos usados pelos formulários. Se encontrares um campo novo, decide primeiro se é formato local ou regra backend.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Inventário documental dos campos cobertos pelo BK-MF5-05.
 *
 * Este ficheiro não precisa de existir na app. Usa esta matriz durante a
 * implementação para confirmar que os validadores usam nomes reais de campo.
 */
export const mf5FormFieldInventory = {
  nif: ["nif", "customerNif", "supplierNif"],
  iban: ["iban", "bankIban"],
  dates: ["issuedAt", "dueDate", "entryDate", "receivedAt", "paidAt", "fromDate", "toDate"],
  vat: ["vatRateId", "vatRateBps", "vatRatePercent"],
  snc: ["accountCode", "sncAccountCode"],
} as const;
```

5. Explicação do código.

A matriz separa semânticas. `vatRateId` é identificador de taxa, `vatRateBps` é unidade técnica e `vatRatePercent` é percentagem visual. Isto impede que um identificador seja validado como número entre `0` e `100`.

6. Validação do passo.

Confirma por pesquisa que cada campo do inventário existe ou é usado pelo formulário que vais editar. Não avances com nomes inventados.

7. Cenário negativo/erro esperado.

Se validares `vatRateId` como percentagem, uma linha de venda válida pode ficar bloqueada antes de chegar à API.

### Passo 2 - Confirmar a fronteira entre ajuda frontend e autoridade backend

1. Objetivo funcional do passo no contexto da app.

Garantir que o frontend melhora UX sem substituir validação de segurança e domínio.

2. Ficheiros envolvidos:
    - REVER: `real_dev/api/src/modules/company-profile/companyProfileValidators.js`
    - REVER: `real_dev/api/src/modules/treasury/bankAccountValidators.js`
    - REVER: validators backend de módulos que recebem datas, IVA e contas SNC

3. Instruções do que fazer.

Verifica que a API continua a validar dados recebidos. Este BK não remove qualquer validação backend.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Contrato de responsabilidade do BK-MF5-05.
 *
 * Frontend:
 * - valida formato óbvio;
 * - mostra mensagem rápida;
 * - evita chamada desnecessária à API.
 *
 * Backend:
 * - valida permissões;
 * - resolve empresa ativa da sessão;
 * - aplica regras de domínio;
 * - decide persistência e auditoria.
 */
export const mf5ValidationResponsibility = {
  frontend: ["format", "requiredFields", "message"],
  backend: ["authorization", "activeCompany", "domainRules", "persistence", "audit"],
} as const;
```

5. Explicação do código.

O objeto documenta a divisão de responsabilidades. Não é uma regra executada em runtime; é uma referência para impedir que a validação local seja tratada como barreira de segurança.

6. Validação do passo.

Depois da implementação, tenta chamar a API diretamente com dados inválidos e confirma que o backend também rejeita.

7. Cenário negativo/erro esperado.

Se a API aceitar um NIF inválido apenas porque a UI normalmente o bloqueia, a aplicação fica vulnerável a clientes alternativos.

### Passo 3 - Criar validadores MF5 com nomes de campo explícitos

1. Objetivo funcional do passo no contexto da app.

Centralizar validações de formato em funções puras, testáveis e reutilizáveis.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/src/lib/mf5FormValidators.ts`

3. Instruções do que fazer.

Cria o ficheiro completo abaixo. Mantém mensagens em português de Portugal e não adicionas dependências.

4. Código completo, correto e integrado com a app final.

```ts
/**
 * @file Validadores de formulário MF5 para bloquear formatos inválidos antes da submissão.
 */

export interface FieldValidationError {
  field: string;
  message: string;
}

export type PrimitiveValidationValue = string | number | boolean;

const NIF_FIELDS = new Set(["nif", "customernif", "suppliernif"]);
const IBAN_FIELDS = new Set(["iban", "bankiban"]);
const DATE_FIELDS = new Set(["issuedat", "duedate", "entrydate", "receivedat", "paidat", "fromdate", "todate"]);
const VAT_ID_FIELDS = new Set(["vatrateid"]);
const VAT_BPS_FIELDS = new Set(["vatratebps"]);
const VAT_PERCENT_FIELDS = new Set(["vatratepercent"]);
const SNC_FIELDS = new Set(["accountcode", "sncaccountcode"]);

/**
 * Converte valores primitivos para texto aparado.
 *
 * @param value - Valor recebido do formulário.
 * @returns Texto seguro para validação de formato.
 */
function asText(value: PrimitiveValidationValue) {
  return String(value).trim();
}

/**
 * Acrescenta um erro à lista apenas quando o validador encontrou uma falha.
 *
 * @param errors - Lista acumulada de erros.
 * @param error - Resultado de um validador individual.
 */
function pushError(errors: FieldValidationError[], error: FieldValidationError | null) {
  if (error) {
    errors.push(error);
  }
}

/**
 * Valida NIF português por formato simples usado no MVP OPSA.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validateNif(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{9}$/.test(normalized)) {
    return { field: "nif", message: "O NIF deve ter 9 algarismos." };
  }

  return null;
}

/**
 * Valida IBAN português com prefixo, tamanho e resto ISO 7064 mod 97.
 *
 * @param value - Texto introduzido pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validatePortugueseIban(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value).replace(/\s+/g, "").toUpperCase();
  if (!/^PT50\d{21}$/.test(normalized)) {
    return { field: "iban", message: "O IBAN português deve começar por PT50 e ter 25 caracteres." };
  }

  const rearranged = `${normalized.slice(4)}${normalized.slice(0, 4)}`;
  let remainder = 0;

  for (const character of rearranged) {
    // As letras do IBAN são convertidas para números antes do cálculo incremental do resto.
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  if (remainder !== 1) {
    return { field: "iban", message: "O IBAN indicado não passou a validação de controlo." };
  }

  return null;
}

/**
 * Valida datas ISO sem permitir normalização silenciosa do JavaScript.
 *
 * @param field - Nome do campo validado.
 * @param value - Valor do input.
 * @returns Erro de validação ou null.
 */
export function validateIsoDate(field: string, value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return { field, message: "A data deve estar no formato AAAA-MM-DD." };
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.toISOString().slice(0, 10) !== normalized) {
    return { field, message: "A data indicada não existe." };
  }

  return null;
}

/**
 * Valida uma taxa de IVA guardada em basis points.
 *
 * @param value - Valor técnico, por exemplo 2300 para 23,00%.
 * @returns Erro de validação ou null.
 */
export function validateVatBps(value: PrimitiveValidationValue): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    return { field: "vatRateBps", message: "A taxa de IVA técnica deve ser um inteiro entre 0 e 10000." };
  }

  return null;
}

/**
 * Valida uma percentagem de IVA apresentada ao utilizador.
 *
 * @param value - Percentagem escrita pelo utilizador.
 * @returns Erro de validação ou null.
 */
export function validateVatPercent(value: PrimitiveValidationValue): FieldValidationError | null {
  const parsed = Number(asText(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return { field: "vatRatePercent", message: "A taxa de IVA deve estar entre 0 e 100." };
  }

  return null;
}

/**
 * Valida presença de identificador selecionado numa lista controlada.
 *
 * @param field - Campo de identificador validado.
 * @param value - Valor selecionado no formulário.
 * @returns Erro de validação ou null.
 */
export function validateKnownId(field: string, value: PrimitiveValidationValue): FieldValidationError | null {
  if (!asText(value)) {
    return { field, message: "Seleciona uma opção válida antes de submeter." };
  }

  return null;
}

/**
 * Valida código de conta SNC usado no MVP.
 *
 * @param value - Código introduzido.
 * @returns Erro de validação ou null.
 */
export function validateSncAccount(value: PrimitiveValidationValue): FieldValidationError | null {
  const normalized = asText(value);
  if (!/^\d{2,8}$/.test(normalized)) {
    return { field: "accountCode", message: "A conta SNC deve ter entre 2 e 8 algarismos." };
  }

  return null;
}

/**
 * Mantém apenas valores primitivos que podem ser validados por formato no frontend.
 *
 * @param values - Valores recolhidos pelo formulário.
 * @returns Valores seguros para validação textual.
 */
export function toPrimitiveValidationValues(values: Record<string, unknown>) {
  const safeValues: Record<string, PrimitiveValidationValue> = {};

  for (const [field, value] of Object.entries(values)) {
    // Objetos e listas continuam a ser responsabilidade da validação backend.
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safeValues[field] = value;
    }
  }

  return safeValues;
}

/**
 * Valida um único campo de formulário por contrato explícito de nome.
 *
 * @param field - Nome do campo.
 * @param value - Valor primitivo do campo.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Field(field: string, value: PrimitiveValidationValue) {
  const normalizedField = field.toLowerCase();
  const errors: FieldValidationError[] = [];

  pushError(errors, NIF_FIELDS.has(normalizedField) ? validateNif(value) : null);
  pushError(errors, IBAN_FIELDS.has(normalizedField) ? validatePortugueseIban(value) : null);
  pushError(errors, DATE_FIELDS.has(normalizedField) ? validateIsoDate(field, value) : null);
  pushError(errors, VAT_ID_FIELDS.has(normalizedField) ? validateKnownId(field, value) : null);
  pushError(errors, VAT_BPS_FIELDS.has(normalizedField) ? validateVatBps(value) : null);
  pushError(errors, VAT_PERCENT_FIELDS.has(normalizedField) ? validateVatPercent(value) : null);
  pushError(errors, SNC_FIELDS.has(normalizedField) ? validateSncAccount(value) : null);

  return errors;
}

/**
 * Executa validadores antes de submeter o formulário.
 *
 * @param values - Valores normalizados pelo formulário.
 * @returns Lista de erros encontrados.
 */
export function validateMf5Form(values: Record<string, PrimitiveValidationValue>) {
  return Object.entries(values).flatMap(([field, value]) => validateMf5Field(field, value));
}

/**
 * Valida campos selecionados diretamente a partir de FormData.
 *
 * @param form - FormData criado no submit.
 * @param fieldNames - Campos que o formulário deve validar localmente.
 * @returns Lista de erros encontrados.
 */
export function validateMf5FormData(form: FormData, fieldNames: string[]) {
  const values: Record<string, PrimitiveValidationValue> = {};

  for (const fieldName of fieldNames) {
    const value = form.get(fieldName);
    if (typeof value === "string") {
      values[fieldName] = value;
    }
  }

  return validateMf5Form(values);
}

/**
 * Formata erros de validação para o contrato de feedback imediato.
 *
 * @param errors - Lista de erros devolvida pelos validadores.
 * @returns Mensagem agregada para mostrar no formulário.
 */
export function formatMf5FormErrors(errors: FieldValidationError[]) {
  return errors.map((error) => error.message).join(" ");
}
```

5. Explicação do código.

Os `Set` no topo tornam a decisão explícita por nome real de campo. A data usa regex e compara `toISOString().slice(0, 10)` com o valor original, rejeitando datas impossíveis como `2026-02-30`. O IBAN usa validação de controlo mod 97. IVA fica separado entre identificador, basis points e percentagem visual.

6. Validação do passo.

Valores como NIF `123`, IBAN `PT00`, data `2026-02-30`, IVA técnico `23000`, percentagem `120` e conta `ABC` devem devolver erro local.

7. Cenário negativo/erro esperado.

Um campo `vatRateBps` com `2300` deve passar. Um campo `vatRateId` não pode ser tratado como percentagem.

### Passo 4 - Integrar validação no `OperationForm`

1. Objetivo funcional do passo no contexto da app.

Bloquear submissão local no formulário genérico com mensagem compatível com os BKs anteriores.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/App.tsx`

3. Instruções do que fazer.

Adiciona o import e substitui a função `handleSubmit` dentro de `OperationForm`. Mantém o resto do componente igual, salvo ajustes de props já introduzidos nos BKs anteriores.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatMf5FormErrors, toPrimitiveValidationValues, validateMf5Form } from "./lib/mf5FormValidators";

/**
 * Submete a operação apenas depois de validar campos críticos no frontend.
 *
 * @param event - Evento do formulário submetido.
 * @returns Promise resolvida depois de processar a submissão.
 */
async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formElement = event.currentTarget;
  action.start("A validar dados do formulário...");

  try {
    const values = normalizeFormValues(operation.fields, new FormData(formElement));
    const validationErrors = validateMf5Form(toPrimitiveValidationValues(values));

    if (validationErrors.length > 0) {
      // O contrato do BK-MF5-03 recebe Error, permitindo manter fallback e acessibilidade consistentes.
      action.fail(new Error(formatMf5FormErrors(validationErrors)));
      return;
    }

    const result = await operation.run(values);
    await operation.afterSuccess?.();
    await onDone(result);
    formElement.reset();
    action.succeed("Dados guardados e lista atualizada.");
  } catch (caught) {
    const error = caught instanceof Error ? caught : new Error(formatError(caught));
    action.fail(error, "Não foi possível guardar os dados.");
  }
}
```

5. Explicação do código.

`toPrimitiveValidationValues` evita validar objetos e listas no frontend. `validateMf5Form` devolve erros formais antes de chamar a API. `action.fail(new Error(...))` respeita o contrato de `BK-MF5-03`, em vez de passar texto solto para uma função tipada para `Error`.

6. Validação do passo.

Introduz `ABC` num campo NIF do formulário genérico e confirma que a API não é chamada. Depois usa dados válidos e confirma que a submissão continua.

7. Cenário negativo/erro esperado.

Se `action.fail` receber texto simples, o typecheck deve falhar ou o contrato de feedback fica desalinhado com o BK anterior.

### Passo 5 - Integrar validação em formulários dedicados de vendas e compras

1. Objetivo funcional do passo no contexto da app.

Aplicar `RNF05` aos formulários MF1 que recolhem datas e IVA fora do formulário genérico.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/mf1Pages.tsx`

3. Instruções do que fazer.

Importa `validateMf5FormData` e `formatMf5FormErrors`. Valida os campos antes de construir o corpo enviado para a API.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatMf5FormErrors, validateMf5FormData } from "../lib/mf5FormValidators";

/**
 * Lança erro se o formulário tiver campos críticos inválidos.
 *
 * @param form - Dados recolhidos no submit.
 * @param fieldNames - Campos críticos deste formulário.
 */
function assertMf5Form(form: FormData, fieldNames: string[]) {
  const errors = validateMf5FormData(form, fieldNames);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
}

/**
 * Constrói o pedido de venda depois de validar datas e IVA.
 *
 * @param form - Dados submetidos no formulário de venda.
 * @returns Corpo pronto para o cliente API.
 */
function parseSaleDocumentForm(form: FormData) {
  assertMf5Form(form, ["issuedAt", "dueDate", "vatRateId"]);

  return {
    customerId: String(form.get("customerId") ?? ""),
    issuedAt: String(form.get("issuedAt") ?? ""),
    dueDate: String(form.get("dueDate") ?? ""),
    lines: [
      {
        description: String(form.get("description") ?? ""),
        quantity: Number(form.get("quantity") ?? 1),
        unitPriceCents: Number(form.get("unitPriceCents") ?? 0),
        vatRateId: String(form.get("vatRateId") ?? ""),
      },
    ],
  };
}

/**
 * Constrói o pedido de compra depois de validar datas e IVA.
 *
 * @param form - Dados submetidos no formulário de compra.
 * @returns Corpo pronto para o cliente API.
 */
function parsePurchaseDocumentForm(form: FormData) {
  assertMf5Form(form, ["issuedAt", "dueDate", "vatRateId"]);

  return {
    supplierId: String(form.get("supplierId") ?? ""),
    issuedAt: String(form.get("issuedAt") ?? ""),
    dueDate: String(form.get("dueDate") ?? ""),
    lines: [
      {
        description: String(form.get("description") ?? ""),
        quantity: Number(form.get("quantity") ?? 1),
        unitPriceCents: Number(form.get("unitPriceCents") ?? 0),
        vatRateId: String(form.get("vatRateId") ?? ""),
      },
    ],
  };
}
```

5. Explicação do código.

`assertMf5Form` fica junto das funções de parsing para impedir que cada formulário invente mensagens diferentes. `vatRateId` valida presença de seleção, não percentagem. Quantidades e preços continuam a ser validados pelo fluxo existente e pelo backend.

6. Validação do passo.

Submete uma venda com `issuedAt=2026-02-30` e confirma erro local. Submete outra com `vatRateId` preenchido e confirma que o campo não é bloqueado por regra de percentagem.

7. Cenário negativo/erro esperado.

Uma compra com data impossível não pode chamar a API. Uma linha com taxa selecionada por ID não pode ser rejeitada como se fosse `120%`.

### Passo 6 - Integrar validação nos restantes formulários MF2, MF3 e MF4

1. Objetivo funcional do passo no contexto da app.

Cobrir NIF, IBAN, datas e contas SNC em formulários dedicados fora de MF1.

2. Ficheiros envolvidos:
    - EDITAR: `real_dev/web/src/pages/mf2Pages.tsx`
    - EDITAR: `real_dev/web/src/pages/mf3Pages.tsx`
    - EDITAR: `real_dev/web/src/pages/mf4Pages.tsx`

3. Instruções do que fazer.

Usa o mesmo padrão do passo anterior. Valida apenas campos presentes no formulário concreto.

4. Código completo, correto e integrado com a app final.

```tsx
import { formatMf5FormErrors, validateMf5FormData } from "../lib/mf5FormValidators";

/**
 * Valida campos críticos de um formulário dedicado antes de enviar para a API.
 *
 * @param form - Dados submetidos pelo utilizador.
 * @param fieldNames - Campos cobertos pelo RNF05 neste ecrã.
 */
function assertMf5DedicatedForm(form: FormData, fieldNames: string[]) {
  const errors = validateMf5FormData(form, fieldNames);
  if (errors.length > 0) {
    throw new Error(formatMf5FormErrors(errors));
  }
}

/**
 * Constrói dados de entidade com NIF validado localmente.
 *
 * @param form - Dados do formulário de entidade.
 * @returns Corpo pronto para submissão.
 */
function parseBusinessEntityForm(form: FormData) {
  assertMf5DedicatedForm(form, ["nif"]);

  return {
    name: String(form.get("name") ?? ""),
    nif: String(form.get("nif") ?? ""),
    email: String(form.get("email") ?? ""),
  };
}

/**
 * Constrói dados de conta bancária com IBAN validado localmente.
 *
 * @param form - Dados do formulário bancário.
 * @returns Corpo pronto para submissão.
 */
function parseBankAccountForm(form: FormData) {
  assertMf5DedicatedForm(form, ["iban"]);

  return {
    name: String(form.get("name") ?? ""),
    iban: String(form.get("iban") ?? ""),
  };
}

/**
 * Constrói dados de lançamento/tarefa com data e conta SNC validadas localmente.
 *
 * @param form - Dados do formulário contabilístico ou operacional.
 * @returns Corpo pronto para submissão.
 */
function parseAccountingOperationForm(form: FormData) {
  assertMf5DedicatedForm(form, ["entryDate", "accountCode"]);

  return {
    entryDate: String(form.get("entryDate") ?? ""),
    accountCode: String(form.get("accountCode") ?? ""),
    description: String(form.get("description") ?? ""),
  };
}
```

5. Explicação do código.

O padrão é igual em todos os módulos: valida antes de construir o pedido e lança `Error` para o feedback comum capturar. Cada formulário declara a sua lista de campos críticos, evitando regras escondidas por nome parecido.

6. Validação do passo.

Testa NIF com letras, IBAN com prefixo errado, data impossível e conta SNC com letras. Todos devem falhar antes da chamada à API.

7. Cenário negativo/erro esperado.

Um formulário sem campo IBAN não deve tentar validar IBAN. A lista de campos passada ao validador tem de refletir o formulário real.

### Passo 7 - Criar smoke textual próprio para RNF05

1. Objetivo funcional do passo no contexto da app.

Dar ao aluno e à defesa um comando objetivo para provar que os contratos principais deste BK existem.

2. Ficheiros envolvidos:
    - CRIAR: `real_dev/web/scripts/check-mf5-form-validation.mjs`
    - EDITAR: `real_dev/web/package.json`

3. Instruções do que fazer.

Cria o script completo e adiciona o comando `test:mf5:forms` aos scripts do `package.json`.

4. Código completo, correto e integrado com a app final.

```js
/**
 * @file Smoke textual para contratos de validação de formulários MF5.
 */

import { readFile } from "node:fs/promises";

const files = {
  validators: new URL("../src/lib/mf5FormValidators.ts", import.meta.url),
  app: new URL("../src/App.tsx", import.meta.url),
  mf1: new URL("../src/pages/mf1Pages.tsx", import.meta.url),
  packageJson: new URL("../package.json", import.meta.url),
};

/**
 * Falha o smoke quando uma evidência textual crítica não existe.
 *
 * @param source - Conteúdo do ficheiro analisado.
 * @param expected - Texto que deve existir.
 * @param description - Explicação do contrato verificado.
 */
function assertIncludes(source, expected, description) {
  if (!source.includes(expected)) {
    throw new Error(`MF5 forms em falta: ${description}`);
  }
}

const [validators, app, mf1, packageJson] = await Promise.all(
  Object.values(files).map((fileUrl) => readFile(fileUrl, "utf8")),
);

assertIncludes(validators, "validatePortugueseIban", "validação de IBAN português");
assertIncludes(validators, "toISOString().slice(0, 10)", "datas usam roundtrip ISO");
assertIncludes(validators, "validateVatBps", "IVA técnico separado de percentagem visual");
assertIncludes(validators, "validateKnownId", "identificadores validados como seleção");
assertIncludes(validators, "validateMf5FormData", "formulários dedicados conseguem usar FormData");
assertIncludes(app, "validateMf5Form", "OperationForm valida antes da API");
assertIncludes(app, "new Error(formatMf5FormErrors", "feedback recebe Error");
assertIncludes(mf1, "validateMf5FormData", "MF1 valida datas e IVA antes da API");
assertIncludes(packageJson, "\"test:mf5:forms\"", "package expõe comando RNF05");

console.log("MF5 form validation smoke OK");
```

Atualiza `real_dev/web/package.json` mantendo os scripts existentes:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test:mf1": "node scripts/check-mf1-contracts.mjs",
    "test:mf2": "node scripts/check-mf2-workflows.mjs",
    "test:mf3": "node scripts/check-mf3-evidence.mjs",
    "test:mf5:forms": "node scripts/check-mf5-form-validation.mjs",
    "typecheck": "tsc --noEmit"
  }
}
```

5. Explicação do código.

O smoke não substitui testes unitários nem validação manual. Ele confirma rapidamente que o ficheiro de validadores existe, que datas usam roundtrip ISO, que IVA não é validado por regra única e que o `OperationForm` consome mensagens como `Error`.

6. Validação do passo.

Executa `cd real_dev/web && npm run test:mf5:forms`. O output esperado é `MF5 form validation smoke OK`.

7. Cenário negativo/erro esperado.

Se alguém trocar o roundtrip ISO por `Date.parse`, o smoke deve falhar por falta de `toISOString().slice(0, 10)`.

### Passo 8 - Executar validação final e preparar evidence

1. Objetivo funcional do passo no contexto da app.

Fechar o BK com provas reproduzíveis e handoff claro para `BK-MF5-06`.

2. Ficheiros envolvidos:
    - VALIDAR: `real_dev/web`
    - REGISTAR: PR ou relatório de defesa PAP

3. Instruções do que fazer.

Executa typecheck, smoke novo e cenários manuais positivos/negativos. Guarda outputs relevantes.

4. Código completo, correto e integrado com a app final.

```bash
cd real_dev/web
npm run typecheck
npm run test:mf5:forms
```

5. Explicação do código.

`typecheck` confirma integração TypeScript. `test:mf5:forms` confirma contratos textuais do BK. Os cenários manuais provam comportamento visível ao utilizador.

6. Validação do passo.

Regista:
- output de `npm run typecheck`;
- output de `npm run test:mf5:forms`;
- screenshot de erro local para NIF inválido;
- screenshot de submissão válida;
- nota de que a API continua a rejeitar dados inválidos.

7. Cenário negativo/erro esperado.

Se o smoke passar mas o browser ainda enviar uma data impossível para a API, a integração do formulário concreto ficou incompleta.

#### Critérios de aceite

- Negativos: minimo `8`.
- `RNF05` fica coberto por validadores frontend explícitos e por integração antes da chamada à API.
- NIF inválido é bloqueado antes da submissão.
- IBAN português inválido é bloqueado antes da submissão.
- Datas impossíveis como `2026-02-30` são rejeitadas por roundtrip ISO.
- `vatRateId`, `vatRateBps` e `vatRatePercent` são tratados como contratos diferentes.
- Conta SNC com letras é bloqueada antes da submissão.
- O contrato `action.fail(error: Error, fallback?)` dos BKs anteriores é respeitado.
- `real_dev/web/package.json` expõe `test:mf5:forms`.
- Nenhuma validação backend existente é removida.
- Nenhum endpoint, schema, service ou modelo Prisma novo é criado.

#### Validação final

- Executar `cd real_dev/web && npm run typecheck`.
- Executar `cd real_dev/web && npm run test:mf5:forms`.
- Testar NIF inválido e confirmar que não há chamada à API.
- Testar IBAN inválido e confirmar mensagem local.
- Testar `issuedAt=2026-02-30` e confirmar rejeição local.
- Testar `vatRateBps=2300` e confirmar que é aceite pelo validador frontend.
- Testar `vatRatePercent=120` e confirmar erro local.
- Testar `accountCode=ABC` e confirmar erro local.

#### Evidence para PR/defesa

- Output de `npm run typecheck`.
- Output de `npm run test:mf5:forms`.
- Screenshot ou gravação curta de NIF inválido bloqueado localmente.
- Screenshot ou gravação curta de formulário válido submetido.
- Lista de ficheiros alterados.
- Nota explícita de que validação frontend não substitui validação backend.

#### Handoff

- Proximo BK recomendado: `BK-MF5-06`
- Próximo BK: `BK-MF5-06`.
- `BK-MF5-06` deve reutilizar as mensagens emitidas por `formatMf5FormErrors`.
- Se forem adicionados novos campos críticos, atualiza os `Set` em `mf5FormValidators.ts`.
- Se uma regra depender de permissões, período fiscal, ownership ou empresa ativa da sessão, mantém a decisão no backend.
- Não avances para mensagens finais de erro sem garantir que os validadores devolvem mensagens consistentes.

#### Changelog

- `2026-06-20`: corrige o guia para 8 passos, datas ISO estritas, IVA por contrato explícito, integração compatível com `action.fail(error: Error)` e smoke `test:mf5:forms`.
- `2026-06-18`: documenta validação frontend de formatos críticos sem substituir a autoridade do backend.
- `2026-04-17`: guia migrado para naming com slug e template pedagógico-operacional inicial.
