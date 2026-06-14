import React, { useState } from 'react';
import { useToolStore, Cenario } from '@/store/useToolStore';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';
import { motion } from 'framer-motion';

function exportCsv(cenarios: Cenario[]) {
  const rows: string[][] = [
    ['Indicador', ...cenarios.map(c => c.nome)],
    ['─────────────', ...cenarios.map(() => '')],
    ['Preço médio (R$)', ...cenarios.map(c => c.resultado?.precoMedioConsolidado?.toFixed(2) ?? '—')],
    ['Custo médio (R$)', ...cenarios.map(c => c.resultado?.custoMedio?.toFixed(2) ?? '—')],
    ['Faturamento mensal (R$)', ...cenarios.map(c => c.resultado?.faturamentoTotal?.toFixed(2) ?? '—')],
    ['Peças / mês', ...cenarios.map(c => c.resultado?.pecasTotal ? Math.round(c.resultado.pecasTotal).toString() : '—')],
    ['─────────────', ...cenarios.map(() => '')],
    ['ICMS (%)', ...cenarios.map(c => c.dados?.icms || '—')],
    ['Custo variável (%)', ...cenarios.map(c => c.dados?.custoVariavel || '—')],
    ['Despesas fixas (R$)', ...cenarios.map(c => c.dados?.custoFixo || '—')],
    ['─────────────', ...cenarios.map(() => '')],
    ['Margem de contribuição (%)', ...cenarios.map(c => c.resultado?.mc_pct?.toFixed(1) ?? '—')],
    ['Resultado mensal (R$)', ...cenarios.map(c => c.resultado?.resultado?.toFixed(2) ?? '—')],
    ['Markup (x)', ...cenarios.map(c => c.resultado?.markup?.toFixed(2) ?? '—')],
    ['Ponto de equilíbrio (R$)', ...cenarios.map(c => c.resultado?.pe_rs?.toFixed(2) ?? '—')],
    ['Remarcação (%)', ...cenarios.map(c => c.resultado?.remarcacao != null ? c.resultado.remarcacao.toFixed(1) : '—')],
  ];
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tfo-cenarios-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function bestIdx(values: (number | null)[], higherIsBetter = true): number {
  let best = -1;
  let bestVal = higherIsBetter ? -Infinity : Infinity;
  values.forEach((v, i) => {
    if (v == null) return;
    if (higherIsBetter ? v > bestVal : v < bestVal) { bestVal = v; best = i; }
  });
  return best;
}

function worstIdx(values: (number | null)[], higherIsBetter = true): number {
  let worst = -1;
  let worstVal = higherIsBetter ? Infinity : -Infinity;
  values.forEach((v, i) => {
    if (v == null) return;
    if (higherIsBetter ? v < worstVal : v > worstVal) { worstVal = v; worst = i; }
  });
  return worst;
}

interface RowSpec {
  label: string;
  key: keyof any;
  from: 'resultado' | 'dados';
  format: (v: any) => string;
  higherIsBetter?: boolean;
  highlight?: boolean;
  separator?: boolean;
}

const ROWS: RowSpec[] = [
  { label: 'Preço médio', key: 'precoMedioConsolidado', from: 'resultado', format: v => formatCurrency(v) },
  { label: 'Custo médio', key: 'custoMedio', from: 'resultado', format: v => formatCurrency(v) },
  { label: 'Faturamento mensal', key: 'faturamentoTotal', from: 'resultado', format: v => formatCurrency(v) },
  { label: 'Peças / mês', key: 'pecasTotal', from: 'resultado', format: v => v != null ? Math.round(v).toString() : '—' },
  { label: '', key: '', from: 'resultado', format: () => '', separator: true },
  { label: 'ICMS aplicado', key: 'icms', from: 'dados', format: v => v ? `${v}%` : '—' },
  { label: 'Custo variável', key: 'custoVariavel', from: 'dados', format: v => v ? `${v}%` : '—' },
  { label: 'Despesas fixas', key: 'custoFixo', from: 'dados', format: v => v ? formatCurrency(parseFloat(v)) : '—' },
  { label: '', key: '', from: 'resultado', format: () => '', separator: true },
  { label: 'Margem de contribuição', key: 'mc_pct', from: 'resultado', format: v => formatPercent(v), higherIsBetter: true, highlight: true },
  { label: 'Resultado mensal', key: 'resultado', from: 'resultado', format: v => formatCurrency(v), higherIsBetter: true, highlight: true },
  { label: 'Markup', key: 'markup', from: 'resultado', format: v => formatMultiplier(v), higherIsBetter: true, highlight: true },
  { label: 'Ponto de equilíbrio', key: 'pe_rs', from: 'resultado', format: v => v != null ? formatCurrency(v) : '—', higherIsBetter: false },
  { label: '', key: '', from: 'resultado', format: () => '', separator: true },
  { label: 'Remarcação', key: 'remarcacao', from: 'resultado', format: v => v != null ? formatPercent(v) : '—' },
];

function getAutoDiagnosis(cenarios: Cenario[]): string {
  if (cenarios.length === 0) return '';
  const resultados = cenarios.map(c => c.resultado?.resultado ?? -Infinity);
  const bestI = resultados.indexOf(Math.max(...resultados));
  const best = cenarios[bestI];
  const bestResultado = best.resultado?.resultado ?? 0;
  const bestMc = best.resultado?.mc_pct ?? 0;

  const faturamentos = cenarios.map(c => c.resultado?.faturamentoTotal ?? 0);
  const custoFixos = cenarios.map(c => parseFloat(c.dados?.custoFixo || '0') || 0);
  const margens = cenarios.map(c => c.resultado?.mc_pct ?? 0);

  const faturamentoVariance = Math.max(...faturamentos) - Math.min(...faturamentos);
  const custoFixoVariance = Math.max(...custoFixos) - Math.min(...custoFixos);
  const margemVariance = Math.max(...margens) - Math.min(...margens);

  let diferencial = 'melhor combinação de margem e faturamento';
  const maxVariance = Math.max(
    faturamentoVariance / (Math.max(...faturamentos) || 1),
    custoFixoVariance / (Math.max(...custoFixos) || 1),
    margemVariance / (Math.max(...margens) || 1),
  );
  if (maxVariance === faturamentoVariance / (Math.max(...faturamentos) || 1)) {
    diferencial = 'maior faturamento mensal';
  } else if (maxVariance === custoFixoVariance / (Math.max(...custoFixos) || 1)) {
    diferencial = 'menor custo fixo';
  } else if (maxVariance === margemVariance / (Math.max(...margens) || 1)) {
    diferencial = 'melhor margem de contribuição';
  }

  return `O cenário "${best.nome}" apresenta o melhor resultado mensal (${formatCurrency(bestResultado)}) com margem de contribuição de ${formatPercent(bestMc)}. A principal diferença em relação aos outros é o ${diferencial}.`;
}

export default function ScenarioCompare() {
  const { cenarios, cenarioEscolhido, marcarCenarioEscolhido, setActiveFlow } = useToolStore();
  const [escolhido, setEscolhido] = useState<string | null>(cenarioEscolhido);

  if (cenarios.length === 0) {
    return (
      <div className="max-w-[860px] mx-auto px-4 py-8">
        <button onClick={() => setActiveFlow('B')} className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] flex items-center gap-1 mb-6">
          ← Voltar ao resultado
        </button>
        <p className="text-gray-400 font-sans text-[14px]">Nenhum cenário salvo ainda.</p>
      </div>
    );
  }

  const diagnosis = getAutoDiagnosis(cenarios);

  function handleMarcar(id: string) {
    marcarCenarioEscolhido(id);
    setEscolhido(id);
  }

  const escolhidoNome = cenarios.find(c => c.id === escolhido)?.nome ?? '';
  const bestResultadoIdx = bestIdx(cenarios.map(c => c.resultado?.resultado ?? null), true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-[860px] mx-auto px-4 py-8"
    >
      <button onClick={() => setActiveFlow('B')} className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] flex items-center gap-1 mb-6 transition-colors">
        ← Voltar ao resultado
      </button>

      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">
        Comparação de cenários
      </h2>
      <p className="font-sans text-[14px] text-[#6B7280] mb-8">
        Todos os cenários salvos, lado a lado.
      </p>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ minWidth: Math.max(420, cenarios.length * 180) }}>
            <thead>
              <tr className="border-b-2 border-[#E5E7EB]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 w-44 sticky left-0 z-10">
                  Indicador
                </th>
                {cenarios.map((c, i) => (
                  <th key={c.id} className="px-4 py-3 text-center bg-gray-50 min-w-[160px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-sans font-semibold text-[13px] text-[#2F1B20]">{c.nome}</span>
                      {(escolhido === c.id) && (
                        <span className="text-[10px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-full px-2 py-0.5 font-medium">
                          ✓ Escolhido
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, rowIdx) => {
                if (row.separator) {
                  return (
                    <tr key={`sep-${rowIdx}`}>
                      <td colSpan={cenarios.length + 1} className="h-[2px] bg-[#E5E7EB] p-0" />
                    </tr>
                  );
                }

                const values = cenarios.map(c => {
                  const source = row.from === 'resultado' ? c.resultado : c.dados;
                  return source?.[row.key as string] ?? null;
                });

                const numValues = values.map(v => typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || null : null);
                const bIdx = row.highlight ? bestIdx(numValues, row.higherIsBetter ?? true) : -1;
                const wIdx = row.highlight ? worstIdx(numValues, row.higherIsBetter ?? true) : -1;

                return (
                  <tr key={String(row.key) + rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                    <td className="px-5 py-3 text-[12px] font-sans text-gray-500 sticky left-0 z-10" style={{ background: rowIdx % 2 === 0 ? 'white' : '#F9FAFB' }}>
                      {row.label}
                    </td>
                    {cenarios.map((c, ci) => {
                      const source = row.from === 'resultado' ? c.resultado : c.dados;
                      const val = source?.[row.key as string] ?? null;
                      const isBest = row.highlight && ci === bIdx && bIdx !== wIdx;
                      const isWorst = row.highlight && ci === wIdx && bIdx !== wIdx;

                      return (
                        <td
                          key={c.id}
                          className="px-4 py-3 text-center font-sans font-medium"
                          style={{
                            background: isBest ? '#ECFDF5' : isWorst ? '#FEF2F2' : undefined,
                            color: isBest ? '#065F46' : isWorst ? '#991B1B' : '#2F1B20',
                          }}
                        >
                          {isBest && <span className="mr-1 text-[10px]">★</span>}
                          {row.format(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-diagnosis card */}
      <div className="bg-[#F6F1AF] rounded-2xl p-5 border border-[rgba(47,27,32,0.15)] flex gap-3 mb-5">
        <div className="text-[20px] leading-none pt-0.5 shrink-0">🎯</div>
        <div>
          <h4 className="font-sans font-semibold text-[#2F1B20] text-[14px] mb-1">Diagnóstico automático</h4>
          <p className="font-sans text-[13px] text-[#2F1B20]/80 leading-snug">{diagnosis}</p>
        </div>
      </div>

      {/* Mark as chosen */}
      <div className="flex flex-col gap-3 mb-6">
        {escolhido ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[13px] font-sans text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl px-4 py-2.5 font-medium">
              ✓ Cenário escolhido: {escolhidoNome}
            </span>
            <div className="flex gap-2 flex-wrap">
              {cenarios.filter(c => c.id !== escolhido).map(c => (
                <button
                  key={c.id}
                  onClick={() => handleMarcar(c.id)}
                  className="text-[12px] font-sans text-gray-400 hover:text-[#2F1B20] underline transition-colors"
                >
                  Mudar para "{c.nome}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cenarios.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleMarcar(c.id)}
                className="py-2.5 px-4 rounded-xl text-[13px] font-sans font-medium border border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#F8FAFC] transition-all"
              >
                ✓ Marcar "{c.nome}" como escolhido
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => exportCsv(cenarios)}
          className="w-full py-2.5 rounded-xl text-[14px] font-sans font-medium border border-gray-300 text-gray-500 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
        >
          📥 Exportar comparação
        </button>
      </div>
    </motion.div>
  );
}
