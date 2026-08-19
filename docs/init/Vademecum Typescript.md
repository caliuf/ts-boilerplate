# Vademecum per progetti TypeScript sviluppati con agenti AI

> Documento riutilizzabile come base per nuovi repository.
> **MUST** = requisito standard; **SHOULD** = default derogabile tramite ADR; **MAY** = facoltativo o dipendente dal progetto.
>
> Questa versione integra il Vademecum originale con il workflow *Guides, Gates, Guards*
> (sintesi degli articoli Refactoring in `docs/init/Refactoring/`) e con le contromisure
> ai failure modes tipici dello sviluppo interamente affidato ad agenti AI.
> Date e versioni citate sono point-in-time: **riverificarle a ogni bootstrap**.

---

## 1. Modello operativo: Guides, Gates, Guards (3G)

Tutto ciò che governa il lavoro dell'agente è di tre tipi. Questo modello è la chiave
di lettura dell'intero documento: ogni regola SHOULD essere classificabile in una delle
tre categorie, e il criterio guida è **spostare il più possibile dalle guide ai gate**.

| Tipo | Cosa è | Quando agisce | Affidabilità |
|------|--------|---------------|--------------|
| ↪️ **Guides** | Regole in linguaggio naturale: `AGENTS.md`, questo vademecum, ADR/PDR | Contesto iniziale del lavoro | **Non affidabili al 100%**: l'agente le ignora ~10% delle volte |
| 🔄 **Gates** | Controlli deterministici che **bloccano** codice non conforme: typecheck, lint, test, soglie di coverage, hook, CI | Durante il lavoro, a ogni commit/push/PR | Deterministici: la parte **più importante** |
| ↩️ **Guards** | Procedure di fallback (tipicamente schedulate) per ciò che sfugge ai gate | Dopo il lavoro | Ultima linea di difesa contro il degrado |

### Principi operativi

1. **Gate-first.** Se una regola può essere espressa come controllo automatico bloccante,
   non deve vivere solo come istruzione testuale. Le regole architetturali stanno in
   `dependency-cruiser`, non solo nei README.
2. **Soglie a cricchetto (ratchet).** Le soglie di qualità (coverage, code health, budget
   di tempo) possono solo **salire**, mai scendere. Dopo ogni miglioramento della salute
   del codebase, l'agente alza la soglia nello stesso lavoro o in uno dedicato.
3. **Divieto di aggiramento.** Un agente che fallisce ripetutamente un gate senza saper
   rimediare cerca workaround: salta test, abbassa soglie, estende ignore-list, usa
   `--no-verify`. Questo è il failure mode più pericoloso: i divieti devono essere
   espliciti nelle guide (§ 8), i file che definiscono i gate devono essere protetti
   (§ 11) e le guide devono insegnare **il rimedio**, non solo il divieto (TDD,
   procedure di fix, § 6).
4. **Mai lavorare sotto soglia.** Non si inizia lavoro nuovo su un codebase con gate
   rossi: prima si ripristina la salute, poi si sviluppa la feature.
5. **Loop engineering > prompt engineering.** L'intero processo è un loop da
   ingegnerizzare: retrospettive che aggiornano le guide, guard che creano task,
   cricchetti che alzano i gate. L'obiettivo non è la velocità iniziale ma
   **non degradare nel tempo**.
6. **L'umano decide** le tre cose ad alto leverage: *cosa* costruire, *come* lato
   prodotto, *cosa è abbastanza buono*. Tutto il resto è automatizzabile.
7. **Bias verso il progresso.** Meglio rilasciare ciò che è utile anche se imperfetto
   e iterare sul feedback reale, che inseguire la prima versione perfetta.

---

## 2. Scelte tecniche fondamentali

### Stack predefinito

|Area|Scelta|
|---|---|
|Linguaggio|Ultima versione stabile di **TypeScript**, fissata esattamente nel lockfile|
|Runtime di produzione|Ultima **Node.js Active LTS**|
|Runtime alternativo|**Bun** come target di compatibilità e candidato futuro|
|Package manager|**pnpm**, versione fissata in `packageManager`|
|Moduli|ESM esclusivamente, `"type": "module"`|
|Task runner pubblico|**just**|
|Architettura|Modular monolith, functional core / imperative shell, ports & adapters|
|Test|Vitest; Playwright se esiste una UI|
|Frontend web|React + Vite come default|
|SSR|Next.js solo quando SSR, SEO o routing server-side sono requisiti reali|
|Mobile|React Native + Expo quando nasce un caso d’uso mobile concreto|
|CI/CD|GitHub Actions|
|Hosting del codice|GitHub con ruleset, CodeQL, Dependabot e security scanning|

### Policy Node.js

