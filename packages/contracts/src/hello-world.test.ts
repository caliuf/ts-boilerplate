import { describe, expect, it } from "vitest";

import { helloWorldInputSchema } from "./hello-world.ts";

describe("helloWorldInputSchema", () => {
  it("defaults the name to world", () => {
    expect(helloWorldInputSchema.parse({})).toEqual({ name: "world" });
  });

  it("trims whitespace", () => {
    expect(helloWorldInputSchema.parse({ name: "  Ada  " })).toEqual({ name: "Ada" });
  });

  it("rejects an empty name", () => {
    expect(helloWorldInputSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(helloWorldInputSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
  });

  it("rejects non-string names", () => {
    expect(helloWorldInputSchema.safeParse({ name: 42 }).success).toBe(false);
  });
});
