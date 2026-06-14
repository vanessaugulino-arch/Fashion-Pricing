import type { DespesaItem } from '@/store/useToolStore';

// ─── Predefined expense catalog ──────────────────────────────────────────────

export interface DespesaPredefinida {
  id: string;
  nome: string;
  isPercentual: boolean;   // true = % sobre vendas, false = R$/mês
  categoria: 'fixo' | 'variavel' | 'marketing';
  descricao: string;
  benchMin?: number;
  benchMax?: number;
}

export const DESPESAS_VARIAVEIS: DespesaPredefinida[] = [
  {
    id: 'impostos_vendas',
    nome: 'Impostos sobre Vendas',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Simples Nacional, ICMS, PIS/COFINS',
    benchMin: 4,
    benchMax: 12,
  },
  {
    id: 'comissoes_vendas',
    nome: 'Comissões de Vendas',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Incentivos pagos à equipe de vendas sobre o valor faturado',
    benchMin: 2,
    benchMax: 5,
  },
  {
    id: 'taxas_cartao',
    nome: 'Taxas de Cartão / Meios de Pagamento',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Custos de antecipação e taxas de administração de cartões/links',
    benchMin: 2,
    benchMax: 3.5,
  },
  {
    id: 'frete_vendas',
    nome: 'Frete sobre Vendas',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Custos de entrega ao cliente final (comum em e-commerce)',
    benchMin: 1,
    benchMax: 3,
  },
  {
    id: 'embalagens',
    nome: 'Embalagens',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Sacolas, caixas, etiquetas e materiais de proteção',
    benchMin: 0.5,
    benchMax: 1.5,
  },
  {
    id: 'marketing_trafego',
    nome: 'Marketing de Tração / Performance',
    isPercentual: true,
    categoria: 'marketing',
    descricao: 'Tráfego pago, impulsionamentos, campanhas de conversão',
    benchMin: 2,
    benchMax: 8,
  },
  {
    id: 'outros_variaveis',
    nome: 'Outros Variáveis',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Outros custos que variam proporcionalmente às vendas',
  },
];

export const DESPESAS_FIXAS: DespesaPredefinida[] = [
  {
    id: 'aluguel',
    nome: 'Aluguel e Ocupação',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Aluguel, condomínio, IPTU e taxas de shopping',
    benchMin: 5,
    benchMax: 10,
  },
  {
    id: 'folha_pagamento',
    nome: 'Folha de Pagamento Fixa',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Salários base, encargos sociais, benefícios e pró-labore',
    benchMin: 10,
    benchMax: 15,
  },
  {
    id: 'marketing',
    nome: 'Marketing e Publicidade',
    isPercentual: false,
    categoria: 'marketing',
    descricao: 'Agências de marketing, mídia, conteúdo',
  },
  {
    id: 'marketing_branding',
    nome: 'Marketing Estrutural / Branding',
    isPercentual: false,
    categoria: 'marketing',
    descricao: 'Identidade de marca, produção de conteúdo, fotografia de campanha',
  },
  {
    id: 'utilidades',
    nome: 'Utilidades',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Energia elétrica, água, telefone e internet',
  },
  {
    id: 'sistemas',
    nome: 'Sistemas e Tecnologia',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Software de gestão (ERP), e-commerce e ferramentas digitais',
  },
  {
    id: 'servicos_terceiros',
    nome: 'Serviços de Terceiros',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Honorários de contador, jurídico e consultorias',
  },
  {
    id: 'manutencao',
    nome: 'Manutenção e Diversos',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Limpeza, pequenos reparos e material de escritório',
  },
  {
    id: 'outros_fixos',
    nome: 'Outros Fixos',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Outros custos fixos mensais não listados acima',
  },
];

export const TODAS_DESPESAS = [...DESPESAS_VARIAVEIS, ...DESPESAS_FIXAS];

export function getDespesaPredefinida(id: string): DespesaPredefinida | undefined {
  return TODAS_DESPESAS.find(d => d.id === id);
}

// ─── Classification (for import) ─────────────────────────────────────────────

type Categoria = DespesaItem['categoria'];

const KEYWORDS: Record<Exclude<Categoria, 'outro'>, string[]> = {
  fixo: [
    'aluguel', 'salário', 'salario', 'pro-labore', 'prolabore',
    'contador', 'contabilidade', 'internet', 'telefone', 'energia',
    'água', 'agua', 'condomínio', 'condominio', 'seguro',
    'manutenção', 'manutencao', 'sistema', 'erp', 'software',
    'assinatura', 'tarifa', 'bancária', 'bancaria', 'financiamento',
    'empréstimo', 'emprestimo', 'vigilância', 'vigilancia',
    'limpeza', 'iptu', 'alvará', 'alvara',
  ],
  variavel: [
    'comissão', 'comissao', 'frete', 'embalagem', 'sacola',
    'cartão', 'cartao', 'taxa', 'maquininha', 'pix', 'marketplace',
    'plataforma', 'devolução', 'devolucao',
  ],
  imposto: [
    'imposto', 'icms', 'ipi', 'pis', 'cofins', 'iss', 'das',
    'simples', 'irpj', 'csll', 'difal', 'tributo',
  ],
  marketing: [
    'marketing', 'publicidade', 'propaganda', 'anúncio', 'anuncio',
    'instagram', 'facebook', 'google', 'ads', 'influencer',
    'fotografia', 'foto', 'lookbook',
  ],
};

export function classificarDespesa(nome: string): Categoria {
  const lower = nome.toLowerCase();
  for (const [cat, keywords] of Object.entries(KEYWORDS) as [Exclude<Categoria, 'outro'>, string[]][]) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'outro';
}

export function isVariavelPorNome(nome: string): boolean {
  const cat = classificarDespesa(nome);
  return cat === 'variavel' || cat === 'imposto';
}

// ─── Visual config ────────────────────────────────────────────────────────────

export const CATEGORIA_CONFIG: Record<Categoria, { label: string; icon: string; bg: string; text: string; border: string }> = {
  fixo:      { label: 'Fixo',      icon: '🏢', bg: '#EEF3FA', text: '#1E40AF', border: '#BFDBFE' },
  variavel:  { label: 'Variável',  icon: '📦', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  imposto:   { label: 'Imposto',   icon: '💰', bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  marketing: { label: 'Marketing', icon: '📣', bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  outro:     { label: 'Outro',     icon: '❓', bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
};

export const TIPO_CONFIG = {
  variavel: { label: 'Variável', bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', icon: '📦' },
  fixo:     { label: 'Fixo',    bg: '#EEF3FA', text: '#1E40AF', border: '#BFDBFE', icon: '🏢' },
};
