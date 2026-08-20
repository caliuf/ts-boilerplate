# Indice della documentazione

Vista sullo stato corrente: riporta solo le decisioni **attive**. Per lo zoom-in storico si scendono i decision record (ADR/PDR).

## Da leggere per primi

1. [`PROJECT.md`](./PROJECT.md) — cosa è il sistema, cosa esiste, mappa delle superfici.
2. [`development/GETTING-STARTED.md`](./development/GETTING-STARTED.md) — setup, recipe, debug.
3. [`development/NEW-PROJECT.md`](./development/NEW-PROJECT.md) — **solo se stai adottando    il boilerplate per un nuovo progetto** (poi va cancellato insieme a `docs/init/`).

## Architettura

- [`architecture/OVERVIEW.md`](./architecture/OVERVIEW.md) — struttura e decisioni attive.
- [`architecture/BOUNDARIES.md`](./architecture/BOUNDARIES.md) — regole di dipendenza e loro gate.
- [`architecture/adr/`](./architecture/adr/) — decisioni tecniche (una per file).

## Prodotto

- [`product/OVERVIEW.md`](./product/OVERVIEW.md) — scope e decisioni di prodotto attive.
- [`product/GLOSSARY.md`](./product/GLOSSARY.md) — astrazioni di dominio.
- [`product/pdr/`](./product/pdr/) — decisioni di prodotto (una per file).

## Sviluppo

- [`development/GETTING-STARTED.md`](./development/GETTING-STARTED.md) — onboarding tecnico.
- [`development/CODING.md`](./development/CODING.md) — regole di codice e convenzioni.
- [`development/TESTING.md`](./development/TESTING.md) — strategia di test e coverage.
- [`development/WORKFLOWS.md`](./development/WORKFLOWS.md) — gate, CI/CD, task schedulati.
- [`development/SECURITY.md`](./development/SECURITY.md) — supply chain e segreti.

## Operazioni

Nessun runbook ancora: si creano in `docs/operations/runbooks/` quando esiste qualcosa da operare in produzione.

## Blueprint

- [`init/`](./init/) — il vademecum e le fonti da cui nasce questo boilerplate.   **Congelato**: non va modificato nello sviluppo ordinario e va rimosso nei   progetti derivati (vedi [`development/NEW-PROJECT.md`](./development/NEW-PROJECT.md)).
