---
type: ADR
id: "0003"
title: "Zod come unica libreria di validazione schema"
status: active
date: 2026-08-20
---

## Context

Ogni dato esterno che attraversa un confine applicativo (HTTP, environment runtime, file, output LLM, risposte API) va validato a runtime; tipi TypeScript e schemi devono derivare da una sola definizione. Il vademecum richiede UNA libreria di schema scelta tramite ADR.

## Decision

**Zod v4 come unica libreria di schema del progetto.** Tipi inferiti con `z.infer`; nessuna ridefinizione manuale dei tipi sulle superfici applicative. Gli schemi condivisi vivono in `packages/contracts`; l'environment consumato da una composition root è validato prima di entrare nel dominio o nell'application layer. Le configurazioni del bundler restano tooling e devono comunque rifiutare valori non utilizzabili.

## Options considered

- **Zod v4** (scelta) — pro: Standard Schema compliant (interoperabile con il MCP SDK), inferenza eccellente, ecosistema AI-tooling maturo; contro: bundle non minuscolo lato web (irrilevante a questo perimetro).
- **Valibot** — pro: footprint minimo, Standard Schema; contro: ecosistema più giovane. Resta la rivale designata se il bundle size diventasse un requisito.
- **TypeBox/ArkType** — non valutate a fondo: nessun requisito le richiede.

## Consequences

- Nuovo dato esterno ⇒ nuovo schema Zod in `contracts` (o nel composition root per l'environment), mai `as T` su `JSON.parse`.
- L'MCP SDK v2 accetta Standard Schema: gli schemi Zod sono riusati così come sono nei tool.
- Cambiare libreria richiede una nuova ADR che sostituisce questa.

## Enforcement

Typecheck (tipi inferiti dagli schemi), Oxlint (`no-unsafe-type-assertion`, `no-explicit-any`), review sui boundary. Il web client valida anche le risposte (vedi `apps/web/src/features/greeting/hello-world-api.ts`).

## Migration / rollback

Non rilevante al bootstrap.
