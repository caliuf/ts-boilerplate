import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { commands } from "@project/cli/registry";
import { describe, expect, it } from "vitest";

/**
 * CLI contract suite (Vademecum §3, "Contratto agent-first"): iterates the
 * registry and verifies, for EVERY command, `--help`, `--json`, exit codes
 * and stdout/stderr separation. The contract is a gate, not a convention.
 */

const cliPath = fileURLToPath(new URL("../../apps/cli/src/cli.ts", import.meta.url));

type RunResult = {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
};

async function runCli(args: readonly string[]): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    // Isola l'env del child dal contesto del test runner: rimuoviamo
    // esplicitamente NO_COLOR e FORCE_COLOR per evitare il warning
    // "NO_COLOR is ignored due to FORCE_COLOR being set" di Node 24.x
    // quando entrambe sono presenti nell'env ereditato. Il contratto
    // stderr è "JSON puro quando --json" e deve valere indipendentemente
    // da come il test runner è stato invocato (TTY umano, agent, CI).
    const { NO_COLOR: _nc, FORCE_COLOR: _fc, ...cleanEnv } = process.env;
    const child = spawn(process.execPath, [cliPath, ...args], {
      env: { ...cleanEnv, LOG_LEVEL: "error" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

describe("CLI contract", () => {
  it("exposes at least one command in the registry", () => {
    expect(commands.length).toBeGreaterThan(0);
  });

  it("prints root help and exits 0 with --help", async () => {
    const result = await runCli(["--help"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: project <command>");
  });

  it("fails with exit code 4 on an unknown command", async () => {
    const result = await runCli(["does-not-exist"]);
    expect(result.code).toBe(4);
    expect(result.stderr).toContain("unknown command");
  });
});

describe.each(commands.map((command) => [command.meta.name] as const))("command `%s`", (name) => {
  it("supports --help with usage and examples", async () => {
    const result = await runCli([name, "--help"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("Examples:");
  });

  it("emits parseable JSON on stdout with --json and nothing data-like on stderr", async () => {
    const result = await runCli([name, "--json"]);
    expect(result.code).toBe(0);
    expect(() => JSON.parse(result.stdout)).not.toThrow();
  });

  it("emits JSON by default in non-TTY (piped) contexts", async () => {
    const result = await runCli([name]);
    expect(result.code).toBe(0);
    expect(() => JSON.parse(result.stdout)).not.toThrow();
  });
});

describe("hello-world", () => {
  it("greets the world by default", async () => {
    const result = await runCli(["hello-world", "--json"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ message: "Hello, world!" });
  });

  it("greets a given name", async () => {
    const result = await runCli(["hello-world", "--name", "Ada", "--json"]);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ message: "Hello, Ada!" });
  });

  it("maps invalid input to exit code 2 with a structured error on stderr", async () => {
    const result = await runCli(["hello-world", "--name", "   ", "--json"]);
    expect(result.code).toBe(2);
    expect(result.stdout).toBe("");
    const error = JSON.parse(result.stderr) as { error: string; message: string };
    expect(error.error).toBe("VALIDATION");
    expect(error.message.length).toBeGreaterThan(0);
  });
});
