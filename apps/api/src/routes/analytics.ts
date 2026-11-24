import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { z } from "zod";
import { requireFeature } from "../middleware/auth";

const querySchema = z.object({ days: z.coerce.number().int().refine((value) => [7, 30, 90].includes(value)).default(30) });
type DailyRow = { day: Date; orders: bigint | number; paidPaise: bigint | number };

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (_request, reply) => { reply.header("Cache-Control", "private, no-store"); });

  app.get("/", { preHandler: requireFeature("analytics.view") }, async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) return reply.code(400).send({ error: "Choose 7, 30, or 90 days" });

    const now = new Date();
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - (parsed.data.days - 1));
    start.setUTCHours(0, 0, 0, 0);
    const previousStart = new Date(start);
    previousStart.setUTCDate(previousStart.getUTCDate() - parsed.data.days);
    const pickupWindowEnd = new Date(now);
    pickupWindowEnd.setUTCDate(pickupWindowEnd.getUTCDate() + 6);
    pickupWindowEnd.setUTCHours(23, 59, 59, 999);

    const activeOrders = { status: { not: "CANCELLED" } };
    const periodFilter = { createdAt: { gte: start, lte: now } };
    const previousFilter = { createdAt: { gte: previousStart, lt: start } };
    const [current, previous, paid, statuses, topProducts, daily, pendingOverdue, pickupSlots] = await Promise.all([
      prisma.order.aggregate({ where: { ...periodFilter, ...activeOrders }, _count: { _all: true }, _sum: { totalInPaise: true } }),
      prisma.order.aggregate({ where: { ...previousFilter, ...activeOrders }, _count: { _all: true }, _sum: { totalInPaise: true } }),
      prisma.order.aggregate({ where: { ...periodFilter, ...activeOrders, paymentStatus: "PAID" }, _sum: { totalInPaise: true } }),
      prisma.order.groupBy({ by: ["status"], where: periodFilter, _count: { _all: true }, orderBy: { status: "asc" } }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: { order: { ...periodFilter, ...activeOrders } },
        _sum: { quantity: true, totalPriceInPaise: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.$queryRaw<DailyRow[]>`
        SELECT DATE_TRUNC('day', "createdAt") AS day,
               COUNT(*)::bigint AS orders,
               COALESCE(SUM("totalInPaise") FILTER (WHERE "paymentStatus" = 'PAID'), 0)::bigint AS "paidPaise"
        FROM "Order"
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${now} AND "status" <> 'CANCELLED'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY day ASC
      `,
      prisma.order.count({ where: { status: { in: ["PENDING", "PARTIALLY_ACCEPTED"] }, createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } } }),
      prisma.pickupSlot.findMany({
        where: { date: { gte: new Date(now.toISOString().slice(0, 10)), lte: pickupWindowEnd } },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 20,
        select: { id: true, date: true, startTime: true, endTime: true, capacity: true, _count: { select: { orders: { where: { status: { not: "CANCELLED" } } } } } },
      }),
    ]);
    const dailyByDate = new Map(daily.map((row) => [row.day.toISOString().slice(0, 10), { orders: Number(row.orders), paidPaise: Number(row.paidPaise) }]));
    const completeDaily = Array.from({ length: parsed.data.days }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + index);
      const day = date.toISOString().slice(0, 10);
      return { day, ...(dailyByDate.get(day) ?? { orders: 0, paidPaise: 0 }) };
    });
    return reply.send({
      days: parsed.data.days,
      from: start.toISOString(),
      to: now.toISOString(),
      current: { orders: current._count._all, bookedPaise: current._sum.totalInPaise ?? 0, paidPaise: paid._sum.totalInPaise ?? 0 },
      previous: { orders: previous._count._all, bookedPaise: previous._sum.totalInPaise ?? 0 },
      statuses: statuses.map((row) => ({ status: row.status, count: row._count._all })),
      topProducts: topProducts.map((row) => ({ name: row.productName, quantity: row._sum.quantity ?? 0, bookedPaise: row._sum.totalPriceInPaise ?? 0 })),
      daily: completeDaily,
      pendingOverdue,
      pickupSlots: pickupSlots.map((slot) => ({ date: slot.date.toISOString().slice(0, 10), startTime: slot.startTime, capacity: slot.capacity, booked: slot._count.orders })),
    });
  });
}
