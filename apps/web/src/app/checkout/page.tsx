"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";
import { cartItemDescription, formatPaise } from "@/lib/general-store-display";
import { STORE_API_URL, StoreApiError, storeResponse } from "@/lib/store-api";

type Slot = { id: string; date: string; startTime: string; endTime: string; remainingCapacity: number };
type Details = { customerName: string; pickupPersonName: string; pickupSlotId: string };
type Attempt = Details & { cartRevision: string };
type Draft = Details & { attempt?: Attempt };

const panel = "rounded-2xl border border-brand-border bg-white p-5 shadow-sm sm:p-7";
const field = "mt-1.5 w-full rounded-lg border border-brand-border px-3 py-2.5 text-brand-dark focus-visible:outline-brand-maroon disabled:bg-brand-cream/30";
const primary = "w-full rounded-full bg-brand-maroon px-5 py-3 font-semibold text-white hover:bg-brand-maroon-dark disabled:opacity-50";
const dateFormat = new Intl.DateTimeFormat("en-IN", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata" });

function saveDraft(key: string, draft: Draft) {
  try {
    sessionStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Checkout and in-page retries also work when tab storage is unavailable.
  }
}

function describeCartChanges(before: CartItem[], after: CartItem[]) {
  const previous = new Map(before.map((item) => [item.id, item]));
  const changes = after.flatMap((item) => {
    const old = previous.get(item.id);
    previous.delete(item.id);
    const name = `${item.product.name} · ${cartItemDescription(item)}`;
    if (item.quoteError) return [`${name} — ${item.quoteError}`];
    if (!old) return [`${name} was added.`];
    const differences: string[] = [];
    if (cartItemDescription(old) !== cartItemDescription(item)) differences.push(`changed from ${cartItemDescription(old)}`);
    if (old.quantity !== item.quantity) differences.push(`quantity ${old.quantity} → ${item.quantity}`);
    if (old.quotedTotalInPaise !== item.quotedTotalInPaise && old.quotedTotalInPaise !== null && item.quotedTotalInPaise !== null) {
      differences.push(`${formatPaise(old.quotedTotalInPaise)} → ${formatPaise(item.quotedTotalInPaise)}`);
    }
    return differences.length ? [`${name} — ${differences.join(", ")}.`] : [];
  });
  for (const old of previous.values()) changes.push(`${old.product.name} · ${cartItemDescription(old)} was removed.`);
  return changes;
}

export default function CheckoutPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) router.replace("/login?callbackUrl=%2Fcheckout");
  }, [isPending, session?.user, router]);

  if (isPending) return <p role="status" className="py-24 text-center">Loading checkout…</p>;
  if (!session?.user) return <p className="py-24 text-center"><Link className="underline" href="/login?callbackUrl=%2Fcheckout">Sign in to continue to checkout</Link></p>;
  return <Checkout key={session.user.id} userId={session.user.id} name={session.user.name} />;
}

