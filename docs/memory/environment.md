# Environment Memory

<!-- META(boilerplate): replace the entries below with tool-specific paths, commands, and quirks of your project. Keep the same `key :: value` format. -->

Tool-specific paths, commands, and quirks for this project.

- bun.smoke :: `just bun-smoke` esegue solo il core portabile sotto Bun (Zod, sayHello/greet, logger in-memory), non avvia CLI/API/MCP/web.
- bun.pin :: Bun 1.3.14 pinnato in `.mise.toml`; CI job `bun-compatibility` è gate obbligatorio.
- codescene.project :: Progetto CodeScene Cloud `ts-boilerplate`, id `83744`; pin in `.kilo/kilo.jsonc` (`CS_DEFAULT_PROJECT_ID=83744`).
- kilo.memory_path :: `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/` (locale, non nel repo).
- kilo.memory_diagnose :: `tools/scripts/kilo-memory-diagnose.sh` stampa lo stato del binding Kilo Memory, dell'auto-inject e delle dimensioni del repository memory bank.
- kilo.worktrees :: I worktree di Kilo Agent Manager vivono in `.kilo/worktrees/` (gitignored); `.kilo/setup-script.sh` gira alla creazione (pnpm install + copia `.envrc.local`). Non usare `git stash` fra worktree: è condiviso.
