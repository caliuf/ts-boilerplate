/**
 * Composition root of the HTTP API: startup only.
 * Framework (Hono, Web Standard API) stays inside apps/api (Vademecum §3).
 */
import { serve } from "@hono/node-server";
import { createPinoLogger } from "@project/adapter-pino";
import { z } from "zod";

import { createApp } from "./app.ts";

const envSchema = z.object({
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3100),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
});

const env = envSchema.parse(process.env);

const logger = createPinoLogger({
  level: env.LOG_LEVEL,
  pretty: env.NODE_ENV === "development",
  fd: 1,
});

const app = createApp({ logger });

serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  logger.info({ port: info.port }, "api listening");
});
