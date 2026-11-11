"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/shared/Toast";
import { formatRate, formatWeightGrams, formatWeightText } from "@/lib/general-store-display";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const PAST_ORDER_STATUSES = new Set(["PICKED_UP", "CANCELLED"]);

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPriceInPaise: number;
  totalPriceInPaise: number;
  packingLabel?: string;
  packingWeight?: string;
  acceptedPackingLabel?: string;
  acceptedPackingWeight?: string;
  selectionType?: string;
  requestedWeightGrams?: number | null;
  acceptedWeightGrams?: number | null;
  pricingUnit?: string;
  fulfillmentNote?: string;
  requestedQuantity: number;
  available?: boolean;
  product?: {
    price?: number;
    priceInPaise?: number;
    packagingSizes?: Array<{ label?: string; weight?: string; weightGrams?: number; priceInPaise?: number; availability?: string }>;
    loosePricingRules?: Array<{ minWeightGrams: number; maxWeightGrams?: number | null; rateInPaise: number; rateUnit: "GRAM" | "KILOGRAM" }>;
    allowLooseQuantity?: boolean;
  } | null;
};

type FulfillmentOption = { selectionType: "PACKED" | "LOOSE"; label: string; weight: string; totalWeightGrams: number; note: string };

type Order = {
  id: string;
  serialNumber: number;
  pickupNumber: string;
  customerName: string;
  pickupPersonName?: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalInPaise: number;
  createdAt: string;
  user: { email: string };
  pickupSlot: { date: string; startTime: string; endTime: string };
  items: OrderItem[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  READY_FOR_PICKUP: "Ready for pickup",
  PARTIALLY_ACCEPTED: "Partially accepted",
  PICKED_UP: "Picked up",
  CANCELLED: "Cancelled",
};

function statusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800";
    case "PARTIALLY_ACCEPTED":
      return "bg-orange-100 text-orange-800";
    case "READY_FOR_PICKUP":
      return "bg-purple-100 text-purple-800";
    case "PICKED_UP":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function availableStatuses(status: string) {
  if (status === "PENDING") return ["PENDING", "CANCELLED"];
  if (status === "CONFIRMED") return ["CONFIRMED", "READY_FOR_PICKUP", "CANCELLED"];
  if(status === "PARTIALLY_ACCEPTED") return ["PARTIALLY_ACCEPTED", "READY_FOR_PICKUP", "CANCELLED"];
  if (status === "READY_FOR_PICKUP") return ["READY_FOR_PICKUP", "CANCELLED"];
  return [status];
}

function parseWeightGrams(value: string | undefined) {
  if (!value) return 0;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms|g|gm|gram|grams)$/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  return Math.round(match[2].toLowerCase().startsWith("k") ? amount * 1000 : amount);
}

function packingWeightGrams(packing: { weight?: string; weightGrams?: number }) {
  return packing.weightGrams && packing.weightGrams > 0 ? packing.weightGrams : parseWeightGrams(packing.weight);
}

function requestedTotalWeight(item: OrderItem) {
  if (item.selectionType === "LOOSE") return (item.requestedWeightGrams || 0) * item.requestedQuantity;
  const packing = item.product?.packagingSizes?.find((candidate) => candidate.label === item.packingLabel);
  return packing ? packingWeightGrams(packing) * item.requestedQuantity : 0;
}

function fulfillmentDefaults(item: OrderItem, current?: FulfillmentOption) {
  const selectionType = current?.selectionType || (item.selectionType === "LOOSE" ? "LOOSE" : "PACKED");
  const totalWeightGrams = current?.totalWeightGrams || requestedTotalWeight(item);
  return {
    selectionType,
    label: current?.label || (selectionType === "LOOSE" ? "Loose quantity" : item.acceptedPackingLabel || item.packingLabel || "default"),
    weight: current?.weight || (selectionType === "LOOSE" ? `${totalWeightGrams}g` : item.acceptedPackingWeight || item.packingWeight || ""),
    totalWeightGrams,
    note: current?.note || item.fulfillmentNote || "",
  } satisfies FulfillmentOption;
}

