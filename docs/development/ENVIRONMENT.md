# Environment management

How environment variables are loaded, layered, and kept safe in this repository. For the architectural decision behind this setup see [ADR-0007](../architecture/adr/0007-wrapper-cli-bin-direnv.md); for the product behavior of `hello-world` defaults see [PDR-0001](../product/pdr/0001-superficie-hello-world.md).

## Layering (last wins)

```text
Zod defaults in the composition-root schema        (e.g. name = "world")
  <  .env.default   (committed floor, no secrets)
  <  .env          (gitignored; loaded by the repo .envrc when inside the repo)
  <  caller's env  (loaded by direnv exec "$PWD" from the first .envrc/.env found walking up)
  <  CLI arguments (--name)
```

The committed floor is always active: even when the wrapper is called from a project outside the repository, `.env.default` is sourced before direnv loads the caller's own environment.

## Files

| File | Committed | Loaded by wrapper | Loaded by repo `.envrc` | Purpose |
| --- | --- | --- | --- | --- |
| `.env.example` | yes | no | no | Documented template with realistic fake values. Copy it to `.env` and edit locally. |
| `.env.default` | yes | yes | yes | Safe floor of defaults. Must contain **no secrets**. |
| `.env` | no | no (only via repo `.envrc`) | yes | Local overrides inside the repository. |
| `.envrc.local` | no | no | yes | Per-machine secrets and overrides. Gitignored. |

`.env.default` starts empty (only comments) because there is no real default to enforce yet; the mechanism is the value, and contents will be added when a genuine default exists.

## direnv

direnv is **required** for the `bin/` wrappers. If it is missing or blocked, the wrapper fails loudly rather than run with the wrong environment.

Setup:

```sh
mise install          # installs the pinned direnv version
just setup            # also runs `direnv allow .` for the repo .envrc
direnv allow .        # only needed if you skipped `just setup`
```

Su Debian/Ubuntu, `just install` prepara i prerequisiti di sistema e la toolchain mise; `just setup` completa invece l’installazione specifica del repository (dipendenze pnpm, hook, Chromium e indice CodeGraph). La distinzione e la regola di manutenzione dell’inventario sono documentate in [`GETTING-STARTED.md`](./GETTING-STARTED.md#manutenzione-dei-prerequisiti).

Make sure your shell has the direnv hook installed (`direnv hook bash`, `direnv hook zsh`, etc.); otherwise the interactive shell will not auto-load `.envrc` when you `cd` into the repository.

## `bin/` wrappers

The repository root has a `bin/` directory with thin bash wrappers. Naming convention:

```text
<bin-cli>-<command>
```

Today the only wrapper is `bin/project-hello-world`, where `project` is the placeholder CLI bin name. When the boilerplate is adopted, `project-*` becomes `<your-bin>-*`.

Contract of every wrapper:

- resolves the repository root from its own real path, following symlinks portably;
- requires `node` and `direnv`;
- sources `/.env.default` as the committed floor;
- runs `direnv exec "$PWD"` so the caller's own `.envrc`/`.env` is loaded by walking up from the current working directory;
- preserves stdout as data-only; diagnostics go to stderr;
- exits non-zero on failure with an actionable message.

To use a wrapper from anywhere, add the repository `bin/` directory to your PATH:

```sh
export PATH="/path/to/repo/bin:$PATH"
project-hello-world --name Ada --json
```

## Adding a new wrapper

1. Create `bin/<bin>-<command>` as an executable bash script with `set -euo pipefail`.
2. Resolve the repo root with the same symlink-portable loop used in `bin/project-hello-world`.
3. Source `/.env.default`, run the direnv preflight, then `exec direnv exec "$PWD" node "$repo_root/apps/cli/src/cli.ts" <command> "$@"`.
4. Add an integration test in `tests/integration/bin-wrappers.test.ts` or a dedicated file following the same pattern.
5. Run `just shell-check` and `just doctor`.
