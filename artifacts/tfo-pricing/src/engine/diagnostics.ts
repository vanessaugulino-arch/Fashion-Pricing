import { getBenchmark, BENCHMARK_MARGEM_BRUTA, BENCHMARK_MC, BENCHMARK_REMARCACAO, getInvestMktBenchmark } from './benchmarks';

export interface Diagnosis {
  status: 'ok' | 'warning' | 'critical' | 'excellent' | 'info';
  icon: string;
  title: string;
  body: string;
  cta: string | null;
  driver?: string;
  priority?: number;
}

export const diagnosisFlowA = (margemPerc: number, segmento: string, modelo: string): Diagnosis => {
  const [min, max] = getBenchmark(BENCHMARK_MARGEM_BRUTA, segmento, modelo);
  const distancia = margemPerc - min;
  const m = margemPerc.toFixed(0);
  if (margemPerc < min - 10) {
    return { status: 'critical', icon: '⚠️', title: 'Margem muito abaixo do mercado', body: `Sua margem de ${m}% está significativamente abaixo da faixa típica para este segmento (${min}%–${max}%). Isso pode indicar preço abaixo do ideal, custo elevado ou estrutura de venda cara.`, cta: 'Calcular o preço ideal' };
  }
  if (margemPerc < min) {
    return { status: 'warning', icon: '📊', title: 'Margem abaixo da média de mercado', body: `Sua margem de ${m}% está ${Math.abs(distancia).toFixed(0)} pp abaixo da referência mínima (${min}%). Pequenos ajustes de preço ou custo podem mudar esse cenário.`, cta: 'Simular novo preço' };
  }
  if (margemPerc <= max) {
    return { status: 'ok', icon: '✅', title: 'Margem dentro da média de mercado', body: `Sua margem de ${m}% está dentro da faixa esperada para o segmento (${min}%–${max}%). O próximo passo é otimizar o portfólio e a estratégia de markdown.`, cta: 'Analisar o negócio completo' };
  }
  return { status: 'excellent', icon: '🎯', title: 'Margem acima da média', body: `Sua margem está acima da referência de mercado — boa captura de valor. Verifique se o preço não está limitando o volume de vendas.`, cta: null };
};

export const generateInsightsFlowB = ({ mc_perc, resultado, remarcacao_perc, faturamento, custo_fixo, segmento, modelo, mktg_perc }: { mc_perc: number; resultado: number; remarcacao_perc: number | null; faturamento: number; custo_fixo: number; segmento: string; modelo: string; mktg_perc?: number; }): Diagnosis[] => {
  const insights: Diagnosis[] = [];
  const [mcMin, mcMax] = getBenchmark(BENCHMARK_MC, segmento, modelo);
  const [remMin, remMax] = getBenchmark(BENCHMARK_REMARCACAO, segmento);
  const custo_fixo_perc = faturamento > 0 ? (custo_fixo / faturamento) * 100 : 0;
  if (resultado < 0) {
    const gap = Math.abs(resultado);
    insights.push({ priority: 1, status: 'critical', icon: '⚠️', driver: 'resultado', title: 'Negócio operando no prejuízo', body: `Com os dados informados, o resultado estimado é de R$ ${Math.abs(resultado).toFixed(0)} negativo por mês. Para equilibrar, você precisaria de R$ ${(faturamento + gap).toFixed(0)} de faturamento — ou reduzir as despesas fixas em R$ ${gap.toFixed(0)}.`, cta: null });
  }
  if (mc_perc < mcMin) {
    insights.push({ priority: 2, status: 'warning', icon: '📊', driver: 'margem', title: 'Margem de contribuição abaixo do esperado', body: `Sua MC de ${mc_perc.toFixed(0)}% está abaixo da faixa típica para o segmento (${mcMin}%–${mcMax}%). Isso limita quanto cada venda contribui para cobrir as despesas fixas e gerar resultado.`, cta: null });
  }
  if (remarcacao_perc !== null) {
    const rem_abs = Math.abs(remarcacao_perc);
    if (rem_abs > remMax) {
      insights.push({ priority: 3, status: 'warning', icon: '🏷️', driver: 'remarcacao', title: 'Desconto acima da média do mercado', body: `Você desconta em média ${rem_abs.toFixed(0)}% — acima do típico para o segmento (${remMin}%–${remMax}%). Descontos excessivos corroem a margem e podem criar dependência de promoção.`, cta: null });
    }
  }
  if (custo_fixo_perc > 35 && insights.length < 3) {
    insights.push({ priority: 4, status: 'info', icon: '🏗️', driver: 'custo_fixo', title: 'Estrutura fixa elevada para o volume atual', body: `Suas despesas fixas representam ${custo_fixo_perc.toFixed(0)}% do faturamento. Acima de 30% é um sinal de atenção. Crescer o faturamento ou revisar a estrutura são os caminhos.`, cta: null });
  }
  if (mktg_perc != null && mktg_perc > 0 && insights.length < 3) {
    const [mktMin, mktMax] = getInvestMktBenchmark(segmento);
    if (mktg_perc < mktMin) {
      insights.push({ priority: 5, status: 'info', icon: '📣', driver: 'marketing', title: 'Investimento em marketing abaixo do sugerido', body: `Você investe ${mktg_perc.toFixed(1)}% do faturamento em marketing — abaixo da faixa típica para o segmento (${mktMin}%–${mktMax}%). Marketing é um dos principais alavancadores de volume e margem no varejo de moda.`, cta: null });
    } else if (mktg_perc > mktMax) {
      insights.push({ priority: 5, status: 'warning', icon: '📣', driver: 'marketing', title: 'Investimento em marketing acima do típico', body: `Você investe ${mktg_perc.toFixed(1)}% do faturamento em marketing — acima da faixa típica para o segmento (${mktMin}%–${mktMax}%). Pode ser estratégico em fase de crescimento; monitore o retorno sobre o investimento.`, cta: null });
    }
  }
  if (insights.length === 0) {
    insights.push({ priority: 6, status: 'ok', icon: '✅', driver: 'equilibrio', title: 'Negócio com indicadores equilibrados', body: `Seus indicadores estão dentro dos padrões esperados para o segmento. O próximo passo é crescimento com controle de margem — e otimizar a distribuição do portfólio.`, cta: null });
  }
  return insights.sort((a, b) => (a.priority || 0) - (b.priority || 0)).slice(0, 3);
};

export const getMainDriver = (insights: Diagnosis[]): string => {
  if (!insights?.length) return 'múltiplos fatores';
  const labels: Record<string, string> = {
    resultado: 'desequilíbrio entre custo fixo e faturamento',
    margem: 'precificação ou custo do produto',
    remarcacao: 'política de desconto',
    custo_fixo: 'estrutura de despesas fixas',
    equilibrio: 'manutenção da eficiência atual',
  };
  return labels[insights[0].driver || ''] ?? 'múltiplos fatores';
};