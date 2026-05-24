import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Download, Eye } from 'lucide-react';
import { Fatura } from '../../types';

const mockFaturas: Fatura[] = [
  {
    id: '1',
    numero: 'FT 2026/0001',
    clienteId: '1',
    data: '2026-04-15',
    vencimento: '2026-05-15',
    total: 2450.00,
    iva: 450.00,
    estado: 'Aberta',
    linhas: []
  },
  {
    id: '2',
    numero: 'FT 2026/0002',
    clienteId: '2',
    data: '2026-04-18',
    vencimento: '2026-05-18',
    total: 1890.50,
    iva: 346.50,
    estado: 'Paga',
    linhas: []
  },
  {
    id: '3',
    numero: 'FT 2026/0003',
    clienteId: '3',
    data: '2026-03-20',
    vencimento: '2026-04-20',
    total: 3250.00,
    iva: 595.00,
    estado: 'Vencida',
    linhas: []
  },
];

export function Vendas() {
  const [faturas] = useState<Fatura[]>(mockFaturas);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    data: new Date().toISOString().split('T')[0],
    vencimento: '',
    artigos: [{ artigoId: '', quantidade: 1, preco: 0 }]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    setFormData({
      cliente: '',
      data: new Date().toISOString().split('T')[0],
      vencimento: '',
      artigos: [{ artigoId: '', quantidade: 1, preco: 0 }]
    });
  };

  return (
    <div className="space-y-6">
      <Card
        title="Faturas"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download size={16} className="mr-1" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus size={16} className="mr-1" />
              Nova Fatura
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input type="text" placeholder="Pesquisar..." />
            <Select
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'Aberta', label: 'Abertas' },
                { value: 'Paga', label: 'Pagas' },
                { value: 'Vencida', label: 'Vencidas' }
              ]}
            />
            <Input type="date" />
            <Input type="date" />
          </div>

          <Table headers={['Número', 'Cliente', 'Data', 'Vencimento', 'Total', 'Estado', 'Ações']}>
            {faturas.map((fatura) => (
              <tr key={fatura.id} className="hover:bg-[#00CB73]/5">
                <td className="px-4 py-3 text-base text-[#004E53] font-medium">{fatura.numero}</td>
                <td className="px-4 py-3 text-base text-[#004E53]">Cliente {fatura.clienteId}</td>
                <td className="px-4 py-3 text-base text-[#004E53]/70">
                  {new Date(fatura.data).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-4 py-3 text-base text-[#004E53]/70">
                  {new Date(fatura.vencimento).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                  {fatura.total.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-3 py-1 text-sm rounded font-semibold ${
                    fatura.estado === 'Paga' ? 'bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]' :
                    fatura.estado === 'Vencida' ? 'bg-[#FF1900]/20 text-[#FF1900] border border-[#FF1900]' :
                    'bg-[#FFCB16]/20 text-[#004E53] border border-[#FFCB16]'
                  }`}>
                    {fatura.estado}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Eye size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nova Fatura"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cliente"
              options={[
                { value: '', label: 'Selecione um cliente' },
                { value: '1', label: 'Cliente A' },
                { value: '2', label: 'Cliente B' }
              ]}
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              required
            />
            <Input
              type="date"
              label="Data"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
            <Input
              type="date"
              label="Vencimento"
              value={formData.vencimento}
              onChange={(e) => setFormData({ ...formData, vencimento: e.target.value })}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Artigos</h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6">
                <Select
                  label="Artigo"
                  options={[
                    { value: '', label: 'Selecione um artigo' },
                    { value: '1', label: 'Produto A' },
                    { value: '2', label: 'Produto B' }
                  ]}
                  required
                />
              </div>
              <div className="col-span-2">
                <Input type="number" label="Qtd" min="1" defaultValue="1" required />
              </div>
              <div className="col-span-2">
                <Input type="number" label="Preço" step="0.01" required />
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
              Criar Fatura
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
