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
const BG = "#F2F2F2";

const PERFIS = [
  {
    id: "luxo",
    label: "Alta Moda / Luxo",
    desc: "Alto apelo de design, público selecionado, preços elevados.",
  },
  {
    id: "contemporanea",
    label: "Moda Contemporânea",
    desc: "Equilíbrio entre moda e acessibilidade, segmento médio-alto.",
  },
  {
    id: "basico",
    label: "Básico / Casual",
    desc: "Foco em uso diário, praticidade, público amplo, preços médios.",
  },
  {
    id: "acessivel",
    label: "Acessível / Popular",
    desc: "Volume alto, preços de entrada, grande capilaridade.",
  },
];

const MIX_DEFAULTS: Record<string, { icone: number; sustentador: number; motorGiro: number; portaEntrada: number }> = {
  luxo:          { icone: 15, sustentador: 30, motorGiro: 45, portaEntrada: 10 },
  contemporanea: { icone: 10, sustentador: 30, motorGiro: 48, portaEntrada: 12 },
  basico:        { icone:  7, sustentador: 33, motorGiro: 45, portaEntrada: 15 },
  acessivel:     { icone:  5, sustentador: 35, motorGiro: 42, portaEntrada: 18 },
};

const PAPEIS_META: Record<string, { label: string; cor: string; margem: number; remarcacao: number }> = {
  icone:        { label: "Ícone de Marca",        cor: WINE,      margem: 38, remarcacao: 38 },
  sustentador:  { label: "Sustentador de Margem", cor: BLUE,      margem: 60, remarcacao:  5 },
  motorGiro:    { label: "Motor de Giro",          cor: "#6B7280", margem: 50, remarcacao: 18 },
  portaEntrada: { label: "Porta de Entrada",       cor: "#C8B840", margem: 44, remarcacao: 10 },
};

type PapelKey = "icone" | "sustentador" | "motorGiro" | "portaEntrada";

interface PapelState {
  participacao: number;
  margem: number;
  remarcacao: number;
}

function calcMix(
  papeis: Record<PapelKey, PapelState>,
  faturamentoTotal: number,
  custoFixo: number
) {
  let mc_total_rs = 0;
  let faturamento_mix_total = 0;
  const detalhes: Record<string, { mc_rs: number; faturamento_realizado: number }> = {};
  (Object.entries(papeis) as [PapelKey, PapelState][]).forEach(([key, papel]) => {
    const faturamento_bruto = (papel.participacao / 100) * faturamentoTotal;
    const faturamento_realizado = faturamento_bruto * (1 - papel.remarcacao / 100);
    const mc_rs = faturamento_realizado * (papel.margem / 100);
    mc_total_rs += mc_rs;
    faturamento_mix_total += faturamento_realizado;
    detalhes[key] = { mc_rs, faturamento_realizado };
  });
  const mc_ponderada = faturamento_mix_total > 0 ? (mc_total_rs / faturamento_mix_total) * 100 : 0;
  const resultado = mc_total_rs - custoFixo;
  return { mc_ponderada, resultado, mc_total_rs };
}

