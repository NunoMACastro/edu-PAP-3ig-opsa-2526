import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Brain, TrendingUp, AlertCircle, Lightbulb, Send, Info } from 'lucide-react';
import { Insight } from '../../types';

const mockInsights: Insight[] = [
  {
    id: '1',
    tipo: 'Tendência',
    titulo: 'Crescimento nas vendas de 12,5%',
    descricao: 'As vendas aumentaram 12,5% comparado com o mês anterior, principalmente devido ao aumento de vendas do Produto A.',
    explicacao: 'Análise baseada em comparação de vendas mensais (março vs abril 2026)',
    fonte: 'Módulo de Vendas - Faturas emitidas',
    data: '2026-04-21',
    prioridade: 'Média'
  },
  {
    id: '2',
    tipo: 'Alerta',
    titulo: 'Previsão de rutura de stock - Produto C',
    descricao: 'Com base no histórico de vendas, o Produto C terá rutura de stock em 5 dias.',
    explicacao: 'Cálculo baseado em média de vendas diárias (15 un/dia) vs stock atual (0 unidades)',
    fonte: 'Módulo de Inventário - Movimentos de stock',
    data: '2026-04-21',
    prioridade: 'Alta'
  },
  {
    id: '3',
    tipo: 'Oportunidade',
    titulo: 'Margem inferior à média no Produto B',
    descricao: 'O Produto B tem uma margem de 48%, abaixo da margem média de mercado (55-60%). Sugestão de ajuste de preço.',
    explicacao: 'Análise de margem: (Preço 54,90 € - Custo 28,50 €) / 54,90 € = 48%',
    fonte: 'Módulo de Inventário - Artigos',
    data: '2026-04-20',
    prioridade: 'Média'
  },
  {
    id: '4',
    tipo: 'Risco',
    titulo: '15 faturas vencidas há mais de 30 dias',
    descricao: 'Existem 15 faturas vencidas totalizando 12.450 €, o que pode impactar o fluxo de caixa.',
    explicacao: 'Análise de antiguidade de saldos com vencimento superior a 30 dias',
    fonte: 'Módulo de Vendas - Contas a receber',
    data: '2026-04-21',
    prioridade: 'Alta'
  }
];

const iconMap = {
  Tendência: TrendingUp,
  Alerta: AlertCircle,
  Oportunidade: Lightbulb,
  Risco: AlertCircle
};

const colorClasses = {
  Tendência: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
    bgLight: 'bg-blue-50'
  },
  Alerta: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    bgLight: 'bg-yellow-50'
  },
  Oportunidade: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200',
    bgLight: 'bg-green-50'
  },
  Risco: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-200',
    bgLight: 'bg-red-50'
  }
};

export function IA() {
  const [insights] = useState<Insight[]>(mockInsights);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const handleAsk = () => {
    if (!question.trim()) return;

    setChatHistory([
      ...chatHistory,
      { role: 'user', content: question },
      {
        role: 'assistant',
        content: 'Com base nos dados de abril 2026, a sua margem bruta média é de 28,8%. Este valor foi calculado a partir das vendas totais (125.450 €) menos o custo das mercadorias vendidas (89.320 €), dividido pelas vendas totais. **Fonte:** Módulo de Contabilidade - Demonstração de Resultados.'
      }
    ]);
    setQuestion('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(
          insights.reduce((acc, insight) => {
            acc[insight.tipo] = (acc[insight.tipo] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([tipo, count]) => {
          const Icon = iconMap[tipo as keyof typeof iconMap];
          const colors = colorClasses[tipo as keyof typeof colorClasses];
          return (
            <Card key={tipo}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base text-gray-600">{tipo}s</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`${colors.bg} p-2 rounded`}>
                  <Icon className={colors.text} size={28} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Insights e Análises">
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = iconMap[insight.tipo as keyof typeof iconMap];
            const colors = colorClasses[insight.tipo as keyof typeof colorClasses];

            return (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bgLight}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.bg} p-2 rounded flex-shrink-0`}>
                    <Icon className={colors.text} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{insight.titulo}</h4>
                        <p className="text-base text-gray-600 mt-1">{insight.descricao}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-sm rounded font-semibold ${
                        insight.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                        insight.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.prioridade}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExplanation(showExplanation === insight.id ? null : insight.id)}
                    >
                      <Info size={14} className="mr-1" />
                      {showExplanation === insight.id ? 'Ocultar' : 'Ver'} Explicação
                    </Button>

                    {showExplanation === insight.id && (
                      <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Como foi calculado:</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.explicacao}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fonte dos dados:</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.fonte}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Data de análise:</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(insight.data).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Assistente IA - Perguntas em Linguagem Natural">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="text-[#004E53]/30 mx-auto mb-3" size={48} />
                <p className="text-[#004E53] text-sm font-medium">
                  Faça uma pergunta sobre os dados da sua empresa
                </p>
                <p className="text-[#004E53]/60 text-xs mt-2">
                  Exemplo: "Qual é a minha margem bruta média?"
                </p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-[#004E53] text-white'
                        : 'bg-white border border-[#004E53]/20 text-[#004E53]'
                    }`}
                  >
                    <p className="text-base whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Faça uma pergunta..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            />
            <Button onClick={handleAsk} disabled={!question.trim()}>
              <Send size={16} />
            </Button>
          </div>

          <div className="bg-[#FFCB16]/20 border border-[#FFCB16] rounded-lg p-3">
            <p className="text-sm text-[#004E53] font-medium">
              <strong>Importante:</strong> A IA apenas analisa e recomenda. Nenhuma alteração contabilística é feita automaticamente.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
