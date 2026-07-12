# Cábula Técnica Para Relatório PAP - OPSA

## Objetivo Do Documento

Este documento serve como apoio aos alunos para escreverem e apresentarem o relatório técnico da PAP. A linguagem é técnica, mas explicada de forma acessível, para que possa ser usada tanto no relatório como na preparação da defesa.

O OPSA é um ERP financeiro integrado para PME e contexto escolar. A aplicação junta gestão de empresas, utilizadores, clientes, fornecedores, artigos, vendas, compras, inventário, contabilidade, tesouraria, relatórios, auditoria, IA assistiva e subscrições simuladas. Algumas secções descrevem funcionalidades centrais do MVP; outras podem ser usadas como visão final ou evolução futura, quando indicado.

## Visão Técnica Geral

Tecnicamente, o OPSA segue uma arquitetura web cliente-servidor. O frontend é a aplicação usada pelo utilizador no browser. O backend é responsável pelas regras de negócio, validação, autenticação, autorização, acesso à base de dados e exposição da API.

O frontend comunica com o backend através de uma API REST. Cada área funcional tem ecrãs e chamadas próprias no frontend, por exemplo para autenticação, empresas, dados mestre, vendas, compras, inventário, contabilidade, tesouraria, relatórios, IA, notificações, auditoria e subscrições simuladas.

O backend está organizado por módulos de domínio. Cada módulo concentra uma responsabilidade principal:

- autenticação e sessão;
- empresas, utilizadores, papéis e permissões;
- perfil fiscal da empresa;
- clientes, fornecedores, artigos, armazéns e IVA;
- vendas, recebimentos e aprovações;
- compras, pagamentos e aprovações;
- inventário, movimentos de stock, FIFO e contagens;
- contabilidade, lançamentos, balancete e razão;
- tesouraria, contas bancárias, extratos e reconciliação;
- relatórios, KPIs e dashboards;
- importações, exportações e SAF-T;
- IA assistiva, explicações e fontes;
- lembretes, tarefas e notificações;
- auditoria, logs, segurança operacional e health-check;
- subscrições simuladas.

Esta separação facilita manutenção e evolução, porque cada domínio pode ser alterado sem misturar responsabilidades com os restantes.

## Identidade, Empresas E Perfis

O sistema de identidade é a base da aplicação. Antes de criar documentos, consultar relatórios, aprovar compras ou ver dados financeiros, o sistema precisa de saber quem é o utilizador.

Este domínio inclui:

- registo de utilizador;
- login;
- logout;
- recuperação de password;
- sessão autenticada;
- seleção da empresa ativa;
- papéis de utilizador dentro de cada empresa, como `ADMIN`, `GESTOR`, `CONTABILISTA`, `OPERACIONAL` e `AUDITOR`.

Depois do login, o backend associa os pedidos a um utilizador autenticado. Como o OPSA é multiempresa, o backend também precisa de saber em que empresa o utilizador está a trabalhar. Isto permite que cada operação seja feita no contexto correto.

Um ponto importante é que o frontend não deve decidir sozinho quem é o utilizador, qual é a empresa ativa ou que permissões existem. O backend deve obter essa informação a partir da sessão e das permissões guardadas.

As permissões também dependem deste domínio. Um utilizador com role `OPERACIONAL` pode lançar documentos e gerir dados operacionais. Um `CONTABILISTA` pode trabalhar sobre contabilidade e fiscalidade. Um `AUDITOR` pode consultar informação sensível, mas não deve alterar dados operacionais.

## Dados Mestre, Empresa E Configuração Fiscal

Os dados mestre são a base estável do ERP. Antes de vender, comprar, lançar stock ou gerar relatórios, a aplicação precisa de entidades bem configuradas.

Este domínio inclui:

- dados da empresa;
- NIF, morada, moeda e informação fiscal;
- plano de contas SNC;
- períodos fiscais;
- clientes;
- fornecedores;
- artigos e serviços;
- armazéns e localizações;
- taxas e códigos de IVA.

