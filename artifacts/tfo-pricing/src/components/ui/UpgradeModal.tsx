import React from 'react';
import { useToolStore } from '@/store/useToolStore';

interface Props {
  feature: string;
  description?: string;
  onClose: () => void;
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  salvar_produto: 'Salve e compare quantos produtos quiser e exporte o diagnóstico completo.',
  perfil_marca: 'Calibre os benchmarks ao perfil de marca (Acesso, Médio, Premium, Luxo) para uma análise mais precisa.',
  pecas_mes: 'Informe a quantidade de peças por mês e calcule o ponto de equilíbrio em unidades.',
};

export default function UpgradeModal({ feature, description, onClose }: Props) {
  const { setIsPremium } = useToolStore();

  const desc = description ?? FEATURE_DESCRIPTIONS[feature] ?? 'Desbloqueie análises mais profundas com o plano Premium.';

  function handleActivate() {
    setIsPremium(true);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(47,27,32,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-7 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-[20px] leading-none transition-colors"
          aria-label="Fechar"
        >
          ×
        </button>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#F6F1AF' }}>
          <span className="text-[22px]">🔒</span>
        </div>

        <h3 className="font-serif text-[20px] text-[#2F1B20] mb-2">Recurso Premium</h3>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">{desc}</p>

        <div className="rounded-xl p-4 border mb-6" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.4)' }}>
          <div className="text-[12px] font-semibold text-[#4B3520] uppercase tracking-wide mb-2">Com o Premium você tem:</div>
          <ul className="text-[13px] text-[#4B3520] flex flex-col gap-1.5">
            <li className="flex items-start gap-2"><span className="text-[#C8B840] mt-0.5">✓</span> Salvar e exportar produtos</li>
            <li className="flex items-start gap-2"><span className="text-[#C8B840] mt-0.5">✓</span> Perfil de marca nos benchmarks</li>
            <li className="flex items-start gap-2"><span className="text-[#C8B840] mt-0.5">✓</span> Volume de peças por mês</li>
            <li className="flex items-start gap-2"><span className="text-[#C8B840] mt-0.5">✓</span> Relatório PDF completo (em breve)</li>
          </ul>
        </div>

        <button
          onClick={handleActivate}
          className="w-full py-3 rounded-xl text-white font-sans font-semibold text-[15px] transition-all hover:opacity-90 mb-2"
          style={{ background: '#2F1B20' }}
        >
          Ativar Premium — grátis por ora
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-400 font-sans text-[14px] hover:bg-gray-50 transition-all"
        >
          Continuar no plano gratuito
        </button>
      </div>
    </div>
  );
}
