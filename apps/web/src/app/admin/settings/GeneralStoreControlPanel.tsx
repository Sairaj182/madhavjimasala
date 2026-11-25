"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

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
  generalStoreChatOpen: boolean;
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
  generalStoreChatOpen: false,
  generalStoreMaintenanceMessage: "General Store ordering is temporarily unavailable.",
};

function Switch({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onChange} className={`relative inline-flex h-8 w-14 shrink-0 overflow-hidden rounded-md border transition-all ${checked ? "border-emerald-400/50 bg-emerald-500/25 shadow-[inset_0_0_14px_rgba(16,185,129,0.18)]" : "border-slate-600 bg-slate-900"} disabled:cursor-not-allowed disabled:opacity-50`}><span className={`absolute left-1 top-1 h-6 w-6 rounded-sm border transition-all ${checked ? "translate-x-6 border-emerald-200 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" : "translate-x-0 border-slate-500 bg-slate-600"}`} /></button>;
}

function ControlRow({ label, description, checked, disabled, onChange, danger }: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: () => void; danger?: boolean }) {
  return <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-800/80 px-4 py-4 last:border-0 sm:px-5 ${danger && !checked ? "bg-red-950/35" : "bg-slate-950/35"}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-100">{label}</p>{danger && <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${checked ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>Critical</span>}</div><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">{description}</p></div><div className="flex items-center gap-3"><span className={`hidden min-w-14 text-right font-mono text-[10px] font-bold uppercase tracking-wider sm:block ${checked ? "text-emerald-400" : "text-slate-500"}`}>{checked ? "Enabled" : "Disabled"}</span><Switch checked={checked} disabled={disabled} onChange={onChange} /></div></div>;
}

