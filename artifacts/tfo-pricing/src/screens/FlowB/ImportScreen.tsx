import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useToolStore, DespesaItem } from '@/store/useToolStore';
import { MODELO_VENDAS, MODELO_DESPESAS, sugerirCampo, inferirTipoFromCell } from '@/data/importModels';
import { classificarDespesa } from './despesaUtils';

type ModeloId = 'vendas' | 'despesas';
type Passo = 'upload' | 'mapeamento' | 'confirmacao';

interface ParsedFile {
  colunas: string[];
  linhas: string[][];
}

interface Props {
  onClose: () => void;
  onImportVendas: (dados: { preco?: number; custo?: number; faturamento?: number; quantidade?: number }) => void;
}

const CAMPO_OPTIONS_VENDAS = [
  { value: 'preco', label: 'Preço médio de venda' },
  { value: 'custo', label: 'Custo médio do produto' },
  { value: 'faturamento', label: 'Faturamento mensal' },
  { value: 'quantidade', label: 'Quantidade de peças/mês' },
  { value: 'nao_importar', label: 'Não importar' },
];

const CAMPO_OPTIONS_DESPESAS = [
  { value: 'nome_despesa', label: 'Nome da despesa' },
  { value: 'valor_despesa', label: 'Valor (R$ ou %)' },
  { value: 'tipo_despesa', label: 'Tipo (% variável / R$ fixo)' },
  { value: 'nao_importar', label: 'Não importar' },
];

function parseMoney(val: string): number {
  if (!val) return NaN;
  return parseFloat(String(val).replace(/[R$\s.]/g, '').replace(',', '.'));
}

