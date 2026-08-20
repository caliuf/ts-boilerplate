import type { AppError, HelloWorldOutput } from "@project/contracts";
import { useState } from "react";

import { fetchHelloWorld } from "./hello-world-api.ts";

export type HelloWorldState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: HelloWorldOutput }
  | { readonly status: "error"; readonly error: AppError };

/**
 * Server state for the greeting feature, kept separate from UI state
 * (Vademecum §3, UI web). The naming mirrors the use case on every surface:
 * `hello-world` (CLI/API), `hello_world` (MCP), `useHelloWorld` (UI).
 */
export function useHelloWorld() {
  const [state, setState] = useState<HelloWorldState>({ status: "idle" });

  const run = async (name?: string) => {
    setState({ status: "loading" });
    const result = await fetchHelloWorld(name);
    setState(
      result.ok
        ? { status: "success", data: result.value }
        : { status: "error", error: result.error },
    );
  };

  return { state, run } as const;
}
