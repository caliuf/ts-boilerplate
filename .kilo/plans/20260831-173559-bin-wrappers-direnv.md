# Wrapper CLI in `bin/` con direnv e gestione environment

## Part I — High-Level Design

### 1. Objective and definition of done

Obiettivi:

1. Directory `bin/` alla radice del repo con wrapper bash eseguibili (senza estensione `.sh`), pensati per essere aggiunti al PATH di sistema e chiamabili da qualunque directory di lavoro. Convenzione di naming: `<bin-cli>-<comando>` → oggi `project-hello-world`, perché `project` è il placeholder del bin CLI di questo boilerplate (vedi §5). I wrapper sono sottili: risolvono la repo root, preparano l'environment, delegano al bin CLI.
2. **direnv obbligatorio** per i wrapper: l'environment caricato è quello della cwd del chiamante (walk-up verso i parent: primo `.envrc` o `.env` trovato), con `.env.default` del repo (committato) come floor sempre attivo sotto tutto.
3. Comando CLI `hello-world`: precedenza del nome = parametro `--name` > variabile d'ambiente `HELLO_WORLD_NAME` > default `world` dello schema Zod (invariato).
4. `just doctor`: direnv diventa tool **richiesto** (❌ fail se assente), più un check ⚠️ warn se il `.envrc` del repo non è autorizzato (`direnv allow`).
5. Nuovo gate `just shell-check` (shellcheck) sui file di `bin/`; documentazione completa incluso il vademecum (richiesta esplicita dell'utente, vedi §6); ADR-0007; emenda di PDR-0001.

**Definition of done**:

- `just prepush` verde, incluso il nuovo integration test `tests/integration/bin-wrappers.test.ts` che crea una tmp dir con `.envrc`/`.env`, esegue il wrapper da quella cwd e verifica stdout/exit code.
- `just test-unit` verde con i 3 nuovi casi sul default da env var.
- `just doctor` mostra `✅ direnv` (e lo stato di autorizzazione del `.envrc`).
- `just shell-check` verde su `bin/`.
- docs guard verde (tutte le recipe citate nei docs esistono nel justfile).

### 2. Scope and non-goals

**In scope**:

- `bin/project-hello-world` (primo e unico wrapper; la convenzione copre i futuri).
- `.envrc` (committato), `.env.default` (committato), `.env.example` (aggiornato), `.gitignore` (aggiunge `.envrc.local`).
- Default da env var nel comando CLI `hello-world`.
- Check direnv in `tools/scripts/doctor.ts`.
- Recipe `shell-check` nel justfile + wiring in `precommit`, `prepush`, `ci`; `just setup` esegue `direnv allow` del repo.
- `.mise.toml`: pin di direnv.
- Test: unit (estensione file esistente) + integration (file nuovo).
- ADR-0007 (nuova), emenda PDR-0001, indice ADR.
- Docs: nuovo `docs/development/ENVIRONMENT.md`; update di GETTING-STARTED, WORKFLOWS, NEW-PROJECT, PROJECT, README, INDEX, vademecum (`docs/init/Vademecum Typescript.md`), `tools/cspell/project-words.txt`.

**Non-obiettivi**:

- Wrapper per i dev server api/web (restano `just dev`); wrapper per MCP.
- Nuovi comandi CLI oltre `hello-world`.
- `set dotenv-load` nel justfile (alternativa scartata, §5).
- Estendere shellcheck a script preesistenti (`tools/scripts/*.sh`, `.githooks/*`): da valutare in altra sede.
- Modifiche a dominio (`packages/greetings`) o contratti (`packages/contracts`): il default `world` resta nello schema condiviso.
- Aggiungere `bin/` al PATH automaticamente: è una scelta dell'utente, documentata.

### 3. Current state

Fatti verificati sul repository (2026-08-31):

- **Non esistono** `bin/` né `.envrc`. `.env` è gitignored e `.env.example` esiste, ma **gap latente: oggi niente carica `.env`** — nessun uso di dotenv nel codice; i composition root (`apps/api/src/main.ts`, `apps/mcp/src/server.ts`, `apps/cli/src/cli.ts`) validano solo `process.env` con Zod; `apps/web/vite.config.ts` legge `API_PORT`/`WEB_PORT` da `process.env`. La riga "copia `.env.example` in `.env`" di GETTING-STARTED oggi non ha effetto pratico: l'introduzione di direnv corregge questo gap.
- CLI: bin `project` → `apps/cli/src/cli.ts` (`apps/cli/package.json`); registry dichiarativo in `apps/cli/src/registry.ts`; comandi in `apps/cli/src/commands/<nome>.ts`. Verificato sperimentalmente: `node <path-assoluto>/apps/cli/src/cli.ts hello-world --json` funziona da una cwd estranea (`/tmp`) — type-stripping nativo di Node 24 e resolution dei package `@project/*` relativa allo script via symlink pnpm.
- Il default `world` vive in `helloWorldInputSchema` (`packages/contracts/src/hello-world.ts`, riga con `.default("world")`), condiviso da CLI/API/MCP/UI.
- `shellcheck` è pinnato in `.mise.toml` e warn in doctor, ma **nessuna recipe lo esegue** (gap latente che l'arrivo di `bin/` rende reale).
- direnv: 2.25.2 presente di sistema (`/usr/bin/direnv`); il registry mise offre fino a 2.37.1; la CI usa `jdx/mise-action` → aggiungere direnv a `.mise.toml` lo rende disponibile in CI senza altre modifiche ai workflow.
- Semantica direnv rilevante (man page): `direnv exec DIR COMMAND` esegue COMMAND dopo aver caricato il primo `.envrc` o `.env` trovato risalendo da DIR; un `.envrc` non autorizzato è "blocked" e l'exec fallisce con messaggio che suggerisce `direnv allow`. Stdlib: `dotenv`, `dotenv_if_exists`, `source_env_if_exists`.
- Test: unit in `apps/**/*.test.ts` (ctx sintetico con `createMemoryLogger` da `@project/testkit`); integration in `tests/integration/*.test.ts` con spawn di processi reali (pattern in `cli-contract.test.ts`).
- docs guard (`tools/scripts/guards.ts`) verifica che ogni `just <recipe>` citata nei docs esista nel justfile e che ogni comando del registry CLI compaia nella surface map di `docs/PROJECT.md`.
- ADR attive 0001–0006 (indice `docs/architecture/adr/README.md`); PDR-0001 attiva (`docs/product/pdr/0001-superficie-hello-world.md`); `conventions.conf` dichiara ADR_PATH e PDR_PATH.
- Vincoli repo: prosa docs senza hard-wrap; niente `any`/cast/disable-comment per passare i gate; niente `--no-verify`; test deterministici e isolati; dominio puro senza `node:*`.

### 4. Target architecture and end-to-end flow

**Catena dell'environment** (precedenza crescente):

```text
default Zod negli schema dei composition root   (rete ultima; "world" vive qui)
  <  .env.default   (committato, root del repo: floor sicuro, mai segreti)
  <  .env del repo  (gitignored; caricato dal .envrc del repo quando la cwd è nel repo)
  <  env del chiamante via `direnv exec "$PWD"` (walk-up: primo .envrc/.env dalla cwd in su)
  <  parametri espliciti del comando (--name)
```

`.envrc` committato alla root del repo:

```bash
# shellcheck shell=bash
dotenv_if_exists .env.default
dotenv_if_exists .env
source_env_if_exists .envrc.local
```

**Flusso del wrapper `bin/project-hello-world`**:

1. Risolve `REPO_ROOT` dal proprio realpath con loop symlink portabile (no `readlink -f`, GNU-only): funziona sia con `bin/` nel PATH sia con symlink dello script.
2. Check hard sui prerequisiti: `node` presente e ≥ 22.18 (type-stripping stabile; il repo pinna 24.19.0) e `direnv` presente. Assenti → messaggio su stderr con guida (installare via `mise install` o package manager; vedi `docs/development/ENVIRONMENT.md`), exit 1. direnv è obbligatorio: niente fallback silenzioso.
3. Applica il floor: `set -a; source "$REPO_ROOT/.env.default"; set +a` (file controllato e committato, bash-sourceable per contratto).
4. Preflight: `direnv exec "$PWD" true`. Se fallisce (tipicamente `.envrc` bloccato), rilancia il messaggio di direnv su stderr aggiungendo il suggerimento azionabile (`direnv allow` nella directory indicata) ed esce 1.
5. Esegue: `exec direnv exec "$PWD" node "$REPO_ROOT/apps/cli/src/cli.ts" hello-world "$@"`. La cwd del chiamante è preservata (è ciò che permette al futuro `serve` di trovare il `.env` del progetto web da cui lo si chiama); stdout resta data-only, i diagnostici vanno a stderr.

Nota di separazione: il `.env` del repo **non** si propaga quando il wrapper è chiamato da un progetto estraneo (niente doppio `direnv exec` annidato): dentro il repo ci pensa l'hook direnv via `.envrc`; fuori, il floor è `.env.default` e sopra c'è solo l'env del chiamante.

**Default da env nel comando CLI**: in `apps/cli/src/commands/hello-world.ts`, il nome passato allo schema diventa `values.name ?? HELLO_WORLD_NAME_normalizzata`, dove la normalizzazione tratta variabile assente o solo-spazi come "non fornita". Lo schema Zod resta l'unica autorità su validazione e default finale.

### 5. Key decisions, rationale, and rejected alternatives

- **Naming `project-hello-world`** (deciso con l'utente): coerente col sistema di placeholder del boilerplate (bin `project`, scope `@project`, `urn:project:`), rinominato all'adozione come tutto il resto. Requisito esplicito dell'utente: documentare chiaramente che `project` è un placeholder e quale sarà la convenzione futura (`<nome>-<comando>`) — va in `docs/development/ENVIRONMENT.md`, nella checklist di `NEW-PROJECT.md` e in un commento META nello script. Alternativa scartata: `ts-boilerplate-hello-world` hardcoded (rompe la simmetria dei placeholder).
- **direnv obbligatorio nei wrapper** (deciso con l'utente): se manca, fallimento rumoroso con guida. Rationale: eseguire silenziosamente con l'env sbagliato (es. porta API errata per un futuro `serve`) è peggio che non eseguire. Doctor coerente: direnv è check required (fail), non warn-tier. Alternative scartate: "fallimento intelligente" solo se esiste un file env (troppo sottile da ragionare); warning e prosecuzione (rischio env sbagliato silenzioso).
- **`.env.default` distinto da `.env.example`** (proposto dall'utente, raffinato in planning): `.env.example` resta il template documentato e **non caricato**; `.env.default` è **caricato** dai wrapper come floor. Contenuto iniziale di `.env.default`: **solo commenti** (header che spiega scopo e regole). Rationale: metterci `LOG_LEVEL` cambierebbe il default `debug`-in-TTY di sviluppo; metterci `HELLO_WORLD_NAME` annullerebbe la demo della catena `param > env > world`. Il meccanismo è attivo e testato; i contenuti arrivano quando esiste un default reale.
- **Layering sempre attivo**, non "fallback solo se il chiamante non ha env": un `.env` parziale del chiamante eredita comunque il floor di `.env.default`. Implementazione: `source` del default + singolo `direnv exec "$PWD"`.
- **`HELLO_WORLD_NAME` letta nel comando CLI** (adapter), non nel dominio né nei contratti: il dominio resta puro (vincolo architetturale, gate `just arch`), lo schema condiviso resta l'unica autorità sul default finale. Nome della variabile: surface-parallel, greppabile.
- **Env var vuota o solo-spazi = assente**: le env var sono configurazione ambientale, non input utente; fallire con VALIDATION per una var vuota in un `.env` ereditato sarebbe ostile.
- **Shellcheck sui soli file di `bin/`** nella nuova recipe `shell-check`: gli script preesistenti (`tools/scripts/*.sh`, `.githooks/*`) restano fuori scope per non trascinare fix non correlati. `.envrc` e `.env.default` non vanno in shellcheck: il loro contratto è comportamentale (test integration che li esercita) e shellcheck su file di sole assegnazioni richiederebbe exclusion (vietato dallo spirito anti-circumvention di AGENTS.md).
- **Alternativa scartata: `set dotenv-load` nel justfile** — coprirebbe solo le recipe just, non i wrapper né la shell interattiva; doppia semantica con direnv.
- **Alternativa scartata: parser `.env` custom nei wrapper** — parsing bash di file env è un footgun (quoting, commenti, export); `.env.default` è file controllato e sourced in modo sicuro (`set -a`).
- **Nessuna backdoor di test** nei wrapper: isolamento con `XDG_DATA_HOME` puntato a una tmp dir per `direnv allow`, e PATH minimale costruita con symlink per simulare l'assenza di direnv.

### 6. Risks, compatibility, migration, rollout, and rollback

- **Rischio `.envrc` bloccato**: `direnv exec` fallisce su `.envrc` non autorizzati → mitigato dal preflight con guida esplicita; `just setup` esegue `direnv allow` per il repo quando direnv è presente.
- **Compatibilità**: `project hello-world` senza `HELLO_WORLD_NAME` è bit-identico a oggi; la precedenza env è solo aggiuntiva. PDR-0001 emendata (stessa decisione, comportamento esteso), non superseded.
- **Portabilità wrapper**: bash ≥ 4, `readlink`, `dirname`; resolver symlink portabile Linux/macOS. Node ≥ 22.18 richiesto dal type-stripping (repo pinna 24.19.0; il check nel wrapper usa la floor tecnica e suggerisce la via canonica mise).
- **CI**: nessuna modifica ai workflow: direnv arriva da `jdx/mise-action` tramite il pin in `.mise.toml` (registry verificato: 2.37.1 disponibile).
- **Vademecum congelato**: la convenzione di `docs/INDEX.md` dichiara `docs/init/` congelato; l'utente ha **esplicitamente richiesto** l'aggiornamento del vademecum. Intervento chirurgico: paragrafo configurazione di §3 (direnv, `.envrc`, `.env.default`) e riga nella tabella tooling di §4. Da registrare nell'ADR-0007.
- **Rollout**: nessuno speciale; dopo il merge l'utente esegue `just setup` (installa direnv via mise, autorizza il `.envrc`) e aggiunge `bin/` al PATH a mano (documentato).
- **Rollback**: revert del commit; nessuna migrazione dati o stato persistente.

## Part II — Implementation Details

### 7. Implementation contract

**Required behavior and invariants**:

- stdout dei wrapper resta data-only (contratto agent-first); errori e diagnostici su stderr con istruzione azionabile; exit code non zero su fallimento.
- Nessun segreto in `.env.default` e `.envrc` (committati); `.env`, `.env.local`, `.env.*.local`, `.envrc.local` gitignored.
- Dominio (`packages/greetings`) e contratti (`packages/contracts`) **non modificati**; `helloWorldInputSchema` resta l'autorità su default e validazione.
- `project` resta placeholder: commento META nello script, convenzione documentata.
- Wrapper eseguibile (`chmod +x`), shebang `#!/usr/bin/env bash`, `set -euo pipefail`.

**Forbidden shortcuts / unrelated work**:

- Vietato `readlink -f` (GNU-only) e qualunque variante non portabile.
- Vietato aggiungere exclusion/disable-comment per far passare shellcheck o altri gate.
- Vietato introdurre dipendenze npm (niente dotenv).
- Vietato modificare `helloWorldInputSchema`, il dominio, o i composition root di api/mcp/web.
- Vietato estendere shellcheck a script preesistenti né "sistemare" altro non in scope.
- Vietato `--no-verify`, skip di hook, abbassamento di soglie.

**Allowed implementation discretion** (locale e reversibile): testo esatto dei messaggi d'errore (purché su stderr, con guida azionabile, in italiano coerente col repo o in inglese tecnico — scegliere una lingua e mantenerla nei file bash); ordine dei check nel wrapper; nomi di variabili interne bash.

**Stop conditions** — fermarsi e riportare invece di inventare:

- `direnv exec "$PWD"` non rispetta la semantica attesa (blocco su `.envrc` non autorizzato, walk-up ai parent) nella versione pinnata.
- Il pin mise di direnv non risolve (nome/registry diverso da quanto verificato).
- I test rivelano che la floor Node deve essere > 22.18.
- Qualunque gate rosso non riconducibile alla change.
- Il repository differisce materialmente da questo piano (path o simboli non trovati): rivalidare prima di editare.

### 8. Repository file map

**READ FIRST** (verificare che simboli e contenuti corrispondano al piano prima di editare):

- `apps/cli/src/commands/hello-world.ts` — comando da estendere (`run`, `meta`).
- `apps/cli/src/commands/hello-world.test.ts` — proprietario del comportamento del comando (unit; usa `createMemoryLogger` da `@project/testkit`, ctx sintetico).
- `packages/contracts/src/hello-world.ts` — `helloWorldInputSchema` con `.default("world")` (REFERENCE per il contratto; NON modificare).
- `tests/integration/cli-contract.test.ts` — pattern di spawn del CLI (`spawn`, env controllato) da riusare nel nuovo test.
- `tools/scripts/doctor.ts` — struttura dei check (`ok`/`warn`/`fail`, `hasBinary`, `versionOf`, tier `externalTools`).
- `justfile` — recipe esistenti, stile (`set shell := ["bash", "-euo", "pipefail", "-c"]`), variabile `DOCS_ONLY_PATTERNS`.
- `.env.example` — formato e commenti attuali.
- `docs/product/pdr/0001-superficie-hello-world.md` — PDR da emendare.
- `docs/architecture/adr/0006-codescene-mcp.md` — formato ADR di riferimento (frontmatter, sezioni).
- `docs/development/GETTING-STARTED.md` — prerequisiti, recipe, mappa cartelle.
- `README.md` — avvio rapido e mappa dei file.

**CREATE**:

- `bin/project-hello-world` — wrapper bash (vedi §4 per il flusso; shebang, `set -euo pipefail`, resolver symlink portabile, check node/direnv, source `.env.default`, preflight + exec `direnv exec "$PWD" node "$REPO_ROOT/apps/cli/src/cli.ts" hello-world "$@"`). Commento META: `project` è il placeholder del bin CLI. `chmod +x`.
- `.envrc` — committato: header `# shellcheck shell=bash`, poi `dotenv_if_exists .env.default`, `dotenv_if_exists .env`, `source_env_if_exists .envrc.local`.
- `.env.default` — committato: solo commenti (header: scopo, regola "mai segreti", "caricato dai wrapper di bin/ come floor e dal .envrc"; nessuna variabile finché non esiste un default reale).
- `docs/development/ENVIRONMENT.md` — doc canonico: catena env (§4), politica dei tre file (`.env.example` template non caricato / `.env.default` floor caricato / `.env` locale gitignored; `.envrc.local` per segreti), direnv obbligatorio e setup (`mise install`, hook di shell, `direnv allow`), contratto dei wrapper di `bin/` (naming `<bin-cli>-<comando>` con `project` placeholder, risoluzione repo root, stdout data-only, preflight, errori), guida per aggiungere un nuovo wrapper.
- `docs/architecture/adr/0007-wrapper-cli-bin-direnv.md` — ADR della decisione (contesto: gap `.env` non caricato + esigenza wrapper PATH-globali; decisione: bin/ + direnv obbligatorio + `.env.default`; alternative scartate: `set dotenv-load`, parser custom, direnv opzionale; nota sull'eccezione "vademecum congelato" autorizzata dall'utente).
- `tests/integration/bin-wrappers.test.ts` — vedi §10.

**MODIFY**:

- `apps/cli/src/commands/hello-world.ts` — in `run`: dopo `parseArgs`, `const name = values.name ?? envName()` dove `envName()` legge `process.env["HELLO_WORLD_NAME"]` e restituisce `undefined` se assente o solo-spazi; passare `{ name }` a `helloWorldInputSchema.safeParse`. Aggiornare `meta.examples`/usage se citano il default. Nessun altra modifica.
- `apps/cli/src/commands/hello-world.test.ts` — aggiungere i 3 casi §10 con `vi.stubEnv`/`vi.unstubAllEnvs`.
- `tools/scripts/doctor.ts` — nuova sezione direnv:
  - se `hasBinary("direnv")` è assente, `fail("direnv", "not found — required by bin/ wrappers; run \`mise install\` or see docs/development/ENVIRONMENT.md")`;
  - se è presente, `ok("direnv", versionOf("direnv version"))`;
  - subito dopo, check autorizzazione `.envrc` del repo eseguendo `direnv exec . true` via `execFileSync`. Se exit ≠ 0 chiama `warn(".envrc", "blocked — run direnv allow")`; altrimenti chiama `ok(".envrc", "allowed")`;
  - direnv NON va nella lista `externalTools` (warn-tier): è required.
- `justfile` — nuova recipe pubblica `shell-check`: `shellcheck bin/*` con guardia tool-presente in stile repo (`command -v shellcheck` else warning "blocking in CI"); wiring: chiamarla in `precommit` (dopo `lint`), `prepush` (dopo `lint`), e nella lista di `ci`. In `setup`: dopo `pnpm install`, se `command -v direnv` → `direnv allow` nella root del repo.
- `.mise.toml` — aggiungere `direnv = "2.37.1"` sotto `[tools]`.
- `.gitignore` — aggiungere `.envrc.local` nella sezione "Environment variables" (con commento).
- `.env.example` — aggiungere in coda una sezione commentata: `# Default greeting name for the CLI (optional): used when --name is not passed` + `# HELLO_WORLD_NAME=Ada` (commentata: è un opt-in, non un default).
- `docs/product/pdr/0001-superficie-hello-world.md` — emendare il bullet del caso d'uso in "Design": il default del nome su CLI è `--name` > env `HELLO_WORLD_NAME` > `world`; aggiungere acceptance criterion spuntato sul wrapper/integration test. Non cambiare status/id.
- `docs/architecture/adr/README.md` — riga `| [0007](0007-wrapper-cli-bin-direnv.md) | Wrapper CLI in bin/ e gestione environment con direnv | active |`.
- `docs/development/GETTING-STARTED.md` — prerequisiti: riga direnv (via `mise install`, required per i wrapper); sezione Setup: menzionare `direnv allow` (già in `just setup`); tabella recipe: riga `just shell-check`; sezione Sviluppo: sostituire la riga "copia `.env.example` in `.env` (opzionale...)" con rimando a ENVIRONMENT.md; mappa cartelle: aggiungere `bin/` e i file env (`.envrc`, `.env.default`, `.env.example`).
- `docs/development/WORKFLOWS.md` — aggiornare le prose-liste dei gate locali: `precommit` e `prepush` includono shell-check sui wrapper.
- `docs/development/NEW-PROJECT.md` — checklist rinomina placeholder: aggiungere il prefisso dei wrapper in `bin/` (`project-*` → `<nome>-*`); prompt di rinomina: includere i file in `bin/`.
- `docs/PROJECT.md` — sotto la tabella "Deployable esistenti": nota che la CLI ha wrapper bash in `bin/` (convenzione `<bin>-<comando>`, placeholder `project`) per l'uso da PATH globale, con rimando a ENVIRONMENT.md.
- `README.md` — avvio rapido: menzionare direnv tra i prerequisiti e `bin/` opzionale nel PATH; mappa dei file: riga `bin/`.
- `docs/INDEX.md` — sezione Sviluppo: riga per `development/ENVIRONMENT.md`.
- `docs/init/Vademecum Typescript.md` — §3 "Contratti e dati esterni", paragrafo configurazione: estendere con direnv (`.envrc` committato, `.env` gitignored caricato via direnv, `.env.default` committato come floor, `.envrc.local` per segreti); §4 tabella tooling: riga `|Environment per-directory|direnv|`.
- `tools/cspell/project-words.txt` — aggiungere `direnv`, `envrc`, `dotenv` (ordine alfabetico del file).

**DELETE/RENAME**: nessuno.

**TEST**: vedi §10 (un file esteso, un file nuovo).

**GENERATED — DO NOT EDIT**: `pnpm-lock.yaml`, `coverage/`.

**REFERENCE ONLY**: `apps/api/src/main.ts`, `apps/mcp/src/server.ts` (pattern `envSchema` nei composition root), `apps/cli/src/cli.ts` (composition root CLI; nessuna modifica necessaria), `apps/web/vite.config.ts` (lettura env per dev server).

### 9. Ordered implementation tasks

**T1 — Unit test red per il default da env.** File: `apps/cli/src/commands/hello-world.test.ts`. Aggiungere: (a) `HELLO_WORLD_NAME="Ada"` stubbed + nessun `--name` → `{ ok: true, data: { message: "Hello, Ada!" } }`; (b) `HELLO_WORLD_NAME="Ada"` + `--name Bob` → `Hello, Bob!`; (c) `HELLO_WORLD_NAME="   "` → `Hello, world!`. Usare `vi.stubEnv` in ogni caso e `vi.unstubAllEnvs` in `afterEach`. Eseguire `just test-unit` e osservare i 3 fallimenti. Completion: rosso atteso.

**T2 — Implementazione default da env (green).** File: `apps/cli/src/commands/hello-world.ts` (simbolo `run`). Come da §8. Vincoli: nessuna modifica ad altri file; nessun cast; lo schema resta autorità finale. Eseguire `just test-unit` → verde. Completion: unit verdi.

**T3 — File env del repo.** Creare `.envrc`, `.env.default`; modificare `.env.example` e `.gitignore` come da §8. Completion: `direnv allow` manuale nella root → `direnv exec . printenv LOG_LEVEL` non fallisce (con o senza `.env` presente).

**T4 — Wrapper `bin/project-hello-world`.** Creare lo script come da §4/§8, `chmod +x`. Smoke manuale: `cd /tmp && /home/dati/workspace/ts-boilerplate/bin/project-hello-world --json` → JSON `{"message":"Hello, world!"}` su stdout; `... --name Ada` → `Hello, Ada!`. Completion: smoke manuale riuscito.

**T5 — Integration test dei wrapper.** Creare `tests/integration/bin-wrappers.test.ts` come da §10. Eseguire `pnpm exec vitest run --project integration tests/integration/bin-wrappers.test.ts` → verde. Completion: file suite verde isolato.

**T6 — Gate e tooling.** justfile (`shell-check` + wiring in `precommit`/`prepush`/`ci` + `direnv allow` in `setup`), `tools/scripts/doctor.ts` (check direnv required + `.envrc` allowed warn), `.mise.toml` (pin direnv). Verificare: `just shell-check` verde; `just doctor` mostra `✅ direnv` e `✅ .envrc`; `just docs-check` ancora verde (la recipe citata nei docs deve esistere — la docs arriverà in T8, ma la recipe esiste già ora). Completion: i tre comandi verdi.

**T7 — Decision record.** Emenda PDR-0001 + nuova ADR-0007 + riga nell'indice ADR, come da §8. (Separazione richiesta da AGENTS.md: decision record nello stesso lavoro ma contenuto completo e coerente; `/create-adr` e `/create-pdr` sono i comandi Kilo di riferimento se disponibili nella sessione di implementazione.)

**T8 — Documentazione.** Tutti gli update di §8: ENVIRONMENT.md (nuovo), GETTING-STARTED, WORKFLOWS, NEW-PROJECT, PROJECT, README, INDEX, vademecum, cspell words. Vincoli: prosa senza hard-wrap; ogni `just <recipe>` citata deve esistere (docs guard); parole nuove in cspell. Completion: `just docs-check` verde.

**T9 — Validazione finale.** `just precommit` poi `just prepush`; se MCP CodeScene è connesso, `pre_commit_code_health_safeguard` prima del commit (lo chiama già `just precommit` via `codescene-safeguard`). Report con output verbatim dei comandi, delta coverage, e `tmp/commit-message.md` proposto. Completion: prepush verde.

Dipendenze: T1→T2; T3→T4→T5; T6 dopo T4 (shellcheck richiede `bin/`); T7/T8 dopo T6 (citano `shell-check`); T9 ultimo.

### 10. Test and validation plan

**Test esistenti da estendere**:

- `apps/cli/src/commands/hello-world.test.ts` (unit, proprietario del comportamento del comando; riusa `createMemoryLogger` e il ctx sintetico esistente): i 3 casi di T1. Giustificazione: il comportamento "default del nome" appartiene a questo file; nessun nuovo harness necessario.

**Nuovi test**:

- `tests/integration/bin-wrappers.test.ts` — file nuovo giustificato da un contratto distinto: processo bash eseguito da cwd arbitraria con environment controllato (non un simbolo TS). Matcha l'include `tests/integration/**/*.test.ts` del progetto vitest "integration".
  - **Fixture/helper**: `mkdtemp(join(os.tmpdir(), ...))`; scrittura di `.envrc` (`dotenv`) e `.env`; `direnv allow <dir>` eseguito con `XDG_DATA_HOME` puntato a una sotto-dir tmp (isolamento dell'allow-store, determinismo); spawn del wrapper via `spawn(wrapperPath, args, { cwd: tmpdir, env })` con env minimale controllata (`PATH` reale, `HOME`, `XDG_DATA_HOME` tmp, `NO_COLOR=1`, `LOG_LEVEL=error`, senza `HELLO_WORLD_NAME` salvo caso dedicato). Cleanup in `afterEach`/`afterAll`.
  - **Casi e asserzioni**:
    1. tmp dir con `.env` `HELLO_WORLD_NAME=Ada Lovelace` (spazio → verifica quoting) + `.envrc` allowed → exit 0, stdout JSON parseable `{ "message": "Hello, Ada Lovelace!" }`, stderr senza payload dati.
    2. stessa fixture + arg `--name Bob` → `{ "message": "Hello, Bob!" }` (il parametro vince sull'env).
    3. tmp dir senza `.env`/`.envrc` → `{ "message": "Hello, world!" }` (floor `.env.default` + default schema; la fixture asserisce anche che `.env.default` della repo esista ed è bash-sourceable: `bash -n` / source in subshell senza errore).
    4. tmp dir con `.envrc` NON autorizzato (nessun `direnv allow`) → exit ≠ 0, stderr cita `direnv allow`.
    5. PATH minimale senza direnv (tmp bin dir con symlink ai soli `node`, `bash`, `readlink`, `dirname`) → exit ≠ 0, stderr cita l'installazione di direnv (parola `direnv` presente).
  - Nessuno skip condizionale: direnv è obbligatorio per definizione; in CI arriva da mise.

**Fixtures/helper riusati**: pattern spawn da `tests/integration/cli-contract.test.ts`; nessun helper nuovo condiviso (fixture locale al file).

**Comandi mirati**:

- `pnpm exec vitest run --project unit apps/cli/src/commands/hello-world.test.ts`
- `pnpm exec vitest run --project integration tests/integration/bin-wrappers.test.ts`
- `just shell-check` · `just doctor`

**Validazione finale (in ordine)**: `just precommit` → `just prepush` (include format-check, lint, typecheck, dead-code, arch, docs-check, workflows-check, secrets, codescene-changeset, test-unit, test-integration, smoke, coverage).

**Evidenza attesa di completamento**: tutti i comandi sopra verdi con output citato nel report; `just doctor` con `✅ direnv` e `✅ .envrc`; coverage ratchet (`coverage-thresholds.json`) non in discesa (la nuova logica del comando è coperta dai unit test; se il ratchet sale, NON alzare le soglie in questa change — `just coverage-raise` resta un'operazione dedicata).

### 11. Assumptions, deferred items, references, and stop conditions

**Assunzioni accettate**:

- Piattaforma di riferimento Linux con bash ≥ 4; macOS compat best-effort limitato al resolver symlink del wrapper.
- direnv disponibile via mise registry (verificato: 2.37.1); la macchina utente ha anche un direnv di sistema (2.25.2) che coesiste senza conflitti.
- L'utente aggiunge `bin/` al PATH a mano (documentato in ENVIRONMENT.md e README); nessuna automazione di shell profile.
- `.env.default` nasce senza variabili: il meccanismo è il valore, i contenuti arrivano con i primi default reali.

**Deferred (fuori scope, da pianificare a parte)**:

- shellcheck su `tools/scripts/*.sh` e `.githooks/*`.
- Eventuali wrapper per futuri comandi (`serve`, ecc.): la convenzione è pronta, i file si aggiungono al bisogno.
- Valutare `use mise` nel `.envrc` (attivazione toolchain via direnv): oggi mise è gestito dal suo hook di shell; doppia attivazione scartata per semplicità.

**Riferimenti**:

- `man direnv` / `man direnv-stdlib` (semantica `direnv exec DIR`, `dotenv_if_exists`, `source_env_if_exists`; meccanismo allow/block).
- Wiki direnv ".envrc Boilerplate" (pattern `dotenv_if_exists` + `source_env_if_exists .envrc.local`).
- ADR-0001 (stack, Node 24), ADR-0002 (porte/adapters: env letto solo negli adapter/composition root), ADR-0004 (exit code), PDR-0001 (superficie hello-world).
- AGENTS.md (vincoli gate, divieti, TDD) e `docs/development/TESTING.md` per lo stile dei test.

**Stop conditions**: vedi §7. In sintesi: semantica direnv divergente, pin mise irrisolto, floor Node insufficiente, gate rossi estranei alla change, o repo materialmente diversa dal piano → fermarsi e riportare la contraddizione esatta invece di improvvisare un'altra architettura.
