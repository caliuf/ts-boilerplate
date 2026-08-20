import { createMemoryLogger } from "@project/testkit";
import { describe, expect, it } from "vitest";

import { sayHello } from "./say-hello.ts";

describe("sayHello", () => {
  it("returns the greeting for the validated input", () => {
    const { logger } = createMemoryLogger();
    expect(sayHello({ logger }, { name: "Ada" })).toEqual({ message: "Hello, Ada!" });
  });

  it("logs the invocation at info level with the name as context", () => {
    const { logger, entries } = createMemoryLogger();
    sayHello({ logger }, { name: "Ada" });
    expect(entries).toEqual([{ level: "info", context: { name: "Ada" }, message: "saying hello" }]);
  });
});
