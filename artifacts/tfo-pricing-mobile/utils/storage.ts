import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCTS_KEY = "tfo:saved_products";

export interface StoredProduct {
  id: string;
  nomeProduto: string;
  segmento: string;
  canal: "varejo" | "atacado";
  precoSimulado: number;
  custoSimulado: number;
  icmsNum: number;
  margemSimulada: number;
  markupSimulado: number;
  margemRS: number;
  criadoEm: number;
}

export async function loadProducts(): Promise<StoredProduct[]> {
  try {
    const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveProduct(product: StoredProduct): Promise<void> {
  const existing = await loadProducts();
  const filtered = existing.filter((p) => p.id !== product.id);
  await AsyncStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify([product, ...filtered])
  );
}

export async function deleteProduct(id: string): Promise<void> {
  const existing = await loadProducts();
  await AsyncStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(existing.filter((p) => p.id !== id))
  );
}

export async function clearAllProducts(): Promise<void> {
  await AsyncStorage.removeItem(PRODUCTS_KEY);
}
