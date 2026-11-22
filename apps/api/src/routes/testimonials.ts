import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { prisma } from "@repo/db";
import { z } from "zod";
import { requireOwner, requireAuth } from "../middleware/auth";

const submission = z.object({
  title: z.string().trim().max(80).default("Customer"),
  company: z.string().trim().max(80).optional(),
  quote: z.string().trim().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

type Testimonial = { id: string; name: string; title: string; company: string | null; quote: string; rating: number; createdAt: Date };
type PendingTestimonial = Testimonial & { userId: string };

export async function testimonialRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return prisma.$queryRaw<Testimonial[]>`
      SELECT "id", "name", "title", "company", "quote", "rating", "createdAt"
      FROM "Testimonial" WHERE "approved" = true ORDER BY "createdAt" DESC LIMIT 30
    `;
  });

  app.post("/", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = submission.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "Please enter a comment of 10–1000 characters and a rating from 1–5." });
    const user = (request as FastifyRequest & { user: { id: string; name: string } }).user;
    const recent = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "Testimonial" WHERE "userId" = ${user.id}
      AND "createdAt" > NOW() - INTERVAL '1 day' LIMIT 1
    `;
    if (recent.length) return reply.status(429).send({ error: "You can share one experience per day." });
    const { title, company, quote, rating } = parsed.data;
    await prisma.$executeRaw`
      INSERT INTO "Testimonial" ("id", "userId", "name", "title", "company", "quote", "rating")
      VALUES (${randomUUID()}, ${user.id}, ${user.name}, ${title}, ${company || null}, ${quote}, ${rating})
    `;
    return reply.status(201).send({ message: "Thank you! Your experience will appear after review." });
  });

  app.get("/pending", { preHandler: requireOwner }, async () => {
    return prisma.$queryRaw<PendingTestimonial[]>`
      SELECT "id", "userId", "name", "title", "company", "quote", "rating", "createdAt"
      FROM "Testimonial" WHERE "approved" = false ORDER BY "createdAt" ASC LIMIT 100
    `;
  });

  app.post("/:id/approve", { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const count = await prisma.$executeRaw`UPDATE "Testimonial" SET "approved" = true WHERE "id" = ${id}`;
    return count ? reply.status(204).send() : reply.status(404).send({ error: "Comment not found" });
  });

  app.delete("/:id", { preHandler: requireOwner }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const count = await prisma.$executeRaw`DELETE FROM "Testimonial" WHERE "id" = ${id}`;
    return count ? reply.status(204).send() : reply.status(404).send({ error: "Comment not found" });
  });
}