// Gera um ID único de forma segura, mesmo fora de contexto HTTPS,
// onde crypto.randomUUID() pode não existir.
function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export default function ImportScreen({ onClose, onImportVendas }: Props) {
  const { adicionarDespesa } = useToolStore();

  const [passo, setPasso] = useState<Passo>('upload');
  const [modelo, setModelo] = useState<ModeloId>('despesas');
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [linhasProblema, setLinhasProblema] = useState<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    let rows: string[][] = [];

    if (ext === 'csv') {
      const text = await file.text();
      const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });
      rows = result.data as string[][];
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' }) as string[][];
    } else {
      showToast('Formato não suportado. Use .xlsx, .xls ou .csv');
      return;
    }

    if (rows.length < 2) {
      showToast('Arquivo vazio ou sem dados suficientes.');
      return;
    }

    const colunas = rows[0].map(String);
    const linhas = rows.slice(1).map(r => r.map(String));

    const mapeamentoInicial: Record<string, string> = {};
    colunas.forEach((col, i) => {
      mapeamentoInicial[String(i)] = sugerirCampo(col, modelo);
    });

    setParsed({ colunas, linhas });
    setMapeamento(mapeamentoInicial);
    setPasso('mapeamento');
  }, [modelo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleConfirmar = () => {
    if (!parsed) return;
    const problemas: number[] = [];

    if (modelo === 'vendas') {
      const acumuladores: Record<string, number[]> = { preco: [], custo: [], faturamento: [], quantidade: [] };
      parsed.linhas.forEach((row, ri) => {
        let rowOk = true;
        Object.entries(mapeamento).forEach(([colIdx, campo]) => {
          if (campo === 'nao_importar') return;
          const val = row[parseInt(colIdx)];
          const num = parseMoney(val);
          if (!isNaN(num) && num > 0) {
            acumuladores[campo]?.push(num);
          } else if (val && val.trim()) {
            rowOk = false;
          }
        });
        if (!rowOk) problemas.push(ri + 2);
      });

      if (problemas.length > 0 && linhasProblema.length === 0) {
        setLinhasProblema(problemas);
        return;
      }

      const media = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined;
      onImportVendas({
        preco: media(acumuladores.preco),
        custo: media(acumuladores.custo),
        faturamento: media(acumuladores.faturamento),
        quantidade: media(acumuladores.quantidade),
      });
      showToast(`✓ Dados de vendas importados — verifique os valores`);
      setTimeout(onClose, 1200);
    } else {
      const nomeCampoCols = Object.entries(mapeamento).filter(([, v]) => v === 'nome_despesa').map(([k]) => parseInt(k));
      const valorCampoCols = Object.entries(mapeamento).filter(([, v]) => v === 'valor_despesa').map(([k]) => parseInt(k));
      const tipoCampoCols = Object.entries(mapeamento).filter(([, v]) => v === 'tipo_despesa').map(([k]) => parseInt(k));
      const hasTipoCol = tipoCampoCols.length > 0;

      if (nomeCampoCols.length === 0 || valorCampoCols.length === 0) {
        showToast('Mapeie pelo menos "Nome da despesa" e "Valor".');
        return;
      }

      const importadas: DespesaItem[] = [];
      parsed.linhas.forEach((row, ri) => {
        const nome = row[nomeCampoCols[0]] ?? '';
        const valorStr = row[valorCampoCols[0]] ?? '';
        const valor = parseMoney(valorStr);
        if (!nome.trim() || isNaN(valor) || valor <= 0) {
          problemas.push(ri + 2);
          return;
        }

        let isPercentual: boolean;
        if (hasTipoCol) {
          const tipoCell = row[tipoCampoCols[0]] ?? '';
          const inferred = inferirTipoFromCell(tipoCell);
          isPercentual = inferred !== null ? inferred : (classificarDespesa(nome) === 'variavel' || classificarDespesa(nome) === 'imposto');
        } else {
          const cat = classificarDespesa(nome);
          isPercentual = cat === 'variavel' || cat === 'imposto';
        }

        const cat = classificarDespesa(nome);
        importadas.push({
          id: uid(),
          nome: nome.trim(),
          valor,
          isPercentual,
          categoria: cat,
          criadoEm: Date.now(),
        });
      });

      if (problemas.length > 0 && linhasProblema.length === 0) {
        setLinhasProblema(problemas);
        return;
      }

      importadas.forEach(d => adicionarDespesa(d));
      showToast(`✓ ${importadas.length} despesas importadas com sucesso`);
      setTimeout(onClose, 1200);
    }
  };

  const opcoesMap = modelo === 'vendas' ? CAMPO_OPTIONS_VENDAS : CAMPO_OPTIONS_DESPESAS;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[640px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h3 className="font-serif text-[18px] text-[#2F1B20]">Importar dados de planilha</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">Formatos aceitos: .xlsx, .xls, .csv</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all text-[18px]">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Seleção de modelo */}
          {passo === 'upload' && (
            <div className="flex gap-2">
              {([
                { id: 'despesas', label: '📋 Despesas', desc: 'Importar lista de despesas' },
                { id: 'vendas', label: '📈 Vendas', desc: 'Importar preço, custo e faturamento' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => setModelo(m.id)}
                  className={`flex-1 text-left p-3 rounded-xl border-[1.5px] transition-all ${modelo === m.id ? 'border-[#2F1B20] bg-[#F5F0EC]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="font-sans font-semibold text-[13px] text-[#2F1B20]">{m.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Upload */}
          {passo === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#7C9DD0] rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:bg-[#EEF3FA]/40 transition-all"
            >
              <span className="text-[40px]">📂</span>
              <p className="font-sans text-[14px] text-[#2F1B20] font-medium text-center">Arraste o arquivo aqui ou clique para selecionar</p>
              <p className="text-[12px] text-gray-400">Formatos aceitos: .xlsx, .xls, .csv</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>
          )}

          {/* Mapeamento */}
          {passo === 'mapeamento' && parsed && (
            <div className="flex flex-col gap-4">
              <p className="text-[13px] text-[#6B7280]">
                O arquivo tem <strong>{parsed.colunas.length}</strong> colunas e <strong>{parsed.linhas.length}</strong> linhas de dados. Diga ao sistema o que cada coluna representa.
              </p>
              {modelo === 'despesas' && (
                <div className="rounded-xl px-4 py-3 text-[12px] leading-relaxed border" style={{ background: '#F6F1AF', borderColor: 'rgba(200,184,64,0.4)', color: '#4B3520' }}>
                  💡 Se sua planilha tiver uma coluna "Tipo" ou "Modalidade" indicando se a despesa é em <strong>%</strong> (variável) ou <strong>R$</strong> (fixo), mapeie ela como <em>"Tipo (% variável / R$ fixo)"</em> para importação precisa. Sem essa coluna, o sistema detecta automaticamente pelo nome da despesa.
                </div>
              )}

              <div className="flex flex-col gap-2">
                {parsed.colunas.map((col, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 text-[13px] font-medium text-[#2F1B20] truncate">
                      {mapeamento[String(i)] !== 'nao_importar' && <span className="text-[#2D6A4F] mr-1">⚡</span>}
                      {col || `Coluna ${i + 1}`}
                    </div>
                    <select
                      value={mapeamento[String(i)] ?? 'nao_importar'}
                      onChange={e => setMapeamento(prev => ({ ...prev, [String(i)]: e.target.value }))}
                      className="border-[1.5px] border-gray-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-[#7C9DD0] bg-white min-w-[190px]"
                    >
                      {opcoesMap.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {parsed.linhas.slice(0, 3).length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                        {parsed.colunas.map((col, i) => (
                          <th key={i} className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{col || `Col ${i+1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.linhas.slice(0, 3).map((row, ri) => (
                        <tr key={ri} className="border-b border-gray-50">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-3 py-2 text-gray-600 whitespace-nowrap">{cell || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Linhas com problema */}
              {linhasProblema.length > 0 && (
                <div className="rounded-xl p-3 border border-[#FDE68A] bg-[#FFFBEB] text-[12px] text-[#92400E]">
                  <p className="font-semibold mb-1">⚠️ As linhas abaixo não puderam ser lidas — serão ignoradas:</p>
                  <p>{linhasProblema.slice(0, 10).join(', ')}{linhasProblema.length > 10 ? ` e mais ${linhasProblema.length - 10}...` : ''}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setPasso('upload'); setParsed(null); setLinhasProblema([]); }} className="px-4 py-2.5 rounded-xl text-[13px] border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">← Voltar</button>
                <button
                  onClick={handleConfirmar}
                  className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-medium transition-all hover:opacity-90"
                  style={{ background: '#2F1B20' }}
                >
                  {linhasProblema.length > 0 ? 'Ignorar erros e importar →' : '✓ Confirmar e importar'}
                </button>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2F1B20] text-white text-[13px] font-sans px-5 py-3 rounded-xl shadow-lg z-50">
              {toast}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
