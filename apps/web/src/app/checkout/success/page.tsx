"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/shared/Toast";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const pickupNumber = searchParams.get("pickupNumber") || undefined;
  const orderId = searchParams.get("orderId") || undefined;
  const [order, setOrder] = useState<any>(null);
  const [showToast, setShowToast] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!orderId) return;
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    fetch(`${api}/orders/${encodeURIComponent(orderId)}`, { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then(setOrder)
      .catch(() => undefined);
  }, [orderId]);
  const displayPickupNumber = order?.pickupNumber || pickupNumber;

  return (
    <>
      {showToast && (
        <Toast
          message="Order placed successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="min-h-[80vh] flex items-center justify-center bg-brand-cream/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-brand-gold/20">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-heading font-extrabold text-brand-dark mb-2">
            Order Confirmed!
          </h2>
          <p className="text-brand-gray">
            Thank you for shopping with Madhavji Masala. Your order is being processed.
          </p>
        </div>

        <div className="bg-brand-cream/50 rounded-2xl p-6 border border-brand-gold/20">
          <p className="text-sm text-brand-gray mb-1">Your Pickup Number</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-sans font-semibold tracking-wide text-brand-maroon">
              {displayPickupNumber || "Loading…"}
            </p>
            {displayPickupNumber && <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(displayPickupNumber); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); } }} aria-label="Copy pickup number" className="rounded-md p-2 text-brand-gray hover:bg-brand-cream hover:text-brand-maroon" title="Copy pickup number">
              {copied ? <span className="text-xs font-bold">Copied</span> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" strokeWidth="1.8" /><path d="M5 15V6a2 2 0 012-2h9" strokeWidth="1.8" strokeLinecap="round" /></svg>}
            </button>}
          </div>
          <p className="text-xs text-brand-gray mt-4">
            Please show this number at the store counter when picking up your order.
          </p>
          <p className="text-xs text-brand-gray mt-1">
            ઓર્ડર લેવા સ્ટોરના કાઉન્ટર પર આ નંબર બતાવો.
          </p>
        </div>

        {order && <div className="rounded-2xl border border-brand-border bg-white p-4 text-left text-sm"><div className="flex justify-between"><span className="text-brand-gray">Status</span><strong className="text-brand-maroon">{order.status.replaceAll("_", " ")}</strong></div><div className="mt-2 flex justify-between"><span className="text-brand-gray">Pickup person</span><span>{order.pickupPersonName}</span></div><div className="mt-2 flex justify-between"><span className="text-brand-gray">Total</span><strong>₹{(order.totalInPaise / 100).toFixed(2)}</strong></div><div className="mt-3 border-t border-brand-border pt-3">{order.items?.map((item: any) => <div key={item.id} className="flex justify-between py-1"><span>{item.productName} × {item.quantity}</span><span>₹{(item.totalPriceInPaise / 100).toFixed(2)}</span></div>)}</div><button type="button" onClick={() => navigator.clipboard?.writeText(displayPickupNumber || "")} className="mt-3 text-xs font-semibold text-brand-maroon">Copy pickup code</button></div>}

        <div className="pt-4 space-y-4">
          <Link
            href="/orders"
            className="w-full flex items-center justify-center rounded-full bg-brand-maroon px-4 py-4 text-sm font-bold text-white shadow-lg hover:bg-brand-maroon-dark hover:-translate-y-0.5 transition-all"
          >
            View My Orders
          </Link>
          <Link
            href="/general-store"
            className="w-full flex items-center justify-center rounded-full bg-brand-cream text-brand-maroon px-4 py-4 text-sm font-bold shadow-sm border border-brand-gold/20 hover:bg-brand-cream/80 hover:-translate-y-0.5 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
