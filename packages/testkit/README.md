# @project/testkit

Doppioni di test e helper condivisi tra le suite (unit, integration, e2e).

- **Responsabilità**: adapter in-memory e factory per i test.
- **Non-responsabilità**: codice di produzione — il codice di produzione non   può importarlo (gate dependency-cruiser `no-testkit-in-production`).
- **Invarianti**: nessuna dipendenza esterna oltre ai package interni.
- **API pubblica**: `createMemoryLogger`.
- **Dipendenze consentite**: `@project/greetings` (porte).
- **Dipendenze vietate**: framework, `node:*`.
- **Entry point**: `src/index.ts`.
- **Test da eseguire**: usato da `just test-unit` e `just test-integration`.
- **ADR/PDR rilevanti**: ADR-0002 (architettura).
