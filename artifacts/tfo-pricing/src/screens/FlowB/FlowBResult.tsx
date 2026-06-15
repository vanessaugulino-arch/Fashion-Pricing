import React, { useMemo, useState } from 'react';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';
import { MIX_DEFAULTS_POR_PERFIL, PAPEL_PRODUTO_DEFAULTS, getBenchmark, BENCHMARK_REMARCACAO, BENCHMARK_MC, getInvestMktBenchmark } from '@/engine/benchmarks';
import { motion } from 'framer-motion';
import { useToolStore } from '@/store/useToolStore';
import type { DespesaItem } from '@/store/useToolStore';
import { CATEGORIA_CONFIG } from './despesaUtils';
import UpgradeModal from '@/components/ui/UpgradeModal';

// ─── Types ──────────────────────────────────────────────────────────────────

type Canal = 'varejo' | 'atacado' | 'hibrido';

interface DespesasPorCategoria {
  fixo: number;
  variavel: number;
  imposto: number;
  marketing: number;
  outro: number;
}

interface FlowBResultData {
  segmento: string;
  segmentoLabel: string;
  canal: Canal;
  canalBenchmark: 'varejo' | 'atacado';
  percVarejo: number;
  percAtacado: number;
  precoMedioConsolidado: number;
  custoMedio: number;
  faturamentoTotal: number;
  pecasTotal: number;
  custoVariavelConsolidado: number;
  custoVariavelRs: number;
  fixo: number;
  mc_rs: number;
  mc_pct: number;
  resultado: number;
  markup: number;
  pe_rs: number | null;
  distanciaPE: number | null;
  remarcacao: number | null;
  margemBruta: number;
  porteLabel: string;
  insights: Array<{ icon: string; title: string; body: string; status: string; driver?: string }>;
  benchRange: [number, number];
  despesasPorCategoria: DespesasPorCategoria;
  despesasLista: DespesaItem[];
  perfilMarca?: string;
}

interface Props {
  resultData: FlowBResultData;
  onBack: () => void;
  setActiveFlow: (flow: any) => void;
}

// ─── Badge helper ────────────────────────────────────────────────────────────