Un nuovo progetto parte sempre con la **più recente Active LTS**, non con la release `Current`. Al momento della verifica, **Node 24 è Active LTS**; Node 26 è `Current` e il passaggio ad Active LTS è previsto per il **28 ottobre 2026**. Versione major e patch devono essere fissate in `.node-version`, mentre `package.json#engines` delimita la major supportata. ([github.com](https://github.com/nodejs/Release))

Gli upgrade:

1. avvengono tramite PR dedicata;
2. eseguono l’intera compatibility suite;
3. non vengono mescolati a feature applicative;
4. aggiornano immagini di deployment e documentazione.

### Policy TypeScript

Usare l’ultima versione stabile; al momento della verifica è **TypeScript 7.0**, pubblicato l’8 luglio 2026. TypeScript 7 introduce il compilatore nativo e miglioramenti tipici di 8–12 volte sui full build misurati da Microsoft. La versione 7.0 non espone ancora la precedente API programmatica: strumenti che ne dipendono possono richiedere temporaneamente TypeScript 6 affiancato, ma questa compatibilità va aggiunta solo davanti a una necessità concreta. ([devblogs.microsoft.com](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/))

Configurazione di base:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ESNext",

    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "useUnknownInCatchVariables": true,
    "noUncheckedSideEffectImports": true,

    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "rewriteRelativeImportExtensions": true
  }
}
```

Creare configurazioni separate per:

- backend Node: `module` e `moduleResolution` impostati a `NodeNext`;
- frontend: `moduleResolution: "Bundler"` e librerie DOM;
- core runtime-neutral: nessun tipo Node o DOM globale.

### TypeScript eseguibile e portabile

Il codice backend SHOULD utilizzare solo sintassi TypeScript eliminabile:

- niente `enum`: usare union e oggetti `as const`;
- niente namespace runtime;
- niente parameter properties;
- niente decorator richiesti dal framework;
- import type espliciti;
- estensioni esplicite negli import;
- niente alias `tsconfig.paths`: usare workspace package, `exports` e subpath import standard.

Node supporta stabilmente il type stripping nelle release recenti, ma non esegue typecheck e ignora il `tsconfig`; il controllo statico rimane quindi un passaggio separato e obbligatorio. Per casi semplici si può eseguire direttamente `.ts`; se un framework richiede trasformazioni complete, usare `tsx`. ([nodejs.org](https://nodejs.org/api/typescript.html))

### Compatibilità Bun

Node è il runtime autorevole. Bun è un **compatibility target**, non una dipendenza del dominio.

Regole:

- niente `Bun.*` o `bun:*` nel core;
- niente `node:*` nel dominio o nell’application layer;
- usare Web API standard: `fetch`, `URL`, `Request`, `Response`, stream e `AbortSignal`;
- filesystem, processi, worker, database e observability devono stare dietro adapter;
- aggiungere `just bun-smoke` per eseguire core e flussi portabili;
- fissare anche la versione Bun usata dalla compatibility suite.

Bun punta alla compatibilità Node, ma mantiene differenze in aree come `node:test`, `worker_threads`, inspector e `node:sqlite`. Il passaggio a Bun richiede pertanto uno spike e un’ADR, non una semplice sostituzione del comando di avvio. ([bun.sh](https://bun.sh/docs/runtime/nodejs-compat))

Lo spike deve verificare almeno:

- SDK esterni;
- subprocess e worker;
- streaming;
- tracing e propagazione del contesto;
- driver del database;
- crash recovery;
- test integration ed E2E;
- profiling e debugging;
- deployment.

Deno non è un target standard: supportare contemporaneamente tre runtime aumenterebbe il costo senza un beneficio dimostrato.

---

## 3. Architettura del repository

### Struttura consigliata

```text
.
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── GEMINI.md -> AGENTS.md              # opzionale
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── justfile
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── biome.json
├── .oxlintrc.json
├── knip.json
├── dependency-cruiser.config.*
│
├── docs/
│   ├── INDEX.md
│   ├── PROJECT.md
│   ├── architecture/
│   │   ├── OVERVIEW.md
│   │   ├── BOUNDARIES.md
│   │   └── adr/
│   ├── product/
│   │   ├── OVERVIEW.md
│   │   ├── GLOSSARY.md
│   │   ├── VISION.md                   # opzionale
│   │   └── pdr/
│   ├── development/
│   │   ├── CODING.md
│   │   ├── TESTING.md
│   │   ├── WORKFLOWS.md
│   │   └── SECURITY.md
│   └── operations/
│       └── runbooks/
│
├── apps/
│   ├── api/                            # se esiste un'API
│   ├── worker/                         # se esistono job
│   ├── web/                            # se esiste una UI
│   └── cli/                            # se esiste una CLI
│
├── packages/
│   ├── <bounded-context>/
│   │   ├── README.md
│   │   └── src/
│   │       ├── domain/
│   │       ├── application/
│   │       └── ports/
│   ├── contracts/
│   ├── adapter-<technology>/
│   └── testkit/
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── tools/
│   └── scripts/
│
├── .githooks/
│   ├── pre-commit
│   └── pre-push
│
└── .github/
    ├── copilot-instructions.md
    ├── instructions/
    ├── CODEOWNERS
    ├── dependabot.yml
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/
    └── workflows/
```

Non creare cartelle vuote o deployable ipotetici. Se non c’è una UI, `apps/web`, jsdom e Playwright browser non devono esistere.

### `docs/PROJECT.md`

È il primo documento che un agente deve leggere e deve contenere:

- obiettivo e non-obiettivi;
- tabella dei deployable esistenti;
- presenza o assenza di UI, API, worker, CLI e mobile;
- data store utilizzati;
- servizi esterni;
- flussi critici;
- classificazione dei dati;
- command map;
- principali ADR/PDR;
- budget di performance e test;
- stato delle funzionalità.

### Documenti di recap come *viste*

`docs/INDEX.md`, gli `OVERVIEW.md` e gli eventuali `ARCHITECTURE.md`/`ABSTRACTIONS.md`
sono **viste sullo stato corrente**: riportano solo le decisioni *attive*, in forma
sintetica. Evitano all'agente di rileggere decine di ADR/PDR per ricostruire l'esistente;
i decision record servono per lo zoom-in storico. Regola: una decisione `superseded`
sparisce dalle viste di recap e resta solo nei record.

### README dei package

Ogni package o bounded context deve documentare:

```text
Responsabilità
Non-responsabilità
Invarianti
API pubblica
Dipendenze consentite
Dipendenze vietate
Entry point
Test da eseguire
ADR/PDR rilevanti
```

### Regole di dipendenza

```text
domain
  ↓
application + ports
  ↓
adapters
  ↓
