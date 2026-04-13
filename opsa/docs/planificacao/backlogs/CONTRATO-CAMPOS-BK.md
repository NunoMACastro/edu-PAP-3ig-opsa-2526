# CONTRATO-CAMPOS-BK

## Header
- `doc_id`: `CONTRATO-CAMPOS-BK`
- `path`: `docs/planificacao/backlogs/CONTRATO-CAMPOS-BK.md`
- `area`: `project`
- `owner`: `Nuno`
- `status`: `ativo`
- `last_updated`: `2026-04-13`

## Objetivo
Formalizar os campos obrigatorios por BK para manter coerencia entre `MATRIZ-CANONICA-BK`, `BACKLOG-MVP`, `PLANO-SPRINTS` e `guias-bk`.

## Campos obrigatorios
- `bk_id`: identificador unico do backlog item.
- `mf`: macro funcional (`MF0..MF8`).
- `sprint`: janela de sprints onde o BK deve ser executado.
- `owner`: responsavel principal pelo BK.
- `rf_rnf[]`: requisitos RF/RNF cobertos pelo BK.
- `deps[]`: dependencias tecnicas explicitas.
- `guia_path`: caminho canónico do guia BK.
- `core_or_reforco`: `Reforco` para P0; `Core` para P1/P2.

## Regras de consistencia
1. `bk_id` deve existir simultaneamente na matriz, backlog e guia correspondente.
2. `owner`, `rf_rnf[]` e `deps[]` devem ser iguais entre matriz e backlog.
3. `guia_path` deve apontar para um ficheiro existente.
4. `core_or_reforco` e derivado da prioridade (`P0=Reforco`; `P1/P2=Core`).
5. Alteracoes em RF/RNF ou BK obrigam regeneracao dos anexos no mesmo commit.

