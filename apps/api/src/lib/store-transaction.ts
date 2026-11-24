import { prisma } from "@repo/db";
import { Prisma } from "@prisma/client";

export class StoreRequestError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

export async function storeTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  db: Pick<typeof prisma, "$transaction"> = prisma,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(operation, { isolationLevel: "Serializable" });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !["P2034", "P2002"].includes(error.code)) throw error;
      if (attempt === 4) throw new StoreRequestError(503, "STORE_BUSY", "The store is busy. Please try again.");
      await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1) + Math.random() * 15));
    }
  }
}
