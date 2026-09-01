---
type: ADR
id: "0001"
title: "Stack tecnico: Node 24 LTS, TypeScript 7, pnpm, ESM, just, mise"
status: active
date: 2026-08-20
---

## Context

Primo bootstrap del boilerplate. Il vademecum prescrive: ultima Node Active LTS, ultima TypeScript stabile, pnpm fissato, ESM puro, `just` come task runner pubblico. Al momento della verifica: Node 24 è Active LTS (24.19.0), Node 26 è Current; TypeScript 7.0.2 è l'ultima stabile con compilatore nativo.

## Decision

**Node 24.19.0 (`.node-version`), TypeScript 7.0.2, pnpm 11.22.0 (`packageManager`), ESM ovunque (`"type": "module"`), `just` come unica interfaccia operativa, mise per i tool di sistema (`.mise.toml`).**

Dettagli:

- esecuzione TypeScript senza build step: type stripping nativo di Node 24 (solo sintassi eliminabile, `erasableSyntaxOnly`);
- dependency-cruiser richiede la compiler API, non pubblica in TS 7: gli viene affiancato TypeScript 6.0.3 via `packageExtensions` in `pnpm-workspace.yaml` (caso previsto dal vademecum §2);
- Bun 1.3.14 come compatibility target (`just bun-smoke`), mai nel dominio;
- tool di sistema (gitleaks, actionlint, zizmor, lychee, shellcheck, bun) fissati in `.mise.toml`; le recipe degradano a warning in locale se assenti, restano bloccanti in CI.

## Options considered

- **Node 24 LTS + type stripping** (scelta): zero build step per CLI/API/MCP — pro: semplicità, debug diretto; contro: richiede disciplina sulla sintassi eliminabile (garantita da `erasableSyntaxOnly` e Oxlint).
- **Build con tsc/tsup**: pro: compatibilità runtime ampia; contro: passo di build e artefatti da governare, ingiustificati per questo perimetro.
- **ESLint+Prettier**: scartata dal vademecum (Biome+Oxlint coprono il fabbisogno senza duplicazioni).

## Consequences

- Upgrade di major (Node, TS) solo tramite PR dedicata con compatibility suite completa, mai mescolati a feature.
- Quando dependency-cruiser supporterà TS 7, rimuovere il `packageExtensions` (rivalutare a ogni bump di dependency-cruiser).

## Enforcement

`.node-version`, `packageManager`, `engines` in `package.json`, `just doctor` verifica le versioni; `erasableSyntaxOnly` in `tsconfig.base.json`; `just bun-smoke` in CI.

`.github/dependabot.yml` ignora le major di `@types/node` per evitare PR automatiche fuori sincrono col runtime. Quando si eseguirà il bump major di Node, rimuovere quell'`ignore` nello stesso commit che aggiorna `.node-version`, `.mise.toml`, `engines` e `@types/node`.

## Migration / rollback

Non rilevante al bootstrap. Rollback del runtime: PR dedicata che abbassa `.node-version` dopo aver rieseguito l'intera suite.
