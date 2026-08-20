import { createMemoryLogger } from "@project/testkit";
import { describe, expect, it } from "vitest";

import type { CommandContext } from "../command.ts";
import { run } from "./hello-world.ts";

function makeCtx(): CommandContext {
  const { logger } = createMemoryLogger();
  return { logger, json: true, stdout: () => {}, stderr: () => {} };
}

describe("hello-world command", () => {
  it("greets the world by default", async () => {
    const result = await run([], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, world!" } });
  });

  it("greets a given name", async () => {
    const result = await run(["--name", "Ada"], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, Ada!" } });
  });

  it("maps schema violations to a VALIDATION error", async () => {
    const result = await run(["--name", "   "], makeCtx());
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
  });

  it("maps unknown flags to a VALIDATION error", async () => {
    const result = await run(["--wat"], makeCtx());
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
  });
});
