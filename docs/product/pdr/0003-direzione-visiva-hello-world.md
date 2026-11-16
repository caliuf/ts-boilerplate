---
type: PDR
id: "0003"
title: "Direzione visiva del flusso hello-world: header applicativo, accento blu e card con azione"
status: active
date: 2026-11-16
superseded_by: ""
---

## Intent 👁️

La UI dimostrativa deve somigliare al progetto gemello `py-boilerplate`, così un umano o un agente che passa da un boilerplate all'altro ritrova la stessa struttura e la stessa gerarchia visiva. PDR-0002 resta la base (token semantici, light/dark, accessibilità); questo record ne specializza l'accento e il layout del caso d'uso hello-world.

## Design 🎨

- Header applicativo a piena larghezza, alto 56 px, con icona `Snowflake` in `--primary`, brand testuale e toggle del tema a destra; il toggle mostra il tema attivo (luna in dark, sole in light).
- Colonna di lettura `max-w-2xl`, centrata, con hero `Hello world` (`text-3xl` bold) e descrizione `max-w-xl` in `text-muted-foreground`.
- Card `base-nova` con header, contenuto e footer separato: titolo `Say hello`, descrizione, campo `Name`, hint e footer `bg-muted/50` con bordo superiore che ospita il submit.
- Azione primaria blu (`--primary` = blue-600, `--primary-hover` = blue-700, `--primary-foreground` bianco) in entrambi i temi; il contrasto del testo bianco sul bottone resta sopra AA anche allo stato hover.
- Esito del caso d'uso mostrato come alert con icona, titolo e descrizione: `Greeting` + messaggio per successo e caricamento, `Error` per l'errore.
- Il brand nel boilerplate è `ts-boilerplate`; i derivati passano il proprio nome a `AppHeader`.

## Tradeoffs ⚖️

- **Accento blu** (scelto): rende riconoscibile l'azione primaria e replica il gemello; contro: si allontana dalla palette completamente neutra di PDR-0002, che resta valida per il resto dei token.
- **Header fuori dalla colonna di lettura** (scelto): brand e tema restano globali; contro: il pattern `Page` non contiene più il toggle e l'app deve comporre header e pagina.
- **Footer della card come band separata** (scelto): separa l'azione dal contenuto e replica il preset; contro: il componente `Card` introduce un contenitore in più rispetto a un form semplice.

## Non-obiettivi

- Nessun logo o asset di brand: l'icona è una decorazione Lucide.
- Nessuna navigazione, routing o nuova superficie.
- Nessuna modifica ai contratti del caso d'uso o alle altre superfici.

## Acceptance criteria

- [x] La pagina mostra header, hero, card e alert con la stessa gerarchia dell'immagine di riferimento.
- [x] Il flusso resta usabile da tastiera e il submit funziona anche dal footer tramite l'attributo `form`.
- [x] Light e dark usano gli stessi token e i test axe restano verdi.
- [x] `just test-web`, `just build` e i test E2E coprono la nuova composizione.

## Metriche

Nessuna telemetria. La build riporta le dimensioni di CSS e JS; il budget resta una decisione del progetto derivato.
