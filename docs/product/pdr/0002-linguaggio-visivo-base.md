---
type: PDR
id: "0002"
title: "Linguaggio visivo di base: neutro, accessibile, light/dark"
status: active
date: 2026-11-16
superseded_by: ""
---

## Intent 👁️

Il boilerplate e i progetti derivati devono partire da una direzione visiva sobria, coerente e accessibile, senza imporre un brand che il prodotto non ha ancora deciso. L'obiettivo è dare agli agenti una lingua comune e agli umani un punto unico dove cambiare palette, tipografia, radius e densità.

## Design 🎨

- Palette neutra in OKLCH, definita una sola volta in `apps/web/src/design-system/theme/tokens.css` e mappata alle utility Tailwind con `@theme inline`.
- Token semantici per superfici, testo, bordi, focus, stati (`destructive`, `success`, `warning`, `info`) e radius. Le feature non usano colori di palette grezzi.
- Light e dark theme con gli stessi token semantici; default `system`, preferenza persistita da `ThemeProvider` e applicata prima del primo paint.
- Tipografia sans variable Geist self-hosted; niente CDN di font.
- Layout mobile-first, larghezza di lettura contenuta, spaziatura coerente, focus visibile e navigazione da tastiera.
- Componenti di base con varianti esplicite (`Button` con `variant` e `size`), stati disabled, focus, invalid e loading dove applicabili.
- Icone Lucide con dimensioni coerenti e nomi accessibili sui controlli icon-only.
- Animazioni brevi in CSS/Tailwind e rispetto di `prefers-reduced-motion` sui componenti del design system.
- I token di stato sono tarati per AA sul testo: `--destructive` è più scuro del preset neutro shadcn perché il rosso di default non raggiungeva 4.5:1 a 14 px. Non ripristinare i valori del preset senza rieseguire gli audit axe.

Il preset di partenza è `base-nova` con base color `neutral` della versione shadcn adottata. Non è una palette di brand: un progetto derivato la sostituisce tramite i token e registra la propria direzione visiva in una PDR dedicata, senza riscrivere i componenti.

## Tradeoffs ⚖️

- **Neutro e sobrio** (scelto): adatto a un boilerplate e a tool interni, facile da personalizzare; contro: non comunica un'identità di prodotto finché il derivato non la definisce.
- **Dark mode fin dall'inizio** (scelto): evita di retrofitare i token e il tema dopo; contro: ogni nuovo token va verificato in entrambi i temi e per contrasto.
- **Font variable self-hosted** (scelto): nessuna dipendenza da CDN e pesi flessibili; contro: asset da servire e preload da misurare nel progetto reale.
- **Nessuna baseline visuale automatizzata** (scelto per ora): evita snapshot fragili su un dimostratore; il confronto visuale resta MAY quando esisteranno schermate ad alto valore.

## Non-obiettivi

- Definire un brand, un logo o una palette marketing.
- Introdurre i18n, RTL o una seconda lingua nella UI del boilerplate.
- SSR, SEO o routing server-side: la UI resta una SPA Vite.
- Storybook, visual regression, React Hook Form, Sonner, TanStack Table o Motion: si adottano solo con un caso d'uso concreto e una decisione separata.
- Coprire l'intero catalogo shadcn: si aggiungono i componenti necessari.

## Acceptance criteria

- [x] Palette, radius, tipografia e stati vivono in token centralizzati; un umano può cambiare l'aspetto globale in un punto.
- [x] Light e dark usano gli stessi token semantici e `color-scheme` è coerente.
- [x] Il tema iniziale è applicato prima del primo paint e la preferenza è persistita.
- [x] Il flusso hello-world è usabile da tastiera e mostra stati loading, success ed error.
- [x] La schermata principale supera l'audit axe WCAG 2.2 AA nei flussi critici.
- [x] I componenti interattivi passano dal design system; la struttura del documento usa HTML semantico.
- [x] `just test-web`, `just build` e `just test-e2e` coprono componenti, build e accessibilità.

## Metriche

Nessuna telemetria. La build riporta le dimensioni di CSS e JS; un budget kilobyte va fissato nel progetto derivato dopo la prima build rappresentativa e mantenuto con un ratchet.
