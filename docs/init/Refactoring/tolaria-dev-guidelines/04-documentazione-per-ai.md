# 04 — Documentazione efficace per AI agents

Tolaria è interessante soprattutto perché non si limita ad avere documentazione: ha documentazione con una **forma utile per gli agenti**.

## 1. La gerarchia documentale da copiare

## Livello 1 — Istruzioni operative
### `AGENTS.md`
Deve dire all’agente:

- cosa leggere prima di cambiare codice
- quali gate rispettare
- quando aggiornare docs
- quando creare ADR
- cosa conta come done
- cosa non deve mai fare

Questo file deve essere breve, diretto, prescrittivo.

## Livello 2 — Mappa della codebase
### `docs/GETTING-STARTED.md`
Serve a trovare rapidamente:

- prerequisiti
- setup locale
- comandi principali
- struttura cartelle
- come lanciare test e debug

## Livello 3 — Invarianti architetturali
### `docs/ARCHITECTURE.md`
Serve a spiegare:

- source of truth
- layer e boundaries
- ownership dei dati
- flussi sync/async
- persistenza
- integrazioni esterne
- deployment model

## Livello 4 — Modelli e convenzioni
### `docs/ABSTRACTIONS.md`
Serve a spiegare:

- entità principali
- DTO / schema / entity
- naming standards
- service layer conventions
- eventi e side effect
- policy sugli identificatori
- pattern per commands, handlers, repositories, tasks

## Livello 5 — Decisioni irreversibili
### `docs/adr/`
Qui vanno le decisioni architetturali vere.

Non usarle per:

- bugfix
- refactor locale
- dettagli cosmetici

Usale per:

- framework choice
- auth strategy
- data storage
- queue/worker model
- API versioning
- tenancy model
- observability stack

## 2. Il principio più importante: documenta contratti, non intuizioni

Un agente AI lavora bene quando trova frasi come:

- “il backend è il solo punto autorizzato a scrivere X”
- “gli handler HTTP orchestrano, i service decidono”
- “i componenti React non chiamano direttamente provider esterni”
- “gli eventi analytics non contengono PII”
- “i test smoke proteggono solo i percorsi core”

Lavora male quando trova frasi vaghe come:

- “in genere facciamo così”
- “di solito qui è meglio…”
- “questa cartella contiene un po’ di tutto”

## 3. Forma consigliata di `AGENTS.md`

Tolaria usa un `AGENTS.md` molto orientato all'azione. Per il tuo progetto Python + React, ti consiglio questa struttura:

```md
# AGENTS.md

## Development process
### Before coding
- Read the task fully
- Read docs/ARCHITECTURE.md and docs/ABSTRACTIONS.md for structural work
- Read relevant ADRs before changing cross-cutting behavior
- Capture baseline code health for touched files

### Implementation loop
- Prefer TDD
- Reuse existing components and services before creating new ones
- Keep commits small
- Never bypass hooks

### Quality gates
- Frontend: eslint, tsc, vitest coverage, playwright smoke
- Backend: ruff, mypy, pytest coverage
- Security scan required
- Docs update required if architecture/abstractions changed

### Release checklist
- What changed
- How tested
- Coverage result
- Security result
- Docs updated or not needed
- ADRs updated or none
```

## 4. Documenta sempre il “where to put state”

Uno dei punti migliori di `docs/ARCHITECTURE.md` in Tolaria è che decide chiaramente **dove vive ogni tipo di stato**.

Nel tuo progetto devi fare lo stesso.

Esempi di decisioni da documentare:

- cosa sta nel DB
- cosa sta in cache
- cosa sta solo in memoria frontend
- cosa sta in local storage / session storage
- cosa è derivato e ricostruibile
- cosa è configurazione di installazione vs configurazione di progetto

Una tabella del genere aiuta tantissimo:

| Tipo di dato | Source of truth | Dove si legge | Dove si scrive |
|---|---|---|---|
| Utenti | Database | backend services | backend only |
| Sessione UI | localStorage / cookie | frontend | frontend/auth flow |
| Feature flags | backend config | frontend via API | backend/admin only |
| Search index | derivato | backend worker | worker only |

## 5. Documenta ownership e boundary

L’AI deve sapere chi è autorizzato a fare cosa.

Esempi:

- il frontend non costruisce regole di business
- il backend non restituisce payload senza schema
- i job asincroni non chiamano direttamente il DB bypassando il service layer
- i componenti UI usano solo client API centralizzati

Se questi boundary non sono scritti, l’AI li infrange facilmente.

## 6. Bundle di docs machine-friendly

Tolaria ha un’idea molto forte: genera un bundle di documentazione per agenti.

### Pattern da copiare
Partendo da `docs/` o da un sito documentale, genera:

- `agent-docs/index.md`
- `agent-docs/all.md`
- `agent-docs/search-index.json`
- `agent-docs/pages/...`
- eventualmente bundle per sezione

### Perché è utile

- un agente legge meno file sparsi
- puoi dare un punto di ingresso unico
- puoi fare ricerca semantica o testuale più semplice
- separi docs “per umani” da docs “per lookup veloce dell’agente”

### Output consigliato

```text
agent-docs/
  AGENTS.md
  index.md
  all.md
  search-index.json
  pages/
```

### Script consigliato
Nel tuo caso puoi usare:

- `scripts/build-agent-docs.py` se vuoi farlo in Python
- oppure uno script Node se la docs vive lato frontend

## 7. Shims per agenti multipli

Tolaria ha `CLAUDE.md` come shim verso `AGENTS.md`. Fai lo stesso con altri tool.

Esempio:

### `CLAUDE.md`
```md
@AGENTS.md
```

### `GEMINI.md`
```md
@AGENTS.md
```

### `COPILOT.md`
```md
@AGENTS.md
```

Così hai un solo documento da mantenere.

## 8. Aggiornamento docs: quando deve essere obbligatorio

Rendi esplicita questa policy:

### Aggiorna `docs/ARCHITECTURE.md` se cambi
- boundaries tra frontend e backend
- persistenza
- auth
- caching
- message flow
- deployment model

### Aggiorna `docs/ABSTRACTIONS.md` se cambi
- schema principali
- naming semantico
- service layer contracts
- event model
- lifecycle delle entità

### Crea ADR se cambi
- dipendenze strutturali
- strategie di storage
- protocolli di integrazione
- cross-cutting pattern

## 9. Completion comment / task summary template

Tolaria è molto forte anche nella parte di “cosa lascia scritto il dev/agente quando chiude il lavoro”.

Ti consiglio un template simile:

```md
## Completion summary
- Implemented:
- UX/API impact:
- Tests run:
- Coverage result:
- Security scan result:
- Docs updated:
- ADRs added/updated:
- Analytics added or not needed:
- Follow-ups:
```

Questo ti aiuta a rendere il lavoro AI auditabile.

## 10. Regole di scrittura docs che valgono oro

### Scrivi sempre
- source of truth
- invarianti
- ownership
- failure mode
- confini
- comandi reali
- esempi di cartelle e flussi

### Evita
- gergo interno non spiegato
- paragrafi vaghi
- decisioni implicite
- “si capisce dal codice”
- README onnivoro con tutto mescolato

## 11. La domanda guida

Quando scrivi docs, chiediti:

> Se un agente aprisse il repo da zero, riuscirebbe a capire **cosa leggere prima**, **quali regole non violare**, e **dove mettere correttamente una modifica**?

Se la risposta è no, la documentazione non è ancora abbastanza operativa.

