import { describe, expect, it } from "vitest";

import { greet } from "./greeting.ts";

describe("greet", () => {
  it("greets the given name", () => {
    expect(greet("world").message).toBe("Hello, world!");
  });

  it("greets an arbitrary name", () => {
    expect(greet("Ada").message).toBe("Hello, Ada!");
  });
});
