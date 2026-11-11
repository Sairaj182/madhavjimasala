"use client";

import { useEffect, useMemo, useState } from "react";
import AdminProducts from "../products/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function GeneralStoreAdminDashboard() {
  const [products, setProducts] = useState<Array<{ isActive: boolean; packagingSizes?: unknown }>>([]);
  const [orders, setOrders] = useState<Array<{ status: string }>>([]);
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/products/admin?kind=GENERAL_STORE`, { credentials: "include" }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_URL}/orders/all`, { credentials: "include" }).then((r) => r.ok ? r.json() : []),
    ]).then(([productData, orderData]) => { setProducts(productData); setOrders(orderData); }).catch(() => undefined);
  }, []);
  const unavailable = useMemo(() => products.filter((product) => Array.isArray(product.packagingSizes) && product.packagingSizes.length > 0 && product.packagingSizes.every((packing) => typeof packing === "object" && packing !== null && "availability" in packing && packing.availability === "UNAVAILABLE")).length, [products]);
  const pending = orders.filter((order) => ["PENDING", "PARTIALLY_ACCEPTED"].includes(order.status)).length;
  return <div className="space-y-8">
    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Retail operations</p><h1 className="mt-2 font-heading text-3xl font-bold text-brand-dark">General Store control centre</h1><p className="mt-2 text-sm text-gray-500">Manage everyday products separately from the branded catalogue and review fulfillment work.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-gray-500">Products</p><p className="mt-2 text-3xl font-bold text-brand-maroon">{products.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-gray-500">Inactive / unavailable</p><p className="mt-2 text-3xl font-bold text-amber-700">{products.filter((p) => !p.isActive).length + unavailable}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-gray-500">Orders needing review</p><p className="mt-2 text-3xl font-bold text-brand-maroon">{pending}</p></div></div>
    <div className="rounded-2xl border border-brand-gold/20 bg-brand-cream/30 p-4 text-sm text-brand-gray">Product availability is controlled at packing level. Archive products instead of deleting them so past orders remain readable.</div>
    <AdminProducts />
  </div>;
}
