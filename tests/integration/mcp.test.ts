import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { createServer } from "@project/mcp";
import { createMemoryLogger } from "@project/testkit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * MCP integration suite: a real client connected to the real server over a
 * linked in-memory transport pair. Tool handlers contain no logic of their
 * own, so the assertions target the use case contract and the tool metadata
 * (descriptions written for the model, curated surface).
 */

let client: Client;
let server: ReturnType<typeof createServer>;

beforeEach(async () => {
  const { logger } = createMemoryLogger();
  server = createServer({ logger });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
});

afterEach(async () => {
  await client.close();
  await server.close();
});

describe("MCP tool surface", () => {
  it("exposes exactly the curated tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual(["hello_world"]);
  });

  it("documents the tool for the model", async () => {
    const { tools } = await client.listTools();
    const tool = tools[0];
    expect(tool?.description).toContain("greeting");
    expect(tool?.annotations?.readOnlyHint).toBe(true);
  });
});

describe("hello_world tool", () => {
  it("greets the world without arguments", async () => {
    const result = await client.callTool({ name: "hello_world", arguments: {} });
    expect(result.structuredContent).toEqual({ message: "Hello, world!" });
  });

  it("greets a given name", async () => {
    const result = await client.callTool({ name: "hello_world", arguments: { name: "Ada" } });
    expect(result.structuredContent).toEqual({ message: "Hello, Ada!" });
  });

  it("maps invalid input to a tool error with the shared taxonomy", async () => {
    const result = await client.callTool({
      name: "hello_world",
      arguments: { name: "a".repeat(101) },
    });
    expect(result.isError).toBe(true);
  });
});
