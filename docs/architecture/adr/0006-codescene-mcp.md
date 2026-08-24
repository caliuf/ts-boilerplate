---
type: ADR
id: "0006"
title: "CodeScene MCP come autorità di Code Health per gli agenti"
status: active
date: 2026-08-24
---

## Context

Il vademecum classifica CodeScene come tool pro MAY, da adottare a regime e da esporre all'agente via MCP. Il repository è già scansionato su CodeScene Cloud (progetto `ts-boilerplate`, id `83744`). L'estensione VS Code "CodeScene CodeHealth MCP" registra il server solo per Copilot, non per Kilo: senza una registrazione esplicita nel client Kilo l'agente non può interrogare Code Health, hotspot o il change-set.

I gate locali (`just precommit` / `just prepush`) misurano già format, lint, architettura, test e coverage. Non misurano maintainability strutturale (complessità, cohesion, code smells di Code Health). Senza un canale agent-facing, l'agente indovina la salute del codice o ignora le regressioni.

## Decision

**Adottare il CodeScene MCP Server** (`npx -y @codescene/codehealth-mcp`) come fonte autorevole di Code Health per gli agenti.

- Registrazione client: server `codescene` in `~/.config/kilo/kilo.jsonc` (globale) e pin di progetto in `.kilo/kilo.jsonc` (`CS_DEFAULT_PROJECT_ID=83744`).
- Autenticazione interattiva: OAuth (`npx -y @codescene/codehealth-mcp auth` o tool MCP `login`). Nessun PAT nel repository.
- Uso operativo: guida in `AGENTS.md`, dettaglio in [`docs/development/CODESCENE.md`](../../development/CODESCENE.md).
- **Non** è un hook git né una recipe `just` bloccante. Resta un obbligo dell'agente quando l'MCP è connesso. Promuoverlo a gate deterministico richiede una ADR dedicata.

## Options considered

- **MCP CodeScene via `npx` nel client Kilo** (scelta) — pro: stesso binario dell'estensione VS Code, OAuth persistente in `~/.config/codehealth-mcp/`, tool locali (score/review/safeguard) e API di progetto (hotspot, goal, ownership); contro: dipende da Node/`npx` e da una sessione autenticata sulla macchina.
- **Affidarsi solo all'estensione VS Code** — scartato: l'estensione espone l'MCP a Copilot, non a Kilo.
- **Solo alternative gratuite (CodeMaat/CodeCharta)** — utili per hotspot da git history, ma non danno lo score Code Health né la review per-file che l'agente deve usare prima di un commit.
- **Hook locale che blocca il commit sotto soglia** — rimandato: richiede soglie versionate, cricchetto e una recipe riproducibile in CI; oggi manca e non va improvvisata nello stesso passo dell'adozione MCP.

## Consequences

- Gli agenti devono chiamare i tool CodeScene invece di stimare la maintainability.
- Il pin `83744` è specifico di questo repository Cloud; un progetto derivato deve creare il proprio progetto CodeScene e aggiornare `.kilo/kilo.jsonc`.
- Senza MCP connesso o senza login, l'agente riporta il blocker e non finge un check passato.
- Codacy e gli altri tool pro restano fuori da questa decisione.

## Enforcement

Guida in `AGENTS.md`. Nessun gate automatico in questa ADR.

## Migration / rollback

Rollback: rimuovere il server `codescene` da `.kilo/kilo.jsonc` (e dalla config Kilo globale, se non serve ad altri repo), cancellare questa ADR e la sezione corrispondente in `AGENTS.md` / `docs/development/CODESCENE.md`.
