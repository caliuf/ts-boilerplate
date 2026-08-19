# 05 — Come partire da zero con una repo Python + React in stile Tolaria

Questo è il piano pratico che seguirei per costruire la tua codebase.

## 1. Obiettivo del bootstrap

Non partire dal dominio. Parti dai vincoli.

Prima ancora di costruire feature, devi avere:

- una struttura repo chiara
- comandi standard
- test minimi
- hook locali
- CI GitHub
- documentazione strutturale
- guardrail per AI

## 2. Sequenza consigliata di implementazione

## Fase 0 — Crea la repo e le fondamenta documentali
Crea subito:

```text
AGENTS.md
README.md
docs/GETTING-STARTED.md
docs/ARCHITECTURE.md
docs/ABSTRACTIONS.md
docs/adr/
.github/workflows/
.husky/
scripts/
frontend/
backend/
```

### Perché subito
Così ogni scelta successiva ha già un posto dove essere spiegata.

## Fase 1 — Bootstrap tecnico minimo

### Frontend
- inizializza React + TypeScript + Vite
- aggiungi Tailwind + shadcn/ui
- aggiungi ESLint
- aggiungi Vitest + Testing Library
- aggiungi Playwright

### Backend
- inizializza `uv`
- crea app FastAPI minima
- aggiungi `ruff`, `mypy`, `pytest`, `pytest-cov`
- struttura `backend/src` e `backend/tests`

## Fase 2 — Definisci i comandi canonici
I comandi da root devono esistere presto.

Checklist:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm test:e2e`
- `pnpm build`
- `pnpm docs:build`

Anche se alcuni sono wrapper, vanno definiti subito.

## Fase 3 — Aggiungi gli hook

### `pre-commit`
Leggero:

- lint frontend
- lint backend
- skip su docs-only changes

### `pre-push`
Pesante:

- lint
- typecheck
- build
- coverage frontend
- coverage backend
- smoke e2e
- docs build se serve
- security scan
- code health gate

## Fase 4 — Aggiungi la CI GitHub
Crea:

- `ci.yml`
- `deploy-docs.yml`
- opzionale `release.yml`

### Primo obiettivo della CI
Non fare tutto subito. Parti con:

- frontend quality
- backend quality
- e2e smoke
- docs build

Poi aggiungi:

- Codecov
- security scan
- CodeScene gate
- release workflow

## Fase 5 — Blocca le soglie minime
Crea subito i pavimenti.

### Coverage
- frontend: `70%`
- backend: `85%`

### Code health
- file `.codescene-thresholds`
- valori iniziali realistici ma non bassissimi

### Lint
- warnings `0`

## Fase 6 — Scrivi le convenzioni architetturali prima che servano
Nel primo commit “serio” di architettura scrivi già:

### `docs/ARCHITECTURE.md`
- source of truth dei dati
- boundaries FE/BE
- auth flow
- error flow
- state model
- persistence model

### `docs/ABSTRACTIONS.md`
- entity principali
- schema request/response
- naming policy
- service pattern
- repository/data-access pattern
- event/background-job pattern

## Fase 7 — Rendi il repo AI-friendly davvero
Aggiungi:

- `AGENTS.md` con regole operative vere
- shims `CLAUDE.md`, `GEMINI.md`, `COPILOT.md`
- `scripts/build-agent-docs.py`
- output `agent-docs/`

## 3. Layout raccomandato della repo finale

```text
my-project/
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  COPILOT.md
  README.md
  package.json
  pyproject.toml
  uv.lock
  pnpm-workspace.yaml
  .codescene-thresholds
  .codescenerc
  .codacy.yaml
  .editorconfig
  .github/
    workflows/
      ci.yml
      deploy-docs.yml
      release.yml
  .husky/
    pre-commit
    pre-push
  docs/
    GETTING-STARTED.md
    ARCHITECTURE.md
    ABSTRACTIONS.md
    adr/
      0001-monorepo.md
      0002-fastapi.md
      0003-auth-strategy.md
  frontend/
    package.json
    vite.config.ts
    playwright.config.ts
    src/
    tests/
  backend/
    pyproject.toml
    src/app/
    tests/
  scripts/
    build-agent-docs.py
    quality-gates.sh
    validate-openapi.py
  agent-docs/
```

## 4. Roadmap in 10 commit sensati

Se vuoi farlo in modo ordinato:

1. `chore: initialize monorepo structure`
2. `docs: add architecture, abstractions, getting-started, agents`
3. `feat: bootstrap react frontend with lint and tests`
4. `feat: bootstrap fastapi backend with ruff mypy pytest`
5. `chore: add root scripts and unified commands`
6. `chore: add husky pre-commit and pre-push gates`
7. `ci: add github actions quality pipeline`
8. `ci: add coverage uploads and security scanning`
9. `docs: add adr workflow and agent-docs generator`
10. `ci: add code health ratchet and docs deploy`

## 5. GitHub setup raccomandato

## Repository settings

### Branch protection
Abilita per `main`:

- require status checks
- require branches up to date
- disallow force push
- do not allow bypass

### Actions permissions
Consenti:

- GitHub Actions
- reusable workflows
- OIDC se usi Codecov o cloud deploy

### Secrets possibili
- `CODESCENE_PAT`
- `CODESCENE_PROJECT_ID`
- token deploy
- secret telemetry se previsti
- eventuali credenziali package registry

## 6. Cosa implementare subito vs dopo

## Da fare subito
- lint
- typecheck
- unit test
- coverage minima
- smoke e2e
- docs base
- AGENTS.md
- CI
- hook

## Da fare poco dopo
- CodeScene
- Codacy/Semgrep/CodeQL
- docs bundle per AI
- docs deploy su GitHub Pages
- release automation
- analytics/l10n se il prodotto lo richiede

## 7. Errori da evitare quando si parte

### Errore 1
Aspettare di avere “abbastanza codice” prima di scrivere `ARCHITECTURE.md`.

**Meglio**: scrivere i principi adesso, anche se brevi.

### Errore 2
Aggiungere CI senza hook locali.

**Meglio**: fallire prima in locale.

### Errore 3
Avere regole diverse tra AI instructions e pipeline reale.

**Meglio**: se `AGENTS.md` promette un gate, quel gate deve esistere davvero.

### Errore 4
Mescolare docs prodotto, docs architetturali e istruzioni operative.

**Meglio**: separarle come fa Tolaria.

### Errore 5
Lasciare che l’AI inventi naming e struttura file feature dopo feature.

**Meglio**: convenzioni esplicite presto.

## 8. Versione minima veramente buona

Se vuoi la versione più piccola che però mantenga la filosofia Tolaria, fai almeno questo:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ABSTRACTIONS.md`
- `docs/GETTING-STARTED.md`
- `frontend/` con ESLint + Vitest + Playwright
- `backend/` con Ruff + Mypy + Pytest
- `pre-commit`
- `pre-push`
- `ci.yml`
- coverage enforced
- security scan

Con questa base puoi crescere senza perdere controllo.

## 9. Il criterio finale

La domanda giusta non è:

> “Il progetto usa tool moderni?”

La domanda giusta è:

> “Se domani 80% del nuovo codice fosse scritto da AI, questa repo riuscirebbe comunque a restare coerente?”

Se la risposta è sì, allora hai davvero copiato la parte importante di Tolaria.

