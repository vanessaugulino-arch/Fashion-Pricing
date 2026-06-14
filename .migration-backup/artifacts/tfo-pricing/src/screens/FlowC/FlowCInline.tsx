import React, { useState, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';

interface FlowCInlineProps {
  nomeProduto: string;
  custoInicial: number;
  canal: 'varejo' | 'atacado';
  segmento: string;
  precoSimulado: number;
  margemSimulada: number;
  icmsNum: number;
}

export default function FlowCInline({
  nomeProduto,
  custoInicial,
  canal,
  precoSimulado,
  margemSimulada,
  icmsNum,
}: FlowCInlineProps) {
  const taxasDefault = canal === 'atacado' ? 7 : 11.5;
  const margemDefault = margemSimulada > 0 ? Math.round(margemSimulada) : 42;

  const [custo, setCusto] = useState(custoInicial > 0 ? custoInicial.toFixed(2) : '');
  const [margem, setMargem] = useState(Math.min(margemDefault, 80));
  const [icms, setIcms] = useState(icmsNum > 0 ? String(icmsNum) : '');
  const [taxas, setTaxas] = useState('');
  const [precoAtual, setPrecoAtual] = useState(precoSimulado > 0 ? precoSimulado.toFixed(2) : '');

  const custoNum = parseFloat(custo) || 0;
  const icmsNumVal = icms !== '' ? parseFloat(icms) : icmsNum || 10;
  const taxasNum = taxas !== '' ? parseFloat(taxas) : taxasDefault;
  const precoAtualNum = parseFloat(precoAtual) || 0;

  const somaTotal = icmsNumVal + taxasNum + margem;
  const isInvalid = somaTotal >= 100;
  const hasResult = custoNum > 0 && !isInvalid;

  const result = useMemo(() => {
    if (!hasResult) return null;
    const soma_pct = (icmsNumVal + taxasNum + margem) / 100;
    const precoIdeal = custoNum / (1 - soma_pct);
    const markup = precoIdeal / custoNum;
    const margemRs = precoIdeal * (margem / 100);
    const impostoTaxasRs = precoIdeal * ((icmsNumVal + taxasNum) / 100);
    const custoPct = (custoNum / precoIdeal) * 100;
    const impostoTaxasPct = icmsNumVal + taxasNum;

    let margemAtualPct: number | null = null;
    let diffRs: number | null = null;
    let diffPct: number | null = null;
    if (precoAtualNum > 0 && Math.abs(precoAtualNum - precoIdeal) > 0.01) {
      margemAtualPct = precoAtualNum > 0
        ? ((precoAtualNum - custoNum - precoAtualNum * (icmsNumVal + taxasNum) / 100) / precoAtualNum) * 100
        : null;
      diffRs = precoIdeal - precoAtualNum;
      diffPct = (diffRs / precoAtualNum) * 100;
    }

    return { precoIdeal, markup, margemRs, impostoTaxasRs, custoPct, impostoTaxasPct, margemAtualPct, diffRs, diffPct };
  }, [custoNum, icmsNumVal, taxasNum, margem, precoAtualNum, hasResult]);

  const fieldClass =
    'flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-[#C8B840] focus-within:ring-[3px] focus-within:ring-[#C8B840]/20';

  return (
    <div>
      {/* Separador visual */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span
          className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
          style={{ color: '#7C9DD0' }}
        >
          Preço ideal para este produto
        </span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(47,27,32,0.08)] border border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#C8B840' }} />

        <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-1 pt-1" style={{ color: '#C8B840' }}>
          Calcular o preço ideal
        </div>
        <p className="text-[14px] text-[#6B7280] font-sans mb-6">
          Com base nos dados simulados. Ajuste a margem desejada e veja o preço necessário.
        </p>

        <div className="flex flex-col gap-5">
          {/* Custo do produto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Custo do produto <span className="text-red-500">*</span>
            </label>
            <div className={fieldClass}>
              <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
              <input
                type="number" step="0.01" min="0"
                value={custo}
                onChange={e => setCusto(e.target.value)}
                placeholder="0,00"
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
              />
            </div>
          </div>

          {/* ICMS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              ICMS <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className={fieldClass}>
              <input
                type="number" step="0.1" min="0"
                value={icms}
                onChange={e => setIcms(e.target.value)}
                placeholder={String(icmsNum || 10)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
              />
              <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">%</span>
            </div>
            {icms === '' && (
              <span className="text-[12px] text-[#7C9DD0]">
                Usando estimativa de mercado: {icmsNum || 10}%
              </span>
            )}
          </div>

          {/* Taxas + comissões */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Taxas + comissões <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className={fieldClass}>
              <input
                type="number" step="0.1" min="0"
                value={taxas}
                onChange={e => setTaxas(e.target.value)}
                placeholder={String(taxasDefault)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
              />
              <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">%</span>
            </div>
            {taxas === '' && (
              <span className="text-[12px] text-[#7C9DD0]">
                Usando estimativa de mercado: {taxasDefault}% ({canal})
              </span>
            )}
            <span className="text-[12px] text-gray-400">Taxas de pagamento + comissões de venda</span>
          </div>

          {/* Separador margem */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.12em]" style={{ color: '#C8B840' }}>
              Margem desejada
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Margem slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                Margem desejada <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1 border-[1.5px] border-gray-300 rounded-lg px-2 py-1 w-[72px] focus-within:border-[#C8B840]">
                <input
                  type="number" min="0" max="80"
                  value={margem}
                  onChange={e => setMargem(Math.min(80, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-full text-right text-[15px] font-sans font-bold text-[#2F1B20] outline-none"
                />
                <span className="text-[13px] text-gray-500">%</span>
              </div>
            </div>
            <Slider
              value={[margem]}
              onValueChange={([v]) => setMargem(v)}
              min={0} max={80} step={1}
              className="w-full"
            />
            <span className="text-[12px] text-gray-400">
              O que deve sobrar de cada venda após todos os custos
            </span>
          </div>

          {/* Indicador soma */}
          <div className={`rounded-xl p-4 border text-[13px] ${isInvalid ? 'border-red-300 bg-red-50' : 'border-[#E5E7EB] bg-gray-50'}`}>
            <div className="flex justify-between font-medium mb-2.5">
              <span className={isInvalid ? 'text-red-600' : 'text-[#2F1B20]'}>
                Soma atual: {somaTotal.toFixed(1)}% de 100%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#7C9DD0]" style={{ width: `${Math.min(icmsNumVal + taxasNum, 100)}%` }} />
              <div
                className={`h-full ${isInvalid ? 'bg-red-400' : 'bg-[#C8B840]'}`}
                style={{ width: `${Math.max(0, Math.min(margem, 100 - icmsNumVal - taxasNum))}%` }}
              />
            </div>
            {isInvalid && (
              <div className="text-[12px] text-red-600 mt-2 font-medium">
                A soma ultrapassa 100%. Reduza a margem ou as deduções.
              </div>
            )}
          </div>

          {/* Separador preço atual */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.12em]" style={{ color: '#C8B840' }}>
              Comparação (opcional)
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Preço atual */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Preço atual praticado
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <div className={fieldClass}>
              <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
              <input
                type="number" step="0.01" min="0"
                value={precoAtual}
                onChange={e => setPrecoAtual(e.target.value)}
                placeholder="0,00"
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
              />
            </div>
          </div>
        </div>

        {/* ─── Resultado ─── */}
        {hasResult && result && (
          <div className="mt-8 flex flex-col gap-4">
            {/* Card herói */}
            <div className="rounded-2xl p-6" style={{ background: '#2F1B20' }}>
              <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Preço ideal para {margem}% de margem
                {nomeProduto ? ` · ${nomeProduto}` : ''}
              </div>
              <div className="font-sans font-bold leading-none mb-2" style={{ fontSize: '48px', color: '#FFFFFF' }}>
                {formatCurrency(result.precoIdeal)}
              </div>
              <div className="text-[14px] mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Custo: {formatCurrency(custoNum)}
              </div>
              <div
                className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-sans font-medium"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
              >
                Markup: {formatMultiplier(result.markup)}
              </div>
            </div>

            {/* Composição */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-[#E5E7EB]">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: '#C8B840' }}>
                Como esse preço é composto
              </div>
              <div className="flex h-2.5 w-full rounded-full overflow-hidden mb-4">
                <div className="h-full" style={{ width: `${result.custoPct.toFixed(0)}%`, background: '#2F1B20' }} />
                <div className="h-full" style={{ width: `${result.impostoTaxasPct.toFixed(0)}%`, background: '#7C9DD0' }} />
                <div className="h-full" style={{ width: `${margem}%`, background: '#2D6A4F' }} />
              </div>
              <div className="font-sans text-[13px] flex flex-col gap-0">
                <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#2F1B20' }} />
                    Custo do produto
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-[#2F1B20]">{formatCurrency(custoNum)}</span>
                    <span className="text-[11px] text-gray-400 ml-2">({result.custoPct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#7C9DD0' }} />
                    Imposto + taxas + comissões
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-[#2F1B20]">{formatCurrency(result.impostoTaxasRs)}</span>
                    <span className="text-[11px] text-gray-400 ml-2">({result.impostoTaxasPct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div className="flex justify-between py-2.5 mt-1 font-semibold rounded-lg -mx-1 px-1" style={{ background: '#ECFDF5', color: '#2D6A4F' }}>
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#2D6A4F' }} />
                    Margem de contribuição
                  </span>
                  <div className="text-right">
                    <span>{formatCurrency(result.margemRs)}</span>
                    <span className="text-[11px] ml-2 font-normal" style={{ color: '#2D6A4F', opacity: 0.7 }}>({margem}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparação com preço atual */}
            {result.diffRs !== null && result.margemAtualPct !== null && precoAtualNum > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
                <div className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: '#7C9DD0' }}>
                  Comparação com o preço atual
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center text-[13px] font-sans">
                    <span className="text-gray-500">Preço atual</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#2F1B20]">{formatCurrency(precoAtualNum)}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        result.margemAtualPct >= 40 ? 'bg-green-100 text-green-700' :
                        result.margemAtualPct >= 25 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Margem: {formatPercent(result.margemAtualPct)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-sans">
                    <span className="text-gray-500">Preço ideal</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#2F1B20]">{formatCurrency(result.precoIdeal)}</span>
                      <span className="text-[11px] bg-[#ECFDF5] text-[#065F46] px-2 py-0.5 rounded-full font-medium">
                        Margem: {formatPercent(margem)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className={`text-[13px] font-semibold ${result.diffRs >= 0 ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>
                      {result.diffRs >= 0 ? '+' : ''}{formatCurrency(result.diffRs)}
                      {result.diffPct !== null && (
                        <span className="ml-2 font-normal text-[12px]">
                          ({result.diffRs >= 0 ? '+' : ''}{result.diffPct.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400 mt-1">
                      {result.diffRs > 0
                        ? 'O preço ideal está acima do praticado. Há espaço para melhorar a margem.'
                        : 'O preço ideal está abaixo do praticado. Você já está acima da margem desejada.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!hasResult && (
          <div className="mt-6 flex items-center justify-center min-h-[160px] rounded-2xl border-2 border-dashed border-gray-200">
            <div className="text-center px-6">
              <div className="text-[36px] mb-2 text-gray-200">🏷️</div>
              <div className="font-sans text-[13px] text-gray-300">
                Informe o custo do produto para calcular o preço ideal
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
