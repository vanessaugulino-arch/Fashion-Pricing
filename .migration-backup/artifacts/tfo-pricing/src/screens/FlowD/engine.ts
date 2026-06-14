import { FlowDState, Concorrente } from './types';
import { DIMENSOES, POSICIONAMENTOS } from './criterios';

export type TierKey = 'acesso' | 'medio' | 'premium' | 'premium_luxo';

export const TIER_CONFIG: Record<TierKey, { label: string; cor: string; multiplierMin: number; multiplierMax: number; descricao: string }> = {
  acesso: {
    label: 'Acesso',
    cor: '#6B7280',
    multiplierMin: 1.5,
    multiplierMax: 2.5,
    descricao: 'Commodity / Emergente. Fortalecer produto e marca antes de aumentar preço.',
  },
  medio: {
    label: 'Médio',
    cor: '#7C9DD0',
    multiplierMin: 2.5,
    multiplierMax: 3.5,
    descricao: 'Diferenciado / Em consolidação. Consistência de comunicação e construção de audiência própria.',
  },
  premium: {
    label: 'Premium',
    cor: '#C8B840',
    multiplierMin: 3.5,
    multiplierMax: 5.0,
    descricao: 'Consolidado / Aspiracional. Brand building intensivo — PR, editorial e experiência de marca.',
  },
  premium_luxo: {
    label: 'Premium / Luxo',
    cor: '#2F1B20',
    multiplierMin: 5.0,
    multiplierMax: 8.0,
    descricao: 'Referência de mercado / Luxo. Exclusividade máxima. Nunca promover por preço.',
  },
};

export function scoreTier(totalScore: number): TierKey {
  if (totalScore <= 22) return 'acesso';
  if (totalScore <= 34) return 'medio';
  if (totalScore <= 46) return 'premium';
  return 'premium_luxo';
}

export function calcularScoreTotal(scores: Record<string, number>, concorrentes: Concorrente[]): number {
  const sliderTotal = Object.values(scores).reduce((a, b) => a + b, 0);

  let adjustment = 0;
  let totalComp = 0;
  concorrentes.forEach(c => {
    Object.values(c.comparacoes).forEach(comp => {
      totalComp++;
      if (comp === 'eu-melhor') adjustment += 0.5;
      else if (comp === 'nao-ofereco') adjustment -= 0.25;
    });
  });

  const compBonus = totalComp > 0 ? Math.min(3, Math.max(-2, adjustment)) : 0;
  return Math.max(12, Math.min(60, Math.round(sliderTotal + compBonus)));
}

export function calcularScoresDimensao(scores: Record<string, number>) {
  const result: Record<string, { media: number; label: string; cor: string }> = {};
  Object.entries(DIMENSOES).forEach(([dim, info]) => {
    const vals = info.ids.map(id => scores[id] || 3);
    const media = vals.reduce((a, b) => a + b, 0) / vals.length;
    result[dim] = { media, label: info.label, cor: info.cor };
  });
  return result;
}

export interface PrecoSugeridoResult {
  tier: TierKey;
  config: typeof TIER_CONFIG[TierKey];
  hasPreco: boolean;
  precoMin: number;
  precoMax: number;
  precoMid: number;
  baseRef: string;
}

export function calcularPrecoSugerido(
  totalScore: number,
  concorrentes: Concorrente[],
  precoMedioAtual: string,
): PrecoSugeridoResult {
  const tier = scoreTier(totalScore);
  const config = TIER_CONFIG[tier];
  const pct = (totalScore - 12) / 48;

  const precos = concorrentes
    .map(c => parseFloat(c.precoMedio.replace(',', '.')))
    .filter(p => !isNaN(p) && p > 0);

  if (precos.length > 0) {
    const media = precos.reduce((a, b) => a + b, 0) / precos.length;
    const fator = 0.8 + pct * 0.8;
    const min = media * fator * 0.9;
    const max = media * fator * 1.15;
    return { tier, config, hasPreco: true, precoMin: min, precoMax: max, precoMid: (min + max) / 2, baseRef: `Calculado sobre a média dos concorrentes (R$ ${media.toFixed(0)})` };
  }

  const precoAtual = parseFloat(precoMedioAtual.replace(',', '.'));
  if (!isNaN(precoAtual) && precoAtual > 0) {
    const ajuste = 0.85 + pct * 0.6;
    const min = precoAtual * ajuste * 0.9;
    const max = precoAtual * ajuste * 1.2;
    return { tier, config, hasPreco: true, precoMin: min, precoMax: max, precoMid: (min + max) / 2, baseRef: 'Calculado com base no seu preço atual e no score de valor' };
  }

  return { tier, config, hasPreco: false, precoMin: 0, precoMax: 0, precoMid: 0, baseRef: '' };
}

