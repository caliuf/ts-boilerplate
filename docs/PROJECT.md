# PROJECT

<!-- META: questo file descrive il boilerplate stesso. In un progetto derivato
va riscritto per descrivere il TUO sistema (è il primo documento che un
     agente legge). La struttura delle sezioni va mantenuta. -->

## Obiettivo

Boilerplate di riferimento per progetti full-TypeScript sviluppati interamente tramite agenti AI: CLI, API HTTP, server MCP e UI web minime ma reali, con tutti i gate di qualità del vademecum già configurati e verdi.

## Non-obiettivi

- Persistenza, autenticazione, multiutente: non esistono data store.
- SSR, SEO: la UI è una SPA Vite.
- Coprire ogni tool opzionale del vademecum (SonarQube, CodeCharta, ecc.): documentati come MAY in `docs/development/WORKFLOWS.md`.

## Deployable esistenti

| Deployable | Package | Comando | Descrizione |
| --- | --- | --- | --- |
| CLI | `apps/cli` | `project <subcommand>` (bin) | Un bin, albero di subcommand |
| API HTTP | `apps/api` | `pnpm --filter @project/api start` | Hono su Node |
| Server MCP | `apps/mcp` | `pnpm --filter @project/mcp start` | Trasporto stdio |
| Web UI | `apps/web` | `pnpm --filter @project/web dev` | React + Vite |

Non esistono: worker, mobile. Non crearli finché non serve.

## Superfici

| Superficie | Presente | Note |
| --- | --- | --- |
| UI web | ✅ | `apps/web` |
| API HTTP | ✅ | `apps/api` |
| CLI | ✅ | `apps/cli` |
| MCP | ✅ | `apps/mcp` |
| Worker | ❌ | |
| Mobile | ❌ | |

## Data store

Nessuno.

## Servizi esterni

Nessuno. Tutte le suite sono deterministiche; non esiste `test-live` reale.

## Flussi critici

1. `hello-world` end-to-end su ogni superficie (coperto da integration + E2E).

## Classificazione dei dati

Nessun dato personale o sensibile: solo il nome opzionale passato a `hello-world`.

## Command map

Vedi la tabella recipe in [`development/GETTING-STARTED.md`](./development/GETTING-STARTED.md#recipe).

## Mappa delle superfici (caso d'uso × canale)

Un caso d'uso esiste una sola volta (`packages/greetings/src/application/`) e ogni superficie lo proietta con naming parallelo.

| Caso d'uso | CLI | API | MCP | UI |
|---|---|---|---|---|
| `sayHello` | `project hello-world` | `GET /api/hello-world` | tool `hello_world` | hook `useHelloWorld` |

Aggiorna questa tabella a ogni nuovo caso d'uso (il docs guard verifica la coerenza con il registry CLI).

## ADR/PDR principali

Gli indici autorevoli, con lo stato di ogni decisione, sono [`architecture/adr/README.md`](./architecture/adr/README.md) (decisioni architetturali) e [`product/pdr/README.md`](./product/pdr/README.md) (decisioni di prodotto). Questa vista riporta solo i riferimenti essenziali per orientarsi:

- [ADR-0001](./architecture/adr/0001-stack-tecnico.md) — stack: Node 24 LTS, TS 7, pnpm, ESM, just, mise.
- [ADR-0002](./architecture/adr/0002-architettura-porte-adapters.md) — modular monolith, ports & adapters.
- [ADR-0006](./architecture/adr/0006-codescene-mcp.md) — CodeScene MCP come autorità di Code Health per gli agenti.
- [PDR-0001](./product/pdr/0001-superficie-hello-world.md) — superficie dimostrativa hello-world.

## Budget

- Performance: nessun probe ancora (performance guard non applicabile).
- Test: precommit ≤ 10s · smoke ≤ 20s · prepush ≤ 60s · suite CI ≤ 10 min (misurato dal testing guard).
- Coverage: cricchetto in `coverage-thresholds.json` (baseline 95/95/94/76).

## Stato delle funzionalità

| Funzionalità | Stato |
|---|---|
| hello-world su CLI/API/MCP/UI | ✅ completo |
