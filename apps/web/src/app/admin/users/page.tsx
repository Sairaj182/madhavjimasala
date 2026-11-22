"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isSuperAdminRole } from "@/lib/admin-roles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  isActive: boolean;
  createdAt: string;
};

const roleLabels: Record<string, string> = {
  STAFF: "Staff",
  STORE_OWNER: "Store owner",
  SUPER_ADMIN: "Super admin",
  ADMIN: "Legacy owner",
  admin: "Legacy owner",
};

export default function AdminUsersPage() {
  const { data: session } = authClient.useSession();
  const superAdmin = isSuperAdminRole(session?.user.role);
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" as "STAFF" | "STORE_OWNER" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load admin users");
      setUsers(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadUsers(); }, []);

  const createUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create admin user");
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      setMessage("Admin panel user created.");
      await loadUsers();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create admin user");
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user: PanelUser, changes: Partial<Pick<PanelUser, "role" | "banned" | "name">>) => {
    setMessage("");
    const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(changes),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to update admin user");
      return;
    }
    setUsers((current) => current.map((item) => item.id === user.id ? data : item));
    setMessage("Admin user updated.");
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">Access management</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-gray-900 sm:text-3xl">Admin panel users</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Super admins and store owners can create staff access here. Store owners can manage staff; only super admins can create or manage store owners.</p>
      </header>

      <section className="rounded-3xl border border-brand-gold/25 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-gray-900">Create an admin user</h2>
        <p className="mt-1 text-sm text-gray-500">Credentials are sent only to the authentication service and are never displayed after creation.</p>
        <form onSubmit={createUser} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-maroon" />
          <input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-maroon" />
          <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Temporary password" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-maroon" />
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as "STAFF" | "STORE_OWNER" }))} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-maroon">
            <option value="STAFF">Staff</option>
            {superAdmin && <option value="STORE_OWNER">Store owner</option>}
          </select>
          <button disabled={saving} className="rounded-xl bg-brand-maroon px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Creating…" : "Create user"}</button>
        </form>
        {message && <p role="status" className="mt-4 text-sm font-semibold text-brand-maroon">{message}</p>}
      </section>

      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6"><h2 className="text-lg font-bold text-gray-900">Current admin access</h2><p className="mt-1 text-sm text-gray-500">Disable a user to revoke access. Existing sessions are removed when a user is disabled.</p></div>
        {loading ? <p className="p-6 text-sm text-gray-500">Loading admin users…</p> : users.length === 0 ? <p className="p-6 text-sm text-gray-500">No admin panel users found.</p> : <div className="divide-y divide-gray-100">
          {users.map((user) => <div key={user.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0"><p className="font-bold text-gray-900">{user.name}</p><p className="truncate text-sm text-gray-500">{user.email}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-gold">{roleLabels[user.role] || user.role} · {user.banned ? "Disabled" : "Active"}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              {superAdmin && user.role !== "SUPER_ADMIN" && user.role !== "super_admin" && user.role !== "superadmin" && <select value={user.role === "STORE_OWNER" || user.role === "store_owner" ? "STORE_OWNER" : "STAFF"} onChange={(event) => void updateUser(user, { role: event.target.value as "STAFF" | "STORE_OWNER" })} className="rounded-lg border border-gray-200 px-2 py-2 text-xs"><option value="STAFF">Staff</option><option value="STORE_OWNER">Store owner</option></select>}
              <button type="button" onClick={() => void updateUser(user, { banned: !user.banned })} className={`rounded-lg border px-3 py-2 text-xs font-bold ${user.banned ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}>{user.banned ? "Enable access" : "Disable access"}</button>
            </div>
          </div>)}
        </div>}
      </section>
    </div>
  );
}
