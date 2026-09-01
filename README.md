# ts-boilerplate

Boilerplate per progetti **full-TypeScript sviluppati interamente tramite agenti AI**: un monorepo con CLI, API HTTP, server MCP e UI web minimi ma reali, e tutta l'infrastruttura di qualità (guide, gate, guard) già configurata e verde.

Il caso d'uso dimostrativo è `hello-world`, esposto identico su ogni superficie. Il valore è la struttura, non il contenuto.

## Per chi è

- **Umani** che iniziano un progetto TypeScript (script, CLI, servizi, web app) e vogliono delegare l'implementazione ad agenti AI senza perdere il controllo sulla qualità nel tempo.
- **Agenti AI**, che trovano qui istruzioni machine-oriented (`AGENTS.md`), confini applicati da gate deterministici e documentazione gerarchica.

## Avvio rapido

```sh
just setup        # tool (mise), dipendenze (pnpm), hook git, direnv allow, browser Playwright
just doctor       # verifica che tutto sia a posto
just dev          # API su :3100 + web su :5100
node apps/cli/src/cli.ts hello-world --name Ada
just ci           # l'intera pipeline, in locale
```

Dopo `just setup` puoi anche aggiungere `bin/` al PATH e chiamare `project-hello-world` da qualsiasi directory; vedi [`docs/development/ENVIRONMENT.md`](./docs/development/ENVIRONMENT.md).

Prerequisiti: `just`, `mise` e `direnv` (o le versioni equivalenti installate a mano — vedi [`docs/development/GETTING-STARTED.md`](./docs/development/GETTING-STARTED.md)).

## Adottare il boilerplate per un nuovo progetto

Segui la guida passo passo con prompt pronti per l'agente: **[`docs/development/NEW-PROJECT.md`](./docs/development/NEW-PROJECT.md)** — rinomina dei placeholder, rimozione delle superfici non necessarie, setup GitHub (ruleset, security), attivazione dei task schedulati.

## Mappa dei file

| File/cartella | Contenuto |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | Contratto operativo per gli agenti AI (canonico; `CLAUDE.md` e `GEMINI.md` sono symlink) |
| [`README.md`](./README.md) | Questo file |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Come contribuire (umani e agenti) |
| [`SECURITY.md`](./SECURITY.md) | Segnalazione vulnerabilità |
| [`justfile`](./justfile) | Unica interfaccia operativa (task runner) |
| [`bin/`](./bin/) | Wrapper bash per l'uso da PATH globale |
| [`docs/INDEX.md`](./docs/INDEX.md) | Indice della documentazione |
| [`docs/PROJECT.md`](./docs/PROJECT.md) | Cos'è il sistema: il primo file che un agente legge |
| [`docs/architecture/`](./docs/architecture/) | Overview, confini (gate) e ADR |
| [`docs/product/`](./docs/product/) | Overview, glossario e PDR |
| [`docs/development/`](./docs/development/) | Guide: setup, codice, test, CI/CD, sicurezza, adozione |
| [`docs/init/`](./docs/init/) | Blueprint congelato (vademecum e fonti) — non toccare, rimuovere all'adozione |
| [`apps/cli`](./apps/cli/) | CLI: un bin con subcommand |
| [`apps/api`](./apps/api/) | API HTTP (Hono) |
| [`apps/mcp`](./apps/mcp/) | Server MCP (stdio) |
| [`apps/web`](./apps/web/) | UI web (React + Vite) |
| [`packages/contracts`](./packages/contracts/) | DTO, schemi Zod, tassonomia errori |
| [`packages/greetings`](./packages/greetings/) | Bounded context di riferimento |
| [`packages/adapter-pino`](./packages/adapter-pino/) | Adapter di logging |
| [`packages/testkit`](./packages/testkit/) | Doppioni di test |
| [`tests/`](./tests/) | Suite integration ed E2E |
| [`tools/scripts`](./tools/scripts/) | doctor, diff-scope, coverage-raise, guards, bun-smoke |
| [`.githooks/`](./.githooks/) | Hook git versionati |
| [`.github/workflows/`](./.github/workflows/) | Unica CI per push/PR; security e guards in slow lane settimanale |

## Il modello: Guides, Gates, Guards

1. **Guides** corte e vive (`AGENTS.md` < 200 righe come rule of thumb, non gate; docs gerarchiche).
2. **Gates** deterministici a cricchetto: typecheck, lint type-aware, formattazione, dead code, architettura, segreti, test, coverage — in locale prima che in CI, mai aggirabili.
3. **Guards** schedulati e report-only: creano task invece di codice.

L'obiettivo non è la velocità iniziale ma **non degradare nel tempo**. Le regole complete: [`docs/init/Vademecum Typescript.md`](./docs/init/Vademecum%20Typescript.md) (blueprint di origine; nei progetti derivati basta `AGENTS.md` + `docs/`).
