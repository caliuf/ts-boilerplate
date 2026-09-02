# Environment Memory

<!-- META(boilerplate): replace the entries below with tool-specific paths, commands, and quirks of your project. Keep the same `key :: value` format. -->

Tool-specific paths, commands, and quirks for this project.

- bun.smoke :: `just bun-smoke` esegue solo il core portabile sotto Bun (Zod, sayHello/greet, logger in-memory), non avvia CLI/API/MCP/web.
- bun.pin :: Bun 1.3.14 pinnato in `.mise.toml`; CI job `bun-compatibility` è gate obbligatorio.
- codegraph.enforcement :: `just setup` runs `codegraph init` + `codegraph index` (warning if the binary is missing), `just pull` runs `codegraph sync` when `.codegraph/` exists; the CLI is installed globally via npm (`@colbymchenry/codegraph`), not mise-managed.
- gates.parallel :: `just precommit`/`just prepush` eseguono i check via `tools/scripts/run-checks.sh`: con GNU parallel installato girano in parallelo (uno slot per core) con stdout/stderr raggruppati per comando nell'ordine originale della lista (`--keep-order` + `exec 2>&1` in testa a ogni job, perché parallel bufferizza i due stream in blocchi separati). Fail-late: tutti i check girano sempre (`--halt never`), il gate esce non-zero alla fine se almeno uno è fallito. Senza GNU parallel tutto torna sequenziale: il tool è opzionale, non pinnabile via mise (package manager di sistema). Su TTY interattivo la wrapper forza i colori (`FORCE_COLOR=1`, `JUST_COLOR=always`, `RUN_CHECKS_COLORS=1` per i flag di biome/tsc); con `NO_COLOR` settata o output su pipe tutto plain. Su `whoami`=caio i job girano sotto `nice -n 19` (mai in CI). `RUN_CHECKS_SEQUENTIAL=1` forza il sequenziale.
- codescene.project :: Progetto CodeScene Cloud `ts-boilerplate`, id `83744`; pin in `.kilo/kilo.jsonc` (`CS_DEFAULT_PROJECT_ID=83744`).
- kilo.memory_path :: `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/` (locale, non nel repo).
- kilo.memory_diagnose :: `tools/scripts/kilo-memory-diagnose.sh` stampa lo stato del binding Kilo Memory, dell'auto-inject e delle dimensioni del repository memory bank.
- kilo.worktrees :: I worktree di Kilo Agent Manager vivono in `.kilo/worktrees/` (gitignored); `.kilo/setup-script.sh` gira alla creazione (pnpm install + copia `.envrc.local`). Non usare `git stash` fra worktree: è condiviso.
- kilo.node_pin :: Node 24.19.0 è il runtime pinnato da `.mise.toml` e **autorità** per typecheck, test, gate (`project.md` runtime.authoritative). La shell nativa di Kilo può esporre un Node diverso (es. mise/latest = 26.x) perché direnv/mise-hook non sono attivi nella subshell: per riprodurre i gate umani invocare i tool via `just` (che ha già `~/.local/share/mise/shims` nel PATH, vedi justfile riga 14) oppure usare la recipe `just node -- <args...>` (`just --list`), che risolve il Node pinnato via `mise exec` e in fallback asserisce che il `node` nel PATH combaci col major pinnato. Non assumere che `node -v` nella subshell di Kilo corrisponda alla toolchain pinnata.
