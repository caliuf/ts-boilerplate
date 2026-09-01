import { execFileSync, spawn } from "node:child_process";
import { accessSync, constants, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, describe, expect, it } from "vitest";

/**
 * Integration contract for `bin/` wrappers.
 * Verifies the wrapper resolves the repo, applies the committed floor, loads
 * the caller's environment via direnv, and fails loudly when prerequisites are
 * missing or the environment is blocked.
 */

const wrapperPath = fileURLToPath(new URL("../../bin/project-hello-world", import.meta.url));

type RunResult = {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
};

function findInPath(name: string): string | undefined {
  const paths = process.env["PATH"]?.split(":") ?? [];
  for (const dir of paths) {
    const candidate = join(dir, name);
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // continue searching
    }
  }
  return undefined;
}

async function createMinimalPathWithoutDirenv(): Promise<string> {
  const binDir = mkdtempSync(join(tmpdir(), "bin-wrapper-path-"));
  const tools = ["bash", "readlink", "dirname"] as const;
  symlinkSync(process.execPath, join(binDir, "node"));
  for (const tool of tools) {
    const found = findInPath(tool);
    if (found === undefined) {
      throw new Error(`Required tool not found in PATH: ${tool}`);
    }
    symlinkSync(found, join(binDir, tool));
  }
  return binDir;
}

async function runWrapper(
  cwd: string,
  args: readonly string[],
  {
    extraEnv = {},
    xdgDataHome,
    path,
  }: {
    readonly extraEnv?: Record<string, string>;
    readonly xdgDataHome?: string;
    readonly path?: string;
  },
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(wrapperPath, args, {
      cwd,
      env: {
        PATH: path ?? process.env["PATH"] ?? "",
        HOME: process.env["HOME"] ?? "",
        XDG_DATA_HOME: xdgDataHome ?? "",
        NO_COLOR: "1",
        LOG_LEVEL: "error",
        ...extraEnv,
      },
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

async function allowDirenv(dir: string): Promise<string> {
  const allowDir = mkdtempSync(join(tmpdir(), "direnv-allow-"));
  execFileSync("direnv", ["allow", dir], {
    env: {
      PATH: process.env["PATH"] ?? "",
      HOME: process.env["HOME"] ?? "",
      XDG_DATA_HOME: allowDir,
    },
  });
  return allowDir;
}

describe("bin/project-hello-world wrapper", () => {
  const createdDirs: string[] = [];

  async function setupAllowedCaller(
    name: string,
  ): Promise<{ readonly callerDir: string; readonly allowDir: string }> {
    const callerDir = mkdtempSync(join(tmpdir(), "bin-wrapper-"));
    createdDirs.push(callerDir);
    writeFileSync(join(callerDir, ".env"), `HELLO_WORLD_NAME="${name}"\n`);
    writeFileSync(join(callerDir, ".envrc"), "dotenv .env\n");
    const allowDir = await allowDirenv(callerDir);
    createdDirs.push(allowDir);
    return { callerDir, allowDir };
  }

  afterEach(async () => {
    for (const dir of createdDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
    createdDirs.length = 0;
  });

  afterAll(async () => {
    // Safety net: any leftover tmp dirs from a crash are ignored.
    await Promise.resolve();
  });

  it("loads HELLO_WORLD_NAME from an allowed .envrc/.env in the caller directory", async () => {
    const { callerDir, allowDir } = await setupAllowedCaller("Ada Lovelace");

    const result = await runWrapper(callerDir, ["--json"], { xdgDataHome: allowDir });
    expect(result.code).toBe(0);
    expect(result.stderr).toContain("direnv: loading");
    expect(JSON.parse(result.stdout.trim())).toEqual({
      message: "Hello, Ada Lovelace!",
    });
  });

  it("prefers --name over the caller's HELLO_WORLD_NAME env var", async () => {
    const { callerDir, allowDir } = await setupAllowedCaller("Ada Lovelace");

    const result = await runWrapper(callerDir, ["--name", "Bob", "--json"], {
      xdgDataHome: allowDir,
    });
    expect(result.code).toBe(0);
    expect(result.stderr).toContain("direnv: loading");
    expect(JSON.parse(result.stdout.trim())).toEqual({ message: "Hello, Bob!" });
  });

  it("falls back to the schema default when the caller has no .env/.envrc", async () => {
    const callerDir = mkdtempSync(join(tmpdir(), "bin-wrapper-"));
    createdDirs.push(callerDir);
    const repoDefault = fileURLToPath(new URL("../../.env.default", import.meta.url));

    // The committed floor must exist and be sourceable by bash.
    expect(() => execFileSync("bash", ["-n", repoDefault], { encoding: "utf8" })).not.toThrow();
    expect(() =>
      execFileSync("bash", ["-c", `set -a; source '${repoDefault}'; set +a; true`], {
        encoding: "utf8",
      }),
    ).not.toThrow();

    const result = await runWrapper(callerDir, ["--json"], {});
    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout.trim())).toEqual({ message: "Hello, world!" });
  });

  it("fails with guidance when the caller's .envrc is not allowed", async () => {
    const callerDir = mkdtempSync(join(tmpdir(), "bin-wrapper-"));
    createdDirs.push(callerDir);
    writeFileSync(join(callerDir, ".env"), "HELLO_WORLD_NAME=Ada\n");
    writeFileSync(join(callerDir, ".envrc"), "dotenv .env\n");
    // Intentionally omit direnv allow to keep the envrc blocked.

    const result = await runWrapper(callerDir, ["--json"], {});
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("direnv allow");
  });

  it("fails with guidance when direnv is not in PATH", async () => {
    const callerDir = mkdtempSync(join(tmpdir(), "bin-wrapper-"));
    const minimalPath = await createMinimalPathWithoutDirenv();
    createdDirs.push(callerDir, minimalPath);

    const result = await runWrapper(callerDir, ["--json"], { path: minimalPath });
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("direnv");
  });
});
