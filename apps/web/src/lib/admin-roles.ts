const OWNER_ROLES = new Set(["ADMIN", "admin", "STORE_OWNER", "store_owner", "SUPER_ADMIN", "super_admin", "superadmin"]);
const STAFF_ROLES = new Set(["STAFF", "staff"]);

export function isOwnerRole(role?: string | null) {
  return OWNER_ROLES.has(role ?? "");
}

export function isStaffRole(role?: string | null) {
  return STAFF_ROLES.has(role ?? "");
}

export function isBackofficeRole(role?: string | null) {
  return isOwnerRole(role) || isStaffRole(role);
}

export function isSuperAdminRole(role?: string | null) {
  return ["SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "");
}
