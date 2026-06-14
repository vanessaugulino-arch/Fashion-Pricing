export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

export const formatPercent = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
};

export const formatMultiplier = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${value.toFixed(2)}x`;
};

export const calcCustoTotal = ({ preco, custo, icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0 }: { preco: number; custo: number; icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number }) => {
  const percentuaisSobrePreco = (icms + taxas + comissoes + devolucao + outros) / 100;
  const valorDeducoes = preco * percentuaisSobrePreco;
  const custoTotal = custo + valorDeducoes;
  return {
    custoTotal,
    breakdown: {
      custoProduto: custo,
      impostos: preco * (icms / 100),
      taxasPagamento: preco * (taxas / 100),
      comissoes: preco * (comissoes / 100),
      devolucao: preco * (devolucao / 100),
      outros: preco * (outros / 100),
    }
  };
};

export const calcMargemBrutaRS = (preco: number, custoTotal: number): number => preco - custoTotal;
export const calcMargemBrutaPerc = (preco: number, custoTotal: number): number => {
  if (!preco || preco === 0) return 0;
  return ((preco - custoTotal) / preco) * 100;
};

export const calcPrecoMinViavel = ({ custo, icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0 }: { custo: number; icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number }): number | null => {
  const soma = (icms + taxas + comissoes + devolucao + outros) / 100;
  if (soma >= 1) return null;
  return custo / (1 - soma);
};

export const calcPrecoDivido = ({ custo, icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0, margem = 42 }: { custo: number; icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number; margem?: number }): number | null => {
  const soma = (icms + taxas + comissoes + devolucao + outros + margem) / 100;
  if (soma >= 1) return null;
  return custo / (1 - soma);
};

export const calcMarkupMultiplicador = ({ icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0, margem = 42 }: { icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number; margem?: number }): number | null => {
  const soma = (icms + taxas + comissoes + devolucao + outros + margem) / 100;
  if (soma >= 1) return null;
  return 1 / (1 - soma);
};

export const calcMargemRealDePreco = ({ preco, custo, icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0 }: { preco: number; custo: number; icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number }): number => {
  const { custoTotal } = calcCustoTotal({ preco, custo, icms, taxas, comissoes, devolucao, outros });
  return calcMargemBrutaPerc(preco, custoTotal);
};

export const calcSomaPercentuais = ({ icms = 0, taxas = 0, comissoes = 0, devolucao = 0, outros = 0, margem = 0 }: { icms?: number; taxas?: number; comissoes?: number; devolucao?: number; outros?: number; margem?: number }): number => {
  return icms + taxas + comissoes + devolucao + outros + margem;
};

export const calcPrecoRealizado = (faturamento: number, quantidade: number): number | null => {
  if (!quantidade || quantidade === 0) return null;
  return faturamento / quantidade;
};

export const calcMC_RS = ({ preco, custo, icms = 0, custoVariavel = 0 }: { preco: number; custo: number; icms?: number; custoVariavel?: number }): number => {
  const deducoes = preco * ((icms + custoVariavel) / 100);
  return preco - custo - deducoes;
};

export const calcMC_Perc = (mc_rs: number, preco: number): number => {
  if (!preco || preco === 0) return 0;
  return (mc_rs / preco) * 100;
};

export const calcResultadoMensal = ({ faturamento, mc_perc, custoFixo }: { faturamento: number; mc_perc: number; custoFixo: number }): number => {
  return (faturamento * mc_perc / 100) - custoFixo;
};

export const calcMarkup = (preco: number, custo: number): number | null => {
  if (!custo || custo === 0) return null;
  return preco / custo;
};

export const calcRemarcacao = (precoRealizado: number, precoDefinido: number): number | null => {
  if (!precoDefinido || precoDefinido === 0) return null;
  return ((precoRealizado / precoDefinido) - 1) * 100;
};

export const calcPontoEquilibrio_RS = (custoFixo: number, mc_perc: number): number | null => {
  if (!mc_perc || mc_perc === 0) return null;
  return custoFixo / (mc_perc / 100);
};

export const calcPontoEquilibrio_Unidades = (pe_rs: number, precoMedio: number): number | null => {
  if (!precoMedio || precoMedio === 0) return null;
  return Math.ceil(pe_rs / precoMedio);
};

export const calcDistanciaPE = (faturamento: number, pe_rs: number): number | null => {
  if (!pe_rs || pe_rs === 0) return null;
  return ((faturamento - pe_rs) / pe_rs) * 100;
};

export const calcMixResult = ({ papeis, faturamentoTotal, volumeTotal, custoFixo }: { papeis: Record<string, { participacao: number; margem: number; remarcacao: number; precoMedio?: number }>; faturamentoTotal: number; volumeTotal: number; custoFixo?: number }) => {
  const results: Record<string, { faturamento_bruto: number; faturamento_realizado: number; mc_rs: number; volume: number }> = {};
  let mc_total_rs = 0;
  let faturamento_mix_total = 0;
  Object.entries(papeis).forEach(([key, papel]) => {
    const faturamento_bruto = (papel.participacao / 100) * faturamentoTotal;
    const faturamento_realizado = faturamento_bruto * (1 - papel.remarcacao / 100);
    const mc_rs = faturamento_realizado * (papel.margem / 100);
    const volume = (papel.participacao / 100) * volumeTotal;
    results[key] = { faturamento_bruto, faturamento_realizado, mc_rs, volume: Math.round(volume) };
    mc_total_rs += mc_rs;
    faturamento_mix_total += faturamento_realizado;
  });
  const mc_ponderada = faturamento_mix_total > 0 ? (mc_total_rs / faturamento_mix_total) * 100 : 0;
  const resultado = mc_total_rs - (custoFixo || 0);
  const preco_medio_inicial = Object.values(papeis).reduce((acc, p) => acc + (p.participacao / 100) * (p.precoMedio || 0), 0);
  const preco_medio_realizado = Object.values(papeis).reduce((acc, p) => acc + (p.participacao / 100) * (p.precoMedio || 0) * (1 - p.remarcacao / 100), 0);
  return { detalhes: results, mc_ponderada, resultado, preco_medio_inicial, preco_medio_realizado };
};