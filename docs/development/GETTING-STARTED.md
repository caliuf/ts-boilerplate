# Getting started

Onboarding tecnico del progetto. Ogni comando citato qui esiste nel
`justfile`: un comando inventato o rinominato è un docs bug bloccante in
review (il docs guard ne verifica un sottoinsieme).

## Prerequisiti

| Tool | Versione | Installazione |
| --- | --- | --- |
| Node.js | vedi `.node-version` | `mise install` (consigliato) |
| pnpm | vedi `packageManager` in `package.json` | `mise install` |
| just | vedi `.mise.toml` | `mise install` (o [package manager di sistema](https://just.systems/man/en/packages.html)) |
| bun, gitleaks, actionlint, zizmor, lychee, shellcheck | vedi `.mise.toml` | `mise install` |

Senza mise: installa le stesse versioni con il tuo package manager. I tool
mancanti degradano le recipe corrispondenti a warning in locale, ma restano
**bloccanti in CI** — non abituarti ai warning.

Verifica sempre con:

```sh
just doctor
```

## Setup

```sh
just setup
```

Installa i tool (mise), le dipendenze (pnpm), gli hook git (`.githooks/`) e i
browser Playwright (chromium).

## Sviluppo

```sh
just dev          # API (:3100) + web (:5100) in parallelo
node apps/cli/src/cli.ts hello-world --name Ada
```

Configurazione: copia `.env.example` in `.env` (opzionale, tutti i default
funzionano). L'environment è validato all'avvio da ogni composition root.

## Recipe

`just` è l'unica interfaccia operativa: gli script in `package.json` sono
dettagli implementativi, non chiamarli direttamente.

### Ciclo di vita

| Comando | Funzione |
| --- | --- |
| `just setup` | Installa dipendenze, tool e hook |
| `just doctor` | Verifica runtime, tool e configurazione |
| `just dev` | Avvia lo sviluppo (API + web) |

### Analisi statica

| Comando | Funzione |
| --- | --- |
| `just fix` | Applica format e fix sicuri |
| `just format-check` | Verifica formattazione e import |
| `just typecheck` | Typecheck completo |
| `just lint` | Lint type-aware |
| `just dead-code` | Knip: file/export/dipendenze inutilizzati |
| `just arch` | Regole architetturali e cicli |
| `just docs-check` | Markdown, spelling, link locali |
| `just workflows-check` | actionlint e zizmor |
| `just secrets` | Gitleaks sul working tree |

### Test

| Comando | Funzione |
| --- | --- |
| `just test-unit` | Piccola suite specialistica |
| `just test-integration` | Suite principale |
| `just test-related` | Test collegati ai file in stage |
| `just test-e2e` | Flussi end-to-end (Playwright) |
| `just test-live` | Servizi reali/LLM; mai implicito (oggi: nessuno) |
| `just coverage` | Suite con coverage e soglie a cricchetto |
| `just coverage-raise` | Alza i threshold al valore corrente (solo salita) |
| `just smoke` | Sottoinsieme critico (≤ 20s) |
| `just bun-smoke` | Compatibility suite Bun |
| `just guards` | Guard report-only (Vademecum §10) |

### Gate

| Comando | Funzione | Budget |
| --- | --- | --- |
| `just precommit` | Controlli rapidi su staged/related | ≤ 10s |
| `just prepush` | Static analysis e integration principali | ≤ 60s |
| `just ci` | Esatta pipeline CI in locale | ≤ 10min |

Se un diff tocca solo docs/markdown/workflow/hook (lista esatta: variabile
`DOCS_ONLY_PATTERNS` nel justfile), `precommit`/`prepush` riducono i gate ai
controlli pertinenti (`docs-check`, `workflows-check`).

## Test e debug

- Test: `just test-unit`, `just test-integration`, `just test-e2e` — vedi
  [`TESTING.md`](./TESTING.md).
- Debug di un flusso: rieseguilo con log di debug e cita l'output nel report:

```sh
LOG_LEVEL=debug node apps/cli/src/cli.ts hello-world --name Ada 2>&1
LOG_LEVEL=debug just dev
```

I log sono JSON strutturato fuori dal TTY (leggibili da macchine e agenti) e
pretty a colori nel TTY. Mai lasciare `console.log` o log temporanei: sono un
gate rosso.

## Mappa delle cartelle

```text
apps/cli        CLI (un bin, subcommand in src/commands/<nome>.ts)
apps/api        API HTTP (Hono; route in src/routes/)
apps/mcp        server MCP stdio (tool in src/tools/)
apps/web        UI (Vite+React; src/features/<feature>/, src/design-system/)
packages/contracts    DTO, schemi Zod, tassonomia errori
packages/greetings    bounded context di riferimento (domain/application/ports)
packages/adapter-pino adapter Logger → pino
packages/testkit      doppioni di test (mai in produzione)
tests/integration     suite principale (contratto CLI, API, MCP, smoke)
tests/e2e             flussi Playwright
tools/scripts         doctor, diff-scope, coverage-raise, guards, bun-smoke
.githooks/            hook versionati (chiamano solo just)
docs/                 documentazione (questa)
docs/init/            blueprint congelato (non toccare, rimuovere all'adozione)
```
