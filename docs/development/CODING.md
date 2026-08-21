# Regole di codice

Estratto operativo del vademecum per chi scrive codice in questo repo. Le regole critiche sono gate: falliscono in `just precommit`/`prepush`/`ci`.

## TypeScript

- Strict al massimo (`tsconfig.base.json`); ESM puro; estensione `.ts` esplicita negli import relativi.
- Solo sintassi eliminabile: niente `enum`, namespace, parameter properties, decorator. Union e oggetti `as const` al posto degli enum.
- Niente alias `tsconfig.paths`: workspace package e `exports` standard.
- `import type` espliciti (`verbatimModuleSyntax`).

## Vietato (gate di lint, nessuna eccezione senza motivazione in linea)

- `any`, `@ts-ignore`, `@ts-nocheck`, non-null assertion `!`, doppi cast `unknown as T`, disable comment generici.
- Promise non gestite (`no-floating-promises`).
- `JSON.parse()` non validato: ogni dato esterno passa da uno schema Zod.
- `console.log` fuori da `tools/scripts` e `apps/web` (il logging è una porta).
- Catch silenziosi; `default` che nascondono casi nelle state machine (usa exhaustive checking con `never`).

## Struttura

- Un caso d'uso = un file `application/<verbo>-<nome>.ts` con test colocato.
- Un subcommand CLI = un file `apps/cli/src/commands/<nome>.ts`, registrato in `src/registry.ts`.
- Una route API = un handler in `apps/api/src/routes/`; un tool MCP = un file in `apps/mcp/src/tools/`; una feature UI = `apps/web/src/features/<feature>/`.
- Entry point sottili: parse → valida → caso d'uso → mappa. Nient'altro.
- Naming parallelo su ogni canale; mappa aggiornata in `docs/PROJECT.md`.
- Niente cartelle `utils`/`helpers`/`common`; niente barrel; registry dichiarativi.
- UI: solo componenti del design system (`apps/web/src/design-system/`), mai elementi HTML grezzi nelle feature; interazioni keyboard-first.

## Preferenze

Dati immutabili, branded ID dove servono identità, discriminated union, `Result` per gli errori attesi, dipendenze esplicite, clock/ID/random/I/O iniettati tramite porte.

## Dipendenze

- Non aggiungere dipendenze senza necessità; quelle significative richiedono un'ADR.
- Prima di usare l'API di una libreria, verificala nella versione installata (`node_modules`): mai a memoria.

## Decisioni

- Regola di prodotto nuova o ambigua → PDR `proposed` o domanda all'umano.
- Decisione architetturale nuova o deroga a uno SHOULD → ADR nello stesso commit del codice.
- Template: `docs/architecture/adr/0001-stack-tecnico.md` e `docs/product/pdr/0001-superficie-hello-world.md` fanno da esempio.
