import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Calculator,
  Landmark,
  Brain,
  Settings,
  LogOut,
  Menu,
  X,
  Languages
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
  { id: 'compras', label: 'Compras', icon: Package },
  { id: 'inventario', label: 'Inventário', icon: Warehouse },
  { id: 'contabilidade', label: 'Contabilidade', icon: Calculator },
  { id: 'bancos', label: 'Bancos', icon: Landmark },
  { id: 'ia', label: 'IA & Insights', icon: Brain },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export function Layout({ children, currentModule, onModuleChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-black flex">
      <aside className={`bg-[#004E53] text-white transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-0 md:w-20'
      } flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {isSidebarOpen && <h1 className="font-bold text-white text-2xl">OPSA</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#00CB73] hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded transition-colors ${
                  currentModule === item.id
                    ? 'bg-[#00CB73] text-[#004E53] font-semibold'
                    : 'text-white/90 hover:bg-[#009889] hover:text-white'
                }`}
              >
                <Icon size={22} />
                {isSidebarOpen && <span className="text-base">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded text-white/90 hover:bg-[#FF1900] hover:text-white transition-colors"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="text-base">Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#004E53]/20 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl text-[#004E53] font-semibold">
                {menuItems.find(item => item.id === currentModule)?.label || 'OPSA'}
              </h2>
              <p className="text-base text-[#009889]">
                {user?.name} - {user?.role}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-base text-[#004E53] font-medium">
                Empresa Demo S.A.
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded bg-[#004E53]/10 hover:bg-[#004E53]/20 transition-colors">
                <Languages className="text-[#004E53]" size={20} />
                <span className="text-sm text-[#004E53] font-medium">PT</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
