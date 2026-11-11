"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Controls = {
  inventoryManagementEnabled: boolean;
  generalStoreEnabled: boolean;
  generalStoreCatalogueOpen: boolean;
  generalStoreCartOpen: boolean;
  generalStoreCheckoutOpen: boolean;
  generalStoreOrdersOpen: boolean;
  generalStorePickupOpen: boolean;
  generalStoreNotificationsOpen: boolean;
  generalStoreMaintenanceMessage: string;
};

const defaults: Controls = {
  inventoryManagementEnabled: false,
  generalStoreEnabled: true,
  generalStoreCatalogueOpen: true,
  generalStoreCartOpen: true,
  generalStoreCheckoutOpen: true,
  generalStoreOrdersOpen: true,
  generalStorePickupOpen: true,
  generalStoreNotificationsOpen: true,
  generalStoreMaintenanceMessage: "General Store ordering is temporarily unavailable.",
};

function Switch({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onChange} className={`relative inline-flex h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-600"} disabled:cursor-not-allowed disabled:opacity-50`}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} /></button>;
}

function ControlRow({ label, description, checked, disabled, onChange, danger }: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: () => void; danger?: boolean }) {
  return <div className={`flex items-start justify-between gap-4 border-b border-slate-800 px-4 py-4 last:border-0 sm:px-5 ${danger && checked ? "bg-red-950/30" : ""}`}><div className="min-w-0"><p className="font-semibold text-slate-100">{label}</p><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div><Switch checked={checked} disabled={disabled} onChange={onChange} /></div>;
}

