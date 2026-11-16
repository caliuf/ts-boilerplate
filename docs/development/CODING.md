# Regole di codice

Estratto operativo del vademecum per chi scrive codice in questo repo. Le regole marcate dai tool falliscono in `just precommit`/`prepush`/`ci`; le altre restano policy da rispettare e verificare in review.

## TypeScript

- Strict al massimo (`tsconfig.base.json`); ESM puro; estensione `.ts` esplicita negli import relativi.
- Solo sintassi eliminabile: niente `enum`, namespace, parameter properties, decorator. Union e oggetti `as const` al posto degli enum.
- Niente alias `tsconfig.paths` nel backend, nel dominio e nei package: workspace package e `exports` standard. L'unica eccezione è l'alias `@/*` di `apps/web` verso `src/*`, richiesto da shadcn e confinato al bundler frontend (ADR-0009).
- `import type` espliciti (`verbatimModuleSyntax`).

## Vietato (codice di produzione; nessuna eccezione senza motivazione in linea)

- `any`, `@ts-ignore`, `@ts-nocheck`, non-null assertion `!`, doppi cast `unknown as T`, disable comment generici nel codice di dominio, application e adapter.
- Promise non gestite (`no-floating-promises`).
- `JSON.parse()` non validato ai confini del prodotto: ogni dato esterno passa da uno schema Zod.
- `console.log` fuori da `tools/scripts` e `apps/web` (il logging è una porta).
- Catch silenziosi; `default` che nascondono casi nelle state machine (usa exhaustive checking con `never`).

## Struttura

- Un caso d'uso = un file `application/<verbo>-<nome>.ts` con test colocato.
- Un subcommand CLI = un file `apps/cli/src/commands/<nome>.ts`, registrato in `src/registry.ts`.
- Una route API = un handler in `apps/api/src/routes/`; un tool MCP = un file in `apps/mcp/src/tools/`; una feature UI = `apps/web/src/features/<feature>/`.
- Entry point sottili: parse → valida → caso d'uso → mappa. Nient'altro.
- Naming parallelo su ogni canale; mappa aggiornata in `docs/PROJECT.md`.
- Niente cartelle `utils`/`helpers`/`common`; niente barrel interni (gli `src/index.ts` pubblici dei package sono ammessi); registry dichiarativi.
- UI: per controlli interattivi e primitive visuali condivise usare solo i componenti del design system (`apps/web/src/design-system/`); per la struttura del documento usare normalmente HTML semantico nativo; non creare wrapper React per ogni elemento HTML senza valore aggiunto; interazioni keyboard-first.
- Design system: `primitives/` per i componenti generici (shadcn/Base UI), `patterns/` per le composizioni riutilizzabili, `theme/` per token e CSS globale, `lib/utils.ts` per `cn`. Le feature non importano `@base-ui/react` direttamente (gate dependency-cruiser) e il design system non importa `app/` o `features/`.

## Frontend e UI

- Tailwind CSS 4 è il vocabolario di styling standard; CSS Modules o CSS nativo restano per i casi in cui sono più leggibili. Niente SCSS, CSS-in-JS runtime o DaisyUI senza ADR.
- Ogni classe Tailwind deve essere una stringa completa e statica nel sorgente: niente `bg-${color}-500`, concatenazioni o valori derivati da API/input/LLM.
- Usare i token semantici (`bg-background`, `text-muted-foreground`, `border-border`, `ring-ring`, `destructive`, `success`, `warning`, `info`) e non colori di palette grezzi. Se un valore si ripete, promuoverlo a token o variante.
- Comporre le classi con `cn` dal punto centrale `design-system/lib/utils.ts`. Usare CVA solo per varianti reali e riutilizzabili.
- I componenti interattivi passano dal design system; le feature non ricostruiscono focus, tastiera o ARIA. Le icone usano Lucide React, sono decorative con `aria-hidden` o hanno un nome accessibile sul controllo.
- Rispettare `prefers-reduced-motion` con la variante `motion-reduce:` sui componenti che animano transizioni non essenziali.
- Non usare `dangerouslySetInnerHTML` con contenuto non fidato e non passare input non validato in `style`, custom properties o nomi di classe.
- Aggiungere componenti shadcn solo con il CLI e solo quando servono; la procedura e le trappole (import di `cn`, alias) sono in `apps/web/src/design-system/README.md`.

## Preferenze

Dati immutabili, branded ID dove servono identità, discriminated union, `Result` per gli errori attesi, dipendenze esplicite, clock/ID/random/I/O iniettati tramite porte.

## Dipendenze

- Non aggiungere dipendenze senza necessità; quelle significative richiedono un'ADR.
- Prima di usare l'API di una libreria, verificala nella versione installata (`node_modules`): mai a memoria.

## Decisioni

- Regola di prodotto nuova o ambigua → PDR `proposed` o domanda all'umano.
- Decisione architetturale nuova o deroga a uno SHOULD → ADR nello stesso commit del codice.
- Con Kilo le decision record si creano con i comandi `/create-adr` e `/create-pdr`; le directory sono configurate in `conventions.conf` e gli indici autorevoli sono i `README.md` delle rispettive cartelle.
- Template: `docs/architecture/adr/0001-stack-tecnico.md` e `docs/product/pdr/0001-superficie-hello-world.md` fanno da esempio.
