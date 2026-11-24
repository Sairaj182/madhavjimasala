"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";
import { cartItemDescription, formatPaise, formatRate } from "@/lib/general-store-display";

const actionClass = "inline-flex w-full items-center justify-center rounded-full bg-brand-maroon px-5 py-3 font-semibold text-white hover:bg-brand-maroon-dark disabled:opacity-50";

export default function CartPage() {
  const { cartItems, totalInPaise, changeQuantity, removeItem, loading, updating, error, sessionExpired, refreshCart } = useCart();
  const { data: session } = authClient.useSession();
  const [actionError, setActionError] = useState("");
  const hasUnavailableItems = cartItems.some((item) => item.quoteError);
  const notice = error || actionError;

  useEffect(() => {
    const refresh = () => { void refreshCart(); };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refreshCart]);

  async function update(action: () => Promise<void>) {
    setActionError("");
    try {
      await action();
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : "Could not update your cart.");
    }
  }

  if (loading) return <p role="status" className="py-24 text-center text-brand-gray">Loading your cart…</p>;
  if (!session?.user || (!cartItems.length && !notice)) {
    return (
      <main className="mx-auto my-12 max-w-lg px-4">
        <div className="rounded-2xl border border-brand-border bg-white p-6 text-center shadow-sm sm:p-10">
          <h1 className="text-2xl font-bold font-heading text-brand-dark">{session?.user ? "Your cart is empty" : "Sign in to see your cart"}</h1>
          <Link className={`mt-5 ${actionClass}`} href={session?.user ? "/general-store" : "/login?callbackUrl=%2Fcart"}>
            {session?.user ? "Browse the General Store" : "Sign In"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-brand-cream/30 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link href="/general-store" className="text-sm font-semibold text-brand-maroon hover:underline">← Continue shopping</Link>
        <h1 className="mt-3 text-3xl font-bold font-heading text-brand-dark">Your Cart</h1>
        <p className="mt-2 text-sm text-brand-gray">તમારી વસ્તુઓ તપાસો અને પછી ઓર્ડર કન્ફર્મ કરવા આગળ વધો.</p>
        {notice && (
          <div role="alert" className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {notice}
            {sessionExpired
              ? <Link href="/login?callbackUrl=%2Fcart" className="font-semibold underline">Sign In</Link>
              : <button type="button" className="font-semibold underline" onClick={() => { setActionError(""); void refreshCart(); }}>Refresh cart</button>}
          </div>
        )}
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <ul className="divide-y divide-brand-border rounded-2xl border border-brand-border bg-white px-4 sm:px-6">
            {cartItems.map((item) => {
              const { product } = item;
              const description = cartItemDescription(item);
              return (
                <li key={item.id} className="flex gap-3 py-4 sm:gap-4 sm:py-6">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream/40 sm:h-24 sm:w-24">
                    <Image src={product.images?.[0] || "/images/products/garam-masala.png"} alt="" fill sizes="(max-width: 640px) 64px, 96px" className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <Link href={`/general-store/${product.slug}`} className="font-semibold text-brand-dark hover:text-brand-maroon">{product.name}</Link>
                      {item.quotedTotalInPaise !== null && <p className="shrink-0 font-semibold text-brand-maroon tabular-nums">{formatPaise(item.quotedTotalInPaise)}</p>}
                    </div>
                    <p className="mt-1 text-sm text-brand-gray">{description}{item.quotedUnitPriceInPaise !== null && ` · ${formatRate(item.quotedUnitPriceInPaise, item.pricingUnit)}`}</p>
                    {item.quoteError && <p className="mt-1 text-sm font-medium text-red-700">{item.quoteError}</p>}
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div className="inline-flex items-center rounded-lg border border-brand-border">
                        <button type="button" aria-label={`Decrease quantity of ${product.name} (${description})`} disabled={Boolean(error)}
                          onClick={() => void update(() => changeQuantity(item.id, -1))}
                          className="min-h-10 px-3 hover:bg-brand-cream disabled:opacity-50">−</button>
                        <span className="min-w-8 px-2 text-center font-semibold tabular-nums">{item.quantity}</span>
                        <button type="button" aria-label={`Increase quantity of ${product.name} (${description})`} disabled={Boolean(error || item.quoteError)}
                          onClick={() => void update(() => changeQuantity(item.id, 1))}
                          className="min-h-10 px-3 hover:bg-brand-cream disabled:opacity-50">+</button>
                      </div>
                      <button type="button" aria-label={`Remove ${product.name} (${description})`} onClick={() => void update(() => removeItem(item.id))}
                        className="min-h-10 font-medium text-red-700 hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <section className="rounded-2xl border border-brand-border bg-white p-5 lg:sticky lg:top-28 sm:p-6" aria-labelledby="cart-total">
            <h2 id="cart-total" className="font-heading text-xl font-bold text-brand-dark">Order Summary</h2>
            <div className="my-4 flex flex-wrap items-baseline justify-between gap-x-3 border-y border-brand-border py-4">
              <p className="font-semibold text-brand-dark">Total <span className="text-xs font-normal text-brand-gray">Tax included</span></p>
              <span className="text-xl font-bold text-brand-maroon tabular-nums">{hasUnavailableItems || !cartItems.length ? "—" : formatPaise(totalInPaise)}</span>
            </div>
            {hasUnavailableItems && <p className="mb-3 text-sm text-red-700">Update or remove unavailable items to continue.</p>}
            {updating && <p role="status" className="mb-3 text-sm text-brand-gray">Updating cart…</p>}
            {error || updating || hasUnavailableItems || !cartItems.length ? (
              <button type="button" disabled className={actionClass}>Proceed to Checkout</button>
            ) : (
              <Link href="/checkout" className={actionClass}>Proceed to Checkout</Link>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
