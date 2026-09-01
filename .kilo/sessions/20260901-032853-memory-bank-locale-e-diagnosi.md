# Session Digest: 2026-09-01 — Memory bank locale e diagnosi Kilo Memory

## Contesto iniziale

L'utente ha chiesto:

1. Perché Kilo Code mostra `No active project for memory. Open a file in the target folder to manage its memory.` pur essendo nella cartella del progetto.
2. Se si può implementare un memory bank locale con gli strumenti a disposizione (es. `docs/memory/`).
3. Di ricercare come funziona la memory di Kilo e implementarla nel modo migliore per questo e futuri progetti.
4. Successivamente: aggiungere note META per progetti derivati, inserire la logica nel vademecum, e diagnosticare il problema Kilo Code.

## Cosa è stato fatto

### Memory bank locale implementato

- Creato `docs/memory/` con:
  - `README.md` (scopo, convenzioni, relazione con ADR/PDR, come usarlo)
  - `project.md` (fatti, decisioni attive, vincoli, domande aperte)
  - `environment.md` (comandi/path specifici del progetto)
  - `corrections.md` (correzioni esplicite, es. scarto Codacy)
  - `sessions/20260901-023300-memory-bank-locale.md` (digest della sessione precedente)
- Aggiunta ADR-0008: *Repository-local memory bank come fallback a Kilo Memory*.
- Aggiornati: `AGENTS.md`, `docs/INDEX.md`, `docs/PROJECT.md`, `docs/architecture/adr/README.md`, `docs/development/WORKFLOWS.md`.
- Aggiunte note `META(boilerplate)` in `docs/memory/*.md` e `docs/development/GETTING-STARTED.md` per indicare cosa va adattato nei progetti derivati.
- Aggiunta sezione "Memoria a breve-medio termine" in `docs/init/Vademecum Typescript.md`.
- Aggiornato `tools/cspell/project-words.txt` con i nuovi termini.
- Creato `tools/scripts/kilo-memory-diagnose.sh` per verificare binding Kilo Memory, stato auto-inject, e dimensioni del repository memory bank.

### Diagnosi Kilo Memory

- Kilo Memory nativa è **attiva e funzionante** per `ts-boilerplate`.
- Store: `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/` (`state.json`: `enabled: true`, `autoInject: true`).
- Il DB Kilo (`~/.local/share/kilo/kilo.db`) registra il progetto con worktree corretto; la sessione corrente riceve l'iniezione startup (`kiloMemory` metadata: 5935 bytes, 1481 tokens, 17 entries).
- Il messaggio `No active project for memory` è probabilmente un problema del client VS Code (workspace/pannello senza file attivo), non del server Kilo.
- Azioni suggerite all'utente: aprire un file del progetto prima di aprire il pannello memory, usare `/memory status` in chat, riavviare il workspace, controllare Output → Kilo Code.

## Gate eseguiti

- `just precommit` ✅
- `just prepush` ✅
- `just smoke` ✅
- Coverage: 95.52% statements / 81.25% branches / 94.44% functions / 95.45% lines (sopra soglie).
- CodeScene change-set: passed.

## File da leggere per riprendere

1. `docs/memory/project.md` e `docs/memory/environment.md` — contesto operativo del progetto.
2. `docs/memory/README.md` — convenzioni del memory bank.
3. `docs/architecture/adr/0008-memory-bank-locale.md` — decisione architetturale.
4. `AGENTS.md` — istruzioni aggiornate per gli agenti.
5. `docs/INDEX.md`, `docs/PROJECT.md`, `docs/development/WORKFLOWS.md` — riferimenti aggiornati.
6. `docs/init/Vademecum Typescript.md` §8 — sezione memoria a breve-medio termine.
7. `tmp/commit-message.md` — messaggio di commit proposto.

## Stato del working tree

File modificati:

- `AGENTS.md`
- `docs/INDEX.md`
- `docs/PROJECT.md`
- `docs/architecture/adr/README.md`
- `docs/development/GETTING-STARTED.md`
- `docs/development/WORKFLOWS.md`
- `docs/init/Vademecum Typescript.md`
- `tools/cspell/project-words.txt`

File nuovi:

- `docs/architecture/adr/0008-memory-bank-locale.md`
- `docs/memory/README.md`
- `docs/memory/project.md`
- `docs/memory/environment.md`
- `docs/memory/corrections.md`
- `docs/memory/sessions/20260901-023300-memory-bank-locale.md`

## Domande aperte / prossimi passi

- Verificare se il messaggio `No active project for memory` persiste dopo aver aperto un file del progetto o riavviato il workspace VS Code.
- Valutare se mantenere i due store (Kilo nativo + repo bank) separati o se automatizzare la sincronizzazione tra loro.
