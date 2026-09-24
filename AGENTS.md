# Agent instructions

Canonical development contract for AI agents. Short on purpose: details live in the linked canonical documents. `CLAUDE.md` and `GEMINI.md` are symlinks to this file.

<!-- META(boilerplate): this section is for derived projects. When adopting
the boilerplate, follow docs/development/NEW-PROJECT.md first, then delete this comment and the "Boilerplate placeholders" section below.

Boilerplate placeholders to customize:
     - npm scope `@project` and CLI bin name `project`
     - URN prefix `urn:project:` in packages/contracts
     - CODEOWNERS handle `@YOUR-GITHUB-USERNAME`
     - CodeScene Cloud project id `83744` (here, in `.kilo/kilo.jsonc`, `docs/development/CODESCENE.md` and `docs/memory/environment.md`)
     - the absolute path `/home/dati/workspace/ts-boilerplate` in the working rules (replace with your primary clone path, or drop the rule)
     - any `META:` comment in docs and code
-->

## Start here

1. Run `tools/scripts/agent-briefing.sh` for a one-shot context dump (repo/worktree, git state, gate tools, project memory, open PRs/issues). Read-only; `--no-prs` skips GitHub.
2. Read `docs/PROJECT.md` and `docs/INDEX.md`.
3. Read `docs/memory/project.md` and `docs/memory/environment.md` for durable project context; read `docs/memory/corrections.md` too for tooling, workflow or adoption tasks (Kilo Memory may or may not be active in the current client).
4. Read the README of every package you will modify (all `packages/*` have one; apps, tests and tools are described in `docs/PROJECT.md` and the matching guide).
5. Read the ADR/PDR index first, then the relevant active records; for architecture or product work also read the matching overview, boundaries or glossary.
6. Use only root-level `just` recipes to build, test and validate changes (canonical table: `docs/development/GETTING-STARTED.md`).

## Working rules

- When you make a durable decision, correction or discovery, update the appropriate memory file in the same commit: `project.md` for facts, decisions and constraints; `environment.md` for commands, paths and tool quirks. Update both only when both scopes changed (ADR-0008).
- Keep the change limited to the requested scope; never modify `docs/init/` (frozen blueprint). One task = one branch/worktree (branch naming, PR flow and worktree rules: `docs/development/WORKFLOWS.md` § Branching, PR e worktree).
- When the user does not explicitly request a branch/PR and `realpath $(pwd)` equals `/home/dati/workspace/ts-boilerplate`, the default flow is to apply changes on the current `main` and leave the commit to the user.
- Before starting, check that gates are green (`just smoke` at minimum). During initial bootstrap, run it immediately after `just setup` and `just doctor`, before starting feature work. Never start new work on a below-threshold codebase: restore health first, or report the blocker.
- Work test-first: red → green → refactor. For a bug, the first commit is a failing regression test. A test you have never seen fail is suspect.
- Leave the code you touch better than you found it, measured by the repo gates and by CodeScene when the MCP is connected. Do NOT perform unrelated refactors or dependency upgrades.
- Do not add a dependency unless necessary; significant ones require an ADR.
- Preserve existing public APIs unless the task explicitly changes them.
- Keep domain and application code independent from frameworks and runtimes.
- Validate all external data at runtime with Zod (`packages/contracts`).
- Biome è il formatter automatico di default e oxlint il lint automatico di default, ma nessuno dei due prevale sulla leggibilità: se formatting o linting impongono una forma chiaramente meno leggibile, preferire una suppression locale supportata dal tool e motivata invece di alterare globalmente la configurazione; verificare comunque che il controllo resti esplicito e circoscritto.
- When diagnosing runtime behavior, rerun the flow with `LOG_LEVEL=debug` and cite the relevant log output as evidence; never leave `console.log` or temporary debug output behind.
- Do not use `any`, unchecked casts, `@ts-ignore`, non-null assertions or disable comments to make checks pass in production code; test/tooling boundaries must validate parsed data and keep any unavoidable narrowing local and motivated.
- Do not edit generated files directly (`pnpm-lock.yaml`, coverage reports).
- Before using a library API, verify it exists in the installed version (read its types/docs in `node_modules`); do not rely on memory.
- Do not introduce a product decision without a PDR, nor an architectural decision without an ADR, in the same commit as the code. With Kilo use the `/create-adr` and `/create-pdr` commands; record directories are configured in `conventions.conf`.
- Maintain `tmp/commit-message.md` with the proposed commit message for the work in progress: reset it when starting from a clean `git status`, integrate or fix it otherwise. `tmp/` is gitignored. The message follows the format in `docs/development/WORKFLOWS.md` § Messaggi di commit: prefisso conventional, una riga riassuntiva, riga vuota, lista puntata Markdown col dettaglio. Anche qui niente hard wrap sulle righe.
- Use the automation scripts in `tools/scripts/` instead of repetitive manual commands: `agent-briefing.sh` for task-start context, `gh-prs.sh` for PR inspection, `finish-task.sh` to commit+push+open the PR when explicitly requested (see `docs/development/AGENT-AUTOMATION.md`). Never ignore a "tool not found" warning — fix the PATH instead.

