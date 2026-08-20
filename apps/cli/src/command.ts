import type { AppError } from "@project/contracts";

/**
 * Command contract (Vademecum §3, CLI): one file per subcommand, the file
 * tree is the routing table. A command parses input, validates it against the
 * shared schema, calls the use case and maps the result — nothing else.
 */

export type CommandContext = {
  readonly logger: import("@project/greetings").Logger;
  readonly json: boolean;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
};

export type CommandResult =
  | { readonly ok: true; readonly data: unknown; readonly human?: string }
  | { readonly ok: false; readonly error: AppError };

export type Command = {
  readonly meta: {
    readonly name: string;
    readonly summary: string;
    readonly usage: string;
    readonly examples: readonly string[];
  };
  run(args: readonly string[], ctx: CommandContext): Promise<CommandResult>;
};
