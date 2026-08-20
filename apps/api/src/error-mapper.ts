import type { AppError, HttpErrorStatus } from "@project/contracts";
import { errorCodeToHttpStatus, errorCodeToProblem } from "@project/contracts";

/**
 * RFC 9457 Problem Details mapping (application/problem+json).
 * The shared error taxonomy is mapped once, here; status codes stay coherent
 * with the CLI exit codes (ADR-0004).
 */
export type ProblemDetails = {
  readonly type: string;
  readonly title: string;
  readonly status: HttpErrorStatus;
  readonly detail: string;
};

export function toProblemDetails(error: AppError): ProblemDetails {
  const problem = errorCodeToProblem[error.code];
  return {
    type: problem.type,
    title: problem.title,
    status: errorCodeToHttpStatus[error.code],
    detail: error.message,
  };
}
