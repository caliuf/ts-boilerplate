# @project/greetings

Bounded context di esempio: produce saluti. Sostituiscilo con il primo
bounded context reale del tuo progetto (e aggiorna questa cartella di
conseguenza: è il riferimento strutturale per tutti gli altri).

- **Responsabilità**: costruire il messaggio di saluto (`hello-world`).
- **Non-responsabilità**: I/O, HTTP, persistenza, parsing dell'input utente.
- **Invarianti**: il dominio è puro (nessun import npm/node, gate
  dependency-cruiser `domain-is-pure`); l'input arriva validato dallo schema
  condiviso in `@project/contracts`.
- **API pubblica**: `sayHello`, `greet`, tipi `Greeting`, `Logger`,
  `SayHelloDeps` — solo da `src/index.ts`.
- **Dipendenze consentite**: `@project/contracts`.
- **Dipendenze vietate**: framework, database, filesystem, rete, `node:*`.
- **Entry point**: `src/index.ts`.
- **Test da eseguire**: `just test-unit`, più la suite di integration su CLI,
  API e MCP (`just test-integration`).
- **ADR/PDR rilevanti**: ADR-0002 (architettura), ADR-0003 (Zod),
  PDR-0001 (superficie hello-world).
