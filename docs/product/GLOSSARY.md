# Glossario di dominio

Mappa delle astrazioni di dominio: per ognuna perché esiste, a cosa serve e come si usa. Documento vivo, derivato dalle PDR attive: aggiornarlo quando una PDR introduce o modifica un'astrazione.

<!-- META: nel tuo progetto sostituisci la voce dimostrativa con le
     astrazioni reali del dominio. -->

## Greeting

Messaggio di saluto prodotto dal bounded context `greetings`.

- **Perché esiste**: dimostratore minimo end-to-end del boilerplate.
- **Cosa fa**: dato un nome opzionale, produce `Hello, <name>!` (default `world`).
- **Come si usa**: caso d'uso `sayHello` (`packages/greetings/src/application/ say-hello.ts`), esposto come `project hello-world` (CLI), `GET /api/hello-world` (API), tool `hello_world` (MCP), hook `useHelloWorld` (UI).

## AppError / ErrorCode

Tassonomia condivisa degli errori (`packages/contracts/src/errors.ts`).

- **Perché esiste**: ogni superficie deve raccontare gli errori nello stesso modo (exit code CLI, Problem Details HTTP, errori di tool MCP).
- **Come si usa**: mai inventare codici locali; estendere `ERROR_CODES` con mapping completo (ADR-0004).
