import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table } from '../ui/Table';
import { Input } from '../ui/Input';
import { Plus, AlertTriangle, TrendingDown } from 'lucide-react';
import { Artigo } from '../../types';

const mockArtigos: Artigo[] = [
  {
    id: '1',
    sku: 'ART-001',
    nome: 'Produto A',
    descricao: 'Descrição do Produto A',
    custo: 45.00,
    preco: 89.90,
    iva: 23,
    stock: 150,
    stockMinimo: 50,
    stockMaximo: 500
  },
  {
    id: '2',
    sku: 'ART-002',
    nome: 'Produto B',
    descricao: 'Descrição do Produto B',
    custo: 28.50,
    preco: 54.90,
    iva: 23,
    stock: 35,
    stockMinimo: 40,
    stockMaximo: 300
  },
  {
    id: '3',
    sku: 'ART-003',
    nome: 'Produto C',
    descricao: 'Descrição do Produto C',
    custo: 120.00,
    preco: 249.90,
    iva: 23,
    stock: 0,
    stockMinimo: 20,
    stockMaximo: 100
  },
];

export function Inventario() {
  const [artigos] = useState<Artigo[]>(mockArtigos);
  const [filter, setFilter] = useState<'todos' | 'baixo' | 'ruptura'>('todos');

  const filteredArtigos = artigos.filter(artigo => {
    if (filter === 'baixo') return artigo.stock < artigo.stockMinimo && artigo.stock > 0;
    if (filter === 'ruptura') return artigo.stock === 0;
    return true;
  });

  const stockBaixo = artigos.filter(a => a.stock < a.stockMinimo && a.stock > 0).length;
  const ruptura = artigos.filter(a => a.stock === 0).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="space-y-2">
            <p className="text-base text-[#004E53]/70">Total Artigos</p>
            <p className="text-3xl font-bold text-[#004E53]">{artigos.length}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base text-[#004E53]/70">Stock Baixo</p>
              <AlertTriangle className="text-[#FFCB16]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#FFCB16]">{stockBaixo}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-base text-[#004E53]/70">Ruptura de Stock</p>
              <TrendingDown className="text-[#FF1900]" size={24} />
            </div>
            <p className="text-3xl font-bold text-[#FF1900]">{ruptura}</p>
          </div>
        </Card>
      </div>

      <Card
        title="Gestão de Inventário"
        actions={
          <Button size="sm">
            <Plus size={16} className="mr-1" />
            Novo Artigo
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'todos' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('todos')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'baixo' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('baixo')}
            >
              Stock Baixo
            </Button>
            <Button
              variant={filter === 'ruptura' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('ruptura')}
            >
              Ruptura
            </Button>
          </div>

          <Input type="text" placeholder="Pesquisar artigos..." />

          <Table headers={['SKU', 'Nome', 'Stock', 'Custo', 'Preço', 'Margem', 'Estado']}>
            {filteredArtigos.map((artigo) => {
              const margem = ((artigo.preco - artigo.custo) / artigo.preco * 100).toFixed(1);
              return (
                <tr key={artigo.id} className="hover:bg-[#00CB73]/5">
                  <td className="px-4 py-3 text-base text-[#004E53] font-medium">{artigo.sku}</td>
                  <td className="px-4 py-3 text-base text-[#004E53]">{artigo.nome}</td>
                  <td className="px-4 py-3 text-base text-[#004E53]">
                    {artigo.stock} / {artigo.stockMaximo}
                  </td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">
                    {artigo.custo.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-base text-[#004E53] font-semibold">
                    {artigo.preco.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">{margem}%</td>
                  <td className="px-4 py-3">
                    {artigo.stock === 0 ? (
                      <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#FF1900]/20 text-[#FF1900] border border-[#FF1900]">
                        Ruptura
                      </span>
                    ) : artigo.stock < artigo.stockMinimo ? (
                      <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#FFCB16]/20 text-[#004E53] border border-[#FFCB16]">
                        Baixo
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      </Card>
    </div>
  );
}