Estes dados são reutilizados por quase todos os módulos. Uma fatura precisa de cliente, artigos e IVA. Uma compra precisa de fornecedor, artigos e regras fiscais. Um movimento de stock precisa de artigo e armazém. Um lançamento contabilístico precisa de contas SNC.

O backend deve validar estes dados antes de os guardar. Por exemplo, um NIF inválido, um IBAN mal formatado ou uma conta SNC inexistente não devem ser aceites como se estivessem corretos.

A gestão de períodos fiscais também é importante. Quando um período está fechado, o sistema deve impedir alterações contabilísticas que comprometam a integridade dos dados.

## Vendas, Compras E Documentos

Vendas e compras são dois fluxos centrais do OPSA. Em conjunto, representam a operação diária da empresa.

No fluxo de vendas, o sistema pode gerir:

- clientes;
- faturas;
- faturas-recibo;
- notas de crédito;
- linhas de documento;
- numeração sequencial;
- estados do documento;
- aprovação antes de emissão definitiva;
- recebimentos parciais ou totais;
- títulos em aberto.

No fluxo de compras, o sistema pode gerir:

- fornecedores;
- faturas de fornecedor;
- notas de crédito de fornecedor;
- linhas de documento;
- aprovação ou rejeição;
- histórico de decisão;
- pagamentos parciais ou totais;
- estado contabilístico da compra.

É importante distinguir documento, pagamento ou recebimento e lançamento contabilístico. Uma fatura representa uma operação comercial. Um recebimento ou pagamento representa movimento financeiro. Um lançamento contabilístico representa o impacto formal na contabilidade.

Esta separação torna o sistema mais auditável e evita que uma única operação misture responsabilidades diferentes.

Nem todos os documentos devem avançar diretamente para estado final. Em contexto empresarial, é comum existir um processo de aprovação.

O OPSA pode usar estados para controlar o ciclo de vida dos documentos, por exemplo:

- rascunho;
- submetido;
- aprovado;
- rejeitado;
- emitido;
- lançado;
- pago ou liquidado.

O histórico é essencial. Não basta saber que uma compra foi aprovada; é importante saber quem aprovou, quando aprovou e, se aplicável, qual foi a justificação.

Este domínio ajuda a criar segregação de funções. Uma pessoa pode criar um documento e outra pode aprovar. Esta separação reduz erros, aumenta controlo interno e torna o sistema mais adequado para auditoria.

## Contabilidade, Lançamentos E Demonstrações

A contabilidade transforma a operação da empresa em registos formais. No OPSA, a contabilidade liga documentos, contas SNC, períodos fiscais e relatórios financeiros.

Este domínio inclui:

- plano de contas;
- lançamentos automáticos de vendas;
- lançamentos automáticos de compras;
- lançamentos manuais;
- anexos de lançamentos;
- linhas de débito e crédito;
- balancete;
- razão;
- demonstração de resultados;
- balanço.

Um lançamento contabilístico deve ser coerente. Em termos simples, os débitos e créditos devem estar equilibrados. Também deve estar associado à empresa correta e, quando necessário, ao período fiscal correto.

Os documentos comerciais não devem ser confundidos com lançamentos contabilísticos. A venda ou compra é a origem operacional; o lançamento é a representação contabilística.

Esta organização permite gerar relatórios financeiros a partir de dados registados, em vez de escrever valores manualmente sem rastreabilidade.

## Inventário, Stock E FIFO

O inventário controla artigos, armazéns, movimentos e custos. É uma área importante porque liga compras, vendas, stock físico e valor contabilístico dos artigos.

Este domínio inclui:

- criação de artigos e serviços;
- armazéns e localizações;
- movimentos de entrada;
- movimentos de saída;
- transferências;
- devoluções;
- ajustes;
- contagens físicas;
- saldos por artigo e armazém;
- alertas de stock mínimo, máximo e artigos parados;
- cálculo de custo FIFO.

FIFO significa "First In, First Out". A ideia é que o custo dos artigos vendidos ou consumidos seja calculado com base nas entradas mais antigas em stock.

Este cálculo é importante para manter coerência no custo dos artigos. O sistema deve impedir saídas sem stock suficiente e não deve bloquear operações críticas com cálculos demasiado pesados.