apps / composition root
```

- `domain` non importa framework, database, filesystem, rete o runtime.
- `application` orchestra il dominio attraverso porte.
- gli adapter implementano le porte.
- gli entrypoint compongono l’applicazione.
- i bounded context comunicano solo tramite API pubbliche e contratti espliciti.
- il codice di produzione non può importare `testkit`.
- niente dipendenze circolari.
- niente cartelle generiche `utils`, `helpers` o `common`.
- niente service locator, dependency-injection container o reflection senza ADR.
- niente grandi oggetti mutabili con stato nascosto.
- logging e observability sono porte: il dominio non conosce il logger e niente
  `console.log` nel codice di libreria (regola di lint).

Preferire:

- dati immutabili;
- branded ID;
- discriminated union;
- errori tipizzati: gli errori di dominio sono valori (union discriminate o tipo
  `Result`); le eccezioni restano per errori del programmatore e per il confine
  del processo;
- funzioni di transizione;
- exhaustive checking con `never`;
- dipendenze esplicite;
- clock, ID generator, random e I/O iniettati.

Tutte queste regole devono essere codificate in `dependency-cruiser`, non affidate soltanto alla documentazione (principio gate-first, § 1).

### Contratti e dati esterni

Ogni dato proveniente dall’esterno deve essere validato a runtime:

- HTTP;
- database;
- environment;
- file;
- queue;
- webhook;
- API esterne;
- output LLM.

È vietato:

```ts
const result = JSON.parse(raw) as SomeType;
```

Il progetto seleziona una sola libreria di schema tramite ADR. Tipi TypeScript e JSON Schema devono derivare dalla stessa definizione, senza duplicazione manuale.

Per la configurazione: i file `.env` reali sono sempre gitignored; nel repository
vive un `.env.example` con valori finti ma strutturalmente validi, e l'environment
viene validato all'avvio tramite lo schema scelto.

---

## 4. Tooling statico

|Scopo|Tool predefinito|
|---|---|
|Formattazione|Biome|
|Typecheck|`tsc --noEmit`|
|Lint veloce e type-aware|Oxlint + `oxlint-tsgolint`|
|Codice morto|Knip|
|Architettura e cicli|dependency-cruiser|
|Test|Vitest|
|E2E|Playwright|
|Property testing|fast-check, quando utile|
|Segreti|Gitleaks|
|Workflow GitHub|actionlint|
|Sicurezza GitHub Actions|zizmor|
|Markdown|markdownlint|
|Ortografia|cspell, con glossario di progetto|
|Link|lychee, preferibilmente nella slow lane|
|Shell|ShellCheck, se esistono script shell|
|Container/IaC|Hadolint e Trivy, se applicabili|
|Code health score|MAY: CodeScene, Codacy o equivalenti, esposti all'agente via MCP|

Biome rimane il formatter autorevole; Oxlint è il linter autorevole. Non duplicare sistematicamente le stesse regole nei due strumenti.

Oxlint supporta lint type-aware basato sul compilatore TypeScript nativo e quasi tutte le regole type-aware di typescript-eslint. Il suo `--type-check` è però ancora sperimentale: `tsc` resta l’autorità separata sul typecheck. Knip rileva file, export e dipendenze inutilizzati; dependency-cruiser applica regole sui layer e sui cicli. ([oxc.rs](https://oxc.rs/docs/guide/usage/linter/type-aware.html))

ESLint non viene installato per default. Può essere aggiunto tramite ADR soltanto se una regola o un plugin necessario non è coperto da Oxlint.

Gli strumenti di code health (ultima riga) non sono default perché commerciali, ma
rispondono a un'esigenza precisa del modello 3G: forniscono un **punteggio misurabile**
che rende applicabili la Boy Scout Rule misurata (§ 12) e le soglie a cricchetto su
dimensioni che lint e coverage non coprono (hotspot, complessità, accoppiamento).
Se adottati: gate di **0 issue sul codice nuovo** e punteggio pieno sul codice nuovo;
toccando codice preesistente si correggono anche le issue dei file toccati.

### Escape hatch

Queste costruzioni devono fallire il lint o richiedere una motivazione locale:

- `any`;
- `@ts-ignore`;
- `@ts-nocheck`;
- non-null assertion `!`;
- doppio cast `unknown as T`;
- disable comment generici;
- promise non gestite;
- `JSON.parse()` non validati;
- catch silenziosi;
- `default` che nascondono casi mancanti nelle state machine.

Ogni suppression deve avere una motivazione sulla stessa riga. Le suppression inutilizzate devono essere segnalate.

---

## 5. Interfaccia standard tramite `just`

Gli agenti devono usare esclusivamente le recipe pubbliche di `just`. Gli script `package.json` sono dettagli implementativi.

|Comando|Funzione|
|---|---|
|`just setup`|Installa dipendenze e hook|
|`just doctor`|Verifica runtime, tool e configurazione|
|`just dev`|Avvia lo sviluppo|
|`just fix`|Applica format e fix sicuri|
|`just format-check`|Verifica la formattazione|
|`just typecheck`|Typecheck completo|
|`just lint`|Lint type-aware|
|`just dead-code`|Knip|
|`just arch`|Regole architetturali e cicli|
|`just docs-check`|Markdown, spelling e link locali|
|`just workflows-check`|actionlint e zizmor|
|`just secrets`|Gitleaks|
|`just test-unit`|Piccola suite specialistica|
|`just test-integration`|Suite principale|
|`just test-related`|Test collegati ai file modificati|
|`just test-e2e`|Flussi end-to-end|
|`just test-live`|Servizi reali/LLM; mai implicito|
|`just coverage`|Suite con coverage|
|`just coverage-raise`|Alza i threshold di coverage al valore corrente (solo salita)|
|`just smoke`|Sottoinsieme critico di integrazione|
|`just bun-smoke`|Compatibility suite Bun|
|`just guards`|Esegue i guard in modalità report-only (§ 10)|
|`just precommit`|Controlli rapidi su staged/related|
|`just prepush`|Static analysis e integration principali|
|`just ci`|Esatta pipeline CI locale|

Budget consigliati:

```text
precommit:     ≤ 10 secondi
smoke:         ≤ 20 secondi
prepush:       ≤ 60 secondi
suite CI piena: ≤ 10 minuti
```

Se questi budget vengono superati, ottimizzare suite, fixture e confini architetturali prima di introdurre un nuovo task orchestrator. Il budget dei 10 minuti della suite completa è mantenuto dal testing guard (§ 10): un feedback loop lento degrada l'intero loop di sviluppo.

Gli hook versionati chiamano soltanto:

```sh
just precommit
just prepush
```

I gate devono vivere **in locale prima che in CI**: l'hook dà feedback immediato
all'agente, che può correggere subito nello stesso ciclo. La CI esegue le stesse
recipe e resta l'autorità finale, non il primo punto di rilevamento.

---

## 6. Strategia di testing: la “coppa”

```text
        pochi E2E
   moltissimi integration
       pochi unit
  ampia base di static checks
