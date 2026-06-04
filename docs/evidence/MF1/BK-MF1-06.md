### Passo 1

* BK: BK-MF1-06
* Macrofase: MF1
* Requisito funcional: RF18
* Dependência: BK-MF0-03, BK-MF1-02
* Próximo BK: BK-MF1-07
* Endpoint previsto: /api/sales/documents/:id/approval

### Passo 2
Foi necessário garantir a presença do modelo `AuditLog`, porque o BK-MF1-06 reutiliza auditoria para submissão, aprovação e rejeição de documentos de venda, conforme o guia. O modelo não foi duplicado; foi apenas mantido no schema para suportar as operações do service.

### Passo 3
Objetivo
Disponibilizar a operação de aprovação de documentos de venda ao utilizador através da camada frontend, mantendo chamadas tipadas e mensagens de erro controladas.

Ficheiros alterados
- `apps/web/src/lib/apiClient.ts`
- `apps/web/src/lib/saleApprovalApi.ts`
- `apps/web/src/pages/SaleApprovalPage.tsx`

Implementação realizada
Foi criada a integração frontend para o fluxo de aprovação de vendas.
O ficheiro `apiClient.ts` existente não foi substituído. Foi apenas estendido com o domínio `saleApproval`, mantendo o cliente HTTP único da aplicação, a autenticação por cookie `HttpOnly` e o tratamento centralizado de erros.
Foi criado o ficheiro `saleApprovalApi.ts`, que expõe funções tipadas para submeter, aprovar e rejeitar documentos de venda.
Foi criada a página `SaleApprovalPage.tsx`, com formulário mínimo, estados de carregamento, sucesso e erro.

Nota de integração
A UI não decide estados nem regras de aprovação. O frontend envia apenas a ação pretendida e, no caso de rejeição, o motivo. O backend valida estado, permissões, segregação de funções e auditoria.

Comandos a executar
```bash
npm --prefix apps/api run test:unit
npm --prefix apps/web run typecheck
npm --prefix apps/web run build

### Passo 4 
- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:unit

> @opsa/api@1.0.0 test:unit
> node --test tests/unit/*.test.js

✔ BK01: login aceita password curta e deixa a autenticação decidir credenciais inválidas (11.6659ms)
✔ BK01: registo mantém política de password forte (2.44ms)
✔ BK06: perfil da empresa assume EUR quando currency é omitida (1.313ms)
✔ BK06: perfil da empresa rejeita dia fiscal impossível (0.6956ms)
✔ BK07: importação vazia é rejeitada (0.8299ms)
✔ BK10: fornecedor aceita NIF vazio e valida quando preenchido (1.1497ms)
✔ BK08: período fiscal rejeita datas normalizadas pelo JavaScript (1.5633ms)
✔ BK01: rate limit de autenticação bloqueia excesso e exige store em produção (1.3073ms)
✔ BK02: permissões de escrita seguem os atores documentados na MF0 (0.9665ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 982.9915

- PS D:\PAP\edu-PAP-3ig-opsa-2526> npm --prefix apps/api run test:contracts

> @opsa/api@1.0.0 test:contracts
> node --test tests/contracts/*.test.js

✔ BK01: resolveSession não propaga passwordHash na sessão nem no utilizador público (5.1395ms)
✔ BK04/BK05: adapters mock não registam tokens, URLs secretas ou email completo (2.2788ms)
✔ BK05: rate limit em memória falha explicitamente em produção sem opt-in (4.2933ms)
✔ BK06: conflito de NIF é mapeado para NIF_ALREADY_EXISTS (2.3924ms)
✔ BK09/BK10: pesquisa usa nome ou NIF sem alterar listagem base (4.0907ms)
✔ BK12: nome de armazém duplicado é rejeitado (0.9622ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1686.4198

### Passo 6

Objetivo
Fechar o BK-MF1-06

Evidência preparada
A evidência do BK regista:
- ficheiros alterados;
- comandos executados;
- resultados obtidos;
- matriz de estados;
- decisões registradas;.

Matriz de estados
- `DRAFT` -> pode ser submetido.
- `SUBMITTED` -> pode ser aprovado ou rejeitado.
- `APPROVED` -> pode ser emitido definitivamente.
- `REJECTED` -> mantém motivo de rejeição.
- `ISSUED` / `SETTLED` -> estados finais de emissão.

Decisões registadas
- A emissão definitiva passa a exigir estado `APPROVED`.
- A submissão só é permitida para documentos em `DRAFT`.
- A aprovação só é permitida para documentos em `SUBMITTED`.
- A rejeição só é permitida para documentos em `SUBMITTED`.
- A rejeição exige motivo.
- O mesmo utilizador que submeteu não pode aprovar nem rejeitar o documento.
- As ações de submissão, aprovação e rejeição são registadas em `AuditLog`.
- O `companyId` vem sempre do contexto autenticado.
- O frontend não decide regras de workflow; apenas chama os endpoints.

Comandos executados
```bash
npm --prefix apps/api run test:unit
npm --prefix apps/api run test:contracts

apps/api/src/server.js
apps/api/src/modules/sales-approval/saleApprovalRoutes.js
apps/api/src/modules/sales-approval/saleApprovalService.js
apps/api/src/modules/sales/saleDocumentService.js
apps/api/prisma/schema.prisma
apps/web/src/lib/saleApprovalApi.ts
apps/web/src/pages/SaleApprovalPage.tsx
apps/api/src/modules/sales-approval/saleApprovalService.test.js