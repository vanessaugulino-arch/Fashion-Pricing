import React, { useState } from 'react';
import { Concorrente, ComparacaoTipo, PosicionamentoTier, FlowDState } from '../types';
import { DIFERENCIAIS, POSICIONAMENTOS } from '../criterios';
import { getBadgeConcorrente } from '../engine';
import { AnimatePresence, motion } from 'framer-motion';

const COMPARACAO_OPTS: Array<{ id: ComparacaoTipo; label: string; icon: string; bg: string; border: string; textColor: string }> = [
  { id: 'eles-melhores', label: 'Eles são melhores', icon: '↓', bg: '#FEF2F2', border: '#FECACA', textColor: '#991B1B' },
  { id: 'mesmo-nivel', label: 'Mesmo nível', icon: '=', bg: '#F9FAFB', border: '#D1D5DB', textColor: '#374151' },
  { id: 'eu-melhor', label: 'Eu ofereço melhor', icon: '↑', bg: '#ECFDF5', border: '#6EE7B7', textColor: '#065F46' },
  { id: 'nao-ofereco', label: 'Não ofereço', icon: '✕', bg: '#F3F4F6', border: '#D1D5DB', textColor: '#6B7280' },
];

const emptyDraft = (): Concorrente => ({
  id: crypto.randomUUID(),
  nome: '',
  precoMedio: '',
  posicionamento: '',
  diferenciais: [],
  comparacoes: {},
});

interface ConcorrenteCardProps {
  c: Concorrente;
  onUpdate: (updated: Concorrente) => void;
  onRemove: () => void;
  isNew?: boolean;
  onSave?: () => void;
}

