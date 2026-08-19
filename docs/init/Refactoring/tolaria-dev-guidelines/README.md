# Dev Guidelines — blueprint estratto da Tolaria

Questa directory distilla **ciò che conta davvero** del progetto `Tolaria`: non il dominio applicativo, ma il modo in cui la codebase viene resa governabile da AI e umani attraverso tooling, pipeline, guardrail e documentazione operativa.

## Obiettivo

Se vuoi creare una codebase **Python + React** ospitata su GitHub con un livello simile di pulizia, questa cartella ti dà un modello pratico per:

- impostare una repository leggibile da AI
- rendere i controlli di qualità automatici e difficili da aggirare
- tenere sincronizzati hook locali e CI GitHub
- documentare architettura e astrazioni in modo utile durante l'implementazione
- costruire una pipeline che favorisca refactor continui invece di accumulare debito

## Cosa ho preso da Tolaria

Dall'analisi del repository emergono alcuni pattern molto forti:

1. **Un file canonico di istruzioni per agenti**: `AGENTS.md`
2. **Documenti architetturali stabili**: `docs/ARCHITECTURE.md`, `docs/ABSTRACTIONS.md`, `docs/GETTING-STARTED.md`
3. **ADRs obbligatorie per decisioni strutturali**: `docs/adr/`
4. **Hook locali seri**: `pre-commit` veloce, `pre-push` pesante
5. **CI GitHub che replica i gate locali**
6. **Threshold di qualità a ratchet**: si può solo migliorare
7. **Coverage enforced**
8. **Security/static analysis come gate di rilascio**
9. **Docs build e release pipeline separate**
10. **Bundle di documentazione machine-friendly per agenti AI**

## Come leggere questa cartella

1. `01-principi-operativi.md`  
   Il modello mentale da copiare.
2. `02-stack-consigliato-python-react.md`  
   Lo stack consigliato per replicare il livello di tooling su Python + React.
3. `03-pipeline-e-guardrail.md`  
   Hook, CI, coverage, security scan, ratchet, release discipline.
4. `04-documentazione-per-ai.md`  
   Come scrivere una codebase che un agente AI possa navigare bene.
5. `05-bootstrap-da-zero.md`  
   Piano operativo per partire da repo vuota.

## Tesi centrale

La lezione più importante di Tolaria è questa:

> non devi copiare la sua tecnologia; devi copiare la sua **disciplina esplicita**.

In pratica:

- meno regole implicite, più contratti scritti
- meno "ci penseremo in review", più check automatici
- meno documentazione narrativa, più documentazione operativa
- meno libertà anarchica nel repo, più percorsi standardizzati
- meno “l’AI capirà”, più “l’AI segue istruzioni verificabili”

## Non-negotiable che vale la pena replicare

- Un **source of truth** per le istruzioni agli agenti
- Una **definition of done** scritta e checkabile
- **Hook locali** che bloccano errori banali prima del push
- **CI parallela** con job separati per frontend, backend, e2e, docs, security
- **Coverage minima** con failure hard
- **Code health ratchet**: non abbassare mai la soglia
- **ADRs** per decisioni architetturali vere
- **Docs update policy** quando tocchi astrazioni o architettura
- **Bundle docs per AI** per ridurre contesto disperso
- **Shims per diversi agenti** che puntano tutti alle stesse istruzioni

## Adattamento alla tua situazione

Per il tuo progetto Python + React, il mio consiglio è:

- backend: `FastAPI` + `uv` + `pytest` + `ruff` + `mypy`
- frontend: `React` + `TypeScript` + `Vite` + `Vitest` + `Playwright`
- repo: monorepo GitHub con `frontend/`, `backend/`, `docs/`, `.github/workflows/`, `scripts/`
- hook: orchestrati dal root del repo
- quality gates: coverage, lint, typecheck, e2e smoke, CodeScene/Codacy o equivalenti

Se dovessi partire davvero oggi, la sequenza consigliata è:

1. repo structure
2. comandi standard
3. test e coverage
4. hook locali
5. CI GitHub
6. docs architetturali
7. guardrail per AI
8. metriche e ratchet
9. release/docs deploy

## Risultato atteso

Alla fine dovresti ottenere una codebase in cui:

- un umano nuovo capisce rapidamente dove guardare
- un agente AI sa **cosa leggere prima di toccare codice**
- i cambiamenti peggiorativi vengono bloccati presto
- le decisioni importanti restano rintracciabili
- il repo resta pulito anche se gran parte del codice è scritto con AI

