import React, { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import { FlowDState, INITIAL_STATE } from './types';
import { calcularScoreTotal, scoreTier } from './engine';
import Step1Context from './steps/Step1Context';
import Step2Competitors from './steps/Step2Competitors';
import Step3Score from './steps/Step3Score';
import FlowDCalibration from './FlowDCalibration';
import FlowDResult from './FlowDResult';

type StepKey = 1 | 2 | 3 | 'calibracao' | 'resultado';

const STEP_LABELS = ['Contexto', 'Concorrentes', 'Avaliação'];

function ProgressBar({ step }: { step: StepKey }) {
  const num = typeof step === 'number' ? step : step === 'calibracao' ? 3 : 4;
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const done = num > idx;
        const active = num === idx;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{
                  background: done ? '#2F1B20' : active ? '#C8B840' : '#E5E7EB',
                  color: done ? 'white' : active ? '#2F1B20' : '#9CA3AF',
                }}
              >
                {done ? '✓' : idx}
              </div>
              <span className="text-[12px] font-medium hidden sm:block" style={{ color: active ? '#2F1B20' : done ? '#6B7280' : '#9CA3AF' }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="flex-1 h-px" style={{ background: done ? '#2F1B20' : '#E5E7EB' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function FlowDScreen() {
  const { setActiveFlow, updateFlowA, setPrecoSugeridoD, setPerfilMarca } = useToolStore();
  const [step, setStep] = useState<StepKey>(1);
  const [data, setData] = useState<FlowDState>({ ...INITIAL_STATE });

  const updateData = (patch: Partial<FlowDState>) => setData(prev => ({ ...prev, ...patch }));

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goToStep = (s: StepKey) => {
    setStep(s);
    scrollTop();
  };

  const handleStep3Complete = () => {
    const totalScore = calcularScoreTotal(data.scores, data.concorrentes);
    const tier = scoreTier(totalScore);
    setPerfilMarca(tier);

    const notasAltas = Object.values(data.scores).filter(n => n >= 4).length;
    if (notasAltas >= 8) {
      goToStep('calibracao');
    } else {
      goToStep('resultado');
    }
  };

  const handleVerMargem = (precoMid: number) => {
    if (precoMid > 0) {
      setPrecoSugeridoD(precoMid.toFixed(2));
    }
    setActiveFlow('A');
  };

  const notasAltas = Object.values(data.scores).filter(n => n >= 4).length;

  return (
    <div className="max-w-[640px] mx-auto px-4 py-8">
      <button
        onClick={() => setActiveFlow(null)}
        className="flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        ← Voltar
      </button>

      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">
        Definir uma estratégia de preço
      </h2>
      <p className="font-sans text-[15px] text-[#6B7280] mb-6">
        Descubra qual preço o valor da sua marca sustenta — com base em percepção, mercado e concorrência.
      </p>

      {step !== 'resultado' && <ProgressBar step={step} />}

      {step === 1 && (
        <>
          <div className="rounded-2xl border p-5 mb-6 shadow-sm" style={{ background: '#F6F1AF', borderColor: 'rgba(47,27,32,0.12)' }}>
            <div className="flex items-start gap-3">
              <span className="text-[20px] flex-shrink-0">ℹ️</span>
              <div>
                <h3 className="font-sans font-semibold text-[15px] text-[#2F1B20] mb-2">
                  Esta é uma análise exploratória — e é assim que ela deve ser usada.
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#4B3520' }}>
                  As respostas a seguir são baseadas na sua percepção atual da marca. Essa percepção é um ponto de partida valioso — mas pode diferir do que seus clientes realmente enxergam.
                </p>
                <p className="text-[13px] leading-relaxed mt-2" style={{ color: '#4B3520' }}>
                  O ideal é que, depois de concluir esta análise, você a leve para um profissional de marketing ou pesquisa e a valide com seu público real. Use o resultado aqui para tomar decisões com mais clareza enquanto você ainda não tem esses dados — não como um diagnóstico definitivo.
                </p>
                <div className="mt-3 pt-3 border-t border-[#C8B840]/30">
                  <p className="text-[12px]" style={{ color: '#92794A' }}>
                    💡 Dica: seja honesto sobre o que o cliente nota, não sobre o que você deseja que ele note. A análise só é útil se for realista.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#C8B840' }} />
            <Step1Context data={data} onChange={updateData} onNext={() => goToStep(2)} />
          </div>
        </>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#7C9DD0' }} />
          <Step2Competitors
            data={data}
            onChange={updateData}
            onNext={() => goToStep(3)}
            onBack={() => goToStep(1)}
          />
        </div>
      )}

      {step === 3 && (
        <Step3Score
          data={data}
          onChange={updateData}
          onNext={handleStep3Complete}
          onBack={() => goToStep(2)}
        />
      )}

      {step === 'calibracao' && (
        <FlowDCalibration
          notasAltas={notasAltas}
          onRevisar={() => goToStep(3)}
          onSeguir={() => goToStep('resultado')}
        />
      )}

      {step === 'resultado' && (
        <FlowDResult
          data={data}
          onVerMargem={handleVerMargem}
          onVerNegocio={() => setActiveFlow('B')}
          onNovaAnalise={() => {
            setData({ ...INITIAL_STATE });
            goToStep(1);
          }}
        />
      )}
    </div>
  );
}