function previewAcceptedTotal(item: OrderItem, option: FulfillmentOption, selectedPacking: { priceInPaise?: number; weight?: string; weightGrams?: number } | undefined, selectedWeight: number, derivedQuantity: number | null) {
  if (!option.totalWeightGrams) return item.totalPriceInPaise;
  if (option.selectionType === "LOOSE") {
    const rule = item.product?.loosePricingRules?.find((candidate) => option.totalWeightGrams >= candidate.minWeightGrams && (candidate.maxWeightGrams == null || option.totalWeightGrams <= candidate.maxWeightGrams));
    if (!rule) return item.totalPriceInPaise;
    return rule.rateUnit === "KILOGRAM" ? Math.round(rule.rateInPaise * option.totalWeightGrams / 1000) : rule.rateInPaise * option.totalWeightGrams;
  }
  if (!selectedPacking || !selectedWeight || !derivedQuantity) return item.totalPriceInPaise;
  const unitPrice = selectedPacking.priceInPaise ?? item.product?.priceInPaise ?? (item.product?.price || 0) * 100;
  return unitPrice * derivedQuantity;
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Order summary</h3>
        <p className="text-lg font-bold text-brand-maroon">₹{(order.totalInPaise / 100).toFixed(2)}</p>
      </div>
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-gray-700">
              {item.productName} <span className="text-gray-400">× {item.quantity}</span>
            </span>
            <span className="font-semibold text-gray-900">₹{(item.totalPriceInPaise / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickupCode, setPickupCode] = useState("");
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [fulfillmentLoading, setFulfillmentLoading] = useState(false);
  const [paymentPaid, setPaymentPaid] = useState(false);
  const [pickedUp, setPickedUp] = useState(false);
  const [message, setMessage] = useState("");
  const [acceptedItems, setAcceptedItems] = useState<Record<string, string[]>>({});
  const [fulfillmentOptions, setFulfillmentOptions] = useState<Record<string, Record<string, FulfillmentOption>>>({});
  const [orderView, setOrderView] = useState<"active" | "past">("active");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showPickupVerification, setShowPickupVerification] = useState(false);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch(`${API_URL}/orders/all`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      setOrders(await res.json());
    } catch (error) {
      console.error(error);
      if (showLoading) setMessage("Unable to load orders.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
    const refreshInterval = window.setInterval(() => {
      void fetchOrders(false);
    }, 10000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  const selectedItemsFor = (order: Order) =>
    acceptedItems[order.id] ?? order.items.filter((item) => item.available !== false).map((item) => item.id);

  const toggleItem = (order: Order, itemId: string) => {
    const selected = selectedItemsFor(order);
    setAcceptedItems((current) => ({
      ...current,
      [order.id]: selected.includes(itemId) ? selected.filter((id) => id !== itemId) : [...selected, itemId],
    }));
  };

  const updateFulfillmentOption = (orderId: string, itemId: string, field: "label" | "weight" | "note", value: string) => {
    setFulfillmentOptions((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [itemId]: {
          selectionType: current[orderId]?.[itemId]?.selectionType || "PACKED",
          label: current[orderId]?.[itemId]?.label || "",
          weight: current[orderId]?.[itemId]?.weight || "",
          totalWeightGrams: current[orderId]?.[itemId]?.totalWeightGrams || 0,
          note: current[orderId]?.[itemId]?.note || "",
          [field]: value,
        },
      },
    }));
  };

  const updateFulfillmentSelection = (orderId: string, itemId: string, selectionType: "PACKED" | "LOOSE", label: string, weight: string) => {
    setFulfillmentOptions((current) => ({
      ...current,
      [orderId]: {
        ...current[orderId],
        [itemId]: {
          selectionType,
          label,
          weight,
          totalWeightGrams: current[orderId]?.[itemId]?.totalWeightGrams || 0,
          note: current[orderId]?.[itemId]?.note || "",
        },
      },
    }));
  };

  const confirmAvailableItems = async (order: Order) => {
    const selected = new Set(selectedItemsFor(order));
    const items = order.items.map((item) => {
      // A dropdown change can create a partial local option with a zero weight.
      // Resolve it through the same defaults used by the editor before sending
      // the request, so the API receives a valid requested weight.
      const option = fulfillmentDefaults(item, fulfillmentOptions[order.id]?.[item.id]);
      return {
        id: item.id,
        quantity: selected.has(item.id) ? 1 : 0,
        acceptedSelectionType: selected.has(item.id) ? option.selectionType : undefined,
        acceptedTotalWeightGrams: selected.has(item.id) ? option.totalWeightGrams : undefined,
        acceptedPackingLabel: selected.has(item.id) ? option.label : undefined,
        acceptedPackingWeight: selected.has(item.id) ? option.weight : undefined,
        fulfillmentNote: selected.has(item.id) ? option.note : undefined,
      };
    });
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/confirm`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Unable to confirm available items.");
        setToast({ message: data.error || "Unable to confirm available items.", type: "error" });
        return;
      }
      setOrders((current) => current.map((item) => item.id === order.id ? data : item));
      setAcceptedItems((current) => ({
        ...current,
        [order.id]: data.items.filter((item: OrderItem) => item.available !== false).map((item: OrderItem) => item.id),
      }));
      setMessage(`Order ORD${String(order.serialNumber).padStart(6, "0")} confirmed for preparation.`);
      setToast({ message: "Order confirmed for preparation.", type: "success" });
    } catch (error) {
      console.error(error);
      setMessage("Unable to confirm available items.");
      setToast({ message: "Unable to confirm available items.", type: "error" });
    }
  };

  const updateOrderStatus = async (order: Order, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to update order status.");
        setToast({ message: data.error || "Failed to update order status.", type: "error" });
        return;
      }
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item));
      if (verifiedOrder?.id === order.id) {
        setVerifiedOrder((current) => current ? { ...current, status } : current);
      }
      if (status === "CANCELLED" || status === "PICKED_UP") {
        setToast({
          message: status === "CANCELLED" ? "Order cancelled successfully." : "Order completed successfully.",
          type: "success",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to update order status.");
      setToast({ message: "Failed to update order status.", type: "error" });
    }
  };

  const lookupOrder = async () => {
    if (!pickupCode.trim()) return;
    setLookupLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/orders/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pickupCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifiedOrder(null);
        setMessage(data.error || "No order found for this pickup code.");
        return;
      }
      setVerifiedOrder(data);
      setShowPickupVerification(true);
      setPaymentPaid(data.paymentStatus === "PAID");
      setPickedUp(data.status === "PICKED_UP");
    } catch (error) {
      console.error(error);
      setMessage("Unable to verify pickup code.");
    } finally {
      setLookupLoading(false);
    }
  };

  const updateFulfillment = async () => {
    if (!verifiedOrder) return;
    setFulfillmentLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${verifiedOrder.id}/fulfillment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pickupCode, pickedUp, paymentPaid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Unable to update fulfillment.");
        setToast({ message: data.error || "Unable to update fulfillment.", type: "error" });
        return;
      }
      setVerifiedOrder(data);
      setOrders((current) => current.map((item) => item.id === data.id ? data : item));
      setMessage("Fulfillment updated.");
      setVerifiedOrder(null);
      setPickupCode("");
      setPaymentPaid(false);
      setPickedUp(false);
      const next = orders.find((candidate) => candidate.id !== data.id && ["PENDING", "PARTIALLY_ACCEPTED"].includes(candidate.status));
      if (next) window.setTimeout(() => document.getElementById(`order-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      setToast({ message: pickedUp ? "Order completed successfully." : "Fulfillment updated successfully.", type: "success" });
    } catch (error) {
      console.error(error);
      setMessage("Unable to update fulfillment.");
      setToast({ message: "Unable to update fulfillment.", type: "error" });
    } finally {
      setFulfillmentLoading(false);
    }
  };

  const activeOrders = orders.filter((order) => !PAST_ORDER_STATUSES.has(order.status));
  const pastOrders = orders.filter((order) => PAST_ORDER_STATUSES.has(order.status));
  const visibleOrders = (orderView === "active" ? activeOrders : pastOrders).filter((order) => {
    const matchesSearch = `${order.customerName} ${order.user.email} ORD${order.serialNumber}`.toLowerCase().includes(orderSearch.trim().toLowerCase());
    return matchesSearch && (queueFilter === "ALL" || order.status === queueFilter);
  });
  const selectedOrder = visibleOrders.find((order) => order.id === selectedOrderId) || null;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="min-w-0 space-y-4 sm:space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Operations</p>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Orders Management</h1>
        </div>
        <button onClick={() => void fetchOrders()} className="text-sm font-semibold text-gray-600 hover:text-brand-maroon">
          Refresh
        </button>
      </div>

      <section className="rounded-2xl border border-brand-gold/30 bg-brand-cream/30 p-3 shadow-sm sm:p-5">
        <button type="button" onClick={() => setShowPickupVerification((current) => !current)} className="flex w-full items-center justify-between gap-3 text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon">Verify pickup</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">Find an order by customer pickup code</h2>
          </div>
          <span className="rounded-full border border-brand-maroon/20 bg-white px-3 py-1 text-xs font-bold text-brand-maroon">{showPickupVerification ? "Hide" : "Open"}</span>
        </button>
        {showPickupVerification && <div className="mt-3 sm:mt-4">
        <div className="mb-3 sm:mb-4">
          <p className="mt-1 text-sm text-gray-600">
            The order board below never displays pickup codes. Use this portal only when a customer presents their code.
          </p>
          <p className="mt-1 text-sm text-gray-600">ગ્રાહક પિકઅપ નંબર બતાવે ત્યારે જ અહીંથી ઓર્ડર શોધીને ચકાસો.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={pickupCode}
            onChange={(event) => {
              setPickupCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8));
              setVerifiedOrder(null);
              setMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void lookupOrder();
            }}
            placeholder="Enter pickup code"
            maxLength={8}
            inputMode="text"
            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold tracking-wider outline-none focus:border-brand-maroon focus:ring-2 focus:ring-brand-maroon/10 sm:px-4 sm:py-3"
          />
          <button
            onClick={() => void lookupOrder()}
            disabled={pickupCode.length !== 8 || lookupLoading}
            className="rounded-xl bg-brand-maroon px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3"
          >
            {lookupLoading ? "Verifying..." : "Open verification"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm font-semibold text-brand-maroon">{message}</p>}
        </div>}
      </section>

      {verifiedOrder && (
        <section className="rounded-2xl border border-brand-maroon/20 bg-white p-3 shadow-sm sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-gold">Verified customer</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">{verifiedOrder.customerName}</h2>
              <p className="text-sm text-gray-500">{verifiedOrder.user.email}</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">Pickup person: {verifiedOrder.pickupPersonName || verifiedOrder.customerName}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(verifiedOrder.status)}`}>
              {statusLabels[verifiedOrder.status] || verifiedOrder.status}
            </span>
          </div>

          <div className="mb-4 grid gap-3 sm:mb-6 sm:gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pickup slot</p>
              <p className="mt-2 font-semibold text-gray-900">
                {new Date(verifiedOrder.pickupSlot.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">{verifiedOrder.pickupSlot.startTime} - {verifiedOrder.pickupSlot.endTime}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Payment</p>
              <p className="mt-2 font-semibold text-gray-900">{verifiedOrder.paymentMethod}</p>
              <p className={`text-sm font-bold ${verifiedOrder.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                {verifiedOrder.paymentStatus}
              </p>
            </div>
          </div>

          <OrderSummary order={verifiedOrder} />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm font-semibold">
              <input type="checkbox" checked={paymentPaid} onChange={(event) => setPaymentPaid(event.target.checked)} className="h-4 w-4 accent-green-600" />
              Payment received
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={pickedUp}
                disabled={verifiedOrder.status !== "READY_FOR_PICKUP" && verifiedOrder.status !== "PICKED_UP"}
                onChange={(event) => setPickedUp(event.target.checked)}
                className="h-4 w-4 accent-brand-maroon"
              />
              Order picked up
            </label>
          </div>
          <button
            onClick={() => void updateFulfillment()}
            disabled={fulfillmentLoading || (!paymentPaid && !pickedUp)}
            className="mt-4 w-full rounded-xl border border-brand-maroon px-5 py-3 text-sm font-bold text-brand-maroon disabled:cursor-not-allowed disabled:opacity-40"
          >
            {fulfillmentLoading ? "Saving..." : "Save verified fulfillment"}
          </button>
        </section>
      )}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-3 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-gray-900">Order status board</h2>
          <p className="mt-1 text-sm text-gray-500">Review availability, adjust what can be prepared, then confirm the order.</p>
          <p className="mt-1 text-sm text-gray-500">ઉપલબ્ધતા તપાસો, તૈયાર કરી શકાય તેવું પ્રમાણ નક્કી કરો અને પછી ઓર્ડર કન્ફર્મ કરો.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500"><span><strong className="text-gray-700">1.</strong> Select items · વસ્તુઓ પસંદ કરો</span><span><strong className="text-gray-700">2.</strong> Set quantity or weight · જથ્થો/વજન નક્કી કરો</span><span><strong className="text-gray-700">3.</strong> Add a note if needed · જરૂર હોય તો નોંધ લખો</span><span><strong className="text-gray-700">4.</strong> Confirm preparation · તૈયારી કન્ફર્મ કરો</span></div>
          <div className="mt-3 flex w-full rounded-xl border border-gray-200 bg-white p-1 sm:mt-4 sm:w-fit">
            {[
              { key: "active" as const, label: "Active orders", count: activeOrders.length },
              { key: "past" as const, label: "Past orders", count: pastOrders.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setOrderView(tab.key)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition-colors sm:flex-none sm:px-4 sm:text-sm ${
                  orderView === tab.key
                    ? "bg-brand-maroon text-white"
                    : "text-gray-500 hover:text-brand-maroon"
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  orderView === tab.key ? "bg-white/20" : "bg-gray-100"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex min-w-0 flex-col gap-2 sm:mt-4 sm:flex-row"><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search customer, email, or serial number" className="min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm sm:w-80" /><select value={queueFilter} onChange={(event) => setQueueFilter(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="ALL">All queues</option><option value="PENDING">Needs review</option><option value="PARTIALLY_ACCEPTED">Partially accepted</option><option value="CONFIRMED">Confirmed</option><option value="READY_FOR_PICKUP">Ready for pickup</option></select></div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {orderView === "active" ? "active" : "past"} orders found.
          </div>
        ) : (
          <div className="grid min-h-[28rem] lg:grid-cols-[19rem_minmax(0,1fr)]">
            <aside className={`${selectedOrderId ? "hidden lg:block" : "block"} min-w-0 border-b border-gray-100 lg:border-b-0 lg:border-r`}>
              <div className="max-h-[65vh] overflow-y-auto p-2 sm:p-3">
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{visibleOrders.length} order{visibleOrders.length === 1 ? "" : "s"}</p>
                <div className="space-y-2">
                  {visibleOrders.map((order) => {
                    const needsReview = order.status === "PENDING" || order.status === "PARTIALLY_ACCEPTED";
                    return <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedOrderId === order.id ? "border-brand-maroon bg-brand-cream/40 shadow-sm" : "border-gray-200 bg-white hover:border-brand-gold"}`}>
                      <div className="flex items-start justify-between gap-2"><span className="min-w-0 truncate text-sm font-bold text-gray-900">{order.customerName}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(order.status)}`}>{needsReview ? "Needs review" : "Reviewed"}</span></div>
                      <p className="mt-1 text-xs font-semibold text-brand-maroon">ORD{String(order.serialNumber).padStart(6, "0")}</p>
                      <p className="mt-1 truncate text-xs text-gray-500">{new Date(order.pickupSlot.date).toLocaleDateString()} · {order.pickupSlot.startTime} - {order.pickupSlot.endTime}</p>
                      <div className="mt-2 flex justify-between text-xs text-gray-500"><span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span><span className="font-semibold text-gray-800">₹{(order.totalInPaise / 100).toFixed(2)}</span></div>
                    </button>;
                  })}
                </div>
              </div>
            </aside>
            <div className={`${selectedOrderId ? "block" : "hidden lg:block"} min-w-0 p-3 sm:p-5`}>
              {!selectedOrder ? <div className="flex min-h-[28rem] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">Select an order from the list to review it.<br />ઓર્ડરની વિગતો જોવા ડાબી બાજુથી ઓર્ડર પસંદ કરો.</div> : <>
                <button type="button" onClick={() => setSelectedOrderId(null)} className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:border-brand-maroon hover:text-brand-maroon lg:hidden">← Back to orders</button>
            {visibleOrders.filter((order) => order.id === selectedOrderId).map((order) => (
                  <div id={`order-${order.id}`} key={order.id} className="min-w-0 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:gap-5 sm:p-6">
                <div>
                  {(() => {
                    const reviewed = order.status !== "PENDING";
                    const originalItemCount = order.items.reduce((sum, item) => sum + item.requestedQuantity, 0);
                    const acceptedItemCount = reviewed ? order.items.reduce((sum, item) => sum + (item.available === false ? 0 : item.quantity), 0) : 0;
                    const changedItemCount = reviewed ? order.items.filter((item) => item.available === false || item.quantity !== item.requestedQuantity || (item.acceptedPackingLabel && item.acceptedPackingLabel !== item.packingLabel) || (item.acceptedWeightGrams && item.requestedWeightGrams && item.acceptedWeightGrams !== item.requestedWeightGrams)).length : 0;
                    return <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-brand-gold/20 bg-brand-cream/20 p-3 text-xs sm:grid-cols-4">
                      <div><p className="text-gray-500">Original items</p><p className="mt-1 font-bold text-gray-900">{originalItemCount}</p></div>
                      <div><p className="text-gray-500">Accepted items</p><p className="mt-1 font-bold text-gray-900">{reviewed ? acceptedItemCount : "—"}</p></div>
                      <div><p className="text-gray-500">Changed items</p><p className={`mt-1 font-bold ${changedItemCount ? "text-orange-700" : "text-green-700"}`}>{reviewed ? changedItemCount : "—"}</p></div>
                      <div><p className="text-gray-500">Order total</p><p className="mt-1 font-bold text-brand-maroon">₹{(order.totalInPaise / 100).toFixed(2)}</p></div>
                    </div>;
                  })()}
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-bold text-gray-900">{order.customerName} · ORD{String(order.serialNumber).padStart(6, "0")}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"} · ₹{(order.totalInPaise / 100).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Pickup: {new Date(order.pickupSlot.date).toLocaleDateString()} · {order.pickupSlot.startTime} - {order.pickupSlot.endTime}
                  </p>
                  <div className="mt-4 w-full">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-gray-500">What can we prepare?</p><p className="mt-1 text-xs text-gray-400">Untick anything unavailable. Accepted values are editable below.</p><p className="mt-1 text-xs text-gray-400">જે ઉપલબ્ધ ન હોય તે અનચેક કરો; નીચે સ્વીકારેલું પેકિંગ અને જથ્થો બદલી શકો છો.</p></div><span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-gray-500">{selectedItemsFor(order).length}/{order.items.length} selected</span></div>
                      <div className="space-y-3 overflow-visible">
                        {order.items.map((item) => {
                          const option = fulfillmentDefaults(item, fulfillmentOptions[order.id]?.[item.id]);
                          const availablePackings = (item.product?.packagingSizes || []).filter((packing) => packing.label && packing.availability !== "UNAVAILABLE");
                          const chosenPacking = availablePackings.find((packing) => packing.label === option.label);
                          const chosenWeight = option.selectionType === "PACKED" ? packingWeightGrams(chosenPacking || {}) : 0;
                          const derivedQuantity = option.selectionType === "PACKED" && chosenWeight && option.totalWeightGrams % chosenWeight === 0 ? option.totalWeightGrams / chosenWeight : null;
                          const looseQuantity = option.selectionType === "LOOSE" && item.requestedWeightGrams && option.totalWeightGrams % item.requestedWeightGrams === 0 ? option.totalWeightGrams / item.requestedWeightGrams : null;
                          const previewTotalInPaise = previewAcceptedTotal(item, option, chosenPacking, chosenWeight, derivedQuantity);
                          const editable = order.status === "PENDING" || order.status === "PARTIALLY_ACCEPTED";
                          return <label key={item.id} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                            <input
                              type="checkbox"
                              checked={selectedItemsFor(order).includes(item.id)}
                              disabled={order.status !== "PENDING" && order.status !== "PARTIALLY_ACCEPTED"}
                              onChange={() => toggleItem(order, item.id)}
                              className="mt-1 h-4 w-4 accent-brand-maroon"
                            />
                            <span className="min-w-0">
                              <span className="block font-semibold text-gray-900">{item.productName}</span>
                              <span className="mt-1 block text-xs text-gray-500">Requested: {item.selectionType === "LOOSE" ? `Loose ${formatWeightGrams(item.requestedWeightGrams)}` : `${item.packingLabel || "Default"}${item.packingWeight ? ` · ${formatWeightText(item.packingWeight)}` : ""}`} · {item.requestedQuantity} unit{item.requestedQuantity === 1 ? "" : "s"} · {formatRate(item.unitPriceInPaise, item.selectionType === "LOOSE" ? (item.pricingUnit || "KILOGRAM") : "PACK")}</span>
                              <span className="mt-3 grid gap-2 sm:grid-cols-2">
                                <span><span className="mb-1 block text-[11px] font-semibold text-gray-500">Serve as</span>
                                  <select aria-label={`Serve option for ${item.productName}`} value={`${option.selectionType}:${option.label}`} disabled={!editable || !selectedItemsFor(order).includes(item.id)} onChange={(event) => { const [type, ...labelParts] = event.target.value.split(":"); const label = labelParts.join(":"); const packing = availablePackings.find((candidate) => candidate.label === label); updateFulfillmentSelection(order.id, item.id, type as "PACKED" | "LOOSE", label, type === "LOOSE" ? `${option.totalWeightGrams}g` : packing?.weight || ""); }} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"><optgroup label="Available packings">{availablePackings.map((packing) => <option key={packing.label} value={`PACKED:${packing.label}`}>{packing.label} · {formatWeightText(packing.weight)}</option>)}</optgroup>{item.product?.allowLooseQuantity && <option value="LOOSE:Loose quantity">Loose quantity</option>}</select>
                                </span>
                                <span><span className="mb-1 block text-[11px] font-semibold text-gray-500">Total weight to prepare (g)</span>
                                  <input aria-label={`Total weight for ${item.productName}`} type="number" min="1" max={requestedTotalWeight(item) || 1000000} value={option.totalWeightGrams || ""} disabled={!editable || !selectedItemsFor(order).includes(item.id)} onChange={(event) => { const totalWeightGrams = Math.min(requestedTotalWeight(item) || 1000000, Math.max(1, Number(event.target.value) || 1)); setFulfillmentOptions((current) => ({ ...current, [order.id]: { ...current[order.id], [item.id]: { ...option, totalWeightGrams, weight: option.selectionType === "LOOSE" ? `${totalWeightGrams}g` : option.weight } } })); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                                </span>
                                <span className="rounded-lg bg-brand-cream/40 px-3 py-2 text-xs text-gray-600 sm:col-span-2">{option.selectionType === "PACKED" ? (derivedQuantity ? `System will prepare ${derivedQuantity} × ${formatWeightGrams(chosenWeight)} pack${derivedQuantity === 1 ? "" : "s"}.` : "Choose a packing whose weight divides the total exactly.") : looseQuantity ? `System will prepare ${looseQuantity} × ${formatWeightGrams(item.requestedWeightGrams)} loose unit${looseQuantity === 1 ? "" : "s"}.` : "Choose a total weight that divides into whole loose units."}</span>
                                <span className="sm:col-span-2"><span className="mb-1 block text-[11px] font-semibold text-gray-500">Note to customer (optional) · ગ્રાહક માટે નોંધ (વૈકલ્પિક)</span>
                                  <input aria-label={`Customer note for ${item.productName}`} type="text" value={option.note} disabled={!editable || !selectedItemsFor(order).includes(item.id)} onChange={(event) => updateFulfillmentOption(order.id, item.id, "note", event.target.value)} placeholder="Explain a substitution, shortage, or packing change" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                                </span>
                              </span>
                            </span>
                            <span className="text-right sm:min-w-[96px]"><span className="block font-bold text-brand-maroon">₹{(previewTotalInPaise / 100).toFixed(2)}</span>{previewTotalInPaise !== item.totalPriceInPaise && <span className="mt-1 block text-[10px] text-gray-400">was ₹{(item.totalPriceInPaise / 100).toFixed(2)}</span>}</span>
                          </label>
                        })}
                      </div>
                      <button
                        onClick={() => void confirmAvailableItems(order)}
                        disabled={order.status !== "PENDING" && order.status !== "PARTIALLY_ACCEPTED"}
                        className="sticky bottom-2 z-10 mt-4 w-full rounded-lg bg-brand-maroon px-4 py-3 text-sm font-bold text-white shadow-lg ring-4 ring-white disabled:cursor-not-allowed disabled:opacity-40 sm:static sm:shadow-none sm:ring-0"
                      >
                        Confirm and prepare selected items · પસંદ કરેલી વસ્તુઓ કન્ફર્મ કરો
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 lg:justify-end">
                  {availableStatuses(order.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => void updateOrderStatus(order, status)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                        status === order.status
                          ? "bg-brand-maroon text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-brand-cream hover:text-brand-maroon"
                      }`}
                    >
                      {statusLabels[status] || status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
              </>}
            </div>
          </div>
        )}
      </section>
      </div>
    </>
  );
}
