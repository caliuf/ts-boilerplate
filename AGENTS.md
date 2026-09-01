# Agent instructions

Canonical development contract for AI agents. Short on purpose: details live in the linked canonical documents. `CLAUDE.md` and `GEMINI.md` are symlinks to this file.

<!-- META(boilerplate): this section is for derived projects. When adopting
the boilerplate, follow docs/development/NEW-PROJECT.md first, then delete this comment and the "Boilerplate placeholders" section below.

Boilerplate placeholders to customize:
     - npm scope `@project` and CLI bin name `project`
     - URN prefix `urn:project:` in packages/contracts
     - CODEOWNERS handle `@YOUR-GITHUB-USERNAME`
     - any `META:` comment in docs and code
-->

## Start here

1. Read `docs/PROJECT.md` and `docs/INDEX.md`.
2. Read the README of every package you will modify.
3. Read the relevant active ADRs (`docs/architecture/adr/`) and PDRs (`docs/product/pdr/`).
4. Use only root-level `just` recipes to build, test and validate changes (canonical table: `docs/development/GETTING-STARTED.md`).

## Working rules

- Keep the change limited to the requested scope. One task = one branch/worktree.
- Before starting, check that gates are green (`just smoke` at minimum). Never start new work on a below-threshold codebase: restore health first, or report the blocker.
- Work test-first: red → green → refactor. For a bug, the first commit is a failing regression test. A test you have never seen fail is suspect.
- Leave the code you touch better than you found it, measured by the repo gates and by CodeScene when the MCP is connected. Do NOT perform unrelated refactors or dependency upgrades.
- Do not add a dependency unless necessary; significant ones require an ADR.
- Preserve existing public APIs unless the task explicitly changes them.
- Keep domain and application code independent from frameworks and runtimes.
- Validate all external data at runtime with Zod (`packages/contracts`).
- When diagnosing runtime behavior, rerun the flow with `LOG_LEVEL=debug` and cite the relevant log output as evidence; never leave `console.log` or temporary debug output behind.
- Do not use `any`, unchecked casts, `@ts-ignore`, non-null assertions or disable comments to make checks pass.
- Do not edit generated files directly (`pnpm-lock.yaml`, coverage reports).
- Before using a library API, verify it exists in the installed version (read its types/docs in `node_modules`); do not rely on memory.
- Do not introduce a product decision without a PDR, nor an architectural decision without an ADR, in the same commit as the code. With Kilo use the `/create-adr` and `/create-pdr` commands; record directories are configured in `conventions.conf`.
- Maintain `tmp/commit-message.md` with the proposed commit message for the work in progress: reset it when starting from a clean `git status`, integrate or fix it otherwise. `tmp/` is gitignored.

## Documentation style

- Write prose for human readability first; that is also what AI consumes best. Keep AGENTS.md terse, operational and instruction-oriented; let other docs fit their own purpose.
- Never hard-wrap prose at a fixed column: it makes noisy diffs, pollutes git history and forces reflow toil on every edit. Use normal paragraphs separated by a blank line. No opposite dogmas either (mandatory one-sentence-per-line or similar): just good prose.
- Keep AGENTS.md to the minimum operational content; add or change lines sparingly. "<200 lines" is a rule of thumb (SHOULD, not a gate): a signal that it is time to synthesize or move detail to the linked canonical docs, not a limit to hit.

## Architecture in one paragraph

One use case = one file in `packages/<context>/src/application/`. CLI (`apps/cli`), HTTP API (`apps/api`), MCP (`apps/mcp`) and web UI (`apps/web`) are thin interchangeable entry points: parse → validate (shared schema) → call the use case → map the result. DTOs, schemas and the error taxonomy live in `packages/contracts`. Dependency rules are enforced by `just arch`; the full boundary table is `docs/architecture/BOUNDARIES.md`. Every new use case gets parallel naming on every surface and a row in the surface map of `docs/PROJECT.md`.

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

- During development run `just precommit`.
- Before completion run `just prepush`.
- If a required command cannot run, report the exact reason.
- Never claim a check passed unless you executed it successfully; quote the actual command output in the final report.

## Git safety

- Do not use destructive Git commands.
- Do not rewrite existing commits or force-push unless explicitly requested.
- Do not delete unrelated or untracked files.
- Commit message convention (guide, not a gate): `docs/development/WORKFLOWS.md`.

## Final report

Report:

1. what changed;
2. tests added or changed;
3. commands executed, with verbatim results;
4. coverage and quality-score deltas;
5. security and static-analysis results;
6. ADR/PDR and documentation updated;
7. remaining risks or unresolved questions;
8. commit message in `tmp/commit-message.md` in a code block.
