import type { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "@repo/db";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { requireAuth, requireFeature } from "../middleware/auth";
import { canonicalManagedRole, clearRolePermissionCache, defaultRolePermissions, effectiveRolePermissions, getRolePermissions, ROLE_FEATURES, type ManagedRole } from "../lib/role-permissions";

const roles = ["STAFF", "STORE_OWNER"] as const;
const updateSchema = z.object({ permissions: z.record(z.string(), z.boolean()) });

export async function rolePermissionRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (_request, reply) => { reply.header("Cache-Control", "private, no-store"); });

  app.get("/me", { preHandler: requireAuth }, async (request, reply) => {
    const user = (request as any).user as { role?: string };
    if (["SUPER_ADMIN", "super_admin", "superadmin"].includes(user.role ?? "")) {
      return reply.send({ role: user.role, superAdmin: true, permissions: Object.fromEntries(ROLE_FEATURES.map(({ id }) => [id, true])) });
    }
    const role = canonicalManagedRole(user.role);
    if (!role) return reply.code(403).send({ error: "Backoffice access required" });
    return reply.send({ role, superAdmin: false, permissions: await getRolePermissions(role) });
  });

  app.get("/", { preHandler: requireFeature("role_permissions.manage") }, async (_request, reply) => {
    const rows = await prisma.$queryRaw<{ role: ManagedRole; feature: string; enabled: boolean }[]>`
      SELECT "role", "feature", "enabled" FROM "RolePermission" WHERE "role" IN ('STAFF', 'STORE_OWNER')
    `;
    return reply.send({
      features: ROLE_FEATURES,
      roles: roles.map((role) => ({ role, permissions: effectiveRolePermissions(role, rows.filter((row) => row.role === role)) })),
    });
  });

  app.put("/:role", { preHandler: requireFeature("role_permissions.manage") }, async (request, reply) => {
    const role = (request.params as { role: string }).role;
    if (!roles.includes(role as (typeof roles)[number])) return reply.code(400).send({ error: "Choose STAFF or STORE_OWNER." });
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "Enter a valid feature permission map." });

    const permissions = parsed.data.permissions;
    const allowedIds = ROLE_FEATURES.map(({ id }) => id);
    if (Object.keys(permissions).length !== allowedIds.length || allowedIds.some((feature) => typeof permissions[feature] !== "boolean")) {
      return reply.code(400).send({ error: "Include every supported feature exactly once." });
    }
    const values = ROLE_FEATURES.map(({ id }) => Prisma.sql`(${randomUUID()}, ${role}, ${id}, ${permissions[id]}, NOW())`);
    await prisma.$executeRaw`
      INSERT INTO "RolePermission" ("id", "role", "feature", "enabled", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("role", "feature") DO UPDATE SET "enabled" = EXCLUDED."enabled", "updatedAt" = NOW()
    `;
    clearRolePermissionCache(role as ManagedRole);
    return reply.send({ role, permissions: { ...defaultRolePermissions(role as ManagedRole), ...permissions } });
  });
}
