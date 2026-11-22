import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { isOwnerRole, isStaffRole, isSuperAdminRole, requireOwner } from "../middleware/auth";
import { z } from "zod";

const managedRoles = ["STAFF", "STORE_OWNER"] as const;
const panelRoles = ["STAFF", "staff", "STORE_OWNER", "store_owner", "SUPER_ADMIN", "super_admin", "superadmin", "ADMIN", "admin"];

const createUserSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(managedRoles),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(managedRoles).optional(),
  banned: z.boolean().optional(),
});

function requestHeaders(request: FastifyRequest) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") headers.append(key, value);
    else if (Array.isArray(value)) value.forEach((entry) => headers.append(key, entry));
  }
  return headers;
}

function publicUser(user: { id: string; name: string; email: string; role: string; banned: boolean | null; createdAt: Date; isActive: boolean }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    banned: Boolean(user.banned),
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

function canManageTarget(actorRole: string | undefined, targetRole: string, targetId: string, actorId: string, nextRole?: string) {
  if (targetId === actorId || isSuperAdminRole(targetRole)) return false;
  if (isSuperAdminRole(actorRole)) {
    return panelRoles.includes(targetRole) && targetRole !== "SUPER_ADMIN" && (!nextRole || managedRoles.includes(nextRole as typeof managedRoles[number]));
  }
  return isOwnerRole(actorRole) && isStaffRole(targetRole) && (!nextRole || nextRole === "STAFF");
}

export async function adminUserRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireOwner);

  app.get("/", async (_request, reply) => {
    const users = await prisma.user.findMany({
      where: { role: { in: panelRoles } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true, isActive: true },
    });
    return reply.send(users.map(publicUser));
  });

  app.post("/", async (request, reply) => {
    try {
      const data = createUserSchema.parse(request.body);
      const actor = (request as any).user as { id: string; role?: string };
      if (data.role === "STORE_OWNER" && !isSuperAdminRole(actor.role)) {
        return reply.status(403).send({ error: "Only a super admin can create store owners" });
      }

      const result = await auth.api.createUser({
        body: {
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          role: data.role,
        },
        headers: requestHeaders(request),
      });
      return reply.status(201).send(result.user);
    } catch (error: any) {
      return reply.status(400).send({ error: error?.message || "Unable to create admin user" });
    }
  });

  app.patch("/:id", async (request, reply) => {
    try {
      const data = updateUserSchema.parse(request.body);
      const actor = (request as any).user as { id: string; role?: string };
      const target = await prisma.user.findUnique({ where: { id: (request.params as { id: string }).id } });
      if (!target) return reply.status(404).send({ error: "Admin user not found" });
      if (!canManageTarget(actor.role, target.role, target.id, actor.id, data.role)) {
        return reply.status(403).send({ error: "You cannot manage this admin user" });
      }

      const updated = await prisma.user.update({
        where: { id: target.id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.role !== undefined ? { role: data.role } : {}),
          ...(data.banned !== undefined ? { banned: data.banned, banReason: data.banned ? "Disabled by an administrator" : null } : {}),
        },
        select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true, isActive: true },
      });
      if (data.banned === true) {
        await prisma.session.deleteMany({ where: { userId: target.id } });
      }
      return reply.send(publicUser(updated));
    } catch (error: any) {
      return reply.status(400).send({ error: error?.message || "Unable to update admin user" });
    }
  });
}
