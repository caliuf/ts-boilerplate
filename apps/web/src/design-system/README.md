# Design system

Il design system della UI web. Le feature compongono questi componenti e non ricostruiscono markup, stati, focus o comportamento accessibile (Vademecum CSS §0.1).

## Struttura

- `primitives/`: componenti generici sorgente, oggi generati da shadcn/ui su Base UI (`button`, `input`, `label`, `alert`, `card`).
- `patterns/`: composizioni riutilizzabili fra feature (`app-header`, `page`, `text-field`, `message`, `theme-toggle`). Non conoscono il dominio e non importano codice dell'app.
- `theme/`: token semantici (`tokens.css`) e unico ingresso CSS globale (`global.css`).
- `lib/utils.ts`: punto centrale di import per `cn`. I componenti importano `cn` da qui, non dal pacchetto esterno.

Le API pubbliche non ancora consumate dal boilerplate (per esempio `AlertTitle`, `AlertAction` e `buttonVariants`) sono marcate `@public` per Knip: restano disponibili ai progetti derivati senza generare falsi positivi di dead code.

## Stack

- Tailwind CSS v4 tramite `@tailwindcss/vite`;
- shadcn/ui con preset `base-nova` e primitive Base UI;
- `class-variance-authority` per le varianti reali;
- `lucide-react` come unico set di icone;
- token CSS custom properties + `@theme inline`, light e dark tramite la classe `.dark`;
- font variable self-hosted Geist tramite `@fontsource-variable/geist`.

La configurazione shadcn vive in `apps/web/components.json`. Gli alias portano `ui` su `design-system/primitives` e `utils` su `design-system/lib/utils`.

## Aggiungere un componente shadcn

Dalla directory `apps/web`, con la versione di shadcn fissata nel `package.json`:

```bash
pnpm exec shadcn add <component>
```

Dopo l'aggiunta:

1. verifica che il componente usi Base UI e i token semantici;
2. sostituisci l'import `cn` da `"cn"` con `../lib/utils.ts` (o il percorso relativo corretto), perché il registry corrente non rispetta l'alias `utils`;
3. aggiungi `motion-reduce:transition-none` alle transizioni non essenziali;
4. esegui `just format-check lint typecheck test-web build`.

Non generare l'intero catalogo e non copiare snippet manuali quando il CLI può generare il componente compatibile.

## Modificare l'aspetto globale

1. modifica i token in `theme/tokens.css`;
2. verifica light e dark e il contrasto;
3. esegui `just test-web` e `just test-e2e` (include l'audit axe);
4. aggiorna le eventuali baseline visuali solo dopo una review intenzionale.

Non aggiungere override globali, `!important` o classi di palette grezze nelle feature: promuovi il valore a token o variante.

## Test e gate

- Test componentistici: `just test-web` (Vitest, Testing Library, happy-dom).
- E2E e accessibilità: `just test-e2e` (Playwright + axe sui flussi critici).
- Formatter e lint CSS: Biome (`just format-check`); il lint TS/JS resta Oxlint (`just lint`), con `jsx-a11y` attivo.
- Build di produzione: `just build`, inclusa in `just prepush` e `just ci`.

Le regole di accessibilità e di composizione sono descritte in `docs/development/CODING.md`; le decisioni di stack in ADR-0009 e la direzione visiva di base in PDR-0002.
