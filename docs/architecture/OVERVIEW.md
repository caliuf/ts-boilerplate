# Panoramica dell'architettura

Vista sintetica delle decisioni **attive**. Dettagli e storia nelle
[ADR](./adr/).

## Forma

Modular monolith in monorepo pnpm, *functional core / imperative shell*, ports & adapters (ADR-0002).

```text
packages/contracts     DTO, schemi Zod, tassonomia errori (foglia)
packages/<context>/    bounded context: domain / application / ports
packages/adapter-*/    adapter tecnologici (oggi: adapter-pino)
packages/testkit/      doppioni di test (mai importati dal codice di produzione)
apps/cli, api, mcp, web  adapter di ingresso + composition root sottili
tests/                 suite integration ed E2E
```

## Un caso d'uso, molte superfici

Ogni capability esiste **una sola volta** come caso d'uso nell'application layer (`<verbo>-<nome>.ts`, un file per caso d'uso, test colocato). CLI, API, MCP e UI sono adapter di ingresso intercambiabili con la stessa anatomia:

```text
parse input → valida (schema condiviso) → chiama il caso d'uso → mappa il risultato
```

Naming parallelo su ogni canale; la mappa caso d'uso × canale vive in
[`../PROJECT.md`](../PROJECT.md).

## Regole strutturali (estratto)

- `domain` non importa framework, npm, `node:*` — è puro.
- `application` orchestra il dominio attraverso porte; niente `node:*`.
- gli adapter implementano le porte; gli entrypoint compongono.
- i bounded context comunicano solo via API pubbliche (`src/index.ts`).
- niente `utils`/`helpers`/`common`, niente service locator o DI container.
- errori di dominio come valori (`Result`, union discriminate); eccezioni solo al confine del processo.
- logging dietro la porta `Logger`; niente `console.log` fuori da `tools/scripts` (gate di lint).

L'elenco completo con i gate che le applicano: [`BOUNDARIES.md`](./BOUNDARIES.md).

## Decisioni attive

L'indice autorevole delle decisioni, con lo stato di ognuna, è [adr/README.md](./adr/README.md). I riferimenti inline in questo documento (es. ADR-0002 sopra) puntano alle decisioni che spiegano la struttura corrente.
