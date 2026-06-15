export interface CampoImport {
  id: string;
  label: string;
  tipo: 'monetario' | 'inteiro' | 'texto';
  obrigatorio: boolean;
  keywords: string[];
}

export interface ModeloImport {
  id: string;
  label: string;
  descricao: string;
  campos: CampoImport[];
}

export const MODELO_VENDAS: ModeloImport = {
  id: 'vendas',
  label: 'Dados de vendas',
  descricao: 'Preço, custo, faturamento e quantidade vendida',
  campos: [
    {
      id: 'preco',
      label: 'Preço médio de venda',
      tipo: 'monetario',
      obrigatorio: false,
      keywords: ['preço', 'preco', 'valor unit', 'venda', 'pvp', 'price'],
    },
    {
      id: 'custo',
      label: 'Custo médio do produto',
      tipo: 'monetario',
      obrigatorio: false,
      keywords: ['custo', 'cost', 'cmv', 'compra'],
    },
    {
      id: 'faturamento',
      label: 'Faturamento mensal',
      tipo: 'monetario',
      obrigatorio: false,
      keywords: ['fat', 'receita', 'revenue', 'total vendas', 'gross'],
    },
    {
      id: 'quantidade',
      label: 'Quantidade de peças/mês',
      tipo: 'inteiro',
      obrigatorio: false,
      keywords: ['qtd', 'quant', 'peça', 'peca', 'unid', 'qty', 'pieces'],
    },
  ],
};

export const MODELO_DESPESAS: ModeloImport = {
  id: 'despesas',
  label: 'Despesas e custos',
  descricao: 'Lista de despesas com nome e valor',
  campos: [
    {
      id: 'nome_despesa',
      label: 'Nome da despesa',
      tipo: 'texto',
      obrigatorio: true,
      keywords: ['descri', 'nome', 'item', 'despesa', 'expense', 'description'],
    },
    {
      id: 'valor_despesa',
      label: 'Valor mensal (R$)',
      tipo: 'monetario',
      obrigatorio: true,
      keywords: ['valor', 'montante', 'total', 'value', 'amount', 'mensal'],
    },
    {
      id: 'tipo_despesa',
      label: 'Tipo (% ou R$)',
      tipo: 'texto',
      obrigatorio: false,
      keywords: ['tipo', 'type', 'modalidade', 'natureza', 'forma'],
    },
  ],
};

export function sugerirCampo(nomeColuna: string, modeloId: 'vendas' | 'despesas'): string {
  const lower = nomeColuna.toLowerCase();
  if (modeloId === 'vendas') {
    if (lower.includes('preço') || lower.includes('preco') || lower.includes('valor unit') || lower.includes('venda') || lower.includes('pvp') || lower.includes('price')) return 'preco';
    if (lower.includes('custo') || lower.includes('cost') || lower.includes('cmv') || lower.includes('compra')) return 'custo';
    if (lower.includes('fat') || lower.includes('receita') || lower.includes('revenue') || lower.includes('gross')) return 'faturamento';
    if (lower.includes('qtd') || lower.includes('quant') || lower.includes('peça') || lower.includes('peca') || lower.includes('unid') || lower.includes('qty')) return 'quantidade';
  } else {
    if (lower.includes('tipo') || lower.includes('type') || lower.includes('modalidade') || lower.includes('natureza')) return 'tipo_despesa';
    if (lower.includes('descri') || lower.includes('nome') || lower.includes('item') || lower.includes('despesa') || lower.includes('expense') || lower.includes('description')) return 'nome_despesa';
    if (lower.includes('valor') || lower.includes('montante') || lower.includes('total') || lower.includes('value') || lower.includes('amount') || lower.includes('mensal')) return 'valor_despesa';
  }
  return 'nao_importar';
}

export function inferirTipoFromCell(valor: string): boolean | null {
  const lower = valor.toLowerCase().trim();
  if (lower.includes('%') || lower === 'variavel' || lower === 'variável' || lower === 'percentual' || lower === 'percent') return true;
  if (lower === 'fixo' || lower === 'fixe' || lower === 'fixed' || lower === 'r$') return false;
  return null;
}
