import type { FastifyInstance } from "fastify";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export async function categoryRoutes(app: FastifyInstance) {
  // Public Routes
  app.get("/", async (request, reply) => {
    const categories = await prisma.category.findMany();
    return reply.send(categories);
  });

  // Admin Routes
  app.post("/", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const data = createCategorySchema.parse(request.body);
      const category = await prisma.category.create({ data });
      return reply.status(201).send(category);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  app.delete("/:id", { preHandler: requireAdmin }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await prisma.category.delete({ where: { id } });
      return reply.status(204).send();
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
