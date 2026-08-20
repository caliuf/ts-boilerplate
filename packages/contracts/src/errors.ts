/**
 * Shared error taxonomy (Vademecum §3, "Superfici di ingresso").
 *
 * ONE taxonomy for every surface: the CLI maps codes to exit codes, the HTTP
 * API maps them to RFC 9457 Problem Details, the MCP server maps them to tool
 * errors, the web client maps them to UI messages. Never redefine these codes
 * per surface.
 */

export const ERROR_CODES = [
  "INTERNAL",
  "VALIDATION",
  "UNAUTHORIZED",
  "NOT_FOUND",
  "CONFLICT",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type AppError = {
  readonly code: ErrorCode;
  readonly message: string;
};

/** Discriminated result type for fallible operations. */
export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * CLI exit-code mapping (fixed by ADR-0004):
 * 0 ok · 1 internal · 2 invalid input · 3 auth · 4 not found · 5 conflict
 */
export const errorCodeToExitCode: Readonly<Record<ErrorCode, number>> = {
  INTERNAL: 1,
  VALIDATION: 2,
  UNAUTHORIZED: 3,
  NOT_FOUND: 4,
  CONFLICT: 5,
};

/** HTTP status mapping, kept coherent with the CLI exit codes above. */
export const errorCodeToHttpStatus = {
  INTERNAL: 500,
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
} as const satisfies Record<ErrorCode, number>;

export type HttpErrorStatus = (typeof errorCodeToHttpStatus)[ErrorCode];

/** RFC 9457 problem type URNs and human titles, one per error code. */
export const errorCodeToProblem: Readonly<Record<ErrorCode, { type: string; title: string }>> = {
  INTERNAL: { type: "urn:project:error:internal", title: "Internal error" },
  VALIDATION: { type: "urn:project:error:validation", title: "Invalid input" },
  UNAUTHORIZED: { type: "urn:project:error:unauthorized", title: "Unauthorized" },
  NOT_FOUND: { type: "urn:project:error:not-found", title: "Not found" },
  CONFLICT: { type: "urn:project:error:conflict", title: "Conflict" },
};
