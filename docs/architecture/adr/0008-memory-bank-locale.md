---
type: ADR
id: "0008"
title: "Repository-local memory bank come fallback a Kilo Memory"
status: active
date: 2026-09-01
---

## Context

Kilo Code offre una funzione nativa di memoria progettuale (Kilo Memory): contesto persistente, project-scoped, salvato nella directory dati globale del client (`~/.local/share/kilo/memory/`). È un'ottima funzionalità, ma presenta alcuni limiti operativi:

- **Client-specifica**: dipende dal client Kilo usato (CLI, TUI, VS Code) e dalla sua capacità di riconoscere la cartella del progetto. L'utente ha riportato il messaggio `No active project for memory. Open a file in the target folder to manage its memory.` pur essendo già nella cartella del progetto.
- **Non versionabile**: lo store globale non è nel repository, quindi non può essere condiviso con il team tramite Git.
- **Opaca**: i file sono difficili da ispezionare per un umano e non sono immediatamente visibili in una fresh clone.

Il progetto ha già un sistema di decisioni documentate (ADR/PDR) e un `AGENTS.md` operativo, ma manca uno spazio per i fatti operativi di breve/medio termine: scelte recenti, correzioni esplicite, comandi e path specifici, sessioni rilevanti.

## Decision

**Mantenere un repository-local memory bank in `docs/memory/`** come complemento — e fallback visibile — della Kilo Memory nativa.

- Struttura: `README.md`, `project.md`, `environment.md`, `corrections.md`, `sessions/`.
- Contenuto: fatti, decisioni attive, vincoli, correzioni e digest di sessione rilevanti.
- Regola: quando Kilo Memory nativa è disponibile, usarla come fonte principale; comunque replicare in `docs/memory/` i fatti significativi, in modo che siano versionabili e accessibili a ogni agente.

## Options considered

- **Solo Kilo Memory nativa** — scartato: non risolve il problema dell'utente (client non riconosce il progetto) e non è versionabile.
- **Memory bank nel repo (`docs/memory/`)** — scelto: trasparente, portatile, versionabile, ispezionabile.
- **MCP server esterno (Kronvex, Memstate, ecc.)** — scartato: richiede API key, servizio terzo, setup aggiuntivo; non necessario per le esigenze attuali.
- **Memory Bank legacy di Kilo Code (`.kilocode/rules/memory-bank/`)** — scartato: Kilo ha deprecato Memory Bank in favore di `AGENTS.md`; preferiamo una convenzione esplicita nel repo piuttosto che una regola dipendente dal client.

## Consequences

- Ogni agente può ricostruire il contesto da `docs/memory/` anche senza Kilo Memory attiva.
- I fatti significativi devono essere mantenuti in due posti: Kilo Memory nativa (se attiva) e `docs/memory/`. In pratica, `docs/memory/` è la fonte autorevole per i fatti versionabili; Kilo Memory rimane utile per i digest automatici delle sessioni.
- `AGENTS.md` deve istruire gli agenti a leggere `docs/memory/` all'avvio.
- I gate docs (`just docs-check`) devono includere `docs/memory/` come documentazione vivente.

## Enforcement

- `AGENTS.md` richiede agli agenti di consultare `docs/memory/` all'inizio di ogni task.
- I file in `docs/memory/` seguono le stesse regole di stile delle altre docs (nessun hard wrap, prosa chiara).
- I session digest vanno in `docs/memory/sessions/` e devono essere rilevanti, non un log di ogni conversazione.

## Migration / rollback

Rollback: rimuovere `docs/memory/`, cancellare questa ADR, e rimuovere il riferimento da `AGENTS.md`. Non ci sono dipendenze di codice.
