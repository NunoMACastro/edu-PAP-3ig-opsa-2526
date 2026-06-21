Passo 1
Campos identificados para RNF05:
NIF:
- nif
- customerNif
- supplierNif

IBAN:
- iban
- bankIban

Datas:
- issuedAt
- dueDate
- entryDate
- receivedAt
- paidAt
- fromDate
- toDate

IVA:
- vatRateId
- vatRateBps
- vatRatePercent

Contas SNC:
- accountCode
- sncAccountCode

Nota:
- vatRateId é identificador e não deve ser validado como percentagem.
- vatRateBps é unidade técnica.
- vatRatePercent é percentagem visual.
- validação frontend ajuda o utilizador, mas backend continua a ser autoridade final.

Passo 2
Contrato confirmado:

Frontend:
- valida formato óbvio;
- valida campos obrigatórios antes de submissão;
- mostra mensagem rápida;
- evita chamada desnecessária à API;
- melhora UX.

Backend:
- valida autenticação;
- valida autorização;
- resolve empresa ativa da sessão;
- valida ownership;
- aplica regras de domínio;
- decide persistência;
- mantém auditoria.

Regras confirmadas:
- este BK não remove validações backend;
- frontend não passa a ser fonte de verdade;
- permissões e empresa ativa continuam no backend;
- apiClient continua a usar cookies HttpOnly;
- validação local serve apenas como ajuda ao utilizador.

Ficheiros backend revistos:
- apps/api/src/modules/company-profile/companyProfileValidators.js
- apps/api/src/modules/treasury/bankAccountValidators.js
- validators relacionados com datas, IVA e contas SNC.

Passo 3
Ficheiros criados:
- apps/web/src/lib/mf5FormValidators.ts

Validadores criados:
- validateNif;
- validatePortugueseIban;
- validateIsoDate;
- validateVatBps;
- validateVatPercent;
- validateKnownId;
- validateSncAccount;
- validateMf5Field;
- validateMf5Form;
- validateMf5FormData;
- formatMf5FormErrors.

Regras implementadas:
- NIF deve ter 9 algarismos;
- IBAN português deve começar por PT50, ter 25 caracteres e passar mod 97;
- datas devem usar formato AAAA-MM-DD;
- datas impossíveis como 2026-02-30 são rejeitadas;
- vatRateBps deve ser inteiro entre 0 e 10000;
- vatRatePercent deve estar entre 0 e 100;
- vatRateId é validado como identificador selecionado, não como percentagem;
- conta SNC deve ter entre 2 e 8 algarismos;
- objetos e listas ficam para validação backend.

Smoke validado:
- NIF 123 devolve erro;
- IBAN PT00 devolve erro;
- data 2026-02-30 devolve erro;
- IVA técnico 23000 devolve erro;
- percentagem 120 devolve erro;
- conta ABC devolve erro;
- vatRateBps 2300 passa;
- vatRateId rate-1 passa como identificador.

Passo 4
Ficheiros editados:
- apps/web/src/App.tsx

Regras implementadas:
- OperationForm passou a usar validateMf5Form;
- valores do formulário são normalizados com toPrimitiveValidationValues;
- erros locais são formatados com formatMf5FormErrors;
- submissão é bloqueada antes da API quando há erros formais;
- action.fail recebe Error, respeitando BK-MF5-03;
- operation.run só é chamado quando validação local passa;
- operation.afterSuccess e onDone continuam preservados;
- formElement.reset continua após sucesso;
- backend continua a ser autoridade final.

Smoke validado:
- campo NIF com valor ABC gerou erro local;
- API não foi chamada quando validação local falhou;
- submissão com dados válidos continuou a funcionar.

Negativo validado:
- action.fail não recebe string simples;
- objetos e listas não são validados no frontend;
- validações backend não foram removidas.

Passo 5
Ficheiros editados:
- apps/web/src/pages/mf1Pages.tsx

Regras implementadas:
- importado validateMf5FormData;
- importado formatMf5FormErrors;
- criada função assertMf5Form;
- parseSaleDocumentForm valida issuedAt, dueDate e vatRateId antes de criar payload;
- parsePurchaseDocumentForm valida issuedAt, dueDate e vatRateId antes de criar payload;
- vatRateId é validado como identificador obrigatório, não como percentagem;
- validação local bloqueia datas impossíveis antes da chamada à API;
- backend continua a ser autoridade final.

Smoke validado:
- venda com issuedAt=2026-02-30 gerou erro local;
- compra com data impossível gerou erro local;
- venda com vatRateId preenchido não foi bloqueada como percentagem.

Negativos validados:
- compra com data impossível não chamou a API;
- vatRateId não foi tratado como vatRatePercent;
- validações backend não foram removidas.

Passo 6
Ficheiros editados:
- apps/web/src/pages/mf2Pages.tsx
- apps/web/src/pages/mf3Pages.tsx
- apps/web/src/pages/mf4Pages.tsx

Regras implementadas:
- importado validateMf5FormData onde necessário;
- importado formatMf5FormErrors onde necessário;
- criado helper assertMf5DedicatedForm nos ficheiros com formulários dedicados;
- validação aplicada apenas a campos existentes em cada formulário;
- NIF inválido é bloqueado antes da API;
- IBAN inválido é bloqueado antes da API;
- data impossível é bloqueada antes da API;
- conta SNC com letras é bloqueada antes da API;
- formulários sem IBAN não validam IBAN;
- formulários sem NIF não validam NIF;
- backend continua a ser autoridade final.

Smoke validado:
- NIF com letras devolve erro local;
- IBAN com prefixo errado devolve erro local;
- data 2026-02-30 devolve erro local;
- conta SNC ABC devolve erro local.

Negativos validados:
- formulário sem campo IBAN não tentou validar IBAN;
- formulário sem campo NIF não tentou validar NIF;
- validação local não substituiu validação backend.

Passo 7
Ficheiros criados/editados:
- criado apps/web/scripts/check-mf5-form-validation.mjs;
- editado apps/web/package.json.

Script criado:
- test:mf5:forms

Contratos verificados pelo smoke:
- validatePortugueseIban existe;
- datas usam roundtrip ISO com toISOString().slice(0, 10);
- validateVatBps existe;
- validateKnownId existe;
- validateMf5FormData existe;
- OperationForm usa validateMf5Form antes da API;
- feedback recebe new Error(formatMf5FormErrors(...));
- MF1 usa validateMf5FormData;
- package.json expõe test:mf5:forms.