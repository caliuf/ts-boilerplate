import { createMemoryLogger } from "@project/testkit";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CommandContext } from "../command.ts";
import { run } from "./hello-world.ts";

function makeCtx(): CommandContext {
  const { logger } = createMemoryLogger();
  return { logger, json: true, stdout: () => {}, stderr: () => {} };
}

describe("hello-world command", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });
  it("greets the world by default", async () => {
    const result = await run([], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, world!" } });
  });

  it("greets a given name", async () => {
    const result = await run(["--name", "Ada"], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, Ada!" } });
  });

  it("uses HELLO_WORLD_NAME env var as default when no --name is passed", async () => {
    vi.stubEnv("HELLO_WORLD_NAME", "Ada");
    const result = await run([], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, Ada!" } });
  });

  it("prefers --name over HELLO_WORLD_NAME env var", async () => {
    vi.stubEnv("HELLO_WORLD_NAME", "Ada");
    const result = await run(["--name", "Bob"], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, Bob!" } });
  });

  it("ignores HELLO_WORLD_NAME env var when it is empty or whitespace-only", async () => {
    vi.stubEnv("HELLO_WORLD_NAME", "   ");
    const result = await run([], makeCtx());
    expect(result).toMatchObject({ ok: true, data: { message: "Hello, world!" } });
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
