import React from 'react';
import { useToolStore } from '@/store/useToolStore';
import { BarChart2, Store, Target } from 'lucide-react';

export default function EntryScreen() {
  const setActiveFlow = useToolStore(s => s.setActiveFlow);

  return (
    <main
      className="min-h-[calc(100vh-56px)] py-10 md:py-16 px-4"
      style={{ background: 'linear-gradient(135deg, #E8EEF7 0%, #EDE9F4 40%, #F0E8EA 100%)' }}
    >
      <div className="max-w-[860px] mx-auto">
        <h1 className="font-serif italic text-[28px] md:text-[36px] text-[#2F1B20] max-w-lg leading-tight">
          O que você quer descobrir agora?
        </h1>
        <p className="font-sans font-normal text-[16px] text-[#6B7280] mt-4 max-w-xl">
          Escolha um ponto de partida. Você aprofunda depois. Não precisa de todos os dados — só dos que tem agora.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card A — Produto (azul) */}
          <button
            onClick={() => setActiveFlow('A')}
            data-testid="card-flow-a"
            className="group flex flex-col items-start text-left rounded-2xl p-6 border-[1.5px] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(124,157,208,0.22)] transition-all duration-250 ease-out overflow-hidden relative"
            style={{ background: '#EEF3FA', borderColor: '#7C9DD0', borderTop: '3px solid #7C9DD0' }}
          >
            <span
              className="mb-4 text-[11px] font-sans font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: '#7C9DD0', color: 'white' }}
            >
              PRODUTO
            </span>
            <div className="mb-4 text-[#7C9DD0]">
              <BarChart2 size={28} />
            </div>
            <h3 className="font-sans font-semibold text-[18px] text-[#2F1B20] mb-2">
              Ver margem de um produto
            </h3>
            <p className="font-sans font-normal text-[14px] text-[#6B7280] flex-grow leading-relaxed">
              Descubra se o preço cobre os custos e como você está em relação ao mercado.
            </p>
            <div
              className="mt-5 w-full px-3 py-2 rounded-lg text-[12px] font-sans font-medium text-[#2F1B20] text-center"
              style={{ background: 'rgba(124,157,208,0.15)' }}
            >
              Preço − Custo − Imposto = Margem
            </div>
            <div className="mt-4 flex items-center font-sans font-medium text-[14px] text-[#7C9DD0]">
              → Começar
            </div>
          </button>

          {/* Card B — Negócio (vinho escuro) */}
          <button
            onClick={() => setActiveFlow('B')}
            data-testid="card-flow-b"
            className="group flex flex-col items-start text-left rounded-2xl p-6 border-[1.5px] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(47,27,32,0.35)] transition-all duration-250 ease-out"
            style={{ background: '#2F1B20', borderColor: '#2F1B20' }}
          >
            <span
              className="mb-4 text-[11px] font-sans font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
            >
              NEGÓCIO
            </span>
            <div className="mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
              <Store size={28} />
            </div>
            <h3 className="font-sans font-semibold text-[18px] mb-2" style={{ color: '#FFFFFF' }}>
              Analise sua Margem de Contribuição
            </h3>
            <p className="font-sans font-normal text-[14px] flex-grow leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Importe ou lance seus dados para encontrar o seu ponto de equilíbrio. Avalie se as vendas pagam sua estrutura e simule a distribuição ideal do seu mix de produtos.
            </p>
            <div
              className="mt-5 w-full px-3 py-2 rounded-lg text-[12px] font-sans font-medium text-center"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}
            >
              Vendas – Despesas (Fixas/Variáveis) = Ponto de Equilíbrio
            </div>
            <div className="mt-4 flex items-center font-sans font-medium text-[14px]" style={{ color: '#7C9DD0' }}>
              → Avaliar negócio
            </div>
          </button>

          {/* Card C — Estratégia (amarelo) */}
          <button
            onClick={() => setActiveFlow('D')}
            data-testid="card-flow-c"
            className="group flex flex-col items-start text-left rounded-2xl p-6 border-[1.5px] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(200,184,64,0.3)] transition-all duration-250 ease-out overflow-hidden"
            style={{ background: '#F6F1AF', borderColor: '#C8B840', borderTop: '3px solid #C8B840' }}
          >
            <span
              className="mb-4 text-[11px] font-sans font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(47,27,32,0.10)', color: '#2F1B20' }}
            >
              ESTRATÉGIA
            </span>
            <div className="mb-4 text-[#2F1B20]">
              <Target size={28} />
            </div>
            <h3 className="font-sans font-semibold text-[18px] text-[#2F1B20] mb-2">
              Analise seu posicionamento de preço
            </h3>
            <p className="font-sans font-normal text-[14px] flex-grow leading-relaxed" style={{ color: '#4B3520' }}>
              Avalie os atributos da sua marca frente aos concorrentes. Descubra se o seu preço reflete o valor percebido pelo cliente ou se exige ajustes de custos e comunicação.
            </p>
            <div
              className="mt-5 w-full px-3 py-2 rounded-lg text-[12px] font-sans font-medium text-[#2F1B20] text-center"
              style={{ background: 'rgba(47,27,32,0.08)' }}
            >
              Valor Percebido + Concorrência = Preço Estratégico
            </div>
            <div className="mt-4 flex items-center font-sans font-medium text-[14px] text-[#2F1B20]">
              → Montar matriz
            </div>
          </button>

        </div>

        <p className="text-center font-sans font-normal text-[13px] text-[#9CA3AF] mt-10">
          Você não precisa de todos os dados agora. Comece por onde faz sentido.
        </p>
      </div>
    </main>
  );
}
