export const SEGMENTOS = [
  { value: "vestuario_feminino", label: "Vestuário Feminino" },
  { value: "vestuario_masculino", label: "Vestuário Masculino" },
  { value: "vestuario_infantil", label: "Vestuário Infantil" },
  { value: "calcados_femininos", label: "Calçados Feminino" },
  { value: "calcados_masculinos", label: "Calçados Masculino" },
  { value: "calcados_infantis", label: "Calçados Infantil" },
  { value: "acessorios", label: "Acessórios" },
  { value: "bijuterias_joias", label: "Bijuterias / Semijóias" },
  { value: "underwear", label: "Underwear / Lingerie" },
  { value: "fitness", label: "Moda Fitness" },
  { value: "moda_praia", label: "Moda Praia" },
];

export const ICMS_DEFAULTS: Record<string, number> = {
  varejo: 10,
  atacado: 6,
  hibrido: 8,
};

export const CUSTO_VARIAVEL_DEFAULTS: Record<string, number> = {
  varejo: 11.5,
  atacado: 7.0,
  hibrido: 9.0,
};

export const BENCHMARK_MARGEM_BRUTA: Record<
  string,
  { varejo: [number, number]; atacado: [number, number] }
> = {
  vestuario_feminino:  { varejo: [45, 65], atacado: [35, 55] },
  vestuario_masculino: { varejo: [42, 62], atacado: [32, 52] },
  vestuario_infantil:  { varejo: [40, 60], atacado: [30, 50] },
  calcados_femininos:  { varejo: [48, 68], atacado: [38, 58] },
  calcados_masculinos: { varejo: [45, 65], atacado: [35, 55] },
  calcados_infantis:   { varejo: [40, 60], atacado: [30, 50] },
  acessorios:          { varejo: [55, 72], atacado: [42, 60] },
  bijuterias_joias:    { varejo: [58, 75], atacado: [48, 65] },
  underwear:           { varejo: [43, 63], atacado: [33, 53] },
  fitness:             { varejo: [43, 63], atacado: [34, 54] },
  moda_praia:          { varejo: [43, 63], atacado: [34, 54] },
  default:             { varejo: [42, 62], atacado: [33, 53] },
};

export const getBenchmarkMargem = (
  segmento: string,
  canal: "varejo" | "atacado"
): [number, number] => {
  const bench = BENCHMARK_MARGEM_BRUTA[segmento] ?? BENCHMARK_MARGEM_BRUTA["default"];
  return bench[canal];
};
