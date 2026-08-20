import { helloWorldInputSchema, helloWorldOutputSchema } from "@project/contracts";
import type { Logger } from "@project/greetings";
import { sayHello } from "@project/greetings";
import { Hono } from "hono";

import { toProblemDetails } from "../error-mapper.ts";

/**
 * Routes: one handler per use case. Handlers validate input with the shared
 * schema, call the use case and map the result — no logic here.
 * Naming is parallel across surfaces: `hello-world` here, `hello-world` in
 * the CLI, `hello_world` in MCP (docs/PROJECT.md surface map).
 */
export function createHelloWorldRoutes(deps: { readonly logger: Logger }): Hono {
  const routes = new Hono();

  routes.get("/api/hello-world", (c) => {
    const parsed = helloWorldInputSchema.safeParse({ name: c.req.query("name") ?? undefined });
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
        .join("; ");
      const problem = toProblemDetails({ code: "VALIDATION", message });
      return c.json(problem, problem.status, {
        "Content-Type": "application/problem+json",
      });
    }
    const output = sayHello({ logger: deps.logger }, parsed.data);
    return c.json(helloWorldOutputSchema.parse(output), 200);
  });

  return routes;
}
