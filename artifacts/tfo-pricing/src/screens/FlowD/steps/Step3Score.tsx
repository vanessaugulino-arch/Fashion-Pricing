import React from 'react';
import { FlowDState } from '../types';
import { CRITERIOS, DIMENSOES } from '../criterios';
import { Slider } from '@/components/ui/slider';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  data: FlowDState;
  onChange: (patch: Partial<FlowDState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DIM_ORDER = ['PRODUTO', 'MARCA', 'PRESENÇA', 'MARKETING'] as const;

export default function Step3Score({ data, onChange, onBack, onNext }: Props) {
  const setScore = (id: string, val: number) => {
    onChange({ scores: { ...data.scores, [id]: val } });
  };

  const totalScore = Object.values(data.scores).reduce((a, b) => a + b, 0);
  const maxScore = Object.keys(data.scores).length * 5;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="rounded-xl p-4 border" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.5)' }}>
        <p className="text-[14px] leading-relaxed" style={{ color: '#4B3520' }}>
          Esta é a parte mais importante — e a mais difícil de fazer com honestidade. Avalie cada critério com base no que seu cliente percebe, não no que você entrega ou deseja entregar. Se tiver dúvida, escolha a nota menor.
          <br /><br />
          <strong>Uma análise conservadora é mais útil que uma análise otimista.</strong>
        </p>
      </div>

      {DIM_ORDER.map(dimKey => {
        const dim = DIMENSOES[dimKey];
        const criteriosDim = CRITERIOS.filter(c => c.dimensao === dimKey);
        return (
          <div key={dimKey} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: dim.cor, opacity: 0.3 }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: dim.cor }}>
                {dim.label}
              </span>
              <div className="h-px flex-1" style={{ background: dim.cor, opacity: 0.3 }} />
            </div>

            {criteriosDim.map(crit => {
              const score = data.scores[crit.id] ?? 3;
              const showReflexao = score >= 4;

              return (
                <div
                  key={crit.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: crit.corDimensao }} />

                  <div className="pt-1 flex flex-col gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: crit.corDimensao }}>
                        {crit.dimensao}
                      </span>
                      <h4 className="font-sans font-semibold text-[15px] text-[#2F1B20] mt-0.5">{crit.titulo}</h4>
                      <p className="text-[13px] text-[#6B7280] mt-1 italic leading-relaxed">"{crit.pergunta}"</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[11px] text-gray-400 leading-tight max-w-[38%]">{crit.ancora1}</span>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[20px] flex-shrink-0"
                          style={{ background: crit.corDimensao, color: 'white' }}
                        >
                          {score}
                        </div>
                        <span className="text-[11px] text-gray-400 leading-tight text-right max-w-[38%]">{crit.ancora5}</span>
                      </div>

                      <Slider
                        value={[score]}
                        onValueChange={([v]) => setScore(crit.id, v)}
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />

                      <div className="flex justify-between text-[10px] text-gray-300 -mt-1 px-0.5">
                        {[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}
                      </div>
                    </div>

                    <AnimatePresence>
                      {showReflexao && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="rounded-xl p-3 border text-[12px] leading-relaxed" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}>
                            ⚡ <strong>Nota alta</strong> — {crit.reflexao4}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-[14px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium text-white transition-all hover:opacity-90"
          style={{ background: '#2F1B20' }}
        >
          Ver diagnóstico →
        </button>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-10 px-4 py-3 border-t border-[#E5E7EB] text-center"
        style={{ background: '#F2F2F2' }}
      >
        <p className="text-[12px]" style={{ color: '#9CA3AF' }}>
          📌 Lembre-se: avalie pelo que o cliente percebe, não pelo que você deseja. Em caso de dúvida entre duas notas, escolha a menor — isso torna o diagnóstico mais útil e honesto.
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: '#C8B840' }}>
          Score atual: {totalScore}/{maxScore}
        </p>
      </div>
    </div>
  );
}