Os alertas de stock também são úteis para outros módulos. Por exemplo, um artigo abaixo do mínimo pode gerar um alerta ou servir de fonte para um insight de IA.

## Tesouraria, Bancos E Reconciliação

A tesouraria trata do dinheiro disponível, das contas bancárias e dos movimentos financeiros esperados.

Este domínio inclui:

- contas bancárias;
- caixa;
- saldos iniciais;
- importação de extratos;
- linhas de extrato;
- reconciliação bancária;
- sugestões de correspondência;
- previsão de tesouraria;
- entradas e saídas futuras.

A reconciliação ajuda a comparar movimentos bancários com recebimentos e pagamentos registados no sistema. Por exemplo, uma linha de extrato pode corresponder a um recebimento de cliente ou a um pagamento a fornecedor.

No OPSA, a reconciliação deve ser assistida. O sistema pode sugerir correspondências com base em valores, datas e referências, mas não deve assumir que uma sugestão é automaticamente verdadeira sem validação.

A previsão de tesouraria ajuda o gestor a perceber se a empresa poderá ter falta ou excesso de liquidez num período futuro.

## Relatórios, KPIs E Dashboards

Os relatórios transformam dados registados em informação útil. Sem relatórios, o ERP apenas guarda dados; com relatórios, passa a apoiar decisões.

Este domínio inclui:

- relatórios de vendas;
- relatórios de compras;
- margens;
- stock;
- balancete;
- razão;
- demonstração de resultados;
- balanço;
- mapas de IVA;
- KPIs executivos;
- receita;
- custos;
- EBITDA;
- prazo médio de recebimento;
- prazo médio de pagamento.

Os dashboards apresentam esta informação de forma resumida. O objetivo é permitir que gestores, contabilistas e auditores percebam rapidamente o estado da empresa.

Os relatórios também podem servir como fonte para a IA. Um insight deve nascer de dados reais e identificáveis, como relatórios operacionais, KPIs, alertas de stock ou previsão de tesouraria.

É importante que os relatórios sejam auditáveis. Sempre que possível, o sistema deve conseguir explicar de onde vêm os valores apresentados.

## IA Assistiva, Recomendações E Explicabilidade

A IA do OPSA tem duas camadas complementares. A primeira é determinística: calcula métricas, insights, sugestões e alertas diretamente sobre PostgreSQL. A segunda é um chat opcional controlado pela OpenAI: interpreta a pergunta, escolhe ferramentas de leitura e redige a resposta, mas nunca calcula valores, executa SQL ou altera dados.

PostgreSQL e o catálogo analítico interno continuam a ser a única fonte de verdade. Isto permite apresentar a IA como apoio à decisão auditável e não como uma entidade que inventa ou decide pela empresa.

Este domínio inclui:

- insights automáticos;
- identificação de tendências;
- deteção de riscos;
- sugestões de ação com estado e feedback;
- chat persistente e contextual em linguagem natural;
- alertas inteligentes com score, severidade e lifecycle;
- comparação de períodos;
- explicações, fórmulas e origem dos dados;
- cobertura, qualidade e limitações;
- atualização manual e automática por worker.

Exemplos de uso da IA:

- sinalizar risco de rutura de stock;
- sugerir revisão de preços;
- alertar para artigos parados;
- destacar risco de cashflow;
- responder a perguntas sobre cashflow, clientes, stock, margem e KPIs;
- explicar que relatório, documento ou alerta serviu de fonte.

A IA deve respeitar uma regra crítica: recomenda, mas não executa. Isto significa que não aprova documentos, não cria lançamentos contabilísticos, não faz pagamentos, não altera stock e não modifica preços automaticamente.

O catálogo interno expõe apenas ferramentas analíticas read-only: resumo de cashflow, recebimentos, risco de stock, margem, KPIs executivos, comparação temporal e explicação de insights. Todas usam período explícito, timezone `Europe/Lisbon`, fórmulas estruturadas e referências de origem. A paginação limita detalhes, não os totais.

