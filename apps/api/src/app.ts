import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { env } from "./env";
import { registerRoutes } from "./routes";

export function buildApp() {
  const app = Fastify({
    logger: { level: env.NODE_ENV === "production" ? "info" : "debug" },
    trustProxy: true,
  });

  app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });

  app.register(fastifyCookie);

  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: { cookieName: "auth_token", signed: false },
  });

  app.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });

  registerRoutes(app);

  return app;
}