```

### TDD come ciclo di default

Il modo di lavoro predefinito dell'agente è **red → green → refactor**:

1. scrivere prima il test che descrive il comportamento atteso e **vederlo fallire**;
2. implementare il minimo per farlo passare;
3. rifattorizzare a test verdi.

Motivo determinante in un progetto AI-only: **un test che non è mai stato visto
fallire è sospetto** — può essere tautologico, non assertivo, o scollegato dal
codice sotto test. Il ciclo TDD è la contromisura strutturale ai test fantasma
(§ 9), oltre che il rimedio da insegnare quando un gate di coverage fallisce.

### Qualità dei test

Il riferimento sono i [test desiderata di Kent Beck](https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3).
In sintesi operativa, ogni test deve essere:

- **isolato**: nessuna dipendenza da altri test o dal loro ordine;
- **deterministico**: stesso input, stesso esito, sempre;
- **veloce**: niente attese, timer reali o I/O non necessaria;
- **comportamentale**: verifica comportamento osservabile, non struttura interna;
- **specifico**: un motivo di fallimento, un segnale chiaro;
- **leggibile**: si capisce l'intento senza leggere l'implementazione.

### Static checks

Devono fornire la prima linea di difesa:

- TypeScript strict;
- lint type-aware;
- formattazione;
- codice morto;
- dipendenze e cicli;
- regole architetturali;
- schemi e migration;
- workflow GitHub;
- segreti e vulnerabilità;
- artefatti generati non aggiornati.

### Unit test: pochi e specialistici

Usarli soprattutto per:

- algoritmi puri;
- parser;
- state machine complesse;
- calcoli combinatori;
- property-based testing;
- invarianti con molte combinazioni;
- casi limite difficili da riprodurre tramite un flusso completo.

Non testare getter, wiring banale o dettagli interni solo per aumentare la coverage.

### Integration test: la parte principale

Testare i casi d’uso attraverso la loro API pubblica, collegando più componenti reali:

- dominio;
- application service;
- adapter;
- database temporaneo;
- filesystem temporaneo;
- server HTTP locale;
- code o processi locali, quando economicamente possibile.

Mock e fake devono essere applicati ai **confini esterni**, non alle funzioni interne:

- provider LLM;
- email;
- pagamenti;
- servizi SaaS;
- clock e casualità;
- servizi troppo costosi o non deterministici.

Quando si testa una UI, non mockare la UI stessa: renderizzare componenti e flussi reali e simulare l’utente. Mockare eventualmente il confine HTTP mediante un fake server o MSW.

### E2E: pochi flussi ad alto valore

Coprono:

- journey utente critici;
- autenticazione e autorizzazione;
- integrazione frontend/backend;
- avvio reale dei processi;
- deployment smoke test;
- errori ad alto rischio.

Playwright deve conservare trace, screenshot e log sui fallimenti, non su ogni esecuzione.

**Keyboard-first** (progetti con UI): gli agenti sono deboli con il mouse e con i
dettagli pixel-perfect. Il prodotto SHOULD essere interamente usabile da tastiera e
i test E2E SHOULD preferire interazioni da tastiera quando equivalenti. In fase di
implementazione UI, usare sempre i componenti del design system del progetto, mai
elementi HTML grezzi, e studiare il linguaggio visivo esistente prima di aggiungerne.

### Test LLM, se presenti

La CI deterministica usa:

- provider fake;
- output registrati;
- validazione degli structured output;
- simulazione di timeout, rate limit e output malformati.

Le chiamate live appartengono a:

```text
just test-live
```

o a workflow schedulati. Non bloccano la normale fast lane salvo decisione esplicita.

### Regole generali

Per ogni bug fix (**zero-bugs policy**: i bug hanno priorità sulle feature e vanno
replicati e corretti al più presto):

1. riprodurre il problema con un test fallente;
2. implementare il fix;
3. verificare il caso originale e i casi adiacenti.

Per ogni feature:

- happy path;
- errori previsti;
- boundary case;
- permessi;
- retry/idempotenza, quando rilevanti.

I test devono verificare comportamento osservabile, non dettagli d’implementazione. Un refactoring che non cambia comportamento non dovrebbe richiedere la riscrittura della suite.

Vitest supporta test correlati ai file modificati, progetti distinti e coverage V8. La V8 coverage deve essere raccolta sotto Node, perché non funziona sul runtime JavaScriptCore di Bun; la compatibility suite Bun resta quindi separata dalla coverage. ([main.vitest.dev](https://main.vitest.dev/guide/projects))

### Coverage

La coverage è un guardrail, non l’obiettivo finale.

Policy:

- includere tutti i file sorgente, anche quelli mai importati dai test;
- monitorare line, statement, function e soprattutto branch coverage;
- conservare threshold versionati;
- impedire qualsiasi diminuzione rispetto a `main`;
- richiedere copertura significativa del codice modificato;
- documentare ogni esclusione;
- non imporre automaticamente il 100%;
- non scrivere test privi di valore soltanto per coprire una riga.

I threshold sono **a cricchetto** (§ 1): la recipe

```text
just coverage-raise
```

può alzarli automaticamente al valore corrente, ma nessun comando deve poterli
abbassare. Una modifica che abbassa i threshold nel diff è un segnale di
aggiramento del gate e deve bloccare la review.

Se disponibile nel piano GitHub, caricare un report Cobertura nella Code Quality API e configurare il ruleset con:

- minimum coverage;
- maximum coverage drop pari a zero.

GitHub può mostrare la coverage direttamente nelle PR e bloccare merge che ne riducono il livello. In assenza della funzionalità nativa, usare Codecov o uno script CI di confronto con `main`. ([docs.github.com](https://docs.github.com/en/code-security/how-tos/maintain-quality-code/restrict-code-coverage))

---

## 7. Documentazione e decision record

### La documentazione è infrastruttura per l'AI

In un progetto sviluppato da agenti, la documentazione non è (solo) per gli umani:
è **il meccanismo principale per iniettare buon giudizio nell'AI**. Le regole astratte
vengono ignorate con una certa frequenza; le decisioni passate, concrete e motivate,
vengono seguite con affidabilità molto maggiore (>90–95% nelle esperienze documentate).
Per questo i decision record non sono burocrazia: sono il modo in cui il progetto
accumula giudizio riutilizzabile.

### Gerarchia delle fonti

```text
PDR            → comportamento e decisioni di prodotto
ADR            → decisioni tecniche e architetturali
Test           → comportamento eseguibile
Codice         → implementazione
Runbook        → operazioni
AGENTS.md      → modalità di lavoro degli agenti
```

Evitare la duplicazione: ogni informazione ha una fonte canonica e gli altri documenti la collegano.

Usare Markdown, JSON e Mermaid. Non affidare informazioni importanti esclusivamente a immagini o diagrammi non testuali.

### ADR — Architecture Decision Record

Convenzioni:

- **una decisione per file**, nome `NNNN-titolo-breve.md`, numerazione monotona, ID mai riusati;
- un’ADR `active` **non viene mai modificata**: una nuova ADR la sostituisce marcandola `superseded`;
- l’ADR nasce **nello stesso commit** del codice che implementa la decisione;
- le ADR sono anche l'**artefatto di review** per l'umano: più leggibili del diff riga per riga.

Quando serve un’ADR: nuova dipendenza significativa, strategia di storage, astrazione
core, pattern cross-cutting, deroga a uno SHOULD di questo vademecum.
Quando **non** serve: bug fix, styling, refactoring che preservano il comportamento.

Formato:

```markdown
---
type: ADR
id: "0001"
title: "Titolo breve della decisione"
status: proposed   # proposed | active | superseded | rejected
date: YYYY-MM-DD
superseded_by: "0007"   # solo se status: superseded
---

