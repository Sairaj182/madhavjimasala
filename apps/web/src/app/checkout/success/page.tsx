"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { formatPaise } from "@/lib/general-store-display";
import { STORE_API_URL, StoreApiError, storeResponse } from "@/lib/store-api";

type Order = {
  id: string;
  pickupNumber: string;
  status: string;
  totalInPaise: number;
  pickupPersonName: string | null;
  pickupSlot: { date: string; startTime: string; endTime: string };
  items: { id: string; productName: string; quantity: number; totalPriceInPaise: number }[];
};

const dateFormat = new Intl.DateTimeFormat("en-IN", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata" });

function ReceiptCard({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[60vh] bg-brand-cream/30 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-lg rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-8">
        {children}
        <nav aria-label="After checkout" className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-semibold text-brand-maroon">
          <Link href="/orders" className="hover:underline">View My Orders</Link>
          <Link href="/general-store" className="hover:underline">Continue Shopping</Link>
        </nav>
      </div>
    </main>
  );
}

function Receipt({ orderId }: { orderId: string }) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ order?: Order; error?: string; unauthorized?: boolean; retryable?: boolean }>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setResult({});
    void fetch(`${STORE_API_URL}/orders/${encodeURIComponent(orderId)}/receipt`, {
      credentials: "include", cache: "no-store", signal: controller.signal,
    }).then((response) => storeResponse<Order>(response, "Could not load your receipt."))
      .then((order) => {
        if (!controller.signal.aborted) setResult({ order });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof StoreApiError && error.status === 401) setResult({ unauthorized: true });
        else if (error instanceof StoreApiError && error.status === 404) setResult({ error: "This order could not be found in your account." });
        else setResult({ error: "Could not load your receipt. Try again or check My Orders.", retryable: true });
      });
    return () => controller.abort();
  }, [orderId, retry]);

  const { order } = result;
  if (result.unauthorized) return <SignInLink orderId={orderId} />;
  if (!order) {
    return (
      <ReceiptCard>
        {result.error ? <p role="alert" className="text-red-700">{result.error}</p> : <p role="status">Loading your order receipt…</p>}
        {result.retryable && (
          <button type="button" onClick={() => setRetry((count) => count + 1)} className="mt-4 font-semibold text-brand-maroon underline">Reload receipt</button>
        )}
      </ReceiptCard>
    );
  }
  const open = !["PICKED_UP", "CANCELLED"].includes(order.status);
  return (
    <ReceiptCard>
      <h1 className="font-heading text-3xl font-bold text-brand-dark">{order.status === "CANCELLED" ? "Order cancelled" : "Order received"}</h1>
      <dl className="mt-4 grid gap-3 text-sm">
        <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-semibold text-brand-maroon">{order.status.replaceAll("_", " ").toLowerCase()}</dd></div>
        <div className="flex justify-between gap-3"><dt>Pickup time</dt><dd className="text-right font-semibold">{dateFormat.format(new Date(order.pickupSlot.date))} · {order.pickupSlot.startTime} – {order.pickupSlot.endTime}</dd></div>
        <div className="flex justify-between gap-3"><dt>Pickup person</dt><dd className="text-right font-semibold">{order.pickupPersonName || "—"}</dd></div>
        <div className="flex justify-between gap-3"><dt>Total</dt><dd className="font-semibold tabular-nums">{formatPaise(order.totalInPaise)}</dd></div>
      </dl>
      {open && order.pickupNumber && (
        <div className="mt-5 rounded-xl bg-brand-cream/60 p-4">
          <h2 className="font-semibold text-brand-dark">Pickup Number</h2>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-2xl font-bold tracking-wide text-brand-maroon">{order.pickupNumber}</p>
            <button type="button" className="min-h-10 font-semibold text-brand-maroon underline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(order.pickupNumber);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}>{copied ? "Copied" : "Copy pickup number"}</button>
          </div>
          <p className="mt-2 text-sm text-brand-gray">Show this number at the store counter when picking up your order.</p>
          <p className="mt-1 text-sm text-brand-gray">ઓર્ડર લેવા સ્ટોરના કાઉન્ટર પર આ નંબર બતાવો.</p>
        </div>
      )}
      <ul className="mt-5 divide-y divide-brand-border border-y border-brand-border text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-2.5">
            <span>{item.productName} × {item.quantity}</span>
            <span className="shrink-0 font-semibold tabular-nums">{formatPaise(item.totalPriceInPaise)}</span>
          </li>
        ))}
      </ul>
    </ReceiptCard>
  );
}

function SignInLink({ orderId }: { orderId: string }) {
  const callback = `/checkout/success?orderId=${encodeURIComponent(orderId)}`;
  return (
    <ReceiptCard>
      <p className="text-brand-dark">Sign in to view this order receipt.</p>
      <Link className="mt-3 inline-block font-semibold text-brand-maroon underline" href={`/login?callbackUrl=${encodeURIComponent(callback)}`}>Sign In</Link>
    </ReceiptCard>
  );
}

function CheckoutReceipt() {
  const orderId = useSearchParams().get("orderId");
  const { data: session, isPending } = authClient.useSession();
  if (!orderId) return <ReceiptCard><p>Choose an order from My Orders.</p></ReceiptCard>;
  if (isPending) return <ReceiptCard><p role="status">Loading your order receipt…</p></ReceiptCard>;
  if (!session?.user) return <SignInLink orderId={orderId} />;
  return <Receipt key={`${session.user.id}:${orderId}`} orderId={orderId} />;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<p role="status" className="py-24 text-center">Loading your order receipt…</p>}>
      <CheckoutReceipt />
    </Suspense>
  );
}
