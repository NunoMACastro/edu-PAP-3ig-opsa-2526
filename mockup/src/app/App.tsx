import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/modules/Dashboard';
import { Vendas } from './components/modules/Vendas';
import { Compras } from './components/modules/Compras';
import { Inventario } from './components/modules/Inventario';
import { Contabilidade } from './components/modules/Contabilidade';
import { Bancos } from './components/modules/Bancos';
import { IA } from './components/modules/IA';
import { Configuracoes } from './components/modules/Configuracoes';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendas':
        return <Vendas />;
      case 'compras':
        return <Compras />;
      case 'inventario':
        return <Inventario />;
      case 'contabilidade':
        return <Contabilidade />;
      case 'bancos':
        return <Bancos />;
      case 'ia':
        return <IA />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentModule={currentModule} onModuleChange={setCurrentModule}>
      {renderModule()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}