## Context
Situazione, forze e vincoli che hanno portato alla decisione.

## Decision
**Cosa è stato deciso.** In una o due frasi, in grassetto.

## Options considered
- **Opzione A** (scelta): descrizione — pro / contro
- **Opzione B**: descrizione — pro / contro

## Consequences
Cosa diventa più facile o più difficile. Cosa triggererebbe una rivalutazione.

## Enforcement
Come la decisione è verificata automaticamente: lint, dependency-cruiser, test, CI.

## Migration / rollback
Piano di migrazione e rollback, se rilevanti.

## Advice
*(opzionale)* Input ricevuti prima della decisione.
```

### PDR — Product Decision Record

Serve una PDR quando viene introdotta o modificata una regola osservabile dall’utente
o dal business — **ogni decisione di prodotto genuinamente nuova**, indipendentemente
dalla dimensione del lavoro (un'epica può non introdurre nulla di nuovo, una piccola
storia può introdurre un pattern importante). Non serve per pattern già consolidati.
Un agente non deve inventare autonomamente una nuova regola di prodotto in presenza
di ambiguità: apre una PDR `proposed` o chiede.

Formato:

```markdown
---
type: PDR
id: "0001"
title: "Titolo breve"
status: proposed   # proposed | active | superseded | rejected
date: YYYY-MM-DD
superseded_by: ""   # solo se superseded
---

## Intent 👁️
Problema e valore per l'utente: cosa deve riuscire a fare.

## Design 🎨
Regole di prodotto decise, con esempi e casi limite.

## Tradeoffs ⚖️
Alternative considerate e scartate, con il perché.

## Non-obiettivi
Cosa questa decisione esclude esplicitamente.

## Acceptance criteria
Criteri di accettazione verificabili.

## Metriche
*(se applicabili)*
```

### Glossary e Vision

`docs/product/GLOSSARY.md` è l'equivalente di prodotto degli overview architetturali:
mappa le **astrazioni di dominio** (componenti UI ma anche concetti non-UI: workflow,
integrazioni, entità) descrivendo per ognuna perché esiste, a cosa serve e come si usa.
È un documento vivo, *derivato* dalla somma delle PDR attive, e va aggiornato quando
una PDR introduce o modifica un'astrazione. Il suo scopo operativo è ancorare le spec
generate dall'AI: con un glossario mantenuto, il rework sulle specifiche cala
drasticamente (evidenza riportata: dal 60% al 20%).

`docs/product/VISION.md` (MAY): principi di prodotto stabili, usati dall'AI per
brainstorm e bozze di spec. L'*intent* resta umano; la Vision gli dà forma verificabile.

---

## 8. Istruzioni per gli agenti AI

### Vincoli su `AGENTS.md`

- **Un solo file canonico**, sempre caricato dall'agente. Semplicità deliberata:
  niente frammentazione in decine di file di regole.
- **Corto: <200 righe.** Il contesto dell'agente è la risorsa scarsa. Ogni riga deve
  guadagnarsi il posto; il dettaglio vive nei documenti canonici linkati.
- **Mantenuto dall'AI, approvato dall'umano.** Periodicamente (retrospettiva, § 10)
  l'agente propone aggiornamenti basati sui problemi incontrati; entrano via PR.
  Serve una procedura di pulizia contro il *context rot*: regole mai violate perché
  ormai coperte da un gate vanno rimosse.
- Regola di trasferimento: **quando una guida si dimostra critica e violabile, la si
  trasforma in un gate** e la si rimuove o alleggerisce dalla guida.

### `AGENTS.md` minimale

```md
# Agent instructions

## Start here

1. Read `docs/PROJECT.md` and `docs/INDEX.md`.
2. Read the README of every package you will modify.
3. Read the relevant active ADRs and PDRs.
4. Use only root-level `just` recipes to build, test and validate changes.

## Working rules

- Keep the change limited to the requested scope. One task = one branch/worktree.
- Before starting, check that gates are green. Never start new work on a
  below-threshold codebase: restore health first, or report the blocker.
