import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  formatCurrency,
  formatPercent,
  calcMC_RS,
  calcMC_Perc,
  calcResultadoMensal,
  calcPontoEquilibrio,
} from "@/utils/calculations";
import { ICMS_DEFAULTS, CUSTO_VARIAVEL_DEFAULTS } from "@/utils/benchmarks";
import { useToolStore } from "@/store/useToolStore";

type Canal = "varejo" | "atacado" | "hibrido";

function Header() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? 67 : insets.top;
  return (
    <View
      style={[
        styles.header,
        { paddingTop: top + 8, backgroundColor: colors.wine },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>
      <Text style={styles.headerTitle}>Saúde do Negócio</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function FlowBScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [canal, setCanal] = useState<Canal | "">("");
  const [precoMedio, setPrecoMedio] = useState("");
  const [custoMedio, setCustoMedio] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [pecas, setPecas] = useState("");
  const [custoFixo, setCustoFixo] = useState("");
  const [remarcacao, setRemarcacao] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [cenarioNome, setCenarioNome] = useState("");
  const [cenarioSaved, setCenarioSaved] = useState(false);

  const { salvarCenario } = useToolStore();

  function handleSalvarCenario() {
    if (!result || !canal) return;
    const nome = cenarioNome.trim() || `Cenário ${new Date().toLocaleDateString("pt-BR")}`;
    salvarCenario({
      id: Date.now().toString(),
      nome,
      criadoEm: Date.now(),
      resultado: {
        mc_rs: result.mc_rs,
        mc_perc: result.mc_perc,
        mc_pct: result.mc_perc,
        resultado: result.resultado,
        pe_rs: result.pe_rs,
        markup: result.markup,
        custoFixoPerc: result.custoFixoPerc,
        distanciaPE: result.distanciaPE,
        faturamentoTotal: fatNum,
        precoMedioConsolidado: precoNum,
      },
      dados: {
        canal,
        precoMedio,
        custoMedio,
        faturamento,
        custoFixo,
        icms: String(icmsDefault),
        custoVariavel: String(custoVarDefault),
      },
    });
    setCenarioSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const icmsDefault = canal ? ICMS_DEFAULTS[canal as string] ?? 10 : 10;
  const custoVarDefault = canal ? CUSTO_VARIAVEL_DEFAULTS[canal as string] ?? 11.5 : 11.5;

  const precoNum = parseFloat(precoMedio.replace(",", ".")) || 0;
  const custoNum = parseFloat(custoMedio.replace(",", ".")) || 0;
  const fatNum = parseFloat(faturamento.replace(",", ".")) || 0;
  const pecasNum = parseFloat(pecas.replace(",", ".")) || 0;
  const custoFixoNum = parseFloat(custoFixo.replace(",", ".")) || 0;
  const remarcacaoNum = parseFloat(remarcacao.replace(",", ".")) || 0;

  const canCalculate =
    precoNum > 0 && custoNum > 0 && fatNum > 0 && canal !== "" && custoFixoNum > 0;

  const result = useMemo(() => {
    if (!canCalculate || !canal) return null;
    const mc_rs = calcMC_RS(precoNum, custoNum, icmsDefault, custoVarDefault);
    const mc_perc = calcMC_Perc(mc_rs, precoNum);
    const resultado = calcResultadoMensal(fatNum, mc_perc, custoFixoNum);
    const pe_rs = calcPontoEquilibrio(custoFixoNum, mc_perc);
    const markup = custoNum > 0 ? precoNum / custoNum : null;
    const custoFixoPerc = fatNum > 0 ? (custoFixoNum / fatNum) * 100 : 0;
    const distanciaPE = pe_rs ? ((fatNum - pe_rs) / pe_rs) * 100 : null;
    return { mc_rs, mc_perc, resultado, pe_rs, markup, custoFixoPerc, distanciaPE };
  }, [canCalculate, precoNum, custoNum, fatNum, custoFixoNum, canal, icmsDefault, custoVarDefault]);

  function handleCalcular() {
    if (!canCalculate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowResult(true);
  }

  const resultadoStatus: "ok" | "warning" | "critical" =
    !result ? "ok" :
    result.resultado > 0 ? "ok" :
    result.resultado < -fatNum * 0.05 ? "critical" : "warning";

  const mcStatus: "ok" | "warning" | "critical" =
    !result ? "ok" :
    result.mc_perc >= 42 ? "ok" :
    result.mc_perc < 30 ? "critical" : "warning";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form */}
        <View style={styles.card}>
          <View style={[styles.cardTopBar, { backgroundColor: "#2F1B20" }]} />

          {/* Canal */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Canal principal <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {(["varejo", "atacado", "hibrido"] as Canal[]).map((opt) => (
                <Pressable
                  key={opt}
                  style={[
                    styles.toggleBtn,
                    canal === opt && styles.toggleBtnActive,
                  ]}
                  onPress={() => setCanal(opt)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      canal === opt && styles.toggleTextActive,
                    ]}
                  >
                    {opt === "varejo" ? "Varejo" : opt === "atacado" ? "Atacado" : "Híbrido"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <SectionHeader title="Sua coleção" />

          {/* Preço médio */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Preço médio da coleção <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={precoMedio}
                onChangeText={setPrecoMedio}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Custo médio */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Custo médio da venda <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={custoMedio}
                onChangeText={setCustoMedio}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Faturamento */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Faturamento mensal <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={faturamento}
                onChangeText={setFaturamento}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Peças vendidas */}
          <View style={styles.field}>
            <Text style={styles.label}>Peças vendidas / mês</Text>
            <TextInput
              style={[styles.input, { textAlign: "right" }]}
              value={pecas}
              onChangeText={setPecas}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>

          <SectionHeader title="Seus custos" />

          {/* Custo fixo */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Total de despesas fixas <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={custoFixo}
                onChangeText={setCustoFixo}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
            <Text style={styles.hint}>
              Aluguel, salários, energia, sistema, etc.
            </Text>
          </View>

          {/* Remarcação */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Desconto médio aplicado{" "}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={remarcacao}
                onChangeText={setRemarcacao}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
              <View style={styles.suffix}>
                <Text style={styles.suffixText}>%</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.btn,
              !canCalculate && styles.btnDisabled,
              { backgroundColor: "#2F1B20" },
            ]}
            onPress={handleCalcular}
            disabled={!canCalculate}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Calcular resultado</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {showResult && result && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={[styles.cardTopBar, { backgroundColor: "#2F1B20" }]} />

            {/* Key metrics */}
            <View style={styles.metricsGrid}>
              <MetricCard
                label="Margem de Contribuição"
                value={formatPercent(result.mc_perc)}
                sub={formatCurrency(result.mc_rs) + " / peça"}
                status={mcStatus}
              />
              <MetricCard
                label="Resultado Estimado"
                value={formatCurrency(result.resultado)}
                sub="por mês"
                status={resultadoStatus}
              />
            </View>

            <View style={styles.metricsList}>
              {result.pe_rs != null && (
                <View style={styles.metricsRow}>
                  <Text style={styles.metricsLabel}>Ponto de equilíbrio</Text>
                  <Text style={styles.metricsValue}>{formatCurrency(result.pe_rs)}</Text>
                </View>
              )}
              {result.distanciaPE != null && (
                <View style={styles.metricsRow}>
                  <Text style={styles.metricsLabel}>Distância do PE</Text>
                  <Text
                    style={[
                      styles.metricsValue,
                      {
                        color:
                          result.distanciaPE > 0
                            ? "#2D6A4F"
                            : result.distanciaPE < -10
                            ? "#991B1B"
                            : "#B45309",
                      },
                    ]}
                  >
                    {result.distanciaPE > 0 ? "+" : ""}
                    {formatPercent(result.distanciaPE)} acima do PE
                  </Text>
                </View>
              )}
              {result.markup != null && (
                <View style={styles.metricsRow}>
                  <Text style={styles.metricsLabel}>Markup praticado</Text>
                  <Text style={styles.metricsValue}>
                    {result.markup.toFixed(2)}x
                  </Text>
                </View>
              )}
              <View style={styles.metricsRow}>
                <Text style={styles.metricsLabel}>Custo fixo / faturamento</Text>
                <Text
                  style={[
                    styles.metricsValue,
                    { color: result.custoFixoPerc > 35 ? "#B45309" : "#2D6A4F" },
                  ]}
                >
                  {formatPercent(result.custoFixoPerc)}
                </Text>
              </View>
            </View>

            {/* Diagnosis */}
            <View
              style={[
                styles.diagCard,
                {
                  backgroundColor:
                    resultadoStatus === "critical"
                      ? "#FEF2F2"
                      : resultadoStatus === "warning"
                      ? "#FFFBEB"
                      : "#F6F1AF",
                  borderColor:
                    resultadoStatus === "critical"
                      ? "rgba(153,27,27,0.15)"
                      : resultadoStatus === "warning"
                      ? "rgba(180,83,9,0.15)"
                      : "rgba(47,27,32,0.15)",
                },
              ]}
            >
              <Text style={styles.diagTitle}>
                {resultadoStatus === "critical"
                  ? "Negócio operando no prejuízo"
                  : resultadoStatus === "warning"
                  ? "Resultado próximo do limite"
                  : "Negócio com resultado positivo"}
              </Text>
              <Text style={styles.diagBody}>
                {resultadoStatus === "critical"
                  ? `Resultado estimado de ${formatCurrency(result.resultado)}/mês. Para equilibrar, aumente o faturamento ou reduza despesas fixas.`
                  : resultadoStatus === "warning"
                  ? `Resultado de ${formatCurrency(result.resultado)}/mês — margem de segurança baixa. Pequenas variações podem gerar prejuízo.`
                  : `Resultado estimado de ${formatCurrency(result.resultado)}/mês. Continue monitorando a margem e a estrutura de custos.`}
              </Text>
            </View>

            {/* Save scenario */}
            {!cenarioSaved ? (
              <View style={styles.saveScenarioBox}>
                <Text style={styles.saveScenarioLabel}>Nome do cenário (opcional)</Text>
                <TextInput
                  style={styles.saveScenarioInput}
                  value={cenarioNome}
                  onChangeText={setCenarioNome}
                  placeholder="Ex: Cenário pessimista, Mês de julho..."
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#065F46" }]}
                  onPress={handleSalvarCenario}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnText}>💾 Salvar este cenário</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.btn, { marginTop: 8, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" }]}>
                <Text style={[styles.btnText, { color: "#065F46" }]}>✓ Cenário "{cenarioNome || `Cenário ${new Date().toLocaleDateString("pt-BR")}`}" salvo!</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#7C9DD0", marginTop: 8 }]}
              onPress={() => router.push("/flow-a" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>→ Ver margem de um produto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#4A2B33", marginTop: 8 }]}
              onPress={() => router.push("/flow-mix" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>→ Otimizar mix de portfólio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "#7C9DD0", marginTop: 8 }]}
              onPress={() => router.push("/flow-compare" as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, { color: "#7C9DD0" }]}>→ Comparar cenários</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowResult(false);
                setFaturamento("");
                setCustoFixo("");
                setPrecoMedio("");
                setCustoMedio("");
                setPecas("");
                setRemarcacao("");
                setCanal("");
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetText}>Nova análise</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MetricCard({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub: string;
  status: "ok" | "warning" | "critical";
}) {
  const bg =
    status === "critical" ? "#FEF2F2" : status === "warning" ? "#FFFBEB" : "#ECFDF5";
  const color =
    status === "critical" ? "#991B1B" : status === "warning" ? "#B45309" : "#2D6A4F";
  return (
    <View style={[metricStyles.card, { backgroundColor: bg }]}>
      <Text style={[metricStyles.value, { color }]}>{value}</Text>
      <Text style={metricStyles.label}>{label}</Text>
      <Text style={metricStyles.sub}>{sub}</Text>
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  value: {
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  label: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  sub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { width: 36, alignItems: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#2F1B20",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopBar: { height: 3 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#2F1B20",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Poppins_700Bold",
  },
  field: { paddingHorizontal: 16, paddingTop: 12 },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#2F1B20",
    marginBottom: 6,
    fontFamily: "Poppins_600SemiBold",
  },
  optional: { fontWeight: "400" as const, color: "#9CA3AF", fontFamily: "Poppins_400Regular" },
  required: { color: "#DC2626" },
  hint: { fontSize: 12, color: "#9CA3AF", marginTop: 4, fontFamily: "Poppins_400Regular" },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#2F1B20",
    fontFamily: "Poppins_400Regular",
    backgroundColor: "#FFFFFF",
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  inputFlex: { flex: 1, borderRadius: 0 },
  prefix: {
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: "#D1D5DB",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  prefixText: { fontSize: 14, color: "#6B7280", fontFamily: "Poppins_400Regular" },
  suffix: {
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: "#D1D5DB",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  suffixText: { fontSize: 14, color: "#6B7280", fontFamily: "Poppins_400Regular" },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
  },
  toggleBtnActive: { borderColor: "#2F1B20", backgroundColor: "rgba(47,27,32,0.06)" },
  toggleText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  toggleTextActive: {
    color: "#2F1B20",
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metricsList: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  metricsLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  metricsValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  diagCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  diagTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2F1B20",
    marginBottom: 4,
    fontFamily: "Poppins_600SemiBold",
  },
  diagBody: {
    fontSize: 13,
    color: "#4B3520",
    lineHeight: 19,
    fontFamily: "Poppins_400Regular",
  },
  resetBtn: { alignItems: "center", paddingVertical: 12, marginBottom: 4 },
  resetText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  saveScenarioBox: {
    marginTop: 16,
    gap: 8,
  },
  saveScenarioLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  saveScenarioInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Poppins_400Regular",
  },
});
