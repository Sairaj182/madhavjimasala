import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT_API: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string({ error: "DATABASE_URL is required" }),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().transform((p) => p?.trim() || undefined),
  REDIS_DB: z.coerce.number().default(1),         // BullMQ queues
  CACHE_REDIS_DB: z.coerce.number().default(2),   // API cache (future)
  SOCKET_REDIS_DB: z.coerce.number().default(3),  // Socket.io adapter (future)
  JWT_SECRET: z.string({ error: "JWT_SECRET is required" }).min(32),
  BETTER_AUTH_SECRET: z.string({ error: "BETTER_AUTH_SECRET is required" }).min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:4000/api/auth"),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000,http://localhost:7030")
    .transform((s) => s.split(",").map((o) => o.trim()).filter(Boolean)),
  AISENSY_API_KEY: z.string().optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().url().optional(),
  GENERAL_STORE_CONTROL_PIN: z.string().trim().min(6).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("madhavji-masala"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
