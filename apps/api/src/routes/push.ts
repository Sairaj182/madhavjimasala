import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireAuth } from "../middleware/auth";
import { getPushPublicKey } from "../lib/push";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(20).max(200),
    auth: z.string().min(10).max(200),
  }),
});

function userId(request: FastifyRequest) {
  return (request as FastifyRequest & { user: { id: string } }).user.id;
}

export async function pushRoutes(app: FastifyInstance) {
  app.get("/public-key", { preHandler: requireAuth }, async (_request, reply) => {
    const publicKey = getPushPublicKey();
    if (!publicKey) return reply.status(503).send({ error: "Push notifications are not configured" });
    return reply.send({ publicKey });
  });

  app.post("/subscribe", { preHandler: requireAuth }, async (request, reply) => {
    try {
      const subscription = subscriptionSchema.parse(request.body);
      const currentUserId = userId(request);
      if (!getPushPublicKey()) return reply.status(503).send({ error: "Push notifications are not configured" });

      await prisma.$executeRaw`
        INSERT INTO "PushSubscription" ("id", "userId", "endpoint", "p256dh", "auth", "createdAt", "updatedAt")
        VALUES (md5(random()::text || clock_timestamp()::text), ${currentUserId}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth}, NOW(), NOW())
        ON CONFLICT ("endpoint") DO UPDATE SET
          "userId" = EXCLUDED."userId",
          "p256dh" = EXCLUDED."p256dh",
          "auth" = EXCLUDED."auth",
          "updatedAt" = NOW()
      `;
      return reply.status(204).send();
    } catch (err: unknown) {
      return reply.status(400).send({ error: err instanceof Error ? err.message : "Unable to save push subscription" });
    }
  });

  app.delete("/subscribe", { preHandler: requireAuth }, async (request, reply) => {
    try {
      const { endpoint } = z.object({ endpoint: z.string().url().max(2048) }).parse(request.body);
      const currentUserId = userId(request);
      await prisma.$executeRaw`DELETE FROM "PushSubscription" WHERE "userId" = ${currentUserId} AND "endpoint" = ${endpoint}`;
      return reply.status(204).send();
    } catch (err: unknown) {
      return reply.status(400).send({ error: err instanceof Error ? err.message : "Unable to remove push subscription" });
    }
  });
}