function Checkout({ userId, name }: { userId: string; name: string }) {
  const { cartItems, revision, totalInPaise, loading, updating, error: cartError, sessionExpired, refreshCart } = useCart();
  const router = useRouter();
  const storageKey = `general-store-checkout:${userId}`;
  const [draft, setDraft] = useState<Draft>({ customerName: name, pickupPersonName: name, pickupSlotId: "" });
  const [draftReady, setDraftReady] = useState(false);
  const [checkingCart, setCheckingCart] = useState(true);
  const [slots, setSlots] = useState<{ loading: boolean; error: string; list: Slot[] }>({ loading: true, error: "", list: [] });
  const [notice, setNotice] = useState("");
  const [changes, setChanges] = useState<string[]>([]);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [existingOrderId, setExistingOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const detailsEdited = useRef(false);
  const slotRequest = useRef<AbortController | null>(null);
  const initialCart = useRef({ revision, items: cartItems });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const saved = JSON.parse(stored) as Draft;
        if (!detailsEdited.current && typeof saved.customerName === "string" && typeof saved.pickupPersonName === "string" && typeof saved.pickupSlotId === "string") setDraft(saved);
      }
    } catch {
      // Start with the account name if a draft is unavailable.
    }
    setDraftReady(true);
  }, [storageKey]);

  function updateDraft(fields: Partial<Draft>) {
    if ("customerName" in fields || "pickupPersonName" in fields) detailsEdited.current = true;
    const next = { ...draft, ...fields };
    setDraft(next);
    saveDraft(storageKey, next);
  }

  const loadSlots = useCallback(async () => {
    slotRequest.current?.abort();
    const controller = new AbortController();
    slotRequest.current = controller;
    setSlots({ loading: true, error: "", list: [] });
    try {
      const response = await fetch(`${STORE_API_URL}/pickups/slots`, { cache: "no-store", signal: controller.signal });
      const list = await storeResponse<Slot[]>(response, "Could not load pickup times.");
      if (!controller.signal.aborted) setSlots({ loading: false, error: "", list });
    } catch (error) {
      if (!controller.signal.aborted) {
        setSlots({ loading: false, error: error instanceof StoreApiError ? error.message : "Could not load pickup times.", list: [] });
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    void refreshCart().then((current) => {
      if (!active) return;
      const initial = initialCart.current;
      if (current && initial.revision && initial.revision !== current.revision) {
        setNotice("Your cart changed since you last viewed it. Review the current items and prices.");
        setChanges(describeCartChanges(initial.items, current.items));
      }
      setCheckingCart(false);
    });
    return () => { active = false; };
  }, [refreshCart]);

  useEffect(() => {
    void loadSlots();
    return () => slotRequest.current?.abort();
  }, [loadSlots]);

  const availableSlot = slots.list.some((slot) => slot.id === draft.pickupSlotId && slot.remainingCapacity > 0);
  const hasInvalidLine = cartItems.some((item) => item.quoteError);
  const attempt = draft.attempt;
  const canSubmit = Boolean(revision && availableSlot && cartItems.length && !hasInvalidLine && !cartError && !updating && !checkingCart);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || needsSignIn || sessionExpired || existingOrderId) return;

    let orderAttempt = attempt;
    if (!orderAttempt) {
      if (!canSubmit || !revision) return;
      orderAttempt = {
        cartRevision: revision,
        customerName: draft.customerName.trim(),
        pickupPersonName: draft.pickupPersonName.trim(),
        pickupSlotId: draft.pickupSlotId,
      };
    }
    if (!orderAttempt.customerName || !orderAttempt.pickupPersonName) {
      setNotice("Enter the customer’s name and the pickup person’s name.");
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    setNotice("");
    setChanges([]);
    updateDraft({ attempt: orderAttempt });
    try {
      const response = await fetch(`${STORE_API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderAttempt),
        signal: AbortSignal.timeout(20_000),
      });
      const order = await storeResponse<{ id: string }>(response, "Could not place your order.");
      if (typeof order.id !== "string" || !order.id) throw new Error("Missing order receipt");
      finish(order.id);
    } catch (error) {
      if (error instanceof StoreApiError) {
        if (error.code === "ORDER_ALREADY_PLACED" && error.orderId) {
          setNotice(error.message);
          setExistingOrderId(error.orderId);
          updateDraft({ attempt: undefined });
          void refreshCart(true);
          return;
        }
        if (error.status === 401) {
          setNeedsSignIn(true);
          setNotice("Your session expired. Sign in again to recover this checkout.");
          return;
        }
        if (["CART_CHANGED", "PICKUP_UNAVAILABLE", "CHECKOUT_CLOSED", "INVALID_CHECKOUT", "TOTAL_TOO_LARGE"].includes(error.code ?? "")) {
          setNotice(error.message);
          updateDraft({ attempt: undefined, ...(error.code === "PICKUP_UNAVAILABLE" ? { pickupSlotId: "" } : {}) });
          if (error.code === "PICKUP_UNAVAILABLE") void loadSlots();
          if (error.code === "CART_CHANGED") {
            const current = await refreshCart(true);
            if (current) setChanges(describeCartChanges(cartItems, current.items));
          }
          return;
        }
      }
      setNotice("We couldn’t verify whether the order went through. Retry this checkout to recover the same order.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  function finish(orderId: string) {
    updateDraft({ attempt: undefined, pickupSlotId: "" });
    void refreshCart(true);
    router.replace(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
  }

  if (!draftReady || (loading && !attempt)) return <p role="status" className="py-24 text-center text-brand-gray">Loading checkout…</p>;

  return (
    <main className="min-h-[60vh] bg-brand-cream/30 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link href="/cart" className="text-sm font-semibold text-brand-maroon hover:underline">← Back to cart</Link>
        <h1 className="mt-3 font-heading text-3xl font-bold text-brand-dark">Checkout</h1>
        <p className="mt-2 text-sm text-brand-gray">તમારો ઓર્ડર સ્ટોર પરથી પિકઅપ કરવાનો રહેશે. ચુકવણી પિકઅપ સમયે સ્ટોર પર જ કરવી.</p>

        <form onSubmit={submit} className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="grid gap-5">
            <fieldset disabled={submitting || Boolean(attempt)} className={panel}>
              <h2 className="font-heading text-xl font-bold text-brand-dark">Contact Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-brand-dark">
                  Customer name
                  <input className={field} type="text" autoComplete="name" required maxLength={120}
                    value={draft.customerName} onChange={(event) => updateDraft({ customerName: event.target.value })} />
                </label>
                <label className="text-sm font-medium text-brand-dark">
                  Pickup person
                  <input className={field} type="text" required maxLength={120}
                    value={draft.pickupPersonName} onChange={(event) => updateDraft({ pickupPersonName: event.target.value })} />
                </label>
              </div>
            </fieldset>

            <fieldset disabled={submitting || Boolean(attempt)} className={panel} aria-labelledby="pickup-heading">
              <h2 id="pickup-heading" className="font-heading text-xl font-bold text-brand-dark">Pickup Slot</h2>
              <p className="mt-2 text-sm text-brand-gray">તમારા માટે અનુકૂળ પિકઅપનો દિવસ અને સમય પસંદ કરો.</p>
              {slots.loading ? <p role="status" className="mt-4 text-sm text-brand-gray">Loading pickup times…</p> : (
                <>
                  {slots.error && <p role="alert" className="mt-4 text-sm text-red-700">{slots.error}</p>}
                  {!slots.error && !slots.list.some((slot) => slot.remainingCapacity > 0) && (
                    <p className="mt-4 text-sm text-brand-gray">No pickup times are available. Check again for openings.</p>
                  )}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {slots.list.map((slot) => (
                      <label key={slot.id} className="flex items-start gap-3 rounded-xl border border-brand-border p-3 has-checked:border-brand-maroon has-checked:bg-brand-cream/40 has-disabled:opacity-60">
                        <input type="radio" name="pickup-slot" value={slot.id} className="mt-1 accent-brand-maroon"
                          checked={slot.id === draft.pickupSlotId && slot.remainingCapacity > 0} disabled={slot.remainingCapacity < 1}
                          onChange={() => updateDraft({ pickupSlotId: slot.id })} />
                        <span className="flex flex-col gap-1 text-sm text-brand-gray">
                          <strong className="text-brand-dark">{dateFormat.format(new Date(slot.date))}</strong>
                          <span>{slot.startTime} – {slot.endTime}</span>
                          <span>{slot.remainingCapacity > 0 ? `${slot.remainingCapacity} available` : "Full"}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <button type="button" onClick={() => void loadSlots()} className="mt-3 min-h-10 text-sm font-semibold text-brand-maroon underline">Refresh pickup times</button>
                </>
              )}
            </fieldset>
          </div>

          <section className={`${panel} lg:sticky lg:top-28`} aria-labelledby="checkout-summary">
            <h2 id="checkout-summary" className="font-heading text-xl font-bold text-brand-dark">Order Summary</h2>
            {!cartItems.length && !cartError && (
              <p className="mt-4 text-sm text-brand-gray">{attempt ? "Retry to check whether your order was placed." : "Your cart is empty."} <Link href="/orders" className="font-semibold underline">View My Orders</Link></p>
            )}
            {cartItems.length > 0 && (
              <ul className="my-4 divide-y divide-brand-border">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-dark">{item.product.name}</p>
                      <p className="mt-0.5 text-brand-gray">{cartItemDescription(item)} · Qty {item.quantity}</p>
                      {item.quoteError && <p className="mt-1 text-red-700">{item.quoteError}</p>}
                    </div>
                    {item.quotedTotalInPaise !== null && <p className="shrink-0 font-semibold tabular-nums">{formatPaise(item.quotedTotalInPaise)}</p>}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-baseline justify-between gap-x-3 border-t border-brand-border pt-4 font-bold">
              <span>Total <span className="text-xs font-normal text-brand-gray">Tax included</span></span>
              <span className="text-xl text-brand-maroon tabular-nums">{cartItems.length && !hasInvalidLine ? formatPaise(totalInPaise) : "—"}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-brand-dark">Pay at pickup</p>
            <p className="mt-1 text-xs text-brand-gray">Pay with cash, UPI, or card at the store.</p>
            <p className="mt-1 text-xs text-brand-gray">સ્ટોર પર રોકડ, UPI અથવા કાર્ડથી ચુકવણી કરી શકો છો.</p>
            {cartError && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {cartError} <button type="button" onClick={() => void refreshCart()} className="font-semibold underline">Refresh cart</button>
              </div>
            )}
            {notice && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
            {changes.length > 0 && (
              <ul aria-label="Cart changes" className="mt-2 list-disc space-y-1 pl-5 text-sm text-brand-gray">
                {changes.map((change, index) => <li key={index}>{change}</li>)}
              </ul>
            )}
            {existingOrderId ? (
              <Link href={`/checkout/success?orderId=${encodeURIComponent(existingOrderId)}`} className={`mt-5 block text-center ${primary}`}>View placed order</Link>
            ) : needsSignIn || sessionExpired ? (
              <Link href="/login?callbackUrl=%2Fcheckout" className={`mt-5 block text-center ${primary}`}>Sign in to recover checkout</Link>
            ) : (
              <button type="submit" disabled={submitting || (!attempt && !canSubmit)} className={`mt-5 ${primary}`}>
                {submitting ? "Checking your order…" : attempt ? "Retry checkout" : "Confirm Order"}
              </button>
            )}
          </section>
        </form>
      </div>
    </main>
  );
}
