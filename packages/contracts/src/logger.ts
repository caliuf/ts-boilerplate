/**
 * Porta di logging condivisa: tipi `Logger` e `LogLevel` sono riusati dai bounded
 * context, dagli adapter di I/O e dal testkit. Vivono in `contracts` perché sono
 * parte del linguaggio condiviso dell'ecosistema e non specifici di un singolo
 * contesto. Adapter concreti (pino, console, in-memory) implementano `Logger`.
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
