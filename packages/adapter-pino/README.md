# @project/adapter-pino

Adapter `pino` per la porta `Logger` (default su Node, Vademecum §3 Logging).

- **Responsabilità**: costruire un `Logger` JSON-first; pretty a colori in
  sviluppo tramite `pino-pretty`. Scelta dello stream (stdout/stderr) esplicita.
- **Non-responsabilità**: leggere l'environment (lo fa il composition root
  dell'app), decidere i livelli di default.
- **Invarianti**: stessa porta, due trasporti; niente segreti nei contesti.
- **API pubblica**: `createPinoLogger`.
- **Dipendenze consentite**: `pino`, `pino-pretty`, `@project/greetings` (porta).
- **Dipendenze vietate**: framework, altri adapter.
- **Entry point**: `src/index.ts`.
- **Test da eseguire**: coperto indirettamente dalle suite di integration.
- **ADR/PDR rilevanti**: ADR-0002 (architettura e porte).