- Work test-first: red → green → refactor. For a bug, the first commit is a
  failing regression test. A test you have never seen fail is suspect.
- Leave the code you touch better than you found it, measured by the repo gates.
  Do NOT perform unrelated refactors or dependency upgrades.
- Do not add a dependency unless necessary; significant ones require an ADR.
- Preserve existing public APIs unless the task explicitly changes them.
- Keep domain and application code independent from frameworks and runtimes.
- Validate all external data at runtime.
- Do not use `any`, unchecked casts, `@ts-ignore`, non-null assertions or
  disable comments to make checks pass.
- Do not edit generated files directly.
- Before using a library API, verify it exists in the installed version
  (read its types/docs in `node_modules`); do not rely on memory.
- Do not introduce a product decision without a PDR, nor an architectural
  decision without an ADR, in the same commit as the code.

## Gate circumvention — prohibited

- NEVER use `--no-verify` or otherwise skip hooks.
- NEVER lower coverage or quality thresholds; they only ratchet up.
- NEVER extend ignore-lists, exclusions or suppressions to make a gate pass.
- If a gate fails and you cannot find the fix, stop and report the exact
  failure. Do not work around it.

## Testing

- Prefer integration tests through public APIs; unit tests only where clearer.
- Mock only external or non-deterministic boundaries.
- Tests must be isolated, deterministic, fast and behavioral.
- Never call live external services or LLMs unless explicitly requested.
- UI: use design-system components, never raw HTML elements; prefer
  keyboard-driven interactions.

## Validation

- During development run `just precommit`.
- Before completion run `just prepush`.
- If a required command cannot run, report the exact reason.
- Never claim a check passed unless you executed it successfully; quote the
  actual command output in the final report.

## Git safety

- Do not use destructive Git commands.
- Do not rewrite existing commits or force-push unless explicitly requested.
- Do not delete unrelated or untracked files.

## Final report

Report:
1. what changed;
2. tests added or changed;
3. commands executed, with verbatim results;
4. coverage and quality-score deltas;
5. ADR/PDR and documentation updated;
6. remaining risks or unresolved questions.
```

Creare:

```sh
ln -s AGENTS.md CLAUDE.md
ln -s AGENTS.md GEMINI.md
```

Se l’ambiente non supporta i symlink, generare copie e verificarne l’uguaglianza in CI.

GitHub Copilot riconosce sia `AGENTS.md` sia `.github/copilot-instructions.md`; supporta inoltre istruzioni path-specific in `.github/instructions`. Evitare contenuti duplicati o contraddittori. ([docs.github.com](https://docs.github.com/en/copilot/reference/custom-instructions-support))

### `.github/copilot-instructions.md`

Mantenerlo molto breve:

```md
Follow `/AGENTS.md` as the canonical development contract.

