import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireOwner } from "../middleware/auth";
import { z } from "zod";
import { getGeneralStoreControls } from "../lib/general-store-settings";
import { isBookablePickup, pickupMinutes, storeDate } from "../lib/pickup-time";

const createSlotSchema = z.object({
  date: z.iso.date().transform((str) => new Date(str)),
  startTime: z.string().trim().max(16),
  endTime: z.string().trim().max(16),
  capacity: z.number().int().min(1).max(2147483647).default(10),
  isActive: z.boolean().default(true),
}).refine(({ startTime, endTime }) => {
  const start = pickupMinutes(startTime);
  const end = pickupMinutes(endTime);
  return start !== null && end !== null && end > start;
}, { message: "Enter valid same-day pickup times with the end after the start." });

export async function pickupRoutes(app: FastifyInstance) {
  app.get("/slots", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    const controls = await getGeneralStoreControls();
    if (!controls.generalStoreEnabled || !controls.generalStorePickupOpen) return reply.status(503).send({ error: controls.generalStoreMaintenanceMessage });
    const now = new Date();
    const slots = await prisma.pickupSlot.findMany({
      where: { isActive: true, date: { gte: storeDate(now) } },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      select: {
        id: true, date: true, startTime: true, endTime: true, capacity: true, isActive: true,
        _count: { select: { orders: { where: { status: { not: "CANCELLED" } } } } },
      },
    });
    const withUsage = slots.filter((slot) => isBookablePickup(slot, now))
      .sort((first, second) => first.date.getTime() - second.date.getTime()
        || (pickupMinutes(first.startTime) ?? 0) - (pickupMinutes(second.startTime) ?? 0))
      .map(({ _count, ...slot }) => ({
        ...slot,
        bookedCount: _count.orders,
        remainingCapacity: Math.max(0, slot.capacity - _count.orders),
      }));
    return reply.send(withUsage);
  });

  // Admin Routes
  app.get("/slots/all", { preHandler: requireOwner }, async (request, reply) => {
    const slots = await prisma.pickupSlot.findMany({
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    });
    return reply.send(slots);
  });
  app.post("/slots", { preHandler: requireOwner }, async (request, reply) => {
    try {
      const data = createSlotSchema.parse(request.body);
      const slot = await prisma.pickupSlot.create({ data });
      return reply.status(201).send(slot);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete("/slots/:id", { preHandler: requireOwner }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.pickupSlot.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