O chat está disponível na página `/ai/chat` e num drawer transversal para `ADMIN`, `GESTOR` e `CONTABILISTA`. O frontend envia apenas contexto técnico mínimo do módulo; o backend volta a validar empresa, permissões e ownership. O endpoint antigo `/api/ai/questions` existe apenas como adapter depreciado.

Uma chamada à OpenAI exige três autorizações simultâneas: provider configurado no servidor, opt-in da empresa por `ADMIN` e consentimento individual. Se qualquer condição falhar, ou se o provider estiver indisponível, a aplicação responde em modo determinístico.

Antes do envio externo, nomes e entidades são substituídos por aliases temporários como `CUSTOMER_001`. Emails, NIF, IBAN, telefones, moradas, credenciais, documentos, anexos e SAF-T são bloqueados. O histórico local é cifrado com AES-256-GCM, pode ser apagado pelo utilizador e é eliminado após, no máximo, 90 dias.

Cada insight deve ter uma explicação compreensível. Por exemplo, em vez de dizer apenas "risco de stock", o sistema deve indicar o artigo, o armazém, a quantidade atual, o limite configurado e a fonte usada.

Na resposta do chat, o utilizador vê a empresa ativa, o período e `asOf`, o modo OpenAI ou determinístico, a qualidade dos dados, fontes, limitações e sugestões de seguimento. Não vê prompts, argumentos internos das tools, aliases ou detalhes secretos do provider.

Os insights e alertas são processados por `AiAnalysisRun`. Um worker periódico atualiza ocorrências, resolve automaticamente riscos que desapareceram e respeita preferências de entrega sem deixar de detetar internamente o risco.

Para o relatório, a formulação mais rigorosa é:

> A IA OPSA usa cálculos determinísticos e auditáveis como fonte de verdade. A OpenAI é opcional e serve apenas para redigir enquadramento qualitativo a partir de intenção e sinais canónicos; pergunta, histórico, IDs e valores ficam no backend.

## Subscrições Simuladas

No contexto da PAP, o OPSA inclui subscrições simuladas. Esta funcionalidade permite demonstrar planos e gestão de acesso sem integrar um gateway de pagamento real.

Este domínio inclui:

- catálogo de planos;
- plano mensal;
- plano trimestral;
- plano anual;
- preço em euros;
- subscrição associada à empresa ativa;
- estado atual da subscrição;
- ativação simulada;
- renovação;
- cancelamento;
- reativação.

O backend deve ser a autoridade sobre o estado da subscrição. O frontend pode mostrar botões e informação visual, mas não deve decidir sozinho se uma empresa tem plano ativo.

A subscrição simulada pertence à empresa, não apenas ao utilizador. Isto faz sentido num ERP, porque o acesso ao sistema está ligado à entidade empresarial.

A subscrição simulada tem um ciclo de vida. Este ciclo permite demonstrar cenários reais de produto sem lidar com cartões, bancos, faturas de pagamento ou fornecedores externos.

O sistema deve simular:

- ativação de um plano;
- renovação;
- cancelamento;
- reativação;
- expiração;
- consulta do estado atual.

As regras de transição são importantes. Uma subscrição ativa pode ser renovada ou cancelada. Uma subscrição cancelada ou expirada pode ser reativada. O sistema não deve aceitar ações incoerentes, como cancelar uma subscrição inexistente sem regra definida.

O cálculo de datas deve ser consistente com o plano. Um plano mensal deve avançar por meses; um plano anual deve avançar por anos. A aplicação deve guardar datas de início e fim do período para explicar o estado atual.

Limite importante: esta funcionalidade é simulada. Não existe cobrança real, checkout, webhook, cartão, invoice, recibo ou lançamento contabilístico automático.

## Importações, Exportações E SAF-T

Um ERP precisa de comunicar com o exterior. No OPSA, isto acontece através de importações, exportações e artefactos fiscais.

As importações podem abranger:

- clientes;
- fornecedores;
- artigos;
- extratos bancários;
- dados em CSV ou Excel;
- validação por linha;
- erros de importação;
- logs de integração.

As exportações podem incluir:

- CSV;
- Excel;
- PDF;
- balancete;
- razão;
- relatórios;
- SAF-T MVP.

