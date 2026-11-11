"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatRate, formatWeightGrams, formatWeightText, looseRateUnit } from "@/lib/general-store-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function CheckoutPage() {
  const { cartItems, totalInPaise, loading: cartLoading, refreshCart } = useCart();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const router = useRouter();

  const [pickupSlots, setPickupSlots] = useState<Array<{ id: string; date: string; startTime: string; endTime: string; remainingCapacity: number; capacity: number }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [pickupPersonName, setPickupPersonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (session?.user?.name && !customerName) {
      setCustomerName(session.user.name);
      setPickupPersonName(session.user.name);
    }
  }, [session, customerName]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_URL}/pickups/slots`);
        if (res.ok) {
          const data = await res.json();
          setPickupSlots(data);
          if (data.length > 0) {
            const firstAvailable = data.find((slot: { remainingCapacity: number }) => slot.remainingCapacity > 0);
            setSelectedSlot(firstAvailable?.id || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch slots", err);
      }
    };
    fetchSlots();
  }, []);

  if (sessionLoading || cartLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-brand-maroon rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    router.push("/cart");
    return null;
  }

  const handleCheckout = async () => {
    if (!customerName.trim() || !pickupPersonName.trim() || !selectedSlot) {
      setError("Please enter both the customer and pickup person names, then choose a pickup slot.");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const idempotencyKey = window.crypto.randomUUID();
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          pickupSlotId: selectedSlot,
          paymentMethod: "CASH",
          customerName,
          pickupPersonName,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to complete checkout");
      }

      const order = await res.json();
      setOrderPlaced(true);
      void refreshCart();
      router.push(`/checkout/success?orderId=${encodeURIComponent(order.id)}&pickupNumber=${encodeURIComponent(order.pickupNumber)}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream/30 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-heading font-bold text-brand-dark mb-2">Checkout</h1>
        <p className="mb-8 text-sm text-brand-gray">તમારો ઓર્ડર સ્ટોર પરથી પિકઅપ કરવાનો રહેશે. ચુકવણી પિકઅપ સમયે સ્ટોર પર જ કરવી.</p>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Checkout Steps */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 1: Contact Info */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-border">
              <h2 className="text-xl font-heading font-bold text-brand-dark mb-4">1. Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Name</label>
                  <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required className="w-full px-4 py-2 bg-white border border-brand-border rounded-lg text-brand-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Pickup person</label>
                  <input type="text" value={pickupPersonName} onChange={(event) => setPickupPersonName(event.target.value)} required className="w-full px-4 py-2 bg-white border border-brand-border rounded-lg text-brand-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray mb-1">Email</label>
                  <input type="email" value={session?.user?.email || ""} disabled className="w-full px-4 py-2 bg-gray-50 border border-brand-border rounded-lg text-brand-dark" />
                </div>
              </div>
            </div>

            {/* Step 2: Pickup Slot */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-border">
              <h2 className="text-xl font-heading font-bold text-brand-dark mb-4">2. Select Pickup Slot</h2>
              <p className="-mt-2 mb-4 text-sm text-brand-gray">તમારા માટે અનુકૂળ પિકઅપનો દિવસ અને સમય પસંદ કરો.</p>
              
              {pickupSlots.length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                  No pickup slots available currently. Please contact support.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pickupSlots.map(slot => {
                    const date = new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                    return (
                      <label
                        key={slot.id}
                        className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${
                          selectedSlot === slot.id
                            ? 'border-brand-maroon bg-brand-maroon/5 ring-1 ring-brand-maroon'
                            : 'border-brand-border bg-white hover:border-brand-gold hover:bg-brand-cream/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickup-slot"
                          value={slot.id}
                          className="sr-only"
                          onChange={() => setSelectedSlot(slot.id)}
                          checked={selectedSlot === slot.id}
                          disabled={slot.remainingCapacity < 1}
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-sm font-bold text-brand-dark">{date}</span>
                            <span className="mt-1 flex items-center text-sm text-brand-gray font-medium">
                              {slot.startTime} - {slot.endTime} · {slot.remainingCapacity > 0 ? `${slot.remainingCapacity} spots left` : "Full"}
                            </span>
                          </span>
                        </span>
                        {selectedSlot === slot.id && (
                          <svg className="h-5 w-5 text-brand-maroon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-border">
              <h2 className="text-xl font-heading font-bold text-brand-dark mb-4">3. Payment Method</h2>
              <p className="-mt-2 mb-4 text-sm text-brand-gray">ચુકવણી ઓર્ડર લેતી વખતે સ્ટોર પર જ થશે; ઑનલાઇન ચુકવણી જરૂરી નથી.</p>
              
              <div className="grid grid-cols-1 gap-4">
                <label
                  className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${
                    'border-brand-maroon bg-brand-maroon/5 ring-1 ring-brand-maroon'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    className="sr-only"
                    checked
                    readOnly
                  />
                  <span className="flex flex-col">
                    <span className="block text-sm font-bold text-brand-dark">Pay on Pickup</span>
                    <span className="mt-1 text-xs text-brand-gray">Pay with Cash, UPI, or Card at the store.</span>
                    <span className="mt-1 text-xs text-brand-gray">સ્ટોર પર રોકડ, UPI અથવા કાર્ડથી ચુકવણી કરી શકો છો.</span>
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-brand-border sticky top-28">
              <h2 className="text-xl font-heading font-bold text-brand-dark mb-6">Order Summary</h2>
              
              <ul className="divide-y divide-brand-border mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item) => {
                  const product = item.product;
                  const lineTotal = item.quotedTotalInPaise ? item.quotedTotalInPaise / 100 : (item.product.priceInPaise ? item.product.priceInPaise / 100 : item.product.price * item.quantity);
                  const images = product.images || ["/images/products/garam-masala.png"];
                  const displayWeight = item.selectionType === "LOOSE" ? formatWeightGrams(item.requestedWeightGrams) : formatWeightText(item.packingWeight);
                  const displayRate = item.selectionType === "LOOSE" ? formatRate(item.quotedUnitPriceInPaise || 0, looseRateUnit(product.loosePricingRules, item.requestedWeightGrams) || "KILOGRAM") : formatRate((item.quotedUnitPriceInPaise || product.priceInPaise || product.price * 100), "PACK");
                  return (
                    <li key={item.id} className="py-4 flex">
                      <div className="h-16 w-16 rounded-lg overflow-hidden border border-brand-gold/20 flex-shrink-0 bg-brand-cream/30 p-1">
                        <Image src={images[0]} alt={product.name} width={64} height={64} className="object-contain w-full h-full" />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between text-sm font-medium text-brand-dark">
                          <h3 className="line-clamp-1">{product.name}</h3>
                          <p className="ml-4">₹{lineTotal.toFixed(2)}</p>
                        </div>
                          <p className="mt-1 text-xs text-brand-gray">{item.selectionType === "LOOSE" ? `Loose ${displayWeight}` : `${item.packingLabel || "Default packing"}${displayWeight ? ` · ${displayWeight}` : ""}`} · {displayRate} · Qty {item.quantity}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <dl className="space-y-4 text-sm text-brand-dark border-t border-brand-border pt-6">
                <div className="flex justify-between">
                  <dt className="text-brand-gray">Subtotal</dt>
                  <dd className="font-medium">₹{totalInPaise / 100}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-gray">Tax</dt>
                  <dd className="font-medium">Included</dd>
                </div>
                <div className="flex justify-between items-center border-t border-brand-border pt-4">
                  <dt className="text-base font-bold text-brand-dark">Total</dt>
                  <dd className="text-xl font-bold text-brand-maroon">₹{totalInPaise / 100}</dd>
                </div>
              </dl>

              {error && (
                <div className="mt-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading || !selectedSlot || !customerName.trim() || !pickupPersonName.trim()}
                  className="w-full flex items-center justify-center rounded-full bg-brand-maroon px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-brand-maroon-dark disabled:opacity-50 disabled:hover:bg-brand-maroon transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : "Confirm Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
