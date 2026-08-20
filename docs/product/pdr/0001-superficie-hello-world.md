---
type: PDR
id: "0001"
title: "Superficie dimostrativa hello-world"
status: active
date: 2026-08-20
superseded_by: ""
---

## Intent 👁️

Il boilerplate deve dimostrare — con il minimo contenuto possibile — il pattern "un caso d'uso, molte superfici". L'utente (umano o agente) può chiedere un saluto da qualsiasi canale e ottiene lo stesso risultato con lo stesso contratto.

## Design 🎨

- Il caso d'uso `sayHello` accetta un nome opzionale (stringa, senza spazi ai bordi,   1–100 caratteri; default `world`) e restituisce `{ message: "Hello, <name>!" }`.
- Superfici e naming parallelo: `project hello-world [--name]` (CLI),   `GET /api/hello-world?name=` (API), tool `hello_world` (MCP, read-only),   pagina greeting con `useHelloWorld` (UI).
- Errori: input non valido → `VALIDATION` (exit 2 / HTTP 400 Problem   Details / tool error).
- La UI è interamente usabile da tastiera (Invio nel campo = submit).

## Tradeoffs ⚖️

- **Un solo caso d'uso giocattolo** (scelto): il contenuto è volutamente   irrilevante; il valore è la struttura. Alternative scartate: un dominio   "di esempio" più ricco (todo-list), che avrebbe nascosto la struttura   dietro contenuto da cancellare.
- **Nessuna persistenza**: qualsiasi storage finto insegnerebbe pattern   sbagliati da disimparare.

## Non-obiettivi

- Non è un template di dominio realistico: va sostituito, non esteso.
- Nessuna i18n, nessuna telemetria, nessuna auth.

## Acceptance criteria

- [x] `project hello-world` stampa `Hello, world!` (JSON su stdout in pipe).
- [x] `GET /api/hello-world` risponde 200 con il greeting; input invalido →       400 `application/problem+json`.
- [x] Il tool MCP `hello_world` restituisce `structuredContent` con il       greeting.
- [x] La pagina web mostra il greeting via API, usabile da tastiera.
- [x] Ogni superficie è coperta da integration test; la UI da E2E.

## Metriche

Non applicabili (nessuna telemetria).
