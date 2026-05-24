export type UserRole = 'Admin' | 'Gestor' | 'Contabilista' | 'Operacional' | 'Auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  empresaId: string;
}

export interface Empresa {
  id: string;
  nome: string;
  nif: string;
  morada: string;
  moeda: string;
  periodoFiscal: string;
}

export interface Cliente {
  id: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  saldo: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  nif: string;
  email: string;
  telefone: string;
  morada: string;
  saldo: number;
}

export interface Artigo {
  id: string;
  sku: string;
  nome: string;
  descricao: string;
  custo: number;
  preco: number;
  iva: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  data: string;
  vencimento: string;
  total: number;
  iva: number;
  estado: 'Aberta' | 'Paga' | 'Vencida';
  linhas: LinhaFatura[];
}

export interface LinhaFatura {
  artigoId: string;
  quantidade: number;
  preco: number;
  iva: number;
  total: number;
}

export interface Compra {
  id: string;
  numero: string;
  fornecedorId: string;
  data: string;
  vencimento: string;
  total: number;
  iva: number;
  estado: 'Rascunho' | 'Aprovado' | 'Lançado' | 'Pago';
  linhas: LinhaCompra[];
}

export interface LinhaCompra {
  artigoId: string;
  quantidade: number;
  preco: number;
  iva: number;
  total: number;
}

export interface MovimentoStock {
  id: string;
  artigoId: string;
  tipo: 'Entrada' | 'Saída' | 'Transferência' | 'Ajuste';
  quantidade: number;
  data: string;
  custo: number;
}

export interface ContaBancaria {
  id: string;
  nome: string;
  iban: string;
  saldo: number;
  tipo: 'Bancária' | 'Caixa';
}

export interface LancamentoContabilistico {
  id: string;
  data: string;
  descricao: string;
  conta: string;
  debito: number;
  credito: number;
  documento?: string;
}

export interface Insight {
  id: string;
  tipo: 'Tendência' | 'Risco' | 'Oportunidade' | 'Alerta';
  titulo: string;
  descricao: string;
  explicacao: string;
  fonte: string;
  data: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
}

export interface KPI {
  label: string;
  value: string | number;
  variation?: number;
  trend?: 'up' | 'down';
}