function MetricBadge({ value, benchMin, benchMax, isMonetary, inverse }: {
  value: number;
  benchMin?: number;
  benchMax?: number;
  isMonetary?: boolean;
  inverse?: boolean;
}) {
  if (benchMin === undefined) return null;
  const inRange = value >= (benchMin || 0) && value <= (benchMax || Infinity);
  const below = value < (benchMin || 0);
  let bg = '#ECFDF5'; let color = '#065F46'; let label = 'Na faixa';
  if (inverse ? !below : below) { bg = '#FEF2F2'; color = '#991B1B'; label = 'Abaixo'; }
  else if (!inRange && !below) { bg = '#EEF3FA'; color = '#1D4ED8'; label = 'Acima'; }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

// ─── Improved insight titles ─────────────────────────────────────────────────

const INSIGHT_TITLE_REMAP: Record<string, string> = {
  resultado: 'O negócio está fechando no vermelho',
  margem: 'Cada peça vendida contribui pouco para cobrir as despesas',
  remarcacao: 'Os descontos estão corroendo a margem',
  custo_fixo: 'A estrutura fixa está pesada para o volume atual',
  equilibrio: 'Indicadores equilibrados — hora de crescer com controle',
};

// ─── Scenario block ──────────────────────────────────────────────────────────

function ScenarioBlock({ resultData }: { resultData: FlowBResultData }) {
  const { cenarios, salvarCenario, deletarCenario, setActiveFlow } = useToolStore();
  const [showInput, setShowInput] = useState(false);
  const [nomeInput, setNomeInput] = useState('');
  const [savedConfirm, setSavedConfirm] = useState(false);

  const handleSave = () => {
    if (!nomeInput.trim()) return;
    salvarCenario(nomeInput.trim(), resultData);
    setNomeInput('');
    setShowInput(false);
    setSavedConfirm(true);
    setTimeout(() => setSavedConfirm(false), 2000);
  };

  const canCompare = cenarios.length >= 2;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
      <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20] mb-4">Seus Cenários</div>
      {cenarios.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {cenarios.map(c => (
            <div key={c.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-[14px] leading-none pt-0.5">📋</span>
                <div className="min-w-0">
                  <div className="font-sans font-semibold text-[13px] text-[#2F1B20] truncate">{c.nome}</div>
                  <div className="text-[11px] text-gray-400 font-sans mt-0.5">
                    MC: {formatPercent(c.resultado?.mc_pct)} · Resultado: {formatCurrency(c.resultado?.resultado)} · Markup: {formatMultiplier(c.resultado?.markup)}
                    {c.resultado?.pecasTotal ? ` · ${Math.round(c.resultado.pecasTotal)} peças/mês` : ''}
                  </div>
                </div>
              </div>
              <button onClick={() => deletarCenario(c.id)} className="text-gray-300 hover:text-red-400 transition-colors text-[16px] leading-none shrink-0 mt-0.5" title="Remover">✕</button>
            </div>
          ))}
        </div>
      )}

      {showInput ? (
        <div className="flex gap-2 mb-4">
          <input
            autoFocus type="text" value={nomeInput}
            onChange={e => setNomeInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowInput(false); }}
            placeholder="Ex: Cenário base, Otimista, Conservador"
            className="flex-1 border-[1.5px] border-gray-300 rounded-xl px-3 py-2.5 text-[14px] font-sans outline-none focus:border-[#7C9DD0] transition-all"
          />
          <button onClick={handleSave} disabled={!nomeInput.trim()} className="px-4 py-2.5 rounded-xl text-white text-[13px] font-sans font-medium disabled:opacity-40 transition-all" style={{ background: '#2F1B20' }}>Salvar</button>
        </div>
      ) : savedConfirm ? (
        <div className="mb-4 text-[13px] font-sans text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-2.5">✓ Cenário salvo</div>
      ) : null}

      <div className="flex flex-col gap-2">
        {!showInput && !savedConfirm && (
          <button onClick={() => setShowInput(true)} className="w-full py-2.5 rounded-xl text-white text-[14px] font-sans font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: '#2F1B20' }}>
            💾 {cenarios.length > 0 ? 'Salvar novo cenário' : 'Salvar este cenário'}
          </button>
        )}
        <button disabled={!canCompare} onClick={() => canCompare && setActiveFlow('compare')} className={`w-full py-2.5 rounded-xl text-[14px] font-sans font-medium border transition-all flex items-center justify-center gap-2 ${canCompare ? 'border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#F8FAFC]' : 'border-gray-200 text-gray-300 cursor-not-allowed opacity-40'}`}>
          ⚖️ Comparar cenários
        </button>
        {!canCompare && <p className="text-center text-[12px] text-gray-400 font-sans">Salve ao menos 2 cenários para comparar.</p>}
        {canCompare && (
          <button onClick={() => exportCsv(cenarios)} className="w-full py-2.5 rounded-xl text-[14px] font-sans font-medium border border-gray-300 text-gray-500 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
            📥 Exportar cenários
          </button>
        )}
      </div>
    </div>
  );
}

