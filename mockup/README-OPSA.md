# OPSA - Sistema de Gestão Empresarial com IA

## 📋 Descrição

OPSA é um ERP financeiro integrado para PME, desenvolvido como PAP no Curso Profissional de Informática de Gestão. A aplicação cobre o ciclo operacional completo de compra, stock, venda, bancos e contabilidade, com foco em conformidade legal portuguesa e governação auditável.

## 👥 Equipa

- **Alunos**: Oleksii, Pedro, Sofia, André
- **Orientadores**: Nuno Castro e Cláudia Marques
- **Ano Letivo**: 2025/2026
- **Turma**: 12º IG

## 🚀 Funcionalidades Principais

### 1. Dashboard
- KPIs executivos (Receita, Custos, Margem, Clientes)
- Resumo financeiro
- Alertas e notificações
- Gráficos de vendas mensais

### 2. Vendas (Faturação)
- Emissão de faturas com numeração sequencial
- Gestão de estados (Aberta, Paga, Vencida)
- Registo de recebimentos
- Exportação de documentos

### 3. Compras
- Registo de faturas de fornecedores
- Workflow de aprovação (Rascunho → Aprovado → Lançado)
- Gestão de pagamentos
- Controlo de estados

### 4. Inventário
- Gestão de artigos (SKU, preços, custos)
- Controlo de stock (mínimos, máximos)
- Alertas de ruptura e stock baixo
- Cálculo de margens

### 5. Contabilidade
- Lançamentos contabilísticos
- Balancete e razão
- Demonstrações financeiras (Balanço, DR)
- Conformidade com SNC

### 6. Bancos e Tesouraria
- Gestão de contas bancárias
- Reconciliação bancária
- Previsão de tesouraria
- Importação de extratos

### 7. IA & Insights
- Análise preditiva de tendências
- Alertas inteligentes
- Sugestões de ação
- Explicabilidade total (fonte dos dados)
- Perguntas em linguagem natural

### 8. Configurações
- Dados da empresa
- Gestão de períodos fiscais
- Utilizadores e permissões
- Auditoria e segurança
- Exportações SAF-T (PT)

## 🛠 Stack Tecnológica

### Frontend
- **React 18.3.1** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Vite** - Build tool
- **Lucide React** - Ícones

### Funcionalidades Técnicas
- **Autenticação**: Sistema de login com cookies HttpOnly
- **Validação**: Validação de formulários antes de submissão
- **Responsividade**: Layout adaptativo (desktop, tablet, mobile)
- **Modularidade**: Componentes reutilizáveis
- **Performance**: Carregamento otimizado

## 📦 Requisitos Não Funcionais Implementados

### Usabilidade (RNF01-06)
✅ Interface intuitiva e consistente  
✅ Layout responsivo  
✅ Feedback imediato em ações  
✅ Validação de formulários (NIF, IBAN, datas, IVA)  
✅ Mensagens de erro claras  

### Performance (RNF07-11)
✅ Dashboard e listagens otimizadas  
✅ Inserção rápida de documentos  
✅ Suporte para múltiplos utilizadores  

### Segurança (RNF12-19)
✅ Autenticação segura  
✅ Proteção de dados  
✅ Auditoria de operações  

### Localização (RNF35-36)
✅ Interface em português de Portugal  
✅ Formatos europeus (datas, moedas)  

### IA e Ética (RNF31-34)
✅ Insights com explicação e fonte  
✅ IA não altera dados contabilísticos  
✅ Alertas configuráveis  

## 🎯 Como Usar

### Login
1. Aceda à aplicação
2. Introduza email e password
3. Clique em "Entrar"

**Nota**: No modo demo, qualquer email/password válido permite acesso.

### Navegação
- Use o menu lateral para aceder aos módulos
- Cada módulo tem funcionalidades específicas
- O dashboard apresenta uma visão geral

### Criação de Documentos
1. Aceda ao módulo pretendido (Vendas/Compras)
2. Clique em "Nova Fatura" ou "Nova Compra"
3. Preencha os campos obrigatórios
4. Submeta o formulário

### Análise com IA
1. Aceda ao módulo "IA & Insights"
2. Consulte os insights automáticos
3. Clique em "Ver Explicação" para detalhes
4. Use o chat para perguntas em linguagem natural

## 📊 Estrutura de Dados

A aplicação utiliza interfaces TypeScript para garantir tipagem forte:

- `User` - Utilizadores do sistema
- `Empresa` - Dados da empresa
- `Cliente` / `Fornecedor` - Entidades comerciais
- `Artigo` - Produtos/serviços
- `Fatura` / `Compra` - Documentos comerciais
- `LancamentoContabilistico` - Movimentos contabilísticos
- `ContaBancaria` - Contas financeiras
- `Insight` - Análises de IA

## 🔒 Segurança

- **Autenticação**: Login com validação
- **Armazenamento**: LocalStorage para sessão
- **Validações**: Formulários validados antes de submissão
- **Auditoria**: Registo de operações sensíveis

## 📝 Conformidade Legal

A aplicação está preparada para:
- Conformidade com SNC (Sistema de Normalização Contabilística)
- Gestão de IVA português
- Exportação SAF-T (PT)
- Retenção de dados (10 anos)

## 🎨 Design System

### Cores Principais
- **Primária**: Azul (#2563EB)
- **Sucesso**: Verde
- **Aviso**: Amarelo
- **Erro**: Vermelho
- **Neutro**: Cinza

### Componentes UI
- Button (primary, secondary, danger, ghost)
- Input (com validação)
- Select
- Card
- Table
- Modal

## 📈 Roadmap Futuro

### Pós-PAP
- Integrações com APIs externas
- Automações financeiras avançadas
- Cenários de tesouraria complexos
- Análises de nível enterprise
- App móvel

## 📄 Licença

Projeto académico para fins educativos.

## 🙏 Agradecimentos

Aos orientadores Nuno Castro e Cláudia Marques pelo apoio e orientação ao longo do projeto.

---

**OPSA** - Optimized Professional System for Administration  
PAP 2025/2026 - Curso Profissional de Informática de Gestão
