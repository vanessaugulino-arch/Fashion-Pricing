import React, { useState } from 'react';
import { useToolStore } from '@/store/useToolStore';
import BackButton from '@/components/layout/BackButton';
import { MIX_DEFAULTS_POR_PERFIL, PAPEL_PRODUTO_DEFAULTS } from '@/engine/benchmarks';
import { calcMixResult, formatCurrency, formatPercent } from '@/engine/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function MixPortfolioScreen() {
  const { mixPortfolio, updatePapelMix, resultB, setActiveFlow } = useToolStore();
  const [perfil, setPerfil] = useState(mixPortfolio.perfilMarca);

  const handleSelectPerfil = (p: string) => {
    setPerfil(p);
    useToolStore.setState(state => ({
      mixPortfolio: {
        ...state.mixPortfolio,
        perfilMarca: p,
        papeis: {
          icone: { ...state.mixPortfolio.papeis.icone, participacao: MIX_DEFAULTS_POR_PERFIL[p].icone },
          sustentador: { ...state.mixPortfolio.papeis.sustentador, participacao: MIX_DEFAULTS_POR_PERFIL[p].sustentador },
          motorGiro: { ...state.mixPortfolio.papeis.motorGiro, participacao: MIX_DEFAULTS_POR_PERFIL[p].motorGiro },
          portaEntrada: { ...state.mixPortfolio.papeis.portaEntrada, participacao: MIX_DEFAULTS_POR_PERFIL[p].portaEntrada },
        }
      }
    }));
  };

  const handleBack = () => {
    if (!perfil) setActiveFlow('B');
    else setPerfil('');
  };

  if (!perfil) {
    return (
      <div className="max-w-[860px] mx-auto px-4 py-8">
        <div onClick={() => setActiveFlow('B')}><BackButton /></div>
        <h2 className="font-serif text-[26px] text-[#2F1B20]">Otimize o mix da sua coleção</h2>
        <p className="font-sans text-[15px] text-[#6B7280] mt-2 mb-10">Cada produto tem um papel estratégico.</p>
        
        <h3 className="font-sans font-semibold text-[18px] text-[#2F1B20] mb-4">Qual é o posicionamento da sua marca?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'luxo', title: 'Alta Moda / Luxo', desc: 'Alto apelo de design, público selecionado, preços elevados.' },
            { id: 'contemporanea', title: 'Moda Contemporânea', desc: 'Equilíbrio entre moda e acessibilidade, segmento médio-alto.' },
            { id: 'basico', title: 'Básico / Casual', desc: 'Foco em uso diário, praticidade, público amplo, preços médios.' },
            { id: 'acessivel', title: 'Acessível / Popular', desc: 'Volume alto, preços de entrada, grande capilaridade.' }
          ].map(p => (
            <button key={p.id} onClick={() => handleSelectPerfil(p.id)} className="text-left bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#7C9DD0] transition-colors shadow-sm">
              <div className="font-sans font-semibold text-[#2F1B20] mb-2">{p.title}</div>
              <div className="font-sans text-[13px] text-gray-500 leading-relaxed">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // SIMULADOR
  const papeis = mixPortfolio.papeis;
  const fatTotal = resultB?.faturamentoValue || 100000;
  const volTotal = resultB?.quantidadeValue || 1000;
  const custoFixo = resultB?.inputs?.custoFixo ? parseFloat(resultB.inputs.custoFixo) : 0;

  const sumPart = papeis.icone.participacao + papeis.sustentador.participacao + papeis.motorGiro.participacao + papeis.portaEntrada.participacao;
  const papeisMapped = Object.fromEntries(
    Object.entries(papeis).map(([k, v]) => [k, { ...v, precoMedio: v.precoMedio ? parseFloat(v.precoMedio as string) : undefined }])
  );
  const mixResult = calcMixResult({ papeis: papeisMapped, faturamentoTotal: fatTotal, volumeTotal: volTotal, custoFixo });

  const chartData = [
    { name: 'Ícone', value: papeis.icone.participacao, fill: '#2F1B20' },
    { name: 'Sustentador', value: papeis.sustentador.participacao, fill: '#7C9DD0' },
    { name: 'Motor Giro', value: papeis.motorGiro.participacao, fill: '#6B7280' },
    { name: 'Porta Entrada', value: papeis.portaEntrada.participacao, fill: '#F6F1AF' },
  ];

  return (
    <div className="max-w-[860px] mx-auto px-4 py-8">
      <div onClick={handleBack}><BackButton /></div>
      <h2 className="font-serif text-[26px] text-[#2F1B20] mb-8">Simulador de Mix de Portfólio</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Chart Column */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center">
          <div className="h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <RechartsTooltip formatter={(val: number) => `${val}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
              <span className="text-[24px] font-bold text-[#2F1B20] leading-none">{sumPart}%</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Total</span>
            </div>
          </div>
          {sumPart !== 100 && (
            <div className="mt-4 text-[12px] font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-center">
              A soma das participações precisa ser 100%
            </div>
          )}
        </div>

        {/* Table Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-[13px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[#2F1B20]">PAPEL</th>
                  <th className="px-4 py-3 font-semibold text-[#2F1B20] w-[90px]">PART.%</th>
                  <th className="px-4 py-3 font-semibold text-[#2F1B20] w-[90px]">MARGEM%</th>
                  <th className="px-4 py-3 font-semibold text-[#2F1B20] w-[90px]">REMARC.%</th>
                  <th className="px-4 py-3 font-semibold text-[#2F1B20] w-[90px]">VOL.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {['icone', 'sustentador', 'motorGiro', 'portaEntrada'].map((key) => {
                  const p = papeis[key as keyof typeof papeis];
                  const d = PAPEL_PRODUTO_DEFAULTS[key];
                  const res = mixResult.detalhes[key];
                  return (
                    <tr key={key}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#2F1B20] flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ background: chartData.find(c=>c.name.includes(d.label.split(' ')[0]))?.fill }} />
                           {d.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#7C9DD0]" value={p.participacao} onChange={e => updatePapelMix(key, { participacao: parseFloat(e.target.value)||0 })} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#7C9DD0]" value={p.margem} onChange={e => updatePapelMix(key, { margem: parseFloat(e.target.value)||0 })} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-full border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#7C9DD0]" value={p.remarcacao} onChange={e => updatePapelMix(key, { remarcacao: parseFloat(e.target.value)||0 })} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">{res.volume}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#F8FAFC] border border-[#7C9DD0]/30 rounded-2xl p-5 flex flex-col justify-center">
          <div className="text-[11px] font-sans font-semibold text-[#7C9DD0] uppercase tracking-[0.1em] mb-1">Margem Ponderada do Mix</div>
          <div className="text-[32px] font-sans font-bold text-[#2F1B20]">{formatPercent(mixResult.mc_ponderada)}</div>
          {resultB && (
            <div className="text-[13px] text-gray-500 mt-1">
               vs Atual: <span className="font-medium text-[#2F1B20]">{formatPercent(resultB.mc_perc)}</span> 
               <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] bg-gray-100">{mixResult.mc_ponderada >= resultB.mc_perc ? '▲' : '▼'} {Math.abs(mixResult.mc_ponderada - resultB.mc_perc).toFixed(1)} pp</span>
            </div>
          )}
        </div>
        <div className="bg-[#F8FAFC] border border-[#7C9DD0]/30 rounded-2xl p-5 flex flex-col justify-center">
          <div className="text-[11px] font-sans font-semibold text-[#7C9DD0] uppercase tracking-[0.1em] mb-1">Resultado Projetado (Lucro)</div>
          <div className={`text-[32px] font-sans font-bold ${mixResult.resultado >= 0 ? 'text-[#2D6A4F]' : 'text-[#991B1B]'}`}>{formatCurrency(mixResult.resultado)}</div>
          {resultB && (
            <div className="text-[13px] text-gray-500 mt-1">
               vs Atual: <span className="font-medium text-[#2F1B20]">{formatCurrency(resultB.resultado)}</span>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => setActiveFlow('B')} className="w-full bg-[#2F1B20] text-white font-sans font-medium rounded-xl py-3.5 transition-all hover:bg-[#4A2B33]">
        ← Voltar ao resultado do negócio
      </button>
    </div>
  );
}