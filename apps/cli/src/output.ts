import type { AppError } from "@project/contracts";
import { errorCodeToExitCode } from "@project/contracts";

import type { CommandResult } from "./command.ts";

/**
 * Agent-first output contract (Vademecum §3, CLI):
 * - stdout carries ONLY data; warnings/logs go to stderr (pino writes there);
 * - every command supports --json; JSON is the default in non-TTY contexts;
 * - structured errors {"error","message"} on stderr, including JSON mode;
 * - exit codes from the shared taxonomy (ADR-0004).
 */

export function wantsJson(explicitJson: boolean, stdoutIsTTY: boolean): boolean {
  return explicitJson || !stdoutIsTTY;
}

export function renderSuccess(result: CommandResult & { ok: true }, json: boolean): string {
  if (json) {
    return JSON.stringify(result.data, null, 2);
  }
  if (result.human !== undefined) {
    return result.human;
  }
  return JSON.stringify(result.data, null, 2);
}

export function renderError(error: AppError, json: boolean): string {
  if (json) {
    return JSON.stringify({ error: error.code, message: error.message });
  }
  return `Error [${error.code}]: ${error.message}`;
}

export function exitCodeFor(result: CommandResult): number {
  if (result.ok) {
    return 0;
  }
  return errorCodeToExitCode[result.error.code];
}
