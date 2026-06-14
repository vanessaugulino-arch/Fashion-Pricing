export interface CriterioInfo {
  id: string;
  dimensao: 'PRODUTO' | 'MARCA' | 'PRESENÇA' | 'MARKETING';
  corDimensao: string;
  titulo: string;
  pergunta: string;
  ancora1: string;
  ancora5: string;
  reflexao4: string;
}

export const DIFERENCIAIS = [
  { id: 'design_autoral', label: 'Design autoral' },
  { id: 'qualidade_material', label: 'Qualidade de material' },
  { id: 'exclusividade', label: 'Exclusividade' },
  { id: 'preco_acessivel', label: 'Preço acessível' },
  { id: 'marca_reconhecida', label: 'Marca reconhecida' },
  { id: 'experiencia_compra', label: 'Experiência de compra' },
  { id: 'comunidade', label: 'Comunidade' },
  { id: 'sustentabilidade', label: 'Sustentabilidade' },
  { id: 'tecnologia_produto', label: 'Tecnologia do produto' },
  { id: 'atendimento_personalizado', label: 'Atendimento personalizado' },
  { id: 'narrativa_marca', label: 'Narrativa de marca forte' },
];

export const CRITERIOS: CriterioInfo[] = [
  {
    id: 'qualidade_materiais',
    dimensao: 'PRODUTO',
    corDimensao: '#7C9DD0',
    titulo: 'Qualidade e durabilidade dos materiais',
    pergunta: 'Pense nos últimos clientes que tiveram uma segunda ou terceira compra. O que motivou o retorno? Eles mencionaram a qualidade do produto?',
    ancora1: 'Ninguém menciona espontaneamente a qualidade.',
    ancora5: 'Clientes recomendam espontaneamente pela qualidade do material.',
    reflexao4: 'Clientes precisam perceber isso visualmente ou pelo uso. Você já recebeu elogio espontâneo sobre o material?',
  },
  {
    id: 'design_diferenciacao',
    dimensao: 'PRODUTO',
    corDimensao: '#7C9DD0',
    titulo: 'Design e diferenciação visual',
    pergunta: 'Seus produtos têm identidade visual própria, reconhecível e consistente entre as coleções?',
    ancora1: 'O design segue tendências genéricas, sem identidade própria.',
    ancora5: 'O design é imediatamente reconhecível e associado à marca.',
    reflexao4: 'Design diferenciado é aquele que o cliente reconhece sem ver a etiqueta. Alguém já identificou sua peça como "daquela marca"?',
  },
  {
    id: 'exclusividade',
    dimensao: 'PRODUTO',
    corDimensao: '#7C9DD0',
    titulo: 'Exclusividade e escassez percebida',
    pergunta: 'Seu produto é percebido como algo que não está em todo lugar? Há limitação real de quantidade ou acesso?',
    ancora1: 'Produto disponível em grande quantidade, sem limitação percebida.',
    ancora5: 'Produto percebido como exclusivo — difícil de conseguir, coleção limitada.',
    reflexao4: 'A percepção de escassez precisa ser real. Você tem controle de estoque que garanta isso?',
  },
  {
    id: 'processo_produtivo',
    dimensao: 'PRODUTO',
    corDimensao: '#7C9DD0',
    titulo: 'Processo produtivo diferenciado',
    pergunta: 'Há algo no processo de fabricação que justifica um valor maior — artesanato, origem dos materiais, técnica específica?',
    ancora1: 'Processo produtivo padrão, sem diferencial comunicado.',
    ancora5: 'Processo produtivo é um atributo de valor claro e comunicado ativamente.',
    reflexao4: 'Este atributo só vira valor se comunicado. O cliente sabe como seu produto é feito?',
  },
  {
    id: 'reconhecimento_marca',
    dimensao: 'MARCA',
    corDimensao: '#C8B840',
    titulo: 'Reconhecimento da marca',
    pergunta: 'Fora do seu círculo direto, quantas pessoas reconhecem sua marca pelo nome ou visual?',
    ancora1: 'A marca é desconhecida fora do círculo próximo da fundadora.',
    ancora5: 'A marca é reconhecida no segmento como referência.',
    reflexao4: 'Teste: peça a alguém fora do seu círculo próximo para nomear sua marca. Qual é a reação?',
  },
  {
    id: 'narrativa_proposito',
    dimensao: 'MARCA',
    corDimensao: '#C8B840',
    titulo: 'Narrativa e propósito de marca',
    pergunta: 'Existe uma história clara sobre por que esta marca existe? Ela aparece consistentemente nos pontos de contato com o cliente?',
    ancora1: 'Não há narrativa de marca clara ou consistente.',
    ancora5: 'A narrativa é central, aparece em todos os pontos de contato e é reconhecida pelos clientes.',
    reflexao4: 'Sua narrativa está nos pontos de contato com o cliente — embalagem, posts, atendimento — ou só na sua cabeça?',
  },
  {
    id: 'experiencia_compra',
    dimensao: 'MARCA',
    corDimensao: '#C8B840',
    titulo: 'Experiência de compra',
    pergunta: 'Como é a experiência do cliente do primeiro contato até o pós-venda? Há algo que torna essa jornada memorável?',
    ancora1: 'Experiência funcional, sem diferenciais notáveis.',
    ancora5: 'Experiência de compra é mencionada espontaneamente como diferencial da marca.',
    reflexao4: 'Pense na última reclamação que você recebeu. O que ela revelou sobre a experiência?',
  },
  {
    id: 'comunidade',
    dimensao: 'MARCA',
    corDimensao: '#C8B840',
    titulo: 'Comunidade e pertencimento',
    pergunta: 'Os clientes se identificam com a marca a ponto de querer fazer parte de algo maior?',
    ancora1: 'Os clientes compram pelo produto, não por um sentimento de pertencimento.',
    ancora5: 'Existe uma comunidade ativa de clientes que se identificam com os valores da marca.',
    reflexao4: 'Você tem clientes que compram porque fazem parte de algo? Ou compram porque o produto atende uma necessidade?',
  },
  {
    id: 'consistencia_visual',
    dimensao: 'PRESENÇA',
    corDimensao: '#2D6A4F',
    titulo: 'Consistência visual da marca',
    pergunta: 'Alguém que vê seus posts, seu site e sua embalagem consegue reconhecer que é a mesma marca?',
    ancora1: 'Visual inconsistente entre os canais — cada ponto de contato parece diferente.',
    ancora5: 'Identidade visual coesa e reconhecível em todos os canais e materiais.',
    reflexao4: 'Abra seu feed e o site ao mesmo tempo. Um estranho perceberia que é a mesma marca?',
  },
  {
    id: 'engajamento_digital',
    dimensao: 'MARKETING',
    corDimensao: '#9C7DD0',
    titulo: 'Engajamento digital orgânico',
    pergunta: 'Tirando impulsionamentos e anúncios, qual é o nível de engajamento real do seu público?',
    ancora1: 'Engajamento orgânico muito baixo — a maioria do tráfego é pago.',
    ancora5: 'Alto engajamento orgânico — o público comenta, compartilha e indica sem impulsionamento.',
    reflexao4: 'Tire os likes pagos e as visualizações de ads. Qual é o engajamento orgânico real?',
  },
  {
    id: 'investimento_marketing',
    dimensao: 'MARKETING',
    corDimensao: '#9C7DD0',
    titulo: 'Investimento consistente em marketing',
    pergunta: 'Há um investimento regular e estratégico em marketing — não só impulsionamentos pontuais?',
    ancora1: 'Sem investimento regular — ações de marketing são esporádicas e sem estratégia.',
    ancora5: 'Investimento regular e planejado, com métricas acompanhadas.',
    reflexao4: 'Calcule o valor exato investido nos últimos 3 meses em marketing. Divida pelo faturamento. Esse número é intencional?',
  },
  {
    id: 'autoridade_pr',
    dimensao: 'MARKETING',
    corDimensao: '#9C7DD0',
    titulo: 'Autoridade e presença em mídia (PR)',
    pergunta: 'A marca já foi mencionada em mídia, editorials, ou por influenciadores de forma orgânica (sem pagar)?',
    ancora1: 'Sem presença em mídia orgânica — sem editorial, sem menção não-paga.',
    ancora5: 'Presença consistente em mídia — menções regulares, editorial, autoridade no segmento.',
    reflexao4: 'Você já foi citado em mídia sem ter pago por isso? Quantas vezes no último ano?',
  },
];