function fmt(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtPct(v: number): string {
  return v.toFixed(1) + "%";
}

const PAPEIS_ORDER: PapelKey[] = ["icone", "sustentador", "motorGiro", "portaEntrada"];

export default function FlowMixScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [perfil, setPerfil] = useState<string | null>(null);
  const [papeis, setPapeis] = useState<Record<PapelKey, PapelState>>({
    icone:        { participacao: 10, margem: 38, remarcacao: 38 },
    sustentador:  { participacao: 30, margem: 60, remarcacao:  5 },
    motorGiro:    { participacao: 48, margem: 50, remarcacao: 18 },
    portaEntrada: { participacao: 12, margem: 44, remarcacao: 10 },
  });
  const [faturamento, setFaturamento] = useState("100000");
  const [custoFixo, setCustoFixo] = useState("20000");

  const selectPerfil = (id: string) => {
    setPerfil(id);
    const d = MIX_DEFAULTS[id];
    setPapeis((prev) => ({
      icone:        { ...prev.icone,        participacao: d.icone },
      sustentador:  { ...prev.sustentador,  participacao: d.sustentador },
      motorGiro:    { ...prev.motorGiro,    participacao: d.motorGiro },
      portaEntrada: { ...prev.portaEntrada, participacao: d.portaEntrada },
    }));
  };

  const updatePapel = (key: PapelKey, field: keyof PapelState, raw: string) => {
    const val = parseFloat(raw.replace(",", ".")) || 0;
    setPapeis((prev) => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  const fatNum = parseFloat(faturamento.replace(",", ".")) || 0;
  const cfNum = parseFloat(custoFixo.replace(",", ".")) || 0;
  const sumPart = PAPEIS_ORDER.reduce((acc, k) => acc + papeis[k].participacao, 0);
  const validSum = Math.abs(sumPart - 100) < 0.5;

  const { mc_ponderada, resultado } = calcMix(papeis, fatNum, cfNum);

  if (!perfil) {
    return (
      <View style={[styles.root, { backgroundColor: BG }]}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Mix de Portfólio</Text>
          <Text style={styles.headerSub}>
            Otimize o mix da sua coleção
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPad + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Qual é o posicionamento da sua marca?
          </Text>
          <Text style={styles.sectionSub}>
            Cada produto tem um papel estratégico — o perfil define as
            participações sugeridas.
          </Text>
          <View style={styles.perfilCards}>
            {PERFIS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => selectPerfil(p.id)}
                style={({ pressed }) => [
                  styles.perfilCard,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.perfilLabel}>{p.label}</Text>
                <Text style={styles.perfilDesc}>{p.desc}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => setPerfil(null)} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Simulador de Mix</Text>
        <Text style={styles.headerSub}>
          {PERFIS.find((p) => p.id === perfil)?.label}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Reference inputs */}
        <View style={styles.refCard}>
          <Text style={styles.refTitle}>Base de referência</Text>
          <View style={styles.refRow}>
            <View style={styles.refField}>
              <Text style={styles.label}>Faturamento mensal (R$)</Text>
              <TextInput
                style={styles.input}
                value={faturamento}
                onChangeText={setFaturamento}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.refField}>
              <Text style={styles.label}>Custo fixo mensal (R$)</Text>
              <TextInput
                style={styles.input}
                value={custoFixo}
                onChangeText={setCustoFixo}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Sum warning */}
        {!validSum && (
          <View style={styles.warnBox}>
            <Text style={styles.warnText}>
              A soma das participações precisa ser 100% (atual: {sumPart.toFixed(0)}%)
            </Text>
          </View>
        )}

        {/* Papeis */}
        {PAPEIS_ORDER.map((key) => {
          const meta = PAPEIS_META[key];
          const p = papeis[key];
          return (
            <View
              key={key}
              style={[styles.papelCard, { borderTopColor: meta.cor }]}
            >
              <View style={styles.papelHeader}>
                <View
                  style={[styles.papelDot, { backgroundColor: meta.cor }]}
                />
                <Text style={styles.papelLabel}>{meta.label}</Text>
              </View>
              <View style={styles.papelFields}>
                <View style={styles.papelField}>
                  <Text style={styles.label}>Participação %</Text>
                  <TextInput
                    style={styles.input}
                    value={String(p.participacao)}
                    onChangeText={(v) => updatePapel(key, "participacao", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.papelField}>
                  <Text style={styles.label}>Margem %</Text>
                  <TextInput
                    style={styles.input}
                    value={String(p.margem)}
                    onChangeText={(v) => updatePapel(key, "margem", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.papelField}>
                  <Text style={styles.label}>Remarcação %</Text>
                  <TextInput
                    style={styles.input}
                    value={String(p.remarcacao)}
                    onChangeText={(v) => updatePapel(key, "remarcacao", v)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Results */}
        {validSum && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Resultado do mix</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Margem ponderada</Text>
                <Text
                  style={[
                    styles.metricValue,
                    {
                      color:
                        mc_ponderada >= 40
                          ? "#065F46"
                          : mc_ponderada >= 25
                          ? "#B45309"
                          : "#991B1B",
                    },
                  ]}
                >
                  {fmtPct(mc_ponderada)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Resultado projetado</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: resultado >= 0 ? "#065F46" : "#991B1B" },
                  ]}
                >
                  {fmt(resultado)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => router.push("/flow-b" as any)}
          style={({ pressed }) => [
            styles.btn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.btnText}>← Ver resultado do negócio</Text>
        </Pressable>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
  perfilCards: { gap: 10 },
  perfilCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  perfilLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 4,
  },
  perfilDesc: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  refCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  refTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
  },
  refRow: { flexDirection: "row", gap: 10 },
  refField: { flex: 1 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: WINE,
    backgroundColor: "#FAFAFA",
    fontFamily: "Poppins_400Regular",
  },
  warnBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warnText: {
    fontSize: 13,
    color: "#991B1B",
    fontFamily: "Poppins_500Medium",
  },
  papelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  papelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  papelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  papelLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
  },
  papelFields: { flexDirection: "row", gap: 8 },
  papelField: { flex: 1 },
  resultsCard: {
    backgroundColor: "#F0F4FB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(124,157,208,0.3)",
  },
  resultsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: "Poppins_700Bold",
    marginBottom: 14,
  },
  metricsRow: { flexDirection: "row", alignItems: "center" },
  metricItem: { flex: 1, alignItems: "center" },
  metricDivider: {
    width: 1,
    height: 44,
    backgroundColor: "rgba(124,157,208,0.3)",
    marginHorizontal: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  btn: {
    backgroundColor: WINE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
});
