"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Toast from "@/components/shared/Toast";
import PushNotifications from "@/components/shared/PushNotifications";
import { formatRate, formatWeightGrams, formatWeightText } from "@/lib/general-store-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPriceInPaise: number;
  totalPriceInPaise: number;
  productId: string;
  packingLabel?: string;
  packingWeight?: string;
  acceptedPackingLabel?: string;
  acceptedPackingWeight?: string;
  selectionType?: string;
  requestedWeightGrams?: number | null;
  acceptedWeightGrams?: number | null;
  pricingUnit?: string;
  fulfillmentNote?: string | null;
  requestedQuantity?: number;
  available?: boolean;
};

type PickupSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
};

type Order = {
  id: string;
  pickupNumber: string;
  serialNumber: number;
  customerName?: string;
  pickupPersonName?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalInPaise: number;
  createdAt: string;
  pickupSlot: PickupSlot;
  items: OrderItem[];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "PARTIALLY_ACCEPTED":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "READY_FOR_PICKUP":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "PICKED_UP":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, " ").replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

function originalOrderText(item: OrderItem) {
  if (item.selectionType === "LOOSE") {
    return `Loose ${formatWeightGrams(item.requestedWeightGrams)} · Qty: ${item.requestedQuantity ?? item.quantity}`;
  }
  return `${item.packingLabel || "Default packing"}${item.packingWeight ? ` · ${formatWeightText(item.packingWeight)}` : ""} · Qty: ${item.requestedQuantity ?? item.quantity}`;
}

function storeFulfilmentText(item: OrderItem) {
  if (item.available === false) return "Currently unavailable";
  if (item.selectionType === "LOOSE") {
    return `Loose ${formatWeightGrams(item.acceptedWeightGrams || item.requestedWeightGrams)} · Qty: ${item.quantity}`;
  }
  return `${item.acceptedPackingLabel || item.packingLabel || "Default packing"}${item.acceptedPackingWeight || item.packingWeight ? ` · ${formatWeightText(item.acceptedPackingWeight || item.packingWeight)}` : ""} · Qty: ${item.quantity}`;
}

function fulfilmentChanged(item: OrderItem) {
  return item.available === false || originalOrderText(item) !== storeFulfilmentText(item);
}

