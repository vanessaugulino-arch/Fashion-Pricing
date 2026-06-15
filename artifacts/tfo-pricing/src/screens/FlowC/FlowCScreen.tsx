import React, { useState, useMemo } from 'react';
import { useToolStore } from '@/store/useToolStore';
import BackButton from '@/components/layout/BackButton';
import { Slider } from '@/components/ui/slider';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlowCScreen() {
  const { setActiveFlow } = useToolStore();
  const [custo, setCusto] = useState('');
  const [margem, setMargem] = useState(42);
  const [icms, setIcms] = useState('');
  const [taxas, setTaxas] = useState('');
  const [precoAtual, setPrecoAtual] = useState('');

  const custoNum = parseFloat(custo) || 0;
  const icmsNum = icms !== '' ? parseFloat(icms) : 10;
  const taxasNum = taxas !== '' ? parseFloat(taxas) : 11.5;
  const precoAtualNum = parseFloat(precoAtual) || 0;
  const somaTotal = icmsNum + taxasNum + margem;
  const isInvalid = somaTotal >= 100;
  const hasResult = custoNum > 0 && !isInvalid;

  const result = useMemo(() => {
    if (!hasResult) return null;
    const soma_pct = (icmsNum + taxasNum + margem) / 100;
    const precoIdeal = custoNum / (1 - soma_pct);
    const markup = precoIdeal / custoNum;
    const margemRs = precoIdeal * (margem / 100);
    const impostoTaxasRs = precoIdeal * ((icmsNum + taxasNum) / 100);
    const custoPct = (custoNum / precoIdeal) * 100;
    const impostoTaxasPct = icmsNum + taxasNum;
    const deltaRs = precoAtualNum > 0 ? precoAtualNum - precoIdeal : null;
    const deltaPct = precoAtualNum > 0 ? ((precoAtualNum - precoIdeal) / precoIdeal) * 100 : null;
    return { precoIdeal, markup, margemRs, impostoTaxasRs, custoPct, impostoTaxasPct, deltaRs, deltaPct };
  }, [custoNum, icmsNum, taxasNum, margem, precoAtualNum, hasResult]);

  const fieldClass =
    'flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-[#C8B840] focus-within:ring-[3px] focus-within:ring-[#C8B840]/20';

  return (
    <div className="max-w-[860px] mx-auto px-4 py-8">
      <BackButton />
      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">
        Formação de Preço
      </h2>
      <p className="font-sans text-[15px] text-[#6B7280] mb-8">
        Informe o custo e a margem desejada. O preço ideal aparece em tempo real.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna esquerda — Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(47,27,32,0.08)] border border-[#E5E7EB] relative overflow-hidden self-start">
          <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#C8B840' }} />

          <div className="flex flex-col gap-5 pt-2">
            {/* Nota informativa */}
            <div
              className="rounded-xl p-4 border text-[13px] leading-snug"
              style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.5)', color: '#4B3520' }}
            >
              O preço ideal é calculado para que, após todos os custos, sobre exatamente a margem que você precisa.
            </div>

            {/* Custo do produto */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                Custo do produto <span className="text-red-500">*</span>
              </label>
              <div className={fieldClass}>
                <span className="px-3 py-4 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">
                  R$
                </span>
                <input
                  data-testid="input-c-custo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={custo}
                  onChange={e => setCusto(e.target.value)}
                  placeholder="0,00"
                  className="flex-1 px-3 py-4 text-[18px] font-sans font-medium text-right outline-none"
                />
              </div>
            </div>

            {/* Margem desejada */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                  Margem desejada <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1 border-[1.5px] border-gray-300 rounded-lg px-2 py-1 w-[72px] focus-within:border-[#C8B840]">
                  <input
                    data-testid="input-c-margem"
                    type="number"
                    min="0"
                    max="80"
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
                min={0}
                max={80}
                step={1}
                className="w-full"
              />
              <span className="text-[12px] text-gray-400">
                O que deve sobrar de cada venda após todos os custos
              </span>
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.12em]" style={{ color: '#C8B840' }}>
                Deduções sobre o preço
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ICMS */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                ICMS <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className={fieldClass}>
                <input
                  data-testid="input-c-icms"
                  type="number"
                  step="0.1"
                  min="0"
                  value={icms}
                  onChange={e => setIcms(e.target.value)}
                  placeholder="10"
                  className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
                />
                <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">
                  %
                </span>
              </div>
            </div>

            {/* Taxas + comissões */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                Taxas + comissões <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className={fieldClass}>
                <input
                  data-testid="input-c-taxas"
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxas}
                  onChange={e => setTaxas(e.target.value)}
                  placeholder="11,5"
                  className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
                />
                <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">
                  %
                </span>
              </div>
              <span className="text-[12px] text-gray-400">Taxas de pagamento + comissões de venda</span>
            </div>

            {/* Preço atual praticado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                Preço atual praticado <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <div className={fieldClass}>
                <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">
                  R$
                </span>
                <input
                  data-testid="input-c-preco-atual"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoAtual}
                  onChange={e => setPrecoAtual(e.target.value)}
                  placeholder="0,00"
                  className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
                />
              </div>
              <span className="text-[12px] text-gray-400">Compare com o preço ideal calculado</span>
            </div>

            {/* Indicador em tempo real */}
            <div
              className={`rounded-xl p-4 border text-[13px] ${
                isInvalid ? 'border-red-300 bg-red-50' : 'border-[#E5E7EB] bg-gray-50'
              }`}
            >
              <div className="flex justify-between font-medium mb-2.5">
                <span className={isInvalid ? 'text-red-600' : 'text-[#2F1B20]'}>
                  Soma atual: {somaTotal.toFixed(1)}% de 100%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#7C9DD0]"
                  style={{ width: `${Math.min(icmsNum + taxasNum, 100)}%` }}
                />
                <div
                  className={`h-full ${isInvalid ? 'bg-red-400' : 'bg-[#C8B840]'}`}
                  style={{ width: `${Math.max(0, Math.min(margem, 100 - icmsNum - taxasNum))}%` }}
                />
              </div>
              {isInvalid && (
                <div className="text-[12px] text-red-600 mt-2 font-medium">
                  A soma ultrapassa 100%. Reduza a margem ou as deduções.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna direita — Preço Herói */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {hasResult && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {/* Card herói escuro */}
                <div className="rounded-2xl p-8" style={{ background: '#2F1B20' }}>
                  <div
                    className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-3"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    Preço ideal para {margem}% de margem
                  </div>
                  <div
                    className="font-sans font-bold leading-none mb-2"
                    style={{ fontSize: '52px', color: '#FFFFFF' }}
                    data-testid="text-preco-ideal"
                  >
                    {formatCurrency(result.precoIdeal)}
                  </div>
                  <div
                    className="text-[14px] mb-5"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    Custo: {formatCurrency(custoNum)}
                  </div>
                  <div
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-sans font-medium"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    Markup: {formatMultiplier(result.markup)}
                  </div>
                </div>

                {/* Comparação com preço atual */}
                {result.deltaRs !== null && result.deltaPct !== null && (
                  <div
                    className="rounded-2xl p-5 border"
                    style={{
                      background: result.deltaRs >= 0 ? '#ECFDF5' : '#FEF2F2',
                      borderColor: result.deltaRs >= 0 ? '#A7F3D0' : '#FECACA',
                    }}
                  >
                    <div
                      className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-3"
                      style={{ color: result.deltaRs >= 0 ? '#065F46' : '#991B1B' }}
                    >
                      {result.deltaRs >= 0 ? 'Preço atual acima do ideal' : 'Preço atual abaixo do ideal'}
                    </div>
                    <div className="flex items-end gap-3">
                      <div>
                        <div className="text-[11px] text-gray-500 mb-0.5">Atual</div>
                        <div className="text-[22px] font-bold" style={{ color: result.deltaRs >= 0 ? '#065F46' : '#991B1B' }}>
                          {formatCurrency(precoAtualNum)}
                        </div>
                      </div>
                      <div className="text-[20px] text-gray-400 pb-1">→</div>
                      <div>
                        <div className="text-[11px] text-gray-500 mb-0.5">Ideal</div>
                        <div className="text-[22px] font-bold text-[#2F1B20]">
                          {formatCurrency(result.precoIdeal)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mt-3 text-[13px] font-medium"
                      style={{ color: result.deltaRs >= 0 ? '#065F46' : '#991B1B' }}
                    >
                      {result.deltaRs >= 0 ? '+' : ''}{formatCurrency(result.deltaRs)}{' '}
                      ({result.deltaPct >= 0 ? '+' : ''}{result.deltaPct.toFixed(1)}%)
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {result.deltaRs >= 0
                        ? 'Você já pratica acima do mínimo necessário para essa margem.'
                        : 'Para atingir essa margem, você precisaria aumentar o preço.'}
                    </p>
                  </div>
                )}

                {/* Composição do preço */}
                <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
                  <div
                    className="text-[11px] font-sans font-semibold uppercase tracking-[0.1em] mb-4"
                    style={{ color: '#C8B840' }}
                  >
                    Como esse preço é composto
                  </div>

                  {/* Barra empilhada */}
                  <div className="flex h-2.5 w-full rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full"
                      style={{ width: `${result.custoPct.toFixed(0)}%`, background: '#2F1B20' }}
                    />
                    <div
                      className="h-full"
                      style={{ width: `${result.impostoTaxasPct.toFixed(0)}%`, background: '#7C9DD0' }}
                    />
                    <div
                      className="h-full"
                      style={{ width: `${margem}%`, background: '#2D6A4F' }}
                    />
                  </div>

                  <div className="font-sans text-[14px] flex flex-col gap-0">
                    <div className="flex justify-between py-2 text-gray-600 border-b border-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#2F1B20' }} />
                        Custo do produto
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-[#2F1B20]">{formatCurrency(custoNum)}</span>
                        <span className="text-[12px] text-gray-400 ml-2">
                          ({result.custoPct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 text-gray-600 border-b border-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#7C9DD0' }} />
                        Imposto + taxas + comissões
                      </span>
                      <div className="text-right">
                        <span className="font-medium text-[#2F1B20]">{formatCurrency(result.impostoTaxasRs)}</span>
                        <span className="text-[12px] text-gray-400 ml-2">
                          ({result.impostoTaxasPct.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2.5 mt-1 font-semibold rounded-lg -mx-1 px-1" style={{ background: '#ECFDF5', color: '#2D6A4F' }}>
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#2D6A4F' }} />
                        Margem de contribuição
                      </span>
                      <div className="text-right">
                        <span>{formatCurrency(result.margemRs)}</span>
                        <span className="text-[12px] ml-2 font-normal" style={{ color: '#2D6A4F', opacity: 0.7 }}>
                          ({margem}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setActiveFlow('B')}
                    className="w-full py-2.5 rounded-xl text-white text-[14px] font-sans font-medium transition-all hover:opacity-90"
                    style={{ background: '#2F1B20' }}
                  >
                    → Análise de Precificação do Negócio
                  </button>
                  <button
                    onClick={() => setActiveFlow('A')}
                    className="w-full py-2.5 rounded-xl text-[14px] font-sans font-medium border border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#F8FAFC] transition-all"
                  >
                    → Diagnóstico de Margem
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-gray-200"
              >
                <div className="text-center px-6">
                  <div className="text-[40px] mb-3 text-gray-200">🏷️</div>
                  <div className="font-sans text-[14px] text-gray-300">
                    Informe o custo do produto
                    <br />
                    para calcular o preço ideal
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
