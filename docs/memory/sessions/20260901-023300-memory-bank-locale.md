# Session Digest: 2026-09-01 — Memory bank locale per Kilo

## What happened

L'utente ha chiesto perché Kilo Memory non risulta attiva nella cartella del progetto (messaggio: `No active project for memory. Open a file in the target folder to manage its memory`) e se si può implementare un memory bank locale con gli strumenti a disposizione.

## Findings

- Kilo Memory nativa è abilitata (`enabled: true` in `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/state.json`) e popolata.
- Il messaggio d'errore probabilmente deriva da un client che non ha riconosciuto la cartella del progetto (es. VS Code senza file aperto nello workspace, o una diversa istanza dell'agente).
- In assenza di un meccanismo affidabile, un memory bank nel repository (`docs/memory/`) funziona come fallback portatile e versionabile.

## Decisions

- Creare `docs/memory/` con README, project.md, environment.md, corrections.md e sessions/.
- Documentare la scelta con ADR-0008.
- Aggiornare AGENTS.md per istruire gli agenti a consultare `docs/memory/` all'avvio.

## Open questions

- Capire perché il client VS Code/Kilo mostra "No active project for memory" nonostante lo store esista (potrebbe essere un bug o un problema di workspace).
