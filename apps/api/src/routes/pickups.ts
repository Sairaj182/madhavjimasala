import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { z } from "zod";
import { getGeneralStoreControls } from "../lib/general-store-settings";

const createSlotSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string(), // "11:00 AM"
  endTime: z.string(),   // "11:30 AM"
  capacity: z.number().int().min(1).default(10),
  isActive: z.boolean().default(true),
});

export async function pickupRoutes(app: FastifyInstance) {
  // Public/Authenticated - get available slots
  // Wait, users need this to checkout, so just public is fine
  app.get("/slots", async (request, reply) => {
    const controls = await getGeneralStoreControls();
    if (!controls.generalStoreEnabled || !controls.generalStorePickupOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    // Only return slots that are active and in the future
    const slots = await prisma.pickupSlot.findMany({
      where: {
        isActive: true,
        date: {
          gte: new Date(new Date().setHours(0,0,0,0)) // From today onwards
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    const withUsage = await Promise.all(slots.map(async (slot) => {
      const booked = await prisma.order.count({
        where: { pickupSlotId: slot.id, status: { not: "CANCELLED" } },
      });
      return { ...slot, bookedCount: booked, remainingCapacity: Math.max(0, slot.capacity - booked) };
    }));
    return reply.send(withUsage);
  });

  // Admin Routes
  app.get("/slots/all", { preHandler: requireAdmin }, async (request, reply) => {
    const slots = await prisma.pickupSlot.findMany({
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    });
    return reply.send(slots);
  });
  app.post("/slots", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const data = createSlotSchema.parse(request.body);
      const slot = await prisma.pickupSlot.create({ data });
      return reply.status(201).send(slot);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete("/slots/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.pickupSlot.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
