import type { HelloWorldOutput, Result } from "@project/contracts";
import { helloWorldOutputSchema, problemDetailsSchema } from "@project/contracts";

/**
 * Typed API client for the greeting feature. Responses are validated against
 * the shared schemas: external data is never trusted (Vademecum §3,
 * "Contratti e dati esterni"). Types are never redefined manually — they come
 * from `@project/contracts`.
 */
export async function fetchHelloWorld(name?: string): Promise<Result<HelloWorldOutput>> {
  const query = name === undefined || name === "" ? "" : `?name=${encodeURIComponent(name)}`;
  let response: Response;
  try {
    response = await fetch(`/api/hello-world${query}`);
  } catch {
    return { ok: false, error: { code: "INTERNAL", message: "network error" } };
  }

  const raw: unknown = await response.json();
  if (!response.ok) {
    const problem = problemDetailsSchema.safeParse(raw);
    return {
      ok: false,
      error: {
        code: "VALIDATION",
        message: problem.success ? problem.data.detail : "request failed",
      },
    };
  }

  const parsed = helloWorldOutputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: { code: "INTERNAL", message: "unexpected response shape" } };
  }
  return { ok: true, value: parsed.data };
}