export const DIMENSOES: Record<string, { label: string; cor: string; ids: string[] }> = {
  PRODUTO: { label: 'Produto', cor: '#7C9DD0', ids: ['qualidade_materiais', 'design_diferenciacao', 'exclusividade', 'processo_produtivo'] },
  MARCA: { label: 'Marca', cor: '#C8B840', ids: ['reconhecimento_marca', 'narrativa_proposito', 'experiencia_compra', 'comunidade'] },
  PRESENÇA: { label: 'Presença Visual', cor: '#2D6A4F', ids: ['consistencia_visual'] },
  MARKETING: { label: 'Marketing', cor: '#9C7DD0', ids: ['engajamento_digital', 'investimento_marketing', 'autoridade_pr'] },
};

export const POSICIONAMENTOS: Array<{ id: string; label: string; desc: string; cor: string; xPct: number; yPct: number }> = [
  { id: 'acesso', label: 'Acesso', desc: 'Commodity / Emergente — preço abaixo ou igual à média', cor: '#6B7280', xPct: 16, yPct: 74 },
  { id: 'medio', label: 'Médio', desc: 'Diferenciado / Em consolidação — +10% a +30% acima da média', cor: '#7C9DD0', xPct: 40, yPct: 52 },
  { id: 'premium', label: 'Premium', desc: 'Consolidado / Aspiracional — +30% a +80% acima da média', cor: '#C8B840', xPct: 66, yPct: 28 },
  { id: 'premium_luxo', label: 'Premium / Luxo', desc: 'Referência de mercado / Luxo — +80% a +200%+ acima da média', cor: '#2F1B20', xPct: 86, yPct: 12 },
];
