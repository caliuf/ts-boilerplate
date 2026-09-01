# Project Memory Bank

<!-- META(boilerplate): this is the repository-local memory bank. When adopting
this boilerplate for a new project, replace the project-specific facts, decisions,
and environment entries with the ones that apply to your system, and keep the
structure and conventions. See docs/development/NEW-PROJECT.md. -->

This directory is the **repository-local memory bank** for this project. It complements (and, when Kilo's built-in memory is unavailable, replaces) the native Kilo Memory store by keeping durable project context inside the repository, where it can be versioned, shared, and inspected.

## Why this exists

Kilo Memory is project-scoped and stored in the global Kilo data directory (`~/.local/share/kilo/memory/`). It is enabled per repository and injects context automatically. However, it is an opt-in, client-side feature: it may be disabled, the directory may be hard to inspect, or another user/agent opening the repository may not see it.

The repository memory bank is a **transparent, portable fallback**: every significant fact, decision, constraint, or correction is also recorded here so that any agent (or human) can rebuild context from a fresh clone.

## Scope and conventions

- **Facts**: durable project truths (environment conventions, runtime versions, file purposes, tool locations).
- **Decisions**: architectural (ADR) and product (PDR) decisions that are still active.
- **Constraints**: hard rules that limit implementation choices.
- **Corrections**: explicit overrides or clarifications issued during a session.
- **Session digests**: concise summaries of what happened in a notable session, when useful for continuity.

Format each entry as a bullet starting with a stable key, followed by `::` and a short sentence. Keep entries atomic and actionable. Do not store secrets, tokens, or transient debug output.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | This file: purpose, conventions, and index. |
| `project.md` | Active facts, decisions, constraints, open questions. |
| `environment.md` | Tool/runtime-specific commands and paths. |
| `corrections.md` | Explicit corrections or clarifications from sessions. |
| `sessions/` | Notable session digests (optional, named `YYYYMMDD-HHMMSS-topic.md`). |

## How agents use it

1. At the start of a task, read `project.md` and `environment.md` if they exist.
2. When the user asks about prior work, search this directory before relying on general knowledge.
3. When an important decision, constraint, or correction is made, append it to the appropriate file in the same commit as the code (or in a dedicated docs commit).
4. Keep `project.md` tidy: move superseded items to the relevant ADR/PDR and mark them as superseded.

## Relationship with ADR/PDR

This memory bank is **operational short-term context**: it mirrors the durable records in `docs/architecture/adr/` and `docs/product/pdr/`, plus the small facts that do not deserve a full decision record. When a decision stabilizes, it should be captured in an ADR/PDR and only summarized here.