export function getBadgeConcorrente(comparacoes: Record<string, string>): { label: string; cor: string; bg: string } {
  const vals = Object.values(comparacoes);
  if (vals.length === 0) return { label: 'Sem comparação', cor: '#6B7280', bg: '#F3F4F6' };
  const eles = vals.filter(v => v === 'eles-melhores').length;
  const euMelhor = vals.filter(v => v === 'eu-melhor').length;
  const naoOfereco = vals.filter(v => v === 'nao-ofereco').length;

  if (euMelhor > eles && euMelhor >= vals.length / 2) return { label: 'Você tem diferenciais claros aqui', cor: '#2D6A4F', bg: '#ECFDF5' };
  if (eles > euMelhor) return { label: 'Concorrente forte neste segmento', cor: '#92400E', bg: '#FFFBEB' };
  if (naoOfereco >= vals.length / 3) return { label: 'Oportunidade de diferenciação', cor: '#6B7280', bg: '#F3F4F6' };
  return { label: 'Concorrência equilibrada', cor: '#2563EB', bg: '#EFF6FF' };
}

export function getPosicionamentoInfo(tier: string) {
  return POSICIONAMENTOS.find(p => p.id === tier) || null;
}

export interface MarketingBenchmark {
  pctMin: number;
  pctMax: number;
  descricao: string;
  prioridades: string[];
  nota: string;
}

export const BENCHMARK_MARKETING: Record<TierKey, MarketingBenchmark> = {
  acesso: {
    pctMin: 3,
    pctMax: 10,
    descricao: 'Marcas no segmento Acesso investem entre 3% e 10% do faturamento em marketing.',
    prioridades: ['Marketing de performance', 'Tráfego pago (Meta/Google)', 'Promoções sazonais', 'Gestão de redes sociais'],
    nota: 'Fortalecer produto e marca antes de aumentar preço. Foco em marketing de performance e promoção.',
  },
  medio: {
    pctMin: 6,
    pctMax: 16,
    descricao: 'Marcas no segmento Médio investem entre 6% e 16% — combinando performance com construção de marca.',
    prioridades: ['Conteúdo orgânico consistente', 'Influenciadores de nicho', 'Identidade visual profissional', 'Email marketing', 'Tráfego pago estratégico'],
    nota: 'Consistência de comunicação e construção de audiência própria são fundamentais para consolidar o posicionamento.',
  },
  premium: {
    pctMin: 10,
    pctMax: 24,
    descricao: 'Marcas Premium investem entre 10% e 24% — com foco crescente em construção de marca e autoridade.',
    prioridades: ['Brand building e identidade editorial', 'Relações públicas e press', 'Influenciadores alinhados ao posicionamento', 'Lookbooks e campanhas sazonais', 'Experiência de embalagem'],
    nota: 'Brand building intensivo. PR, editorial e experiência de marca são os principais investimentos.',
  },
  premium_luxo: {
    pctMin: 15,
    pctMax: 32,
    descricao: 'Marcas Premium/Luxo investem 15% ou mais — o marketing é parte da experiência e da percepção de exclusividade.',
    prioridades: ['PR e editorial high-end', 'Eventos e experiências exclusivas', 'Produção visual premium', 'Assessoria de imprensa especializada', 'Parcerias estratégicas com veículos premium'],
    nota: 'Exclusividade, PR internacional, editorial e experiências exclusivas. Nunca promover por preço.',
  },
};

export function getMarketingRecomendacao(
  tier: TierKey,
  scoreInvestimento: number,
  posAtual: string,
  posDesejado: string,
): { benchmark: MarketingBenchmark; status: 'abaixo' | 'ok' | 'acima'; texto: string } {
  const benchmark = BENCHMARK_MARKETING[tier];

  // score 1-2 = provavelmente abaixo do benchmark, 3 = na média, 4-5 = dentro ou acima
  const status: 'abaixo' | 'ok' | 'acima' =
    scoreInvestimento <= 2 ? 'abaixo' : scoreInvestimento >= 4 ? 'ok' : 'ok';

  const subirPosicionamento = posDesejado && posDesejado !== posAtual;
  const tierOrder: TierKey[] = ['acesso', 'medio', 'premium', 'premium_luxo'];
  const idxAtual = tierOrder.indexOf(posAtual as TierKey);
  const idxDesejado = tierOrder.indexOf(posDesejado as TierKey);
  const querSubir = subirPosicionamento && idxDesejado > idxAtual;

  let texto = '';
  if (scoreInvestimento <= 2) {
    texto = `Seu score de investimento em marketing está baixo. Para o posicionamento ${TIER_CONFIG[tier].label}, o mercado recomenda alocar entre ${benchmark.pctMin}% e ${benchmark.pctMax}% do faturamento.`;
  } else if (scoreInvestimento === 3) {
    texto = `Seu investimento em marketing é occasional. Para consolidar o posicionamento ${TIER_CONFIG[tier].label}, estruture um orçamento de ${benchmark.pctMin}%–${benchmark.pctMax}% do faturamento com regularidade.`;
  } else {
    texto = `Seu investimento em marketing está alinhado com o posicionamento ${TIER_CONFIG[tier].label}. O benchmark de mercado é ${benchmark.pctMin}%–${benchmark.pctMax}% do faturamento.`;
  }

  if (querSubir) {
    const benchmarkDestino = BENCHMARK_MARKETING[posDesejado as TierKey];
    texto += ` Para chegar ao posicionamento ${TIER_CONFIG[posDesejado as TierKey].label} desejado, o benchmark sobe para ${benchmarkDestino.pctMin}%–${benchmarkDestino.pctMax}%.`;
  }

  return { benchmark, status, texto };
}
