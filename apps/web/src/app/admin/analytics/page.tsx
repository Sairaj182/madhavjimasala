"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
type Analytics = {
  days: number;
  from: string;
  to: string;
  current: { orders: number; bookedPaise: number; paidPaise: number };
  previous: { orders: number; bookedPaise: number };
  statuses: { status: string; count: number }[];
  topProducts: { name: string; quantity: number; bookedPaise: number }[];
  daily: { day: string; orders: number; paidPaise: number }[];
  pendingOverdue: number;
  pickupSlots: { date: string; startTime: string; capacity: number; booked: number }[];
};

const money = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
const statusLabel = (status: string) => status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function Change({ current, previous }: { current: number; previous: number }) {
  if (!previous) return <span className="text-xs text-gray-500">{current ? "New this period" : "No activity in previous period"}</span>;
  const delta = Math.round(((current - previous) / previous) * 100);
  return <span className={`text-xs font-semibold ${delta > 0 ? "text-emerald-700" : delta < 0 ? "text-rose-700" : "text-gray-500"}`}>{delta > 0 ? "+" : ""}{delta}% vs previous period</span>;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/analytics?days=${days}`, { credentials: "include", cache: "no-store" });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error || "Could not load analytics.");
      setData(body as Analytics);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const average = useMemo(() => data?.current.orders ? data.current.bookedPaise / data.current.orders : 0, [data]);
  const peak = Math.max(1, ...(data?.daily.map((row) => row.orders) ?? []));
  const periodText = data ? `${new Date(data.from).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })} – ${new Date(data.to).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Store insights</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Order and fulfillment health from your existing store records.</p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="analytics-days" className="text-sm font-medium text-gray-600">Period</label>
          <select id="analytics-days" value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
          <button onClick={() => void load()} disabled={loading} className="rounded-lg border border-brand-maroon px-3 py-2 text-sm font-semibold text-brand-maroon disabled:opacity-50">Refresh</button>
        </div>
      </div>

      {periodText && <p className="text-xs text-gray-500">{periodText} · Compared with the preceding {days} days</p>}
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><span>{error}</span><button onClick={() => void load()} className="font-semibold underline">Try again</button></div>}
      {loading && !data ? <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">Loading store insights…</div> : data && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric title="Orders" value={data.current.orders.toLocaleString("en-IN")} detail={<Change current={data.current.orders} previous={data.previous.orders} />} />
          <Metric title="Booked value" value={money(data.current.bookedPaise)} detail={<Change current={data.current.bookedPaise} previous={data.previous.bookedPaise} />} />
          <Metric title="Cash recorded" value={money(data.current.paidPaise)} detail={<span className="text-xs text-gray-500">Marked paid at pickup</span>} />
          <Metric title="Average order value" value={money(average)} detail={<span className="text-xs text-gray-500">Booked value per non-cancelled order</span>} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-gray-900">Daily order activity</h2><p className="mt-1 text-xs text-gray-500">Number of non-cancelled orders placed each day</p></div><span className="text-xs text-gray-500">Peak: {peak}</span></div>
            {data.daily.length ? <div className="mt-6 flex h-44 items-end gap-1 overflow-x-auto border-b border-gray-100 pb-6">
              {data.daily.map((row) => <div key={row.day} title={`${row.day}: ${row.orders} orders`} className="group relative flex h-full min-w-2 flex-1 items-end justify-center">
                <div className="w-full max-w-5 rounded-t bg-brand-maroon/80 transition-colors group-hover:bg-brand-maroon" style={{ height: `${Math.max(row.orders ? 5 : 1, (row.orders / peak) * 100)}%` }} />
              </div>)}
            </div> : <p className="py-12 text-center text-sm text-gray-500">No orders in this period.</p>}
            {data.daily.length > 0 && <div className="mt-2 flex justify-between text-[11px] text-gray-500"><span>{data.daily[0]?.day}</span><span>{data.daily.at(-1)?.day}</span></div>}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">Order status</h2><p className="mt-1 text-xs text-gray-500">Current workflow state for orders placed in this period</p>
            {data.statuses.length ? <ul className="mt-4 divide-y divide-gray-100">{data.statuses.map((row) => <li key={row.status} className="flex items-center justify-between py-3 text-sm"><span className="text-gray-600">{statusLabel(row.status)}</span><span className="font-bold text-gray-900">{row.count}</span></li>)}</ul> : <p className="py-10 text-center text-sm text-gray-500">No orders yet.</p>}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="font-bold text-gray-900">Most ordered products</h2><p className="mt-1 text-xs text-gray-500">By fulfilled quantity in non-cancelled orders</p>
            {data.topProducts.length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[440px] text-left text-sm"><thead className="text-xs uppercase tracking-wide text-gray-400"><tr><th className="pb-2 font-semibold">Product</th><th className="pb-2 text-right font-semibold">Qty</th><th className="pb-2 text-right font-semibold">Booked</th></tr></thead><tbody className="divide-y divide-gray-100">{data.topProducts.map((row) => <tr key={row.name}><td className="py-3 pr-3 font-medium text-gray-800">{row.name}</td><td className="py-3 text-right text-gray-600">{row.quantity}</td><td className="py-3 text-right text-gray-600">{money(row.bookedPaise)}</td></tr>)}</tbody></table></div> : <p className="py-10 text-center text-sm text-gray-500">Product sales will appear after orders.</p>}
          </section>
          <section className={`rounded-2xl border p-5 shadow-sm ${data.pendingOverdue ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Needs review</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{data.pendingOverdue}</p>
            <p className="mt-1 text-sm text-gray-600">Orders waiting for review for over 24 hours</p>
            <a href="/admin/orders" className="mt-4 inline-flex text-sm font-semibold text-brand-maroon underline">Open orders</a>
          </section>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div><h2 className="font-bold text-gray-900">Pickup capacity · next 7 days</h2><p className="mt-1 text-xs text-gray-500">Booked orders versus slot capacity; cancelled orders are excluded.</p></div>
          {data.pickupSlots.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.pickupSlots.map((slot) => {
            const percent = slot.capacity ? Math.min(100, Math.round((slot.booked / slot.capacity) * 100)) : 0;
            return <div key={`${slot.date}-${slot.startTime}`} className="rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between gap-2 text-sm"><span className="font-semibold text-gray-800">{new Date(`${slot.date}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" })} · {slot.startTime}</span><span className="text-gray-600">{slot.booked}/{slot.capacity}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${percent >= 90 ? "bg-amber-500" : "bg-brand-maroon"}`} style={{ width: `${percent}%` }} /></div>
            </div>;
          })}</div> : <p className="py-8 text-center text-sm text-gray-500">No pickup slots in the next 7 days.</p>}
        </section>

        <p className="rounded-xl bg-gray-100/70 p-4 text-xs leading-5 text-gray-500">Booked value is the current order total and excludes cancelled orders. Cash recorded counts only orders explicitly marked paid. These figures are operational summaries, not accounting statements; today’s figures can change as orders are reviewed.</p>
      </>}
    </div>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: React.ReactNode }) {
  return <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-gray-500">{title}</p><p className="mt-2 text-2xl font-bold text-gray-900">{value}</p><div className="mt-2 min-h-4">{detail}</div></section>;
}
