/**
 * Ports: interfaces towards the outside world, owned by the bounded context.
 * Adapters (pino, browser console, in-memory test doubles) implement them.
 * The domain never sees a logger; the application layer decides what to log.
 */

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

export type Logger = {
  readonly level: LogLevel;
  trace(context: Record<string, unknown>, message: string): void;
  debug(context: Record<string, unknown>, message: string): void;
  info(context: Record<string, unknown>, message: string): void;
  warn(context: Record<string, unknown>, message: string): void;
  error(context: Record<string, unknown>, message: string): void;
};
