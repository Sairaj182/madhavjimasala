import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@repo/auth";
import { hasRoleFeature, type RoleFeature } from "../lib/role-permissions";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const webHeaders = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === "string") {
        webHeaders.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((v) => webHeaders.append(key, v));
      }
    }

    const session = await auth.api.getSession({
      headers: webHeaders,
    });

    if (!session || !session.user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Attach user and session to request
    (request as any).user = session.user;
    (request as any).session = session.session;
  } catch {
    request.log.error("Could not verify session");
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  const user = (request as any).user;
  if (!isAdminRole(user?.role)) {
    return reply.status(403).send({ error: "Forbidden: Admin access required" });
  }
}

export async function requireOwner(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  const user = (request as any).user;
  if (!isOwnerRole(user?.role)) {
    return reply.status(403).send({ error: "Forbidden: Store owner access required" });
  }
}

export function isAdminRole(role?: string) {
  return isOwnerRole(role) || isStaffRole(role);
}

export function isSuperAdminRole(role?: string) {
  return ["SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "");
}

export function isOwnerRole(role?: string) {
  return [
    "ADMIN",
    "admin",
    "STORE_OWNER",
    "store_owner",
    "SUPER_ADMIN",
    "super_admin",
    "superadmin",
  ].includes(role ?? "");
}

export function isStaffRole(role?: string) {
  return ["STAFF", "staff"].includes(role ?? "");
}

export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  await requireAuth(request, reply);
  if (reply.sent) return;

  const user = (request as any).user;
  if (!isSuperAdminRole(user?.role)) {
    return reply.status(403).send({ error: "Forbidden: Super admin access required" });
  }
}

export function requireFeature(feature: RoleFeature) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    let user = (request as any).user as { role?: string } | undefined;
    if (!user) {
      await requireAuth(request, reply);
      if (reply.sent) return;
      user = (request as any).user as { role?: string };
    }
    if (!(await hasRoleFeature(user.role, feature))) {
      return reply.status(403).send({ error: "Your role does not have access to this feature." });
    }
  };
}
