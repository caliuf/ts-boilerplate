import { afterEach, expect, test, vi } from "vitest";

import { fetchHelloWorld } from "./hello-world-api.ts";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function stubFetch(impl: () => Promise<Response>) {
  const fetchMock = vi.fn<() => Promise<Response>>(impl);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("returns the validated greeting on success", async () => {
  stubFetch(() => Promise.resolve(jsonResponse({ message: "Hello, Ada!" })));

  await expect(fetchHelloWorld("Ada")).resolves.toEqual({
    ok: true,
    value: { message: "Hello, Ada!" },
  });
});

test("encodes the name in the query string", async () => {
  const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({ message: "Hello!" })));

  await fetchHelloWorld("Ada Lovelace");

  expect(fetchMock).toHaveBeenCalledWith("/api/hello-world?name=Ada%20Lovelace");
});

test("omits the query when the name is absent or empty", async () => {
  const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({ message: "Hello, world!" })));

  await fetchHelloWorld(undefined);
  await fetchHelloWorld("");

  expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/hello-world");
  expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/hello-world");
});

test("maps a problem+json error to the shared error code", async () => {
  stubFetch(() =>
    Promise.resolve(
      jsonResponse(
        {
          code: "VALIDATION",
          type: "https://example.test/problems/validation",
          title: "Validation failed",
          status: 400,
          detail: "name too long",
        },
        400,
      ),
    ),
  );

  await expect(fetchHelloWorld("x".repeat(200))).resolves.toEqual({
    ok: false,
    error: { code: "VALIDATION", message: "name too long" },
  });
});

test.each<[string, () => Promise<Response>, string]>([
  ["a network failure", () => Promise.reject(new TypeError("Failed to fetch")), "network error"],
  [
    "a non-JSON error body",
    () =>
      Promise.resolve(
        new Response("<html>bad gateway</html>", {
          status: 502,
          headers: { "content-type": "text/html" },
        }),
      ),
    "request failed",
  ],
  [
    "a success body with the wrong shape",
    () => Promise.resolve(jsonResponse({ greeting: "Hello" })),
    "unexpected response shape",
  ],
])("returns an internal error on %s", async (_label, fetchImpl, message) => {
  stubFetch(fetchImpl);

  await expect(fetchHelloWorld()).resolves.toEqual({
    ok: false,
    error: { code: "INTERNAL", message },
  });
});
