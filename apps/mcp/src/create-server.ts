import { McpServer } from "@modelcontextprotocol/server";

import type { Logger } from "@project/greetings";

import { registerHelloWorldTool } from "./tools/hello-world.ts";

export type McpDeps = {
  readonly logger: Logger;
};

/**
 * Server factory: registers the curated tool surface. Kept separate from the
 * stdio bootstrap so integration tests can connect an in-memory client.
 */
export function createServer(deps: McpDeps): McpServer {
  const server = new McpServer({ name: "project", version: "0.1.0" });
  registerHelloWorldTool(server, deps);
  return server;
}
