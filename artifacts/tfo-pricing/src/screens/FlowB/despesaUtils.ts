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
    descricao: 'Simples Nacional, ICMS, PIS/COFINS e demais tributos sobre a receita. Se você simulou produtos na tela de Diagnóstico de Margem, o ICMS já foi considerado lá — aqui você está vendo o impacto na operação completa do negócio.',
    benchMin: 4,
    benchMax: 12,
  },
  {
    id: 'comissoes_vendas',
    nome: 'Comissões de Vendas',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Incentivo pago à equipe de vendas sobre o valor faturado. Não inclui salário fixo.',
    benchMin: 2,
    benchMax: 5,
  },
  {
    id: 'taxas_cartao',
    nome: 'Taxas de Cartão / Meios de Pagamento',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'MDR de cartões de crédito e débito, taxas de antecipação e gateways de pagamento.',
    benchMin: 2,
    benchMax: 3.5,
  },
  {
    id: 'marketplace_plataformas',
    nome: 'Marketplace e Plataformas de Venda',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Comissão cobrada por Mercado Livre, Shopee, Boa Compra etc. Lançar separado das taxas de cartão para enxergar o custo real do canal.',
    benchMin: 10,
    benchMax: 20,
  },
  {
    id: 'frete_vendas',
    nome: 'Frete sobre Vendas, Devoluções e Trocas',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Custo de entrega ao cliente final, frete de retorno e retrabalho com peças devolvidas. Especialmente relevante para e-commerce e atacado com entrega inclusa.',
    benchMin: 1,
    benchMax: 3,
  },
  {
    id: 'embalagens',
    nome: 'Embalagens por Venda',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Sacolas, caixas de envio e materiais de proteção por unidade vendida. Não inclui materiais de campanha ou vitrine.',
    benchMin: 0.5,
    benchMax: 1.5,
  },
  {
    id: 'marketing_variavel',
    nome: 'Marketing',
    isPercentual: true,
    categoria: 'marketing',
    descricao: 'Fee de agência ou gestor de redes sociais, produção de fotos e vídeos, impulsionamento, embalagens de campanha e vitrine, influencers e eventos. Lançar como % do faturamento garante que a verba cresça junto com o negócio.',
    benchMin: 2,
    benchMax: 10,
  },
  {
    id: 'royalties_licencas',
    nome: 'Royalties e Licenças',
    isPercentual: true,
    categoria: 'variavel',
    descricao: '% sobre vendas pago a licenciadores de marca, franqueadores ou titulares de propriedade intelectual.',
    benchMin: 2,
    benchMax: 8,
  },
  {
    id: 'outros_variaveis',
    nome: 'Outros Variáveis',
    isPercentual: true,
    categoria: 'variavel',
    descricao: 'Outros custos que variam proporcionalmente às vendas ou percentual médio de todas as despesas variáveis para uma simulação mais rápida.',
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
    id: 'logistica_armazenagem',
    nome: 'Logística e Armazenagem',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Galpão próprio ou terceirizado (fulfillment), separado do aluguel de loja. Relevante para e-commerce e marcas com estoque centralizado.',
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
    descricao: 'Honorários de contador, advogado, consultoria e demais serviços profissionais contratados mensalmente.',
  },
  {
    id: 'seguro',
    nome: 'Seguro do Estabelecimento e Estoque',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Seguro contra incêndio, roubo e danos ao estoque físico. Divida o prêmio anual por 12 para obter o custo mensal.',
  },
  {
    id: 'taxas_licencas',
    nome: 'Taxas e Licenças Municipais',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Alvará de funcionamento, vigilância sanitária e outras taxas regulatórias anuais. Divida por 12 para obter o custo mensal.',
  },
  {
    id: 'treinamentos',
    nome: 'Cursos, Treinamentos e Capacitação',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Investimento em formação da equipe e dos sócios. Para cursos pontuais, divida o valor pelo número de meses de aplicação do aprendizado.',
  },
  {
    id: 'manutencao',
    nome: 'Manutenção e Diversos',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Pequenos reparos, limpeza, material de escritório e despesas operacionais avulsas.',
  },
  {
    id: 'outros_fixos',
    nome: 'Outros Fixos',
    isPercentual: false,
    categoria: 'fixo',
    descricao: 'Use para lançar o total de custos fixos que não se encaixam nas categorias acima, ou quando você só sabe o total mensal sem discriminação.',
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
