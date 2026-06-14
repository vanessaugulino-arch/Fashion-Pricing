import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

import { useColors } from "@/hooks/useColors";
import { useToolStore } from "@/store/useToolStore";

type FlowCard = {
  id: "A" | "B" | "C";
  tag: string;
  tagBg: string;
  tagColor: string;
  bg: string;
  borderColor: string;
  borderTopColor: string;
  title: string;
  subtitle: string;
  formula: string;
  formulaBg: string;
  formulaColor: string;
  ctaLabel: string;
  ctaColor: string;
  titleColor: string;
  subtitleColor: string;
  icon: React.ReactNode;
  route: string;
};

export default function EntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { produtosSalvos } = useToolStore();
  const savedCount = produtosSalvos.length;

  const cards: FlowCard[] = [
    {
      id: "A",
      route: "/flow-a",
      tag: "PRODUTO",
      tagBg: "#7C9DD0",
      tagColor: "#FFFFFF",
      bg: "#EEF3FA",
      borderColor: "#7C9DD0",
      borderTopColor: "#7C9DD0",
      title: "Ver margem de um produto",
      subtitle:
        "Descubra se o preço cobre os custos e como você está em relação ao mercado.",
      formula: "Preço − Custo − Imposto = Margem",
      formulaBg: "rgba(124,157,208,0.15)",
      formulaColor: "#2F1B20",
      ctaLabel: "Começar",
      ctaColor: "#7C9DD0",
      titleColor: "#2F1B20",
      subtitleColor: "#6B7280",
      icon: (
        <Feather name="bar-chart-2" size={26} color="#7C9DD0" />
      ),
    },
    {
      id: "B",
      route: "/flow-b",
      tag: "NEGÓCIO",
      tagBg: "rgba(255,255,255,0.15)",
      tagColor: "rgba(255,255,255,0.85)",
      bg: "#2F1B20",
      borderColor: "#2F1B20",
      borderTopColor: "#2F1B20",
      title: "Simulador de Impacto",
      subtitle:
        "Lance o realizado do mês e veja se o negócio está gerando resultado.",
      formula: "Realizado mensal → Resultado estimado",
      formulaBg: "rgba(255,255,255,0.10)",
      formulaColor: "rgba(255,255,255,0.75)",
      ctaLabel: "Começar",
      ctaColor: "#7C9DD0",
      titleColor: "#FFFFFF",
      subtitleColor: "rgba(255,255,255,0.65)",
      icon: (
        <MaterialCommunityIcons
          name="store-outline"
          size={26}
          color="rgba(255,255,255,0.9)"
        />
      ),
    },
    {
      id: "C",
      route: "/flow-d",
      tag: "ESTRATÉGIA",
      tagBg: "rgba(47,27,32,0.10)",
      tagColor: "#2F1B20",
      bg: "#F6F1AF",
      borderColor: "#C8B840",
      borderTopColor: "#C8B840",
      title: "Definir uma estratégia de preço",
      subtitle:
        "Defina o preço que entrega a margem que você precisa e posiciona sua marca no mercado.",
      formula: "Custo + Margem desejada → Preço certo",
      formulaBg: "rgba(47,27,32,0.08)",
      formulaColor: "#2F1B20",
      ctaLabel: "Calcular",
      ctaColor: "#2F1B20",
      titleColor: "#2F1B20",
      subtitleColor: "#4B3520",
      icon: (
        <MaterialCommunityIcons
          name="target"
          size={26}
          color="#2F1B20"
        />
      ),
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: "#F2F2F2" }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.wine,
          },
        ]}
      >
        <Text style={styles.headerBrand}>THE FASHION OFFICE</Text>
        <Text style={styles.headerSub}>Ferramenta de Precificação</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>O que você quer{"\n"}descobrir agora?</Text>
        <Text style={styles.subheading}>
          Escolha um ponto de partida. Você aprofunda depois. Não precisa de
          todos os dados — só dos que tem agora.
        </Text>

        <View style={styles.cards}>
          {cards.map((card) => (
            <Pressable
              key={card.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: card.bg,
                  borderColor: card.borderColor,
                  borderTopColor: card.borderTopColor,
                  opacity: pressed ? 0.92 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => router.push(card.route as any)}
            >
              <View
                style={[
                  styles.tag,
                  { backgroundColor: card.tagBg },
                ]}
              >
                <Text style={[styles.tagText, { color: card.tagColor }]}>
                  {card.tag}
                </Text>
              </View>

              <View style={styles.iconWrap}>{card.icon}</View>

              <Text style={[styles.cardTitle, { color: card.titleColor }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: card.subtitleColor }]}>
                {card.subtitle}
              </Text>

              <View
                style={[
                  styles.formulaBox,
                  { backgroundColor: card.formulaBg },
                ]}
              >
                <Text style={[styles.formulaText, { color: card.formulaColor }]}>
                  {card.formula}
                </Text>
              </View>

              <Text style={[styles.cta, { color: card.ctaColor }]}>
                → {card.ctaLabel}
              </Text>
            </Pressable>
          ))}
        </View>

        <TouchableOpacity
          style={styles.myProductsBtn}
          onPress={() => router.push("/saved" as any)}
          activeOpacity={0.8}
        >
          <View style={styles.myProductsLeft}>
            <Feather name="bookmark" size={18} color="#7C9DD0" />
            <Text style={styles.myProductsLabel}>Meus Produtos</Text>
          </View>
          <View style={styles.myProductsRight}>
            {savedCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{savedCount}</Text>
              </View>
            )}
            <Feather name="chevron-right" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Você não precisa de todos os dados agora. Comece por onde faz sentido.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerBrand: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Poppins_700Bold",
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 1,
    fontFamily: "Poppins_400Regular",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 24 },
  heading: {
    fontSize: 26,
    fontWeight: "600" as const,
    color: "#2F1B20",
    lineHeight: 34,
    fontFamily: "Poppins_600SemiBold",
    fontStyle: "italic",
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 21,
    fontFamily: "Poppins_400Regular",
  },
  cards: { marginTop: 24, gap: 14 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderTopWidth: 3,
    padding: 20,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 1.2,
    fontFamily: "Poppins_700Bold",
  },
  iconWrap: { marginBottom: 12 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    lineHeight: 24,
    marginBottom: 6,
    fontFamily: "Poppins_600SemiBold",
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
    fontFamily: "Poppins_400Regular",
  },
  formulaBox: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  formulaText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500" as const,
    fontFamily: "Poppins_500Medium",
  },
  cta: {
    fontSize: 14,
    fontWeight: "600" as const,
    fontFamily: "Poppins_600SemiBold",
  },
  myProductsBtn: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myProductsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  myProductsLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#2F1B20",
    fontFamily: "Poppins_600SemiBold",
  },
  myProductsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    backgroundColor: "#7C9DD0",
    borderRadius: 20,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontFamily: "Poppins_700Bold",
  },
  footnote: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
});
