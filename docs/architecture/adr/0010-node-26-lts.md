---
type: ADR
id: "0010"
title: "Stack tecnico: Node 26 LTS, TypeScript 7, pnpm, ESM, just, mise"
status: active
date: 2026-11-17
supersedes: "0001"
---

## Context

ADR-0001 ha fissato al bootstrap Node 24.19.0 perché, ad agosto 2026, Node 24 era Active LTS e Node 26 era ancora `Current`. Il Vademecum TypeScript prescrive per un progetto nuovo la più recente Active LTS: dal 28 ottobre 2026 quella release è **Node 26 «Lithium»**, con 26.13.1 come ultima patch e supporto fino al 30 aprile 2029. Node 24 «Krypton» è passato a Maintenance LTS il 20 ottobre 2026 e riceve solo fix critici e di sicurezza fino al 30 aprile 2028.

Le migrazioni di major si eseguono con PR dedicate, come richiesto dai Consequences di ADR-0001. Per questa migrazione la compatibilità con Node 26 è stata verificata sull'intera suite: unit, integration, web, coverage, typecheck, Biome, Oxlint, dependency-cruiser, knip, build, smoke e gate CI sono verdi. Le dipendenze principali dichiarano già il supporto alla major 26 (`@types/node` 26.6.6, Vitest 5.1 con `^22.12 || ^24 || >=26`, dependency-cruiser 18.7.2 con `^22 || ^24 || >=26`, Vite 8.3.6 con `>=22.12`). I moduli nativi usati dal tooling sono N-API, quindi il nuovo `NODE_MODULE_VERSION` 147 non richiede rebuild applicativi.

Node 26 mantiene stabile il type stripping già usato dal progetto e rimuove `--experimental-transform-types`: la scelta di ADR-0001 di limitare il codice backend a sintassi TypeScript eliminabile, garantita da `erasableSyntaxOnly`, resta valida e non richiede modifiche al codice. Sono stati rimossi anche `writeHeader()` e i moduli legacy `_stream_*`, non usati nel repository. I binari ufficiali Linux di Node 26 sono linkati a `libatomic`, quindi il prerequisito di sistema va reso esplicito.

## Decision

**Il runtime autorevole del progetto è Node 26.13.1, fissato in `.node-version` e `.mise.toml`; il resto dello stack di ADR-0001 resta invariato: TypeScript 7.0.2, pnpm 12.4.2, ESM, just e mise.**

Dettagli:

- `package.json#engines` delimita la major supportata con `^26.0.0`;
- la dipendenza diretta `@types/node` è allineata alla nuova major con 26.6.6; l'ignore Dependabot delle major resta per evitare aggiornamenti dei tipi separati dal runtime, che verranno aggiornati insieme nella prossima PR di migrazione;
- esecuzione TypeScript senza build step tramite type stripping stabile di Node 26 (solo sintassi eliminabile, `erasableSyntaxOnly`);
- Bun 1.4.0 resta il compatibility target (`just bun-smoke`), mai nel dominio né nell'application layer;
- `libatomic1` entra nei prerequisiti Debian/Ubuntu installati da `just install`;
- dependency-cruiser continua a usare TypeScript 6.0.3 via `packageExtensions` in `pnpm-workspace.yaml`, come previsto da ADR-0001.

## Options considered

- **Restare su Node 24** (scartata): è supportato fino ad aprile 2028, quindi non c'è urgenza di sicurezza, ma è già Maintenance LTS, non riceve nuove feature e viola la policy «più recente Active LTS» del Vademecum. Rinviare aumenta solo il delta da colmare.
- **Node 26 LTS** (scelta): è la Active LTS corrente, la suite è già verde e le dipendenze dichiarano il supporto. Il costo è un prerequisito di sistema in più (`libatomic1`) e l'allineamento di `@types/node`.
- **Node 27 alpha** (scartata): non è una release per la produzione; il progetto adotta solo Active LTS o Maintenance LTS.

## Consequences

- Il progetto può usare V8 14.6 (Temporal attivo di default, `Map.prototype.getOrInsert`, `Iterator.concat`) senza polyfill, pur senza introdurre feature di prodotto non richieste.
- Il codice backend a sola sintassi eliminabile non cambia; eventuali future introduzioni di `enum`, namespace runtime, parameter properties o decorator restano vietate dal typecheck e dalla regola `erasableSyntaxOnly`, non dalla rimozione del flag di trasformazione.
- I binari nativi N-API esistenti continuano a funzionare; un'eventuale dipendenza con addon legati all'ABI Node richiederà un rebuild con `pnpm install`.
- Su Debian/Ubuntu senza `libatomic1` il runtime non parte; `just install` e la guida di onboarding lo rendono esplicito.
- La prossima migrazione major è Node 28, prevista Active LTS a ottobre 2028, e seguirà lo stesso flusso di PR dedicata.

## Enforcement

`.node-version` è verificato da `just doctor` (major diverso: errore; patch diversa: warning). `.mise.toml`, `package.json#engines` e la dipendenza diretta `@types/node` vanno aggiornati insieme nella migrazione; la CI installa la toolchain da `.mise.toml` con `jdx/mise-action`. La compatibilità è verificata da `just prepush` e `just ci` (typecheck, lint, arch, dead-code, test, build, coverage, smoke, bun-smoke, E2E). I file che definiscono gate e toolchain sono protetti da CODEOWNERS.

## Migration / rollback

Il change set aggiorna `.node-version`, `.mise.toml`, `package.json#engines`, la dipendenza diretta `@types/node` e il lockfile, mantiene l'ignore Dependabot per le major di `@types/node` e aggiunge `libatomic1` ai prerequisiti. Va eseguito con `mise install` e `pnpm install`, poi validato con `just ci`.

Il rollback ripristina i pin a Node 24 e `@types/node` 24.x, mantenendo l'ignore Dependabot per le major, quindi richiede `mise install`, un `pnpm install` pulito e la suite completa sotto Node 24.
