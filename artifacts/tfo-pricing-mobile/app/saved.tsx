import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
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
import { SEGMENTOS } from "@/utils/benchmarks";

const WINE = "#2F1B20";
const BG = "#F2F2F2";

function getStatusInfo(margem: number): {
  label: string;
  bg: string;
  color: string;
} {
  if (margem >= 50) return { label: "Acima da média", bg: "#EFF6FF", color: "#1D4ED8" };
  if (margem >= 35) return { label: "Dentro da média", bg: "#ECFDF5", color: "#2D6A4F" };
  if (margem >= 20) return { label: "Abaixo da média", bg: "#FFFBEB", color: "#B45309" };
  return { label: "Muito abaixo", bg: "#FEF2F2", color: "#991B1B" };
}

function segmentoLabel(value: string): string {
  return SEGMENTOS.find((s) => s.value === value)?.label ?? value;
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { produtosSalvos, deletarProduto } = useToolStore();
  const sorted = [...produtosSalvos].sort((a, b) => b.criadoEm - a.criadoEm);

  function handleDelete(id: string, nome: string) {
    Alert.alert(
      "Excluir produto",
      `Remover "${nome || "Produto"}" da sua lista?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deletarProduto(id),
        },
      ]
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Meus Produtos</Text>
        <Text style={styles.headerSub}>
          {sorted.length > 0
            ? `${sorted.length} ${sorted.length === 1 ? "produto salvo" : "produtos salvos"}`
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
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>Nenhum produto salvo ainda</Text>
            <Text style={styles.emptyDesc}>
              Analise um produto no Flow A e toque em "Salvar esta simulação".
              Todos os produtos salvos aparecerão aqui para consulta e
              comparação.
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
          sorted.map((p) => {
            const status = getStatusInfo(p.margemSimulada);
            const segLabel = segmentoLabel(p.segmento);
            const nome = p.nomeProduto || "Produto";
            return (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.prodNome} numberOfLines={1}>
                      {nome}
                    </Text>
                    <Text style={styles.segText}>{segLabel}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(p.id, nome)}
                    hitSlop={10}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricsRow}>
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Margem</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusBadgeText, { color: status.color }]}
                      >
                        {p.margemSimulada.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Status</Text>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>

                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Canal</Text>
                    <Text style={styles.metricValue}>
                      {p.canal === "varejo" ? "Varejo" : "Atacado"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>
                  Salvo em {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: WINE,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Poppins_400Regular",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Poppins_400Regular",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 56,
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyIcon: { fontSize: 52, marginBottom: 8 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
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
    paddingHorizontal: 28,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    shadowColor: WINE,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTopLeft: { flex: 1, marginRight: 12 },
  prodNome: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: WINE,
    fontFamily: "Poppins_700Bold",
    marginBottom: 3,
  },
  segText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
  },
  deleteBtn: {
    paddingTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
  },
  metricBlock: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: WINE,
    fontFamily: "Poppins_600SemiBold",
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
    textAlign: "right",
  },
});
