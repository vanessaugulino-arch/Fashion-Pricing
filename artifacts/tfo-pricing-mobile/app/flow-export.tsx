import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToolStore } from "@/store/useToolStore";

const WINE = "#2F1B20";
const BG = "#F2F2F2";

function fmtCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function margemStatus(m: number): { color: string; bg: string } {
  if (m >= 40) return { color: "#065F46", bg: "#ECFDF5" };
  if (m >= 25) return { color: "#B45309", bg: "#FFFBEB" };
  return { color: "#991B1B", bg: "#FEF2F2" };
}

export default function FlowExportScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { produtosSalvos, deletarProduto } = useToolStore();
  const sorted = [...produtosSalvos].sort((a, b) => b.criadoEm - a.criadoEm);

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Simulações salvas</Text>
        <Text style={styles.headerSub}>
          {sorted.length > 0
            ? `${sorted.length} ${sorted.length === 1 ? "produto simulado" : "produtos simulados"}`
            : "Nenhum produto salvo ainda"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Nenhum produto salvo ainda</Text>
            <Text style={styles.emptyDesc}>
              Analise um produto no Flow A e toque em "Salvar esta simulação". Todos os
              produtos salvos aparecerão aqui para consulta e comparação.
            </Text>
            <Pressable
              onPress={() => router.push("/flow-a" as any)}
              style={({ pressed }) => [
                styles.ctaBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.ctaBtnText}>→ Analisar um produto</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {sorted.map((p) => {
              const st = margemStatus(p.margemSimulada);
              return (
                <View key={p.id} style={styles.prodCard}>
                  <View style={styles.prodHeader}>
                    <Text style={styles.prodNome} numberOfLines={1}>
                      {p.nomeProduto || "Produto"}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={[
                          styles.canalBadge,
                          {
                            backgroundColor:
                              p.canal === "varejo" ? "#EEF3FA" : "#F0FDF4",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.canalText,
                            {
                              color:
                                p.canal === "varejo" ? "#1E40AF" : "#065F46",
                            },
                          ]}
                        >
                          {p.canal === "varejo" ? "Varejo" : "Atacado"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deletarProduto(p.id)}
                        hitSlop={8}
                      >
                        <Feather name="trash-2" size={14} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.prodMetrics}>
                    <View style={styles.prodMetric}>
                      <Text style={styles.prodMetricLabel}>Preço</Text>
                      <Text style={styles.prodMetricVal}>
                        {fmtCurrency(p.precoSimulado)}
                      </Text>
                    </View>
                    <View style={styles.prodMetric}>
                      <Text style={styles.prodMetricLabel}>Custo</Text>
                      <Text style={styles.prodMetricVal}>
                        {fmtCurrency(p.custoSimulado)}
                      </Text>
                    </View>
                    <View style={styles.prodMetric}>
                      <Text style={styles.prodMetricLabel}>ICMS</Text>
                      <Text style={styles.prodMetricVal}>
                        {p.icmsNum.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.prodMetric}>
                      <Text style={styles.prodMetricLabel}>Markup</Text>
                      <Text style={styles.prodMetricVal}>
                        {p.markupSimulado.toFixed(2)}x
                      </Text>
                    </View>
                  </View>

                  <View style={styles.prodMargem}>
                    <Text style={styles.prodMetricLabel}>Margem</Text>
                    <View style={styles.prodMargemRow}>
                      <View
                        style={[
                          styles.margemBadge,
                          { backgroundColor: st.bg },
                        ]}
                      >
                        <Text
                          style={[styles.margemBadgeText, { color: st.color }]}
                        >
                          {p.margemSimulada.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={styles.prodMetricVal}>
                        {fmtCurrency(p.margemRS)}/peça
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.prodDate}>
                    {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              );
            })}
          </>
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 48,
    gap: 12,
    paddingHorizontal: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    textAlign: "center",
  },
  ctaBtn: {
    marginTop: 12,
    backgroundColor: WINE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  prodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  prodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prodNome: {
    fontSize: 15,
    fontWeight: "700",
    color: WINE,
    fontFamily: "Poppins_700Bold",
    flex: 1,
    marginRight: 8,
  },
  canalBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  canalText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  prodMetrics: {
    flexDirection: "row",
    gap: 8,
  },
  prodMetric: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  prodMetricLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    marginBottom: 2,
  },
  prodMetricVal: {
    fontSize: 13,
    fontWeight: "600",
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
  },
  prodMargem: { gap: 4 },
  prodMargemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  margemBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  margemBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  prodDate: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    textAlign: "right",
  },
});
