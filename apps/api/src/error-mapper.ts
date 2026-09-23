import type { AppError, ProblemDetailsDto } from "@project/contracts";
import { errorCodeToHttpStatus, errorCodeToProblem } from "@project/contracts";

/**
 * RFC 9457 Problem Details mapping (application/problem+json).
 * The shared error taxonomy is mapped once, here; status codes stay coherent
 * with the CLI exit codes (ADR-0004).
 */
export function toProblemDetails(error: AppError): ProblemDetailsDto {
  const problem = errorCodeToProblem[error.code];
  return {
    code: error.code,
    type: problem.type,
    title: problem.title,
    status: errorCodeToHttpStatus[error.code],
    detail: error.message,
  };
}
