import { prisma } from "@repo/db";

export const ROLE_FEATURES = [
  { id: "dashboard.view", label: "View dashboard", group: "Overview" },
  { id: "products.view", label: "View products", group: "Catalogue" },
  { id: "products.availability", label: "Change product availability", group: "Catalogue" },
  { id: "products.manage", label: "Create, edit, and delete products", group: "Catalogue" },
  { id: "categories.manage", label: "Manage categories", group: "Catalogue" },
  { id: "orders.view", label: "View and search orders", group: "Orders" },
  { id: "orders.review", label: "Review requested items and substitutions", group: "Orders" },
  { id: "orders.ready", label: "Mark reviewed orders ready for pickup", group: "Orders" },
  { id: "orders.status", label: "Change order status, including cancellation", group: "Orders" },
  { id: "orders.messages", label: "Allow order chat", group: "Orders" },
  { id: "pickup.verify", label: "Verify pickup codes", group: "Pickup" },
  { id: "pickup.fulfill", label: "Complete pickup", group: "Pickup" },
  { id: "payments.record", label: "Record cash payments", group: "Pickup" },
  { id: "pickup.slots.manage", label: "Manage pickup slots", group: "Pickup" },
  { id: "testimonials.manage", label: "Moderate customer comments", group: "Operations" },
  { id: "analytics.view", label: "View business analytics", group: "Operations" },
  { id: "team.manage", label: "Manage staff accounts", group: "Administration" },
  { id: "store.controls", label: "Change protected store controls", group: "Administration" },
  { id: "role_permissions.manage", label: "Manage role permissions", group: "Administration" },
] as const;

export type RoleFeature = (typeof ROLE_FEATURES)[number]["id"];
export type ManagedRole = "STAFF" | "STORE_OWNER";

const STAFF_DEFAULTS = new Set<RoleFeature>([
  "dashboard.view", "products.view", "products.availability", "orders.view", "orders.review", "orders.ready", "orders.messages",
]);
const OWNER_DEFAULTS = new Set<RoleFeature>(ROLE_FEATURES.map(({ id }) => id));
type PermissionCacheEntry = { expiresAt: number; permissions: Record<RoleFeature, boolean> };
const cache = new Map<ManagedRole, PermissionCacheEntry>();
const CACHE_MS = 5000;

export function canonicalManagedRole(role?: string): ManagedRole | null {
  if (role && ["STAFF", "staff"].includes(role)) return "STAFF";
  if (role && ["ADMIN", "admin", "STORE_OWNER", "store_owner"].includes(role)) return "STORE_OWNER";
  return null;
}

export function defaultRolePermissions(role: ManagedRole): Record<RoleFeature, boolean> {
  const defaults = role === "STAFF" ? STAFF_DEFAULTS : OWNER_DEFAULTS;
  return Object.fromEntries(ROLE_FEATURES.map(({ id }) => [id, defaults.has(id)])) as Record<RoleFeature, boolean>;
}

export function effectiveRolePermissions(role: ManagedRole, rows: { feature: string; enabled: boolean }[]) {
  const permissions = defaultRolePermissions(role);
  for (const row of rows) {
    if (ROLE_FEATURES.some(({ id }) => id === row.feature)) permissions[row.feature as RoleFeature] = row.enabled;
  }
  return permissions;
}

export async function getRolePermissions(role: ManagedRole) {
  const existing = cache.get(role);
  if (existing && existing.expiresAt > Date.now()) return existing.permissions;
  const rows = await prisma.$queryRaw<{ feature: string; enabled: boolean }[]>`
    SELECT "feature", "enabled" FROM "RolePermission" WHERE "role" = ${role}
  `;
  const permissions = effectiveRolePermissions(role, rows);
  cache.set(role, { permissions, expiresAt: Date.now() + CACHE_MS });
  return permissions;
}

export function clearRolePermissionCache(role?: ManagedRole) {
  if (role) cache.delete(role);
  else cache.clear();
}

export async function hasRoleFeature(role: string | undefined, feature: RoleFeature) {
  return hasAnyRoleFeature(role, [feature]);
}

export async function hasAnyRoleFeature(role: string | undefined, features: readonly RoleFeature[]) {
  if (["SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "")) return true;
  const managedRole = canonicalManagedRole(role);
  if (!managedRole) return false;
  const permissions = await getRolePermissions(managedRole);
  return features.some((feature) => permissions[feature]);
}
