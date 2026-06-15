import React from 'react';
import { FlowDState, PosicionamentoTier, PosicionamentoEditorial } from '../types';
import { POSICIONAMENTOS } from '../criterios';

const POSICIONAMENTOS_EDITORIAIS: Array<{ id: PosicionamentoEditorial; label: string; desc: string }> = [
  { id: 'basico', label: 'Básico', desc: 'Funcional e de reposição. Giro domina, ícone mínimo.' },
  { id: 'classico', label: 'Clássico', desc: 'Identidade emergente. Sustentador ganha peso.' },
  { id: 'contemporaneo', label: 'Contemporâneo', desc: 'Equilíbrio entre narrativa e resultado.' },
  { id: 'editorial', label: 'Editorial', desc: 'Marca como produto. Ícones são ferramentas de desejo.' },
  { id: 'alta_moda', label: 'Alta Moda', desc: 'Ícone é a alma da coleção. Luxo não usa isca de preço.' },
];

interface Props {
  data: FlowDState;
  onChange: (patch: Partial<FlowDState>) => void;
  onNext: () => void;
}

export default function Step1Context({ data, onChange, onNext }: Props) {
  const canProceed = data.segmento.trim().length > 0 && data.posicionamentoAtual !== '';

  const fieldClass = 'border-[1.5px] border-gray-300 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#C8B840] focus:ring-[3px] focus:ring-[#C8B840]/20 transition-all w-full';

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-4 border" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.5)' }}>
        <p className="text-[14px] leading-relaxed" style={{ color: '#4B3520' }}>
          Antes de qualquer número, precisamos entender onde você está e onde quer chegar. Seja honesto sobre o posicionamento <strong>atual</strong> — não o ideal. A análise parte de onde você está hoje, não de onde você deseja estar.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-[#2F1B20]">
          Segmento de moda <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.segmento}
          onChange={e => onChange({ segmento: e.target.value })}
          placeholder="Ex: moda feminina contemporânea, roupas íntimas, streetwear..."
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-[#2F1B20]">
          Posicionamento editorial <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <p className="text-[12px] text-gray-500 -mt-1">Onde a marca se situa na cadeia criativa — independente do preço praticado.</p>
        <div className="flex flex-col gap-1.5">
          {POSICIONAMENTOS_EDITORIAIS.map(pe => {
            const sel = data.posicionamentoEditorial === pe.id;
            return (
              <button
                key={pe.id}
                type="button"
                onClick={() => onChange({ posicionamentoEditorial: sel ? '' : pe.id as PosicionamentoEditorial })}
                className={`text-left rounded-xl px-4 py-3 border-[1.5px] transition-all flex items-start gap-3 ${sel ? 'shadow-[0_0_0_2px_rgba(200,184,64,0.2)]' : 'hover:border-gray-300'}`}
                style={{ borderColor: sel ? '#C8B840' : '#E5E7EB', background: sel ? 'rgba(200,184,64,0.06)' : 'white' }}
              >
                <div className="w-3.5 h-3.5 rounded-full border-[2px] flex-shrink-0 mt-0.5 transition-all"
                  style={{ borderColor: sel ? '#C8B840' : '#D1D5DB', background: sel ? '#C8B840' : 'transparent' }} />
                <div>
                  <span className="text-[13px] font-semibold text-[#2F1B20]">{pe.label}</span>
                  <span className="text-[12px] text-gray-400 ml-2">{pe.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-[#2F1B20]">
          Posicionamento atual da marca <span className="text-red-500">*</span>
        </label>
        <p className="text-[12px] text-gray-500 -mt-1">Onde sua marca está hoje — não onde você quer que ela chegue.</p>
        <div className="grid grid-cols-2 gap-2">
          {POSICIONAMENTOS.map(p => {
            const sel = data.posicionamentoAtual === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ posicionamentoAtual: p.id as PosicionamentoTier })}
                className={`text-left rounded-xl p-3 border-[1.5px] transition-all ${sel ? 'shadow-[0_0_0_2px_rgba(47,27,32,0.15)]' : 'hover:border-gray-300'}`}
                style={{ borderColor: sel ? '#2F1B20' : '#E5E7EB', background: sel ? 'rgba(47,27,32,0.04)' : 'white' }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                  <span className="text-[13px] font-semibold text-[#2F1B20]">{p.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 ml-[18px]">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-semibold text-[#2F1B20]">
          Posicionamento desejado <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <p className="text-[12px] text-gray-500 -mt-1">Onde você quer que a marca chegue? Útil para o mapa de posicionamento.</p>
        <div className="grid grid-cols-2 gap-2">
          {POSICIONAMENTOS.map(p => {
            const sel = data.posicionamentoDesejado === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ posicionamentoDesejado: sel ? '' : (p.id as PosicionamentoTier) })}
                className={`text-left rounded-xl p-3 border-[1.5px] transition-all ${sel ? 'shadow-[0_0_0_2px_rgba(200,184,64,0.25)]' : 'hover:border-gray-300'}`}
                style={{ borderColor: sel ? '#C8B840' : '#E5E7EB', background: sel ? 'rgba(200,184,64,0.07)' : 'white' }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                  <span className="text-[13px] font-semibold text-[#2F1B20]">{p.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 ml-[18px]">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-[#2F1B20]">
          Preço médio praticado atualmente <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <div className="flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden focus-within:border-[#C8B840] focus-within:ring-[3px] focus-within:ring-[#C8B840]/20 transition-all">
          <span className="px-3 py-3.5 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={data.precoMedioAtual}
            onChange={e => onChange({ precoMedioAtual: e.target.value })}
            placeholder="0,00"
            className="flex-1 px-3 py-3.5 text-[15px] text-right outline-none"
          />
        </div>
        <span className="text-[12px] text-gray-400">Usado como referência no cálculo do preço sugerido</span>
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: canProceed ? '#2F1B20' : '#E5E7EB', color: canProceed ? 'white' : '#9CA3AF' }}
      >
        Próximo: mapear concorrentes →
      </button>
    </div>
  );
}
