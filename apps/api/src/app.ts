import type { Logger } from "@project/greetings";
import { Hono } from "hono";

import { createHelloWorldRoutes } from "./routes/hello-world.ts";

export type ApiDeps = {
  readonly logger: Logger;
};

/**
 * Application factory: wires routes without starting any server, so
 * integration tests can drive the app over real HTTP semantics
 * (`app.request(...)`) without binding a port.
 */
export function createApp(deps: ApiDeps): Hono {
  const app = new Hono();
  app.route("/", createHelloWorldRoutes(deps));
  return app;
}