function ConcorrenteCard({ c, onUpdate, onRemove, isNew, onSave }: ConcorrenteCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleDiferencial = (id: string) => {
    const has = c.diferenciais.includes(id);
    const novo = has ? c.diferenciais.filter(d => d !== id) : [...c.diferenciais, id];
    const novasComparacoes = { ...c.comparacoes };
    if (has) delete novasComparacoes[id];
    onUpdate({ ...c, diferenciais: novo, comparacoes: novasComparacoes });
  };

  const setComparacao = (difId: string, tipo: ComparacaoTipo) => {
    onUpdate({ ...c, comparacoes: { ...c.comparacoes, [difId]: tipo } });
  };

  const temDiferencial = c.diferenciais.length > 0;
  const todasComparadas = c.diferenciais.length > 0 && c.diferenciais.every(d => c.comparacoes[d]);
  const badge = todasComparadas ? getBadgeConcorrente(c.comparacoes) : null;

  if (!isNew && collapsed) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[14px] text-[#2F1B20]">{c.nome || 'Sem nome'}</span>
            {c.precoMedio && <span className="text-[12px] text-gray-400">R$ {c.precoMedio}</span>}
            {badge && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.cor }}>
                {badge.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCollapsed(false)} className="text-[12px] text-[#7C9DD0] hover:underline">Editar</button>
            <button onClick={onRemove} className="text-[12px] text-red-400 hover:underline">Remover</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="border-t-[3px] p-5" style={{ borderColor: '#7C9DD0' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7C9DD0' }}>
            {isNew ? 'Novo concorrente' : 'Concorrente'}
          </span>
          {!isNew && (
            <div className="flex gap-2">
              <button onClick={() => setCollapsed(true)} className="text-[12px] text-gray-400 hover:text-gray-600">Recolher</button>
              <button onClick={onRemove} className="text-[12px] text-red-400 hover:underline">Remover</button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-[12px] font-semibold text-[#2F1B20]">Nome</label>
              <input
                type="text"
                value={c.nome}
                onChange={e => onUpdate({ ...c, nome: e.target.value })}
                placeholder="Ex: Marca XYZ"
                className="border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#7C9DD0] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#2F1B20]">Preço médio (R$)</label>
              <div className="flex items-center border-[1.5px] border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7C9DD0] transition-all">
                <span className="px-2 py-2.5 text-[12px] text-gray-400 bg-gray-50 border-r border-gray-200">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={c.precoMedio}
                  onChange={e => onUpdate({ ...c, precoMedio: e.target.value })}
                  placeholder="0"
                  className="flex-1 px-2 py-2.5 text-[14px] text-right outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#2F1B20]">Posicionamento</label>
              <select
                value={c.posicionamento}
                onChange={e => onUpdate({ ...c, posicionamento: e.target.value as PosicionamentoTier })}
                className="border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#7C9DD0] transition-all bg-white"
              >
                <option value="">Selecionar...</option>
                {POSICIONAMENTOS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#2F1B20] block mb-2">Diferenciais que este concorrente oferece:</label>
            <div className="flex flex-wrap gap-2">
              {DIFERENCIAIS.map(d => {
                const checked = c.diferenciais.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDiferencial(d.id)}
                    className="text-[12px] px-3 py-1.5 rounded-full border-[1.5px] transition-all"
                    style={{
                      background: checked ? '#EEF3FA' : 'white',
                      borderColor: checked ? '#7C9DD0' : '#E5E7EB',
                      color: checked ? '#2F1B20' : '#6B7280',
                      fontWeight: checked ? 600 : 400,
                    }}
                  >
                    {checked ? '✓ ' : ''}{d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {temDiferencial && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  <div className="px-4 pt-4 pb-3 border-b border-[#E5E7EB] bg-gray-50">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#2F1B20]">Como você se compara neste atributo?</p>
                    <p className="text-[12px] text-gray-500 mt-0.5 italic">Responda com base no que seu cliente percebe, não no que você deseja oferecer.</p>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    {c.diferenciais.map(difId => {
                      const dif = DIFERENCIAIS.find(d => d.id === difId);
                      if (!dif) return null;
                      const atual = c.comparacoes[difId];
                      return (
                        <div key={difId}>
                          <p className="text-[13px] font-semibold text-[#2F1B20] mb-2">{dif.label}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {COMPARACAO_OPTS.map(opt => {
                              const sel = atual === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setComparacao(difId, opt.id)}
                                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-[1.5px] text-[11px] font-medium transition-all"
                                  style={{
                                    background: sel ? opt.bg : 'white',
                                    borderColor: sel ? opt.border : '#E5E7EB',
                                    color: sel ? opt.textColor : '#6B7280',
                                    borderStyle: opt.id === 'nao-ofereco' ? 'dashed' : 'solid',
                                    fontWeight: sel ? 600 : 400,
                                  }}
                                >
                                  <span className="text-[16px]">{opt.icon}</span>
                                  <span className="text-center leading-tight">{opt.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    <div className="rounded-xl p-3 border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                      <p className="text-[12px] italic leading-relaxed" style={{ color: '#92794A' }}>
                        Atenção: ao responder, pense em uma conversa recente com um cliente. O que ele disse sobre o produto ou a marca? Essa é a percepção real — não o que você gostaria que ele percebesse.
                      </p>
                    </div>

                    {todasComparadas && badge && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: badge.bg }}>
                        <span className="text-[12px] font-semibold" style={{ color: badge.cor }}>{badge.label}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isNew && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={onSave}
                disabled={!c.nome.trim()}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all disabled:opacity-40"
                style={{ background: '#2F1B20', color: 'white' }}
              >
                Salvar concorrente
              </button>
              <button onClick={onRemove} className="px-4 py-2.5 rounded-xl text-[13px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  data: FlowDState;
  onChange: (patch: Partial<FlowDState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Competitors({ data, onChange, onNext, onBack }: Props) {
  const [draft, setDraft] = useState<Concorrente | null>(null);

  const addDraft = () => setDraft(emptyDraft());

  const saveDraft = () => {
    if (!draft) return;
    onChange({ concorrentes: [...data.concorrentes, draft] });
    setDraft(null);
  };

  const updateConcorrente = (id: string, updated: Concorrente) => {
    onChange({ concorrentes: data.concorrentes.map(c => c.id === id ? updated : c) });
  };

  const removeConcorrente = (id: string) => {
    onChange({ concorrentes: data.concorrentes.filter(c => c.id !== id) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl p-4 border" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.5)' }}>
        <p className="text-[14px] leading-relaxed" style={{ color: '#4B3520' }}>
          Mapear a concorrência ajuda a calibrar onde você está no mercado. Adicione concorrentes que você monitora de perto — não necessariamente os maiores do setor, mas os que disputam o mesmo cliente que você.
          <br /><br />
          Após marcar os diferenciais de cada concorrente, você vai se comparar com ele. Seja realista: a análise só é útil se for honesta.
        </p>
      </div>

      {data.concorrentes.length === 0 && !draft && (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-[36px] mb-2">🏷️</div>
          <p className="text-[14px] text-gray-400 text-center">Nenhum concorrente adicionado ainda.<br />A análise fica mais precisa com ao menos 1 ou 2.</p>
        </div>
      )}

      {data.concorrentes.map(c => (
        <ConcorrenteCard
          key={c.id}
          c={c}
          onUpdate={updated => updateConcorrente(c.id, updated)}
          onRemove={() => removeConcorrente(c.id)}
        />
      ))}

      {draft && (
        <ConcorrenteCard
          c={draft}
          onUpdate={setDraft}
          onRemove={() => setDraft(null)}
          isNew
          onSave={saveDraft}
        />
      )}

      {!draft && (
        <button
          onClick={addDraft}
          className="w-full py-3 rounded-xl text-[14px] font-medium border-[1.5px] border-dashed border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#EEF3FA] transition-all"
        >
          + Adicionar concorrente
        </button>
      )}

      {data.concorrentes.length === 0 && (
        <p className="text-[12px] text-gray-400 text-center">
          Você pode pular esta etapa — a análise funcionará com base apenas nos value drivers.
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-[14px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[14px] font-medium text-white transition-all hover:opacity-90"
          style={{ background: '#2F1B20' }}
        >
          Próximo: avaliar value drivers →
        </button>
      </div>
    </div>
  );
}
