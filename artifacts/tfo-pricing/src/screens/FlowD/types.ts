export type PosicionamentoTier = '' | 'acesso' | 'medio' | 'premium' | 'premium_luxo';
export type PosicionamentoEditorial = '' | 'essencial' | 'classico' | 'contemporaneo' | 'editorial' | 'alta_moda';
export type ComparacaoTipo = 'eles-melhores' | 'mesmo-nivel' | 'eu-melhor' | 'nao-ofereco';

export interface Concorrente {
  id: string;
  nome: string;
  precoMedio: string;
  posicionamento: PosicionamentoTier;
  diferenciais: string[];
  comparacoes: Record<string, ComparacaoTipo>;
}

export interface FlowDState {
  segmento: string;
  posicionamentoEditorial: PosicionamentoEditorial;
  posicionamentoAtual: PosicionamentoTier;
  posicionamentoDesejado: PosicionamentoTier;
  precoMedioAtual: string;
  concorrentes: Concorrente[];
  scores: Record<string, number>;
}

export const INITIAL_SCORES: Record<string, number> = {
  qualidade_materiais: 3,
  design_diferenciacao: 3,
  exclusividade: 3,
  processo_produtivo: 3,
  reconhecimento_marca: 3,
  narrativa_proposito: 3,
  experiencia_compra: 3,
  comunidade: 3,
  consistencia_visual: 3,
  engajamento_digital: 3,
  investimento_marketing: 3,
  autoridade_pr: 3,
};

export const INITIAL_STATE: FlowDState = {
  segmento: '',
  posicionamentoEditorial: '',
  posicionamentoAtual: '',
  posicionamentoDesejado: '',
  precoMedioAtual: '',
  concorrentes: [],
  scores: { ...INITIAL_SCORES },
};
