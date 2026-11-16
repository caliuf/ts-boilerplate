---
type: ADR
id: "0009"
title: "Baseline frontend: Tailwind CSS 4, shadcn/ui su Base UI, token semantici e test UI"
status: active
date: 2026-11-16
---

## Context

Il boilerplate nasce con una UI minima in CSS nativo: quattro componenti artigianali, un foglio globale e nessun progetto Vitest con ambiente DOM. È una scelta adeguata per il dimostratore, ma ogni progetto derivato che cresce ha subito bisogno di token condivisi, varianti tipizzate, primitive interattive accessibili, dark mode, icone coerenti, build CSS ottimizzata e test componentistici.

Il Vademecum CSS (baseline 16 novembre 2026) definisce Tailwind CSS 4, shadcn/ui con Base UI, CVA, `cn`, Lucide, token CSS e test UI come stack predefinito per un frontend nuovo. Lo stesso vademecum precisa che, in un progetto esistente con un design system diverso, l'adozione è una migrazione architetturale: richiede un ADR e un piano, non l'esecuzione cieca del CLI sopra il design system corrente. Questo record è quella decisione.

## Decision

**Il frontend di `apps/web` adotta la baseline del Vademecum CSS come punto di partenza per il boilerplate e per i progetti derivati.**

Stack e responsabilità:

- React 19 + Vite 8 come framework e bundler; `@tailwindcss/vite` per integrare Tailwind CSS 4.
- shadcn/ui con codice sorgente nel repository e preset `base-nova` (palette `neutral`), primitive Base UI tramite la base `base` del CLI shadcn.
- `class-variance-authority` per le varianti reali dei componenti, `cn` come punto unico di composizione delle classi, `lucide-react` come unico set di icone.
- Token semantici in `design-system/theme/tokens.css`, mappati alle utility con `@theme inline` in `global.css`; light e dark tramite la classe `.dark` e `color-scheme` coerente. Sono presenti anche i token di stato `success`, `warning`, `info` e `destructive`.
- Tipografia sans di sistema (`ui-sans-serif`, `system-ui` e fallback), senza webfont: la tipografia è un token e un progetto derivato può adottare un font self-hosted con una propria decisione.
- Struttura del design system: `primitives/` per i componenti generici (shadcn/Base UI), `patterns/` per le composizioni riutilizzabili (`app-header`, `page`, `text-field`, `message`, `theme-toggle`), `theme/` per token e CSS globale, `lib/utils.ts` per `cn`.
- Le feature importano solo i componenti del design system; il documento usa HTML semantico nativo.
- Alias `@/*` verso `apps/web/src/*` in `tsconfig.json` e `vite.config.ts`, coerente con gli alias richiesti da shadcn. È un'eccezione circoscritta al bundler frontend all'indicazione del Vademecum TypeScript di non usare `tsconfig.paths`: il backend e i package restano su import relativi e workspace package.
- Tema applicato prima del primo paint con uno script bloccante minimo in `apps/web/index.html`; `ThemeProvider` è l'unico proprietario della preferenza `light | dark | system` e la persiste in `localStorage`.
- Test componentistici in Vitest con ambiente `happy-dom`, Testing Library e `user-event`; E2E Playwright con audit axe sui flussi critici. Il progetto Vitest `web` è separato dai progetti Node e la recipe dedicata è `just test-web`.
- La build usa i default di Vite 8: target `baseline-widely-available`, `cssCodeSplit` attivo, minificazione esbuild, nessun PostCSS, cssnano o PurgeCSS aggiunto sopra Tailwind/Vite. Il browser target si cambia solo con un requisito di prodotto e una decisione registrata (Vademecum CSS §14.3-14.4).

Versioni adottate al 16 novembre 2026: Tailwind CSS e `@tailwindcss/vite` 4.3.5, shadcn 4.23.0, Base UI 1.9.0, CVA 0.7.1, `cn` 0.5.2, Lucide React 1.73.0, `tw-animate-css` 1.4.0, Testing Library React 16.3.3, `user-event` 14.6.5, `jest-dom` 7.0.1, happy-dom 21.0.4, `@axe-core/playwright` 4.14.0. Le versioni restano fissate nel lockfile.

