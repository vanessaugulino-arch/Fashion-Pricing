import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
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
  calcMargemBrutaRS,
  calcMargemBrutaPerc,
  calcMarkup,
  calcPrecoMinViavel,
  getMargemStatus,
  getMargemDiagnosis,
} from "@/utils/calculations";
import {
  SEGMENTOS,
  ICMS_DEFAULTS,
  getBenchmarkMargem,
} from "@/utils/benchmarks";
import { useToolStore } from "@/store/useToolStore";

type Canal = "varejo" | "atacado";

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
      <Text style={styles.headerTitle}>Margem do Produto</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    excellent: { label: "Acima da média", bg: "#EFF6FF", color: "#1D4ED8" },
    ok:        { label: "Dentro da média", bg: "#ECFDF5", color: "#2D6A4F" },
    warning:   { label: "Abaixo da média", bg: "#FFFBEB", color: "#B45309" },
    critical:  { label: "Muito abaixo",    bg: "#FEF2F2", color: "#991B1B" },
  };
  const m = map[status] ?? map.ok;
  return (
    <View style={[styles.badge, { backgroundColor: m.bg }]}>
      <Text style={[styles.badgeText, { color: m.color }]}>{m.label}</Text>
    </View>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  const positive = delta >= 0;
  const bg = positive ? "#ECFDF5" : "#FEF2F2";
  const color = positive ? "#065F46" : "#991B1B";
  const sign = positive ? "+" : "";
  return (
    <View style={[styles.deltaBadge, { backgroundColor: bg }]}>
      <Text style={[styles.deltaBadgeText, { color }]}>
        {sign}{delta.toFixed(1)}pp
      </Text>
    </View>
  );
}

