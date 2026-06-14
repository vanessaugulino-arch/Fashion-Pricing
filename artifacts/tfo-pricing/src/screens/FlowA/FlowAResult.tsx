import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolStore } from '@/store/useToolStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';
import { BENCHMARK_MARGEM_BRUTA, SEGMENTOS_FLOWA } from '@/engine/benchmarks';
import { diagnosisFlowA } from '@/engine/diagnostics';
import FlowCInline from '@/screens/FlowC/FlowCInline';

type Canal = 'varejo' | 'atacado';
type LockedField = 'preco' | 'margem' | 'markup';

interface Props {
  nomeProduto: string;
  precoInicial: number;
  custoInicial: number;
  icmsNum: number;
  segmento: string;
  canal: Canal;
  onBack: () => void;
  onReset: () => void;
}

function fmtVal(n: number, decimals = 2): string {
  return isFinite(n) ? n.toFixed(decimals) : '';
}

export default function FlowAResult({ nomeProduto, precoInicial, custoInicial, icmsNum, segmento, canal, onBack, onReset }: Props) {
  const { setActiveFlow, salvarProduto, mixPortfolio } = useToolStore();
  const perfilMarca = mixPortfolio.perfilMarca;

  const benchEntry = (BENCHMARK_MARGEM_BRUTA[segmento] ?? BENCHMARK_MARGEM_BRUTA['default']) as Record<string, [number, number]>;
  const [minRef, maxRef] = benchEntry[canal];

  const PERFIL_AJUSTE: Record<string, { deltaMin: number; deltaMax: number; label: string }> = {
    acesso:       { deltaMin: -5,  deltaMax: -5,  label: 'Acesso' },
    medio:        { deltaMin:  0,  deltaMax:  0,  label: 'Médio' },
    premium:      { deltaMin:  5,  deltaMax:  8,  label: 'Premium' },
    premium_luxo: { deltaMin: 10,  deltaMax: 15,  label: 'Premium / Luxo' },
  };
  const ajuste = perfilMarca ? (PERFIL_AJUSTE[perfilMarca] ?? null) : null;
  const minRefFinal = ajuste ? Math.min(minRef + ajuste.deltaMin, 95) : minRef;
  const maxRefFinal = ajuste ? Math.min(maxRef + ajuste.deltaMax, 98) : maxRef;
  const segmentoLabel = SEGMENTOS_FLOWA.find(s => s.value === segmento)?.label ?? '';

  const initMargemRs = precoInicial - custoInicial - precoInicial * (icmsNum / 100);
  const initMargem = (initMargemRs / precoInicial) * 100;
  const initMarkup = precoInicial / custoInicial;
  const initPrecoMinViavel = minRefFinal / 100 < 1 ? custoInicial / (1 - minRefFinal / 100) : null;

  const origDiagnosis = diagnosisFlowA(initMargem, segmento, canal);
  const origBadgeStatus = initMargem > maxRefFinal ? 'excellent' : initMargem >= minRefFinal ? 'ok' : initMargem < minRefFinal - 10 ? 'critical' : 'warning';
  const origBadgeLabel = initMargem > maxRefFinal ? 'Acima da média' : initMargem >= minRefFinal ? 'Dentro da média' : 'Abaixo da média';
  const origMargemColor = initMargem >= minRefFinal ? '#2D6A4F' : initMargem < minRefFinal - 10 ? '#991B1B' : '#B45309';

  const diagBg = origBadgeStatus === 'critical' ? '#FEF2F2' : origBadgeStatus === 'warning' ? '#FFFBEB' : '#F6F1AF';
  const diagBorder = origBadgeStatus === 'critical' ? 'rgba(153,27,27,0.15)' : origBadgeStatus === 'warning' ? 'rgba(180,83,9,0.15)' : 'rgba(47,27,32,0.15)';

  const barMax = Math.max(maxRefFinal * 1.6, initMargem * 1.2, 80);
  const minPos = (minRefFinal / barMax) * 100;
  const maxPos = (maxRefFinal / barMax) * 100;
  const origPos = Math.min(Math.max((initMargem / barMax) * 100, 0), 100);

  const [simPreco, setSimPreco] = useState(fmtVal(precoInicial));
  const [simCusto, setSimCusto] = useState(fmtVal(custoInicial));
  const [simMargem, setSimMargem] = useState(fmtVal(initMargem, 1));
  const [simMarkup, setSimMarkup] = useState(fmtVal(initMarkup));
  const [locked, setLocked] = useState<LockedField>('preco');
  const [flashKey, setFlashKey] = useState(0);
  const [showFlowC, setShowFlowC] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const precoNum = parseFloat(simPreco) || 0;
  const custoNum = parseFloat(simCusto) || 0;

  const simMargemRs = precoNum > 0 ? precoNum - custoNum - precoNum * (icmsNum / 100) : 0;
  const simMargemPct = precoNum > 0 ? (simMargemRs / precoNum) * 100 : 0;
  const simMarkupCalc = custoNum > 0 && precoNum > 0 ? precoNum / custoNum : 0;

  const simBadgeStatus = simMargemPct > maxRefFinal ? 'excellent' : simMargemPct >= minRefFinal ? 'ok' : simMargemPct < minRefFinal - 10 ? 'critical' : 'warning';
  const simBadgeLabel = simMargemPct > maxRefFinal ? 'Acima da média' : simMargemPct >= minRefFinal ? 'Dentro da média' : 'Abaixo da média';
  const simMargemColor = simMargemPct >= minRefFinal ? '#2D6A4F' : simMargemPct < minRefFinal - 10 ? '#991B1B' : '#B45309';

  const deltaPp = simMargemPct - initMargem;
  const deltaPreco = precoNum - precoInicial;
  const hasChanged = Math.abs(deltaPp) > 0.05 || Math.abs(deltaPreco) > 0.01;

  useEffect(() => {
    if (showFlowC) {
      setTimeout(() => {
        document.getElementById('flow-c-inline')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showFlowC]);

  function recompute(type: LockedField, newLocked: LockedField, custo: number) {
    if (type === 'preco') {
      const p = parseFloat(simPreco) || 0;
      if (p > 0 && custo > 0) {
        const m = (1 - custo / p - icmsNum / 100) * 100;
        const mu = p / custo;
        setSimMargem(fmtVal(m, 1));
        setSimMarkup(fmtVal(mu));
      }
    } else if (type === 'margem') {
      const m = parseFloat(simMargem) || 0;
      const denom = 1 - m / 100 - icmsNum / 100;
      if (custo > 0 && denom > 0) {
        const p = custo / denom;
        setSimPreco(fmtVal(p));
        setSimMarkup(fmtVal(p / custo));
      }
    } else {
      const mu = parseFloat(simMarkup) || 0;
      if (custo > 0 && mu > 0) {
        const p = custo * mu;
        const m = (1 - 1 / mu - icmsNum / 100) * 100;
        setSimPreco(fmtVal(p));
        setSimMargem(fmtVal(m, 1));
      }
    }
    setLocked(newLocked);
    setFlashKey(k => k + 1);
  }

  function handlePreco(val: string) {
    setSimPreco(val);
    const p = parseFloat(val) || 0;
    const c = parseFloat(simCusto) || 0;
    if (p > 0 && c > 0) {
      setSimMargem(fmtVal((1 - c / p - icmsNum / 100) * 100, 1));
      setSimMarkup(fmtVal(p / c));
    }
    setLocked('preco');
    setFlashKey(k => k + 1);
  }

  function handleCusto(val: string) {
    setSimCusto(val);
    const c = parseFloat(val) || 0;
    if (c <= 0) return;
    if (locked === 'margem') {
      const m = parseFloat(simMargem) || 0;
      const denom = 1 - m / 100 - icmsNum / 100;
      if (denom > 0) {
        const p = c / denom;
        setSimPreco(fmtVal(p));
        setSimMarkup(fmtVal(p / c));
      }
    } else if (locked === 'markup') {
      const mu = parseFloat(simMarkup) || 0;
      if (mu > 0) {
        const p = c * mu;
        setSimPreco(fmtVal(p));
        setSimMargem(fmtVal((1 - 1 / mu - icmsNum / 100) * 100, 1));
      }
    } else {
      const p = parseFloat(simPreco) || 0;
      if (p > 0) {
        setSimMargem(fmtVal((1 - c / p - icmsNum / 100) * 100, 1));
        setSimMarkup(fmtVal(p / c));
      }
    }
    setFlashKey(k => k + 1);
  }

  function handleMargem(val: string) {
    setSimMargem(val);
    const m = parseFloat(val) || 0;
    const c = parseFloat(simCusto) || 0;
    const denom = 1 - m / 100 - icmsNum / 100;
    if (c > 0 && denom > 0) {
      const p = c / denom;
      setSimPreco(fmtVal(p));
      setSimMarkup(fmtVal(p / c));
    }
    setLocked('margem');
    setFlashKey(k => k + 1);
  }

  function handleMarkup(val: string) {
    setSimMarkup(val);
    const mu = parseFloat(val) || 0;
    const c = parseFloat(simCusto) || 0;
    if (mu > 0 && c > 0) {
      const p = c * mu;
      setSimPreco(fmtVal(p));
      setSimMargem(fmtVal((1 - 1 / mu - icmsNum / 100) * 100, 1));
    }
    setLocked('markup');
    setFlashKey(k => k + 1);
  }

  function handleResetSim() {
    setSimPreco(fmtVal(precoInicial));
    setSimCusto(fmtVal(custoInicial));
    setSimMargem(fmtVal(initMargem, 1));
    setSimMarkup(fmtVal(initMarkup));
    setLocked('preco');
    setFlashKey(k => k + 1);
  }

  function handleSalvar() {
    salvarProduto({
      id: crypto.randomUUID(),
      nomeProduto: nomeProduto || 'Produto sem nome',
      segmento,
      canal,
      precoSimulado: precoNum,
      custoSimulado: custoNum,
      icmsNum,
      margemSimulada: simMargemPct,
      markupSimulado: simMarkupCalc,
      margemRS: simMargemRs,
      criadoEm: Date.now(),
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setActiveFlow('A');
    }, 1200);
  }

  const fieldClass = (isLocked: boolean) =>
    `flex items-center border-[1.5px] rounded-xl overflow-hidden transition-all ${
      isLocked
        ? 'border-[#7C9DD0] ring-[3px] ring-[#7C9DD0]/15'
        : 'border-gray-200 focus-within:border-[#7C9DD0] focus-within:ring-[3px] focus-within:ring-[#7C9DD0]/15'
    }`;

  return (
    <div className="max-w-[680px] mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] transition-colors mb-6"
      >
        ← Voltar ao formulário
      </button>

      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">
        {nomeProduto ? nomeProduto : 'Ver margem de um produto'}
      </h2>
      <p className="font-sans text-[14px] text-[#6B7280] mb-8">
        {segmentoLabel} · {canal === 'varejo' ? 'Varejo' : 'Atacado'}
      </p>

      {/* ─── BLOCO 1 — Diagnóstico ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(47,27,32,0.08)] border border-[#E5E7EB] mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#7C9DD0' }} />

        <div className="text-[11px] font-sans font-semibold text-[#7C9DD0] uppercase tracking-[0.1em] mb-3 pt-1">
          Sua Margem Bruta Estimada
        </div>

        <div className="flex items-end gap-3 mb-1">
          <div className="font-sans font-bold text-[52px] leading-none" style={{ color: origMargemColor }}>
            {formatPercent(initMargem)}
          </div>
          <div className="mb-2 flex flex-col gap-1.5 items-start">
            <StatusBadge status={origBadgeStatus} label={origBadgeLabel} />
            {!perfilMarca && (
              <button
                onClick={() => setActiveFlow('D')}
                className="text-[11px] text-[#7C9DD0] underline underline-offset-2 text-left leading-tight"
              >
                💡 Faça o diagnóstico de valor para calibrar a referência ao seu perfil de marca
              </button>
            )}
          </div>
        </div>

        <div className="text-[14px] text-gray-500 mb-4">
          {formatCurrency(initMargemRs)} / peça
        </div>

        {initPrecoMinViavel !== null && (
          <div className="text-[13px] text-[#2F1B20] font-sans font-medium mb-5">
            Preço mínimo com margem saudável:{' '}
            <span className="font-semibold">{formatCurrency(initPrecoMinViavel)}</span>
          </div>
        )}

        {/* Positioning bar */}
        <div className="mb-5">
          <div className="relative h-2.5 bg-gray-100 rounded-full mb-3">
            <div
              className="absolute h-full rounded-full"
              style={{ left: `${minPos}%`, width: `${Math.max(maxPos - minPos, 0)}%`, background: '#7C9DD0', opacity: 0.25 }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-10"
              style={{ left: `${origPos}%`, background: origMargemColor }}
              title={`Você: ${formatPercent(initMargem)}`}
            />
          </div>
          <div className="flex items-start justify-between text-[11px] font-sans text-gray-400">
            <span>0%</span>
            <span className="text-center px-2">
              Referência: {minRefFinal}%–{maxRefFinal}%{ajuste ? ` · Perfil ${ajuste.label}` : ''} ({segmentoLabel.toLowerCase()} · {canal})
            </span>
            <span>{Math.round(barMax)}%</span>
          </div>
        </div>

        {/* Diagnosis card */}
        <div className="rounded-xl p-4 flex gap-3 mb-4" style={{ background: diagBg, border: `1px solid ${diagBorder}` }}>
          <div className="text-[18px] leading-none pt-0.5 shrink-0">{origDiagnosis.icon}</div>
          <div>
            <h4 className="font-sans font-semibold text-[#2F1B20] text-[14px] mb-0.5">{origDiagnosis.title}</h4>
            <p className="font-sans text-[12px] text-[#2F1B20]/80 leading-snug">{origDiagnosis.body}</p>
          </div>
        </div>

        <p className="font-sans text-[12px] text-[#9CA3AF] italic">
          Referências estimadas com base no mercado brasileiro de moda.
        </p>
      </div>

      {/* ─── BLOCO 2 — Simulador ─── */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(47,27,32,0.08)] border border-[#E5E7EB] mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#2F1B20' }} />

        <div className="text-[11px] font-sans font-semibold text-[#2F1B20] uppercase tracking-[0.1em] mb-1 pt-1">
          Simule Ajustes
        </div>
        <p className="text-[14px] text-[#6B7280] font-sans mb-5">
          Altere qualquer valor — o resultado atualiza enquanto você digita.
        </p>

        {/* 2×2 fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Preço de venda</label>
            <div className={fieldClass(locked === 'preco')}>
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
              <input
                type="number" step="0.01" min="0"
                value={simPreco}
                onChange={e => handlePreco(e.target.value)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Custo do produto</label>
            <div className={fieldClass(false)}>
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
              <input
                type="number" step="0.01" min="0"
                value={simCusto}
                onChange={e => handleCusto(e.target.value)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Margem desejada</label>
            <div className={fieldClass(locked === 'margem')}>
              <input
                type="number" step="0.1"
                value={simMargem}
                onChange={e => handleMargem(e.target.value)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-l border-gray-200 select-none">%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Markup desejado</label>
            <div className={fieldClass(locked === 'markup')}>
              <input
                type="number" step="0.01" min="0"
                value={simMarkup}
                onChange={e => handleMarkup(e.target.value)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-l border-gray-200 select-none">x</span>
            </div>
          </div>
        </div>

        {/* Result card with flash */}
        <motion.div
          key={flashKey}
          initial={{ backgroundColor: '#F6F1AF' }}
          animate={{ backgroundColor: '#FEFCE8' }}
          transition={{ duration: 0.4 }}
          className="rounded-xl p-4 border border-[rgba(47,27,32,0.10)]"
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <div className="text-[11px] text-gray-400 font-sans mb-0.5">Margem simulada</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans font-bold text-[20px]" style={{ color: simMargemColor }}>
                  {formatPercent(simMargemPct)}
                </span>
                <StatusBadge status={simBadgeStatus} label={simBadgeLabel} />
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-400 font-sans mb-0.5">Margem em R$</div>
              <div className="font-sans font-semibold text-[16px] text-[#2F1B20]">
                {formatCurrency(simMargemRs)} / peça
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-400 font-sans mb-0.5">Preço calculado</div>
              <div className="font-sans font-semibold text-[16px] text-[#2F1B20]">
                {formatCurrency(precoNum)}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-gray-400 font-sans mb-0.5">Markup</div>
              <div className="font-sans font-semibold text-[16px] text-[#2F1B20]">
                {simMarkupCalc > 0 ? formatMultiplier(simMarkupCalc) : '—'}
              </div>
            </div>
          </div>

          {hasChanged && (
            <div className="mt-3 pt-3 border-t border-[rgba(47,27,32,0.08)] flex flex-wrap gap-3 text-[12px] font-sans text-gray-500">
              <span>vs. situação atual:</span>
              <span className={`font-semibold ${deltaPp >= 0 ? 'text-[#2D6A4F]' : 'text-[#991B1B]'}`}>
                {deltaPp >= 0 ? '+' : ''}{deltaPp.toFixed(1)} pp
              </span>
              <span className={`font-semibold ${deltaPreco >= 0 ? 'text-[#2D6A4F]' : 'text-[#991B1B]'}`}>
                {deltaPreco >= 0 ? '+' : ''}{formatCurrency(deltaPreco)}
              </span>
            </div>
          )}
        </motion.div>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleResetSim}
            className="text-[12px] font-sans text-gray-400 hover:text-[#7C9DD0] transition-colors"
          >
            Redefinir para valores originais
          </button>
        </div>
      </div>

      {/* ─── BLOCO 3 — CTAs ─── */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={handleSalvar}
          disabled={savedFeedback}
          className="w-full py-3 rounded-xl text-white font-sans font-medium text-[15px] transition-all disabled:opacity-70"
          style={{ background: '#2F1B20' }}
        >
          {savedFeedback ? '✓ Produto salvo! Voltando…' : '💾 Salvar produto'}
        </button>

        <button
          onClick={() => setActiveFlow('B')}
          className="w-full py-3 rounded-xl text-[15px] font-sans font-medium border border-[#2F1B20] text-[#2F1B20] hover:bg-gray-50 transition-all"
        >
          → Analisar a margem do meu negócio
        </button>

        {!showFlowC && (
          <button
            onClick={() => setShowFlowC(true)}
            className="w-full py-3 rounded-xl border-[1.5px] border-[#7C9DD0] text-[#7C9DD0] font-sans font-medium text-[15px] hover:bg-[#EEF3FA] transition-all"
          >
            → Descobrir o preço ideal
          </button>
        )}

        <div className="flex justify-center mt-1">
          <button
            onClick={onReset}
            className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] transition-colors"
          >
            Analisar outro produto
          </button>
        </div>
      </div>

      {/* ─── BLOCO 4 — FlowC Inline ─── */}
      {showFlowC && (
        <div className="mt-8" id="flow-c-inline">
          <FlowCInline
            nomeProduto={nomeProduto}
            custoInicial={custoInicial}
            canal={canal}
            segmento={segmento}
            precoSimulado={precoNum}
            margemSimulada={simMargemPct}
            icmsNum={icmsNum}
          />
        </div>
      )}
    </div>
  );
}