function exportCsv(cenarios: any[]) {
  const rows: string[][] = [
    ['Indicador', ...cenarios.map(c => c.nome)],
    ['Preço médio (R$)', ...cenarios.map(c => c.resultado?.precoMedioConsolidado?.toFixed(2) ?? '—')],
    ['Custo médio (R$)', ...cenarios.map(c => c.resultado?.custoMedio?.toFixed(2) ?? '—')],
    ['Faturamento mensal (R$)', ...cenarios.map(c => c.resultado?.faturamentoTotal?.toFixed(2) ?? '—')],
    ['Peças / mês', ...cenarios.map(c => c.resultado?.pecasTotal ? Math.round(c.resultado.pecasTotal).toString() : '—')],
    ['Total despesas (R$)', ...cenarios.map(c => c.resultado?.fixo ?? '—')],
    ['Margem de contribuição (%)', ...cenarios.map(c => c.resultado?.mc_pct?.toFixed(1) ?? '—')],
    ['Resultado mensal (R$)', ...cenarios.map(c => c.resultado?.resultado?.toFixed(2) ?? '—')],
    ['Markup (x)', ...cenarios.map(c => c.resultado?.markup?.toFixed(2) ?? '—')],
    ['Ponto de equilíbrio (R$)', ...cenarios.map(c => c.resultado?.pe_rs?.toFixed(2) ?? '—')],
  ];
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `tfo-cenarios-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getPerfilMarca(margemBruta: number): string {
  if (margemBruta > 65) return 'premium_luxo';
  if (margemBruta >= 55) return 'premium';
  if (margemBruta >= 45) return 'medio';
  return 'acesso';
}

const PERFIL_LABELS: Record<string, string> = { acesso: 'Acesso', medio: 'Médio', premium: 'Premium', premium_luxo: 'Premium / Luxo' };
const PAPEL_LABELS: Record<string, string> = { icone: 'Ícone de Marca', sustentador: 'Sustentador', motorGiro: 'Motor de Giro', portaEntrada: 'Porta de Entrada' };

// ─── Main component ──────────────────────────────────────────────────────────

export default function FlowBResult({ resultData, onBack, setActiveFlow }: Props) {
  const { isPremium } = useToolStore();
  const [showUpgradeMix, setShowUpgradeMix] = useState(false);
  const {
    segmentoLabel, canal, canalBenchmark, percVarejo, percAtacado,
    precoMedioConsolidado: preco, custoMedio: custo,
    faturamentoTotal: fat, pecasTotal: pecas,
    custoVariavelConsolidado: custoVarPct, custoVariavelRs,
    fixo: custoFixoTotal,
    mc_rs, mc_pct, resultado, markup, pe_rs, distanciaPE,
    margemBruta, porteLabel, insights, benchRange,
    remarcacao, segmento,
    despesasPorCategoria, despesasLista,
  } = resultData;

  const perfil = resultData.perfilMarca || getPerfilMarca(margemBruta);
  const mixDefault = MIX_DEFAULTS_POR_PERFIL[perfil];
  const [benchMin, benchMax] = benchRange;
  const [mcMin, mcMax] = getBenchmark(BENCHMARK_MC, segmento, canalBenchmark);
  const [, remMax] = getBenchmark(BENCHMARK_REMARCACAO, segmento);
  const canalLabel = canal === 'hibrido' ? `Híbrido (${percVarejo}% V / ${percAtacado}% A)` : canal === 'varejo' ? 'Varejo' : 'Atacado';

  const { margemPonderadaSugerida } = useMemo(() => {
    const ponderada =
      (PAPEL_PRODUTO_DEFAULTS.icone.margem * mixDefault.icone / 100) +
      (PAPEL_PRODUTO_DEFAULTS.sustentador.margem * mixDefault.sustentador / 100) +
      (PAPEL_PRODUTO_DEFAULTS.motorGiro.margem * mixDefault.motorGiro / 100) +
      (PAPEL_PRODUTO_DEFAULTS.portaEntrada.margem * mixDefault.portaEntrada / 100);
    return { margemPonderadaSugerida: ponderada };
  }, [mixDefault]);

  const deltaMargemMix = margemPonderadaSugerida - mc_pct;
  const custoFixoPct = fat > 0 ? (custoFixoTotal / fat) * 100 : 0;

  // Per-piece cost breakdown (per R$100 of revenue)
  const custoPct = preco > 0 ? (custo / preco) * 100 : 0;
  const impostoPct = fat > 0 ? (despesasPorCategoria.imposto / fat) * 100 : 0;
  const variavelPct = custoVarPct;
  const margemBrutaCalc = 100 - custoPct - impostoPct - variavelPct;
  const despFixaPct = fat > 0 ? ((despesasPorCategoria.fixo + despesasPorCategoria.outro) / fat) * 100 : 0;
  const mktgPct = fat > 0 ? (despesasPorCategoria.marketing / fat) * 100 : 0;

  // Sugestões acionáveis
  const sugestoes: Array<{ icon: string; titulo: string; texto: string }> = [];

  if (resultado < 0 && pecas > 0) {
    const gap = Math.abs(resultado);
    const ajuste = gap / pecas;
    sugestoes.push({
      icon: '🎯',
      titulo: 'Fechar o gap de resultado',
      texto: `Seu negócio precisa de ${formatCurrency(gap)} a mais por mês para equilibrar. Aumentar o preço médio em ${formatCurrency(ajuste)} por peça já resolveria, mantendo o volume atual.`,
    });
  }

  if (margemBruta < benchMin) {
    const precoMinSaudavel = custo > 0 ? custo / (1 - benchMin / 100) : 0;
    sugestoes.push({
      icon: '📊',
      titulo: 'Ajustar o preço para a faixa do mercado',
      texto: `Seu preço está cobrindo pouco o custo. Para chegar na faixa do mercado (${benchMin}%), o preço mínimo saudável seria ${formatCurrency(precoMinSaudavel)}.`,
    });
  }

  if (custoFixoPct > 35 && pecas > 0) {
    const qtdNecessaria = preco > 0 ? Math.ceil(custoFixoTotal / (preco * 0.30)) : 0;
    const qtdExtra = Math.max(0, qtdNecessaria - pecas);
    sugestoes.push({
      icon: '🏗️',
      titulo: 'Diluir as despesas fixas',
      texto: `Suas despesas fixas representam ${custoFixoPct.toFixed(0)}% do faturamento. Vender ${qtdExtra} peças a mais por mês já as diluiria para 30%.`,
    });
  }

  if (remarcacao !== null && Math.abs(remarcacao) > remMax) {
    const ganho = (Math.abs(remarcacao) - remMax) * fat / 100;
    sugestoes.push({
      icon: '🏷️',
      titulo: 'Reduzir a política de desconto',
      texto: `Você está dando ${Math.abs(remarcacao).toFixed(0)}% de desconto em média. Reduzir para ${remMax}% adicionaria ${formatCurrency(ganho)} de resultado por mês.`,
    });
  }

  if (mktgPct > 0) {
    const [mktMin, mktMax] = getInvestMktBenchmark(segmento);
    if (mktgPct < mktMin) {
      sugestoes.push({
        icon: '📣',
        titulo: 'Aumentar investimento em marketing',
        texto: `Você investe ${mktgPct.toFixed(1)}% do faturamento em marketing. A faixa típica para o segmento é ${mktMin}%–${mktMax}%. Ampliar gradualmente pode aumentar o volume de vendas e diluir os custos fixos.`,
      });
    } else if (mktgPct > mktMax) {
      sugestoes.push({
        icon: '📣',
        titulo: 'Revisar o retorno sobre marketing',
        texto: `Você investe ${mktgPct.toFixed(1)}% do faturamento em marketing — acima da faixa típica de ${mktMin}%–${mktMax}%. Pode ser estratégico em fase de crescimento; monitore o CAC e o ROAS para garantir que o investimento se paga.`,
      });
    }
  }

  const sugestoesFinal = sugestoes;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-[860px] mx-auto px-4 py-8">
      <button onClick={onBack} className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] transition-colors flex items-center gap-1 mb-4">
        ← Refazer simulação
      </button>
      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">Análise de Precificação do Negócio</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-[12px] font-sans bg-gray-100 text-gray-600 rounded-full px-3 py-1">{segmentoLabel}</span>
        <span className="text-[12px] font-sans bg-gray-100 text-gray-600 rounded-full px-3 py-1">{canalLabel}</span>
        <span className="text-[12px] font-sans bg-gray-100 text-gray-600 rounded-full px-3 py-1">{porteLabel}</span>
      </div>

      <div className="flex flex-col gap-5">

        {/* ── Card 1: Métricas 2×2 ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Margem bruta */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="text-[10px] font-sans font-semibold text-[#2F1B20] uppercase tracking-[0.08em] mb-2">Margem Bruta</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[26px] font-sans font-bold text-[#2F1B20] leading-none">{formatPercent(margemBruta)}</span>
              <MetricBadge value={margemBruta} benchMin={benchMin} benchMax={benchMax} />
            </div>
            <div className="text-[10px] text-gray-400">Ref: {benchMin}–{benchMax}%</div>
          </div>

          {/* Margem contribuição */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="text-[10px] font-sans font-semibold text-[#2F1B20] uppercase tracking-[0.08em] mb-2">Margem Contribuição</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[26px] font-sans font-bold text-[#2F1B20] leading-none">{formatPercent(mc_pct)}</span>
              <MetricBadge value={mc_pct} benchMin={mcMin} benchMax={mcMax} />
            </div>
            <div className="text-[10px] text-gray-400">Ref: {mcMin}–{mcMax}%</div>
          </div>

          {/* Resultado mensal */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="text-[10px] font-sans font-semibold text-[#2F1B20] uppercase tracking-[0.08em] mb-2">Resultado Mensal</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[22px] font-sans font-bold leading-none" style={{ color: resultado >= 0 ? '#065F46' : '#991B1B' }}>{formatCurrency(resultado)}</span>
            </div>
            <div className="text-[10px] font-medium" style={{ color: resultado >= 0 ? '#065F46' : '#991B1B' }}>{resultado >= 0 ? 'Lucro' : 'Prejuízo'}</div>
          </div>

          {/* Markup */}
          <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="text-[10px] font-sans font-semibold text-[#2F1B20] uppercase tracking-[0.08em] mb-2">Markup Médio</div>
            <div className="text-[26px] font-sans font-bold text-[#2F1B20] leading-none mb-1">{formatMultiplier(markup)}</div>
            <div className="text-[10px] text-gray-400">sobre o custo</div>
          </div>
        </div>

        {/* ── Card 2: Onde vai cada R$100 ── */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20] mb-1">Onde vai cada R$100 de receita</div>
          {pecas > 0 && fat > 0 && (
            <p className="text-[12px] text-gray-400 mb-4">Baseado em {Math.round(pecas)} peças/mês e faturamento de {formatCurrency(fat)}/mês.</p>
          )}

          <div className="flex flex-col gap-0">
            {[
              { label: 'Custo do produto', pct: custoPct, color: '#2F1B20', indent: false },
              ...(impostoPct > 0 ? [{ label: 'Impostos e taxas', pct: impostoPct, color: '#991B1B', indent: false }] : []),
              ...(variavelPct > 0 ? [{ label: 'Custos variáveis', pct: variavelPct, color: '#7C9DD0', indent: false }] : []),
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-500 flex-1">{row.label}</span>
                <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(row.pct, 100)}%`, background: row.color }} />
                </div>
                <span className="text-[12px] font-medium text-gray-600 w-10 text-right">{row.pct.toFixed(0)}%</span>
                <span className="text-[12px] font-medium text-[#2F1B20] w-20 text-right">{formatCurrency(preco * row.pct / 100)}</span>
              </div>
            ))}

            <div className="flex items-center gap-3 py-2.5 my-1 rounded-lg -mx-1 px-1" style={{ background: '#F6F1AF' }}>
              <span className="text-[13px] font-semibold text-[#2F1B20] flex-1">= Margem bruta</span>
              <span className="text-[12px] font-bold text-[#2F1B20] w-10 text-right">{margemBrutaCalc.toFixed(0)}%</span>
              <span className="text-[12px] font-bold text-[#2F1B20] w-20 text-right">{formatCurrency(preco * margemBrutaCalc / 100)}</span>
            </div>

            {[
              ...(despFixaPct > 0 ? [{ label: 'Despesas fixas', pct: despFixaPct, color: '#9C7DD0' }] : []),
              ...(mktgPct > 0 ? [{ label: 'Marketing', pct: mktgPct, color: '#C8B840' }] : []),
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-500 flex-1">{row.label}</span>
                <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(row.pct, 100)}%`, background: row.color }} />
                </div>
                <span className="text-[12px] font-medium text-gray-600 w-10 text-right">{row.pct.toFixed(0)}%</span>
                <span className="text-[12px] font-medium text-[#2F1B20] w-20 text-right">{formatCurrency(preco * row.pct / 100)}</span>
              </div>
            ))}

            <div className="flex items-center gap-3 py-2.5 my-1 rounded-lg -mx-1 px-1" style={{ background: '#ECFDF5' }}>
              <span className="text-[13px] font-semibold text-[#065F46] flex-1">= Margem contribuição</span>
              <span className="text-[12px] font-bold text-[#065F46] w-10 text-right">{mc_pct.toFixed(0)}%</span>
              <span className="text-[12px] font-bold text-[#065F46] w-20 text-right">{formatCurrency(mc_rs)}</span>
            </div>
          </div>

          {/* Despesas por categoria se houver lista */}
          {despesasLista.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {despesasLista.slice(0, 8).map(d => {
                const cfg = CATEGORIA_CONFIG[d.categoria];
                return (
                  <span key={d.id} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                    {cfg.icon} {d.nome} · {formatCurrency(d.valor)}
                  </span>
                );
              })}
              {despesasLista.length > 8 && (
                <span className="text-[11px] px-2 py-0.5 text-gray-400">+{despesasLista.length - 8} mais</span>
              )}
            </div>
          )}
        </div>

        {/* ── Card 3: Ponto de equilíbrio ── */}
        {pe_rs !== null && (
          <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm">
            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20] mb-3">Ponto de Equilíbrio</div>
            <p className="text-[13px] text-gray-500 mb-3">Para cobrir todas as suas despesas:</p>
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-gray-500">Você precisa faturar</span>
                <span className="text-[20px] font-bold text-[#2F1B20]">{formatCurrency(pe_rs)}/mês</span>
              </div>
              {pecas > 0 && preco > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-gray-500">Ou vender</span>
                  <span className="text-[18px] font-bold text-[#2F1B20]">{Math.ceil(pe_rs / preco)} peças/mês</span>
                </div>
              )}
            </div>
            {distanciaPE !== null && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${distanciaPE >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <span className="text-[22px] font-bold" style={{ color: distanciaPE >= 0 ? '#065F46' : '#991B1B' }}>
                  {distanciaPE >= 0 ? '+' : ''}{distanciaPE.toFixed(0)}%
                </span>
                <span className="text-[13px]" style={{ color: distanciaPE >= 0 ? '#065F46' : '#991B1B' }}>
                  {distanciaPE >= 0
                    ? `Você está ${distanciaPE.toFixed(0)}% acima do ponto de equilíbrio.`
                    : `Você está ${Math.abs(distanciaPE).toFixed(0)}% abaixo do ponto de equilíbrio.`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Card 4: Comparação com mercado ── */}
        <div className="bg-white rounded-xl p-5 border border-[#E5E7EB] shadow-sm">
          <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20] mb-3">Comparação com o Mercado</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">Margem bruta</p>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#2F1B20]">{formatPercent(margemBruta, 0)}</span>
                <span className="text-[11px] text-gray-300">vs</span>
                <span className="text-[13px] text-gray-400">{benchMin}–{benchMax}%</span>
                <MetricBadge value={margemBruta} benchMin={benchMin} benchMax={benchMax} />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">Margem contribuição</p>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#2F1B20]">{formatPercent(mc_pct, 0)}</span>
                <span className="text-[11px] text-gray-300">vs</span>
                <span className="text-[13px] text-gray-400">{mcMin}–{mcMax}%</span>
                <MetricBadge value={mc_pct} benchMin={mcMin} benchMax={mcMax} />
              </div>
            </div>
            {mktgPct > 0 && (() => {
              const [mktMin, mktMax] = getInvestMktBenchmark(segmento);
              return (
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-400 mb-0.5">Inv. Marketing</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-[#2F1B20]">{formatPercent(mktgPct, 1)}</span>
                    <span className="text-[11px] text-gray-300">vs</span>
                    <span className="text-[13px] text-gray-400">{mktMin}–{mktMax}%</span>
                    <MetricBadge value={mktgPct} benchMin={mktMin} benchMax={mktMax} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Card 5: Diagnóstico com textos melhorados ── */}
        {insights.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20]">O que mais impacta o resultado</div>
            {insights.map((ins, i) => (
              <div key={i} className="bg-[#F6F1AF] rounded-2xl p-4 border border-[rgba(47,27,32,0.15)] flex gap-3">
                <div className="text-[20px] leading-none pt-0.5">{ins.icon}</div>
                <div>
                  <h4 className="font-sans font-semibold text-[#2F1B20] text-[14px] mb-1">
                    {INSIGHT_TITLE_REMAP[ins.driver ?? ''] ?? ins.title}
                  </h4>
                  <p className="font-sans text-[12px] text-[#2F1B20]/80 leading-snug">{ins.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Card 6: Sugestões acionáveis ── */}
        {sugestoesFinal.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#2F1B20]">O Que Você Pode Fazer Agora</div>
            {sugestoesFinal.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex gap-3">
                <span className="text-[20px] flex-shrink-0 pt-0.5">{s.icon}</span>
                <div>
                  <h4 className="font-sans font-semibold text-[#2F1B20] text-[14px] mb-1">{s.titulo}</h4>
                  <p className="font-sans text-[13px] text-[#6B7280] leading-relaxed">{s.texto}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Mix portfólio — Premium ── */}
        {showUpgradeMix && (
          <UpgradeModal
            feature="mix_portfolio"
            description="Veja a distribuição ideal de mix de produtos (Ícone, Sustentador, Motor de Giro, Porta de Entrada) e simule o impacto na sua margem ponderada."
            onClose={() => setShowUpgradeMix(false)}
          />
        )}
        {isPremium ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-[#7C9DD0] mb-1">Distribuição Sugerida para o Seu Mix</div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[12px] text-gray-500 leading-relaxed">
                  Com base no seu segmento e resultado, esta distribuição pode melhorar sua margem ponderada.
                </p>
                {resultData.perfilMarca ? (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full" style={{ background: '#ECFDF5', color: '#065F46' }}>
                    ✓ Perfil calibrado pelo diagnóstico de valor: {PERFIL_LABELS[resultData.perfilMarca] ?? resultData.perfilMarca}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">Perfil inferido: {PERFIL_LABELS[perfil]}</span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Part.</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Margem</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Remarc.</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(PAPEL_LABELS) as Array<keyof typeof PAPEL_LABELS>).map((key, i) => {
                    const papel = PAPEL_PRODUTO_DEFAULTS[key as keyof typeof PAPEL_PRODUTO_DEFAULTS];
                    const part = mixDefault[key as keyof typeof mixDefault];
                    return (
                      <tr key={key} className={i < Object.keys(PAPEL_LABELS).length - 1 ? 'border-b border-gray-100' : ''}>
                        <td className="px-5 py-3 font-sans text-[#2F1B20] font-medium">{PAPEL_LABELS[key]}</td>
                        <td className="px-3 py-3 text-center text-gray-600">{part}%</td>
                        <td className="px-3 py-3 text-center font-medium text-[#2D6A4F]">{papel.margem}%</td>
                        <td className="px-3 py-3 text-center text-gray-500">{papel.remarcacao}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[13px] text-gray-600">
                Margem ponderada estimada:{' '}
                <span className="font-bold text-[#2D6A4F]">{formatPercent(margemPonderadaSugerida)}</span>
                <span className="ml-2 text-gray-400 text-[12px]">
                  vs. sua MC atual: {formatPercent(mc_pct)}{' '}
                  <span className={deltaMargemMix >= 0 ? 'text-[#2D6A4F]' : 'text-[#991B1B]'}>
                    ({deltaMargemMix >= 0 ? '+' : ''}{deltaMargemMix.toFixed(1)} pp)
                  </span>
                </span>
              </div>
              <button onClick={() => setActiveFlow('MIX')} className="text-[13px] font-sans font-medium text-[#7C9DD0] border border-[#7C9DD0] rounded-xl px-4 py-2 hover:bg-[#F8FAFC] transition-all">
                → Simular e ajustar a distribuição
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowUpgradeMix(true)}
            className="w-full bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-left hover:border-[#7C9DD0]/50 hover:bg-[#F8FAFC] transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-1 group-hover:text-[#7C9DD0] transition-colors">Distribuição Sugerida do Mix</div>
                <p className="text-[13px] text-gray-400 leading-relaxed">
                  Descubra a distribuição ideal entre Ícone, Sustentador, Motor de Giro e Porta de Entrada — e veja o impacto na sua margem ponderada.
                </p>
              </div>
              <span className="flex-shrink-0 text-[13px] font-medium px-3 py-1.5 rounded-full" style={{ background: '#EEF3FA', color: '#7C9DD0' }}>
                🔒 Premium
              </span>
            </div>
          </button>
        )}

        {/* ── Cenários ── */}
        <ScenarioBlock resultData={resultData} />

        {/* ── CTAs ── */}
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveFlow('A')} className="w-full py-2.5 rounded-xl text-white text-[14px] font-sans font-medium transition-all hover:opacity-90" style={{ background: '#2F1B20' }}>
            → Diagnóstico de Margem
          </button>
          <button onClick={() => setActiveFlow('C')} className="w-full py-2.5 rounded-xl text-[14px] font-sans font-medium border border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#F8FAFC] transition-all">
            → Formação de Preço
          </button>
        </div>

      </div>
    </motion.div>
  );
}