O SAF-T é um ponto sensível. Deve ser apresentado como uma exportação técnica e académica com validações de prontidão, não como certificação fiscal oficial.

Antes de gerar um ficheiro fiscal, o sistema deve validar dados mínimos, como empresa, período, documentos e lançamentos. Se faltarem dados essenciais, deve falhar de forma clara.

## Notificações, Lembretes E Tarefas

O OPSA também apoia a organização operacional. Além de registar documentos e gerar relatórios, a aplicação ajuda a acompanhar trabalho, prazos e alertas.

Este domínio inclui:

- lembretes;
- prazos;
- tarefas;
- responsáveis;
- estados de tarefa;
- notificações in-app;
- notificações por email quando aplicável;
- preferências de alerta;
- marcação de notificações como lidas.

Exemplos de notificações:

- prazo fiscal próximo;
- alerta de stock;
- alerta de cashflow;
- lembrete de pagamento;
- tarefa atribuída;
- alteração relevante numa operação;
- alerta crítico da IA.

Algumas notificações podem ser opcionais. Outras devem ser obrigatórias, especialmente quando envolvem segurança, integridade ou risco operacional.

## Privacidade, Auditoria E Retenção

Como o OPSA trata dados empresariais, financeiros e pessoais, precisa de regras de privacidade, auditoria e retenção.

Este domínio inclui:

- proteção de dados pessoais;
- sessão segura;
- passwords protegidas;
- logs sem informação sensível;
- auditoria de operações críticas;
- retenção contabilística;
- registo de quem fez o quê e quando;
- bloqueio de eliminação quando existe obrigação legal;
- consulta de logs por utilizadores autorizados.

No contexto contabilístico, alguns dados precisam de ser mantidos durante vários anos. A aplicação não deve permitir apagar informação que ainda tenha obrigação legal de retenção.

A auditoria é diferente de um log técnico simples. Um log técnico ajuda a perceber funcionamento da aplicação. Um registo de auditoria serve como evidência de uma ação relevante.

Princípios importantes:

- não guardar passwords em texto claro;
- não expor tokens;
- não colocar NIF, IBAN, cookies ou payloads sensíveis em logs;
- não aceitar permissões vindas livremente do frontend;
- manter operações críticas rastreáveis.

## Administração, Métricas E Operação

A administração permite gerir a aplicação no dia a dia. Nem todas as operações devem estar disponíveis para utilizadores comuns.

Funções administrativas ou operacionais típicas:

- gerir utilizadores da empresa;
- convidar membros;
- alterar papéis;
- remover acessos;
- consultar contexto da empresa;
- consultar auditoria;
- consultar logs de integração;
- verificar estado da API;
- acompanhar relatórios e KPIs;
- gerir preferências e alertas;
- validar dados técnicos antes da entrega.

O health-check é uma funcionalidade operacional simples, mas importante. Permite confirmar que a API está disponível sem expor dados internos, empresas, credenciais ou informação financeira.

As métricas e relatórios ajudam a equipa a acompanhar o estado da aplicação e a defender tecnicamente o projeto. O objetivo é mostrar que o OPSA não é apenas uma interface, mas um sistema com regras, dados, auditoria e operação.

## Segurança, Testes, Performance E Acessibilidade

Esta secção é transversal. Não é uma funcionalidade isolada, mas garante que a aplicação é confiável.

### Segurança

Pontos técnicos importantes:

- autenticação segura;
- sessões protegidas com cookies HttpOnly;
- autorização por roles e permissões;
- validação de input;
- passwords com hash seguro;
- HTTPS em produção;
- proteção contra XSS, CSRF, brute force e injeções;
- variáveis de ambiente para segredos;
- auditoria obrigatória em operações sensíveis;
- não exposição de dados sensíveis em logs.

### Testes

O projeto deve ter testes para validar:

- regras de backend;
- contratos HTTP;
- validações de domínio;
- autenticação;
- permissões;
- vendas e compras;
- contabilidade;
- inventário;
- tesouraria;
- relatórios;
- IA;
- subscrições simuladas;
- regressão frontend.

