import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Upload, CheckCircle } from 'lucide-react';
import { ContaBancaria } from '../../types';

const mockContas: ContaBancaria[] = [
  {
    id: '1',
    nome: 'Banco Comercial PT',
    iban: 'PT50 0035 0000 0001 2345 6789 0',
    saldo: 74230.50,
    tipo: 'Bancária'
  },
  {
    id: '2',
    nome: 'Caixa',
    iban: '-',
    saldo: 4220.00,
    tipo: 'Caixa'
  },
];

interface Movimento {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  reconciliado: boolean;
}

const mockMovimentos: Movimento[] = [
  {
    id: '1',
    data: '2026-04-20',
    descricao: 'Transferência recebida - Cliente A',
    valor: 2450.00,
    reconciliado: true
  },
  {
    id: '2',
    data: '2026-04-19',
    descricao: 'Pagamento Fornecedor B',
    valor: -1890.50,
    reconciliado: true
  },
  {
    id: '3',
    data: '2026-04-18',
    descricao: 'Transferência - Salários',
    valor: -5600.00,
    reconciliado: false
  },
];

export function Bancos() {
  const [contas] = useState<ContaBancaria[]>(mockContas);
  const [selectedConta, setSelectedConta] = useState<string>(contas[0]?.id || '');
  const [movimentos, setMovimentos] = useState<Movimento[]>(mockMovimentos);

  const handleReconcile = (id: string) => {
    setMovimentos(movimentos.map(m =>
      m.id === id ? { ...m, reconciliado: true } : m
    ));
  };

  const totalSaldo = contas.reduce((sum, conta) => sum + conta.saldo, 0);
  const movimentosNaoReconciliados = movimentos.filter(m => !m.reconciliado).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="space-y-2">
            <p className="text-base text-[#004E53]/70">Saldo Total</p>
            <p className="text-3xl font-bold text-[#004E53]">
              {totalSaldo.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-base text-[#004E53]/70">Contas Ativas</p>
            <p className="text-3xl font-bold text-[#004E53]">{contas.length}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-base text-[#004E53]/70">Por Reconciliar</p>
            <p className="text-3xl font-bold text-[#FFCB16]">{movimentosNaoReconciliados}</p>
          </div>
        </Card>
      </div>

      <Card
        title="Contas Bancárias"
        actions={
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            Nova Conta
          </Button>
        }
      >
        <Table headers={['Nome', 'IBAN', 'Tipo', 'Saldo']}>
          {contas.map((conta) => (
            <tr key={conta.id} className="hover:bg-[#00CB73]/5 cursor-pointer" onClick={() => setSelectedConta(conta.id)}>
              <td className="px-4 py-3 text-base text-[#004E53] font-medium">{conta.nome}</td>
              <td className="px-4 py-3 text-base text-[#004E53]/70">{conta.iban}</td>
              <td className="px-4 py-3 text-base text-[#004E53]/70">
                <span className="inline-flex px-2 py-1 text-sm rounded font-semibold bg-[#009889]/20 text-[#004E53] border border-[#009889]">
                  {conta.tipo}
                </span>
              </td>
              <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                {conta.saldo.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card
        title="Reconciliação Bancária"
        actions={
          <Button variant="secondary" size="sm">
            <Upload size={16} className="mr-1" />
            Importar Extrato
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Conta"
              options={contas.map(c => ({ value: c.id, label: c.nome }))}
              value={selectedConta}
              onChange={(e) => setSelectedConta(e.target.value)}
            />
            <Input type="date" label="Período" />
          </div>

          <Table headers={['Data', 'Descrição', 'Valor', 'Estado', 'Ações']}>
            {movimentos.map((movimento) => (
              <tr key={movimento.id} className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53]/70">
                  {new Date(movimento.data).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-4 py-3 text-base text-[#004E53]">{movimento.descricao}</td>
                <td className={`px-4 py-3 text-base font-semibold ${movimento.valor > 0 ? 'text-[#00CB73]' : 'text-[#FF1900]'}`}>
                  {movimento.valor.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3">
                  {movimento.reconciliado ? (
                    <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]">
                      Reconciliado
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#FFCB16]/20 text-[#004E53] border border-[#FFCB16]">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!movimento.reconciliado && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReconcile(movimento.id)}
                    >
                      <CheckCircle size={16} className="text-[#04FF00]" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Card title="Previsão de Tesouraria">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#00CB73]/20 rounded border border-[#00CB73]">
              <p className="text-base text-[#004E53]/70 mb-1">Entradas Previstas (30 dias)</p>
              <p className="text-2xl font-bold text-[#00CB73]">45.230 €</p>
            </div>
            <div className="p-4 bg-[#FF1900]/20 rounded border border-[#FF1900]">
              <p className="text-base text-[#004E53]/70 mb-1">Saídas Previstas (30 dias)</p>
              <p className="text-2xl font-bold text-[#FF1900]">32.150 €</p>
            </div>
            <div className="p-4 bg-[#004E53]/10 rounded border border-[#004E53]">
              <p className="text-base text-[#004E53]/70 mb-1">Saldo Previsto</p>
              <p className="text-2xl font-bold text-[#004E53]">91.530 €</p>
            </div>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 border-t pt-4">
            {[
              { entradas: 15, saidas: 10 },
              { entradas: 18, saidas: 12 },
              { entradas: 22, saidas: 15 },
              { entradas: 20, saidas: 18 }
            ].map((semana, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1">
                  <div
                    className="flex-1 bg-[#00CB73] rounded-t"
                    style={{ height: `${semana.entradas * 8}px` }}
                    title="Entradas"
                  />
                  <div
                    className="flex-1 bg-[#FF1900] rounded-t"
                    style={{ height: `${semana.saidas * 8}px` }}
                    title="Saídas"
                  />
                </div>
                <span className="text-sm text-gray-600 font-medium">Sem {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
