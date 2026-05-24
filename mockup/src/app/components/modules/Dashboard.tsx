import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Euro, Users, Package, AlertTriangle, Landmark } from 'lucide-react';
import { KPI } from '../../types';

const kpis: KPI[] = [
  { label: 'Receita Mensal', value: '125.450 €', variation: 12.5, trend: 'up' },
  { label: 'Custos Totais', value: '89.320 €', variation: -5.2, trend: 'down' },
  { label: 'Margem Bruta', value: '28,8%', variation: 3.1, trend: 'up' },
  { label: 'Clientes Ativos', value: 247, variation: 8, trend: 'up' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx}>
            <div className="space-y-2">
              <p className="text-base text-[#004E53]/70">{kpi.label}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-[#004E53]">{kpi.value}</p>
                {kpi.variation && (
                  <div className={`flex items-center gap-1 text-base font-semibold ${
                    kpi.trend === 'up' ? 'text-[#00CB73]' : 'text-[#FF1900]'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    {Math.abs(kpi.variation)}%
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Resumo Financeiro">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#004E53]/10">
              <div className="flex items-center gap-3">
                <div className="bg-[#00CB73]/20 p-2 rounded">
                  <Euro className="text-[#00CB73]" size={20} />
                </div>
                <div>
                  <p className="text-base text-[#004E53]/70">Contas a Receber</p>
                  <p className="text-lg font-semibold text-[#004E53]">45.230 €</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-[#004E53]/10">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF1900]/20 p-2 rounded">
                  <Euro className="text-[#FF1900]" size={20} />
                </div>
                <div>
                  <p className="text-base text-[#004E53]/70">Contas a Pagar</p>
                  <p className="text-lg font-semibold text-[#004E53]">32.150 €</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#004E53]/10 p-2 rounded">
                  <Landmark className="text-[#004E53]" size={20} />
                </div>
                <div>
                  <p className="text-base text-[#004E53]/70">Saldo Bancário</p>
                  <p className="text-lg font-semibold text-[#004E53]">78.450 €</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Alertas & Notificações">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-[#FFCB16]/20 rounded border border-[#FFCB16]">
              <AlertTriangle className="text-[#FFCB16] flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-base font-medium text-[#004E53]">15 faturas vencidas</p>
                <p className="text-sm text-[#004E53]/70">Total: 12.450 €</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#FF1900]/10 rounded border border-[#FF1900]">
              <Package className="text-[#FF1900] flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-base font-medium text-[#004E53]">8 artigos abaixo do stock mínimo</p>
                <p className="text-sm text-[#004E53]/70">Necessária reposição urgente</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#00CB73]/20 rounded border border-[#00CB73]">
              <Users className="text-[#00CB73] flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-base font-medium text-[#004E53]">12 novos clientes este mês</p>
                <p className="text-sm text-[#004E53]/70">Crescimento de 8% vs mês anterior</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Vendas por Mês">
        <div className="h-64 flex items-end justify-between gap-2">
          {[65, 78, 82, 90, 75, 95, 88, 92, 85, 98, 105, 100].map((height, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-[#00CB73] rounded-t transition-all hover:bg-[#009889]"
                style={{ height: `${height}%` }}
              />
              <span className="text-sm text-[#004E53]/70 font-medium">
                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][idx]}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