Testes ajudam a garantir que alterações futuras não quebram funcionalidades existentes.

### Performance

Áreas críticas:

- criação de documentos;
- listagens;
- dashboards;
- reconciliação bancária;
- cálculo FIFO;
- relatórios.

O backend deve evitar processamentos desnecessários e limitar operações pesadas. O frontend deve evitar carregar dados em excesso e deve apresentar feedback enquanto as operações decorrem.

### Acessibilidade

A aplicação deve ser utilizável com teclado, leitores de ecrã e diferentes tamanhos de ecrã.

Inclui:

- contraste adequado;
- labels em formulários;
- estados de erro claros;
- navegação por teclado;
- foco visível;
- mensagens compreensíveis;
- layout responsivo;
- tabelas adaptadas a ecrãs pequenos.

## Automação Financeira Avançada E Evolução Futura

Nota de escopo: esta secção deve ser apresentada como visão futura ou evolução possível, salvo se vier a ser formalizada como requisito e implementada.

O OPSA pode evoluir para funcionalidades mais avançadas, como:

- integração bancária real;
- submissão fiscal certificada;
- OCR de documentos;
- integração com faturação externa;
- dashboards mais avançados;
- previsões financeiras mais completas;
- automações controladas de aprovação;
- exportações legais mais completas;
- integrações com fornecedores de email reais;
- planos comerciais reais com pagamentos reais.

Estas evoluções devem manter o princípio central do OPSA: o sistema pode sugerir, validar e apoiar, mas operações contabilísticas críticas devem continuar sujeitas a regras claras, permissões e auditoria.

Qualquer automação futura deve ser segura. Por exemplo, se um dia a aplicação sugerir pagamentos ou lançamentos automáticos, deve existir validação humana, registo de auditoria e possibilidade de revisão.

## Como Fechar No Relatório

Uma forma forte de fechar a explicação técnica é mostrar que o OPSA não é apenas um conjunto de páginas, mas um sistema integrado.

Texto final sugerido:

> O OPSA foi estruturado como uma aplicação web modular, com separação clara entre frontend, backend, base de dados e domínios funcionais. Cada módulo responde a uma área do ERP, como identidade, empresas, dados mestre, vendas, compras, inventário, contabilidade, tesouraria, relatórios, IA, auditoria, notificações e subscrições simuladas. Esta organização permite manter o sistema seguro, testável, auditável e alinhado com os objetivos da PAP.

## Sugestão De Organização Para A Apresentação

Tendo em conta a complexidade do OPSA, a apresentação deve seguir uma ordem progressiva. O objetivo é evitar que os alunos comecem a explicar uma funcionalidade que depende de outra ainda não apresentada.

Em vez de apresentar a aplicação como uma lista de páginas, é melhor apresentar por camadas:

1. base técnica da aplicação;
2. empresas, utilizadores e permissões;
3. dados mestre e configuração fiscal;
4. vendas, compras e documentos;
5. contabilidade e fiscalidade;
6. inventário, stock e tesouraria;
7. relatórios, KPIs e dashboards;
8. IA assistiva e explicabilidade;
9. subscrições simuladas, notificações e tarefas;
10. privacidade, auditoria, administração, testes e evolução futura.

### 1. Base Técnica Da Aplicação

Primeiro deve ser explicada a fundação técnica da aplicação.

Inclui:

- frontend React;
- backend Node.js e Express;
- base de dados relacional gerida através de Prisma;
- API REST;
- autenticação;
- sessões protegidas;
- validação de input;
- separação entre frontend, backend e base de dados.

Mensagem-chave:

> Antes de falar de faturas, contabilidade, stock ou IA, é preciso explicar como o OPSA está organizado tecnicamente e como o backend controla as regras principais.

### 2. Empresas, Utilizadores E Permissões

Depois da base técnica, deve ser explicado que o OPSA é uma aplicação multiempresa.

Inclui:

- registo e login;
- sessão autenticada;
- empresa ativa;
- utilizadores da empresa;
- convites;
- roles como `ADMIN`, `GESTOR`, `CONTABILISTA`, `OPERACIONAL` e `AUDITOR`;
- permissões por função.

