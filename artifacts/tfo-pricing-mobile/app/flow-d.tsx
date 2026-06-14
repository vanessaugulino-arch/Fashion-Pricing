import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WINE = "#2F1B20";
const BLUE = "#7C9DD0";
const YELLOW = "#F6F1AF";
const YELLOW_BORDER = "#C8B840";
const BG = "#F2F2F2";

const POSICIONAMENTOS = [
  {
    id: "acesso",
    label: "Acesso",
    desc: "Commodity / Emergente — preço igual ou abaixo da média",
    cor: "#6B7280",
  },
  {
    id: "medio",
    label: "Médio",
    desc: "Diferenciado / Em consolidação — +10% a +30% acima",
    cor: "#7C9DD0",
  },
  {
    id: "premium",
    label: "Premium",
    desc: "Consolidado / Aspiracional — +30% a +80% acima",
    cor: "#C8B840",
  },
  {
    id: "premium_luxo",
    label: "Premium / Luxo",
    desc: "Referência de mercado — +80% a +200%+ acima",
    cor: "#2F1B20",
  },
];

const TIER_CONFIG: Record<
  string,
  {
    label: string;
    cor: string;
    multiplierMin: number;
    multiplierMax: number;
    descricao: string;
    estrategia: string;
  }
> = {
  acesso: {
    label: "Acesso",
    cor: "#6B7280",
    multiplierMin: 1.5,
    multiplierMax: 2.5,
    descricao: "Commodity / Emergente",
    estrategia:
      "Fortaleça produto e marca antes de aumentar preço. Foque em consistência e construção de identidade.",
  },
  medio: {
    label: "Médio",
    cor: "#7C9DD0",
    multiplierMin: 2.5,
    multiplierMax: 3.5,
    descricao: "Diferenciado / Em consolidação",
    estrategia:
      "Consistência de comunicação e construção de audiência própria. O momento é de consolidar diferenciais.",
  },
  premium: {
    label: "Premium",
    cor: "#C8B840",
    multiplierMin: 3.5,
    multiplierMax: 5.0,
    descricao: "Consolidado / Aspiracional",
    estrategia:
      "Brand building intensivo — PR, editorial e experiência de marca. Você tem base para sustentar preço premium.",
  },
  premium_luxo: {
    label: "Premium / Luxo",
    cor: "#2F1B20",
    multiplierMin: 5.0,
    multiplierMax: 8.0,
    descricao: "Referência de mercado / Luxo",
    estrategia:
      "Exclusividade máxima. Nunca promover por preço. Sua marca é referência — proteja isso.",
  },
};

