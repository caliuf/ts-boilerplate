---
type: ADR
id: "0004"
title: "Tassonomia errori condivisa ed exit code della CLI"
status: active
date: 2026-08-20
---

## Context

Il vademecum richiede una tassonomia di errori condivisa (stessa fonte per
CLI, API, MCP, UI) e una tassonomia di exit code fissata in ADR, coerente con
gli status HTTP.

## Decision

**Cinque codici errore (`ErrorCode` in `packages/contracts/src/errors.ts`), con
mapping fisso verso exit code CLI e status HTTP:**

| Codice | Exit code CLI | HTTP | Significato |
| --- | --- | --- | --- |
| `INTERNAL` | 1 | 500 | errore interno |
| `VALIDATION` | 2 | 400 | input non valido |
| `UNAUTHORIZED` | 3 | 401/403 | autenticazione/autorizzazione |
| `NOT_FOUND` | 4 | 404 | risorsa non trovata |
| `CONFLICT` | 5 | 409 | conflitto di stato |

Exit code `0`: successo. L'API mappa su Problem Details RFC 9457
(`application/problem+json`) con URN `urn:<progetto>:error:<code>`
<!-- META: rinomina il prefisso URN `urn:project:` nel tuo progetto -->.
MCP mappa su errori di tool (`isError: true` + payload JSON con lo stesso
codice). La CLI emette `{"error","message"}` su stderr in modalità JSON.

## Options considered

- **Tassonomia minima a cinque codici** (scelta) — pro: copre i casi reali di
  un sistema senza auth/db; estendibile solo in aggiunta; contro: codici
  generici richiedono `message` informative.
- **Codici per-caso-d'uso** — rimandata: si aggiungono codici solo con casi
  reali, mai in anticipo.

## Consequences

- Nuovi codici: si aggiungono a `ERROR_CODES` con i tre mapping nello stesso
  commit; l'exhaustive checking dei consumer (CLI, error-mapper) fallisce la
  compilazione finché il mapping non è completo.
- Gli exit code esistenti non cambiano mai significato (sono un'API per
  script e agenti).

## Enforcement

`errorCodeToExitCode`/`errorCodeToHttpStatus` tipizzati `satisfies Record
<ErrorCode, …>`; la contract suite della CLI verifica gli exit code su ogni
comando; il test API verifica i Problem Details.

## Migration / rollback

Rinominare o ricodificare un codice esistente è un breaking change di
contratto: richiede nuova ADR e bump coordinato delle superfici.
