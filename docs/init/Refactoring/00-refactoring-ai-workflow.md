# AI Coding Workflow — Vade mecum dagli articoli Refactoring

Sintesi operativa degli articoli di Luca Rossi (Refactoring) sullo sviluppo software con AI,
raccolti in questa cartella. L'autore mantiene [Tolaria](https://github.com/refactoringhq/tolaria),
un'app open source (~150K LOC + ~100K LOC di test) sviluppata **interamente da agenti AI**,
con ~2 ore/giorno di lavoro umano, ~28 commit/giorno, 99.1% crash-free e tempo medio di
bug-fix di 1 giorno.

> **Nota sulle fonti**: i file sono in ordine di pubblicazione. Dove il workflow è cambiato
> nel tempo, vale la versione più recente (indicata nel testo come *"oggi"*). I file
> `01` e `06` sono lo stesso articolo (il più recente e aggiornato sul coding workflow).

---

## 1. Il modello mentale: Guides, Gates, Guards (3G)

Il cuore del metodo. Gli input che si danno all'AI sono di tre tipi, in sequenza:

| Tipo | Cosa è | Quando agisce | Affidabilità |
|------|--------|---------------|--------------|
| ↪️ **Guides** | Regole e istruzioni (AGENTS.md, skills) | Contesto iniziale del lavoro | **Non affidabili al 100%**: l'AI a volte le ignora |
| 🔄 **Gates** | Controlli deterministici che **bloccano** il codice cattivo | Durante il lavoro, a ogni commit/push | Deterministici: la parte **più importante** |
| ↩️ **Guards** | Procedure di fallback (tipicamente notturne) per ciò che sfugge | Dopo il lavoro | Ultima linea di difesa contro il degrado |

