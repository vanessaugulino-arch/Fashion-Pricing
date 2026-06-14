import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DespesaItem {
  id: string;
  nome: string;
  valor: number;          // % sobre vendas se isPercentual=true, R$/mês se false
  isPercentual: boolean;  // true = variável (% sobre faturamento), false = fixo (R$/mês)
  categoria: 'fixo' | 'variavel' | 'imposto' | 'marketing' | 'outro';
  criadoEm: number;
}

export type FlowType = 'A' | 'B' | 'C' | 'D' | 'MIX' | 'compare' | 'export' | null;

interface FlowAState {
  nomeProduto: string; tipoProduto: string; modeloNegocio: string;
  precoVenda: string; custoProduto: string; icms: string;
  taxasPagamento: string; comissoes: string; devolucao: string; outros: string;
}
interface FlowBState {
  segmento: string; tipoVenda: string; percVarejo: number; percAtacado: number;
  tipoPreco: string; precoMedio: string; precoDefinido: string;
  faturamento: string; quantidade: string;
  custoProduto: string; icms: string; custoVariavel: string; custoFixo: string;
}
interface FlowCState {
  nomeProduto: string; tipoProduto: string; modeloNegocio: string;
  custoProduto: string; icms: string; taxasPagamento: string; comissoes: string;
  devolucao: string; outros: string; margemDesejada: number; precoAtual: string;
}
interface MixState {
  perfilMarca: string;
  papeis: {
    icone: { participacao: number; margem: number; remarcacao: number; precoMedio: string };
    sustentador: { participacao: number; margem: number; remarcacao: number; precoMedio: string };
    motorGiro: { participacao: number; margem: number; remarcacao: number; precoMedio: string };
    portaEntrada: { participacao: number; margem: number; remarcacao: number; precoMedio: string };
  };
}

export interface Cenario {
  id: string;
  nome: string;
  criadoEm: number;
  dados: FlowBState;
  resultado: any;
}

export interface ProdutoSalvo {
  id: string;
  nomeProduto: string;
  segmento: string;
  canal: 'varejo' | 'atacado';
  precoSimulado: number;
  custoSimulado: number;
  icmsNum: number;
  margemSimulada: number;
  markupSimulado: number;
  margemRS: number;
  criadoEm: number;
}

interface ToolStore {
  activeFlow: FlowType;
  currentStep: number;
  flowA: FlowAState;
  flowB: FlowBState;
  flowC: FlowCState;
  mixPortfolio: MixState;
  resultA: any;
  resultB: any;
  resultC: any;
  mixResult: any;
  cenarios: Cenario[];
  cenarioEscolhido: string | null;
  produtosSalvos: ProdutoSalvo[];
  despesasLista: DespesaItem[];
  setActiveFlow: (flow: FlowType) => void;
  setCurrentStep: (step: number) => void;
  goBack: () => void;
  updateFlowA: (data: Partial<FlowAState>) => void;
  updateFlowB: (data: Partial<FlowBState>) => void;
  updateFlowC: (data: Partial<FlowCState>) => void;
  updatePapelMix: (papel: string, data: Partial<{ participacao: number; margem: number; remarcacao: number; precoMedio: string }>) => void;
  setResultA: (result: any) => void;
  setResultB: (result: any) => void;
  setResultC: (result: any) => void;
  setMixResult: (result: any) => void;
  resetAll: () => void;
  salvarCenario: (nome: string, resultado: any) => void;
  deletarCenario: (id: string) => void;
  marcarCenarioEscolhido: (id: string) => void;
  limparCenarios: () => void;
  salvarProduto: (produto: ProdutoSalvo) => void;
  deletarProduto: (id: string) => void;
  limparProdutos: () => void;
  adicionarDespesa: (despesa: DespesaItem) => void;
  removerDespesa: (id: string) => void;
  limparDespesas: () => void;
  precoSugeridoD: string;
  setPrecoSugeridoD: (preco: string) => void;
}

