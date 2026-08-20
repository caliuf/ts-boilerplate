import { McpServer } from "@modelcontextprotocol/server";
import { helloWorldInputSchema, helloWorldOutputSchema } from "@project/contracts";
import type { Logger } from "@project/greetings";
import { sayHello } from "@project/greetings";
import { z } from "zod";

/**
 * `hello_world` tool — 1:1 with the use case (naming parallel: `hello-world`
 * in CLI/API, `hello_world` here; snake_case is the MCP convention).
 *
 * Tool curation rule (Vademecum §3, MCP): expose a deliberate subset of use
 * cases; descriptions are written FOR the model (what it does, when to use
 * it, what it returns). Default read-only.
 */
export function registerHelloWorldTool(server: McpServer, deps: { readonly logger: Logger }): void {
  server.registerTool(
    "hello_world",
    {
      title: "Hello World",
      description:
        "Returns the hello-world greeting for a person. Use it to greet someone by name; " +
        "omit `name` to greet the world. Returns { message } and never fails for valid input.",
      inputSchema: z.object({
        name: z.string().trim().min(1).max(100).optional(),
      }),
      outputSchema: helloWorldOutputSchema,
      annotations: { readOnlyHint: true },
    },
    ({ name }) => {
      const parsed = helloWorldInputSchema.safeParse({ name });
      if (!parsed.success) {
        const message = parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
          .join("; ");
        return {
          isError: true,
          content: [
            { type: "text" as const, text: JSON.stringify({ error: "VALIDATION", message }) },
          ],
        };
      }
      const output = sayHello({ logger: deps.logger }, parsed.data);
      return {
        content: [{ type: "text" as const, text: output.message }],
        structuredContent: output,
      };
    },
  );
}
