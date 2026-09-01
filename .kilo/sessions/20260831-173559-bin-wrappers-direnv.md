
## Objective

- Implement the `.kilo/plans/20260831-173559-bin-wrappers-direnv.md` plan: add `bin/` bash wrappers, make direnv required, load `.env.default` as a floor, wire `just shell-check`, update docs/ADR/PDR, and make all gates green.

## Important Details

- direnv 2.25.2 is the system version and lacks `dotenv_if_exists`/`source_env_if_exists`; `.envrc` was made compatible with both 2.25.2 and 2.37.1.
- `shellcheck` required `-x` to follow the sourced `.env.default` without inline disables.
- The plan file itself had markdown lint errors that blocked `just docs-check`; it was corrected.
- `process.env.PATH`/`HOME` must be accessed with `["PATH"]` due to `noPropertyAccessFromIndexSignature`.
- `mise exec -- just <recipe>` is required because the active shell is on Node 26.5.0 while the project pins 24.19.0.

## Work State

### Completed

- `apps/cli/src/commands/hello-world.ts`: env var `HELLO_WORLD_NAME` default precedence implemented.
- `apps/cli/src/commands/hello-world.test.ts`: 3 new env-var unit tests added and passing.
- `.envrc`, `.env.default`, `.env.example`, `.gitignore` created/updated.
- `bin/project-hello-world` wrapper created, executable, and smoke-tested.
- `tests/integration/bin-wrappers.test.ts`: 5 integration tests created and passing.
- `justfile`: `shell-check` recipe added and wired into `precommit`, `prepush`, `ci`; `setup` now runs `direnv allow .`.
- `tools/scripts/doctor.ts`: direnv is now a hard check plus `.envrc` allowed/blocked warning.
- `.mise.toml`: pinned `direnv = "2.37.1"`.
- `knip.json`: added `ignoreBinaries: ["direnv"]`.
- ADR-0007 created; PDR-0001 amended; ADR README updated.
- Docs updated: `ENVIRONMENT.md` (new), `GETTING-STARTED.md`, `WORKFLOWS.md`, `NEW-PROJECT.md`, `PROJECT.md`, `README.md`, `INDEX.md`, `Vademecum Typescript.md`, `project-words.txt`.
- `just prepush`, `just test-unit`, `just test-integration`, `just smoke`, `just coverage`, `just docs-check`, `just workflows-check`, `just secrets`, `just shell-check`, `just doctor` all pass under `mise exec --`.

### Active

- Re-running `just precommit` after refactoring `tests/integration/bin-wrappers.test.ts` to reduce duplication flagged by CodeScene.

### Blocked

- Previous `just precommit` failure: CodeScene reported `tests/integration/bin-wrappers.test.ts: degraded — Code Duplication [introduced]`. Refactored with a `setupAllowedCaller` helper; re-run pending.

## Next Move

1. Run `mise exec -- just precommit` to verify the duplication fix and the full pre-push gate.
2. If green, run `mise exec -- just ci` as a final local CI replica and prepare the summary of deviations from the plan.

## Relevant Files

- `.kilo/plans/20260831-173559-bin-wrappers-direnv.md`: source plan.
- `apps/cli/src/commands/hello-world.ts` / `hello-world.test.ts`: env-var default behavior.
- `bin/project-hello-world`: new wrapper.
- `tests/integration/bin-wrappers.test.ts`: integration contract; currently being refactored for CodeScene.
- `justfile`, `tools/scripts/doctor.ts`, `.mise.toml`, `knip.json`: gate/tool wiring.
- `docs/development/ENVIRONMENT.md`: new environment documentation.
- `docs/architecture/adr/0007-wrapper-cli-bin-direnv.md`: new ADR.
- `docs/product/pdr/0001-superficie-hello-world.md`: amended PDR.
