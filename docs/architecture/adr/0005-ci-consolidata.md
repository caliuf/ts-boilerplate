---
type: ADR
id: "0005"
title: "CI consolidata: un solo workflow per push/PR, security in slow lane settimanale"
status: active
date: 2026-08-20
---

## Context

Il vademecum suggerisce workflow separati (`ci.yml`, `e2e.yml`, `security.yml`). Al primo push ogni evento attivava tre run contemporanei; sul repository privato due dei tre erano in larga parte inerti (CodeQL e Dependency Review richiedono GitHub Advanced Security sui privati e si auto-escludono). Il maintainer preferisce un solo run per evento, più leggibile e più economico in minuti CI.

## Decision

**Un unico workflow `ci.yml` per push e PR** con i job `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e` e `dependency-review` (quest'ultimo solo su PR pubbliche). **`security.yml` resta ma solo in slow lane**: scansione segreti su tutta la storia e CodeQL una volta a settimana, più esecuzione manuale.

## Options considered

- **Workflow unico + security settimanale** (scelta) — pro: un run per evento,   status check più semplici da configurare nel ruleset, nessun minuto sprecato   su job che si auto-escludono; contro: un fallimento E2E flaky marca rossa   l'intera CI (mitigato dai retry di Playwright in CI).
- **Struttura separata del vademecum** — pro: rerun isolato dell'E2E, blast   radius minimo tra workflow; contro: tre run per push, rumore e costo su un   progetto piccolo.
- **Tenere security.yml su push/PR** — scartato: i segreti sono già gate in   pre-commit/prepush (staged e working tree); la storia non cambia a ogni   push in modo rilevante.

## Consequences

- I nomi dei job richiesti dal ruleset non cambiano (`e2e` resta `e2e`,   ora dentro `ci.yml`).
- Quando il progetto cresce (E2E lunghi, flaky o matrice browser), valutare il   ritorno a un `e2e.yml` separato con una nuova ADR.
- Su repo pubblico o con GHAS: rimuovere le condizioni `if` su `codeql` e   `dependency-review` per attivarli a pieno regime.

## Enforcement

`just workflows-check` (actionlint + zizmor) su ogni modifica; zizmor resta pulito.

## Migration / rollback

Rollback: ripristinare `e2e.yml` dalla storia git e riaggiungere i trigger push/PR a `security.yml`.
