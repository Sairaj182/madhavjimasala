import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@repo/db";
import { requireSuperAdmin } from "../middleware/auth";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { env } from "../env";
import { defaultGeneralStoreControls, getGeneralStoreControls } from "../lib/general-store-settings";

const STORE_SETTINGS_ID = "store";
const CONTROL_PIN_HEADER = "x-general-store-control-pin";

async function requireControlCenterPin(request: FastifyRequest, reply: FastifyReply) {
  if (!env.GENERAL_STORE_CONTROL_PIN) return reply.status(503).send({ error: "General Store control PIN is not configured on the API" });
  const supplied = request.headers[CONTROL_PIN_HEADER];
  const value = Array.isArray(supplied) ? supplied[0] : supplied;
  if (!value) return reply.status(401).send({ error: "Control centre PIN required" });
  const expected = Buffer.from(env.GENERAL_STORE_CONTROL_PIN, "utf8");
  const provided = Buffer.from(value, "utf8");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return reply.status(401).send({ error: "Invalid control centre PIN" });
}

const updateStoreSettingsSchema = z.object({
  inventoryManagementEnabled: z.boolean().optional(),
  generalStoreEnabled: z.boolean().optional(),
  generalStoreCatalogueOpen: z.boolean().optional(),
  generalStoreCartOpen: z.boolean().optional(),
  generalStoreCheckoutOpen: z.boolean().optional(),
  generalStoreOrdersOpen: z.boolean().optional(),
  generalStorePickupOpen: z.boolean().optional(),
  generalStoreNotificationsOpen: z.boolean().optional(),
  generalStoreMaintenanceMessage: z.string().trim().min(1).max(240).optional(),
});

async function getStoreSettings() {
  const rows = await prisma.$queryRaw<{ inventoryManagementEnabled: boolean }[]>`
    SELECT "inventoryManagementEnabled"
    FROM "StoreSettings"
    WHERE "id" = ${STORE_SETTINGS_ID}
    LIMIT 1
  `;
  return { ...(await getGeneralStoreControls()), inventoryManagementEnabled: rows[0]?.inventoryManagementEnabled ?? false };
}

export async function settingsRoutes(app: FastifyInstance) {
  app.get("/store", { preHandler: [requireSuperAdmin, requireControlCenterPin] }, async (_request, reply) => {
    const settings = await getStoreSettings();
    return reply.send(settings);
  });

  app.patch("/store", { preHandler: [requireSuperAdmin, requireControlCenterPin] }, async (request, reply) => {
    try {
      const data = updateStoreSettingsSchema.parse(request.body);
      const current = await getStoreSettings();
      const next = { ...defaultGeneralStoreControls, ...current, ...data };
      await prisma.$executeRaw`
        INSERT INTO "StoreSettings" ("id", "inventoryManagementEnabled", "generalStoreEnabled", "generalStoreCatalogueOpen", "generalStoreCartOpen", "generalStoreCheckoutOpen", "generalStoreOrdersOpen", "generalStorePickupOpen", "generalStoreNotificationsOpen", "generalStoreMaintenanceMessage", "updatedAt")
        VALUES (${STORE_SETTINGS_ID}, ${next.inventoryManagementEnabled}, ${next.generalStoreEnabled}, ${next.generalStoreCatalogueOpen}, ${next.generalStoreCartOpen}, ${next.generalStoreCheckoutOpen}, ${next.generalStoreOrdersOpen}, ${next.generalStorePickupOpen}, ${next.generalStoreNotificationsOpen}, ${next.generalStoreMaintenanceMessage}, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "inventoryManagementEnabled" = EXCLUDED."inventoryManagementEnabled",
          "generalStoreEnabled" = EXCLUDED."generalStoreEnabled",
          "generalStoreCatalogueOpen" = EXCLUDED."generalStoreCatalogueOpen",
          "generalStoreCartOpen" = EXCLUDED."generalStoreCartOpen",
          "generalStoreCheckoutOpen" = EXCLUDED."generalStoreCheckoutOpen",
          "generalStoreOrdersOpen" = EXCLUDED."generalStoreOrdersOpen",
          "generalStorePickupOpen" = EXCLUDED."generalStorePickupOpen",
          "generalStoreNotificationsOpen" = EXCLUDED."generalStoreNotificationsOpen",
          "generalStoreMaintenanceMessage" = EXCLUDED."generalStoreMaintenanceMessage",
          "updatedAt" = NOW()
      `;
      return reply.send(next);
    } catch (error: unknown) {
      return reply.status(400).send({ error: error instanceof Error ? error.message : "Invalid store settings" });
    }
  });
}
