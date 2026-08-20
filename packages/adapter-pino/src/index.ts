import type { Logger, LogLevel } from "@project/greetings";
import pino from "pino";

export type PinoLoggerOptions = {
  readonly level: LogLevel;
  /** Pretty, colorized output for humans. JSON structured output otherwise. */
  readonly pretty: boolean;
  /** Stream selection by file descriptor. Default: 2 (stderr). */
  readonly fd?: 1 | 2;
};

/**
 * pino adapter for the `Logger` port (ADR-0002).
 * JSON in production/CI (machine- and agent-readable), pretty colors in
 * development. Same port, two transports (Vademecum §3, Logging).
 */
export function createPinoLogger(options: PinoLoggerOptions): Logger {
  const fd = options.fd ?? 2;
  const instance = pino(
    { level: options.level },
    options.pretty
      ? pino.transport({ target: "pino-pretty", options: { destination: fd } })
      : pino.destination(fd),
  );
  return {
    level: options.level,
    trace: (context, message) => instance.trace(context, message),
    debug: (context, message) => instance.debug(context, message),
    info: (context, message) => instance.info(context, message),
    warn: (context, message) => instance.warn(context, message),
    error: (context, message) => instance.error(context, message),
  };
}
