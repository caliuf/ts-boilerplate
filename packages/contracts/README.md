# @project/contracts

DTO, schemi di validazione (Zod) e tassonomia degli errori condivisi da tutte
le superfici (CLI, API, MCP, UI). Unica fonte: mai ridefinire questi tipi
altrove.

- **Responsabilità**: contratti di input/output dei casi d'uso, schemi Zod,
  codici errore e mapping (exit code CLI, HTTP status, Problem Details).
- **Non-responsabilità**: logica di business, I/O.
- **Invarianti**: è una foglia — non importa altri package del monorepo (gate
  dependency-cruiser `contracts-is-a-leaf`); tipi e schemi derivano da una
  sola definizione.
- **API pubblica**: tutto da `src/index.ts`.
- **Dipendenze consentite**: `zod`.
- **Dipendenze vietate**: altri package interni, framework, `node:*`.
- **Entry point**: `src/index.ts`.
- **Test da eseguire**: `just test-unit`.
- **ADR/PDR rilevanti**: ADR-0003 (Zod), ADR-0004 (tassonomia errori ed
  exit code).