export default function GeneralStoreControlPanel() {
  const [controls, setControls] = useState<Controls>(defaults);
  const [initial, setInitial] = useState<Controls>(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [canManageControls, setCanManageControls] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const dirty = JSON.stringify(controls) !== JSON.stringify(initial);
  const openRoutes = useMemo(() => [controls.generalStoreCatalogueOpen, controls.generalStoreCartOpen, controls.generalStoreCheckoutOpen, controls.generalStoreOrdersOpen, controls.generalStorePickupOpen].filter(Boolean).length, [controls]);
  const activeServices = useMemo(() => [controls.inventoryManagementEnabled, controls.generalStoreNotificationsOpen, controls.generalStoreChatOpen].filter(Boolean).length, [controls]);

  useEffect(() => {
    fetch(`${API_URL}/admin/permissions/me`, { credentials: "include", cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setCanManageControls(data?.permissions?.["store.controls"] === true))
      .catch(() => setCanManageControls(false))
      .finally(() => setPermissionLoading(false));
  }, []);

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const suppliedPin = pin.trim();
    if (!suppliedPin) return;
    setUnlocking(true);
    setPinError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/store`, {
        credentials: "include",
        cache: "no-store",
        headers: { "x-general-store-control-pin": suppliedPin },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Unable to unlock store controls.");
      const next = { ...defaults, ...data };
      setControls(next);
      setInitial(next);
      setUnlocked(true);
      setMessage("");
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "Unable to unlock store controls.");
      setPin("");
    } finally {
      setLoading(false);
      setUnlocking(false);
    }
  };

  const toggle = (key: keyof Controls) => setControls((current) => ({ ...current, [key]: !current[key] }));
  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`${API_URL}/settings/store`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json", "x-general-store-control-pin": pin.trim() }, body: JSON.stringify(controls) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to save controls");
      const next = { ...defaults, ...data }; setControls(next); setInitial(next); setMessage("Control changes are live.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save controls"); } finally { setSaving(false); }
  };

  if (permissionLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">Checking store control access…</div>;

  if (!canManageControls) return <div className="rounded-2xl border border-red-900/30 bg-red-950/20 p-6 text-sm font-semibold text-red-300">Your role does not have store control access.</div>;

  if (!unlocked) return <div className="mx-auto max-w-md rounded-3xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
    <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Protected controls</p>
    <h1 className="mt-2 font-heading text-3xl font-bold">Enter control PIN</h1>
    <p className="mt-3 text-sm leading-6 text-slate-400">Enter the General Store control PIN to view or change live operational settings.</p>
    <form onSubmit={(event) => void unlock(event)} className="mt-6 space-y-4">
      <div>
        <label htmlFor="control-centre-pin" className="block text-xs font-bold uppercase tracking-widest text-slate-300">Control PIN</label>
        <input id="control-centre-pin" type="password" inputMode="numeric" autoComplete="one-time-code" value={pin} onChange={(event) => setPin(event.target.value)} maxLength={64} autoFocus className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg tracking-[0.3em] text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15" />
      </div>
      {pinError && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300">{pinError}</p>}
      <button type="submit" disabled={!pin.trim() || unlocking} className="w-full rounded-xl bg-brand-maroon px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-maroon-dark disabled:cursor-not-allowed disabled:opacity-50">{unlocking ? "Verifying…" : "Unlock control centre"}</button>
    </form>
  </div>;

  return <div className="min-w-0 pb-4">
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-700/45 bg-[#080c12]/95 shadow-[0_24px_70px_rgba(0,0,0,0.32),0_0_80px_rgba(30,41,59,0.16)] backdrop-blur-sm">
      <div className={`flex flex-col gap-2 border-b px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] sm:flex-row sm:items-center sm:justify-between sm:px-6 ${dirty ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300"}`}>
        <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${dirty ? "animate-pulse bg-amber-400" : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"}`} />{dirty ? "Configuration modified · authorization required" : "PIN verified · protected session active"}</span>
        <span className="text-slate-500">Changes affect live customer access</span>
      </div>

      <header className="border-b border-slate-800 px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">General Store · Operations authority</p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">Protected control centre</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Manage live storefront gates and operational services. Changes remain staged until they are explicitly applied.</p>
          </div>
          <div className="flex items-stretch gap-3">
            <div className={`min-w-32 border px-4 py-3 ${controls.generalStoreEnabled ? "border-emerald-500/35 bg-emerald-500/10" : "border-red-500/45 bg-red-500/10"}`}>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Store state</p>
              <p className={`mt-1 flex items-center gap-2 font-mono text-sm font-bold ${controls.generalStoreEnabled ? "text-emerald-300" : "text-red-300"}`}><span className={`h-2 w-2 rounded-full ${controls.generalStoreEnabled ? "bg-emerald-400" : "animate-pulse bg-red-400"}`} />{controls.generalStoreEnabled ? "LIVE" : "PAUSED"}</p>
            </div>
            <button type="button" onClick={() => { setUnlocked(false); setPin(""); setPinError(""); }} className="border border-slate-700 bg-slate-900 px-4 py-3 text-left transition hover:border-slate-500 hover:bg-slate-800"><span className="block font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Security</span><span className="mt-1 block text-sm font-bold text-slate-200">Lock panel</span></button>
          </div>
        </div>
      </header>

      <section className="grid border-b border-slate-800 sm:grid-cols-3">
        <div className="border-b border-slate-800 px-5 py-4 sm:border-b-0 sm:border-r"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Customer routes</p><div className="mt-2 flex items-end justify-between gap-3"><p className="font-mono text-2xl font-bold text-white">{openRoutes}<span className="text-sm text-slate-600">/5</span></p><span className={openRoutes === 5 ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-amber-400"}>{openRoutes === 5 ? "All available" : `${5 - openRoutes} restricted`}</span></div></div>
        <div className="border-b border-slate-800 px-5 py-4 sm:border-b-0 sm:border-r"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Checkout intake</p><p className={`mt-2 font-mono text-lg font-bold ${controls.generalStoreCheckoutOpen ? "text-emerald-400" : "text-red-400"}`}>{controls.generalStoreCheckoutOpen ? "ACCEPTING" : "BLOCKED"}</p></div>
        <div className="px-5 py-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Platform services</p><div className="mt-2 flex items-end justify-between gap-3"><p className="font-mono text-2xl font-bold text-white">{activeServices}<span className="text-sm text-slate-600">/3</span></p><span className={`text-xs font-semibold ${dirty ? "text-amber-400" : "text-slate-500"}`}>{dirty ? "Pending changes" : "Synchronized"}</span></div></div>
      </section>

      <div className="grid min-w-0 gap-px bg-slate-800 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <section className="min-w-0 bg-[#0b111a]">
          <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-red-400">Critical access gates</p><h2 className="mt-1 text-lg font-bold text-white">Storefront routing</h2><p className="mt-1 text-xs text-slate-500">Disabling a critical gate immediately blocks the corresponding customer operation after apply.</p></div>
          <ControlRow label="General Store enabled" description="Master switch for catalogue, cart, checkout, order activity, and pickup APIs." checked={controls.generalStoreEnabled} disabled={loading} onChange={() => toggle("generalStoreEnabled")} danger />
          <ControlRow label="Catalogue open" description="Allow public product listing and General Store product detail pages." checked={controls.generalStoreCatalogueOpen} disabled={loading} onChange={() => toggle("generalStoreCatalogueOpen")} />
          <ControlRow label="Cart open" description="Allow customers to view, add, update, and remove cart lines." checked={controls.generalStoreCartOpen} disabled={loading} onChange={() => toggle("generalStoreCartOpen")} />
          <ControlRow label="Checkout open" description="Accept new orders. Disable during pricing, capacity, or payment incidents." checked={controls.generalStoreCheckoutOpen} disabled={loading} onChange={() => toggle("generalStoreCheckoutOpen")} danger />
          <ControlRow label="Order history open" description="Keep customer order history available during a storefront pause." checked={controls.generalStoreOrdersOpen} disabled={loading} onChange={() => toggle("generalStoreOrdersOpen")} />
          <ControlRow label="Pickup slots open" description="Allow customers to load and select pickup capacity." checked={controls.generalStorePickupOpen} disabled={loading} onChange={() => toggle("generalStorePickupOpen")} />
        </section>

        <div className="min-w-0 bg-[#0b111a]">
          <section>
            <div className="border-b border-slate-800 bg-slate-950/60 px-5 py-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">Subsystem authority</p><h2 className="mt-1 text-lg font-bold text-white">Operational services</h2></div>
            <ControlRow label="Inventory mode" description="Expose inventory controls to authorized staff." checked={controls.inventoryManagementEnabled} disabled={loading} onChange={() => toggle("inventoryManagementEnabled")} />
            <ControlRow label="Push notifications" description="Permit configured order-status notifications." checked={controls.generalStoreNotificationsOpen} disabled={loading} onChange={() => toggle("generalStoreNotificationsOpen")} />
            <ControlRow label="Order chat" description="Enable private customer and store-team order conversations." checked={controls.generalStoreChatOpen} disabled={loading} onChange={() => toggle("generalStoreChatOpen")} />
          </section>

          <section className="border-t border-slate-800 p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Fallback response</p><h2 className="mt-1 text-base font-bold text-white">Customer maintenance message</h2></div><span className="font-mono text-[10px] text-slate-600">{controls.generalStoreMaintenanceMessage.length}/240</span></div>
            <textarea value={controls.generalStoreMaintenanceMessage} onChange={(event) => setControls((current) => ({ ...current, generalStoreMaintenanceMessage: event.target.value }))} maxLength={240} rows={5} className="mt-4 w-full resize-y border border-slate-700 bg-slate-950 px-3 py-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10" />
            <p className="mt-2 text-xs leading-5 text-slate-500">Returned when a customer reaches an operation that has been blocked.</p>
          </section>
        </div>
      </div>

      <footer className={`sticky bottom-0 z-10 flex flex-col gap-4 border-t px-4 py-4 shadow-[0_-14px_35px_rgba(0,0,0,0.3)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6 ${dirty ? "border-amber-500/30 bg-[#16150f]/95" : "border-slate-800 bg-slate-950/95"}`}>
        <div><p className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${dirty ? "text-amber-300" : "text-emerald-400"}`}>{dirty ? "Uncommitted configuration" : "Configuration synchronized"}</p><p className="mt-1 text-xs text-slate-400">{message || (dirty ? "Review every changed gate before applying it to the live store." : "Server controls match the values shown above.")}</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => { setControls(initial); setMessage(""); }} disabled={!dirty || saving} className="flex-1 border border-slate-600 bg-slate-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:border-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none">Discard changes</button><button type="button" onClick={() => void save()} disabled={!dirty || saving || loading} className="flex-1 border border-amber-300/40 bg-amber-400 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_22px_rgba(251,191,36,0.18)] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none sm:flex-none">{saving ? "Applying…" : "Authorize & apply"}</button></div>
      </footer>
    </div>
  </div>;
}
