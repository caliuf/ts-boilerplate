---
type: ADR
id: "0007"
title: "Wrapper CLI in bin/ e gestione environment con direnv"
status: active
date: 2026-09-01
---

## Context

The repository exposes a CLI bin (`project <subcommand>`) via `apps/cli/src/cli.ts`. Two gaps became visible once we wanted to call it from arbitrary directories and from the user's PATH:

1. **No `.env` was actually loaded**: the documentation said to copy `.env.example` to `.env`, but no code read it. The composition roots only validate `process.env` with Zod, so local overrides were silently ignored.
2. **No PATH-global wrapper**: running `node apps/cli/src/cli.ts` from a different working directory works thanks to Node 24 type-stripping and pnpm symlinks, but it is not a surface a human or another agent can rely on from the shell. A thin bash wrapper is needed.

At the same time we want the environment rules to be explicit, auditable, and safe by default: secrets must stay gitignored, and a committed "floor" of safe defaults must always be present.

## Decision

**Introduce a `bin/` directory with thin bash wrappers**, one per `bin-cli command` (`bin/project-hello-world`), and make `direnv` a hard requirement for those wrappers. The environment is layered in this order (last wins):

1. Zod defaults in the composition-root schema (e.g. `name = "world"`).
2. `/.env.default` (committed, sourced by the wrapper as a floor, also loaded by the repo `.envrc`).
3. `.env` loaded by the repo `.envrc` when the caller is inside the repository.
4. The caller's own `.envrc`/`.env` loaded by `direnv exec "$PWD"`.
5. Explicit command-line arguments (`--name`).

The committed `.envrc` at the repository root is:

```bash
if [ -f .env.default ]; then dotenv .env.default; fi
if [ -f .env ]; then dotenv .env; fi
if [ -f .envrc.local ]; then source .envrc.local; fi
```

(The stdlib functions `dotenv_if_exists` and `source_env_if_exists` were avoided because the system direnv 2.25.2 does not provide them; the form above is equivalent and works with both 2.25.2 and 2.37.1.)

The wrapper `bin/project-hello-world`:

- resolves the repository root from its own real path, portably (no GNU `readlink -f`);
- hard-requires `node` and `direnv` and fails loudly with an actionable message if either is missing;
- sources `/.env.default` as the committed floor;
- runs a preflight `direnv exec "$PWD" true` and fails if the caller's environment is blocked;
- `exec`s the real CLI via `direnv exec "$PWD" node "$REPO_ROOT/apps/cli/src/cli.ts" hello-world "$@"`.

`direnv` is promoted from optional to a required tool in `just doctor`. The recipe `just shell-check` (shellcheck over `bin/*`) is added to `precommit`, `prepush`, and `ci`. `just setup` runs `direnv allow .` when direnv is available.

## Options considered

- **`set dotenv-load` in `justfile`** — rejected: it only covers just recipes, not the wrapper scripts nor an interactive shell.
- **Custom `.env` parser in the wrapper** — rejected: bash parsing of env files is a footgun (quoting, comments, `export`). `.env.default` is instead a committed file under our control that we source safely with `set -a`.
- **Optional direnv with silent fallback** — rejected: running with the wrong environment (e.g. wrong API port for a future `serve` wrapper) is worse than failing. The wrapper therefore fails if direnv is missing or blocked.
- **`.env.example` as the loaded floor** — rejected: `.env.example` must remain a documented template with realistic fake values, not a committed floor that changes runtime defaults. `.env.default` is the loaded floor and starts empty (only comments) until a real default is needed.

## Consequences

- `bin/` can be added to the user's PATH; the wrapper works from any directory while preserving the caller's cwd and layering environments correctly.
- Missing or blocked direnv is a hard failure with an actionable message, so environment mistakes are surfaced immediately.
- The committed `.env.default` and `.envrc` contain no secrets; real secrets live in `.env` and `.envrc.local`, both gitignored.
- Adding a new command wrapper requires only a new bash script in `bin/` following the same convention (`<bin>-<command>`), plus the corresponding recipe wiring in the documentation.

## Enforcement

- `just shell-check` lints every file in `bin/` with `shellcheck -x` (follows the sourced `.env.default`).
- `just doctor` checks for `direnv` and reports whether the repository `.envrc` is allowed or blocked.
- `tests/integration/bin-wrappers.test.ts` exercises the wrapper from a temporary directory with controlled `.envrc`/`.env` fixtures.
- `docs/development/ENVIRONMENT.md` documents the layering contract and the placeholder convention.

## Migration / rollback

Rollback: remove `bin/`, `.envrc`, `.env.default`, revert the `direnv` check in `tools/scripts/doctor.ts`, remove the `shell-check` recipe and its wiring from `justfile`, and remove `direnv` from `.mise.toml`. No persistent data or migration is required.

## Advice

The repository's `docs/init/Vademecum Typescript.md` is normally frozen, but the user explicitly requested this exception so the vademecum keeps the environment tooling table aligned with the boilerplate. The change is limited to the tooling paragraph and the environment configuration paragraph.
