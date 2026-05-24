import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import { Compra } from '../../types';

const mockCompras: Compra[] = [
  {
    id: '1',
    numero: 'FC 2026/0001',
    fornecedorId: '1',
    data: '2026-04-10',
    vencimento: '2026-05-10',
    total: 5600.00,
    iva: 1288.00,
    estado: 'Aprovado',
    linhas: []
  },
  {
    id: '2',
    numero: 'FC 2026/0002',
    fornecedorId: '2',
    data: '2026-04-19',
    vencimento: '2026-05-19',
    total: 3200.00,
    iva: 736.00,
    estado: 'Rascunho',
    linhas: []
  },
];

export function Compras() {
  const [compras, setCompras] = useState<Compra[]>(mockCompras);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = (id: string) => {
    setCompras(compras.map(c =>
      c.id === id ? { ...c, estado: 'Aprovado' as const } : c
    ));
  };

  const handleReject = (id: string) => {
    setCompras(compras.map(c =>
      c.id === id ? { ...c, estado: 'Rascunho' as const } : c
    ));
  };

  return (
    <div className="space-y-6">
      <Card
        title="Faturas de Fornecedores"
        actions={
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-1" />
            Nova Compra
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="text" placeholder="Pesquisar..." />
            <Select
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'Rascunho', label: 'Rascunhos' },
                { value: 'Aprovado', label: 'Aprovadas' },
                { value: 'Lançado', label: 'Lançadas' }
              ]}
            />
            <Input type="date" />
          </div>

          <Table headers={['Número', 'Fornecedor', 'Data', 'Total', 'Estado', 'Ações']}>
            {compras.map((compra) => (
              <tr key={compra.id} className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53] font-medium">{compra.numero}</td>
                <td className="px-4 py-3 text-base text-[#004E53]">Fornecedor {compra.fornecedorId}</td>
                <td className="px-4 py-3 text-base text-[#004E53]/70">
                  {new Date(compra.data).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                  {compra.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-3 py-1 text-sm rounded font-semibold ${
                    compra.estado === 'Aprovado' ? 'bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]' :
                    compra.estado === 'Lançado' ? 'bg-[#00CB73]/20 text-[#004E53] border border-[#00CB73]' :
                    'bg-gray-100 text-[#004E53] border border-gray-300'
                  }`}>
                    {compra.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {compra.estado === 'Rascunho' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(compra.id)}
                        >
                          <CheckCircle size={16} className="text-[#04FF00]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(compra.id)}
                        >
                          <XCircle size={16} className="text-[#FF1900]" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Compra"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Fornecedor"
              options={[
                { value: '', label: 'Selecione um fornecedor' },
                { value: '1', label: 'Fornecedor A' },
                { value: '2', label: 'Fornecedor B' }
              ]}
              required
            />
            <Input type="date" label="Data" required />
            <Input type="date" label="Vencimento" required />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Artigos</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select
                  label="Artigo"
                  options={[
                    { value: '', label: 'Selecione um artigo' },
                    { value: '1', label: 'Material A' },
                    { value: '2', label: 'Material B' }
                  ]}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input type="number" label="Qtd" min="1" defaultValue="1" required />
              </div>
              <div className="col-span-2">
                <Input type="number" label="Custo" step="0.01" required />
              </div>
              <div className="col-span-2">
                <Input type="number" label="IVA %" defaultValue="23" required />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Compra
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