function BenchmarkBar({
  min,
  max,
  originalPct,
  simPct,
}: {
  min: number;
  max: number;
  originalPct: number;
  simPct: number;
}) {
  const RANGE_MAX = Math.max(max * 1.6, simPct * 1.2, originalPct * 1.2, 60);

  const toPos = (val: number) =>
    Math.min(Math.max((val / RANGE_MAX) * 100, 0), 100);

  const benchLeft = toPos(min);
  const benchWidth = toPos(max) - benchLeft;
  const origLeft = toPos(originalPct);
  const simLeft = toPos(simPct);

  return (
    <View style={styles.benchBarWrap}>
      <View style={styles.benchTrack}>
        {/* Benchmark range highlight */}
        <View
          style={[
            styles.benchRange,
            { left: `${benchLeft}%` as any, width: `${benchWidth}%` as any },
          ]}
        />
        {/* Original position dot */}
        <View
          style={[
            styles.benchDotOrig,
            { left: `${origLeft}%` as any },
          ]}
        />
        {/* Simulated position dot */}
        <View
          style={[
            styles.benchDotSim,
            { left: `${simLeft}%` as any },
          ]}
        />
      </View>
      <View style={styles.benchLegendRow}>
        <View style={styles.benchLegendItem}>
          <View style={[styles.benchLegendDot, { backgroundColor: "#94A3B8" }]} />
          <Text style={styles.benchLegendText}>Original</Text>
        </View>
        <View style={styles.benchLegendItem}>
          <View style={[styles.benchLegendDot, { backgroundColor: "#7C9DD0" }]} />
          <Text style={styles.benchLegendText}>Simulado</Text>
        </View>
        <View style={styles.benchLegendItem}>
          <View style={[styles.benchLegendRange]} />
          <Text style={styles.benchLegendText}>
            Referência {min}%–{max}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function FlowAScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [nomeProduto, setNomeProduto] = useState("");
  const [segmento, setSegmento] = useState("");
  const [canal, setCanal] = useState<Canal | "">("");
  const [preco, setPreco] = useState("");
  const [custo, setCusto] = useState("");
  const [icms, setIcms] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showSegPicker, setShowSegPicker] = useState(false);
  const [productSaved, setProductSaved] = useState(false);

  // Simulator state
  const [simPrecoStr, setSimPrecoStr] = useState("");
  const [simMargemStr, setSimMargemStr] = useState("");

  const { salvarProduto } = useToolStore();

  const precoNum = parseFloat(preco.replace(",", ".")) || 0;
  const custoNum = parseFloat(custo.replace(",", ".")) || 0;
  const icmsDefault = canal === "atacado" ? ICMS_DEFAULTS.atacado : ICMS_DEFAULTS.varejo;
  const icmsNum = icms !== "" ? parseFloat(icms.replace(",", ".")) : icmsDefault;

  const canSimulate =
    precoNum > custoNum && precoNum > 0 && custoNum > 0 && segmento !== "" && canal !== "";

  const result = useMemo(() => {
    if (!canSimulate || !canal) return null;
    const margemRS = calcMargemBrutaRS(precoNum, custoNum, icmsNum);
    const margemPct = calcMargemBrutaPerc(precoNum, margemRS);
    const markup = calcMarkup(precoNum, custoNum);
    const precoMin = calcPrecoMinViavel(custoNum, icmsNum);
    const [min, max] = getBenchmarkMargem(segmento, canal as Canal);
    const status = getMargemStatus(margemPct, min, max);
    const segLabel = SEGMENTOS.find((s) => s.value === segmento)?.label ?? "";
    const diagnosis = getMargemDiagnosis(margemPct, min, max, segLabel);
    return { margemRS, margemPct, markup, precoMin, min, max, status, diagnosis };
  }, [canSimulate, precoNum, custoNum, icmsNum, segmento, canal]);

  // Initialize simulator fields when result first appears
  useEffect(() => {
    if (showResult && result) {
      setSimPrecoStr(precoNum.toFixed(2).replace(".", ","));
      setSimMargemStr(result.margemPct.toFixed(1).replace(".", ","));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult]);

  // Derived simulated values from simPrecoStr
  const simPrecoNum = parseFloat(simPrecoStr.replace(",", ".")) || 0;
  const simResult = useMemo(() => {
    if (!result || simPrecoNum <= 0 || simPrecoNum <= custoNum) return null;
    const [min, max] = getBenchmarkMargem(segmento, canal as Canal);
    const margemRS = calcMargemBrutaRS(simPrecoNum, custoNum, icmsNum);
    const margemPct = calcMargemBrutaPerc(simPrecoNum, margemRS);
    const markup = calcMarkup(simPrecoNum, custoNum);
    const status = getMargemStatus(margemPct, min, max);
    return { margemRS, margemPct, markup, status, simPreco: simPrecoNum };
  }, [simPrecoNum, custoNum, icmsNum, segmento, canal, result]);

  function handleSimPrecoChange(text: string) {
    setSimPrecoStr(text);
    const p = parseFloat(text.replace(",", "."));
    if (p > 0 && custoNum > 0 && p > custoNum) {
      const mRS = calcMargemBrutaRS(p, custoNum, icmsNum);
      const mPct = calcMargemBrutaPerc(p, mRS);
      setSimMargemStr(mPct.toFixed(1).replace(".", ","));
    }
  }

  function handleSimMargemChange(text: string) {
    setSimMargemStr(text);
    const m = parseFloat(text.replace(",", "."));
    if (m > 0 && m < 100 && custoNum > 0) {
      const denom = 1 - (icmsNum + m) / 100;
      if (denom > 0) {
        const p = custoNum / denom;
        if (p > custoNum) {
          setSimPrecoStr(p.toFixed(2).replace(".", ","));
        }
      }
    }
  }

  const delta =
    simResult && result ? simResult.margemPct - result.margemPct : 0;
  const simIsChanged =
    result && simResult
      ? Math.abs(simResult.margemPct - result.margemPct) > 0.05
      : false;

  function handleSalvarProduto() {
    if (!result || !canal) return;
    salvarProduto({
      id: Date.now().toString(),
      nomeProduto: nomeProduto.trim() || `Produto ${new Date().toLocaleDateString("pt-BR")}`,
      segmento,
      canal: canal as "varejo" | "atacado",
      precoSimulado: simResult ? simResult.simPreco : precoNum,
      custoSimulado: custoNum,
      icmsNum,
      margemSimulada: simResult ? simResult.margemPct : result.margemPct,
      markupSimulado: (simResult ? simResult.markup : result.markup) ?? 0,
      margemRS: simResult ? simResult.margemRS : result.margemRS,
      criadoEm: Date.now(),
    });
    setProductSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  const diagBg =
    result?.status === "critical"
      ? "#FEF2F2"
      : result?.status === "warning"
      ? "#FFFBEB"
      : "#F6F1AF";
  const diagBorder =
    result?.status === "critical"
      ? "rgba(153,27,27,0.15)"
      : result?.status === "warning"
      ? "rgba(180,83,9,0.15)"
      : "rgba(47,27,32,0.15)";

  const margemColor =
    result?.status === "excellent" || result?.status === "ok"
      ? colors.statusOk
      : result?.status === "critical"
      ? colors.statusCritical
      : colors.statusWarning;

  const simMargemColor = simResult
    ? simResult.status === "excellent" || simResult.status === "ok"
      ? colors.statusOk
      : simResult.status === "critical"
      ? colors.statusCritical
      : colors.statusWarning
    : margemColor;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header />

      {/* Segment Picker Modal */}
      <Modal visible={showSegPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o segmento</Text>
              <Pressable onPress={() => setShowSegPicker(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color="#2F1B20" />
              </Pressable>
            </View>
            <ScrollView>
              {SEGMENTOS.map((s) => (
                <Pressable
                  key={s.value}
                  style={[
                    styles.segOption,
                    segmento === s.value && styles.segOptionSelected,
                  ]}
                  onPress={() => {
                    setSegmento(s.value);
                    setShowSegPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.segOptionText,
                      segmento === s.value && styles.segOptionTextSelected,
                    ]}
                  >
                    {s.label}
                  </Text>
                  {segmento === s.value && (
                    <Ionicons name="checkmark" size={18} color="#7C9DD0" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardTopBar} />

          {/* Product name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Nome do produto{" "}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={nomeProduto}
              onChangeText={setNomeProduto}
              placeholder="Ex: Blazer Curto Verde"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Segment */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Segmento <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              style={styles.select}
              onPress={() => setShowSegPicker(true)}
            >
              <Text
                style={[
                  styles.selectText,
                  !segmento && { color: "#9CA3AF" },
                ]}
              >
                {segmento
                  ? SEGMENTOS.find((s) => s.value === segmento)?.label
                  : "Selecione o segmento…"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Canal */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Canal de venda <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.toggle}>
              {(["varejo", "atacado"] as Canal[]).map((opt) => (
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
                    {opt === "varejo" ? "Varejo" : "Atacado"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Preço de venda <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>R$</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={preco}
                onChangeText={setPreco}
                placeholder="0,00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
            </View>
          </View>

          {/* Cost */}
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

          {/* ICMS */}
          <View style={styles.field}>
            <Text style={styles.label}>
              ICMS na venda <Text style={styles.optional}>(opcional)</Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={icms}
                onChangeText={setIcms}
                placeholder={String(icmsDefault)}
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                textAlign="right"
              />
              <View style={styles.suffix}>
                <Text style={styles.suffixText}>%</Text>
              </View>
            </View>
            {canal !== "" && icms === "" && (
              <Text style={styles.hint}>
                Usando estimativa de mercado: {icmsDefault}%
              </Text>
            )}
          </View>

          {precoNum > 0 && custoNum > 0 && precoNum <= custoNum && (
            <Text style={styles.errorMsg}>
              O preço deve ser maior que o custo.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.btn, !canSimulate && styles.btnDisabled]}
            onPress={() => {
              if (!canSimulate) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowResult(true);
              setProductSaved(false);
            }}
            disabled={!canSimulate}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Simular</Text>
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {showResult && result && (
          <View style={[styles.card, { marginTop: 16 }]}>
            <View style={[styles.cardTopBar, { backgroundColor: "#7C9DD0" }]} />

            <Text style={styles.resultLabel}>SUA MARGEM BRUTA ESTIMADA</Text>

            <View style={styles.margemRow}>
              <Text style={[styles.margemBig, { color: margemColor }]}>
                {formatPercent(result.margemPct)}
              </Text>
              <StatusBadge status={result.status} />
            </View>

            <Text style={styles.margemSub}>
              {formatCurrency(result.margemRS)} / peça
            </Text>

            {result.precoMin != null && (
              <Text style={styles.precoMin}>
                Preço mínimo viável: {formatCurrency(result.precoMin)}
              </Text>
            )}

            <View
              style={[
                styles.benchBar,
                { marginTop: 12, marginBottom: 8 },
              ]}
            >
              <Text style={styles.benchLabel}>
                Referência para {SEGMENTOS.find((s) => s.value === segmento)?.label} •{" "}
                {canal}:{" "}
                <Text style={{ fontWeight: "600" as const }}>
                  {result.min}%–{result.max}%
                </Text>
              </Text>
            </View>

            {/* Markup */}
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Markup</Text>
              <Text style={styles.metricValue}>
                {formatMultiplier(result.markup)}
              </Text>
            </View>

            {/* Diagnosis */}
            <View
              style={[
                styles.diagCard,
                {
                  backgroundColor: diagBg,
                  borderColor: diagBorder,
                  marginTop: 16,
                },
              ]}
            >
              <Text style={styles.diagTitle}>{result.diagnosis.title}</Text>
              <Text style={styles.diagBody}>{result.diagnosis.body}</Text>
            </View>

            {/* ── Price Simulator ── */}
            <View style={styles.simSection}>
              <View style={styles.simHeader}>
                <Ionicons name="calculator-outline" size={16} color="#7C9DD0" />
                <Text style={styles.simTitle}>Simulador de Preço</Text>
              </View>
              <Text style={styles.simSubtitle}>
                Ajuste o preço ou a margem e veja o impacto em tempo real.
              </Text>

              <View style={styles.simRow}>
                {/* Price field */}
                <View style={styles.simFieldWrap}>
                  <Text style={styles.simFieldLabel}>Preço (R$)</Text>
                  <View style={styles.simInputRow}>
                    <View style={styles.simPrefix}>
                      <Text style={styles.simPrefixText}>R$</Text>
                    </View>
                    <TextInput
                      style={styles.simInput}
                      value={simPrecoStr}
                      onChangeText={handleSimPrecoChange}
                      keyboardType="decimal-pad"
                      textAlign="right"
                      selectTextOnFocus
                    />
                  </View>
                </View>

                <View style={styles.simArrow}>
                  <Ionicons name="swap-horizontal" size={18} color="#9CA3AF" />
                </View>

                {/* Margin field */}
                <View style={styles.simFieldWrap}>
                  <Text style={styles.simFieldLabel}>Margem (%)</Text>
                  <View style={styles.simInputRow}>
                    <TextInput
                      style={[styles.simInput, { flex: 1, borderRadius: 0, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }]}
                      value={simMargemStr}
                      onChangeText={handleSimMargemChange}
                      keyboardType="decimal-pad"
                      textAlign="right"
                      selectTextOnFocus
                    />
                    <View style={styles.simSuffix}>
                      <Text style={styles.simSuffixText}>%</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Live result display */}
              {simResult && (
                <View style={styles.simResultBox}>
                  <View style={styles.simResultRow}>
                    <View style={styles.simResultItem}>
                      <Text style={styles.simResultItemLabel}>Margem bruta</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={[styles.simResultItemValue, { color: simMargemColor }]}>
                          {formatPercent(simResult.margemPct)}
                        </Text>
                        {simIsChanged && (
                          <DeltaBadge delta={delta} />
                        )}
                      </View>
                    </View>
                    <View style={[styles.simResultItem, { borderLeftWidth: 1, borderColor: "#F3F4F6", paddingLeft: 16 }]}>
                      <Text style={styles.simResultItemLabel}>Margem (R$)</Text>
                      <Text style={styles.simResultItemValue}>
                        {formatCurrency(simResult.margemRS)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.simResultRow, { borderTopWidth: 1, borderColor: "#F3F4F6", paddingTop: 10, marginTop: 2 }]}>
                    <View style={styles.simResultItem}>
                      <Text style={styles.simResultItemLabel}>Markup</Text>
                      <Text style={styles.simResultItemValue}>
                        {formatMultiplier(simResult.markup)}
                      </Text>
                    </View>
                    <View style={[styles.simResultItem, { borderLeftWidth: 1, borderColor: "#F3F4F6", paddingLeft: 16 }]}>
                      <Text style={styles.simResultItemLabel}>Status</Text>
                      <StatusBadge status={simResult.status} />
                    </View>
                  </View>

                  {/* Benchmark bar */}
                  <BenchmarkBar
                    min={result.min}
                    max={result.max}
                    originalPct={result.margemPct}
                    simPct={simResult.margemPct}
                  />
                </View>
              )}

              {simResult === null && simPrecoNum > 0 && simPrecoNum <= custoNum && (
                <Text style={styles.simError}>
                  O preço simulado deve ser maior que o custo ({formatCurrency(custoNum)}).
                </Text>
              )}
            </View>

            {/* Save produto */}
            {!productSaved ? (
              <TouchableOpacity
                style={[styles.btn, { marginTop: 20, backgroundColor: "#065F46" }]}
                onPress={handleSalvarProduto}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>💾 Salvar esta simulação</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.btn, { marginTop: 20, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" }]}>
                <Text style={[styles.btnText, { color: "#065F46" }]}>✓ Simulação salva!</Text>
              </View>
            )}

            {/* Navigation buttons */}
            <TouchableOpacity
              style={[styles.btn, { marginTop: 10, backgroundColor: "#2F1B20" }]}
              onPress={() => router.push("/flow-b" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>→ Analisar a saúde do negócio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnOutline, { marginTop: 10 }]}
              onPress={() => router.push("/flow-c" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>→ Descobrir o preço ideal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnOutline, { marginTop: 8 }]}
              onPress={() => router.push("/flow-export" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>→ Ver simulações salvas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowResult(false);
                setPreco("");
                setCusto("");
                setIcms("");
                setNomeProduto("");
                setSegmento("");
                setCanal("");
                setSimPrecoStr("");
                setSimMargemStr("");
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetText}>Analisar outro produto</Text>
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
  cardTopBar: {
    height: 3,
    backgroundColor: "#7C9DD0",
  },
  field: { paddingHorizontal: 16, paddingTop: 14 },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#2F1B20",
    marginBottom: 6,
    fontFamily: "Poppins_600SemiBold",
  },
  optional: {
    fontWeight: "400" as const,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  required: { color: "#DC2626" },
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
  prefixText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
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
  suffixText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  select: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  selectText: {
    fontSize: 15,
    color: "#2F1B20",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  toggle: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleBtnActive: {
    borderColor: "#7C9DD0",
    backgroundColor: "#EEF3FA",
  },
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
  hint: {
    fontSize: 12,
    color: "#7C9DD0",
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
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
    backgroundColor: "#7C9DD0",
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
  btnOutline: {
    borderWidth: 1.5,
    borderColor: "#7C9DD0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 16,
  },
  btnOutlineText: {
    color: "#7C9DD0",
    fontSize: 15,
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  resetBtn: { alignItems: "center", paddingVertical: 12, marginBottom: 4 },
  resetText: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  // Result styles
  resultLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#7C9DD0",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  margemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 12,
  },
  margemBig: {
    fontSize: 48,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  margemSub: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },
  precoMin: {
    fontSize: 13,
    color: "#6B7280",
    paddingHorizontal: 16,
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },
  benchBar: { paddingHorizontal: 16 },
  benchLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#F3F4F6",
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  metricValue: {
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
  // ── Simulator styles ──
  simSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 16,
  },
  simHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  simTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  simSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 12,
  },
  simRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  simFieldWrap: { flex: 1 },
  simFieldLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#6B7280",
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  simInputRow: { flexDirection: "row", alignItems: "center" },
  simPrefix: {
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: "#7C9DD0",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#EEF3FA",
  },
  simPrefixText: {
    fontSize: 13,
    color: "#4A6FA5",
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600" as const,
  },
  simInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#7C9DD0",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600" as const,
    backgroundColor: "#FFFFFF",
  },
  simSuffix: {
    borderWidth: 1.5,
    borderLeftWidth: 0,
    borderColor: "#7C9DD0",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "#EEF3FA",
  },
  simSuffixText: {
    fontSize: 13,
    color: "#4A6FA5",
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600" as const,
  },
  simArrow: {
    paddingBottom: 10,
    alignItems: "center",
  },
  simResultBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  simResultRow: {
    flexDirection: "row",
    paddingBottom: 10,
  },
  simResultItem: {
    flex: 1,
    gap: 4,
  },
  simResultItemLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  simResultItemValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  deltaBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deltaBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  simError: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 8,
    fontFamily: "Poppins_400Regular",
  },
  // ── Benchmark bar ──
  benchBarWrap: {
    marginTop: 12,
  },
  benchTrack: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    position: "relative",
    overflow: "visible",
    marginBottom: 14,
  },
  benchRange: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "#BBD4F0",
    borderRadius: 5,
  },
  benchDotOrig: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#94A3B8",
    top: -1,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  benchDotSim: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#7C9DD0",
    top: -3,
    marginLeft: -8,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#7C9DD0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  benchLegendRow: {
    flexDirection: "row",
    gap: 14,
    flexWrap: "wrap",
  },
  benchLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  benchLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  benchLegendRange: {
    width: 16,
    height: 8,
    borderRadius: 3,
    backgroundColor: "#BBD4F0",
  },
  benchLegendText: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  segOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  segOptionSelected: { backgroundColor: "#EEF3FA" },
  segOptionText: {
    fontSize: 15,
    color: "#2F1B20",
    fontFamily: "Poppins_400Regular",
  },
  segOptionTextSelected: {
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
});
