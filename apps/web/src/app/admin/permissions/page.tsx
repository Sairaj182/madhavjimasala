"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
type Feature = { id: string; label: string; group: string };
type Role = "STAFF" | "STORE_OWNER";
type Matrix = Record<string, boolean>;
type RoleData = { role: Role; permissions: Matrix };

export default function RolePermissionsPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role>("STAFF");
  const [initial, setInitial] = useState<Matrix>({});
  const [permissions, setPermissions] = useState<Matrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const dirty = useMemo(() => JSON.stringify(permissions) !== JSON.stringify(initial), [permissions, initial]);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/permissions`, { credentials: "include", cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to load role permissions.");
      setFeatures(data.features as Feature[]);
      setRoles(data.roles as RoleData[]);
      const selected = (data.roles as RoleData[]).find((role) => role.role === selectedRole)?.permissions ?? {};
      setPermissions(selected);
      setInitial(selected);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load role permissions.");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => { void load(); }, [load]);

  const selectRole = (role: Role) => {
    const next = roles.find((item) => item.role === role)?.permissions ?? {};
    setSelectedRole(role);
    setPermissions(next);
    setInitial(next);
    setMessage("");
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/permissions/${selectedRole}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to save role permissions.");
      setPermissions(data.permissions as Matrix);
      setInitial(data.permissions as Matrix);
      setRoles((current) => current.map((item) => item.role === selectedRole ? { ...item, permissions: data.permissions as Matrix } : item));
      setMessage("Role permissions saved and applied.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save role permissions.");
    } finally {
      setSaving(false);
    }
  };

  const groups = [...new Set(features.map((feature) => feature.group))];

  return <div className="space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Access administration</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Role permissions</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Choose which backoffice features each role can use. Access is checked by the API as well as hidden in the admin navigation.</p></header>
    <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">{(["STAFF", "STORE_OWNER"] as const).map((role) => <button key={role} type="button" onClick={() => selectRole(role)} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${selectedRole === role ? "bg-brand-maroon text-white" : "text-gray-600 hover:bg-brand-cream"}`}>{role === "STAFF" ? "Staff" : "Store owner"}</button>)}</div>
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-900"><strong>Role boundaries:</strong> Super Admin retains unrestricted system access. Store owners start with every feature enabled. Assign any listed feature to Staff or Store owner as needed; the API enforces each selection.</div>
    {message && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ${message.includes("saved") ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{message}</p>}
    {loading ? <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">Loading permissions…</div> : <div className="space-y-4">{groups.map((group) => <section key={group} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"><div className="border-b border-gray-100 bg-gray-50 px-4 py-3"><h2 className="text-sm font-bold text-gray-800">{group}</h2></div><div className="divide-y divide-gray-100">{features.filter((feature) => feature.group === group).map((feature) => <label key={feature.id} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4"><span className="min-w-0"><span className="block text-sm font-semibold text-gray-800">{feature.label}</span><span className="mt-1 block text-xs text-gray-400">{feature.id}</span></span><input type="checkbox" checked={permissions[feature.id] === true} onChange={(event) => setPermissions((current) => ({ ...current, [feature.id]: event.target.checked }))} className="h-5 w-5 shrink-0 accent-brand-maroon" aria-label={`${feature.label} for ${selectedRole}`} /></label>)}</div></section>)}</div>}
    <footer className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4"><p className="text-sm font-semibold text-gray-600">{dirty ? "Unsaved permission changes." : "Permissions are synchronized."}</p><div className="flex gap-2"><button type="button" onClick={() => selectRole(selectedRole)} disabled={!dirty || saving} className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 disabled:opacity-40 sm:flex-none">Discard</button><button type="button" onClick={() => void save()} disabled={!dirty || saving || loading} className="flex-1 rounded-xl bg-brand-maroon px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40 sm:flex-none">{saving ? "Applying…" : "Apply permissions"}</button></div></footer>
  </div>;
}
