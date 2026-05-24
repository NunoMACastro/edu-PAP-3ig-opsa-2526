import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Building, Users, Shield, Bell, Download } from 'lucide-react';

export function Configuracoes() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Dados da Empresa">
          <form className="space-y-4">
            <Input label="Nome da Empresa" defaultValue="Empresa Demo S.A." required />
            <Input label="NIF" defaultValue="500123456" required />
            <Input label="Morada" defaultValue="Rua Exemplo, 123" required />
            <Input label="Código Postal" defaultValue="1000-001" required />
            <Input label="Cidade" defaultValue="Lisboa" required />
            <Select
              label="Moeda"
              options={[
                { value: 'EUR', label: 'Euro (€)' },
                { value: 'USD', label: 'Dólar ($)' }
              ]}
            />
            <Button variant="primary">
              <Building size={16} className="mr-1" />
              Guardar Alterações
            </Button>
          </form>
        </Card>

        <Card title="Períodos Fiscais">
          <div className="space-y-4">
            <div className="p-4 bg-[#00CB73]/20 border border-[#00CB73] rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-medium text-[#004E53]">Período Atual</span>
                <span className="inline-flex px-3 py-1 text-sm rounded bg-[#00CB73] text-[#004E53] font-semibold">
                  Aberto
                </span>
              </div>
              <p className="text-base text-[#004E53]/70">Abril 2026</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-medium text-gray-900">Períodos Anteriores</h4>
              <div className="space-y-2">
                {['Março 2026', 'Fevereiro 2026', 'Janeiro 2026'].map((periodo) => (
                  <div key={periodo} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <span className="text-base text-[#004E53]">{periodo}</span>
                    <span className="inline-flex px-3 py-1 text-sm rounded bg-gray-200 text-[#004E53] font-semibold">
                      Fechado
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="danger" className="w-full">
              Fechar Período Atual
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Gestão de Utilizadores">
        <div className="space-y-4">
          <Button size="sm">
            <Users size={16} className="mr-1" />
            Convidar Utilizador
          </Button>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-900">Nome</th>
                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-900">Papel</th>
                  <th className="px-4 py-3 text-left text-base font-semibold text-gray-900">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-base text-[#004E53]">Utilizador Demo</td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">demo@opsa.pt</td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">Gestor</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]">
                      Ativo
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-base text-[#004E53]">João Silva</td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">joao@opsa.pt</td>
                  <td className="px-4 py-3 text-base text-[#004E53]/70">Contabilista</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]">
                      Ativo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Segurança e Auditoria">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
              <div>
                <p className="text-base font-medium text-[#004E53]">Registo de Auditoria</p>
                <p className="text-sm text-[#004E53]/70">Todas as operações sensíveis são registadas</p>
              </div>
              <span className="inline-flex px-3 py-1 text-sm rounded font-semibold bg-[#04FF00]/20 text-[#004E53] border border-[#04FF00]">
                Ativo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
              <div>
                <p className="text-base font-medium text-[#004E53]">Autenticação de 2 Fatores</p>
                <p className="text-sm text-[#004E53]/70">Proteção adicional para a conta</p>
              </div>
              <span className="inline-flex px-3 py-1 text-sm rounded bg-gray-200 text-[#004E53] font-semibold">
                Inativo
              </span>
            </div>

            <Button variant="primary" className="w-full">
              <Shield size={16} className="mr-1" />
              Ver Logs de Auditoria
            </Button>
          </div>
        </Card>

        <Card title="Notificações e Alertas">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer border border-gray-200">
              <div>
                <p className="text-base font-medium text-[#004E53]">Faturas vencidas</p>
                <p className="text-sm text-[#004E53]/70">Notificar quando faturas vencem</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded accent-[#00CB73] w-5 h-5" />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer border border-gray-200">
              <div>
                <p className="text-base font-medium text-[#004E53]">Stock baixo</p>
                <p className="text-sm text-[#004E53]/70">Alertar quando artigos atingem mínimo</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded accent-[#00CB73] w-5 h-5" />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer border border-gray-200">
              <div>
                <p className="text-base font-medium text-[#004E53]">Insights de IA</p>
                <p className="text-sm text-[#004E53]/70">Receber análises automáticas</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded accent-[#00CB73] w-5 h-5" />
            </label>

            <Button variant="primary" className="w-full">
              <Bell size={16} className="mr-1" />
              Guardar Preferências
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Exportações e Conformidade">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="secondary">
            <Download size={16} className="mr-1" />
            Exportar SAF-T (PT) - Faturação
          </Button>
          <Button variant="secondary">
            <Download size={16} className="mr-1" />
            Exportar SAF-T (PT) - Contabilidade
          </Button>
          <Button variant="secondary">
            <Download size={16} className="mr-1" />
            Exportar Dados (CSV)
          </Button>
          <Button variant="secondary">
            <Download size={16} className="mr-1" />
            Exportar Relatórios (PDF)
          </Button>
        </div>
      </Card>
    </div>
  );
}
