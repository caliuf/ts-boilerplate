/**
 * `just bun-smoke` — Bun compatibility suite (Vademecum §2).
 * Runs the core and the portable flows under Bun: domain, contracts,
 * application layer, and their tests' in-memory adapters. No node:* APIs are
 * exercised here — that is exactly what makes this a meaningful smoke test.
 */
import { helloWorldInputSchema } from "@project/contracts";
import { greet, sayHello } from "@project/greetings";
import { createMemoryLogger } from "@project/testkit";

const { logger, entries } = createMemoryLogger();

const input = helloWorldInputSchema.parse({ name: "bun" });
const output = sayHello({ logger }, input);

if (output.message !== "Hello, bun!") {
  throw new Error(`unexpected greeting: ${output.message}`);
}
if (greet("world").message !== "Hello, world!") {
  throw new Error("greet regression under bun");
}
if (entries.length !== 1) {
  throw new Error("logger port did not record the invocation");
}

console.log(`bun-smoke OK — ${output.message} (runtime: ${process.version})`);
