"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  packingLabel?: string;
  packingWeight?: string;
  selectionType?: "PACKED" | "LOOSE";
  requestedWeightGrams?: number;
  quotedUnitPriceInPaise?: number;
  quotedTotalInPaise?: number;
  product: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number, packingLabel?: string, packingWeight?: string, selectionType?: "PACKED" | "LOOSE", requestedWeightGrams?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  totalInPaise: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const fetchCart = async () => {
    if (!session?.user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // We pass credentials included by better-auth automatically if they are on same domain,
      // but since they might be cross-origin, better-auth handles it with cookies if set up, 
      // or we can attach the token. We'll use fetch with credentials.
      const res = await fetch(`${API_URL}/cart`, {
        headers: {},
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Unauthenticated or mock mode
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await res.json();
      setCartItems(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [session?.user]);

  const addToCart = async (productId: string, quantity: number, packingLabel = "default", packingWeight?: string, selectionType: "PACKED" | "LOOSE" = "PACKED", requestedWeightGrams?: number) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity, packingLabel, packingWeight, selectionType, requestedWeightGrams })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to add item");
      }
      await fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!session?.user) return;

    try {
      const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update item");
      }
      await fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const removeItem = async (itemId: string) => {
    if (!session?.user) return;

    try {
      const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to remove item");
      }
      await fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const totalInPaise = cartItems.reduce((total, item) => {
    const itemTotal = item.quotedTotalInPaise && item.quotedTotalInPaise > 0
      ? item.quotedTotalInPaise
      : (item.product.priceInPaise || (item.product.price * 100)) * item.quantity;
    return total + itemTotal;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        totalInPaise,
        loading,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
