import type { Command } from "./command.ts";
import { meta as helloWorldMeta, run as helloWorldRun } from "./commands/hello-world.ts";

/**
 * Declarative registry of the CLI surface. This is NOT a barrel: it imports
 * and registers, it does not re-export. One entry per subcommand; the
 * integration contract suite iterates this list and verifies `--help`,
 * `--json`, exit codes and stream separation for every command.
 *
 * The same registry is the source for the surface map in docs/PROJECT.md.
 */
export const commands: readonly Command[] = [{ meta: helloWorldMeta, run: helloWorldRun }];
