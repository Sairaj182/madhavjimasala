"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { STORE_API_URL, StoreApiError, storeResponse } from "@/lib/store-api";
import { useRouter } from "next/navigation";

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  packingLabel: string;
  packingWeight: string | null;
  selectionType: "PACKED" | "LOOSE";
  requestedWeightGrams: number | null;
  pricingUnit: "PACK" | "GRAM" | "KILOGRAM" | null;
  quotedUnitPriceInPaise: number | null;
  quotedTotalInPaise: number | null;
  quoteError: string | null;
  product: { id: string; slug: string; name: string; images: string[] };
};

type Cart = { items: CartItem[]; revision: string; totalInPaise: number };

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number, packingLabel?: string, packingWeight?: string, selectionType?: "PACKED" | "LOOSE", requestedWeightGrams?: number) => Promise<boolean>;
  changeQuantity: (itemId: string, delta: -1 | 1) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  revision?: string;
  totalInPaise: number;
  loading: boolean;
  updating: boolean;
  error: string;
  sessionExpired: boolean;
  refreshCart: (force?: boolean) => Promise<Cart | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const router = useRouter();
  const [view, setView] = useState<{ userId: string; cart: Cart | null; error: string; sessionExpired?: boolean }>();
  const [pending, setPending] = useState(0);
  const activeUser = useRef<string | undefined>(undefined);
  const read = useRef<{ userId: string; controller: AbortController; promise: Promise<Cart | null> } | null>(null);
  const mutationQueue = useRef<Promise<void>>(Promise.resolve());
  const lastWrite = useRef(0);

  const refreshCart = useCallback((force = false) => {
    if (!userId || activeUser.current !== userId) return Promise.resolve(null);
    if (force) {
      read.current?.controller.abort();
      read.current = null;
    }
    if (read.current?.userId === userId) return read.current.promise;

    const controller = new AbortController();
    const promise = fetch(`${STORE_API_URL}/cart`, {
      credentials: "include", cache: "no-store", signal: controller.signal,
    }).then((response) => storeResponse<Cart>(response, "Could not load your cart."))
      .then((cart) => {
        if (controller.signal.aborted || activeUser.current !== userId) return null;
        setView({ userId, cart, error: "" });
        return cart;
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || activeUser.current !== userId) return null;
        const expired = error instanceof StoreApiError && error.status === 401;
        setView((previous) => ({
          userId,
          cart: !expired && previous?.userId === userId ? previous.cart : null,
          sessionExpired: expired,
          error: expired ? "Your session expired. Sign in again to view your cart."
            : error instanceof Error ? error.message : "Could not load your cart.",
        }));
        return null;
      })
      .finally(() => {
        if (read.current?.controller === controller) read.current = null;
      });
    read.current = { userId, controller, promise };
    return promise;
  }, [userId]);

  useEffect(() => {
    activeUser.current = userId;
    void refreshCart();
    return () => {
      activeUser.current = undefined;
      read.current?.controller.abort();
      read.current = null;
    };
  }, [userId, refreshCart]);

  function signIn() {
    const callbackUrl = window.location.pathname + window.location.search;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  function mutate(path: string, method: string, body?: object) {
    if (!userId) return Promise.reject(new StoreApiError("Sign in to update your cart.", 401));
    setPending((count) => count + 1);
    const write = ++lastWrite.current;
    const operation = mutationQueue.current.then(async () => {
      if (activeUser.current !== userId) throw new StoreApiError("Your session changed. Open your cart again.", 401);
      try {
        const response = await fetch(STORE_API_URL + path, {
          method,
          credentials: "include",
          ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
        });
        if (!response.ok) await storeResponse(response, "Could not update your cart.");
      } finally {
        if (activeUser.current === userId && lastWrite.current === write) {
          // A read that started before a write can contain an older snapshot.
          await refreshCart(true);
        }
      }
    }).finally(() => setPending((count) => count - 1));
    mutationQueue.current = operation.catch(() => {});
    return operation;
  }

  async function addToCart(productId: string, quantity: number, packingLabel = "default", packingWeight?: string, selectionType: "PACKED" | "LOOSE" = "PACKED", requestedWeightGrams?: number) {
    if (isPending) return false;
    if (!userId) {
      signIn();
      return false;
    }
    try {
      await mutate("/cart/items", "POST", { productId, quantity, packingLabel, packingWeight, selectionType, requestedWeightGrams });
      return true;
    } catch (error) {
      if (!(error instanceof StoreApiError) || error.status !== 401) throw error;
      signIn();
      return false;
    }
  }

  const current = userId && view?.userId === userId ? view : undefined;
  return (
    <CartContext.Provider value={{
      cartItems: current?.cart?.items ?? [],
      addToCart,
      changeQuantity: (itemId, delta) => mutate(`/cart/items/${encodeURIComponent(itemId)}`, "PUT", { quantityDelta: delta }),
      removeItem: (itemId) => mutate(`/cart/items/${encodeURIComponent(itemId)}`, "DELETE"),
      revision: current?.cart?.revision,
      totalInPaise: current?.cart?.totalInPaise ?? 0,
      loading: isPending || Boolean(userId && !current),
      updating: pending > 0,
      error: current?.error ?? "",
      sessionExpired: current?.sessionExpired ?? false,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
