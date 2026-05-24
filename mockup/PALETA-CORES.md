# Paleta de Cores OPSA

## Cores Principais

| Cor                | Código  | Propósito                  | Uso na Aplicação                           |
| ------------------ | ------- | -------------------------- | ------------------------------------------ |
| Royal Green        | #004E53 | Principal                  | Sidebar, títulos, texto principal, ícones  |
| Royal Green Light  | #00CB73 | Fundo & destaque           | Botão ativo, gráficos, elementos positivos |
| Royal Green Liquid | #009889 | Elementos do fundo         | Botões secundários, badges, hover states   |
| Amarelo            | #FAF227 | Botões primários           | Botões de ação principal, call-to-actions  |
| Creme              | #D6D580 | Texto (reserva)            | Texto alternativo (não usado atualmente)   |
| Vermelho           | #FF1900 | Alertas                    | Erros, alertas críticos, valores negativos |
| Verde              | #04FF00 | Sucesso                    | Estados de sucesso, confirmações           |
| Dourado            | #FFCB16 | Avisos/Sucesso com alerta  | Avisos, pendências, estados intermédios    |

## Aplicação das Cores

### 1. Layout Principal

**Fundo Geral**
- Fundo da aplicação: Preto (#000000)

**Sidebar (Menu Lateral)**
- Fundo: Royal Green (#004E53)
- Texto: Branco (#FFFFFF)
- Botão ativo: Royal Green Light (#00CB73) com texto Royal Green
- Hover: Royal Green Liquid (#009889)
- Logo "OPSA": Branco (#FFFFFF)
- Tamanhos: Logo 2xl, Ícones 22px, Texto base

**Header (Cabeçalho)**
- Fundo: Branco
- Título do módulo: Royal Green (#004E53) - text-xl
- Subtítulo/utilizador: Royal Green Liquid (#009889) - text-base
- **Botão de Língua (PT)**: Royal Green (#004E53) com fundo suave
  - Ícone: Languages (lucide-react)
  - Localização: Canto superior direito
  - Hover: Royal Green (#004E53) a 20% opacidade

### 2. Botões

**Primário** (Ações principais)
- Fundo: Amarelo (#FAF227)
- Texto: Royal Green (#004E53)
- Hover: Dourado (#FFCB16)

**Secundário**
- Fundo: Royal Green Liquid (#009889)
- Texto: Branco (#FFFFFF)
- Hover: Royal Green Light (#00CB73)

**Danger** (Ações destrutivas)
- Fundo: Vermelho (#FF1900)
- Texto: Branco (#FFFFFF)
- Hover: Vermelho mais escuro (#cc1400)

**Ghost** (Botões transparentes)
- Fundo: Transparente
- Texto: Royal Green (#004E53)
- Hover: Cinza claro (#f0f0f0)

### 3. Estados e Badges

**Sucesso**
- Fundo: Verde (#04FF00) a 20% opacidade
- Texto: Royal Green (#004E53)
- Borda: Verde (#04FF00)
- Exemplos: "Paga", "Aprovado", "Reconciliado", "Ativo"

**Alerta/Erro**
- Fundo: Vermelho (#FF1900) a 20% opacidade
- Texto: Vermelho (#FF1900)
- Borda: Vermelho (#FF1900)
- Exemplos: "Vencida", "Ruptura", "Erro"

**Aviso/Pendente**
- Fundo: Dourado (#FFCB16) a 20% opacidade
- Texto: Royal Green (#004E53)
- Borda: Dourado (#FFCB16)
- Exemplos: "Aberta", "Pendente", "Stock Baixo"

**Informação**
- Fundo: Royal Green Liquid (#009889) a 20% opacidade
- Texto: Royal Green (#004E53)
- Borda: Royal Green Liquid (#009889)
- Exemplos: "Lançado", "Bancária", "Caixa"

### 4. Formulários

**Inputs**
- Borda: Royal Green (#004E53) a 30% opacidade
- Focus: Royal Green (#004E53) com ring
- Erro: Vermelho (#FF1900)
- Label: Royal Green (#004E53)

**Selects**
- Mesmas cores que Inputs
- Accent: Royal Green Light (#00CB73) para checkboxes

### 5. Tabelas

**Header**
- Fundo: Royal Green (#004E53) a 5% opacidade
- Texto: Royal Green (#004E53) bold
- Borda: Royal Green (#004E53) a 20% opacidade

**Linhas**
- Hover: Royal Green Light (#00CB73) a 5% opacidade
- Texto principal: Royal Green (#004E53)
- Texto secundário: Royal Green (#004E53) a 70% opacidade
- Divisórias: Royal Green (#004E53) a 10% opacidade

### 6. Cards e Elementos

**Cards**
- Fundo: Branco (#FFFFFF)
- Borda: Royal Green (#004E53) a 10% opacidade
- Título: Royal Green (#004E53)

**KPIs e Métricas**
- Valor principal: Royal Green (#004E53) bold
- Label: Royal Green (#004E53) a 70% opacidade
- Tendência positiva: Royal Green Light (#00CB73)
- Tendência negativa: Vermelho (#FF1900)

### 7. Gráficos

**Cores para Charts**
- Principal: Royal Green Light (#00CB73)
- Secundária: Royal Green (#004E53)
- Terciária: Royal Green Liquid (#009889)
- Hover: Royal Green Liquid (#009889) mais escuro

**Previsão de Tesouraria**
- Entradas: Royal Green Light (#00CB73)
- Saídas: Vermelho (#FF1900)
- Saldo: Royal Green (#004E53)

### 8. Login

**Fundo**
- Gradiente: Royal Green Light (#00CB73) a 20% → Royal Green (#004E53) a 10%

**Card**
- Borda: Royal Green (#004E53) a 10% opacidade
- Ícone fundo: Royal Green (#004E53)
- Ícone: Branco (#FFFFFF)
- Título "OPSA": Royal Green (#004E53)
- Subtítulo: Royal Green Liquid (#009889)

## Tamanhos de Fonte

- **Fonte Base HTML**: 18px (maior que padrão)
- **Títulos Cards**: text-lg
- **KPIs Valores**: text-3xl
- **KPIs Labels**: text-base
- **Texto Tabelas**: text-base
- **Badges**: text-sm
- **Botões**: text-base
- **Inputs/Selects**: text-base
- **Menu Lateral**: text-base
- **Headers Tabelas**: text-base

## Opacidades Comuns

- **5%**: Hover states, backgrounds muito suaves
- **10%**: Bordas, separadores
- **20%**: Backgrounds de badges e estados
- **30%**: Bordas de inputs
- **70%**: Texto secundário

## Contraste e Acessibilidade

Todas as combinações de cores respeitam as guidelines WCAG 2.1:
- Texto principal sobre branco: Royal Green (#004E53) - AAA
- Botões amarelos: texto Royal Green sobre Amarelo - AA+
- Estados coloridos: sempre com borda para melhor visibilidade

## Variáveis CSS

As cores estão definidas em `/src/styles/theme.css`:

```css
--opsa-royal-green: #004E53;
--opsa-royal-green-light: #00CB73;
--opsa-royal-green-liquid: #009889;
--opsa-yellow: #FAF227;
--opsa-cream: #D6D580;
--opsa-red: #FF1900;
--opsa-green: #04FF00;
--opsa-gold: #FFCB16;
```
