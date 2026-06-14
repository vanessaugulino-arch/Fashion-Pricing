import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ProdutoSalvo {
  id: string;
  nomeProduto: string;
  segmento: string;
  canal: "varejo" | "atacado";
  precoSimulado: number;
  custoSimulado: number;
  icmsNum: number;
  margemSimulada: number;
  markupSimulado: number;
  margemRS: number;
  criadoEm: number;
}

export interface CenarioResultado {
  mc_rs: number;
  mc_perc: number;
  resultado: number;
  pe_rs: number | null;
  markup: number | null;
  custoFixoPerc: number;
  distanciaPE: number | null;
  faturamentoTotal?: number;
  precoMedioConsolidado?: number;
  mc_pct?: number;
}

export interface Cenario {
  id: string;
  nome: string;
  criadoEm: number;
  resultado: CenarioResultado | null;
  dados: {
    canal: string;
    precoMedio: string;
    custoMedio: string;
    faturamento: string;
    custoFixo: string;
    icms?: string;
    custoVariavel?: string;
  };
}

interface ToolStore {
  produtosSalvos: ProdutoSalvo[];
  cenarios: Cenario[];
  salvarProduto: (p: ProdutoSalvo) => void;
  deletarProduto: (id: string) => void;
  salvarCenario: (c: Cenario) => void;
  deletarCenario: (id: string) => void;
}

export const useToolStore = create<ToolStore>()(
  persist(
    (set) => ({
      produtosSalvos: [],
      cenarios: [],

      salvarProduto: (p) =>
        set((state) => ({
          produtosSalvos: [
            p,
            ...state.produtosSalvos.filter((x) => x.id !== p.id),
          ],
        })),

      deletarProduto: (id) =>
        set((state) => ({
          produtosSalvos: state.produtosSalvos.filter((p) => p.id !== id),
        })),

      salvarCenario: (c) =>
        set((state) => ({
          cenarios: [c, ...state.cenarios.filter((x) => x.id !== c.id)],
        })),

      deletarCenario: (id) =>
        set((state) => ({
          cenarios: state.cenarios.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "tfo-tool-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
