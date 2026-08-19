# 01 — Principi operativi da copiare

## 1. Perché Tolaria appare “pulito” anche essendo AI-first

Dall'analisi del repository emerge che la pulizia non dipende dal fatto che il codice sia perfetto, ma dal fatto che il progetto ha una **struttura decisionale esplicita**.

I pilastri sono questi:

### A. Le istruzioni agli agenti sono un artefatto di progetto
`AGENTS.md` non è un promemoria: è un contratto operativo.

Contiene:

- processo di sviluppo
- regole di commit/push
- policy TDD
- regole su localization, analytics, QA, docs
- release checklist
- policy di code health
- convenzioni UI

**Lezione da copiare**: nel tuo progetto crea un `AGENTS.md` che dica all'AI non solo *come scrivere codice*, ma *come lavorare dentro il repo*.

---

### B. La documentazione è divisa per scopo, non per gusto
Tolaria separa chiaramente:

- `docs/GETTING-STARTED.md` → come partire
- `docs/ARCHITECTURE.md` → principi, layer, flussi, ownership
- `docs/ABSTRACTIONS.md` → modelli, semantica, convenzioni di dominio
- `docs/adr/` → decisioni irreversibili o cross-cutting

**Lezione da copiare**: evita un unico README enorme. Dai ad AI e dev mappe diverse a seconda della domanda.

---

### C. I gate locali e quelli remoti si assomigliano
In Tolaria:

- `pre-commit` è veloce e blocca errori economici
- `pre-push` è pesante e replica quasi tutta la CI
- GitHub Actions esegue gli stessi gate in job separati

**Lezione da copiare**: non mettere nella CI regole che localmente non esistono, o viceversa. La frizione deve essere prevedibile.

---

### D. Le soglie sono a ratchet
Tolaria usa `.codescene-thresholds` come pavimento crescente.

Tradotto:

- la soglia non si abbassa
- se il progetto migliora, il nuovo livello diventa il minimo futuro
- il team è costretto a consolidare i miglioramenti

**Lezione da copiare**: qualunque metrica adotti, trattala come un ratchet.

---

### E. Definition of done molto concreta
La task non è “finita” quando il codice compila; è finita quando passano:

- test
- coverage
- lint/typecheck
- QA rilevante
- sicurezza/statica
- eventuale aggiornamento docs
- eventuale aggiornamento soglie di qualità

**Lezione da copiare**: scrivi una checklist finale che l’AI debba seguire sempre.

## 2. Operating model consigliato per il tuo progetto Python + React

## Regola 1 — Esiste un solo file canonico per gli agenti
Mantieni:

- `AGENTS.md` come sorgente principale
- eventuali `CLAUDE.md`, `GEMINI.md`, `COPILOT.md` come shim che puntano lì

Esempio di contenuto minimo:

```md
# AGENTS.md

## Before coding
- Read the task fully
- Read docs/ARCHITECTURE.md and docs/ABSTRACTIONS.md when touching structure
- Read relevant ADRs before changing cross-cutting behavior
- Capture baseline quality metrics before editing existing code

## Implementation loop
- TDD when practical
- Small commits
- No hidden shortcuts
- Reuse existing components/utilities before creating new ones

## Quality gates
- Lint
- Typecheck
- Unit/integration tests
- Coverage thresholds
- Security scan
- Docs update when architecture/abstractions changed

## Release checklist
- What changed
- How it was tested
- Coverage result
- Security scan result
- Docs updated or not needed
```

## Regola 2 — L’AI deve sapere dove guardare prima di toccare codice
Nel tuo `AGENTS.md` fai sempre riferimento a:

- `docs/GETTING-STARTED.md`
- `docs/ARCHITECTURE.md`
- `docs/ABSTRACTIONS.md`
- `docs/adr/`

Questo impedisce all'agente di improvvisare struttura e naming.

## Regola 3 — Ogni cartella importante ha una responsabilità netta
Evita root affollata. Mantieni solo il necessario.

Pattern consigliato:

```text
repo/
  frontend/
  backend/
  docs/
  scripts/
  .github/
  tests/
```

## Regola 4 — Le convenzioni devono battere le eccezioni
Tolaria è forte perché documenta convenzioni stabili.

Nel tuo caso:

- naming API coerente
- naming componenti coerente
- structure tests coerente
- separazione tra config runtime, settings locali, secrets
- pattern standard per feature flags, telemetry, migrations, background jobs

Più convenzioni hai, meno prompt custom devi dare all’AI.

## Regola 5 — I documenti devono parlare di invarianti
Scrivi meno frasi tipo “qui facciamo X perché ci piace” e più frasi tipo:

- “il database è la source of truth”
- “le mutation backend validano sempre con schema Pydantic”
- “il frontend non chiama mai servizi esterni direttamente”
- “gli handler HTTP non contengono business logic”
- “gli eventi analytics non contengono PII”

Le invarianti sono ciò che rende utile la documentazione per l’AI.

## 3. Definition of done consigliata

Copia lo spirito di Tolaria e adattalo così:

### Una feature è done solo se

- i test nuovi o aggiornati sono verdi
- `ruff`, `eslint`, `mypy`, `tsc` sono verdi
- la coverage minima non scende
- la smoke suite Playwright rilevante passa
- non introduci findings security High/Critical
- hai aggiornato docs se hai toccato architettura o astrazioni
- hai verificato che il file/area modificata non peggiori le metriche di qualità

## 4. Policy di commit e push da copiare

Tolaria forza un comportamento molto disciplinato. Per il tuo progetto:

- commit piccoli e frequenti
- `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- niente bypass di hook
- proteggi `main`
- se fai direct-to-main, i gate devono essere solidi
- se usi PR, rendi obbligatori gli stessi gate

## 5. Cosa NON copiare alla lettera

Alcune cose di Tolaria sono specifiche del prodotto:

- Tauri / Rust
- QA nativa desktop
- release artifact multipiattaforma desktop
- demo vault e cleanup di fixture filesystem-specifiche

Va copiata invece la forma del processo:

- docs prima del codice
- guardrail prima della feature
- pipeline chiara
- regole ripetibili da AI

## 6. Checklist finale per il tuo progetto

Prima di iniziare davvero il repo, chiediti:

- Qual è il source of truth dei dati?
- Dove stanno le invarianti architetturali?
- Dove si legge “come lavorare qui”?
- Quali check falliscono localmente? Quali in CI?
- Quale metrica non deve mai peggiorare?
- Quando va creata una ADR?
- Qual è il percorso minimo che un agente AI deve seguire prima di editare codice?

Se queste risposte non sono scritte, l’AI lavorerà per supposizioni.

