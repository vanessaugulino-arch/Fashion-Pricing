import React from 'react';

interface Props {
  notasAltas: number;
  onRevisar: () => void;
  onSeguir: () => void;
}

export default function FlowDCalibration({ notasAltas, onRevisar, onSeguir }: Props) {
  return (
    <div className="max-w-[540px] mx-auto flex flex-col gap-6">
      <div className="rounded-2xl border p-6 shadow-sm" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-[24px] flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-sans font-semibold text-[15px] mb-1" style={{ color: '#92400E' }}>
              Autoavaliações tendem a ser otimistas — e isso é natural.
            </h3>
            <p className="text-[14px] leading-relaxed" style={{ color: '#92400E' }}>
              Você deu notas altas (4 ou 5) em <strong>{notasAltas} dos 12 critérios</strong>.
              Isso não é errado — mas é comum que gestores superestimem
              a percepção do cliente em relação à própria marca.
            </p>
          </div>
        </div>

        <div className="rounded-xl p-4 border mb-4" style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#FDE68A' }}>
          <p className="text-[14px] leading-relaxed" style={{ color: '#92400E' }}>
            Antes de ver o resultado, reflita rapidamente:
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            <li className="flex items-start gap-2 text-[13px]" style={{ color: '#92400E' }}>
              <span className="flex-shrink-0 mt-0.5">→</span>
              Você tem feedback direto de clientes que confirme essas notas?
            </li>
            <li className="flex items-start gap-2 text-[13px]" style={{ color: '#92400E' }}>
              <span className="flex-shrink-0 mt-0.5">→</span>
              Ou estão baseadas no que você gostaria que fosse verdade?
            </li>
          </ul>
        </div>

        <p className="text-[13px]" style={{ color: '#B45309' }}>
          Você pode revisar as notas agora, ou seguir e ter isso em mente ao ler o diagnóstico.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRevisar}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium border-[1.5px] border-[#2F1B20] text-[#2F1B20] hover:bg-gray-50 transition-all"
        >
          ← Revisar minhas notas
        </button>
        <button
          onClick={onSeguir}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium text-white transition-all hover:opacity-90"
          style={{ background: '#2F1B20' }}
        >
          Seguir para o resultado →
        </button>
      </div>
    </div>
  );
}
