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
const YELLOW = "#F6F1AF";
const BG = "#F2F2F2";

const ROWS: Array<{
  label: string;
  key: string;
  from: "resultado" | "dados";
  format: (v: any) => string;
  highlight?: boolean;
  higherIsBetter?: boolean;
}> = [
  {
    label: "Faturamento mensal",
    key: "faturamentoTotal",
    from: "resultado",
    format: (v) =>
      v != null
        ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
  },
  {
    label: "Preço médio",
    key: "precoMedioConsolidado",
    from: "resultado",
    format: (v) =>
      v != null
        ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
  },
  {
    label: "ICMS aplicado",
    key: "icms",
    from: "dados",
    format: (v) => (v ? `${v}%` : "—"),
  },
  {
    label: "Custo variável",
    key: "custoVariavel",
    from: "dados",
    format: (v) => (v ? `${v}%` : "—"),
  },
  {
    label: "Despesas fixas",
    key: "custoFixo",
    from: "dados",
    format: (v) =>
      v
        ? parseFloat(v).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "—",
  },
  {
    label: "Margem de contribuição",
    key: "mc_pct",
    from: "resultado",
    format: (v) => (v != null ? v.toFixed(1) + "%" : "—"),
    highlight: true,
    higherIsBetter: true,
  },
  {
    label: "Resultado mensal",
    key: "resultado",
    from: "resultado",
    format: (v) =>
      v != null
        ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
    highlight: true,
    higherIsBetter: true,
  },
  {
    label: "Markup",
    key: "markup",
    from: "resultado",
    format: (v) => (v != null ? v.toFixed(2) + "x" : "—"),
    highlight: true,
    higherIsBetter: true,
  },
  {
    label: "Ponto de equilíbrio",
    key: "pe_rs",
    from: "resultado",
    format: (v) =>
      v != null
        ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "—",
    highlight: true,
    higherIsBetter: false,
  },
];

function bestIdx(values: (number | null)[], higherIsBetter = true): number {
  let best = -1;
  let bestVal = higherIsBetter ? -Infinity : Infinity;
  values.forEach((v, i) => {
    if (v == null) return;
    if (higherIsBetter ? v > bestVal : v < bestVal) {
      bestVal = v;
      best = i;
    }
  });
  return best;
}

function worstIdx(values: (number | null)[], higherIsBetter = true): number {
  let worst = -1;
  let worstVal = higherIsBetter ? Infinity : -Infinity;
  values.forEach((v, i) => {
    if (v == null) return;
    if (higherIsBetter ? v < worstVal : v > worstVal) {
      worstVal = v;
      worst = i;
    }
  });
  return worst;
}

export default function FlowCompareScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { cenarios, deletarCenario } = useToolStore();

  return (
    <View style={[styles.root, { backgroundColor: BG }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Comparação de cenários</Text>
        <Text style={styles.headerSub}>
          {cenarios.length > 0
            ? `${cenarios.length} ${cenarios.length === 1 ? "cenário salvo" : "cenários salvos"}`
            : "Todos os cenários salvos, lado a lado."}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {cenarios.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Nenhum cenário salvo ainda</Text>
            <Text style={styles.emptyDesc}>
              Use o Simulador de Impacto (Flow B) para simular diferentes
              combinações de faturamento e custo. Quando você salvar cenários,
              eles aparecerão aqui para comparação lado a lado.
            </Text>
            <Pressable
              onPress={() => router.push("/flow-b" as any)}
              style={({ pressed }) => [
                styles.ctaBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.ctaBtnText}>→ Abrir Simulador de Impacto</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {cenarios.map((c, ci) => (
              <View key={c.id} style={styles.cenarioCard}>
                <View style={styles.cenarioHeader}>
                  <Text style={styles.cenarioNome} numberOfLines={1}>{c.nome}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.cenarioDate}>
                      {new Date(c.criadoEm).toLocaleDateString("pt-BR")}
                    </Text>
                    <TouchableOpacity onPress={() => deletarCenario(c.id)} hitSlop={8}>
                      <Feather name="trash-2" size={14} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cenarioRows}>
                  {ROWS.map((row) => {
                    const source =
                      row.from === "resultado" ? c.resultado : c.dados;
                    const val = source?.[row.key as keyof typeof source] ?? null;

                    if (!row.highlight) {
                      return (
                        <View key={row.label} style={styles.metaRow}>
                          <Text style={styles.metaKey}>{row.label}</Text>
                          <Text style={styles.metaVal}>{row.format(val)}</Text>
                        </View>
                      );
                    }

                    const allVals = cenarios.map((cc) => {
                      const s = row.from === "resultado" ? cc.resultado : cc.dados;
                      const v = s?.[row.key as keyof typeof s] ?? null;
                      return typeof v === "number" ? v : null;
                    });
                    const bi = bestIdx(allVals, row.higherIsBetter ?? true);
                    const wi = worstIdx(allVals, row.higherIsBetter ?? true);
                    const isBest = ci === bi && bi !== wi;
                    const isWorst = ci === wi && bi !== wi;

                    return (
                      <View
                        key={row.label}
                        style={[
                          styles.metaRow,
                          {
                            backgroundColor: isBest
                              ? "rgba(5,150,105,0.07)"
                              : isWorst
                              ? "rgba(185,28,28,0.05)"
                              : "transparent",
                            borderRadius: 6,
                            paddingHorizontal: 6,
                          },
                        ]}
                      >
                        <Text style={styles.metaKey}>{row.label}</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            {
                              color: isBest
                                ? "#065F46"
                                : isWorst
                                ? "#991B1B"
                                : WINE,
                              fontFamily: "Poppins_600SemiBold",
                            },
                          ]}
                        >
                          {isBest ? "★ " : ""}
                          {row.format(val)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {cenarios.length > 1 && (
              <View style={styles.diagCard}>
                <Text style={styles.diagTitle}>Diagnóstico</Text>
                <Text style={styles.diagText}>
                  Analise as linhas destacadas em verde (melhor) e vermelho
                  (pior) para identificar qual cenário entrega o melhor equilíbrio
                  entre margem de contribuição e resultado mensal.
                </Text>
              </View>
            )}
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
  cenarioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cenarioNome: {
    fontSize: 16,
    fontWeight: "700",
    color: WINE,
    fontFamily: "Poppins_700Bold",
    flex: 1,
    marginRight: 8,
  },
  cenarioDate: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Poppins_400Regular",
  },
  cenarioRows: { gap: 6 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  metaKey: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Poppins_400Regular",
    flex: 1,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "500",
    color: WINE,
    fontFamily: "Poppins_500Medium",
    textAlign: "right",
  },
  diagCard: {
    backgroundColor: YELLOW,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(200,184,64,0.4)",
    gap: 6,
  },
  diagTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: WINE,
    fontFamily: "Poppins_700Bold",
  },
  diagText: {
    fontSize: 13,
    color: "#4B3520",
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
});
