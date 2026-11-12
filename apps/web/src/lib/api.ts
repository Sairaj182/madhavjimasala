import { PRODUCTS, PRODUCT_CATEGORIES } from "./constants";

const browserApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const serverApiUrl = process.env.API_SERVER_URL || "http://api:4000/api";
const API_URL = typeof window === "undefined" ? serverApiUrl : browserApiUrl;

export async function getProducts(kind?: "GENERAL_STORE") {
  try {
    const res = await fetch(`${API_URL}/products${kind ? "?kind=GENERAL_STORE" : ""}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  } catch (err) {
    console.error("Falling back to local PRODUCTS due to API error:", err);
    if (kind) throw err;
    return PRODUCTS;
  }
}

export async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch product");
    }
    return await res.json();
  } catch (err) {
    console.error("Falling back to local PRODUCTS due to API error:", err);
    return PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (err) {
    console.error("Falling back to local PRODUCT_CATEGORIES due to API error:", err);
    return PRODUCT_CATEGORIES;
  }
}