export default function GeneralStoreControlPanel() {
  const { data: session } = authClient.useSession();
  const [controls, setControls] = useState<Controls>(defaults);
  const [initial, setInitial] = useState<Controls>(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [controlPin, setControlPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const isSuperAdmin = ["SUPER_ADMIN", "super_admin", "superadmin"].includes(session?.user.role ?? "");
  const dirty = JSON.stringify(controls) !== JSON.stringify(initial);
  const openRoutes = useMemo(() => [controls.generalStoreCatalogueOpen, controls.generalStoreCartOpen, controls.generalStoreCheckoutOpen, controls.generalStoreOrdersOpen, controls.generalStorePickupOpen].filter(Boolean).length, [controls]);

  useEffect(() => {
    if (!unlocked) return;
    fetch(`${API_URL}/settings/store`, { credentials: "include", headers: { "x-general-store-control-pin": controlPin } }).then(async (res) => { const data = await res.json().catch(() => null); if (!res.ok) throw new Error(data?.error || "Unable to load controls"); return data; }).then((data) => { const next = { ...defaults, ...data }; setControls(next); setInitial(next); }).catch((error) => { setUnlocked(false); setMessage(error instanceof Error ? error.message : "Unable to load controls."); }).finally(() => setLoading(false));
  }, [unlocked, controlPin]);

  const toggle = (key: keyof Controls) => setControls((current) => ({ ...current, [key]: !current[key] }));
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`${API_URL}/settings/store`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json", "x-general-store-control-pin": controlPin }, body: JSON.stringify(controls) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save controls");
      const next = { ...defaults, ...data }; setControls(next); setInitial(next); setMessage("Control changes are live.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save controls"); } finally { setSaving(false); }
  };

  if (!isSuperAdmin) return <div className="rounded-2xl border border-red-900/30 bg-red-950/20 p-6 text-sm font-semibold text-red-300">Super admin access is required.</div>;

  if (!unlocked) return <div className="mx-auto max-w-lg rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Restricted operations</p><h1 className="mt-3 font-heading text-3xl font-bold">Unlock control centre</h1><p className="mt-3 text-sm leading-6 text-slate-400">Enter the separate control-centre PIN configured on the API server. It is never stored in this browser.</p><form onSubmit={(event) => { event.preventDefault(); setMessage(""); setLoading(true); setUnlocked(true); }} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-slate-200">Control-centre PIN<input autoFocus type="password" inputMode="numeric" autoComplete="off" value={controlPin} onChange={(event) => setControlPin(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-lg tracking-[0.35em] text-white outline-none focus:border-amber-400" placeholder="Enter PIN" /></label><button type="submit" disabled={controlPin.length < 6 || loading} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Checking…" : "Unlock control centre"}</button>{message && <p role="alert" className="text-sm font-semibold text-red-300">{message}</p>}</form></div>;

  return <div className="min-w-0 space-y-6 pb-8">
    <header className="rounded-3xl border border-slate-700 bg-slate-950 p-5 text-white shadow-2xl sm:p-7"><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Operations command</p><h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">General Store control centre</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Control customer access, order intake, pickup operations, and notifications from one guarded panel. Changes affect server-side route enforcement.</p></div><div className={`rounded-2xl border px-4 py-3 ${controls.generalStoreEnabled ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/40 bg-red-500/10"}`}><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Store status</p><p className={`mt-1 text-lg font-bold ${controls.generalStoreEnabled ? "text-emerald-400" : "text-red-400"}`}>{controls.generalStoreEnabled ? "LIVE" : "PAUSED"}</p></div></div></header>
    <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Open routes</p><p className="mt-2 text-2xl font-bold text-slate-900">{openRoutes}/5</p><p className="mt-1 text-xs text-slate-500">Customer route groups available</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Checkout mode</p><p className="mt-2 text-2xl font-bold text-slate-900">{controls.generalStoreCheckoutOpen ? "Accepting" : "Blocked"}</p><p className="mt-1 text-xs text-slate-500">Pickup payment remains enforced</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Changes</p><p className="mt-2 text-2xl font-bold text-slate-900">{dirty ? "Unsaved" : "Synced"}</p><p className="mt-1 text-xs text-slate-500">Server control state</p></div></section>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
      <section className="min-w-0 overflow-hidden rounded-2xl bg-slate-950 shadow-xl"><div className="border-b border-slate-800 px-4 py-4 sm:px-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Emergency gate</p><h2 className="mt-1 text-lg font-bold text-white">Store-wide access</h2></div><ControlRow label="General Store enabled" description="Master switch. When off, catalogue, cart, checkout, and pickup APIs refuse new customer activity." checked={controls.generalStoreEnabled} disabled={loading} onChange={() => toggle("generalStoreEnabled")} danger /><ControlRow label="Catalogue open" description="Allow public product listing and product detail pages." checked={controls.generalStoreCatalogueOpen} disabled={loading} onChange={() => toggle("generalStoreCatalogueOpen")} /><ControlRow label="Cart open" description="Allow customers to view, add, update, and remove General Store cart lines." checked={controls.generalStoreCartOpen} disabled={loading} onChange={() => toggle("generalStoreCartOpen")} /><ControlRow label="Checkout open" description="Allow creation of new orders. Turn this off during pricing, slot, or payment incidents." checked={controls.generalStoreCheckoutOpen} disabled={loading} onChange={() => toggle("generalStoreCheckoutOpen")} danger /><ControlRow label="Order history open" description="Keep customer order history available even during a storefront pause." checked={controls.generalStoreOrdersOpen} disabled={loading} onChange={() => toggle("generalStoreOrdersOpen")} /><ControlRow label="Pickup slots open" description="Allow customers to load and select pickup capacity." checked={controls.generalStorePickupOpen} disabled={loading} onChange={() => toggle("generalStorePickupOpen")} /></section>
      <div className="min-w-0 space-y-6"><section className="overflow-hidden rounded-2xl bg-slate-950 shadow-xl"><div className="border-b border-slate-800 px-4 py-4 sm:px-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Platform services</p><h2 className="mt-1 text-lg font-bold text-white">Operational controls</h2></div><ControlRow label="Inventory mode" description="Expose inventory controls to staff. Availability and partial acceptance work independently." checked={controls.inventoryManagementEnabled} disabled={loading} onChange={() => toggle("inventoryManagementEnabled")} /><ControlRow label="Push notifications" description="Allow order status notifications when push is configured." checked={controls.generalStoreNotificationsOpen} disabled={loading} onChange={() => toggle("generalStoreNotificationsOpen")} /></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer message</p><h2 className="mt-1 text-lg font-bold text-slate-900">Maintenance response</h2><textarea value={controls.generalStoreMaintenanceMessage} onChange={(event) => setControls((current) => ({ ...current, generalStoreMaintenanceMessage: event.target.value }))} maxLength={240} rows={4} className="mt-4 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-maroon" /><p className="mt-2 text-xs text-slate-500">Shown when a blocked route is reached. {controls.generalStoreMaintenanceMessage.length}/240</p></section></div>
    </div>
    <footer className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4"><p className="text-sm font-semibold text-slate-600">{message || (dirty ? "You have unsaved control changes." : "All controls are synchronized.")}</p><div className="flex gap-2"><button type="button" onClick={() => { setControls(initial); setMessage(""); }} disabled={!dirty || saving} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-40 sm:flex-none">Discard</button><button type="button" onClick={() => void save()} disabled={!dirty || saving || loading} className="flex-1 rounded-xl bg-brand-maroon px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40 sm:flex-none">{saving ? "Applying…" : "Apply controls"}</button></div></footer>
  </div>;
}