const initialFlowA: FlowAState = {
  nomeProduto: '', tipoProduto: '', modeloNegocio: '', precoVenda: '', custoProduto: '',
  icms: '', taxasPagamento: '', comissoes: '', devolucao: '', outros: '',
};
const initialFlowB: FlowBState = {
  segmento: '', tipoVenda: '', percVarejo: 70, percAtacado: 30,
  tipoPreco: '', precoMedio: '', precoDefinido: '', faturamento: '', quantidade: '',
  custoProduto: '', icms: '', custoVariavel: '', custoFixo: '',
};
const initialFlowC: FlowCState = {
  nomeProduto: '', tipoProduto: '', modeloNegocio: '', custoProduto: '',
  icms: '', taxasPagamento: '', comissoes: '', devolucao: '', outros: '',
  margemDesejada: 42, precoAtual: '',
};
const initialMix: MixState = {
  perfilMarca: '',
  papeis: {
    icone: { participacao: 0, margem: 38, remarcacao: 38, precoMedio: '' },
    sustentador: { participacao: 0, margem: 60, remarcacao: 5, precoMedio: '' },
    motorGiro: { participacao: 0, margem: 50, remarcacao: 18, precoMedio: '' },
    portaEntrada: { participacao: 0, margem: 44, remarcacao: 10, precoMedio: '' },
  },
};

export const useToolStore = create<ToolStore>()(
  persist(
    (set, get) => ({
      activeFlow: null,
      currentStep: 1,
      flowA: { ...initialFlowA },
      flowB: { ...initialFlowB },
      flowC: { ...initialFlowC },
      mixPortfolio: { ...initialMix },
      resultA: null,
      resultB: null,
      resultC: null,
      mixResult: null,
      cenarios: [],
      cenarioEscolhido: null,
      produtosSalvos: [],
      despesasLista: [],
      precoSugeridoD: '',
      setActiveFlow: (flow) => set({ activeFlow: flow, currentStep: 1 }),
      setCurrentStep: (step) => set({ currentStep: step }),
      goBack: () => {
        const { activeFlow, currentStep } = get();
        if (activeFlow === 'B' && currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        } else {
          set({ activeFlow: null, currentStep: 1 });
        }
      },
      updateFlowA: (data) => set(state => ({ flowA: { ...state.flowA, ...data } })),
      updateFlowB: (data) => set(state => ({ flowB: { ...state.flowB, ...data } })),
      updateFlowC: (data) => set(state => ({ flowC: { ...state.flowC, ...data } })),
      updatePapelMix: (papel, data) => set(state => ({
        mixPortfolio: {
          ...state.mixPortfolio,
          papeis: {
            ...state.mixPortfolio.papeis,
            [papel]: { ...state.mixPortfolio.papeis[papel as keyof typeof state.mixPortfolio.papeis], ...data },
          },
        },
      })),
      setResultA: (result) => set({ resultA: result }),
      setResultB: (result) => set({ resultB: result }),
      setResultC: (result) => set({ resultC: result }),
      setMixResult: (result) => set({ mixResult: result }),
      resetAll: () => set({
        activeFlow: null, currentStep: 1,
        flowA: { ...initialFlowA }, flowB: { ...initialFlowB },
        flowC: { ...initialFlowC }, mixPortfolio: { ...initialMix },
        resultA: null, resultB: null, resultC: null, mixResult: null,
      }),
      salvarCenario: (nome, resultado) => {
        const novoCenario: Cenario = {
          id: crypto.randomUUID(),
          nome,
          criadoEm: Date.now(),
          dados: { ...get().flowB },
          resultado,
        };
        set(state => ({ cenarios: [...state.cenarios, novoCenario] }));
      },
      deletarCenario: (id) => {
        set(state => ({
          cenarios: state.cenarios.filter(c => c.id !== id),
          cenarioEscolhido: state.cenarioEscolhido === id ? null : state.cenarioEscolhido,
        }));
      },
      marcarCenarioEscolhido: (id) => set({ cenarioEscolhido: id }),
      limparCenarios: () => set({ cenarios: [], cenarioEscolhido: null }),
      salvarProduto: (produto) =>
        set(state => ({ produtosSalvos: [...state.produtosSalvos, produto] })),
      deletarProduto: (id) =>
        set(state => ({ produtosSalvos: state.produtosSalvos.filter(p => p.id !== id) })),
      limparProdutos: () => set({ produtosSalvos: [] }),
      adicionarDespesa: (despesa) =>
        set(state => ({ despesasLista: [...state.despesasLista, despesa] })),
      removerDespesa: (id) =>
        set(state => ({ despesasLista: state.despesasLista.filter(d => d.id !== id) })),
      limparDespesas: () => set({ despesasLista: [] }),
      setPrecoSugeridoD: (preco) => set({ precoSugeridoD: preco }),
    }),
    { name: 'tfo-tool-store' }
  )
);