During code review, report only concrete correctness, security, regression,
architectural and test-coverage problems. Do not comment on formatting or
style handled automatically by repository tooling.
```

Le istruzioni path-specific vanno aggiunte solo quando esistono regole realmente differenti, per esempio:

```text
.github/instructions/web.instructions.md
.github/instructions/tests.instructions.md
.github/instructions/migrations.instructions.md
```

Non trasformare `AGENTS.md` in un manuale completo: deve indirizzare verso le fonti canoniche senza consumare inutilmente il contesto dell’agente.

---

## 9. Failure modes degli agenti e contromisure

Tabella di riferimento. La colonna 3G indica dove vive la contromisura principale.

| Failure mode | Causa | Contromisura | 3G |
|---|---|---|---|
| L'agente **ignora le istruzioni** (~10% delle volte) | Insito nei modelli | Regole critiche espresse come controlli automatici, non solo testo | Gate + Guard |
| L'agente **aggira i gate**: abbassa soglie, salta test, estende ignore-list, `--no-verify` | Troppi fallimenti senza rimedio noto | Divieti espliciti in `AGENTS.md`; soglie a cricchetto; guide che insegnano il rimedio (TDD, fix); file di gate protetti da CODEOWNERS; review del diff sui config | Guide + Gate |
| **Telephone game**: la richiesta viene fraintesa tra orchestratore e coding agent e viene implementata la cosa sbagliata | Passaggi di contesto | Task piccoli; spec ancorate a PDR/Glossary/Vision; review umana sull'artefatto (ADR/PDR) prima del codice | Guide |
| **Test fantasma**: test senza assertion, tautologici, scollegati dal codice | Pressione implicita verso il "verde" | TDD: il test deve essere visto fallire; branch coverage; review comportamentale dei test | Gate |
| **API allucinate**: uso di simboli di librerie che non esistono nella versione installata | Il modello si affida alla memoria | Regola esplicita di verifica su `node_modules`; typecheck e test falliscono l'uso inventato | Guide + Gate |
| **Completamento parziale dichiarato "done"**: feature cablata a metà | Ottimismo del modello | Definition of Done; integration test sul flusso completo; report con output verbatim | Gate |
| **Report allucinati**: "i test passano" senza averli eseguiti | Insito nei modelli | Regola evidence-based nel report; la CI riesegue e fa fede | Gate |
| **UI rotta** su dettagli: pixel-perfect, interazioni mouse, retrocompatibilità | Limiti attuali dei modelli | Keyboard-first; design system obbligatorio; trace Playwright sui fallimenti | Guide + Gate |
| **Docs che marciscono**: ADR mancanti, documenti obsoleti | Judgment call non deterministiche | Docs guard (§ 10) | Guard |
| **Context rot**: degrado in sessioni lunghe o per accumulo di regole morte | Contesto degradato/gonfiato | Task piccoli; `AGENTS.md` <200 righe; documenti di recap; retrospettive di pulizia | Guide + Guard |
| **Scope creep**: modifiche non correlate "già che ci si è" | Eccesso di zelo | Diff minimo; un task un branch; review del diff; divieto di refactor non correlati | Guide + Gate |
| **Degrado lento del sistema**: duplicazione, performance drift, suite lenta | Singole modifiche corrette in isolamento | Guard schedulati; budget di tempo; cricchetto | Guard |

---

## 10. Guards: procedure di fallback

I guard coprono ciò che i gate non possono catturare: *judgment call* (serviva un ADR?
una nuova stringa da localizzare? un evento analytics?) e *big picture* (una modifica
corretta in isolamento può degradare il sistema nel tempo).

Regole:

- i guard **non modificano direttamente il codice**: producono report e aprono
  issue/task nel backlog, che il normale flusso di lavoro raccoglie;
- girano tramite `just guards` in locale e tramite `scheduled.yml` in CI
  (frequenza notturna o settimanale); in assenza di scheduling, l'esecuzione
  manuale periodica resta obbligo del mantainer;
- ogni guard è report-only: nessun auto-fix, nessun commit automatico.

Guard predefiniti:

| Guard | Cosa rileva |
|---|---|
| **Docs guard** | Modifiche che avrebbero richiesto ADR/PDR; documenti di recap disallineati dalle decisioni attive; link e riferimenti rotti |
| **Testing guard** | Suite oltre il budget dei 10 minuti; test lenti a basso segnale da rimuovere o sostituire |
| **Health/refactoring guard** | Hotspot, duplicazione crescente, complessità; opportunità di alzare le soglie a cricchetto |
| **Performance guard** | Rallentamenti misurati da probe nel codice, se esistono probe |
| **Localization guard** | Stringhe non tradotte, se esiste i18n |

### Retrospettiva di processo

È un guard speciale, da eseguire con cadenza regolare (settimanale o a fine ciclo di
lavoro intenso): l'agente analizza i problemi incontrati — gate falliti ripetutamente,
istruzioni ignorate, workaround tentati, task riaperti — e propone aggiornamenti a
`AGENTS.md`, alle guide e ai guard stessi, tramite PR. È il meccanismo che chiude il
loop del § 1: il sistema di regole migliora in base all'evidenza, non per accumulo.

---

## 11. Integrazione GitHub

### Workflow minimi

```text
ci.yml
security.yml
e2e.yml              # se esiste una UI
scheduled.yml        # guards, slow test, live eval, compatibility
release.yml          # se esistono release
```

`ci.yml` deve reagire a:

- `pull_request`;
- push su `main`;
- `merge_group`, se viene usata la merge queue;
- `workflow_dispatch`.

Job consigliati:

```text
quality
integration-and-coverage
e2e                 # condizionale
bun-compatibility
dependency-review
```

`quality` esegue le recipe statiche aggregate. La CI usa installazione frozen e non modifica il lockfile.

`scheduled.yml` ospita l'esecuzione automatica dei guard (§ 10): apre issue con i
risultati, senza committare codice.

### Ruleset di `main`

Configurare:

- modifiche soltanto tramite PR;
- status check obbligatori;
- conversazioni risolte;
- nessun force push;
- nessuna cancellazione del branch;
- squash merge;
- approvazione umana per PR prodotte da agenti;
- Code Owner review per file critici;
- code scanning e coverage gate, quando disponibili;
- merge queue se operano molti agenti in parallelo.

Il default è un solo agente di coding alla volta: il collo di bottiglia è la
validazione umana, non la generazione. Il lavoro parallelo di più agenti (worktree,
merge queue) va introdotto solo quando la capacità di review lo sostiene.

Progetti personali a singolo mantainer MAY adottare un flusso trunk-based con commit
frequenti direttamente su `main` e hook come gate unico, ma la scelta va registrata
in un'ADR e i divieti di aggiramento restano identici.

I ruleset GitHub possono richiedere status check, risultati CodeQL, Code Quality e soglie di coverage. ([docs.github.com](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets?ref=jscarle.dev))

### `CODEOWNERS`

Proteggere almeno:

```text
/.github/
/AGENTS.md
/CLAUDE.md
/docs/architecture/
/docs/product/
/migrations/
/SECURITY.md
```

E, in quanto **file che definiscono i gate** (contromisura all'aggiramento, § 1 e § 9):

```text
/justfile
/.githooks/
/biome.json
/.oxlintrc.json
/knip.json
/dependency-cruiser.config.*
```

Qualunque file contenga threshold di coverage o budget va protetto allo stesso modo.

### Sicurezza

Abilitare, quando disponibili:

- CodeQL per JavaScript/TypeScript;
- Dependabot alerts;
- Dependabot security updates;
- Dependabot version updates per npm e GitHub Actions;
- Dependency Review;
- secret scanning;
- push protection.

Dependabot deve produrre PR separate e raggruppate per aggiornamenti compatibili. Gli aggiornamenti major richiedono review esplicita. La Dependency Review deve bloccare nuove vulnerabilità e, se opportuno, licenze non consentite. ([docs.github.com](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions))

Per GitHub Actions:

- permission di default read-only;
- permission elevate solo sul singolo job;
- action esterne fissate a full commit SHA;
- Dependabot incaricato di aggiornarle;
- evitare `pull_request_target` salvo revisione di sicurezza;
- usare OIDC per il deployment invece di credenziali cloud persistenti;
- usare protected environment per produzione.

GitHub permette di imporre il pin a SHA completo; OIDC consente di ottenere credenziali cloud temporanee senza conservare segreti a lunga durata. ([docs.github.com](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers))

Localmente e in CI:

- `actionlint` verifica sintassi e semantica dei workflow;
- `zizmor` rileva problemi di sicurezza nelle Actions;
- `Gitleaks` blocca segreti nello staged diff e scandisce la storia in CI. ([github.com](https://github.com/rhysd/actionlint))

### Artefatti CI

Conservare sui fallimenti:

- log;
- report JUnit;
- coverage;
- trace Playwright;
- screenshot;
- core dump;
- output di crash recovery.

Per container o binari pubblicati, generare SBOM e artifact attestation.

---

## 12. Workflow operativo di un agente

### Prima di modificare codice

0. Verificare che i gate siano verdi: **mai iniziare lavoro nuovo su un codebase
   sotto soglia**. Se sono rossi, ripristinare la salute o segnalare il blocco.
1. Leggere `PROJECT.md` e l’indice.
2. Identificare bounded context e API pubbliche coinvolte.
3. Leggere test, ADR e PDR rilevanti.
4. Verificare se la richiesta contiene ambiguità di prodotto (→ PDR `proposed` o domanda).
5. Definire un piano breve. Il task deve stare in una sessione di lavoro:
   se il piano non ci sta, spezzare il task prima di iniziare.
6. Creare branch o worktree dedicato.

### Durante la modifica

- lavorare in cicli TDD: red → green → refactor;
- produrre il diff minimo coerente;
- seguire pattern già presenti;
- non aggiungere nuove astrazioni senza necessità;
- eseguire continuamente `just precommit`;
- aggiornare test e documentazione insieme al codice;
- **Boy Scout Rule, riconciliata col diff minimo**: il codice *toccato* va lasciato
  migliore di come è stato trovato, misuratamente (issue dei gate risolte nei file
  modificati); refactoring di codice non correlato resta vietato;
- non silenziare check per ottenere una pipeline verde (§ 9);
- ADR/PDR nello stesso commit del codice che le implementa.

### Prima della consegna

- eseguire `just prepush`;
- controllare `git diff` per intero, inclusi i file di configurazione;
- verificare che non esistano file generati sporchi;
- verificare coverage e static analysis;
- aggiornare ADR/PDR se necessario;
- compilare il report finale con evidenze verificabili (output verbatim dei comandi).

---

## 13. Definition of Done

Una feature o un fix è completo solo se:

- [ ]  i criteri di accettazione sono soddisfatti;
- [ ]  il comportamento è coperto da test appropriati;
- [ ]  ogni bug fix possiede un regression test;
- [ ]  ogni nuovo test è stato **visto fallire** prima dell'implementazione;
- [ ]  happy path, errori e casi limite rilevanti sono coperti;
- [ ]  la coverage non è diminuita;
- [ ]  nessuna soglia è stata abbassata e nessun gate è stato aggirato; il diff non
       contiene modifiche ingiustificate a justfile, hook, config di lint/coverage;
- [ ]  non esistono nuovi warning o suppression ingiustificate;
- [ ]  non esistono file, export o dipendenze inutilizzati;
- [ ]  le regole architetturali passano;
- [ ]  gli schemi esterni sono validati a runtime;
- [ ]  documentazione, ADR e PDR sono aggiornate nello stesso commit;
- [ ]  `just prepush` passa;
- [ ]  il report finale cita l'output reale dei comandi eseguiti;
- [ ]  rischi e test non eseguiti sono dichiarati;
- [ ]  il diff non contiene modifiche estranee.

---

## 14. Strumenti e pratiche da non aggiungere per default

Non introdurre senza una necessità misurata e un’ADR:

- microservizi;
- Nx o Turborepo;
- Deno come terzo runtime;
- ESLint affiancato integralmente a Oxlint;
- Husky o lint-staged, dato che hook e comandi sono gestiti da `just`;
- dependency-injection container;
- ORM Active Record nel dominio;
- decorator e reflection;
- alias TypeScript non risolvibili dal runtime;
- test live nella normale CI;
- mandato di coverage al 100%;
- snapshot UI estesi;
- grandi barrel file;
- test che verificano dettagli d’implementazione;
- skill o file di regole frammentati in parallelo ad `AGENTS.md`;
- auto-fix da parte dei guard o commit automatici in CI.

---

## 15. Ordine di bootstrap di un nuovo progetto

1. Compilare `docs/PROJECT.md`.
2. Creare `docs/INDEX.md`, glossario e overview.
3. Registrare le prime ADR sullo stack e sull’architettura.
4. Registrare le prime PDR sullo scope di prodotto.
5. Creare soltanto i deployable realmente presenti.
6. Fissare Node Active LTS, TypeScript e pnpm.
7. Configurare strict TypeScript e confini statici dei package.
8. Installare Biome, Oxlint, Knip e dependency-cruiser.
9. Configurare Vitest e una prima integration suite.
10. Creare il `justfile` e gli hook.
11. Fissare i threshold iniziali di coverage come **baseline del cricchetto**.
12. Aggiungere `AGENTS.md` e i bridge per gli altri agenti.
13. Configurare GitHub Actions, ruleset, CODEOWNERS (inclusi i file di gate) e Dependabot.
14. Abilitare security scanning e coverage gate.
15. Aggiungere `bun-smoke`.
16. Configurare `scheduled.yml` con i guard e calendarizzare la prima retrospettiva.
17. Verificare che `just ci` funzioni su una clone pulita.

---

Il principio riassuntivo è:

> **Guides corte e vive, gate deterministici a cricchetto, guard che creano task invece
> di codice. Una sola interfaccia operativa, documentazione gerarchica come iniezione
> di giudizio, architettura verificata automaticamente, TDD come ciclo di default,
> molti integration test comportamentali e pochi E2E ad alto valore. L'obiettivo non
> è la velocità iniziale ma non degradare nel tempo.**

---

## Fonti

- Vademecum originale: versione precedente di questo file (chat GPT-5.6-Sol, in cronologia git).
- Sintesi del workflow AI di Luca Rossi (Refactoring): `docs/init/Refactoring/00-refactoring-ai-workflow.md`,
  in particolare [My AI Coding Workflow](https://refactoring.fm/p/my-ai-coding-workflow-b09) (modello 3G),
  [How I Run the Tolaria Project](https://refactoring.fm/p/how-i-run-the-tolaria-project) (validazione, zero-bugs),
  [How to make AI better at product](https://refactoring.fm/p/how-to-make-ai-better-at-product) (PDR, Glossary),
  [How to Orchestrate AI Workflows](https://refactoring.fm/p/how-to-orchestrate-ai-workflows) (agents as scaffolding).
- [Test Desiderata — Kent Beck](https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3).
- [Sensors for coding agents — Birgitta Bockeler](https://martinfowler.com/articles/sensors-for-coding-agents.html).