Aqui é importante explicar que o frontend não decide sozinho quem é o utilizador, qual é a empresa ativa ou que permissões existem. O backend valida esse contexto antes de executar operações sensíveis.

Mensagem-chave:

> O OPSA precisa de saber quem está autenticado e em que empresa está a trabalhar antes de permitir qualquer operação financeira.

### 3. Dados Mestre E Configuração Fiscal

Só depois da identidade e da empresa ativa deve entrar a base de dados funcional do ERP.

Inclui:

- dados da empresa;
- NIF, morada, moeda e informação fiscal;
- plano de contas SNC;
- períodos fiscais;
- clientes;
- fornecedores;
- artigos e serviços;
- armazéns e localizações;
- taxas e códigos de IVA.

Estes dados devem ser apresentados como a base necessária para os restantes módulos. Uma venda precisa de cliente, artigos e IVA. Uma compra precisa de fornecedor. Um lançamento contabilístico precisa de contas SNC. Um movimento de stock precisa de artigo e armazém.

Mensagem-chave:

> Antes de criar documentos ou relatórios, o ERP precisa de dados mestre corretos e validados.

### 4. Vendas, Compras E Documentos

Depois dos dados mestre, devem ser explicados os fluxos comerciais principais.

Inclui:

- documentos de venda;
- documentos de compra;
- linhas de documento;
- numeração;
- estados;
- aprovação ou rejeição;
- recebimentos;
- pagamentos;
- títulos em aberto;
- histórico de decisões.

Aqui é importante distinguir três conceitos: documento comercial, pagamento ou recebimento, e lançamento contabilístico. Uma fatura não é a mesma coisa que um recebimento. Um recebimento também não é a mesma coisa que um lançamento contabilístico.

Mensagem-chave:

> Vendas e compras representam a operação diária da empresa, mas cada operação tem estados, validações e responsabilidades próprias.

### 5. Contabilidade E Fiscalidade

Depois dos documentos comerciais, deve ser explicada a camada contabilística.

Inclui:

- lançamentos automáticos de vendas;
- lançamentos automáticos de compras;
- lançamentos manuais;
- débitos e créditos;
- anexos;
- balancete;
- razão;
- demonstração de resultados;
- balanço;
- mapas de IVA;
- SAF-T MVP.

Nesta fase deve ficar claro que a contabilidade é a representação formal das operações. Os lançamentos devem estar equilibrados e ligados à empresa e ao período fiscal corretos.

Mensagem-chave:

> A contabilidade transforma as operações do ERP em registos formais, auditáveis e coerentes.

### 6. Inventário, Stock E Tesouraria

Depois da contabilidade, deve entrar a gestão operacional de stock e dinheiro.

Inclui:

- movimentos de stock;
- entradas;
- saídas;
- transferências;
- ajustes;
- contagens físicas;
- saldos;
- alertas de stock;
- cálculo FIFO;
- contas bancárias;
- importação de extratos;
- reconciliação bancária;
- previsão de tesouraria.

Aqui é útil explicar que o inventário liga artigos, armazéns e custos, enquanto a tesouraria liga contas bancárias, recebimentos, pagamentos e previsão de liquidez.

Mensagem-chave:

> O OPSA não guarda apenas documentos. Também controla stock, custos, dinheiro disponível e movimentos financeiros esperados.

### 7. Relatórios, KPIs E Dashboards

Depois de explicar os dados e operações, devem ser apresentados os sistemas que transformam esses dados em informação.

Inclui:

- relatórios de vendas;
- relatórios de compras;
- margens;
- stock;
- balancete;
- razão;
- demonstrações financeiras;
- mapas de IVA;
- KPIs executivos;
- receita;
- custos;
- EBITDA;
- prazo médio de recebimento;
- prazo médio de pagamento.

Os relatórios devem ser apresentados como uma consequência natural dos dados registados nos módulos anteriores.

Mensagem-chave:

> Os relatórios mostram que o OPSA não é só uma aplicação para inserir dados, mas uma ferramenta de apoio à decisão.

### 8. IA Assistiva E Explicabilidade

