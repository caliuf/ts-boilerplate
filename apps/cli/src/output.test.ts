import { describe, expect, it } from "vitest";

import { exitCodeFor, renderError, renderSuccess, wantsJson } from "./output.ts";

describe("wantsJson", () => {
  it("honors the explicit flag", () => {
    expect(wantsJson(true, true)).toBe(true);
  });

  it("defaults to JSON in non-TTY contexts", () => {
    expect(wantsJson(false, false)).toBe(true);
  });

  it("defaults to human output in TTY contexts", () => {
    expect(wantsJson(false, true)).toBe(false);
  });
});

describe("renderSuccess", () => {
  const result = { ok: true as const, data: { message: "Hello, world!" }, human: "Hello, world!" };

  it("renders data as JSON in JSON mode", () => {
    expect(JSON.parse(renderSuccess(result, true))).toEqual({ message: "Hello, world!" });
  });

  it("renders the human string in human mode", () => {
    expect(renderSuccess(result, false)).toBe("Hello, world!");
  });

  it("falls back to JSON when no human string is provided", () => {
    const withoutHuman = { ok: true as const, data: [1, 2] };
    expect(renderSuccess(withoutHuman, false)).toBe(JSON.stringify([1, 2], null, 2));
  });
});

describe("renderError", () => {
  const error = { code: "VALIDATION" as const, message: "bad input" };

  it("renders a structured error in JSON mode", () => {
    expect(JSON.parse(renderError(error, true))).toEqual({
      error: "VALIDATION",
      message: "bad input",
    });
  });

  it("renders a readable error in human mode", () => {
    expect(renderError(error, false)).toBe("Error [VALIDATION]: bad input");
  });
});

describe("exitCodeFor", () => {
  it("maps success to 0", () => {
    expect(exitCodeFor({ ok: true, data: {} })).toBe(0);
  });

  it("maps the shared taxonomy to the fixed exit codes (ADR-0004)", () => {
    expect(exitCodeFor({ ok: false, error: { code: "INTERNAL", message: "" } })).toBe(1);
    expect(exitCodeFor({ ok: false, error: { code: "VALIDATION", message: "" } })).toBe(2);
    expect(exitCodeFor({ ok: false, error: { code: "UNAUTHORIZED", message: "" } })).toBe(3);
    expect(exitCodeFor({ ok: false, error: { code: "NOT_FOUND", message: "" } })).toBe(4);
    expect(exitCodeFor({ ok: false, error: { code: "CONFLICT", message: "" } })).toBe(5);
  });
});