const CRITERIOS = [
  {
    id: "qualidade_materiais",
    dim: "PRODUTO",
    dimCor: "#7C9DD0",
    titulo: "Qualidade dos materiais",
    ancora1: "Ninguém menciona qualidade espontaneamente",
    ancora5: "Clientes recomendam pela qualidade do material",
  },
  {
    id: "design_diferenciacao",
    dim: "PRODUTO",
    dimCor: "#7C9DD0",
    titulo: "Design e diferenciação visual",
    ancora1: "Design segue tendências genéricas",
    ancora5: "Design imediatamente reconhecível da marca",
  },
  {
    id: "exclusividade",
    dim: "PRODUTO",
    dimCor: "#7C9DD0",
    titulo: "Exclusividade percebida",
    ancora1: "Produto disponível em grande quantidade",
    ancora5: "Produto percebido como exclusivo e escasso",
  },
  {
    id: "processo_produtivo",
    dim: "PRODUTO",
    dimCor: "#7C9DD0",
    titulo: "Processo produtivo diferenciado",
    ancora1: "Processo padrão, sem diferencial comunicado",
    ancora5: "Processo é atributo de valor claramente comunicado",
  },
  {
    id: "reconhecimento_marca",
    dim: "MARCA",
    dimCor: "#C8B840",
    titulo: "Reconhecimento da marca",
    ancora1: "Marca desconhecida fora do círculo próximo",
    ancora5: "Marca reconhecida como referência no segmento",
  },
  {
    id: "narrativa_proposito",
    dim: "MARCA",
    dimCor: "#C8B840",
    titulo: "Narrativa e propósito",
    ancora1: "Sem história de marca clara",
    ancora5: "Narrativa forte e propósito que conecta clientes",
  },
  {
    id: "experiencia_compra",
    dim: "MARCA",
    dimCor: "#C8B840",
    titulo: "Experiência de compra",
    ancora1: "Compra funcional, sem diferencial experiencial",
    ancora5: "Experiência memorável e consistente",
  },
  {
    id: "comunidade",
    dim: "MARCA",
    dimCor: "#C8B840",
    titulo: "Comunidade em torno da marca",
    ancora1: "Sem engajamento ou senso de comunidade",
    ancora5: "Clientes são embaixadores ativos da marca",
  },
  {
    id: "consistencia_visual",
    dim: "PRESENÇA",
    dimCor: "#9CA3AF",
    titulo: "Consistência visual",
    ancora1: "Identidade visual inconsistente",
    ancora5: "Identidade visual coesa em todos os canais",
  },
  {
    id: "engajamento_digital",
    dim: "PRESENÇA",
    dimCor: "#9CA3AF",
    titulo: "Engajamento digital",
    ancora1: "Presença digital fraca ou inconsistente",
    ancora5: "Alta taxa de engajamento e crescimento orgânico",
  },
  {
    id: "investimento_marketing",
    dim: "MARKETING",
    dimCor: "#A78BFA",
    titulo: "Investimento em marketing",
    ancora1: "Sem investimento consistente em marketing",
    ancora5: "Estratégia de marketing robusta e contínua",
  },
  {
    id: "autoridade_pr",
    dim: "MARKETING",
    dimCor: "#A78BFA",
    titulo: "Autoridade e PR",
    ancora1: "Sem aparições em mídia ou PR",
    ancora5: "Presença frequente em editoriais e mídia especializada",
  },
];

type Step = "context" | "competitors" | "scores" | "result";

interface Concorrente {
  nome: string;
  preco: string;
}

interface State {
  segmento: string;
  posicionamentoAtual: string;
  posicionamentoDesejado: string;
  precoMedioAtual: string;
  concorrentes: Concorrente[];
  scores: Record<string, number>;
}

const INITIAL_STATE: State = {
  segmento: "",
  posicionamentoAtual: "",
  posicionamentoDesejado: "",
  precoMedioAtual: "",
  concorrentes: [{ nome: "", preco: "" }],
  scores: Object.fromEntries(CRITERIOS.map((c) => [c.id, 3])),
};

function scoreTier(total: number): string {
  if (total <= 22) return "acesso";
  if (total <= 34) return "medio";
  if (total <= 46) return "premium";
  return "premium_luxo";
}

function calcTotal(scores: Record<string, number>): number {
  return Object.values(scores).reduce((a, b) => a + b, 0);
}

