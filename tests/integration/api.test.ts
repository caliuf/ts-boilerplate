import { createApp } from "@project/api";
import { helloWorldOutputSchema, problemDetailsSchema } from "@project/contracts";
import { createMemoryLogger } from "@project/testkit";
import { describe, expect, it } from "vitest";

/**
 * API integration suite: drives the real Hono app through `app.request`
 * (real HTTP semantics, no port). Mocking happens only at external
 * boundaries — here, the Logger port with an in-memory adapter.
 */

function makeApp() {
  const { logger, entries } = createMemoryLogger();
  return { app: createApp({ logger }), entries };
}

describe("GET /api/hello-world", () => {
  it("returns the default greeting", async () => {
    const { app } = makeApp();
    const response = await app.request("/api/hello-world");
    expect(response.status).toBe(200);
    const body = helloWorldOutputSchema.parse(await response.json());
    expect(body).toEqual({ message: "Hello, world!" });
  });

  it("greets a given name", async () => {
    const { app } = makeApp();
    const response = await app.request("/api/hello-world?name=Ada");
    expect(response.status).toBe(200);
    const body = helloWorldOutputSchema.parse(await response.json());
    expect(body).toEqual({ message: "Hello, Ada!" });
  });

  it("returns RFC 9457 problem details on invalid input", async () => {
    const { app } = makeApp();
    const response = await app.request(`/api/hello-world?name=${"a".repeat(101)}`);
    expect(response.status).toBe(400);
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    const problem = problemDetailsSchema.parse(await response.json());
    expect(problem.type).toBe("urn:project:error:validation");
    expect(problem.status).toBe(400);
  });

  it("logs the request handling at the boundary", async () => {
    const { app, entries } = makeApp();
    await app.request("/api/hello-world?name=Ada");
    expect(entries.some((entry) => entry.message === "saying hello")).toBe(true);
  });
});
