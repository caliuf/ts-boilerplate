---
type: PDR
id: "0003"
title: "Direzione visiva del flusso hello-world: replica del gemello py-boilerplate"
status: active
date: 2026-11-16
superseded_by: ""
---

## Intent 👁️

La UI dimostrativa deve essere visivamente identica al progetto gemello `py-boilerplate`, così un umano o un agente che passa da un boilerplate all'altro ritrova la stessa struttura, la stessa gerarchia e gli stessi valori visivi. PDR-0002 resta la base (token semantici, light/dark, accessibilità); questo record fissa come quei token e quel layout vengono valorizzati per il caso d'uso hello-world.

## Design 🎨

- Token OKLCH condivisi con `py-boilerplate` in `design-system/theme/tokens.css`, light e dark: `--primary` oklch(46% 0.14 255) in light e oklch(72% 0.13 255) in dark, `--background` oklch(99% 0.003 250) / oklch(17% 0.015 255), `--card` oklch(100% 0 0) / oklch(20% 0.016 255), `--muted-foreground` e `--border` derivati dalla stessa scala. Un progetto derivato cambia il brand modificando solo questi valori.
- Tipografia sans di sistema: nessun webfont. Lo stack è `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif` più le famiglie emoji, così il rendering coincide con il gemello e non si serve alcun asset font.
- Header applicativo sticky a piena larghezza, alto 56 px, su contenitore `max-w-4xl`: icona `Sparkles` in `--primary`, brand testuale `text-sm font-semibold` e toggle del tema a destra con tooltip che nomina l'azione. Il toggle mostra il tema attivo (luna in dark, sole in light) e il nome accessibile è `Switch to dark theme` / `Switch to light theme`.
- Shell con skip link verso `#main`, `main` semantico e footer applicativo su `max-w-4xl` con due righe `text-xs text-muted-foreground`: stack tecnologico a sinistra, tagline a destra.
- Colonna di lettura `max-w-2xl`, centrata, con hero `Hello world` (`sm:text-3xl` semibold, tracking stretto) e descrizione `max-w-prose` in `text-muted-foreground`.
- Card `base-nova` con header, contenuto e footer separato: titolo `Say hello`, descrizione, campo `Name` con hint, footer `bg-muted/50` con bordo superiore che ospita il submit. Il bottone primario usa `bg-primary` con hover `bg-primary/80`.
- Errore in `--destructive` oklch(55% 0.2 25) in light e oklch(70% 0.16 25) in dark: la tinta resta quella del gemello ma la luminosità in dark è alzata finché il testo dell'alert supera AA (4.5:1) sul fondo `--card`; lo stesso rosso marca label e bordo del campo invalido.
- Stati del risultato nella stessa posizione: `Empty` con icona `MessageSquare` prima di ogni richiesta, alert `Greeting` con icona `CircleCheck` per successo e caricamento, alert `Request failed` con icona `TriangleAlert` per l'errore; il campo invalido usa bordo e label in `--destructive`.
- Il brand nel boilerplate è `ts-boilerplate`; i derivati lo passano a `AppHeader`.

## Tradeoffs ⚖️

- **Replica esatta del gemello** (scelto): due boilerplate sorelle si leggono allo stesso modo e il confronto visuale diventa immediato; contro: si rinuncia a una tipografia variable dedicata e alla palette puramente neutra del preset, che restano disponibili cambiando i token.
- **Nessun webfont** (scelto): zero asset di font da servire e rendering identico al gemello; contro: ogni sistema operativo renderizza il proprio sans di sistema.
- **Rosso d'errore più chiaro in dark del gemello** (scelto): la copia letterale del token cadeva a 3.89:1 sul fondo card e violava axe; contro: il dark non è pixel-identico al gemello su quel solo colore, mentre struttura, tipografia e tutti gli altri token coincidono.
- **Header fuori dalla colonna di lettura** (scelto): brand e tema restano globali; contro: il pattern `Page` non contiene il toggle e l'app deve comporre header e pagina.
- **Footer della card come band separata** (scelto): separa l'azione dal contenuto e replica il preset; contro: il componente `Card` introduce un contenitore in più rispetto a un form semplice.

## Non-obiettivi

- Nessun logo o asset di brand: l'icona è una decorazione Lucide.
- Nessuna navigazione, routing o nuova superficie.
- Nessuna modifica ai contratti del caso d'uso o alle altre superfici.
- Nessun sistema di toast visibile nel flusso hello-world: lo stato vive nella pagina.

## Acceptance criteria

- [x] La pagina mostra header, hero, card, empty state e alert con la stessa gerarchia e gli stessi valori visivi di `py-boilerplate`.
- [x] Light e dark usano gli stessi token del gemello e la build non serve alcun font.
- [x] Il flusso resta usabile da tastiera, con submit nativo nella form e toggle accessibile con tooltip.
- [x] `just test-web`, `just build` e i test E2E (incluso axe) coprono la composizione.

## Metriche

Nessuna telemetria. La build riporta le dimensioni di CSS e JS; il budget resta una decisione del progetto derivato.
