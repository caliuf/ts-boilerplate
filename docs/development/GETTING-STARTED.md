# Getting started

<!-- META(boilerplate): this is the onboarding for the boilerplate itself. When adopting it for a new project, rewrite the project-specific sections (prerequisites, setup, recipe, folder map) to describe your system, while keeping the justfile contract and gate structure. -->

Onboarding tecnico del progetto. Ogni comando citato qui esiste nel `justfile`: un comando inventato o rinominato è un docs bug bloccante in review (il docs guard ne verifica un sottoinsieme).

## Prerequisiti

| Tool | Versione | Installazione |
| --- | --- | --- |
| Node.js | vedi `.node-version` | `mise install` (consigliato) |
| pnpm | vedi `packageManager` in `package.json` | `mise install` |
| just | vedi `.mise.toml` | `mise install` (o [package manager di sistema](https://just.systems/man/en/packages.html)) |
| direnv | vedi `.mise.toml` | `mise install` (richiesto per i wrapper in `bin/`) |
| bun, gitleaks, actionlint, zizmor, lychee, shellcheck | vedi `.mise.toml` | `mise install` |
| codegraph | ≥ 1.5 | `npm install -g @colbymchenry/codegraph` (non gestito da mise) |
| GNU parallel | qualunque recente | package manager di sistema (es. `apt install parallel`); opzionale, non gestito da mise |

Senza mise: installa le stesse versioni con il tuo package manager. I tool mancanti degradano le recipe corrispondenti a warning in locale, ma restano **bloccanti in CI** — non abituarti ai warning. GNU parallel è l'unica eccezione: è un'accelerazione opzionale di `precommit`/`prepush` e la sua assenza non produce warning, solo un'esecuzione sequenziale.

Verifica sempre con:

```sh
just doctor
```

## Setup

```sh
just setup
```

Installa i tool (mise), le dipendenze (pnpm), gli hook git (`.githooks/`), autorizza il `.envrc` con direnv, i browser Playwright (chromium) e inizializza l'indice CodeGraph (`codegraph init` + `codegraph index`, saltato con warning se il binario non è installato).

```sh
just pull
```

Dopo aver integrato PR esterne (ad esempio Dependabot), aggiorna il branch corrente e sincronizza tool, dipendenze e hook solo se i file pertinenti sono cambiati. Se il repository è indicizzato, aggiorna anche l'indice CodeGraph (`codegraph sync`).

## Sviluppo

```sh
just dev          # API (:3100) + web (:5100) in parallelo
node apps/cli/src/cli.ts hello-world --name Ada
```

Configurazione: vedi [`docs/development/ENVIRONMENT.md`](./ENVIRONMENT.md) per la catena di caricamento di `.env.default`, `.env` e `.envrc.local`. L'environment è validato all'avvio da ogni composition root.

## Recipe

`just` è l'unica interfaccia operativa: gli script in `package.json` sono dettagli implementativi, non chiamarli direttamente.

### Ciclo di vita

| Comando | Funzione |
| --- | --- |
| `just setup` | Installa dipendenze, tool, hook e indice CodeGraph |
| `just pull` | Pull e sincronizza tool/dipendenze/hook solo se cambiati; aggiorna l'indice CodeGraph |
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
| `just secrets-staged` | Gitleaks sul solo diff in stage (pre-commit hook) |
| `just shell-check` | Shellcheck sui wrapper in `bin/` |

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

Se un diff tocca solo docs/markdown/workflow/hook (lista esatta: variabile `DOCS_ONLY_PATTERNS` nel justfile), `precommit`/`prepush` riducono i gate ai controlli pertinenti (`docs-check`, `workflows-check`).

I check di `precommit`/`prepush` girano via `tools/scripts/run-checks.sh`: con GNU parallel installato sono eseguiti in parallelo (uno slot per core) ma stdout/stderr restano raggruppati per comando nell'ordine originale della lista; senza, tornano sequenziali. I gate sono fail-late: tutti i check girano sempre, anche dopo un fallimento, e il gate fallisce alla fine — un solo giro mostra tutti i problemi. Su terminale interattivo i colori dei tool sono forzati (`FORCE_COLOR`, `JUST_COLOR`, più i flag dedicati di biome e tsc); con `NO_COLOR` settata (anche vuota, es. `NO_COLOR= just prepush`) o con output su pipe/redirect l'output resta plain, senza ANSI — consigliato agli agenti per risparmiare token. Sulla macchina di sviluppo principale (`whoami` = caio) i check girano sotto `nice -n 19`; in CI mai. `RUN_CHECKS_SEQUENTIAL=1` forza il percorso sequenziale anche con parallel installato.

## Test e debug

- Test: `just test-unit`, `just test-integration`, `just test-e2e` — vedi
  [`TESTING.md`](./TESTING.md).
- Debug di un flusso: rieseguilo con log di debug e cita l'output nel report:

```sh
LOG_LEVEL=debug node apps/cli/src/cli.ts hello-world --name Ada 2>&1
LOG_LEVEL=debug just dev
```

I log sono JSON strutturato fuori dal TTY (leggibili da macchine e agenti) e pretty a colori nel TTY. Mai lasciare `console.log` o log temporanei: sono un gate rosso.

Code Health (agenti, via MCP): [`CODESCENE.md`](./CODESCENE.md). Non sostituisce i gate `just`.

## Mappa delle cartelle

```text
bin/            Wrapper bash per il PATH globale (`<bin>-<comando>`)
.envrc          direnv del repo (carica `.env.default`, `.env`, `.envrc.local`)
.env.default    Floor di environment committato (mai segreti)
.env.example    Template per `.env` (non caricato)
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
tools/scripts         doctor, diff-scope, coverage-raise, guards, bun-smoke, run-checks
.githooks/            hook versionati (chiamano solo just)
docs/                 documentazione (questa)
docs/init/            blueprint congelato (non toccare, rimuovere all'adozione)
```
