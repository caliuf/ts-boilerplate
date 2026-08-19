
[GPT-5.6-Sol](https://poe.com/chat/91j5pju6t0m5xcj5k3): Chat di Creazione


# Vademecum generico per progetti TypeScript sviluppati con agenti AI

> Documento riutilizzabile come base per nuovi repository.  
> **MUST** = requisito standard; **SHOULD** = default derogabile tramite ADR; **MAY** = facoltativo o dipendente dal progetto.

## 1. Scelte tecniche fondamentali

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

## 2. Architettura del repository

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

Preferire:

- dati immutabili;
- branded ID;
- discriminated union;
- errori tipizzati;
- funzioni di transizione;
- exhaustive checking con `never`;
- dipendenze esplicite;
- clock, ID generator, random e I/O iniettati.

Tutte queste regole devono essere codificate in `dependency-cruiser`, non affidate soltanto alla documentazione.

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

---

## 3. Tooling statico

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

Biome rimane il formatter autorevole; Oxlint è il linter autorevole. Non duplicare sistematicamente le stesse regole nei due strumenti.

Oxlint supporta lint type-aware basato sul compilatore TypeScript nativo e quasi tutte le regole type-aware di typescript-eslint. Il suo `--type-check` è però ancora sperimentale: `tsc` resta l’autorità separata sul typecheck. Knip rileva file, export e dipendenze inutilizzati; dependency-cruiser applica regole sui layer e sui cicli. ([oxc.rs](https://oxc.rs/docs/guide/usage/linter/type-aware.html))

ESLint non viene installato per default. Può essere aggiunto tramite ADR soltanto se una regola o un plugin necessario non è coperto da Oxlint.

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

## 4. Interfaccia standard tramite `just`

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
|`just smoke`|Sottoinsieme critico di integrazione|
|`just bun-smoke`|Compatibility suite Bun|
|`just precommit`|Controlli rapidi su staged/related|
|`just prepush`|Static analysis e integration principali|
|`just ci`|Esatta pipeline CI locale|

Budget consigliati:

```text
precommit:  ≤ 10 secondi
smoke:      ≤ 20 secondi
prepush:    ≤ 60 secondi
```

Se questi budget vengono superati, ottimizzare suite, fixture e confini architetturali prima di introdurre un nuovo task orchestrator.

Gli hook versionati chiamano soltanto:

```sh
just precommit
just prepush
```

La CI deve eseguire le stesse recipe. I check locali migliorano il feedback loop, ma GitHub rimane l’autorità.

---

## 5. Strategia di testing: la “coppa”

```text
        pochi E2E
   moltissimi integration
       pochi unit
  ampia base di static checks
```

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

Per ogni bug fix:

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

Una recipe separata può alzare automaticamente i threshold:

```text
just coverage-raise
```

ma nessun comando deve poterli abbassare automaticamente.

Se disponibile nel piano GitHub, caricare un report Cobertura nella Code Quality API e configurare il ruleset con:

- minimum coverage;
- maximum coverage drop pari a zero.

GitHub può mostrare la coverage direttamente nelle PR e bloccare merge che ne riducono il livello. In assenza della funzionalità nativa, usare Codecov o uno script CI di confronto con `main`. ([docs.github.com](https://docs.github.com/en/code-security/how-tos/maintain-quality-code/restrict-code-coverage))

---

## 6. Documentazione e decision record

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

Formato minimo:

```text
Titolo e ID
Stato: Proposed | Accepted | Superseded | Rejected
Contesto
Decisione
Alternative considerate
Conseguenze positive e negative
Modalità di enforcement
Piano di migrazione/rollback
ADR sostituite o correlate
```

Un’ADR accettata non viene riscritta per modificare la storia: una nuova ADR la sostituisce.

### PDR — Product Decision Record

Formato minimo:

```text
Titolo e ID
Stato
Problema e valore utente
Regole di prodotto decise
Esempi
Casi limite
Non-obiettivi
Criteri di accettazione
Metriche, se applicabili
PDR sostituite o correlate
```

Serve una PDR quando viene introdotta o modificata una regola osservabile dall’utente o dal business. Un agente non deve inventare autonomamente una nuova regola di prodotto in presenza di ambiguità.

---

## 7. Istruzioni per gli agenti AI

### `AGENTS.md` minimale

```md
# Agent instructions

## Start here

1. Read `docs/PROJECT.md` and `docs/INDEX.md`.
2. Read the README of every package you will modify.
3. Read the relevant accepted ADRs and PDRs.
4. Use only root-level `just` recipes to build, test and validate changes.

## Working rules

- Keep the change limited to the requested scope.
- Do not perform unrelated refactors or dependency upgrades.
- Do not add a dependency unless necessary; explain the reason in the PR.
- Preserve existing public APIs unless the task explicitly changes them.
- Keep domain and application code independent from frameworks and runtimes.
- Validate all external data at runtime.
- Do not use `any`, unchecked casts, `@ts-ignore`, non-null assertions or
  disable comments to make checks pass.
- Do not edit generated files directly.
- Do not introduce a product decision without updating or creating a PDR.
- Do not introduce an architectural decision without updating or creating an ADR.

## Testing

- For a bug, first add a regression test that reproduces it.
- For a feature, test observable behavior, errors and relevant edge cases.
- Prefer integration tests; use unit tests only where they provide clearer value.
- Mock only external or non-deterministic boundaries.
- Never call live external services or LLMs unless explicitly requested.

## Validation

- During development run `just precommit`.
- Before completion run `just prepush`.
- If a required command cannot run, report the exact reason.
- Never claim a check passed unless it was executed successfully.

## Git safety

- Do not use destructive Git commands.
- Do not rewrite existing commits or force-push unless explicitly requested.
- Do not delete unrelated or untracked files.
- One task must use one branch or worktree.

## Final report

Report:
1. what changed;
2. tests added or changed;
3. commands executed and results;
4. coverage impact;
5. documentation or decisions updated;
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

## 8. Integrazione GitHub

### Workflow minimi

```text
ci.yml
security.yml
e2e.yml              # se esiste una UI
scheduled.yml        # slow test, live eval, compatibility
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

`quality` esegue `just check` o le recipe statiche equivalenti. La CI usa installazione frozen e non modifica il lockfile.

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

## 9. Workflow operativo di un agente

### Prima di modificare codice

1. Leggere `PROJECT.md` e l’indice.
2. Identificare bounded context e API pubbliche coinvolte.
3. Leggere test, ADR e PDR rilevanti.
4. Verificare se la richiesta contiene ambiguità di prodotto.
5. Definire un piano breve.
6. Creare branch o worktree dedicato.

### Durante la modifica

- produrre il diff minimo coerente;
- seguire pattern già presenti;
- non aggiungere nuove astrazioni senza necessità;
- eseguire continuamente `just precommit`;
- aggiornare test e documentazione insieme al codice;
- non silenziare check per ottenere una pipeline verde;
- non modificare codice estraneo “già che ci si è”.

### Prima della consegna

- eseguire `just prepush`;
- controllare `git diff`;
- verificare che non esistano file generati sporchi;
- verificare coverage e static analysis;
- aggiornare ADR/PDR se necessario;
- compilare il report finale con evidenze verificabili.

---

## 10. Definition of Done

Una feature o un fix è completo solo se:

- [ ]  i criteri di accettazione sono soddisfatti;
- [ ]  il comportamento è coperto da test appropriati;
- [ ]  ogni bug fix possiede un regression test;
- [ ]  happy path, errori e casi limite rilevanti sono coperti;
- [ ]  la coverage non è diminuita;
- [ ]  non esistono nuovi warning o suppression ingiustificate;
- [ ]  non esistono file, export o dipendenze inutilizzati;
- [ ]  le regole architetturali passano;
- [ ]  gli schemi esterni sono validati a runtime;
- [ ]  documentazione, ADR e PDR sono aggiornate;
- [ ]  `just prepush` passa;
- [ ]  rischi e test non eseguiti sono dichiarati;
- [ ]  il diff non contiene modifiche estranee.

---

## 11. Strumenti e pratiche da non aggiungere per default

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
- test che verificano dettagli d’implementazione.

---

## 12. Ordine di bootstrap di un nuovo progetto

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
11. Aggiungere `AGENTS.md` e i bridge per gli altri agenti.
12. Configurare GitHub Actions, ruleset, CODEOWNERS e Dependabot.
13. Abilitare security scanning e coverage gate.
14. Aggiungere `bun-smoke`.
15. Verificare che `just ci` funzioni su una clone pulita.

Il principio riassuntivo è:

> **Una sola interfaccia operativa, documentazione corta e gerarchica, architettura verificata automaticamente, static checks molto ampi, pochi unit test specialistici, molti integration test comportamentali e pochi E2E ad alto valore.**