export default function OrdersPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderView, setOrderView] = useState<"current" | "past">("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [copiedPickupNumber, setCopiedPickupNumber] = useState<string | null>(null);

  const copyPickupNumber = async (pickupNumber: string) => {
    try {
      await navigator.clipboard.writeText(pickupNumber);
      setCopiedPickupNumber(pickupNumber);
      window.setTimeout(() => setCopiedPickupNumber((current) => current === pickupNumber ? null : current), 1600);
    } catch {
      setCopiedPickupNumber(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("orderPlaced") !== "1") return;

    setToastVisible(true);
    window.history.replaceState({}, "", "/orders");
  }, []);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?callbackUrl=/orders");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (!session?.user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-brand-maroon rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Oops!</h2>
          <p className="text-brand-gray">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-brand-maroon text-white rounded-full hover:bg-brand-maroon-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentOrders = orders.filter(
    (order) => !["PICKED_UP", "CANCELLED"].includes(order.status),
  );
  const pastOrders = orders.filter((order) =>
    ["PICKED_UP", "CANCELLED"].includes(order.status),
  );
  const visibleOrders = orderView === "current" ? currentOrders : pastOrders;

  return (
    <>
      {toastVisible && (
        <Toast
          message="Order placed successfully!"
          onClose={() => setToastVisible(false)}
        />
      )}
      <div className="bg-brand-cream/30 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">Order centre</p>
            <h1 className="text-3xl font-heading font-bold text-brand-dark">My Orders</h1>
          </div>
          <div className="flex flex-wrap items-end gap-4 sm:flex-nowrap">
            <PushNotifications />
          <Link
            href="/general-store"
            className="text-sm font-bold text-brand-maroon hover:text-brand-gold transition-colors flex items-center gap-2"
          >
            Continue Shopping
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          </div>
        </div>

        <div className="mb-6 flex rounded-2xl border border-brand-border bg-white p-1 shadow-sm sm:w-fit">
          {[
            { key: "current" as const, label: "Current orders", count: currentOrders.length },
            { key: "past" as const, label: "Past orders", count: pastOrders.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOrderView(tab.key)}
              className={`rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                orderView === tab.key
                  ? "bg-brand-maroon text-white shadow-sm"
                  : "text-brand-gray hover:text-brand-maroon"
              }`}
            >
              {tab.label}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                orderView === tab.key ? "bg-white/20" : "bg-brand-cream"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-brand-border">
            <div className="w-20 h-20 bg-brand-cream mx-auto rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-heading font-bold text-brand-dark mb-2">No orders yet</h2>
            <p className="text-brand-gray mb-8 max-w-md mx-auto">
              Looks like you haven't placed any orders yet. Discover our premium blends and start your flavor journey!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-brand-maroon px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-brand-maroon-dark transition-all hover:-translate-y-0.5"
            >
              Shop Now
            </Link>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-3xl border border-brand-border bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-heading font-bold text-brand-dark mb-2">
              No {orderView} orders
            </h2>
            <p className="text-brand-gray">
              {orderView === "current"
                ? "New orders and orders ready for pickup will appear here."
                : "Completed and cancelled orders will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {visibleOrders.map((order) => {
              const pickupDate = new Date(order.pickupSlot.date).toLocaleDateString('en-IN', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
              });
              const originalQuantity = order.items.reduce((sum, item) => sum + (item.requestedQuantity ?? item.quantity), 0);
              const fulfilledQuantity = order.items.reduce((sum, item) => sum + (item.available === false ? 0 : item.quantity), 0);
              const hasStoreReview = ["PARTIALLY_ACCEPTED", "CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP"].includes(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-border hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div>
                        <p className="text-xs font-medium text-brand-gray uppercase tracking-wider">Pickup ID</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-sans font-semibold tracking-wide text-brand-maroon">{order.pickupNumber}</p>
                          <button type="button" onClick={() => void copyPickupNumber(order.pickupNumber)} aria-label={`Copy pickup number ${order.pickupNumber}`} className="rounded-md p-1 text-brand-gray hover:bg-brand-cream hover:text-brand-maroon" title="Copy pickup number">
                            {copiedPickupNumber === order.pickupNumber ? <span className="text-[10px] font-bold">Copied</span> : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" strokeWidth="1.8" /><path d="M5 15V6a2 2 0 012-2h9" strokeWidth="1.8" strokeLinecap="round" /></svg>}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brand-gray uppercase tracking-wider">Date Placed</p>
                        <p className="text-sm font-medium text-brand-dark">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brand-gray uppercase tracking-wider">Total quantity</p>
                        <p className="text-sm font-medium text-brand-dark">{fulfilledQuantity} item{fulfilledQuantity === 1 ? "" : "s"}</p>
                        {fulfilledQuantity !== originalQuantity && <p className="text-[11px] text-brand-maroon">Ordered: {originalQuantity}</p>}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-brand-gray uppercase tracking-wider">Total</p>
                        <p className="text-sm font-medium text-brand-dark">₹{order.totalInPaise / 100}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Items */}
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wide">Order Items</h3>
                        <ul className="divide-y divide-brand-border">
                          {order.items.map((item) => (
                            <li key={item.id} className="py-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-brand-cream/30 border border-brand-gold/20 rounded-lg flex items-center justify-center p-1 mr-4">
                                  <svg className="w-6 h-6 text-brand-gold opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-brand-dark">{item.productName}</p>
                                  <div className="mt-1 space-y-1 text-xs">
                                    <p className="text-brand-gray"><span className="font-semibold text-brand-dark">Original order:</span> {originalOrderText(item)}</p>
                                    {hasStoreReview && <p className={fulfilmentChanged(item) ? "text-brand-maroon" : "text-green-700"}><span className="font-semibold">Store fulfilment:</span> {storeFulfilmentText(item)}{item.available !== false && <> · {formatRate(item.unitPriceInPaise, item.selectionType === "LOOSE" ? (item.pricingUnit || "KILOGRAM") : "PACK")}</>}</p>}
                                  </div>
                                  {hasStoreReview && item.fulfillmentNote && <p className="mt-1 text-xs text-brand-maroon">Note from store: {item.fulfillmentNote}</p>}
                                </div>
                              </div>
                              <p className="text-sm font-medium text-brand-dark">₹{item.totalPriceInPaise / 100}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Details */}
                      <div className="bg-brand-cream/20 rounded-2xl p-5 border border-brand-gold/10 h-fit">
                        <div className="mb-5 rounded-xl bg-brand-maroon p-4 text-white shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-gold">Show at the store</p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="text-2xl font-sans font-semibold tracking-wide">{order.pickupNumber}</p>
                            <button type="button" onClick={() => void copyPickupNumber(order.pickupNumber)} aria-label={`Copy pickup number ${order.pickupNumber}`} className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white" title="Copy pickup number">
                              {copiedPickupNumber === order.pickupNumber ? <span className="text-[10px] font-bold">Copied</span> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" strokeWidth="1.8" /><path d="M5 15V6a2 2 0 012-2h9" strokeWidth="1.8" strokeLinecap="round" /></svg>}
                            </button>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-white/90">Show this pickup number at the store counter to receive your order.</p>
                          <p className="mt-1 text-xs leading-5 text-white/90">ઓર્ડર લેવા સ્ટોરના કાઉન્ટર પર આ પિકઅપ નંબર બતાવો.</p>
                        </div>
                        <h3 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-wide">Pickup Details</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-brand-gray flex items-center gap-1.5 mb-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Scheduled Date
                            </p>
                            <p className="text-sm font-medium text-brand-dark">{pickupDate}</p>
                            <p className="text-sm font-medium text-brand-dark">{order.pickupSlot.startTime} - {order.pickupSlot.endTime}</p>
                          </div>
                          
                          <div>
                            <p className="text-xs text-brand-gray flex items-center gap-1.5 mb-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Payment
                            </p>
                            <p className="text-sm font-medium text-brand-dark">
                              {order.paymentMethod} • <span className={order.paymentStatus === "PAID" ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>{order.paymentStatus}</span>
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-brand-gray mb-1">Pickup person</p>
                            <p className="text-sm font-medium text-brand-dark">{order.pickupPersonName || order.customerName || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
