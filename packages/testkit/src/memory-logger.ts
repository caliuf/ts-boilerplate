import type { Logger, LogLevel } from "@project/contracts";

export type LogEntry = {
  readonly level: LogLevel;
  readonly context: Record<string, unknown>;
  readonly message: string;
};

export type MemoryLogger = {
  readonly logger: Logger;
  readonly entries: LogEntry[];
};

/**
 * In-memory Logger adapter for tests. Production code must never import
 * testkit (dependency-cruiser rule `no-testkit-in-production`).
 */
export function createMemoryLogger(level: LogLevel = "debug"): MemoryLogger {
  const entries: LogEntry[] = [];
  const record = (entryLevel: LogLevel) => (context: Record<string, unknown>, message: string) => {
    entries.push({ level: entryLevel, context, message });
  };
  return {
    entries,
    logger: {
      level,
      trace: record("trace"),
      debug: record("debug"),
      info: record("info"),
      warn: record("warn"),
      error: record("error"),
    },
  };
}
