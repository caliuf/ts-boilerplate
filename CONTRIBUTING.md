# Contribuire

Questo progetto è sviluppato tramite agenti AI con supervisione umana.

## Per gli agenti

`AGENTS.md` è il contratto canonico. In sintesi: leggi `docs/PROJECT.md`,
lavora test-first, usa solo le recipe `just`, chiudi con `just prepush` verde
e un report con output verbatim.

## Per gli umani

1. Setup: `just setup`, poi `just doctor`.
2. Ogni modifica passa da una PR; i gate locali (`precommit`/`prepush`)
   girano in automatico via hook git.
3. Le decisioni di prodotto nuove si registrano come PDR
   (`docs/product/pdr/`), quelle architetturali come ADR
   (`docs/architecture/adr/`) — nello stesso commit del codice.
4. Messaggi di commit: convenzione in
   [`docs/development/WORKFLOWS.md`](./docs/development/WORKFLOWS.md).

Regole di dettaglio: [`docs/development/CODING.md`](./docs/development/CODING.md)
e [`docs/development/TESTING.md`](./docs/development/TESTING.md).