Só depois de existirem dados, relatórios, stock e tesouraria deve ser explicada a IA.

Inclui:

- insights automáticos;
- deteção de riscos;
- tendências;
- sugestões de ação com lifecycle;
- chat contextual na página e no drawer global;
- alertas inteligentes atualizados pelo worker;
- tools analíticas read-only;
- explicações, fórmulas e referências;
- período, qualidade e limitações;
- consentimento, pseudonimização e retenção.

A apresentação deve separar claramente o motor determinístico do chat OpenAI opcional. O primeiro calcula valores sobre PostgreSQL; o segundo interpreta e redige com base nesses resultados. Em caso de falha externa, o sistema mantém resposta determinística.

A OpenAI não recebe pergunta livre, histórico, nomes, IDs, valores, SQL, Prisma, ficheiros ou acesso à aplicação. O backend executa uma tool autorizada, cria `facts` e fontes, e rejeita narrativas externas com números ou referências. O histórico é local, cifrado, apagável e retido por um máximo de 90 dias.

A IA continua a ser assistiva. Não aprova documentos, não cria lançamentos, não faz pagamentos, não altera stock e não modifica preços sozinha.

Mensagem-chave:

> A IA do OPSA não decide pela empresa. Calcula com dados internos auditáveis e pode usar a OpenAI, de forma controlada, apenas para interpretar, explicar e apontar fontes.

Para a arquitetura completa, consultar `docs/ARQUITETURA-IA-OPSA-V2.md`.

### 9. Subscrições Simuladas, Notificações E Tarefas

Depois da IA, podem ser apresentados sistemas de apoio à operação e demonstração de produto.

Inclui:

- catálogo de planos simulados;
- plano mensal, trimestral e anual;
- ativação simulada;
- renovação;
- cancelamento;
- reativação;
- estado atual da subscrição;
- lembretes;
- tarefas;
- notificações in-app;
- preferências de alerta;
- notificações por email quando aplicável.

Aqui deve ser reforçado que as subscrições são simuladas no contexto da PAP. Não há checkout real, gateway de pagamento, cartões, webhooks, invoices reais ou lançamentos contabilísticos automáticos.

Mensagem-chave:

> As subscrições demonstram gestão de planos e acesso, mas sem integração financeira real. As notificações e tarefas ajudam a acompanhar prazos, alertas e trabalho operacional.

### 10. Privacidade, Auditoria, Administração, Testes E Evolução

No fim devem entrar os sistemas que provam robustez técnica e maturidade do projeto.

Inclui:

- passwords protegidas;
- sessões seguras;
- logs sem dados sensíveis;
- audit log;
- retenção contabilística;
- bloqueio de eliminação quando existe obrigação legal;
- gestão de utilizadores;
- health-check;
- logs de integração;
- testes backend;
- testes frontend;
- performance;
- acessibilidade;
- evolução futura.

Esta parte deve mostrar que o OPSA não foi pensado apenas como interface visual. Existe preocupação com segurança, rastreabilidade, validação, manutenção e crescimento futuro.

Mensagem-chave:

> Para além das funcionalidades visíveis, o OPSA tem sistemas de segurança, auditoria, testes e operação que tornam o projeto mais sólido.

### Regra Para Evitar Confusão

Sempre que surgir uma funcionalidade que depende de outra ainda não explicada, pode ser usada esta frase:

> Esta funcionalidade depende de conceitos que vamos explicar mais à frente, por isso agora só a vamos situar no mapa geral.

No início da apresentação, pode ser mostrado um mapa geral sem explicar tudo em detalhe.

Frase útil para abrir a parte técnica:

> A aplicação tem empresas, utilizadores, dados mestre, vendas, compras, contabilidade, inventário, tesouraria, relatórios, IA, auditoria e subscrições simuladas. Vamos explicar por ordem, porque alguns sistemas dependem dos anteriores.

Esta organização ajuda a apresentação a ter uma narrativa clara: primeiro a base técnica, depois a empresa e os dados, depois as operações, depois os relatórios e a IA, e no fim a segurança, auditoria, testes e evolução futura.
