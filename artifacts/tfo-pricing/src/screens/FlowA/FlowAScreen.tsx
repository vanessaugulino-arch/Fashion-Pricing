import React, { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import BackButton from '@/components/layout/BackButton';
import { BENCHMARK_MARGEM_BRUTA, SEGMENTOS_FLOWA, ICMS_DEFAULTS } from '@/engine/benchmarks';
import FlowAResult from './FlowAResult';

type Canal = 'varejo' | 'atacado';

export default function FlowAScreen() {
  const { setActiveFlow, produtosSalvos, precoSugeridoD, setPrecoSugeridoD } = useToolStore();

  const [nomeProduto, setNomeProduto] = useState('');
  const [segmento, setSegmento] = useState('');
  const [canal, setCanal] = useState<Canal | ''>('');
  const [preco, setPreco] = useState(() => {
    if (precoSugeridoD) {
      setPrecoSugeridoD('');
      return precoSugeridoD;
    }
    return '';
  });
  const [custo, setCusto] = useState('');
  const [icms, setIcms] = useState('');
  const [showResult, setShowResult] = useState(false);

  const precoNum = parseFloat(preco) || 0;
  const custoNum = parseFloat(custo) || 0;
  const icmsDefault = canal === 'atacado' ? ICMS_DEFAULTS.atacado : ICMS_DEFAULTS.varejo;
  const icmsNum = icms !== '' ? parseFloat(icms) : icmsDefault;
  const icmsFromUser = icms !== '';

  const hasValidIcms = icmsNum >= 0 && icmsNum <= 25;
  const hasPrecoMaiorCusto = precoNum > 0 && custoNum > 0 && precoNum > custoNum;
  const hasResult = hasPrecoMaiorCusto && segmento !== '' && canal !== '' && hasValidIcms;

  const showSegmentoError = precoNum > 0 && custoNum > 0 && segmento === '';
  const showCanalError = precoNum > 0 && custoNum > 0 && canal === '';
  const showPrecoError = precoNum > 0 && custoNum > 0 && precoNum <= custoNum;
  const showIcmsError = icmsFromUser && !hasValidIcms;

  const inputClass =
    'flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-[#7C9DD0] focus-within:ring-[3px] focus-within:ring-[#7C9DD0]/15';

  function handleSimular() {
    if (!hasResult) return;
    setShowResult(true);
  }

  function handleBack() {
    setShowResult(false);
  }

  function handleReset() {
    setNomeProduto('');
    setSegmento('');
    setCanal('');
    setPreco('');
    setCusto('');
    setIcms('');
    setShowResult(false);
  }

  if (showResult && hasResult) {
    return (
      <FlowAResult
        nomeProduto={nomeProduto}
        precoInicial={precoNum}
        custoInicial={custoNum}
        icmsNum={icmsNum}
        segmento={segmento}
        canal={canal as Canal}
        onBack={handleBack}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="max-w-[540px] mx-auto px-4 py-8">
      <BackButton />
      <div className="flex items-start justify-between gap-4 mb-1">
        <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20]">
          Ver margem de um produto
        </h2>
        {produtosSalvos.length >= 1 && (
          <button
            onClick={() => setActiveFlow('export')}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-[#7C9DD0] text-[#7C9DD0] rounded-xl text-[12px] font-sans font-medium hover:bg-[#EEF3FA] transition-all"
          >
            📋 Simulações salvas
            <span className="bg-[#7C9DD0] text-white text-[10px] rounded-full px-1.5 py-0.5 font-semibold leading-none">
              {produtosSalvos.length}
            </span>
          </button>
        )}
      </div>
      <p className="font-sans text-[15px] text-[#6B7280] mb-8">
        Preencha o segmento, canal e valores. O resultado aparece em seguida.
      </p>

      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(47,27,32,0.08)] border border-[#E5E7EB] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#7C9DD0' }} />

        <div className="flex flex-col gap-5 pt-2">

          {/* Nome do produto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Nome do produto
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <input
              type="text"
              value={nomeProduto}
              onChange={e => setNomeProduto(e.target.value)}
              placeholder="Ex: Blazer Curto Verde"
              className="border-[1.5px] border-gray-300 rounded-xl px-3 py-3 text-[14px] font-sans text-[#2F1B20] outline-none transition-all focus:border-[#7C9DD0] focus:ring-[3px] focus:ring-[#7C9DD0]/15"
            />
            <span className="text-[12px] text-gray-400">
              Opcional — ajuda a identificar ao salvar e exportar
            </span>
          </div>

          {/* Segmento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Segmento do produto <span className="text-red-500">*</span>
            </label>
            <select
              value={segmento}
              onChange={e => setSegmento(e.target.value)}
              className="border-[1.5px] border-gray-300 rounded-xl px-3 py-3 text-[14px] font-sans text-[#2F1B20] bg-white outline-none transition-all focus:border-[#7C9DD0] focus:ring-[3px] focus:ring-[#7C9DD0]/15 appearance-none cursor-pointer"
            >
              <option value="">Selecione o segmento…</option>
              {SEGMENTOS_FLOWA.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {showSegmentoError && (
              <span className="text-[12px] text-red-600">Selecione o segmento para continuar.</span>
            )}
          </div>

          {/* Canal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Canal de venda <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {(['varejo', 'atacado'] as const).map(opt => (
                <label
                  key={opt}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-[1.5px] cursor-pointer text-[14px] font-sans font-medium transition-all select-none ${
                    canal === opt
                      ? 'border-[#7C9DD0] bg-[#EEF3FB] text-[#2F1B20]'
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="canal"
                    value={opt}
                    checked={canal === opt}
                    onChange={() => setCanal(opt)}
                    className="sr-only"
                  />
                  {opt === 'varejo' ? 'Varejo' : 'Atacado'}
                </label>
              ))}
            </div>
            {showCanalError && (
              <span className="text-[12px] text-red-600">Selecione o canal de venda para continuar.</span>
            )}
          </div>

          {/* Preço */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Preço de venda <span className="text-red-500">*</span>
            </label>
            <div className={inputClass}>
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-r border-gray-200 select-none">
                R$
              </span>
              <input
                data-testid="input-preco"
                type="number"
                step="0.01"
                min="0"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="0,00"
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
            </div>
          </div>

          {/* Custo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              Custo do produto <span className="text-red-500">*</span>
            </label>
            <div className={inputClass}>
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-r border-gray-200 select-none">
                R$
              </span>
              <input
                data-testid="input-custo"
                type="number"
                step="0.01"
                min="0"
                value={custo}
                onChange={e => setCusto(e.target.value)}
                placeholder="0,00"
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
            </div>
            <span className="text-[12px] text-gray-400">
              Custo de produção ou compra por unidade
            </span>
          </div>

          {/* ICMS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
              ICMS na venda{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className={inputClass}>
              <input
                data-testid="input-icms"
                type="number"
                step="0.1"
                min="0"
                max="25"
                value={icms}
                onChange={e => setIcms(e.target.value)}
                placeholder={String(icmsDefault)}
                className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none bg-white"
              />
              <span className="px-3 py-3 text-[14px] font-sans text-gray-500 bg-gray-50 border-l border-gray-200 select-none">
                %
              </span>
            </div>
            {!icmsFromUser && canal !== '' && (
              <span className="text-[12px] text-[#7C9DD0]">
                Usando estimativa de mercado: {icmsDefault}%
              </span>
            )}
            {!icmsFromUser && canal === '' && (
              <span className="text-[12px] text-gray-400">
                Default: 10% varejo · 6% atacado
              </span>
            )}
            {showIcmsError && (
              <span className="text-[12px] text-red-600">ICMS deve estar entre 0% e 25%.</span>
            )}
          </div>

          {showPrecoError && (
            <div className="text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-2">
              O preço deve ser maior que o custo.
            </div>
          )}

          <button
            data-testid="button-simular"
            disabled={!hasResult}
            onClick={handleSimular}
            className="w-full py-3 rounded-xl text-white font-sans font-medium text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#7C9DD0' }}
          >
            Simular
          </button>
        </div>
      </div>
    </div>
  );
}