## Matriz canónica de campos BK
| bk_id | mf | sprint | owner | rf_rnf[] | deps[] | guia_path | core_or_reforco |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BK-MF0-01 | MF0 | S01-S02 | Oleksii | RF01 | - | docs/planificacao/guias-bk/MF0/BK-MF0-01.md | Reforco |
| BK-MF0-02 | MF0 | S01-S02 | Oleksii | RF02 | BK-MF0-01 | docs/planificacao/guias-bk/MF0/BK-MF0-02.md | Reforco |
| BK-MF0-03 | MF0 | S01-S02 | Oleksii | RF03 | BK-MF0-02 | docs/planificacao/guias-bk/MF0/BK-MF0-03.md | Reforco |
| BK-MF0-04 | MF0 | S01-S02 | Oleksii | RF04 | BK-MF0-03 | docs/planificacao/guias-bk/MF0/BK-MF0-04.md | Reforco |
| BK-MF0-05 | MF0 | S01-S02 | Oleksii | RF05 | - | docs/planificacao/guias-bk/MF0/BK-MF0-05.md | Reforco |
| BK-MF0-06 | MF0 | S01-S02 | Oleksii | RF06 | - | docs/planificacao/guias-bk/MF0/BK-MF0-06.md | Reforco |
| BK-MF0-07 | MF0 | S01-S02 | Oleksii | RF07 | - | docs/planificacao/guias-bk/MF0/BK-MF0-07.md | Reforco |
| BK-MF0-08 | MF0 | S01-S02 | Oleksii | RF08 | BK-MF0-07 | docs/planificacao/guias-bk/MF0/BK-MF0-08.md | Reforco |
| BK-MF0-09 | MF0 | S01-S02 | Oleksii | RF09 | - | docs/planificacao/guias-bk/MF0/BK-MF0-09.md | Reforco |
| BK-MF0-10 | MF0 | S01-S02 | Oleksii | RF10 | - | docs/planificacao/guias-bk/MF0/BK-MF0-10.md | Reforco |
| BK-MF0-11 | MF0 | S01-S02 | Oleksii | RF11 | - | docs/planificacao/guias-bk/MF0/BK-MF0-11.md | Reforco |
| BK-MF0-12 | MF0 | S01-S02 | Oleksii | RF12 | - | docs/planificacao/guias-bk/MF0/BK-MF0-12.md | Core |
| BK-MF1-01 | MF1 | S03-S04 | Oleksii | RF13 | - | docs/planificacao/guias-bk/MF1/BK-MF1-01.md | Reforco |
| BK-MF1-02 | MF1 | S03-S04 | Andre | RF14 | BK-MF0-09, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-02.md | Reforco |
| BK-MF1-03 | MF1 | S03-S04 | Pedro | RF15 | - | docs/planificacao/guias-bk/MF1/BK-MF1-03.md | Reforco |
| BK-MF1-04 | MF1 | S03-S04 | Oleksii | RF16 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-04.md | Reforco |
| BK-MF1-05 | MF1 | S03-S04 | Oleksii | RF17 | - | docs/planificacao/guias-bk/MF1/BK-MF1-05.md | Core |
| BK-MF1-06 | MF1 | S03-S04 | Andre | RF18 | BK-MF1-02 | docs/planificacao/guias-bk/MF1/BK-MF1-06.md | Core |
| BK-MF1-07 | MF1 | S03-S04 | Oleksii | RF19 | BK-MF1-06 | docs/planificacao/guias-bk/MF1/BK-MF1-07.md | Core |
| BK-MF1-08 | MF1 | S03-S04 | Oleksii | RF20 | BK-MF1-06 | docs/planificacao/guias-bk/MF1/BK-MF1-08.md | Core |
| BK-MF1-09 | MF1 | S03-S04 | Andre | RF21 | BK-MF0-10, BK-MF0-11, BK-MF1-01 | docs/planificacao/guias-bk/MF1/BK-MF1-09.md | Reforco |
| BK-MF1-10 | MF1 | S03-S04 | Pedro | RF22 | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-10.md | Reforco |
| BK-MF1-11 | MF1 | S03-S04 | Oleksii | RF23 | BK-MF1-09 | docs/planificacao/guias-bk/MF1/BK-MF1-11.md | Reforco |
| BK-MF1-12 | MF1 | S03-S04 | Andre | RF24 | - | docs/planificacao/guias-bk/MF1/BK-MF1-12.md | Core |
| BK-MF2-01 | MF2 | S04-S06 | Pedro | RF25 | BK-MF1-12 | docs/planificacao/guias-bk/MF2/BK-MF2-01.md | Core |
| BK-MF2-02 | MF2 | S04-S06 | Oleksii | RF26 | BK-MF1-12 | docs/planificacao/guias-bk/MF2/BK-MF2-02.md | Core |
| BK-MF2-03 | MF2 | S04-S06 | Andre | RF27 | BK-MF0-11, BK-MF0-12 | docs/planificacao/guias-bk/MF2/BK-MF2-03.md | Reforco |
| BK-MF2-04 | MF2 | S04-S06 | Pedro | RF28 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-04.md | Reforco |
| BK-MF2-05 | MF2 | S04-S06 | Andre | RF29 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-05.md | Core |
| BK-MF2-06 | MF2 | S04-S06 | Pedro | RF30 | BK-MF2-03 | docs/planificacao/guias-bk/MF2/BK-MF2-06.md | Core |
| BK-MF2-07 | MF2 | S04-S06 | Oleksii | RF31 | BK-MF0-07 | docs/planificacao/guias-bk/MF2/BK-MF2-07.md | Core |
| BK-MF2-08 | MF2 | S04-S06 | Andre | RF32 | BK-MF2-07 | docs/planificacao/guias-bk/MF2/BK-MF2-08.md | Core |
| BK-MF2-09 | MF2 | S04-S06 | Pedro | RF33 | BK-MF2-08 | docs/planificacao/guias-bk/MF2/BK-MF2-09.md | Core |
| BK-MF2-10 | MF2 | S04-S06 | Oleksii | RF34 | BK-MF0-07 | docs/planificacao/guias-bk/MF2/BK-MF2-10.md | Reforco |
| BK-MF2-11 | MF2 | S04-S06 | Andre | RF35 | BK-MF2-10 | docs/planificacao/guias-bk/MF2/BK-MF2-11.md | Reforco |
| BK-MF2-12 | MF2 | S04-S06 | Pedro | RF36 | BK-MF2-11 | docs/planificacao/guias-bk/MF2/BK-MF2-12.md | Reforco |
| BK-MF3-01 | MF3 | S06-S08 | Oleksii | RF37 | BK-MF1-04, BK-MF1-11 | docs/planificacao/guias-bk/MF3/BK-MF3-01.md | Reforco |
| BK-MF3-02 | MF3 | S06-S08 | Andre | RF38 | - | docs/planificacao/guias-bk/MF3/BK-MF3-02.md | Reforco |
| BK-MF3-03 | MF3 | S06-S08 | Pedro | RF39 | BK-MF3-02, BK-MF1-02, BK-MF1-09 | docs/planificacao/guias-bk/MF3/BK-MF3-03.md | Reforco |
| BK-MF3-04 | MF3 | S06-S08 | Oleksii | RF40 | BK-MF1-03, BK-MF1-10 | docs/planificacao/guias-bk/MF3/BK-MF3-04.md | Core |
| BK-MF3-05 | MF3 | S06-S08 | Andre | RF41 | BK-MF1-09 | docs/planificacao/guias-bk/MF3/BK-MF3-05.md | Core |
| BK-MF3-06 | MF3 | S06-S08 | Pedro | RF42 | - | docs/planificacao/guias-bk/MF3/BK-MF3-06.md | Core |
| BK-MF3-07 | MF3 | S06-S08 | Oleksii | RF43 | - | docs/planificacao/guias-bk/MF3/BK-MF3-07.md | Reforco |
| BK-MF3-08 | MF3 | S06-S08 | Andre | RF44 | - | docs/planificacao/guias-bk/MF3/BK-MF3-08.md | Core |
| BK-MF3-09 | MF3 | S06-S08 | Oleksii | RF45 | BK-MF2-07 | docs/planificacao/guias-bk/MF3/BK-MF3-09.md | Core |
| BK-MF3-10 | MF3 | S06-S08 | Andre | RF46 | BK-MF1-02, BK-MF1-09, BK-MF2-03 | docs/planificacao/guias-bk/MF3/BK-MF3-10.md | Reforco |
| BK-MF3-11 | MF3 | S06-S08 | Andre | RF47 | BK-MF3-10 | docs/planificacao/guias-bk/MF3/BK-MF3-11.md | Core |
| BK-MF3-12 | MF3 | S06-S08 | Pedro | RF48 | BK-MF3-10 | docs/planificacao/guias-bk/MF3/BK-MF3-12.md | Core |
| BK-MF4-01 | MF4 | S08-S09 | Pedro | RF49 | BK-MF3-10 | docs/planificacao/guias-bk/MF4/BK-MF4-01.md | Reforco |
| BK-MF4-02 | MF4 | S08-S09 | Oleksii | RF50 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-02.md | Core |
| BK-MF4-03 | MF4 | S08-S09 | Andre | RF51 | BK-MF3-10 | docs/planificacao/guias-bk/MF4/BK-MF4-03.md | Core |
| BK-MF4-04 | MF4 | S08-S09 | Pedro | RF52 | BK-MF3-04, BK-MF2-06 | docs/planificacao/guias-bk/MF4/BK-MF4-04.md | Core |
| BK-MF4-05 | MF4 | S08-S09 | Oleksii | RF53 | BK-MF4-01 | docs/planificacao/guias-bk/MF4/BK-MF4-05.md | Reforco |
| BK-MF4-06 | MF4 | S08-S09 | Oleksii | RF54 | - | docs/planificacao/guias-bk/MF4/BK-MF4-06.md | Core |
| BK-MF4-07 | MF4 | S08-S09 | Andre | RF55 | - | docs/planificacao/guias-bk/MF4/BK-MF4-07.md | Core |
| BK-MF4-08 | MF4 | S08-S09 | Pedro | RF56 | BK-MF4-06, BK-MF4-04 | docs/planificacao/guias-bk/MF4/BK-MF4-08.md | Core |
| BK-MF4-09 | MF4 | S08-S09 | Andre | RF57 | - | docs/planificacao/guias-bk/MF4/BK-MF4-09.md | Reforco |
| BK-MF4-10 | MF4 | S08-S09 | Pedro | RF58 | - | docs/planificacao/guias-bk/MF4/BK-MF4-10.md | Reforco |
| BK-MF4-11 | MF4 | S08-S09 | Oleksii | RF59 | BK-MF0-08 | docs/planificacao/guias-bk/MF4/BK-MF4-11.md | Core |
| BK-MF4-12 | MF4 | S08-S09 | Andre | RF60 | BK-MF1-09, BK-MF2-06 | docs/planificacao/guias-bk/MF4/BK-MF4-12.md | Core |
| BK-MF5-01 | MF5 | S09-S10 | Pedro | RF61 | BK-MF4-12 | docs/planificacao/guias-bk/MF5/BK-MF5-01.md | Core |
| BK-MF5-02 | MF5 | S09-S10 | Sofia | RF62 | BK-MF4-12 | docs/planificacao/guias-bk/MF5/BK-MF5-02.md | Core |
| BK-MF5-03 | MF5 | S09-S10 | Oleksii | RF63 | BK-MF3-03 | docs/planificacao/guias-bk/MF5/BK-MF5-03.md | Core |
| BK-MF5-04 | MF5 | S09-S10 | Andre | RF64 | BK-MF3-02 | docs/planificacao/guias-bk/MF5/BK-MF5-04.md | Core |
| BK-MF5-05 | MF5 | S09-S10 | Oleksii | RNF01 | - | docs/planificacao/guias-bk/MF5/BK-MF5-05.md | Reforco |
| BK-MF5-06 | MF5 | S09-S10 | Andre | RNF02 | - | docs/planificacao/guias-bk/MF5/BK-MF5-06.md | Reforco |
| BK-MF5-07 | MF5 | S09-S10 | Pedro | RNF03 | - | docs/planificacao/guias-bk/MF5/BK-MF5-07.md | Reforco |
| BK-MF5-08 | MF5 | S09-S10 | Pedro | RNF04 | - | docs/planificacao/guias-bk/MF5/BK-MF5-08.md | Core |
| BK-MF5-09 | MF5 | S09-S10 | Oleksii | RNF05 | - | docs/planificacao/guias-bk/MF5/BK-MF5-09.md | Reforco |
| BK-MF5-10 | MF5 | S09-S10 | Andre | RNF06 | - | docs/planificacao/guias-bk/MF5/BK-MF5-10.md | Reforco |
| BK-MF5-11 | MF5 | S09-S10 | Pedro | RNF07 | - | docs/planificacao/guias-bk/MF5/BK-MF5-11.md | Reforco |
| BK-MF6-01 | MF6 | S10-S11 | Oleksii | RNF08 | - | docs/planificacao/guias-bk/MF6/BK-MF6-01.md | Reforco |
| BK-MF6-02 | MF6 | S10-S11 | Sofia | RNF09 | - | docs/planificacao/guias-bk/MF6/BK-MF6-02.md | Core |
| BK-MF6-03 | MF6 | S10-S11 | Oleksii | RNF10 | - | docs/planificacao/guias-bk/MF6/BK-MF6-03.md | Core |
| BK-MF6-04 | MF6 | S10-S11 | Andre | RNF11 | - | docs/planificacao/guias-bk/MF6/BK-MF6-04.md | Core |
| BK-MF6-05 | MF6 | S10-S11 | Pedro | RNF12 | - | docs/planificacao/guias-bk/MF6/BK-MF6-05.md | Core |
| BK-MF6-06 | MF6 | S10-S11 | Andre | RNF13 | - | docs/planificacao/guias-bk/MF6/BK-MF6-06.md | Reforco |
| BK-MF6-07 | MF6 | S10-S11 | Pedro | RNF14 | - | docs/planificacao/guias-bk/MF6/BK-MF6-07.md | Reforco |
| BK-MF6-08 | MF6 | S10-S11 | Oleksii | RNF15 | - | docs/planificacao/guias-bk/MF6/BK-MF6-08.md | Reforco |
| BK-MF6-09 | MF6 | S10-S11 | Andre | RNF16 | - | docs/planificacao/guias-bk/MF6/BK-MF6-09.md | Reforco |
| BK-MF6-10 | MF6 | S10-S11 | Pedro | RNF17 | - | docs/planificacao/guias-bk/MF6/BK-MF6-10.md | Reforco |
| BK-MF6-11 | MF6 | S10-S11 | Oleksii | RNF18 | - | docs/planificacao/guias-bk/MF6/BK-MF6-11.md | Reforco |
| BK-MF7-01 | MF7 | S11-S12 | Pedro | RNF19 | - | docs/planificacao/guias-bk/MF7/BK-MF7-01.md | Core |
| BK-MF7-02 | MF7 | S11-S12 | Andre | RNF20 | - | docs/planificacao/guias-bk/MF7/BK-MF7-02.md | Reforco |
| BK-MF7-03 | MF7 | S11-S12 | Pedro | RNF21 | - | docs/planificacao/guias-bk/MF7/BK-MF7-03.md | Reforco |
| BK-MF7-04 | MF7 | S11-S12 | Sofia | RNF22 | - | docs/planificacao/guias-bk/MF7/BK-MF7-04.md | Reforco |
| BK-MF7-05 | MF7 | S11-S12 | Sofia | RNF23 | - | docs/planificacao/guias-bk/MF7/BK-MF7-05.md | Core |
| BK-MF7-06 | MF7 | S11-S12 | Oleksii | RNF24 | - | docs/planificacao/guias-bk/MF7/BK-MF7-06.md | Reforco |
| BK-MF7-07 | MF7 | S11-S12 | Andre | RNF25 | - | docs/planificacao/guias-bk/MF7/BK-MF7-07.md | Reforco |
| BK-MF7-08 | MF7 | S11-S12 | Oleksii | RNF26 | - | docs/planificacao/guias-bk/MF7/BK-MF7-08.md | Core |
| BK-MF7-09 | MF7 | S11-S12 | Pedro | RNF27 | - | docs/planificacao/guias-bk/MF7/BK-MF7-09.md | Reforco |
| BK-MF7-10 | MF7 | S11-S12 | Sofia | RNF28 | - | docs/planificacao/guias-bk/MF7/BK-MF7-10.md | Reforco |
| BK-MF7-11 | MF7 | S11-S12 | Andre | RNF29 | - | docs/planificacao/guias-bk/MF7/BK-MF7-11.md | Core |
| BK-MF8-01 | MF8 | S12 | Oleksii | RNF30 | - | docs/planificacao/guias-bk/MF8/BK-MF8-01.md | Reforco |
| BK-MF8-02 | MF8 | S12 | Pedro | RNF31 | - | docs/planificacao/guias-bk/MF8/BK-MF8-02.md | Core |
| BK-MF8-03 | MF8 | S12 | Sofia | RNF32 | - | docs/planificacao/guias-bk/MF8/BK-MF8-03.md | Core |
| BK-MF8-04 | MF8 | S12 | Oleksii | RNF33 | - | docs/planificacao/guias-bk/MF8/BK-MF8-04.md | Core |
| BK-MF8-05 | MF8 | S12 | Andre | RNF34 | - | docs/planificacao/guias-bk/MF8/BK-MF8-05.md | Reforco |
| BK-MF8-06 | MF8 | S12 | Pedro | RNF35 | - | docs/planificacao/guias-bk/MF8/BK-MF8-06.md | Reforco |
| BK-MF8-07 | MF8 | S12 | Andre | RNF36 | - | docs/planificacao/guias-bk/MF8/BK-MF8-07.md | Core |
| BK-MF8-08 | MF8 | S12 | Pedro | RNF37 | - | docs/planificacao/guias-bk/MF8/BK-MF8-08.md | Core |
| BK-MF8-09 | MF8 | S12 | Sofia | RNF38 | - | docs/planificacao/guias-bk/MF8/BK-MF8-09.md | Reforco |
| BK-MF8-10 | MF8 | S12 | Sofia | RNF39 | - | docs/planificacao/guias-bk/MF8/BK-MF8-10.md | Core |
| BK-MF8-11 | MF8 | S12 | Sofia | RNF40 | - | docs/planificacao/guias-bk/MF8/BK-MF8-11.md | Core |

## Changelog
- `2026-04-13`: Contrato de campos BK formalizado com regra de derivacao Core/Reforco.