export default function FlowDScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>("context");
  const [state, setState] = useState<State>({ ...INITIAL_STATE });

  const update = (patch: Partial<State>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const updateScore = (id: string, val: number) =>
    setState((prev) => ({
      ...prev,
      scores: { ...prev.scores, [id]: val },
    }));

  const updateConcorrente = (
    idx: number,
    field: keyof Concorrente,
    value: string
  ) => {
    const next = [...state.concorrentes];
    next[idx] = { ...next[idx], [field]: value };
    update({ concorrentes: next });
  };

  const addConcorrente = () => {
    if (state.concorrentes.length < 3)
      update({ concorrentes: [...state.concorrentes, { nome: "", preco: "" }] });
  };

  const removeConcorrente = (idx: number) => {
    update({ concorrentes: state.concorrentes.filter((_, i) => i !== idx) });
  };

  const totalScore = calcTotal(state.scores);
  const tier = scoreTier(totalScore);
  const tierCfg = TIER_CONFIG[tier];

  const precoNum = parseFloat(
    state.precoMedioAtual.replace(",", ".")
  );
  const hasPreco = !isNaN(precoNum) && precoNum > 0;
  const precoMin = hasPreco
    ? precoNum * tierCfg.multiplierMin
    : null;
  const precoMax = hasPreco
    ? precoNum * tierCfg.multiplierMax
    : null;

  const canAdvanceContext =
    state.segmento.trim().length > 0 && state.posicionamentoAtual !== "";

  const STEP_ORDER: Step[] = ["context", "competitors", "scores", "result"];
  const stepIndex = STEP_ORDER.indexOf(step);

  const STEP_LABELS = ["Contexto", "Concorrentes", "Avaliação"];

  const inputStyle = (focused: boolean) => ({
    ...styles.input,
    borderColor: focused ? YELLOW_BORDER : "#E5E7EB",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <View
        style={[styles.header, { paddingTop: topPad + 12, backgroundColor: WINE }]}
      >
        <Pressable
          onPress={() => {
            if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Estratégia de preço</Text>
        <Text style={styles.headerSub}>
          Descubra qual tier de posicionamento a sua marca sustenta
        </Text>
      </View>

      {step !== "result" && (
        <View style={styles.progressWrap}>
          {STEP_LABELS.map((label, i) => {
            const done = stepIndex > i;
            const active = stepIndex === i;
            return (
              <React.Fragment key={label}>
                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor: done
                          ? WINE
                          : active
                          ? YELLOW_BORDER
                          : "#E5E7EB",
                      },
                    ]}
                  >
                    {done ? (
                      <Feather name="check" size={10} color="#fff" />
                    ) : (
                      <Text
                        style={[
                          styles.progressNum,
                          { color: active ? WINE : "#9CA3AF" },
                        ]}
                      >
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.progressLabel,
                      {
                        color: active ? WINE : done ? "#6B7280" : "#9CA3AF",
                        fontWeight: active ? "600" : "400",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
                {i < STEP_LABELS.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      { backgroundColor: done ? WINE : "#E5E7EB" },
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── STEP 1: CONTEXT ─── */}
        {step === "context" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Antes de qualquer número, precisamos entender onde você está.
                Seja honesto sobre o posicionamento{" "}
                <Text style={{ fontFamily: "Poppins_600SemiBold" }}>atual</Text> —
                não o ideal.
              </Text>
            </View>

            <Text style={styles.label}>
              Segmento de moda <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={inputStyle(focusedField === "segmento")}
              placeholder="Ex: moda feminina contemporânea, streetwear..."
              placeholderTextColor="#9CA3AF"
              value={state.segmento}
              onChangeText={(v) => update({ segmento: v })}
              onFocus={() => setFocusedField("segmento")}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>
              Preço médio atual dos seus produtos (R$){" "}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <Text style={styles.helpText}>
              Usado para calcular a faixa de preço recomendada no resultado.
            </Text>
            <TextInput
              style={inputStyle(focusedField === "preco")}
              placeholder="Ex: 180,00"
              placeholderTextColor="#9CA3AF"
              value={state.precoMedioAtual}
              onChangeText={(v) => update({ precoMedioAtual: v })}
              keyboardType="decimal-pad"
              onFocus={() => setFocusedField("preco")}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>
              Posicionamento atual da marca{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helpText}>
              Onde sua marca está hoje — não onde você quer que chegue.
            </Text>
            <View style={styles.posCards}>
              {POSICIONAMENTOS.map((p) => {
                const sel = state.posicionamentoAtual === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => update({ posicionamentoAtual: p.id })}
                    style={[
                      styles.posCard,
                      {
                        borderColor: sel ? WINE : "#E5E7EB",
                        backgroundColor: sel
                          ? "rgba(47,27,32,0.04)"
                          : "#FFFFFF",
                      },
                    ]}
                  >
                    <View style={styles.posCardRow}>
                      <View
                        style={[
                          styles.posDot,
                          { backgroundColor: p.cor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.posLabel,
                          { color: sel ? WINE : "#374151" },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </View>
                    <Text style={styles.posDesc}>{p.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>
              Posicionamento desejado{" "}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <Text style={styles.helpText}>
              Onde você quer que a marca chegue.
            </Text>
            <View style={styles.posCards}>
              {POSICIONAMENTOS.map((p) => {
                const sel = state.posicionamentoDesejado === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() =>
                      update({
                        posicionamentoDesejado: sel ? "" : p.id,
                      })
                    }
                    style={[
                      styles.posCard,
                      {
                        borderColor: sel ? YELLOW_BORDER : "#E5E7EB",
                        backgroundColor: sel
                          ? "rgba(200,184,64,0.07)"
                          : "#FFFFFF",
                      },
                    ]}
                  >
                    <View style={styles.posCardRow}>
                      <View
                        style={[styles.posDot, { backgroundColor: p.cor }]}
                      />
                      <Text
                        style={[
                          styles.posLabel,
                          { color: sel ? WINE : "#374151" },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </View>
                    <Text style={styles.posDesc}>{p.desc}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => {
                if (canAdvanceContext) setStep("competitors");
              }}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: canAdvanceContext ? WINE : "#D1D5DB",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={styles.primaryBtnText}>Próximo → Concorrentes</Text>
            </Pressable>
          </View>
        )}

        {/* ─── STEP 2: COMPETITORS ─── */}
        {step === "competitors" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Adicione até 3 concorrentes diretos. Isso é opcional — se não
                souber, avance assim mesmo.
              </Text>
            </View>

            {state.concorrentes.map((c, i) => (
              <View key={i} style={styles.competitorCard}>
                <View style={styles.competitorHeader}>
                  <Text style={styles.competitorTitle}>
                    Concorrente {i + 1}
                  </Text>
                  {state.concorrentes.length > 1 && (
                    <Pressable onPress={() => removeConcorrente(i)}>
                      <Feather name="x" size={16} color="#9CA3AF" />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.label}>Nome da marca</Text>
                <TextInput
                  style={inputStyle(focusedField === `cname${i}`)}
                  placeholder="Ex: Marca XYZ"
                  placeholderTextColor="#9CA3AF"
                  value={c.nome}
                  onChangeText={(v) => updateConcorrente(i, "nome", v)}
                  onFocus={() => setFocusedField(`cname${i}`)}
                  onBlur={() => setFocusedField(null)}
                />
                <Text style={[styles.label, { marginTop: 12 }]}>
                  Preço médio deles (R$)
                </Text>
                <TextInput
                  style={inputStyle(focusedField === `cpreco${i}`)}
                  placeholder="Ex: 250,00"
                  placeholderTextColor="#9CA3AF"
                  value={c.preco}
                  onChangeText={(v) => updateConcorrente(i, "preco", v)}
                  keyboardType="decimal-pad"
                  onFocus={() => setFocusedField(`cpreco${i}`)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            ))}

            {state.concorrentes.length < 3 && (
              <Pressable
                onPress={addConcorrente}
                style={styles.addCompBtn}
              >
                <Feather name="plus" size={16} color={WINE} />
                <Text style={styles.addCompText}>
                  Adicionar concorrente
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => setStep("scores")}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: WINE,
                  opacity: pressed ? 0.85 : 1,
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.primaryBtnText}>Próximo → Avaliação</Text>
            </Pressable>
          </View>
        )}

        {/* ─── STEP 3: SCORES ─── */}
        {step === "scores" && (
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Avalie sua marca em 12 dimensões de 1 a 5. Seja honesto — a
                análise só funciona com autoconhecimento real.
              </Text>
            </View>

            {(["PRODUTO", "MARCA", "PRESENÇA", "MARKETING"] as const).map(
              (dim) => {
                const group = CRITERIOS.filter((c) => c.dim === dim);
                const dimCor = group[0].dimCor;
                return (
                  <View key={dim} style={styles.dimGroup}>
                    <View
                      style={[styles.dimHeader, { borderLeftColor: dimCor }]}
                    >
                      <Text style={[styles.dimLabel, { color: dimCor }]}>
                        {dim}
                      </Text>
                    </View>
                    {group.map((c) => {
                      const val = state.scores[c.id];
                      return (
                        <View key={c.id} style={styles.criterioCard}>
                          <Text style={styles.criterioTitulo}>{c.titulo}</Text>
                          <View style={styles.ancoras}>
                            <Text style={styles.ancora} numberOfLines={2}>
                              1 — {c.ancora1}
                            </Text>
                            <Text
                              style={[styles.ancora, { textAlign: "right" }]}
                              numberOfLines={2}
                            >
                              5 — {c.ancora5}
                            </Text>
                          </View>
                          <View style={styles.scoreRow}>
                            {[1, 2, 3, 4, 5].map((n) => {
                              const sel = val === n;
                              return (
                                <Pressable
                                  key={n}
                                  onPress={() => updateScore(c.id, n)}
                                  style={[
                                    styles.scoreBtn,
                                    {
                                      backgroundColor: sel
                                        ? dimCor
                                        : "#F3F4F6",
                                      borderColor: sel ? dimCor : "#E5E7EB",
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.scoreBtnText,
                                      { color: sel ? "#fff" : "#6B7280" },
                                    ]}
                                  >
                                    {n}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              }
            )}

            <View style={styles.scoreSummary}>
              <Text style={styles.scoreSummaryLabel}>Pontuação atual</Text>
              <Text style={styles.scoreSummaryValue}>
                {totalScore}
                <Text style={styles.scoreSummaryMax}>/60</Text>
              </Text>
            </View>

            <Pressable
              onPress={() => setStep("result")}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: WINE,
                  opacity: pressed ? 0.85 : 1,
                  marginTop: 8,
                },
              ]}
            >
              <Text style={styles.primaryBtnText}>Ver resultado →</Text>
            </Pressable>
          </View>
        )}

        {/* ─── RESULT ─── */}
        {step === "result" && (
          <View style={styles.section}>
            <View
              style={[
                styles.tierBadge,
                { borderColor: tierCfg.cor, backgroundColor: tierCfg.cor + "15" },
              ]}
            >
              <View
                style={[styles.tierDot, { backgroundColor: tierCfg.cor }]}
              />
              <Text style={[styles.tierLabel, { color: tierCfg.cor }]}>
                {tierCfg.label}
              </Text>
            </View>

            <Text style={styles.tierDesc}>{tierCfg.descricao}</Text>

            <View style={styles.scoreBarWrap}>
              <View style={styles.scoreBarBg}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      width: `${((totalScore - 12) / 48) * 100}%` as any,
                      backgroundColor: tierCfg.cor,
                    },
                  ]}
                />
              </View>
              <View style={styles.scoreBarLabels}>
                <Text style={styles.scoreBarTick}>Acesso</Text>
                <Text style={styles.scoreBarTick}>Médio</Text>
                <Text style={styles.scoreBarTick}>Premium</Text>
                <Text style={styles.scoreBarTick}>Luxo</Text>
              </View>
              <Text style={styles.scoreTotal}>
                Pontuação: {totalScore}/60
              </Text>
            </View>

            {hasPreco && precoMin !== null && precoMax !== null && (
              <View style={styles.precoCard}>
                <Text style={styles.precoCardTitle}>Faixa de preço sugerida</Text>
                <Text style={styles.precoCardSub}>
                  Baseado no seu preço atual (R${" "}
                  {parseFloat(state.precoMedioAtual.replace(",", ".")).toFixed(
                    2
                  )}) e no multiplicador do tier {tierCfg.label} (
                  {tierCfg.multiplierMin}x – {tierCfg.multiplierMax}x)
                </Text>
                <View style={styles.precoRange}>
                  <View style={styles.precoRangeItem}>
                    <Text style={styles.precoRangeLabel}>Mínimo</Text>
                    <Text style={[styles.precoRangeVal, { color: WINE }]}>
                      R$ {precoMin.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                  <View style={styles.precoRangeDivider} />
                  <View style={styles.precoRangeItem}>
                    <Text style={styles.precoRangeLabel}>Máximo</Text>
                    <Text style={[styles.precoRangeVal, { color: WINE }]}>
                      R$ {precoMax.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.estrategiaCard}>
              <Text style={styles.estrategiaTitle}>
                Estratégia recomendada
              </Text>
              <Text style={styles.estrategiaText}>{tierCfg.estrategia}</Text>
            </View>

            {state.segmento.trim() !== "" && (
              <View style={styles.contextSummary}>
                <Text style={styles.contextSummaryTitle}>
                  Resumo da análise
                </Text>
                <View style={styles.contextRow}>
                  <Text style={styles.contextKey}>Segmento</Text>
                  <Text style={styles.contextVal}>{state.segmento}</Text>
                </View>
                <View style={styles.contextRow}>
                  <Text style={styles.contextKey}>Posicionamento atual</Text>
                  <Text style={styles.contextVal}>
                    {POSICIONAMENTOS.find(
                      (p) => p.id === state.posicionamentoAtual
                    )?.label ?? "—"}
                  </Text>
                </View>
                {state.posicionamentoDesejado !== "" && (
                  <View style={styles.contextRow}>
                    <Text style={styles.contextKey}>Posicionamento desejado</Text>
                    <Text style={styles.contextVal}>
                      {POSICIONAMENTOS.find(
                        (p) => p.id === state.posicionamentoDesejado
                      )?.label ?? "—"}
                    </Text>
                  </View>
                )}
                <View style={styles.contextRow}>
                  <Text style={styles.contextKey}>Pontuação de valor</Text>
                  <Text style={styles.contextVal}>{totalScore}/60</Text>
                </View>
              </View>
            )}

            <View style={styles.resultActions}>
              <Pressable
                onPress={() => router.push("/flow-a" as any)}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.secondaryBtnText}>
                  Ver margem de um produto
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setState({ ...INITIAL_STATE });
                  setStep("context");
                }}
                style={({ pressed }) => [
                  styles.ghostBtn,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.ghostBtnText}>Nova análise</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: WINE,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Poppins_400Regular",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Poppins_400Regular",
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  progressNum: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  progressLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
  section: { gap: 12 },
  infoBox: {
    backgroundColor: YELLOW,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(200,184,64,0.4)",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#4B3520",
    fontFamily: "Poppins_400Regular",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 6,
  },
  required: { color: "#EF4444" },
  optional: {
    fontSize: 12,
    fontWeight: "400",
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  helpText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -4,
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: WINE,
    backgroundColor: "#FFFFFF",
    fontFamily: "Poppins_400Regular",
  },
  posCards: {
    gap: 8,
    marginBottom: 4,
  },
  posCard: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
  },
  posCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  posDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  posLabel: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  posDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 18,
    fontFamily: "Poppins_400Regular",
    lineHeight: 16,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
  },
  competitorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  competitorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  competitorTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
  },
  addCompBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 12,
  },
  addCompText: {
    fontSize: 13,
    color: WINE,
    fontFamily: "Poppins_500Medium",
  },
  dimGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  dimHeader: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 4,
  },
  dimLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    fontFamily: "Poppins_700Bold",
  },
  criterioCard: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  criterioTitulo: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Poppins_600SemiBold",
  },
  ancoras: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  ancora: {
    fontSize: 10,
    color: "#9CA3AF",
    flex: 1,
    lineHeight: 14,
    fontFamily: "Poppins_400Regular",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
  },
  scoreBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  scoreBtnText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  scoreSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scoreSummaryLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_500Medium",
  },
  scoreSummaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: WINE,
    fontFamily: "Poppins_700Bold",
  },
  scoreSummaryMax: {
    fontSize: 16,
    fontWeight: "400",
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
    marginBottom: 4,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  tierDesc: {
    fontSize: 18,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 26,
  },
  scoreBarWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  scoreBarBg: {
    height: 10,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 10,
    borderRadius: 6,
  },
  scoreBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreBarTick: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  scoreTotal: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "Poppins_500Medium",
  },
  precoCard: {
    backgroundColor: "#F0F4FB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(124,157,208,0.3)",
    gap: 8,
  },
  precoCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: WINE,
    fontFamily: "Poppins_700Bold",
  },
  precoCardSub: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
    fontFamily: "Poppins_400Regular",
  },
  precoRange: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  precoRangeItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  precoRangeDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(124,157,208,0.3)",
    marginHorizontal: 12,
  },
  precoRangeLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  precoRangeVal: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  estrategiaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  estrategiaTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    fontFamily: "Poppins_700Bold",
    textTransform: "uppercase",
  },
  estrategiaText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },
  contextSummary: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    gap: 8,
  },
  contextSummaryTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  contextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  contextKey: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  contextVal: {
    fontSize: 12,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
    textAlign: "right",
  },
  resultActions: {
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: BLUE,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  ghostBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  ghostBtnText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_500Medium",
  },
});
