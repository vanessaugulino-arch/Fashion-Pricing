import React from 'react';
import { useToolStore, ProdutoSalvo } from '@/store/useToolStore';
import { formatCurrency, formatPercent, formatMultiplier } from '@/engine/calculations';
import { SEGMENTOS_FLOWA } from '@/engine/benchmarks';

function segmentoLabel(seg: string): string {
  return SEGMENTOS_FLOWA.find(s => s.value === seg)?.label ?? seg;
}

function exportCsv(produtos: ProdutoSalvo[]) {
  const rows: string[][] = [
    ['Produto', 'Segmento', 'Canal', 'Preço (R$)', 'Custo (R$)', 'ICMS (%)', 'Margem %', 'Margem R$', 'Markup', 'Data'],
    ...produtos.slice().sort((a, b) => b.criadoEm - a.criadoEm).map(p => [
      p.nomeProduto,
      segmentoLabel(p.segmento),
      p.canal === 'varejo' ? 'Varejo' : 'Atacado',
      p.precoSimulado.toFixed(2),
      p.custoSimulado.toFixed(2),
      p.icmsNum.toFixed(1),
      p.margemSimulada.toFixed(1),
      p.margemRS.toFixed(2),
      p.markupSimulado.toFixed(2),
      new Date(p.criadoEm).toLocaleDateString('pt-BR'),
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tfo-simulacoes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportScreen() {
  const { produtosSalvos, deletarProduto, setActiveFlow } = useToolStore();

  const sorted = [...produtosSalvos].sort((a, b) => b.criadoEm - a.criadoEm);

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 print:py-4">
      <button
        onClick={() => setActiveFlow(null)}
        className="text-[13px] font-sans text-gray-400 hover:text-[#2F1B20] flex items-center gap-1 mb-6 transition-colors print:hidden"
      >
        ← Voltar
      </button>

      {/* Print logo */}
      <div className="hidden print:block mb-6">
        <div className="font-sans font-bold text-[18px] text-[#2F1B20]">THE FASHION OFFICE</div>
        <div className="font-sans text-[12px] text-gray-500">Simulações de Precificação — tfo.com.br</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F1B20] mb-1">
            Simulações salvas
          </h2>
          <p className="font-sans text-[14px] text-[#6B7280]">
            {produtosSalvos.length} {produtosSalvos.length === 1 ? 'produto simulado' : 'produtos simulados'}.
            Imprima ou salve como arquivo.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-sans font-medium transition-all hover:opacity-90"
            style={{ background: '#2F1B20' }}
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={() => exportCsv(produtosSalvos)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-sans font-medium border-[1.5px] border-[#7C9DD0] text-[#7C9DD0] hover:bg-[#EEF3FA] transition-all"
          >
            📥 Baixar CSV
          </button>
        </div>
      </div>

      {produtosSalvos.length === 0 ? (
        <div className="flex items-center justify-center min-h-[260px] rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-center px-6">
            <div className="text-[40px] mb-3 text-gray-200">📋</div>
            <div className="font-sans text-[14px] text-gray-400">
              Nenhum produto salvo ainda.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ minWidth: 800 }}>
              <thead>
                <tr className="border-b-2 border-[#E5E7EB] bg-gray-50">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Segmento</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Canal</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Preço</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Custo</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ICMS</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Margem %</th>
                  <th className="text-right px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Margem R$</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Markup</th>
                  <th className="text-center px-3 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-3 py-3 print:hidden" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const isGoodMargem = p.margemSimulada >= 40;
                  const isMidMargem = p.margemSimulada >= 25;
                  const margemColor = isGoodMargem ? '#065F46' : isMidMargem ? '#B45309' : '#991B1B';
                  const margemBg = isGoodMargem ? '#ECFDF5' : isMidMargem ? '#FFFBEB' : '#FEF2F2';

                  return (
                    <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                      <td className="px-5 py-3 font-sans font-semibold text-[#2F1B20]">
                        {p.nomeProduto}
                      </td>
                      <td className="px-4 py-3 font-sans text-gray-600">
                        {segmentoLabel(p.segmento)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-medium">
                          {p.canal === 'varejo' ? 'Varejo' : 'Atacado'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-sans font-medium text-[#2F1B20]">
                        {formatCurrency(p.precoSimulado)}
                      </td>
                      <td className="px-3 py-3 text-right font-sans text-gray-600">
                        {formatCurrency(p.custoSimulado)}
                      </td>
                      <td className="px-3 py-3 text-center font-sans text-gray-600">
                        {p.icmsNum.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className="inline-block font-semibold text-[12px] rounded-full px-2.5 py-0.5"
                          style={{ background: margemBg, color: margemColor }}
                        >
                          {formatPercent(p.margemSimulada)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-sans text-gray-600">
                        {formatCurrency(p.margemRS)}
                      </td>
                      <td className="px-3 py-3 text-center font-sans text-gray-600">
                        {formatMultiplier(p.markupSimulado)}
                      </td>
                      <td className="px-3 py-3 text-center font-sans text-gray-400 text-[12px]">
                        {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 py-3 print:hidden">
                        <button
                          onClick={() => deletarProduto(p.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-[16px] leading-none"
                          title="Remover"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-[12px] text-gray-400 font-sans">
              Referências estimadas com base no mercado brasileiro de moda. The Fashion Office — tfo.com.br
            </p>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block,
          .max-w-\\[1000px\\],
          .max-w-\\[1000px\\] * { visibility: visible; }
          .max-w-\\[1000px\\] { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
          table { box-shadow: none !important; border: 1px solid #e5e7eb; }
        }
      `}</style>
    </div>
  );
}
