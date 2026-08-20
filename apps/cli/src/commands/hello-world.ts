import { parseArgs } from "node:util";

import { helloWorldInputSchema } from "@project/contracts";
import { sayHello } from "@project/greetings";

import type { Command, CommandContext, CommandResult } from "../command.ts";

/**
 * `project hello-world` — the reference subcommand.
 * Route: commands/hello-world.ts → `project hello-world`.
 * Use case: `sayHello` from `@project/greetings`.
 */
export const meta: Command["meta"] = {
  name: "hello-world",
  summary: "Print the hello-world greeting",
  usage: "project hello-world [--name <name>] [--json]",
  examples: ["project hello-world", "project hello-world --name Ada", "project hello-world --json"],
};

export async function run(args: readonly string[], ctx: CommandContext): Promise<CommandResult> {
  let values: { name?: string | undefined };
  try {
    ({ values } = parseArgs({
      args: [...args],
      options: { name: { type: "string" } },
      allowPositionals: false,
    }));
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "VALIDATION",
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }

  const parsed = helloWorldInputSchema.safeParse(values);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
      .join("; ");
    return { ok: false, error: { code: "VALIDATION", message } };
  }

  const output = sayHello({ logger: ctx.logger }, parsed.data);
  return { ok: true, data: output, human: output.message };
}
