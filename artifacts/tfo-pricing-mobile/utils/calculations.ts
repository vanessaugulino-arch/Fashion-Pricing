export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number | null | undefined, decimals = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${value.toFixed(decimals)}%`;
};

export const formatMultiplier = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return `${value.toFixed(2)}x`;
};

export const calcMargemBrutaRS = (preco: number, custo: number, icms: number): number => {
  const deducoes = preco * (icms / 100);
  return preco - custo - deducoes;
};

export const calcMargemBrutaPerc = (preco: number, margemRS: number): number => {
  if (!preco || preco === 0) return 0;
  return (margemRS / preco) * 100;
};

export const calcMarkup = (preco: number, custo: number): number | null => {
  if (!custo || custo === 0) return null;
  return preco / custo;
};

export const calcPrecoIdeal = (
  custo: number,
  icms: number,
  taxas: number,
  margem: number
): number | null => {
  const soma = (icms + taxas + margem) / 100;
  if (soma >= 1) return null;
  return custo / (1 - soma);
};

export const calcPrecoMinViavel = (custo: number, icms: number, taxas = 0): number | null => {
  const soma = (icms + taxas) / 100;
  if (soma >= 1) return null;
  return custo / (1 - soma);
};

export const calcResultadoMensal = (
  faturamento: number,
  mc_perc: number,
  custoFixo: number
): number => {
  return (faturamento * mc_perc) / 100 - custoFixo;
};

export const calcMC_RS = (
  preco: number,
  custo: number,
  icms: number,
  custoVariavel: number
): number => {
  const deducoes = preco * ((icms + custoVariavel) / 100);
  return preco - custo - deducoes;
};

export const calcMC_Perc = (mc_rs: number, preco: number): number => {
  if (!preco || preco === 0) return 0;
  return (mc_rs / preco) * 100;
};

export const calcPontoEquilibrio = (custoFixo: number, mc_perc: number): number | null => {
  if (!mc_perc || mc_perc === 0) return null;
  return custoFixo / (mc_perc / 100);
};

export type StatusType = "ok" | "warning" | "critical" | "excellent";

export const getMargemStatus = (
  margem: number,
  min: number,
  max: number
): StatusType => {
  if (margem > max) return "excellent";
  if (margem >= min) return "ok";
  if (margem < min - 10) return "critical";
  return "warning";
};

export const getMargemDiagnosis = (
  margem: number,
  min: number,
  max: number,
  segmentoLabel: string
): { title: string; body: string } => {
  const m = margem.toFixed(0);
  if (margem > max) {
    return {
      title: "Margem acima da média",
      body: `Sua margem de ${m}% está acima da referência de mercado. Boa captura de valor — verifique se o preço não está limitando o volume de vendas.`,
    };
  }
  if (margem >= min) {
    return {
      title: "Margem dentro da média de mercado",
      body: `Sua margem de ${m}% está dentro da faixa esperada para ${segmentoLabel} (${min}%–${max}%). O próximo passo é otimizar o portfólio.`,
    };
  }
  if (margem < min - 10) {
    return {
      title: "Margem muito abaixo do mercado",
      body: `Sua margem de ${m}% está significativamente abaixo da faixa típica (${min}%–${max}%). Revise o preço, reduza custos ou verifique a estrutura de venda.`,
    };
  }
  return {
    title: "Margem abaixo da média de mercado",
    body: `Sua margem de ${m}% está ${Math.abs(margem - min).toFixed(0)}pp abaixo da referência mínima (${min}%). Pequenos ajustes podem mudar esse cenário.`,
  };
};
