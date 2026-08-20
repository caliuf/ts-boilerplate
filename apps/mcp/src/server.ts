/**
 * Composition root of the MCP server: stdio transport (default for local
 * agent integration, Vademecum §3). The protocol owns stdout, so logs go to
 * stderr — never write anything else to stdout here.
 */
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createPinoLogger } from "@project/adapter-pino";
import { z } from "zod";

import { createServer } from "./create-server.ts";

const envSchema = z.object({
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
});

const env = envSchema.parse(process.env);

const logger = createPinoLogger({
  level: env.LOG_LEVEL,
  pretty: process.stderr.isTTY ?? false,
  fd: 2,
});

serveStdio(() => createServer({ logger }));
logger.info({ transport: "stdio" }, "mcp server ready");