## Documentation style

- Write prose for human readability first; that is also what AI consumes best. Keep AGENTS.md terse, operational and instruction-oriented; let other docs fit their own purpose.
- Never hard-wrap prose at a fixed column: it makes noisy diffs, pollutes git history and forces reflow toil on every edit. Use normal paragraphs separated by a blank line. No opposite dogmas either (mandatory one-sentence-per-line or similar): just good prose.
- Keep AGENTS.md to the minimum operational content; add or change lines sparingly. "<200 lines" is a rule of thumb (SHOULD, not a gate): a signal that it is time to synthesize or move detail to the linked canonical docs, not a limit to hit.

## Language

- The project language is technical-IT Italian (italiano tecnico-informatico). Commit messages are written in the project language.
- Code identifiers (functions, variables, types, file names) stay in English: they are more concise and expressive.
- Comments and documentation are written in Italian; heavy use of English domain-specific terms is fine when a translation would sound weird.
- Exceptions: a file already in English stays in English; files under `docs/memory/` keep their existing language and the `key :: value` format.

## Architecture in one paragraph

One use case = one file in `packages/<context>/src/application/`. The kept surfaces (CLI, HTTP API, MCP and/or web UI) are thin interchangeable entry points: parse → validate (shared schema) → call the use case → map the result. DTOs, schemas and the error taxonomy live in `packages/contracts`. Dependency rules are enforced by `just arch`; the full boundary table is `docs/architecture/BOUNDARIES.md`. Every new use case gets parallel naming on every kept surface and a row in the surface map of `docs/PROJECT.md`.

## CodeScene

When the `codescene` MCP is connected, Code Health is authoritative for maintainability. Do not guess. Details: `docs/development/CODESCENE.md`.

- File: `code_health_score` / `code_health_review`. Before commit of AI-touched code: `pre_commit_code_health_safeguard`. Before a PR: `analyze_change_set`.
- Project: `list_technical_debt_hotspots_for_project` (this repo is pinned as Cloud project `83744`).
- If Code Health regresses, refactor until restored. If the MCP is missing or unauthenticated, report the blocker — do not claim a CodeScene check passed.

## Gate circumvention — prohibited

- NEVER use `--no-verify` or otherwise skip hooks.
- NEVER lower coverage or quality thresholds; they only ratchet up (`just coverage-raise`).
- NEVER extend ignore-lists, exclusions or suppressions to make a gate pass.
- If a gate fails and you cannot find the fix, stop and report the exact failure. Do not work around it.

## Testing

- Prefer integration tests through public APIs; unit tests only where clearer. Details: `docs/development/TESTING.md`.
- Mock only external or non-deterministic boundaries.
- Tests must be isolated, deterministic, fast and behavioral.
- Never call live external services or LLMs unless explicitly requested.
- UI: use design-system components, never raw HTML elements; prefer keyboard-driven interactions.

## Validation

- While developing, `just precommit` is the fast feedback loop on staged/related files.
- A diff that touches only docs/markdown/workflow/hook runs a reduced gate set (`docs-check`, `workflows-check`, secret scan); the exact path list is `DOCS_ONLY_PATTERNS` in the justfile. Anything else takes the full path.
- Before declaring completion run `just prepush` (full static analysis, integration, smoke, coverage); `just ci` replicates the whole CI pipeline locally.
- Do not re-run `just precommit`/`just prepush` immediately before `git commit`/`git push`: the git hooks already run them (see `docs/development/AGENT-AUTOMATION.md`).
- If a required command cannot run, report the exact reason.
- Never claim a check passed unless you executed it successfully; quote the actual command output in the final report.

## GitHub CLI

Before any operation on PRs, issues, checks or repository settings via the GitHub CLI, read `docs/development/GITHUB-CLI.md` for the patterns, gotchas and permission rules specific to this repository.

## Git safety

- Use `git --no-pager` for every Git command: an interactive pager hangs agent shells.
- Do not use destructive Git commands.
- Do not rewrite existing commits or force-push unless explicitly requested.
- Do not delete unrelated or untracked files.
- Do not create commits, push, open PRs, create remotes or change GitHub settings unless the user explicitly asks; when authorized, use the documented automation and GitHub CLI flows.
- Commit message convention (guide, not a gate): `docs/development/WORKFLOWS.md`. Messages are written in the project language (§ Language).

## Final report

Report the following. For a docs-only or otherwise inapplicable item, write `N/A` rather than inferring a result:

1. what changed;
2. tests added or changed;
3. commands executed, with verbatim results;
4. coverage and quality-score deltas;
5. security and static-analysis results;
6. ADR/PDR and documentation updated;
7. remaining risks or unresolved questions;
8. commit message in `tmp/commit-message.md` in a code block.