Principio chiave: **più riesci a esprimere come gate deterministici (invece che come guide
in linguaggio naturale), meglio è**. Le istruzioni vengono ignorate (~10% delle volte,
per stima dell'autore); i gate no.

---

## 2. Guides: il file AGENTS.md

- Un unico file `AGENTS.md` (o `CLAUDE.md`) caricato sempre dall'agente. L'autore ha
  provato le "skills" separate ma non ha trovato benefici evidenti: **ha scelto la semplicità**
  di un solo file.
- **Mantenerlo corto**: <200 righe (in precedenza <150), con una procedura di pulizia
  periodica per evitare il *context rot*. Il file stesso è mantenuto dall'AI: a fine
  giornata l'agente fa una retrospettiva sui problemi incontrati e aggiorna il file.
- Contenuti tipici delle guide:
  - **TDD obbligatorio** — red → green → refactor, un ciclo per commit. Per i bug: prima
    il test di regressione che fallisce, poi il fix.
  - **Boy Scout Rule** — lascia il codice meglio di come l'hai trovato, **misurandolo**
    (score prima/dopo la modifica).
  - **Qualità dei test** — i [12 test desiderata di Kent Beck](https://medium.com/@kentbeck_7670/test-desiderata-94150638a4b3):
    isolati, deterministici, veloci, comportamentali, ecc.
  - **UI** — usare sempre i componenti del design system (es. shadcn/ui), mai elementi
    HTML grezzi; studiare il linguaggio visivo prima di implementare.
  - **Docs** — leggere ADR e doc di architettura prima di lavorare; scrivere nuovi ADR
    quando serve; marcare quelli obsoleti come *superseded*.
  - **Strumenti del progetto** — localizzazione, analytics (strumentare le feature con
    eventi), sicurezza, QA manuale via computer use.

### Attenzione: le guide da sole non bastano

Se l'agente fallisce ripetutamente un gate senza sapere come rimediare, si "frustra" e
cerca workaround: **salta test, abbassa le soglie, aggiunge file alle ignore-list**.
Succede più volte a settimana. Rimedi:

1. Nelle guide, insegnare *come* stare dentro i gate (TDD, boy scout rule, procedura di fix).
2. Rendere i gate **a cricchetto** (vedi sotto).
3. Vietare esplicitamente i workaround (`⛔ NEVER use --no-verify`, mai abbassare le soglie).

---

## 3. Sensors e Gates: qualità deterministica

**Sensors** = strumenti che misurano come sta andando il codice (termine da
[Birgitta Bockeler](https://martinfowler.com/articles/sensors-for-coding-agents.html)).
**Gates** = i sensori trasformati in controlli bloccanti.

Stack di riferimento (ogni tool ha un ruolo **non sovrapposto**):

- **[CodeScene](https://codescene.com/)** — code health (20+ fattori) + hotspot analysis
  (i file modificati più spesso devono avere qualità più alta). Gate: **10/10 sul codice nuovo**.
- **[Codacy](https://codacy.com/)** — singole issue con severità (security, performance,
  error-prone...). Gate: **0 issue sul codice nuovo**; toccando codice vecchio si fixano
  anche le issue esistenti. Esposto all'agente via MCP.
- **Coverage** — v8 (TS) + llvm-cov (Rust). Gate: **≥85%**.

Regole operative fondamentali:

- **Gate locali, non (solo) in CI**: hook di commit/push (es. Husky) danno feedback
  immediato all'agente, che può correggere subito. La CI resta come ultima risorsa.
- **Soglie a cricchetto (ratchet)**: dopo ogni miglioramento della salute del codebase,
  l'agente **alza** la soglia. Le soglie non scendono mai. In 4 mesi: da 9.5 a 10/10.
- **Mai iniziare lavoro nuovo su un codebase sotto soglia**: prima si rifattorizza, poi
  si sviluppa la feature.
- **Feedback loop veloce**: la suite di test deve restare sotto i 10 minuti; un Guard
  dedicato rimuove/sostituisce test costosi a basso segnale.
- **Problema risorse**: hook locali pesanti occupano la macchina. Soluzione adottata:
  hook locali eseguiti in remoto ([CircleCI Chunk Sidecars](https://circleci.com/blog/chunk-sidecars/)) —
  suite da 15 a 4 minuti e possibilità di usare più worktree in parallelo.

---

## 4. Guards: procedure di fallback

Per ciò che i gate non possono catturare:

- **Judgment calls** — serviva un ADR? Ci sono nuove stringhe da localizzare? Questa
  feature merita un evento analytics?
- **Big picture** — una modifica ok in isolamento può degradare il sistema nel tempo
  (duplicazione, performance drift, test suite lenta).

L'autore esegue **ogni notte** (via OpenClaw) questi Guard:

- **Refactoring Guard** — opportunità di miglioramento architetturale.
- **Performance Guard** — rallentamenti misurati da probe nel codice.
- **Localization Guard** — stringhe non tradotte.
- **Docs Guard** — modifiche che richiedevano ADR, retrofittati dove mancanti.
- **Testing Guard** — mantiene la pipeline <10 min.

I Guard **non modificano direttamente il codice**: creano task nel backlog, che l'agente
di coding raccoglie come tutto il resto. Scansionano sia il lavoro del giorno sia il
codebase nel complesso.

---

## 5. Documentazione come infrastruttura per l'AI

La documentazione non è per gli umani: è **il meccanismo principale per iniettare buon
giudizio nell'AI**. Funziona perché invece di regole astratte, mostra *come si è deciso
in passato*. L'AI la usa attivamente e la rispetta >90-95% delle volte.

### ADR (Architecture Decision Records)

- **Una decisione per file**, nome `NNNN-titolo-breve.md`, numerazione monotona.
- Una volta `active`, **mai modificare**: si crea un nuovo ADR che *supersede* il vecchio.
- Creati **nello stesso commit** del codice.
- Quando: nuova dipendenza, strategia di storage, astrazione core, pattern cross-cutting.
  Non per: bug fix, styling, refactor.
- Sono anche un ottimo **artefatto intermedio da revieware** per l'umano, al posto del
  codice riga per riga.

Template usato dall'autore:

```markdown
---
type: ADR
id: "0001"
title: "Short decision title"
status: proposed   # proposed | active | superseded | retired
date: YYYY-MM-DD
superseded_by: "0007"  # solo se status: superseded
---

## Context
Quale situazione ha portato a questa decisione? Quali forze e vincoli?

## Decision
**Cosa è stato deciso.** In una o due frasi, in grassetto.

## Options considered
- **Option A** (scelta): descrizione — pro / contro
- **Option B**: descrizione — pro / contro

## Consequences
Cosa diventa più facile o più difficile? Cosa triggererebbe una rivalutazione?

## Advice
*(opzionale)* Input ricevuti prima della decisione.
```

### Doc di recap (vista a 10.000 ft)

- `ARCHITECTURE.md`, `ABSTRACTIONS.md`, `GETTING-STARTED.md`: riassumono lo **stato
  corrente** (solo decisioni attive). Servono come *viste di database*: evitano all'AI
  di rileggere centinaia di ADR per ricostruire l'esistente. Gli ADR servono per lo zoom-in.
- `VISION.md`: principi di prodotto, usati dall'AI per brainstorm e spec di nuove feature.

---

## 6. Il lato Product: PDR e Glossary

Il coding è avanti anni luce rispetto al product nell'adozione AI (90%+ vs 9% dei team).
Motivo strutturale: **il product è più difficile da codificare** — richiede gusto e
giudizio (strategia + tattica), mentre il codice è *downstream* della direzione di
prodotto ed è deterministico, quindi testabile e governabile con gate.

Soluzione: replicare le pratiche che funzionano per il tech.

### PDR (Product Decision Records)

Equivalente product degli ADR. Registrano:

- **👁️ Intent** — cosa l'utente deve riuscire a fare.
- **🎨 Design** — come si è deciso di farlo.
- **⚖️ Tradeoffs** — alternative scartate e perché.

Merita un PDR **ogni decisione di prodotto genuinamente nuova** che vogliamo ricordare —
indipendentemente dalla dimensione del lavoro (un Epic può non introdurre nulla di nuovo,
una piccola story può introdurre un pattern importante). Non serve per pattern già consolidati.

### Glossary

L'equivalente product di ARCHITECTURE.md: mappa le **astrazioni di dominio** del prodotto
(per Tolaria: Sidebar, Note List, Breadcrumb Bar, ma anche concetti non-UI come
l'integrazione Git o il workflow capture/organize/archive). Per ognuna: perché esiste,
a cosa serve, come si usa. È una descrizione viva che evolve, *derivata* dalla somma
delle decisioni.

Dato di evidenza (Atono): spec generate dall'AI con supporto di glossary → **rework dei
PM dal 60% al 20%**. Il 60% di rework è il motivo per cui molti PM hanno abbandonato l'AI.

### Processo product risultante

1. **Intent umano** — il *perché* resta 100% umano (per ora).
2. L'AI genera **draft di spec** ancorati a Glossary + PDR + VISION.
3. A seconda di maturità e rischio: l'AI fa un primo passaggio/prototipo che informa il
   giudizio, oppure l'umano rifinisce la spec prima dell'implementazione.
4. Review e iterazione sull'implementazione.
5. Ship **includendo** nuovi PDR e aggiornamenti al Glossary.

---

## 7. Orchestrazione del progetto: input → backlog → validazione → release

### Input: separare bug e feature

- **Bug** — politica **zero-bugs**: replicare e fixare ASAP, poco da decidere.
  Vivono su GitHub Issues (+ crash report da Sentry via MCP).
- **Feature request** — servono voto, priorità, spec, allineamento alla visione.
  Vivono su una product board separata (Canny).
- Un agente (OpenClaw) esegue **procedure di intake ogni ora**: routing, deduplica,
  normalizzazione tra canali, creazione task, notifica all'umano (Telegram). Risposte
  automatiche agli utenti per comunicazioni operative: ok.

### Backlog unico, agente singolo

- Tutto converge in **una sola board** (Todoist): colonne Draft (feature spec-cate dall'AI),
  Contributor PR, Someday; i bug entrano direttamente in Open.
- **Un solo agente di coding** (Codex), sequenziale, 24/7, su una macchina dedicata
  (Mac Mini). Controintuitivo ma razionale: a ~40 min/task produce **30-40 task/giorno
  da revieware** — già oltre la capacità umana. Il collo di bottiglia non è la generazione.

### Validazione: il vero bottleneck

Ogni task completato va in una alpha release e in "in review". L'umano reviewa contro
l'ambiente reale, con 4 esiti:

1. **Buono** → da rilasciare.
2. **~90% buono** → ritocchi finali fatti dall'umano con l'agente sul laptop.
3. **Incompleto ma progresso utile** → *bias verso il progresso*: rilascia comunque e
   apri un task di miglioramento. Il feedback degli utenti evolve il prodotto più in
   fretta della prima versione perfetta.
4. **Sbagliato** → "to rework" con commento QA su cosa fixare.

Pratiche correlate:

- **Spec leggere**: con ADR/principi/vision ben documentati, l'AI indovina già molto;
  meglio lasciarla lavorare e correggere in review.
- **Cedere controllo progressivamente**: "la cosa giusta è rilasciare sempre un po' più
  controllo di quanto sia confortevole — e questo confine si sposta di continuo".
- Ritmo umano: review a batch (mattina, dopo pranzo, sera), ~2h/giorno totali, 90% via
  **voice notes**.

### Release

- **Alpha** per ogni commit (per testare), **stable** al massimo 1/giorno, nominata per
  data (`v2026.5.4`).
- Procedura di release interamente gestita dall'agente orchestratore: git, release notes
  human-readable, e **cleanup** — chiusura con commento di tutte le issue/richieste
  originali sui vari canali. Le issue Sentry si chiudono ottimisticamente e si riaprono
  se ricompaiono.
- Le tre decisioni umane ad alto leverage: **cosa** costruire, **come** (lato prodotto),
  **cosa è abbastanza buono**.

---

## 8. Orchestrazione dei workflow: da AI-puro a ibrido

I workflow "100% AI" (istruzioni in linguaggio naturale a un agente in cron) sono veloci
da prototipare ma falliscono nel modo peggiore: **silenziosamente, lasciando stato sporco,
senza retry né recovery**.

Modello: **agents as scaffolding** (Will Larson) — l'agente è il primo passaggio per
scoprire come il workflow dovrebbe essere; poi si estrae e si consolida in codice
deterministico.

**Percorso di maturità in 4 stadi:**

1. **Agent-first** — tutto in un loop; prototipazione rapida, opaco da debuggare.
2. **Isolare le parti deterministiche** — fetch, validate, store diventano codice
   esplicito; l'AI resta per i judgment call.
3. **Orchestrazione strutturata** — DAG/event-driven con retry, lineage, osservabilità;
   l'AI diventa un tipo di task tra tanti.
4. **Composabilità AI-driven** — gli LLM generano/modificano le definizioni dei workflow:
   prompt in linguaggio naturale → lavoro strutturato e semi-deterministico.

Divisione del lavoro:

- **L'orchestrazione vince su tutto ciò che è infra** — osservabilità, affidabilità,
  scheduling, approval human-in-the-loop, validazione di output strutturati.
- **L'AI vince sul messy stuff** — classificazione, summarization, judgment calls, tutto
  ciò per cui non puoi scrivere codice.

Requisiti della piattaforma di orchestrazione in ottica AI: **code-first** (workflow
dichiarativi in codice, non GUI), **API/CLI-first**, **open source**.

---

## 9. Failure modes noti (e contromisure)

| Problema | Causa | Contromisura |
|----------|-------|--------------|
| L'AI **ignora le istruzioni** (~10% delle volte) | Insito nei modelli | Gates deterministici + Guards; non si può andare completamente hands-off |
| L'agente **aggira i gate** (abbassa soglie, skippa test, ignore-list) | Troppi fallimenti senza guida | Guide che insegnano il rimedio; divieti espliciti; soglie a cricchetto |
| **Telephone game**: l'orchestratore fraintende l'idea → il coding agent implementa la cosa sbagliata | Passaggi di contesto tra agenti | Spec ancorate a PDR/Glossary/Vision; review umana |
| Feature consegnate **rotte** su pixel-perfect, uso del mouse, retrocompatibilità | Limiti attuali dei modelli | QA via tastiera (l'AI è scarsa col mouse); principio **keyboard-first** per tutto; computer use |
| **Docs che marciscono** (ADR mancanti, doc obsolete) | Judgment call non deterministiche | Docs Guard notturno che retrofitta |
| **Costi fuori controllo** | Contesto eccessivo, doppi passaggi di QA | Vedi sotto |

---

## 10. Costi ed efficienza

Evoluzione dei costi dell'autore (utile come benchmark):

- Primi 30 giorni senza ottimizzazioni: **~$4.000** (usage metered dell'orchestratore).
- Dopo ottimizzazione: ~$50-60/giorno + abbonamento.
- Setup attuale: **~$200/mese** (piani flat Codex Pro ×2: uno per la swimlane di coding
  24/7, uno per orchestratore + lavoro occasionale).

Leve di ottimizzazione:

1. **Ridurre il contesto** caricato a ogni sessione (file di regole corti, doc di recap).
2. **Procedure chiare e corte**.
3. **Telemetria** dell'orchestratore per trovare i task più costosi.
4. **Eliminare doppi passaggi**: il secondo giro di QA (screenshot + navigazione) era
   costosissimo e trovava pochi bug in più → rimosso.
5. Spostare il lavoro deterministico fuori dall'LLM (vedi §8).

---

## 11. Strumenti e convenzioni operative (stato più recente)

- **Coding agent**: Codex (GPT-5.x) — scelto dopo Claude Code perché segue meglio le
  istruzioni, è più proattivo sui problemi di design, "one-shotta" più spesso.
  *(Nota: gli articoli più vecchi descrivono il setup con Claude Code — superato.)*
- **Orchestratore**: OpenClaw (spec, intake, guards, release, monitoraggio/riavvio
  dell'agente di coding). I due lavorano **in modo asincrono su cose separate**:
  l'orchestratore ha contesto *broad* (product), il coding agent ha contesto *deep* (tech).
- **Loop engineering > prompt engineering** (Boris Cherny): "il mio lavoro è scrivere
  loop". Un loop deve girare indefinitamente → spinge a *systems thinking*: affidabilità,
  sostenibilità, anti-divergenza.
- **Git**: lavoro su `main`, niente branch né PR; commit ogni 20-30 min; mai `--no-verify`;
  un task non è done finché il push non passa gli hook.
- **Commento di completamento** su ogni task: cosa è stato implementato, QA eseguito,
  refactoring fatti per i gate, ADR nuovi/aggiornati, docs aggiornate, score finali.
- **Context engine** (Unblocked): indicizza codice, ADR e history; l'agente lo interroga
  via MCP invece di grep-pare al volo — più veloce e accurato.
- **Analytics**: Sentry (tech) + PostHog (product), entrambi opt-in e sanitizzati.

---

## 12. Takeaway essenziali

1. **Guides, Gates, Guards**: istruzioni (inaffidabili), controlli deterministici
   bloccanti (la parte più importante), procedure di recupero notturne.
2. **Documenta le decisioni, non solo il codice**: ADR + doc di recap per il tech;
   PDR + Glossary per il product. È così che si "inietta" giudizio nell'AI.
3. **Un agente basta**: il bottleneck è la validazione umana, non la generazione.
4. **Bias verso il progresso**: rilascia ciò che è utile anche se imperfetto; itera col
   feedback reale.
5. **Agenti come scaffolding**: prototipa con AI, poi consolida in codice deterministico.
6. **Tutto il processo è un loop da ingegnerizzare**: retrospettive che aggiornano le
   regole, soglie a cricchetto, guards che creano task. L'obiettivo non è la velocità
   iniziale ma **non degradare nel tempo**.
7. **L'umano decide**: cosa costruire, come (prodotto), cosa è abbastanza buono. Tutto
   il resto è automatizzabile.

---

## Fonti

| # | Articolo | Contenuto principale |
|---|----------|---------------------|
| 01/06 | [My AI Coding Workflow](https://refactoring.fm/p/my-ai-coding-workflow-b09) | Modello 3G, passaggio a Codex, costi attuali *(workflow più aggiornato)* |
| 02 | [Updates to my AI Coding Workflow](https://refactoring.fm/p/updates-to-my-ai-coding-workflow) | Split orchestratore/coding agent, ADR, CLAUDE.md completo, failure modes |
| 03 | [Introducing Tolaria](https://refactoring.fm/p/introducing-tolaria) | Principi: file, markdown, git, open source; repo come artefatto vivente |
| 04 | [How I Run the Tolaria Project](https://refactoring.fm/p/how-i-run-the-tolaria-project) | Input/backlog/validazione/release, agente singolo, zero-bugs policy |
| 05 | [How to Orchestrate AI Workflows](https://refactoring.fm/p/how-to-orchestrate-ai-workflows) | Agents as scaffolding, percorso di maturità in 4 stadi |
| 07 | [How to make AI better at product](https://refactoring.fm/p/how-to-make-ai-better-at-product) | PDR, Glossary, processo product, loop engineering |
| 08 | [Introducing the Tolaria Alliance](https://refactoring.fm/p/introducing-the-tolaria-alliance) | Stack aggiornato: CodeScene, Codacy, CircleCI Sidecars, Unblocked |
