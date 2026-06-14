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
  formatMultiplier,
  formatPercent,
  calcPrecoIdeal,
} from "@/utils/calculations";

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
      <Text style={styles.headerTitle}>Preço Ideal</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

const MARGEM_STEPS = [20, 25, 30, 35, 40, 42, 45, 50, 55, 60];

export default function FlowCScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [custo, setCusto] = useState("");
  const [margem, setMargem] = useState(42);
  const [margemInput, setMargemInput] = useState("42");
  const [icms, setIcms] = useState("10");
  const [taxas, setTaxas] = useState("11.5");
  const [precoAtual, setPrecoAtual] = useState("");

  const custoNum = parseFloat(custo.replace(",", ".")) || 0;
  const icmsNum = parseFloat(icms.replace(",", ".")) || 10;
  const taxasNum = parseFloat(taxas.replace(",", ".")) || 11.5;
  const precoAtualNum = parseFloat(precoAtual.replace(",", ".")) || 0;

  const somaTotal = icmsNum + taxasNum + margem;
  const isInvalid = somaTotal >= 100;
  const hasResult = custoNum > 0 && !isInvalid;

  const result = useMemo(() => {
    if (!hasResult) return null;
    const precoIdeal = calcPrecoIdeal(custoNum, icmsNum, taxasNum, margem);
    if (!precoIdeal) return null;
    const markup = precoIdeal / custoNum;
    const margemRs = precoIdeal * (margem / 100);
    const impostosRs = precoIdeal * ((icmsNum + taxasNum) / 100);
    const custoPct = (custoNum / precoIdeal) * 100;
    const impostosPct = icmsNum + taxasNum;
    return { precoIdeal, markup, margemRs, impostosRs, custoPct, impostosPct };
  }, [custoNum, icmsNum, taxasNum, margem, hasResult]);

  const margemComparacao = useMemo(() => {
    if (!precoAtualNum || !custoNum || !result) return null;
    const margemAtual = ((precoAtualNum - custoNum - precoAtualNum * ((icmsNum + taxasNum) / 100)) / precoAtualNum) * 100;
    const diff = result.precoIdeal - precoAtualNum;
    return { margemAtual, diff };
  }, [precoAtualNum, custoNum, result, icmsNum, taxasNum]);

  function handleMargemStep(val: number) {
    const clamped = Math.min(80, Math.max(1, val));
    setMargem(clamped);
    setMargemInput(String(clamped));
    Haptics.selectionAsync();
  }

  function handleMargemInput(text: string) {
    setMargemInput(text);
    const val = parseFloat(text);
    if (!isNaN(val) && val >= 0 && val <= 80) {
      setMargem(val);
    }
  }

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
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            O preço ideal é calculado para que, após todos os custos, sobre
            exatamente a margem que você precisa.
          </Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <View style={[styles.cardTopBar, { backgroundColor: "#C8B840" }]} />

          {/* Custo */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Custo do produto <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={custo}
                onChangeText={setCusto}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Margem desejada — step picker */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Margem desejada <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.margemInputBox}>
                <TextInput
                  style={styles.margemInput}
                  value={margemInput}
                  onChangeText={handleMargemInput}
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
                <Text style={styles.margemPct}>%</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {MARGEM_STEPS.map((step) => (
                <Pressable
                  key={step}
                  style={[
                    styles.stepBtn,
                    Math.round(margem) === step && styles.stepBtnActive,
                  ]}
                  onPress={() => handleMargemStep(step)}
                >
                  <Text
                    style={[
                      styles.stepText,
                      Math.round(margem) === step && styles.stepTextActive,
                    ]}
                  >
                    {step}%
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* ICMS */}
          <View style={styles.field}>
            <Text style={styles.label}>ICMS</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={icms}
                onChangeText={setIcms}
                placeholder="10"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
              <View style={styles.suffix}>
                <Text style={styles.suffixText}>%</Text>
              </View>
            </View>
          </View>

          {/* Taxas */}
          <View style={styles.field}>
            <Text style={styles.label}>Taxas + comissões</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={taxas}
                onChangeText={setTaxas}
                placeholder="11,5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
              <View style={styles.suffix}>
                <Text style={styles.suffixText}>%</Text>
              </View>
            </View>
            <Text style={styles.hint}>Default: 11,5% varejo · 7% atacado</Text>
          </View>

          {/* Preço atual (opcional) */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Preço atual praticado{" "}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={precoAtual}
                onChangeText={setPrecoAtual}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {isInvalid && (
            <Text style={styles.errorMsg}>
              A soma de ICMS + taxas + margem não pode ser ≥ 100%.
            </Text>
          )}
        </View>

        {/* Result */}
        {hasResult && result && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={[styles.cardTopBar, { backgroundColor: "#C8B840" }]} />

            <Text style={styles.resultLabel}>
              PREÇO IDEAL PARA {formatPercent(margem, 0)} DE MARGEM
            </Text>
            <Text style={styles.precoIdeal}>{formatCurrency(result.precoIdeal)}</Text>
            <Text style={styles.markupSub}>
              Markup equivalente: {formatMultiplier(result.markup)}
            </Text>

            {/* Breakdown */}
            <View style={styles.breakdown}>
              <Text style={styles.breakdownTitle}>COMPOSIÇÃO DO PREÇO</Text>
              {[
                { label: "Custo do produto", value: custoNum, pct: result.custoPct },
                { label: "ICMS + Taxas", value: result.impostosRs, pct: result.impostosPct },
                { label: "Margem de contribuição", value: result.margemRs, pct: margem },
              ].map((item, i) => (
                <View key={i} style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <View style={styles.breakdownRight}>
                    <Text style={styles.breakdownPct}>{formatPercent(item.pct)}</Text>
                    <Text style={styles.breakdownValue}>{formatCurrency(item.value)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Comparação */}
            {margemComparacao && precoAtualNum > 0 && (
              <View style={styles.compCard}>
                <View style={styles.compRow}>
                  <Text style={styles.compLabel}>Preço atual</Text>
                  <View style={styles.compValues}>
                    <Text style={styles.compValue}>{formatCurrency(precoAtualNum)}</Text>
                    <Text style={styles.compMargem}>
                      → Margem real: {formatPercent(margemComparacao.margemAtual)}
                    </Text>
                  </View>
                </View>
                <View style={styles.compRow}>
                  <Text style={styles.compLabel}>Preço ideal</Text>
                  <View style={styles.compValues}>
                    <Text style={[styles.compValue, { color: "#2D6A4F" }]}>
                      {formatCurrency(result.precoIdeal)}
                    </Text>
                    <Text style={styles.compMargem}>
                      → Margem: {formatPercent(margem)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.compDiff}>
                  Diferença:{" "}
                  {margemComparacao.diff >= 0 ? "+" : ""}
                  {formatCurrency(margemComparacao.diff)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: "#2F1B20", marginTop: 16 }]}
              onPress={() => router.push("/flow-a" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>→ Verificar margem de um produto</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
  infoBanner: {
    backgroundColor: "#F6F1AF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200,184,64,0.5)",
    padding: 14,
    marginBottom: 14,
  },
  infoText: {
    fontSize: 13,
    color: "#4B3520",
    lineHeight: 19,
    fontFamily: "Poppins_400Regular",
  },
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
  cardTopBar: { height: 3, backgroundColor: "#7C9DD0" },
  field: { paddingHorizontal: 16, paddingTop: 14 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  margemInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#C8B840",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
    width: 72,
  },
  margemInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_700Bold",
    textAlign: "right",
  },
  margemPct: { fontSize: 13, color: "#6B7280", fontFamily: "Poppins_400Regular" },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  stepBtnActive: { borderColor: "#C8B840", backgroundColor: "#F6F1AF" },
  stepText: { fontSize: 14, color: "#6B7280", fontFamily: "Poppins_400Regular" },
  stepTextActive: {
    color: "#2F1B20",
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  errorMsg: {
    fontSize: 12,
    color: "#DC2626",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontFamily: "Poppins_400Regular",
  },
  btn: {
    backgroundColor: "#C8B840",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  // Result styles
  resultLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#C8B840",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  precoIdeal: {
    fontSize: 44,
    fontWeight: "700" as const,
    color: "#2F1B20",
    paddingHorizontal: 16,
    marginTop: 4,
    fontFamily: "Poppins_700Bold",
  },
  markupSub: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  breakdown: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#9CA3AF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#F9FAFB",
    fontFamily: "Poppins_700Bold",
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  breakdownLabel: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
    fontFamily: "Poppins_400Regular",
  },
  breakdownRight: { flexDirection: "row", gap: 12, alignItems: "center" },
  breakdownPct: {
    fontSize: 12,
    color: "#9CA3AF",
    width: 40,
    textAlign: "right",
    fontFamily: "Poppins_400Regular",
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#2F1B20",
    width: 80,
    textAlign: "right",
    fontFamily: "Poppins_600SemiBold",
  },
  compCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 4,
  },
  compRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  compLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  compValues: { alignItems: "flex-end" },
  compValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  compMargem: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
  compDiff: {
    fontSize: 13,
    color: "#2F1B20",
    fontWeight: "600" as const,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "Poppins_600SemiBold",
  },
});
