import type { HelloWorldInput, HelloWorldOutput } from "@project/contracts";

import { greet } from "../domain/greeting.ts";
import type { Logger } from "../ports/logger.ts";

export type SayHelloDeps = {
  readonly logger: Logger;
};

/**
 * Use case: say hello.
 *
 * Input arrives already validated by the entry point (CLI/API/MCP/UI) against
 * the shared schema in `@project/contracts`. This function orchestrates the
 * domain and is the ONLY place where the hello-world behavior lives: every
 * surface delegates here.
 */
export function sayHello(deps: SayHelloDeps, input: HelloWorldInput): HelloWorldOutput {
  deps.logger.info({ name: input.name }, "saying hello");
  return greet(input.name);
}
