import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "@repo/auth";

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

    request.log.info({
      cookieHeader: request.headers.cookie,
      hasSession: !!session,
      userId: session?.user?.id,
    }, '[requireAuth] session verification result');

    if (!session || !session.user) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    // Attach user and session to request
    (request as any).user = session.user;
    (request as any).session = session.session;
  } catch (error: any) {
    request.log.error(error, '[requireAuth] error verifying session');
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

export function isAdminRole(role?: string) {
  return ["ADMIN", "admin", "SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "");
}

export function isSuperAdminRole(role?: string) {
  return ["SUPER_ADMIN", "super_admin", "superadmin"].includes(role ?? "");
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
