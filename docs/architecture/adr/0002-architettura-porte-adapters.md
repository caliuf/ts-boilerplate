---
type: ADR
id: "0002"
title: "Architettura: modular monolith, functional core / imperative shell, ports & adapters"
status: active
date: 2026-08-20
---

## Context

Il boilerplate deve dare ad agenti AI una struttura navigabile e verificabile
automaticamente: un caso d'uso una sola volta, superfici intercambiabili,
confini applicati da gate e non da convenzioni.

## Decision

**Modular monolith con bounded context in `packages/`, livelli
`domain`/`application`/`ports`, adapter tecnologici in `packages/adapter-*`,
app sottili in `apps/` che fanno solo composition root + adapter di ingresso.**

- Ogni caso d'uso: un file `application/<verbo>-<nome>.ts` con test colocato.
- Ogni superficie (CLI, API, MCP, UI) proietta lo stesso caso d'uso con
  naming parallelo; anatomia fissa: parse → valida → caso d'uso → mappa.
- DTO, schemi e tassonomia errori in `packages/contracts`, unica fonte.
- Logging dietro la porta `Logger`; adapter di default pino
  (`packages/adapter-pino`): JSON in produzione/CI, pretty in sviluppo.
- Errori di dominio come valori (`Result`, union discriminate); le eccezioni
  restano per errori del programmatore e per il confine del processo.

## Options considered

- **Ports & adapters nel monolito modulare** (scelta) — pro: confini testabili,
  runtime intercambiabili (Node/Bun), navigabilità per gli agenti; contro:
  più cartelle del minimo.
- **Layered libero (tutto in apps/)** — pro: meno file; contro: logica che
  migra negli entrypoint, duplicazione tra superfici, gate impossibili.
- **Microservizi** — esclusi dal vademecum senza necessità misurata.

## Consequences

- Aggiungere un caso d'uso = aggiungere un file in `application/`, esporlo
  sulle superfici decise, aggiornare la mappa in `docs/PROJECT.md`.
- Un nuovo bounded context copia la struttura di `packages/greetings/`.
- Ogni deroga (es. DI container, decorator) richiede una nuova ADR.

## Enforcement

`just arch` (dependency-cruiser, vedi `docs/architecture/BOUNDARIES.md`),
`just lint` (no-console e escape hatch), `knip` (API pubbliche morte),
integration suite del contratto CLI (`tests/integration/cli-contract.test.ts`).

## Migration / rollback

La struttura è additiva: nuovi package non richiedono migrazioni.
