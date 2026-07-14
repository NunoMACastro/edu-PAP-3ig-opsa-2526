# SAF-T PT 1.04_01 — contrato oficial

- Fonte oficial: `https://info.portaldasfinancas.gov.pt/apps/saft-pt04/saftpt1.04_01.xsd`
- Namespace: `urn:OECD:StandardAuditFile-Tax:PT_1.04_01`
- Versão declarada: `1.04_01`
- Linguagem mínima declarada: `vc:minVersion="1.1"`
- Asserções XSD 1.1 observadas: `19` elementos `xs:assert`
- Encoding declarado: `Windows-1252`
- Tamanho observado em 2026-07-09: `104696` bytes
- SHA-256 observado: `292c0ab4611e3f5a0cdf2abb4e62d9bd41254dc2e76a1fae4d35a8b132d79350`

O XSD não é duplicado neste repositório ignorado. O gate recebe o ficheiro por
`SAFT_XSD_PATH`, confirma este fingerprint e só depois executa a validação. Uma
alteração futura do XSD oficial exige revisão explícita do fingerprint e do
gerador; nunca é aceite silenciosamente.

`1.04_01` identifica a versão da estrutura SAF-T; `1.1` identifica a versão
mínima da linguagem/processador XSD necessária para avaliar as 19 asserções.
São contratos diferentes e a atestação deve declarar ambos através de campos
inequívocos (`schemaVersion` e `xsdProcessorVersion`). Uma validação parcial por
um motor XSD 1.0 não fecha o finding. O fecho exige motor XSD 1.1 e revisão
externa do conteúdo/reconciliação por contabilista.
