import React, { useState, useMemo, useRef } from 'react';
import { useToolStore, DespesaItem } from '@/store/useToolStore';
import {
  SEGMENTOS_FLOWA,
  getBenchmark,
  BENCHMARK_MARGEM_BRUTA,
} from '@/engine/benchmarks';
import { formatCurrency } from '@/engine/calculations';
import { generateInsightsFlowB } from '@/engine/diagnostics';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DESPESAS_VARIAVEIS,
  DESPESAS_FIXAS,
  getDespesaPredefinida,
  TIPO_CONFIG,
} from './despesaUtils';
import ImportScreen from './ImportScreen';
import FlowBResult from './FlowBResult';

// Gera um ID único de forma segura, mesmo fora de contexto HTTPS,
// onde crypto.randomUUID() pode não existir.
function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Canal = 'varejo' | 'atacado' | 'hibrido';
type TipoPreco = 'definido' | 'realizado';

function getPorteLabel(fat: number): string {
  if (fat <= 6750) return 'Microempreendedor';
  if (fat <= 30000) return 'Pequeno negócio';
  if (fat <= 400000) return 'Médio negócio';
  return 'Grande negócio';
}

// ─── Step progress ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Contexto', 'Preço & Volume', 'Custos & Despesas'];

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const isActive = n === current;
        const isDone = n < current;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isDone ? 'bg-[#2D6A4F] text-white' : isActive ? 'bg-[#2F1B20] text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isDone ? '✓' : n}
              </div>
              <span className={`text-[10px] font-sans whitespace-nowrap hidden sm:block ${isActive ? 'text-[#2F1B20] font-semibold' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1 mb-3 transition-all ${isDone ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Canal column header ─────────────────────────────────────────────────────

function CanalColumnHeader({ icon, label, pct }: { icon: string; label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
      <span className="text-[18px]">{icon}</span>
      <div>
        <div className="text-[12px] font-sans font-bold text-[#2F1B20] uppercase tracking-wider">{label}</div>
        <div className="text-[11px] text-gray-400">{pct}% das vendas</div>
      </div>
    </div>
  );
}

// ─── PriceVolumeFields — extracted outside parent (prevents remount bug) ─────

interface PriceVolumeFieldsProps {
  tipoPrecoVal: TipoPreco;
  setTipoPrecoVal: (v: TipoPreco) => void;
  precoVal: string;
  setPrecoVal: (v: string) => void;
  tabelaVal: string;
  setTabelaVal: (v: string) => void;
  fatVal: string;
  setFatVal: (v: string) => void;
  pecasVal: string;
  setPecasVal: (v: string) => void;
  touched: boolean;
  fieldClass: string;
}

const TIPO_PRECO_LEGENDA: Record<TipoPreco, string> = {
  definido: 'É a média do preço de etiqueta de todas as peças lançadas. É o valor que você planejou cobrar antes de qualquer desconto.',
  realizado: 'É a média do valor que o cliente efetivamente pagou. É o dinheiro que realmente entrou no caixa após promoções, negociações e liquidações.',
};

const PriceVolumeFields = ({
  tipoPrecoVal, setTipoPrecoVal,
  precoVal, setPrecoVal,
  tabelaVal, setTabelaVal,
  fatVal, setFatVal,
  pecasVal, setPecasVal,
  touched, fieldClass,
}: PriceVolumeFieldsProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-sans font-semibold text-[#2F1B20]">Tipo de preço <span className="text-red-500">*</span></label>
      <div className="flex gap-2">
        {(['definido', 'realizado'] as const).map(opt => (
          <label
            key={opt}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-[1.5px] cursor-pointer text-[12px] font-sans transition-all select-none text-center leading-tight ${tipoPrecoVal === opt ? 'border-[#2F1B20] bg-[#F5F0EC] font-semibold text-[#2F1B20]' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
          >
            <input type="radio" className="sr-only" checked={tipoPrecoVal === opt} onChange={() => setTipoPrecoVal(opt)} readOnly />
            {opt === 'definido' ? 'Preço médio da Coleção' : 'Preço Médio de Venda'}
          </label>
        ))}
      </div>
      <div className="rounded-xl px-3 py-2.5 mt-1" style={{ background: '#F6F1AF' }}>
        <p className="text-[12px] leading-relaxed" style={{ color: '#4B3520' }}>
          {TIPO_PRECO_LEGENDA[tipoPrecoVal]}
        </p>
      </div>
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-sans font-semibold text-[#2F1B20]">
        {tipoPrecoVal === 'realizado' ? 'Preço Médio de Venda' : 'Preço médio da Coleção'} <span className="text-red-500">*</span>
      </label>
      <div className={fieldClass}>
        <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
        <input
          type="number" step="0.01" min="0"
          value={precoVal}
          onChange={e => setPrecoVal(e.target.value)}
          placeholder="0,00"
          className="flex-1 px-3 py-2.5 text-[14px] font-sans text-right outline-none bg-white"
        />
      </div>
      {touched && parseFloat(precoVal) <= 0 && <span className="text-[11px] text-red-500">Campo obrigatório</span>}
    </div>

    {tipoPrecoVal === 'realizado' && (
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-sans font-semibold text-[#2F1B20]">Preço médio da Coleção</label>
        <div className={fieldClass}>
          <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
          <input
            type="number" step="0.01" min="0"
            value={tabelaVal}
            onChange={e => setTabelaVal(e.target.value)}
            placeholder="0,00"
            className="flex-1 px-3 py-2.5 text-[14px] font-sans text-right outline-none bg-white"
          />
        </div>
      </div>
    )}

    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-sans font-semibold text-[#2F1B20]">Faturamento / mês <span className="text-red-500">*</span></label>
      <div className={fieldClass}>
        <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
        <input
          type="number" step="0.01" min="0"
          value={fatVal}
          onChange={e => setFatVal(e.target.value)}
          placeholder="0,00"
          className="flex-1 px-3 py-2.5 text-[14px] font-sans text-right outline-none bg-white"
        />
      </div>
      {touched && parseFloat(fatVal) <= 0 && <span className="text-[11px] text-red-500">Campo obrigatório</span>}
    </div>

    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-sans font-semibold text-[#2F1B20]">Qtd peças / mês</label>
      <div className={fieldClass}>
        <input
          type="number" step="1" min="0"
          value={pecasVal}
          onChange={e => setPecasVal(e.target.value)}
          placeholder="0"
          className="flex-1 px-3 py-2.5 text-[14px] font-sans text-right outline-none bg-white"
        />
        <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">pç</span>
      </div>
    </div>
  </div>
);

const ALL_DESPESAS_FLAT = [...DESPESAS_VARIAVEIS, ...DESPESAS_FIXAS];

// ExpenseBlock only manages its own form inputs (selectedId, valor).
// The list itself lives in FlowBScreen's state and is passed as a prop.
// This guarantees immediate rendering when items are added.
interface ExpenseBlockProps {
  items: DespesaItem[];
  onAdd: (item: DespesaItem) => void;
  onRemove: (id: string) => void;
  faturamentoTotal: number;
}

const ExpenseBlock = ({ items, onAdd, onRemove, faturamentoTotal }: ExpenseBlockProps) => {
  const [selectedId, setSelectedId] = useState('');
  const [valor, setValor] = useState('');
  const valorRef = useRef<HTMLInputElement>(null);

  const selected = ALL_DESPESAS_FLAT.find(d => d.id === selectedId) ?? null;
  const isPerc = selected?.isPercentual ?? false;
  const benchHint = selected?.benchMin != null ? `Ref: ${selected.benchMin}%–${selected.benchMax}%` : '';

  const canAdd = !!selectedId && !!valor && parseFloat(valor) > 0;

  function doAdd() {
    if (!selected) return;
    const v = parseFloat(valor);
    if (!v || v <= 0) return;
    onAdd({
      id: uid(),
      nome: selected.nome,
      valor: v,
      isPercentual: selected.isPercentual,
      categoria: selected.categoria,
      criadoEm: Date.now(),
    });
    setValor('');
    setSelectedId('');
    setTimeout(() => valorRef.current?.focus(), 30);
  }

  const totalVar = items.filter(d => d.isPercentual).reduce((a, b) => a + b.valor, 0);
  const totalFixo = items.filter(d => !d.isPercentual).reduce((a, b) => a + b.valor, 0);
  const temVar = items.some(d => d.isPercentual);
  const temFixo = items.some(d => !d.isPercentual);

  const fieldBase = 'flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-[#2F1B20] focus-within:ring-[2px] focus-within:ring-[#2F1B20]/10';

  return (
    <div className="flex flex-col gap-4">

      {/* Orientação */}
      <div className="rounded-xl p-4 border border-[#C8B840]/50 bg-[#F6F1AF]">
        <p className="text-[13px] leading-relaxed" style={{ color: '#4B3520' }}>
          <strong>Como preencher:</strong> selecione cada despesa da lista e informe o valor.
          Despesas variáveis são sempre lançadas como <strong>% sobre o faturamento</strong> —
          isso permite simular automaticamente o impacto de aumentar ou reduzir as vendas.
        </p>
        <p className="text-[12px] mt-2" style={{ color: '#92794A' }}>
          💡 Se você só sabe o total mensal de custos fixos, selecione <strong>Outros Fixos</strong> e informe o valor total de uma vez.
        </p>
      </div>

      {/* Linha de seleção */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-end">

          {/* Select */}
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#2F1B20] uppercase tracking-wide">Despesa</label>
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setValor(''); setTimeout(() => valorRef.current?.focus(), 50); }}
              className="border-[1.5px] border-gray-300 rounded-xl px-3 py-2.5 text-[13px] font-sans text-[#2F1B20] bg-white outline-none focus:border-[#2F1B20] transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecione uma despesa…</option>
              <optgroup label="── Variáveis (% sobre vendas) ──">
                {DESPESAS_VARIAVEIS.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </optgroup>
              <optgroup label="── Fixas (R$/mês) ──">
                {DESPESAS_FIXAS.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Valor */}
          <div className="w-[130px] flex-shrink-0 flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#2F1B20] uppercase tracking-wide">
              {isPerc ? '% s/ vendas' : 'R$/mês'}
            </label>
            <div className={fieldBase}>
              {!isPerc && <span className="px-2 py-2.5 text-[12px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>}
              <input
                ref={valorRef}
                type="number"
                step={isPerc ? '0.1' : '1'}
                min="0"
                max={isPerc ? '100' : undefined}
                value={valor}
                onChange={e => setValor(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') doAdd(); }}
                placeholder={isPerc ? (selected?.benchMin ? String(selected.benchMin) : '0') : '0'}
                className="flex-1 px-2 py-2.5 text-[13px] font-sans text-right outline-none bg-white"
                disabled={!selectedId}
              />
              {isPerc && <span className="px-2 py-2.5 text-[12px] text-gray-500 bg-gray-50 border-l border-gray-200 select-none">%</span>}
            </div>
          </div>

          {/* Botão + Add */}
          <button
            type="button"
            onClick={doAdd}
            disabled={!canAdd}
            className="h-[42px] px-4 rounded-xl text-[13px] font-sans font-semibold transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: canAdd ? '#2F1B20' : '#9CA3AF', color: 'white' }}
          >
            + Add
          </button>
        </div>

        {/* Hint da despesa selecionada */}
        {selected && (
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
              style={{
                background: TIPO_CONFIG[isPerc ? 'variavel' : 'fixo'].bg,
                color: TIPO_CONFIG[isPerc ? 'variavel' : 'fixo'].text,
                borderColor: TIPO_CONFIG[isPerc ? 'variavel' : 'fixo'].border,
              }}
            >
              {TIPO_CONFIG[isPerc ? 'variavel' : 'fixo'].icon} {isPerc ? 'Variável (%)' : 'Fixo (R$/mês)'}
            </span>
            <span className="italic text-gray-500">{selected.descricao}</span>
            {benchHint && <span className="font-medium" style={{ color: '#7C9DD0' }}>{benchHint}</span>}
          </div>
        )}
      </div>

      {/* Lista de itens adicionados */}
      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {items.length} {items.length === 1 ? 'despesa lançada' : 'despesas lançadas'}
          </p>
          {items.map(d => {
            const cfg = TIPO_CONFIG[d.isPercentual ? 'variavel' : 'fixo'];
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-[#E5E7EB] px-3 py-2.5"
              >
                <span className="text-[14px] flex-shrink-0">{cfg.icon}</span>
                <span className="flex-1 text-[13px] font-sans text-[#2F1B20] truncate">{d.nome}</span>
                <span className="text-[13px] font-sans font-semibold text-[#2F1B20] flex-shrink-0">
                  {d.isPercentual ? `${d.valor}%` : formatCurrency(d.valor)}
                </span>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
                >
                  {cfg.label}
                </span>
                <button type="button" onClick={() => onRemove(d.id)} className="text-gray-300 hover:text-red-400 transition-colors text-[15px] flex-shrink-0 leading-none">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Alertas */}
      {items.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {!temVar && (
            <div className="rounded-xl p-3 border border-[#FDE68A] bg-[#FFFBEB] text-[12px]" style={{ color: '#92400E' }}>
              ⚠️ <strong>Sem custos variáveis.</strong> Inclua impostos, comissões ou taxas de cartão para um diagnóstico mais preciso.
            </div>
          )}
          {!temFixo && (
            <div className="rounded-xl p-3 border border-[#FDE68A] bg-[#FFFBEB] text-[12px]" style={{ color: '#92400E' }}>
              ⚠️ <strong>Sem despesas fixas.</strong> Se tem aluguel ou salários, inclua para calcular o ponto de equilíbrio.
            </div>
          )}
        </div>
      )}

      {/* Totalizadores */}
      {items.length > 0 && (
        <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-4 text-[13px] font-sans flex flex-col gap-1.5">
          {temVar && (
            <div className="flex justify-between text-gray-600">
              <span>📦 Total variáveis:</span>
              <span className="font-semibold text-[#065F46]">{totalVar.toFixed(1)}% do faturamento</span>
            </div>
          )}
          {temFixo && (
            <div className="flex justify-between text-gray-600">
              <span>🏢 Total fixo/mês:</span>
              <span className="font-semibold text-[#1E40AF]">{formatCurrency(totalFixo)}</span>
            </div>
          )}
          {faturamentoTotal > 0 && temFixo && (
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>Fixos como % do faturamento:</span>
              <span>{((totalFixo / faturamentoTotal) * 100).toFixed(1)}%</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#2F1B20] border-t border-gray-200 pt-1.5 mt-0.5">
            <span>Total geral:</span>
            <span>
              {temVar && <span className="text-[#065F46]">{totalVar.toFixed(1)}% var.</span>}
              {temVar && temFixo && <span className="text-gray-400 mx-1">+</span>}
              {temFixo && <span className="text-[#1E40AF]">{formatCurrency(totalFixo)} fixo</span>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function FlowBScreen() {
  const { setActiveFlow, setResultB, resultB, despesasLista, adicionarDespesa, removerDespesa, limparDespesas } = useToolStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showResult, setShowResult] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSavedBanner, setShowSavedBanner] = useState(resultB !== null);

  // LOCAL list state — drives the UI immediately.
  // Always initialized from the persisted store (handles browser reload).
  const [localDespesas, setLocalDespesas] = useState<DespesaItem[]>(() => despesasLista);

  // These only update local state — no Zustand calls that could interfere.
  // Store is synced once when the user clicks Calcular.
  const handleAddDespesa = (item: DespesaItem) => {
    setLocalDespesas(prev => [...prev, item]);
  };
  const handleRemoveDespesa = (id: string) => {
    setLocalDespesas(prev => prev.filter(d => d.id !== id));
  };
  const handleClearDespesas = () => {
    setLocalDespesas([]);
    limparDespesas();
  };

  const [touched1, setTouched1] = useState(false);
  const [touched2, setTouched2] = useState(false);
  const [touched3, setTouched3] = useState(false);

  // Step 1
  const [segmento, setSegmento] = useState('');
  const [canal, setCanal] = useState<Canal | ''>('');
  const [percVarejo, setPercVarejo] = useState(70);
  const percAtacado = 100 - percVarejo;

  // Step 2 — single canal
  const [tipoPreco, setTipoPreco] = useState<TipoPreco>('definido');
  const [precoMedio, setPrecoMedio] = useState('');
  const [precoTabela, setPrecoTabela] = useState('');
  const [faturamento, setFaturamento] = useState('');
  const [pecas, setPecas] = useState('');

  // Step 2 — hibrido varejo
  const [tipoPrecoV, setTipoPrecoV] = useState<TipoPreco>('definido');
  const [precoMedioV, setPrecoMedioV] = useState('');
  const [precoTabelaV, setPrecoTabelaV] = useState('');
  const [faturamentoV, setFaturamentoV] = useState('');
  const [pecasV, setPecasV] = useState('');

  // Step 2 — hibrido atacado
  const [tipoPrecoA, setTipoPrecoA] = useState<TipoPreco>('definido');
  const [precoMedioA, setPrecoMedioA] = useState('');
  const [precoTabelaA, setPrecoTabelaA] = useState('');
  const [faturamentoA, setFaturamentoA] = useState('');
  const [pecasA, setPecasA] = useState('');

  // Step 3
  const [custoMedio, setCustoMedio] = useState('');

  const fieldClass =
    'flex items-center border-[1.5px] border-gray-300 rounded-xl overflow-hidden transition-all focus-within:border-[#2F1B20] focus-within:ring-[3px] focus-within:ring-[#2F1B20]/10';

  // Derived numbers
  const precoNum = canal === 'hibrido'
    ? parseFloat(precoMedioV || '0') * percVarejo / 100 + parseFloat(precoMedioA || '0') * percAtacado / 100
    : parseFloat(precoMedio || '0');
  const fatNum = canal === 'hibrido'
    ? parseFloat(faturamentoV || '0') + parseFloat(faturamentoA || '0')
    : parseFloat(faturamento || '0');
  const custoNum = parseFloat(custoMedio || '0');
  const pecasNum = canal === 'hibrido'
    ? parseFloat(pecasV || '0') + parseFloat(pecasA || '0')
    : parseFloat(pecas || '0');

  // Expenses derived from local state
  const custoVarPct = useMemo(
    () => localDespesas.filter(d => d.isPercentual).reduce((a, b) => a + b.valor, 0),
    [localDespesas],
  );
  const custoFixoTotal = useMemo(
    () => localDespesas.filter(d => !d.isPercentual).reduce((a, b) => a + b.valor, 0),
    [localDespesas],
  );
  const despesasPorCategoria = useMemo(() => {
    const t = { fixo: 0, variavel: 0, imposto: 0, marketing: 0, outro: 0 };
    localDespesas.forEach(d => {
      if (d.isPercentual) {
        // Variable expenses: marketing stays separate; everything else goes to variavel
        if (d.categoria === 'marketing') {
          // Convert % to R$ so FlowBResult can compute mktgPct = marketing / fat * 100
          t.marketing += fatNum > 0 ? (d.valor / 100) * fatNum : 0;
        } else {
          t.variavel += d.valor;
        }
      } else {
        // Fixed expenses: route to the actual categoria bucket
        const key = d.categoria as keyof typeof t;
        if (key in t && key !== 'variavel') t[key] += d.valor;
        else t.fixo += d.valor;
      }
    });
    return t;
  }, [localDespesas, fatNum]);

  const canalBenchmark: 'varejo' | 'atacado' = canal === 'varejo' ? 'varejo' : canal === 'atacado' ? 'atacado' : percVarejo >= 60 ? 'varejo' : 'atacado';

  const step1Valid = segmento !== '' && canal !== '';
  const step2Valid = canal === 'hibrido'
    ? parseFloat(precoMedioV) > 0 && parseFloat(faturamentoV) > 0 && parseFloat(precoMedioA) > 0 && parseFloat(faturamentoA) > 0
    : parseFloat(precoMedio) > 0 && parseFloat(faturamento) > 0;
  const step3Valid = parseFloat(custoMedio) > 0 && localDespesas.length > 0;

  const resultData = useMemo(() => {
    if (!step1Valid || !step2Valid || !step3Valid) return null;
    if (precoNum <= 0 || custoNum <= 0 || fatNum <= 0) return null;

    const mc_rs = precoNum - custoNum - precoNum * custoVarPct / 100;
    const mc_pct = (mc_rs / precoNum) * 100;
    const resultado = fatNum * mc_pct / 100 - custoFixoTotal;
    const markup = precoNum / custoNum;
    const pe_rs = mc_pct > 0 ? custoFixoTotal / (mc_pct / 100) : null;
    const distanciaPE = pe_rs && fatNum > 0 ? ((fatNum - pe_rs) / pe_rs) * 100 : null;
    const margemBruta = (precoNum - custoNum) / precoNum * 100;
    const porteLabel = getPorteLabel(fatNum);

    let remarcacao: number | null = null;
    if (canal === 'varejo' && tipoPreco === 'realizado' && parseFloat(precoTabela) > 0) {
      remarcacao = (parseFloat(precoMedio) / parseFloat(precoTabela) - 1) * 100;
    } else if (canal === 'hibrido') {
      const remV = tipoPrecoV === 'realizado' && parseFloat(precoTabelaV) > 0 ? (parseFloat(precoMedioV) / parseFloat(precoTabelaV) - 1) * 100 : null;
      const remA = tipoPrecoA === 'realizado' && parseFloat(precoTabelaA) > 0 ? (parseFloat(precoMedioA) / parseFloat(precoTabelaA) - 1) * 100 : null;
      if (remV !== null && remA !== null) remarcacao = remV * percVarejo / 100 + remA * percAtacado / 100;
      else remarcacao = remV ?? remA;
    } else if (canal === 'atacado' && tipoPreco === 'realizado' && parseFloat(precoTabela) > 0) {
      remarcacao = (parseFloat(precoMedio) / parseFloat(precoTabela) - 1) * 100;
    }

    const segmentoLabel = SEGMENTOS_FLOWA.find(s => s.value === segmento)?.label ?? '';
    const mktgPct = fatNum > 0 ? (despesasPorCategoria.marketing / fatNum) * 100 : 0;
    const insights = generateInsightsFlowB({
      mc_perc: mc_pct, resultado, remarcacao_perc: remarcacao,
      faturamento: fatNum, custo_fixo: custoFixoTotal, segmento, modelo: canalBenchmark,
      mktg_perc: mktgPct,
    });
    const benchRange = getBenchmark(BENCHMARK_MARGEM_BRUTA, segmento, canalBenchmark);

    return {
      segmento, segmentoLabel, canal: canal as Canal, canalBenchmark,
      percVarejo, percAtacado,
      precoMedioConsolidado: precoNum, custoMedio: custoNum,
      faturamentoTotal: fatNum, pecasTotal: pecasNum,
      custoVariavelConsolidado: custoVarPct,
      custoVariavelRs: fatNum * custoVarPct / 100,
      fixo: custoFixoTotal,
      mc_rs, mc_pct, resultado, markup, pe_rs, distanciaPE,
      remarcacao, margemBruta, porteLabel, insights, benchRange,
      despesasPorCategoria,
      despesasLista: [...localDespesas],
    };
  }, [
    step1Valid, step2Valid, step3Valid, precoNum, custoNum, fatNum,
    custoVarPct, custoFixoTotal, pecasNum, canal, tipoPreco, precoMedio, precoTabela,
    precoMedioV, precoTabelaV, tipoPrecoV, precoMedioA, precoTabelaA, tipoPrecoA,
    segmento, canalBenchmark, percVarejo, percAtacado,
    despesasPorCategoria, localDespesas,
  ]);

  const handleNext = () => {
    if (step === 1) { setTouched1(true); if (step1Valid) setStep(2); }
    else if (step === 2) { setTouched2(true); if (step2Valid) setStep(3); }
    else if (step === 3) {
      setTouched3(true);
      if (step3Valid && resultData) {
        // Sync local despesas to store once before saving result
        limparDespesas();
        localDespesas.forEach(d => adicionarDespesa(d));
        setResultB({
          inputs: { precoMedio: precoNum, custoProduto: custoNum, custoFixo: custoFixoTotal, custoVariavel: custoVarPct },
          mc_perc: resultData.mc_pct,
          mc_rs: resultData.mc_rs,
          resultado: resultData.resultado,
          markup: resultData.markup,
          faturamentoValue: fatNum,
          quantidadeValue: pecasNum,
          modelo: canalBenchmark,
          insights: resultData.insights,
          remarcacao: resultData.remarcacao,
          pe_rs: resultData.pe_rs,
          distanciaPE: resultData.distanciaPE,
        });
        setShowResult(true);
      }
    }
  };

  const handleBack = () => {
    if (showResult) { setShowResult(false); return; }
    if (step > 1) { setStep((step - 1) as 1 | 2 | 3); return; }
    setActiveFlow(null);
  };

  const handleImportVendas = (dados: { preco?: number; custo?: number; faturamento?: number; quantidade?: number }) => {
    if (dados.preco) setPrecoMedio(dados.preco.toFixed(2));
    if (dados.custo) setCustoMedio(dados.custo.toFixed(2));
    if (dados.faturamento) setFaturamento(dados.faturamento.toFixed(2));
    if (dados.quantidade) setPecas(Math.round(dados.quantidade).toString());
    setShowImport(false);
    setStep(2);
  };

  if (showResult && resultData) {
    return <FlowBResult resultData={resultData} onBack={handleBack} setActiveFlow={setActiveFlow} />;
  }

  const isHibrido = canal === 'hibrido';

  return (
    <div className="max-w-[640px] mx-auto px-4 py-8">
      {showImport && (
        <ImportScreen onClose={() => setShowImport(false)} onImportVendas={handleImportVendas} />
      )}

      <div className="mb-2">
        <button onClick={handleBack} className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] transition-colors flex items-center gap-1">
          ← Voltar
        </button>
      </div>

      <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">Simulador de Impacto</h2>
      <p className="font-sans text-[15px] text-[#6B7280] mb-4">Preencha os dados do mês para ver onde o seu resultado está.</p>

      <button
        onClick={() => setShowImport(true)}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl border-[1.5px] border-[#7C9DD0] text-[#7C9DD0] text-[13px] font-sans font-medium hover:bg-[#EEF3FA] transition-all"
      >
        📂 Importar dados de planilha (xlsx ou csv)
      </button>

      {/* Banner dados salvos */}
      <AnimatePresence>
        {showSavedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 rounded-2xl border border-[#7C9DD0] bg-[#EEF3FA] p-4 flex flex-col gap-3"
          >
            <div className="flex items-start gap-2">
              <span className="text-[18px]">↩</span>
              <p className="text-[14px] font-sans font-semibold text-[#2F1B20]">Você tem dados salvos de uma sessão anterior.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowSavedBanner(false); setShowResult(true); }}
                className="flex-1 py-2 rounded-xl text-white text-[13px] font-sans font-medium transition-all hover:opacity-90"
                style={{ background: '#2F1B20' }}
              >
                Continuar com dados salvos
              </button>
              <button
                onClick={() => { setResultB(null); handleClearDespesas(); setShowSavedBanner(false); }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-[13px] text-gray-500 hover:bg-gray-50 transition-all"
              >
                Começar novo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(47,27,32,0.08)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: '#2F1B20' }} />
        <div className="p-6 pt-5">
          <StepProgress current={step} />

          <AnimatePresence mode="wait">

            {/* Step 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
                <div className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-[#2F1B20] mb-1">Contexto do Negócio</div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Segmento principal <span className="text-red-500">*</span></label>
                  <select
                    value={segmento}
                    onChange={e => setSegmento(e.target.value)}
                    className="border-[1.5px] border-gray-300 rounded-xl px-3 py-3 text-[14px] font-sans text-[#2F1B20] bg-white outline-none transition-all focus:border-[#2F1B20] appearance-none cursor-pointer"
                  >
                    <option value="">Selecione o segmento…</option>
                    {SEGMENTOS_FLOWA.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  {touched1 && segmento === '' && <span className="text-[12px] text-red-500">Selecione o segmento.</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">Canal de venda <span className="text-red-500">*</span></label>
                  <div className="flex flex-col gap-2">
                    {([
                      { value: 'varejo', label: 'Varejo', sub: 'Vende direto ao consumidor final' },
                      { value: 'atacado', label: 'Atacado', sub: 'Vende para lojistas e revendedores' },
                      { value: 'hibrido', label: 'Híbrido', sub: 'Vende para os dois canais' },
                    ] as const).map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-[1.5px] cursor-pointer transition-all select-none ${canal === opt.value ? 'border-[#2F1B20] bg-[#F5F0EC]' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input type="radio" name="canal" value={opt.value} checked={canal === opt.value} onChange={() => setCanal(opt.value)} className="sr-only" />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${canal === opt.value ? 'border-[#2F1B20]' : 'border-gray-300'}`}>
                          {canal === opt.value && <div className="w-2 h-2 rounded-full bg-[#2F1B20]" />}
                        </div>
                        <div>
                          <div className="text-[14px] font-sans font-semibold text-[#2F1B20]">{opt.label}</div>
                          <div className="text-[12px] text-gray-400">{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {touched1 && canal === '' && <span className="text-[12px] text-red-500">Selecione o canal de venda.</span>}
                </div>

                <AnimatePresence>
                  {canal === 'hibrido' && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="text-[13px] font-sans font-semibold text-[#2F1B20] block mb-3">Qual a proporção das suas vendas?</label>
                      <input type="range" min={0} max={100} step={5} value={percVarejo} onChange={e => setPercVarejo(Number(e.target.value))} className="w-full accent-[#2F1B20] cursor-pointer" />
                      <div className="flex justify-between mt-2">
                        <span className="text-[13px] font-sans font-bold text-[#2F1B20]">{percVarejo}% Varejo</span>
                        <span className="text-[13px] font-sans font-bold text-[#2F1B20]">{percAtacado}% Atacado</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-[#2F1B20] mb-4">Preço e Volume</div>
                {!isHibrido ? (
                  <PriceVolumeFields
                    tipoPrecoVal={tipoPreco} setTipoPrecoVal={setTipoPreco}
                    precoVal={precoMedio} setPrecoVal={setPrecoMedio}
                    tabelaVal={precoTabela} setTabelaVal={setPrecoTabela}
                    fatVal={faturamento} setFatVal={setFaturamento}
                    pecasVal={pecas} setPecasVal={setPecas}
                    touched={touched2} fieldClass={fieldClass}
                  />
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <CanalColumnHeader icon="🏪" label="Canal Varejo" pct={percVarejo} />
                        <PriceVolumeFields
                          tipoPrecoVal={tipoPrecoV} setTipoPrecoVal={setTipoPrecoV}
                          precoVal={precoMedioV} setPrecoVal={setPrecoMedioV}
                          tabelaVal={precoTabelaV} setTabelaVal={setPrecoTabelaV}
                          fatVal={faturamentoV} setFatVal={setFaturamentoV}
                          pecasVal={pecasV} setPecasVal={setPecasV}
                          touched={touched2} fieldClass={fieldClass}
                        />
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <CanalColumnHeader icon="📦" label="Canal Atacado" pct={percAtacado} />
                        <PriceVolumeFields
                          tipoPrecoVal={tipoPrecoA} setTipoPrecoVal={setTipoPrecoA}
                          precoVal={precoMedioA} setPrecoVal={setPrecoMedioA}
                          tabelaVal={precoTabelaA} setTabelaVal={setPrecoTabelaA}
                          fatVal={faturamentoA} setFatVal={setFaturamentoA}
                          pecasVal={pecasA} setPecasVal={setPecasA}
                          touched={touched2} fieldClass={fieldClass}
                        />
                      </div>
                    </div>
                    <p className="text-[12px] text-gray-400 text-center">Os resultados serão calculados proporcionalmente à participação de cada canal.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col gap-6">
                {/* Custo por peça */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-sans font-bold uppercase tracking-[0.15em] text-[#2F1B20] mb-1">Custo por Peça</div>
                  <label className="text-[13px] font-sans font-semibold text-[#2F1B20]">
                    Custo médio do produto <span className="text-red-500">*</span>
                  </label>
                  <div className={fieldClass}>
                    <span className="px-3 py-3 text-[14px] text-gray-500 bg-gray-50 border-r border-gray-200 select-none">R$</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={custoMedio}
                      onChange={e => setCustoMedio(e.target.value)}
                      placeholder="0,00"
                      className="flex-1 px-3 py-3 text-[15px] font-sans text-right outline-none"
                    />
                  </div>
                  <span className="text-[12px] text-gray-400">Custo de compra ou produção por peça</span>
                  {touched3 && parseFloat(custoMedio) <= 0 && <span className="text-[12px] text-red-500">Campo obrigatório.</span>}
                  {touched3 && parseFloat(custoMedio) > 0 && localDespesas.length === 0 && (
                    <span className="text-[12px] text-[#92400E]">Adicione ao menos uma despesa para calcular.</span>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Bloco de despesas — lista gerenciada no pai, passada como prop */}
                <ExpenseBlock
                  items={localDespesas}
                  onAdd={handleAddDespesa}
                  onRemove={handleRemoveDespesa}
                  faturamentoTotal={fatNum}
                />

                {/* Resumo */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-[12px] text-gray-500">
                  <div className="font-semibold text-[#2F1B20] mb-1">Resumo antes de calcular</div>
                  <div className="flex justify-between"><span>Segmento</span><span className="font-medium text-[#2F1B20]">{SEGMENTOS_FLOWA.find(s => s.value === segmento)?.label ?? '—'}</span></div>
                  <div className="flex justify-between mt-1"><span>Canal</span><span className="font-medium text-[#2F1B20] capitalize">{canal === 'hibrido' ? `Híbrido (${percVarejo}% V / ${percAtacado}% A)` : canal}</span></div>
                  <div className="flex justify-between mt-1"><span>Preço médio</span><span className="font-medium text-[#2F1B20]">{formatCurrency(precoNum)}</span></div>
                  <div className="flex justify-between mt-1"><span>Faturamento</span><span className="font-medium text-[#2F1B20]">{formatCurrency(fatNum)}</span></div>
                  <div className="flex justify-between mt-1"><span>Custo do produto</span><span className="font-medium text-[#2F1B20]">{formatCurrency(custoNum)}</span></div>
                  <div className="flex justify-between mt-1"><span>Total variáveis</span><span className="font-medium text-[#065F46]">{custoVarPct.toFixed(1)}%</span></div>
                  <div className="flex justify-between mt-1"><span>Total fixo/mês</span><span className="font-medium text-[#1E40AF]">{formatCurrency(custoFixoTotal)}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            {step > 1 && (
              <button onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="px-5 py-3 rounded-xl border border-gray-300 text-[14px] font-sans font-medium text-gray-600 hover:bg-gray-50 transition-all">
                ← Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-white font-sans font-medium text-[15px] transition-all hover:opacity-90"
              style={{ background: '#2F1B20' }}
            >
              {step === 3 ? 'Calcular →' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