## Options considered

- **Mantenere il CSS nativo artigianale** (scartata): funziona per il dimostratore, ma non dà ai derivati token, varianti, primitive accessibili, dark mode e test UI già pronti; ogni progetto dovrebbe ricostruirli o adottare uno stack senza una decisione registrata.
- **DaisyUI al posto di shadcn/ui** (scartata): aggiunge un secondo vocabolario di classi e non fornisce primitive React accessibili; il Vademecum CSS la esclude dallo stack standard.
- **Radix o React Aria come base** (scartate per un progetto nuovo): restano alternative valide, ma Base UI è la scelta predefinita corrente di shadcn per i nuovi progetti. Non c'era una base preesistente da preservare.
- **Generare l'intero catalogo shadcn** (scartata): il CLI aggiunge codice che il progetto deve mantenere; si aggiungono solo i componenti necessari.
- **Aggiungere subito Storybook, React Hook Form, Sonner, TanStack Table e visual regression** (scartate): sono MAY del vademecum e non hanno ancora un caso d'uso reale. Restano decisioni separate quando il prodotto le richiederà.

## Consequences

- La UI del boilerplate cambia aspetto: palette neutra, componente Button con varianti, input e alert del design system, dark mode e toggle del tema. Il contenuto dimostrativo rimane invariato.
- Il bundle frontend cresce per React, Base UI e Lucide; la build di produzione riporta le dimensioni e il budget kilobyte resta una decisione del singolo progetto (Vademecum CSS §14.6).
- I progetti derivati ereditano lo stack e devono personalizzare i token, non ricostruire i componenti. Un cambio di direzione visiva va registrato in una PDR del derivato.
- Il CLI shadcn corrente genera import di `cn` dal pacchetto `"cn"` e ignora l'alias `utils`: dopo ogni `shadcn add` l'import va centralizzato a mano su `design-system/lib/utils.ts`. La procedura è in `apps/web/src/design-system/README.md`.
- Gli aggiornamenti significativi di Tailwind, shadcn, Base UI, Vite, Biome o React seguono la policy del Vademecum CSS §1.4: PR dedicate, build, test, accessibilità e controlli visuali.

## Aggiornamento — replica del gemello py-boilerplate

La tipografia self-hosted Geist è stata rimossa: `@fontsource-variable/geist` non è più una dipendenza e il token `--font-sans` usa lo stack sans di sistema, così la UI coincide con il gemello `py-boilerplate` e non serve alcun asset font. I token OKLCH, gli stati del caso d'uso e la composizione visiva sono registrati in PDR-0003. Il design system accoglie nel frattempo le primitive `empty` e `tooltip` (con `TooltipProvider` montato dall'applicazione) e il pattern `app-header`.

## Enforcement

- `just build` esegue la build di produzione ed è incluso in `just prepush` e `just ci`.
- `just format-check` (Biome, con parser Tailwind e lint CSS) e `just lint` (Oxlint type-aware con `jsx-a11y`) coprono CSS e TSX.
- `just test-web` esegue i test componentistici; `just test-e2e` esegue Playwright con l'audit axe sui flussi critici.
- `just typecheck`, `just dead-code` e `just arch` restano gate; `docs/memory/environment.md` registra i comandi e le trappole del frontend.
- `components.json` e `apps/web/package.json` sono la fonte di verità della configurazione shadcn; il design system ha un README operativo.

## Migration / rollback

La migrazione è stata eseguita in un unico cambiamento: i file del design system sono stati spostati con `git mv` nella struttura `primitives/`, `patterns/`, `theme/` e `lib/`; il vecchio CSS globale è stato sostituito dai token e dal foglio Tailwind; `GreetingPage` è stata riscritta per comporre il design system.

Il rollback, se necessario, rimuove le dipendenze frontend, ripristina i componenti CSS nativi e riporta `vitest.config.ts`, `playwright` e le recipe ai gate precedenti. Non è previsto un percorso di migrazione graduale: la UI è piccola e il cambiamento è già verificato dai gate.
