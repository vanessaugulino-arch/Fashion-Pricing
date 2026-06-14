import React, { useState } from 'react';
import { FlowDState } from './types';
import { POSICIONAMENTOS, DIMENSOES } from './criterios';
import {
  calcularScoreTotal,
  calcularScoresDimensao,
  calcularPrecoSugerido,
  TIER_CONFIG,
  scoreTier,
  getMarketingRecomendacao,
} from './engine';
import { formatCurrency } from '@/engine/calculations';
import { motion } from 'framer-motion';

interface Props {
  data: FlowDState;
  onVerMargem: (precoMid: number) => void;
  onVerNegocio: () => void;
  onNovaAnalise: () => void;
}

function PositioningMap({ data, totalScore }: { data: FlowDState; totalScore: number }) {
  const pct = (totalScore - 12) / 48;
  const yUser = Math.round(90 - pct * 78);

  const tierAtual = data.posicionamentoDesejado || data.posicionamentoAtual;
  const tierInfo = POSICIONAMENTOS.find(p => p.id === tierAtual);
  const xUser = tierInfo ? tierInfo.xPct : 50;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
      <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C8B840' }}>
        Mapa de posicionamento
      </div>
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 260, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
        <div className="absolute inset-0" style={{ left: '50%', top: 0, bottom: 0, width: '1px', background: '#E5E7EB' }} />
        <div className="absolute inset-0" style={{ top: '50%', left: 0, right: 0, height: '1px', background: '#E5E7EB' }} />

        <div className="absolute text-[9px] text-gray-300 font-medium" style={{ top: 6, left: 8 }}>Alto valor percebido</div>
        <div className="absolute text-[9px] text-gray-300 font-medium" style={{ bottom: 6, left: 8 }}>Baixo valor percebido</div>
        <div className="absolute text-[9px] text-gray-300 font-medium" style={{ bottom: 6, right: 8 }}>Preço alto →</div>
        <div className="absolute text-[9px] text-gray-300 font-medium" style={{ bottom: 6, left: '50%', transform: 'translateX(-50%)' }}>← Preço baixo</div>

        {POSICIONAMENTOS.map(p => (
          <div
            key={p.id}
            className="absolute flex items-center justify-center rounded-full border-2 border-white shadow-sm"
            style={{
              width: 10,
              height: 10,
              background: p.cor + '80',
              left: `calc(${p.xPct}% - 5px)`,
              top: `calc(${p.yPct}% - 5px)`,
            }}
            title={p.label}
          />
        ))}

        {data.concorrentes.filter(c => c.posicionamento).map(c => {
          const pos = POSICIONAMENTOS.find(p => p.id === c.posicionamento);
          if (!pos) return null;
          const precoNum = parseFloat(c.precoMedio.replace(',', '.'));
          const xOffset = isNaN(precoNum) ? 0 : ((Math.random() - 0.5) * 8);
          return (
            <div key={c.id} className="absolute flex flex-col items-center" style={{ left: `calc(${pos.xPct + xOffset}% - 5px)`, top: `calc(${pos.yPct + (Math.random() - 0.5) * 8}% - 5px)` }}>
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: '#7C9DD0' }} />
              <span className="text-[8px] text-[#7C9DD0] font-medium mt-0.5 whitespace-nowrap">{c.nome}</span>
            </div>
          );
        })}

        <div
          className="absolute flex flex-col items-center"
          style={{ left: `calc(${xUser}% - 8px)`, top: `calc(${yUser}% - 8px)` }}
        >
          <div className="w-4 h-4 rounded-full border-2 border-white shadow-md" style={{ background: '#2F1B20' }} />
          <span className="text-[9px] text-[#2F1B20] font-bold mt-0.5 whitespace-nowrap">Sua marca</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-3">
        {POSICIONAMENTOS.map(p => (
          <div key={p.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.cor + '80' }} />
            <span className="text-[10px] text-gray-400">{p.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#2F1B20' }} />
          <span className="text-[10px] text-gray-400">Sua marca</span>
        </div>
        {data.concorrentes.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#7C9DD0' }} />
            <span className="text-[10px] text-gray-400">Concorrentes</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlowDResult({ data, onVerMargem, onVerNegocio, onNovaAnalise }: Props) {
  const [guiaAberto, setGuiaAberto] = useState(false);

  const totalScore = calcularScoreTotal(data.scores, data.concorrentes);
  const dimensoes = calcularScoresDimensao(data.scores);
  const precoResult = calcularPrecoSugerido(totalScore, data.concorrentes, data.precoMedioAtual);
  const tier = scoreTier(totalScore);
  const tierConfig = TIER_CONFIG[tier];
  const tierAtual = POSICIONAMENTOS.find(p => p.id === data.posicionamentoAtual);
  const tierDesejado = POSICIONAMENTOS.find(p => p.id === data.posicionamentoDesejado);

  const pct = ((totalScore - 12) / 48) * 100;
  const dimOrder = ['PRODUTO', 'MARCA', 'PRESENÇA', 'MARKETING'];

  const scoreInvestimento = data.scores['investimento_marketing'] ?? 3;
  const marketingRec = getMarketingRecomendacao(
    tier,
    scoreInvestimento,
    data.posicionamentoAtual,
    data.posicionamentoDesejado,
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="bg-white rounded-2xl border-t-4 border-[#2F1B20] p-5 shadow-sm">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">SOBRE ESTE DIAGNÓSTICO</div>
        <h3 className="font-sans font-semibold text-[15px] text-[#2F1B20] mb-2">
          Este resultado é um ponto de partida — não um diagnóstico definitivo.
        </h3>
        <p className="text-[13px] text-[#6B7280] leading-relaxed">
          A análise foi construída com base na sua percepção atual. Isso tem valor: permite tomar decisões com mais clareza hoje, enquanto você ainda não tem dados de pesquisa com clientes.
        </p>
        <div className="my-3 h-px bg-gray-100" />
        <p className="text-[12px] text-gray-400 leading-relaxed">
          O preço sugerido aqui parte da sua percepção e dos dados de mercado disponíveis. Use-o como referência estratégica — e ajuste conforme você coleta dados reais do comportamento dos seus clientes.
        </p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#2F1B20' }}>
        <div className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Score de Valor da Marca
        </div>
        <div className="flex items-end gap-3 mb-3">
          <span className="font-sans font-bold leading-none" style={{ fontSize: 52, color: '#fff' }}>{totalScore}</span>
          <span className="text-[18px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/60</span>
          <span className="mb-1 px-3 py-1 rounded-full text-[13px] font-semibold" style={{ background: tierConfig.cor, color: tierConfig.cor === '#2F1B20' ? 'white' : '#2F1B20' }}>
            {tierConfig.label}
          </span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tierConfig.cor }} />
        </div>
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{tierConfig.descricao}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#C8B840' }}>Score por dimensão</div>
        <div className="flex flex-col gap-4">
          {dimOrder.map(dimKey => {
            const dim = dimensoes[dimKey];
            if (!dim) return null;
            const pctDim = ((dim.media - 1) / 4) * 100;
            return (
              <div key={dimKey}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[#2F1B20]">{dim.label}</span>
                  <span className="text-[13px] font-bold" style={{ color: dim.cor }}>{dim.media.toFixed(1)}/5</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pctDim}%`, background: dim.cor }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card: Recomendação de Investimento em Marketing */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB]">
        <div className="h-1 w-full" style={{ background: '#9C7DD0' }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9C7DD0' }}>
              Investimento em Marketing
            </div>
            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: scoreInvestimento <= 2 ? '#FEF3C7' : scoreInvestimento >= 4 ? '#ECFDF5' : '#EEF3FA',
                color: scoreInvestimento <= 2 ? '#92400E' : scoreInvestimento >= 4 ? '#065F46' : '#1D4ED8',
              }}
            >
              Seu score: {scoreInvestimento}/5
            </span>
          </div>

          <h4 className="font-sans font-semibold text-[14px] text-[#2F1B20] mb-1">
            Benchmark de mercado para {tierConfig.label}
          </h4>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="font-sans font-bold text-[26px] text-[#2F1B20]">
              {marketingRec.benchmark.pctMin}% – {marketingRec.benchmark.pctMax}%
            </span>
            <span className="text-[13px] text-gray-400">do faturamento</span>
          </div>

          <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">{marketingRec.texto}</p>

          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Prioridades recomendadas</p>
            <div className="flex flex-wrap gap-2">
              {marketingRec.benchmark.prioridades.map(p => (
                <span
                  key={p}
                  className="text-[12px] px-2.5 py-1 rounded-full border"
                  style={{ background: 'rgba(156,125,208,0.08)', borderColor: 'rgba(156,125,208,0.3)', color: '#4B3580' }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-3 border text-[12px] leading-relaxed" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.4)', color: '#4B3520' }}>
            💡 {marketingRec.benchmark.nota}
          </div>
        </div>
      </div>

      <PositioningMap data={data} totalScore={totalScore} />

      {precoResult.hasPreco && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#C8B840' }}>Preço estratégico sugerido</div>
          <p className="text-[12px] text-gray-400 mb-3">{precoResult.baseRef}</p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-sans font-bold text-[28px] text-[#2F1B20]">{formatCurrency(precoResult.precoMin)}</span>
            <span className="text-gray-400">a</span>
            <span className="font-sans font-bold text-[28px] text-[#2F1B20]">{formatCurrency(precoResult.precoMax)}</span>
          </div>
          <p className="text-[12px] text-gray-500">Multiplicador sugerido sobre o custo: <strong>{precoResult.config.multiplierMin}x a {precoResult.config.multiplierMax}x</strong></p>
          <div className="mt-3 p-3 rounded-xl border text-[12px] leading-relaxed" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.4)', color: '#4B3520' }}>
            Definido o preço estratégico, o próximo passo é verificar se ele é financeiramente viável. A ferramenta te leva lá.
          </div>
        </div>
      )}

      {!precoResult.hasPreco && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C8B840' }}>Multiplicador de preço sugerido</div>
          <p className="text-[13px] text-[#2F1B20] font-semibold mb-1">
            {precoResult.config.multiplierMin}x a {precoResult.config.multiplierMax}x o custo de produção
          </p>
          <p className="text-[12px] text-gray-500">
            Ex: se o custo é R$ 80 → preço sugerido entre {formatCurrency(80 * precoResult.config.multiplierMin)} e {formatCurrency(80 * precoResult.config.multiplierMax)}
          </p>
          <p className="text-[12px] text-gray-400 mt-2">
            Para obter um valor em reais, informe o preço atual ou o preço de algum concorrente nos passos anteriores.
          </p>
        </div>
      )}

      {(tierAtual || tierDesejado) && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#C8B840' }}>Posicionamento</div>
          <div className="flex flex-col gap-2">
            {tierAtual && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-500">Atual:</span>
                <span className="text-[13px] font-semibold" style={{ color: tierAtual.cor }}>{tierAtual.label}</span>
              </div>
            )}
            {tierDesejado && (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-500">Desejado:</span>
                <span className="text-[13px] font-semibold" style={{ color: tierDesejado.cor }}>{tierDesejado.label}</span>
              </div>
            )}
            {tierAtual && tierDesejado && tierAtual.id !== tierDesejado.id && (
              <div className="mt-2 p-3 rounded-xl text-[12px] leading-relaxed" style={{ background: '#EEF3FA', color: '#2F1B20' }}>
                Você deseja subir de posicionamento. Isso exige um plano consistente — especialmente em comunicação, distribuição e experiência de compra.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-sans font-semibold text-[16px] text-[#2F1B20]">O que fazer agora com este resultado?</h3>
        <p className="text-[13px] text-gray-500 -mt-1">Escolha o próximo passo mais útil para o seu momento.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <div className="text-[24px]">🧮</div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full self-start" style={{ background: '#EEF3FA', color: '#7C9DD0' }}>Passo imediato</span>
            <h4 className="font-sans font-semibold text-[14px] text-[#2F1B20]">Verificar se o preço é viável</h4>
            <p className="text-[12px] text-gray-500 flex-grow leading-relaxed">
              Com o preço que o valor da sua marca sustenta, a margem fecha? Vá para o calculador e veja.
            </p>
            <button
              onClick={() => onVerMargem(precoResult.precoMid)}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium text-white transition-all hover:opacity-90"
              style={{ background: '#7C9DD0' }}
            >
              → Calcular margem com este preço
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <div className="text-[24px]">📊</div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full self-start" style={{ background: '#F0E8EA', color: '#2F1B20' }}>Visão completa</span>
            <h4 className="font-sans font-semibold text-[14px] text-[#2F1B20]">Analisar o impacto na lucratividade</h4>
            <p className="text-[12px] text-gray-500 flex-grow leading-relaxed">
              Com o preço ajustado, como fica o resultado do negócio? Veja o cenário completo.
            </p>
            <button
              onClick={onVerNegocio}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all border border-[#2F1B20] text-[#2F1B20] hover:bg-gray-50"
            >
              → Analisar o negócio
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3">
            <div className="text-[24px]">👥</div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full self-start" style={{ background: '#F6F1AF', color: '#4B3520' }}>Próxima fase</span>
            <h4 className="font-sans font-semibold text-[14px] text-[#2F1B20]">Levar para pesquisa e profissionais</h4>
            <p className="text-[12px] text-gray-500 flex-grow leading-relaxed">
              Um profissional de branding pode validar se a percepção de valor que você identificou aqui é real para o seu público.
            </p>
            <button
              onClick={() => setGuiaAberto(v => !v)}
              className="w-full py-2.5 rounded-xl text-[13px] font-medium transition-all border border-[#C8B840] text-[#4B3520] hover:bg-[#F6F1AF]"
            >
              {guiaAberto ? '↑ Fechar guia' : '→ O que perguntar ao profissional ↗'}
            </button>
          </div>
        </div>

        {guiaAberto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-2xl border p-5 overflow-hidden"
            style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.5)' }}
          >
            <h4 className="font-sans font-semibold text-[14px] text-[#2F1B20] mb-3">O que levar para o profissional</h4>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#4B3520' }}>
              Mostre este diagnóstico a um profissional de marketing ou branding e peça que ele avalie:
            </p>
            <ol className="flex flex-col gap-2 mb-4">
              {[
                'Os critérios onde você se deu nota alta (4–5) — são percebidos assim pelos clientes?',
                'O posicionamento que você deseja — é coerente com o produto e a comunicação atual?',
                'Quais atributos de valor o seu público realmente valoriza (pode diferir do que você imagina)?',
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-[13px]" style={{ color: '#4B3520' }}>
                  <span className="font-bold flex-shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
            <div className="h-px bg-[#C8B840]/30 my-3" />
            <p className="text-[13px] font-semibold mb-2" style={{ color: '#2F1B20' }}>Para validar com pesquisa de clientes, perguntas úteis:</p>
            <ul className="flex flex-col gap-1">
              {[
                '"O que te fez comprar desta marca e não de outra?"',
                '"O que você diria para um amigo sobre esta marca?"',
                '"O que poderia ser melhor?"',
                '"Você acha que o preço é justo? Por quê?"',
              ].map((q, i) => (
                <li key={i} className="text-[13px] italic" style={{ color: '#4B3520' }}>— {q}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      <button
        onClick={onNovaAnalise}
        className="w-full py-3 rounded-xl text-[14px] text-gray-400 border border-gray-200 hover:bg-gray-50 transition-all"
      >
        Fazer nova análise
      </button>
    </div>
  );
}
