import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

/**
 * Smoke suite (≤ 20s budget): the single most critical path of the system,
 * run through the real entry point as a subprocess.
 */
const cliPath = fileURLToPath(new URL("../../apps/cli/src/cli.ts", import.meta.url));

it("smoke: the CLI answers hello-world end to end", async () => {
  const result = await new Promise<{ code: number | null; stdout: string }>((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, "hello-world"]);
    let stdout = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout }));
  });
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ message: "Hello, world!" });
});
