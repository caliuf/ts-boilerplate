#!/usr/bin/env node

import { createPinoLogger } from "@project/adapter-pino";
import type { Logger } from "@project/greetings";
/**
 * Composition root of the CLI: bootstrap + dispatch only.
 * All command-specific policy lives in the command files.
 */
import { z } from "zod";

import type { CommandContext, CommandResult } from "./command.ts";
import { exitCodeFor, renderError, renderSuccess, wantsJson } from "./output.ts";
import { commands } from "./registry.ts";

const envSchema = z.object({
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),
});

/** Logs always go to stderr: stdout is data-only (agent-first contract). */
function createLogger(env: NodeJS.ProcessEnv): Logger {
  const isTTY = process.stderr.isTTY ?? false;
  const { LOG_LEVEL } = envSchema.parse(env);
  return createPinoLogger({ level: LOG_LEVEL ?? (isTTY ? "debug" : "info"), pretty: isTTY, fd: 2 });
}

function rootHelp(): string {
  const lines = commands.map(
    (command) => `  ${command.meta.name.padEnd(16)} ${command.meta.summary}`,
  );
  return [
    "project — reference CLI of the ts-boilerplate",
    "",
    "Usage: project <command> [options]",
    "",
    "Global options:",
    "  --json           Emit JSON on stdout (default in non-TTY contexts)",
    "  --help           Show help",
    "",
    "Commands:",
    ...lines,
    "",
    "Run `project <command> --help` for command-specific help.",
  ].join("\n");
}

function commandHelp(name: string): string | undefined {
  const command = commands.find((candidate) => candidate.meta.name === name);
  if (!command) {
    return undefined;
  }
  return [
    `${command.meta.name} — ${command.meta.summary}`,
    "",
    `Usage: ${command.meta.usage}`,
    "",
    "Examples:",
    ...command.meta.examples.map((example) => `  ${example}`),
  ].join("\n");
}

async function main(argv: readonly string[]): Promise<number> {
  const jsonFlag = argv.includes("--json");
  const helpFlag = argv.includes("--help");
  const positional = argv.filter((arg, index) => {
    if (arg.startsWith("--")) {
      return false;
    }
    const previous = argv[index - 1];
    // Values of --name <value> style options are not command names.
    return previous === undefined || !previous.startsWith("--");
  });

  if (positional.length === 0) {
    process.stdout.write(`${rootHelp()}\n`);
    return helpFlag ? 0 : 2;
  }

  const name = positional[0] ?? "";
  const command = commands.find((candidate) => candidate.meta.name === name);
  if (!command) {
    process.stderr.write(
      `${renderError({ code: "NOT_FOUND", message: `unknown command: ${name}` }, wantsJson(jsonFlag, true))}\n\n${rootHelp()}\n`,
    );
    return 4;
  }

  if (helpFlag) {
    process.stdout.write(`${commandHelp(name) ?? ""}\n`);
    return 0;
  }

  const json = wantsJson(jsonFlag, process.stdout.isTTY ?? false);
  const ctx: CommandContext = {
    logger: createLogger(process.env),
    json,
    stdout: (text) => process.stdout.write(`${text}\n`),
    stderr: (text) => process.stderr.write(`${text}\n`),
  };

  const passthrough = argv.filter((arg) => arg !== "--json").slice(1);
  const result: CommandResult = await command.run(passthrough, ctx);

  if (result.ok) {
    ctx.stdout(renderSuccess(result, json));
  } else {
    ctx.stderr(renderError(result.error, json));
  }
  return exitCodeFor(result);
}

const code = await main(process.argv.slice(2));
process.exitCode = code;
