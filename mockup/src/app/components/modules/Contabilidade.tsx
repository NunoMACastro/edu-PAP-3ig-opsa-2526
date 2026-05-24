import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Download, FileText } from 'lucide-react';

interface LancamentoDisplay {
  id: string;
  data: string;
  conta: string;
  descricao: string;
  debito: number;
  credito: number;
}

const mockLancamentos: LancamentoDisplay[] = [
  {
    id: '1',
    data: '2026-04-15',
    conta: '2111 - Clientes c/c',
    descricao: 'FT 2026/0001 - Cliente A',
    debito: 2450.00,
    credito: 0
  },
  {
    id: '2',
    data: '2026-04-15',
    conta: '7111 - Vendas de Mercadorias',
    descricao: 'FT 2026/0001 - Cliente A',
    debito: 0,
    credito: 2000.00
  },
  {
    id: '3',
    data: '2026-04-15',
    conta: '2433 - IVA Liquidado',
    descricao: 'FT 2026/0001 - Cliente A',
    debito: 0,
    credito: 450.00
  },
];

export function Contabilidade() {
  const [view, setView] = useState<'lancamentos' | 'balancete' | 'demonstracoes'>('lancamentos');
  const [lancamentos] = useState<LancamentoDisplay[]>(mockLancamentos);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={view === 'lancamentos' ? 'primary' : 'secondary'}
          onClick={() => setView('lancamentos')}
        >
          Lançamentos
        </Button>
        <Button
          variant={view === 'balancete' ? 'primary' : 'secondary'}
          onClick={() => setView('balancete')}
        >
          Balancete
        </Button>
        <Button
          variant={view === 'demonstracoes' ? 'primary' : 'secondary'}
          onClick={() => setView('demonstracoes')}
        >
          Demonstrações Financeiras
        </Button>
      </div>

      {view === 'lancamentos' && (
        <Card
          title="Diário Geral"
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Download size={16} className="mr-1" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus size={16} className="mr-1" />
                Novo Lançamento
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input type="date" label="De" />
              <Input type="date" label="Até" />
              <Select
                label="Conta"
                options={[
                  { value: '', label: 'Todas as contas' },
                  { value: '21', label: 'Clientes' },
                  { value: '22', label: 'Fornecedores' },
                  { value: '71', label: 'Vendas' }
                ]}
              />
            </div>

            <Table headers={['Data', 'Conta', 'Descrição', 'Débito', 'Crédito']}>
              {lancamentos.map((lanc) => (
                <tr key={lanc.id} className="hover:bg-[#00CB73]/5">
                  <td className="px-4 py-3 text-base text-[#004E53]/70">
                    {new Date(lanc.data).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-4 py-3 text-base text-[#004E53] font-medium">{lanc.conta}</td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">{lanc.descricao}</td>
                  <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                    {lanc.debito > 0
                      ? lanc.debito.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                    {lanc.credito > 0
                      ? lanc.credito.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
                      : '-'}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
      )}

      {view === 'balancete' && (
        <Card
          title="Balancete"
          actions={
            <Button variant="secondary" size="sm">
              <Download size={16} className="mr-1" />
              Exportar PDF
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Período"
                options={[
                  { value: '2026-04', label: 'Abril 2026' },
                  { value: '2026-03', label: 'Março 2026' },
                  { value: '2026-02', label: 'Fevereiro 2026' }
                ]}
              />
            </div>

            <Table headers={['Conta', 'Descrição', 'Débito', 'Crédito', 'Saldo']}>
              <tr className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53] font-medium">11</td>
                <td className="px-4 py-3 text-base text-[#004E53]">Caixa</td>
                <td className="px-4 py-3 text-base text-[#004E53]">12.450,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53]">8.230,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53] font-semibold">4.220,00 €</td>
              </tr>
              <tr className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53] font-medium">12</td>
                <td className="px-4 py-3 text-base text-[#004E53]">Depósitos à Ordem</td>
                <td className="px-4 py-3 text-base text-[#004E53]">125.890,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53]">51.660,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53] font-semibold">74.230,00 €</td>
              </tr>
              <tr className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53] font-medium">2111</td>
                <td className="px-4 py-3 text-base text-[#004E53]">Clientes c/c</td>
                <td className="px-4 py-3 text-base text-[#004E53]">45.230,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53]">0,00 €</td>
                <td className="px-4 py-3 text-base text-[#004E53] font-semibold">45.230,00 €</td>
              </tr>
            </Table>
          </div>
        </Card>
      )}

      {view === 'demonstracoes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Balanço">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#004E53]/20">
                <span className="font-medium text-[#004E53] text-lg">ATIVO</span>
                <span className="font-bold text-[#004E53] text-xl">195.680 €</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-[#004E53]/70">Ativo Não Corrente</span>
                  <span className="text-[#004E53]">45.000 €</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-[#004E53]/70">Ativo Corrente</span>
                  <span className="text-[#004E53]">150.680 €</span>
                </div>
              </div>
              <div className="pt-4 border-t border-[#004E53]/20">
                <div className="flex items-center justify-between pb-2 border-b border-[#004E53]/20">
                  <span className="font-medium text-[#004E53] text-lg">CAPITAL PRÓPRIO E PASSIVO</span>
                  <span className="font-bold text-[#004E53] text-xl">195.680 €</span>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-base">
                    <span className="text-[#004E53]/70">Capital Próprio</span>
                    <span className="text-[#004E53]">125.430 €</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-[#004E53]/70">Passivo</span>
                    <span className="text-[#004E53]">70.250 €</span>
                  </div>
                </div>
              </div>
              <Button variant="secondary" className="w-full" size="sm">
                <FileText size={16} className="mr-1" />
                Exportar Balanço
              </Button>
            </div>
          </Card>

          <Card title="Demonstração de Resultados">
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b border-[#004E53]/20">
                <span className="text-[#004E53]/70 text-base">Vendas e Serviços</span>
                <span className="font-medium text-[#004E53] text-base">125.450 €</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-[#004E53]/70 text-base">Custo Mercadorias Vendidas</span>
                <span className="font-medium text-[#FF1900] text-base">-65.230 €</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#004E53]/20">
                <span className="font-medium text-[#004E53] text-lg">Margem Bruta</span>
                <span className="font-bold text-[#004E53] text-xl">60.220 €</span>
              </div>
              <div className="flex justify-between pb-2 border-b">
                <span className="text-[#004E53]/70 text-base">Gastos Operacionais</span>
                <span className="font-medium text-[#FF1900] text-base">-24.090 €</span>
              </div>
              <div className="flex justify-between pb-2 border-b bg-[#00CB73]/20 px-2 py-1 rounded border border-[#00CB73]">
                <span className="font-semibold text-[#004E53] text-lg">EBITDA</span>
                <span className="font-bold text-[#004E53] text-xl">36.130 €</span>
              </div>
              <Button variant="secondary" className="w-full" size="sm">
                <FileText size={16} className="mr-1" />
                Exportar DR
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
