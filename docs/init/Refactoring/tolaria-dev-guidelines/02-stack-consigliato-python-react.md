# 02 — Stack consigliato per replicare il livello di tooling su Python + React

Questa proposta non copia lo stack di Tolaria; copia il suo **livello di disciplina**.

## 1. Scelte consigliate

## Frontend

- `React`
- `TypeScript`
- `Vite`
- `pnpm`
- `Tailwind CSS`
- `shadcn/ui`
- `ESLint`
- `Vitest`
- `@testing-library/react`
- `Playwright`

### Perché
È il parallelo più naturale della parte frontend di Tolaria:

- toolchain moderna e veloce
- typecheck e build separabili
- ottima testabilità
- buona ergonomia per agenti AI
- struttura chiara per componenti/hooks/utils

## Backend Python

- `FastAPI`
- `Pydantic`
- `uv` per ambiente, lockfile e comandi
- `pytest`
- `pytest-cov`
- `ruff`
- `mypy`
- `httpx` per test API
- `alembic` se hai DB relazionale

### Perché
È una combinazione molto adatta a una codebase AI-first:

- contratti espliciti via schema
- linting e formatting unificati con `ruff`
- type system abbastanza forte via `mypy`
- test runner standard e leggibile
- DX rapida in locale e in CI

## Tooling di repo

- `Husky` per orchestrare gli hook Git dal root
- `GitHub Actions` per CI/CD
- `Codecov` per reporting coverage
- `CodeScene` per code health / hotspot gate
- `Codacy` oppure `Semgrep` + `CodeQL` per security/static analysis
- `Dependabot` o `Renovate` per aggiornamenti dipendenze

## 2. Struttura repo raccomandata

```text
my-project/
  AGENTS.md
  CLAUDE.md
  GEMINI.md
  README.md
  package.json
  pnpm-workspace.yaml
  pyproject.toml
  uv.lock
  .editorconfig
  .gitignore
  .codescene-thresholds
  .codescenerc
  .codacy.yaml
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
  frontend/
    package.json
    tsconfig.json
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
    validate-locales.mjs
    quality-gates.sh
    ci/
  agent-docs/
```

## 3. Comandi standard del repo

Tolaria è forte anche perché i comandi sono prevedibili. Nel tuo progetto definisci un dizionario di comandi fisso.

## Root `package.json`

Usalo come command router del monorepo.

Comandi consigliati:

```json
{
  "scripts": {
    "lint": "pnpm lint:frontend && pnpm lint:backend",
    "typecheck": "pnpm typecheck:frontend && pnpm typecheck:backend",
    "test": "pnpm test:frontend && pnpm test:backend",
    "test:coverage": "pnpm coverage:frontend && pnpm coverage:backend",
    "test:e2e": "pnpm --dir frontend playwright test",
    "build": "pnpm build:frontend && pnpm build:backend",
    "docs:build": "python scripts/build-agent-docs.py",
    "lint:frontend": "pnpm --dir frontend eslint . --max-warnings=0",
    "typecheck:frontend": "pnpm --dir frontend tsc --noEmit",
    "test:frontend": "pnpm --dir frontend vitest run",
    "coverage:frontend": "pnpm --dir frontend vitest run --coverage",
    "build:frontend": "pnpm --dir frontend vite build",
    "lint:backend": "uv run ruff check backend",
    "format:backend": "uv run ruff format --check backend",
    "typecheck:backend": "uv run mypy backend/src",
    "test:backend": "uv run pytest backend/tests",
    "coverage:backend": "uv run pytest backend/tests --cov=backend/src --cov-report=xml --cov-fail-under=85"
  }
}
```

## 4. Soglie iniziali raccomandate

Tolaria usa soglie concrete. Parti anche tu con numeri espliciti.

### Frontend

- lint warnings: `0`
- coverage linee: `70%`
- coverage branches: `70%`
- typecheck: obbligatorio
- smoke e2e: obbligatoria per i flussi core

### Backend Python

- `ruff check`: obbligatorio
- `ruff format --check`: obbligatorio
- `mypy`: obbligatorio sulle cartelle core
- coverage linee: `85%`
- test API/integration: obbligatori sui flussi sensibili

### Code health

Se usi CodeScene:

- hotspot threshold iniziale: `9.0` o superiore
- average threshold iniziale: `9.0` o superiore
- poi ratchet verso l’alto

Se non vuoi partire con CodeScene dal giorno 1:

- usa almeno `ruff` complexity rules
- `radon`/`lizard` per complessità ciclomatica
- un file `.quality-thresholds` per fissare i limiti
- poi migra a CodeScene appena la repo prende forma

## 5. Tooling docs da replicare quasi identico

## `AGENTS.md`
È il cuore del sistema.

## `docs/ARCHITECTURE.md`
Deve contenere:

- source of truth dei dati
- boundaries frontend/backend
- pattern di stato
- pattern di persistenza
- error handling
- auth model
- ownership dei layer
- flow principali

## `docs/ABSTRACTIONS.md`
Deve contenere:

- modelli principali
- naming standards
- eventi di dominio
- policy su DTO / entity / schema
- convenzioni su servizi, repositories, handlers, jobs

## `docs/GETTING-STARTED.md`
Deve contenere:

- prerequisites
- setup locale
- run commands
- test commands
- debug basics
- directory map

## `docs/adr/`
Per decisioni come:

- framework backend
- strategia auth
- ORM o query layer
- cache strategy
- eventing/background jobs
- multi-tenant vs single-tenant
- monorepo vs multirepo

## 6. Opinioni pratiche forti

## A. Usa `uv` per Python
Per una codebase nuova è la scelta più pulita.

Ti dà:

- install veloce
- lockfile chiaro
- comandi consistenti in CI
- meno attrito di setup per AI e dev

## B. Mantieni TypeScript nel frontend
Anche se il backend è Python, TS nel frontend ti dà guardrail forti e riduce ambiguità per gli agenti.

## C. Evita due sistemi di hook separati che litigano
Puoi usare `pre-commit` Python, ma idealmente il **punto di ingresso** deve essere uno solo.

Scelta consigliata:

- `Husky` al root per `pre-commit` e `pre-push`
- all’interno gli hook invocano `pnpm` e `uv`

## D. Separa smoke suite da regression suite
Tolaria distingue molto bene i test costosi da quelli da far girare sempre.

Replica così:

- `tests/smoke/` → percorsi core, pochi, stabili
- `tests/regression/` → copertura più ampia, non sempre bloccante sul push locale

## E. Tieni la docs pipeline separata
Tolaria ha un workflow dedicato per le docs. È una buona idea anche per te:

- CI qualità del prodotto
- deploy docs su GitHub Pages
- eventualmente generazione bundle `agent-docs/`

## 7. Stack minimo consigliato se vuoi partire subito

Se vuoi una versione “best balance”:

### Frontend
- React
- TypeScript
- Vite
- Tailwind
- shadcn/ui
- ESLint
- Vitest
- Playwright

### Backend
- FastAPI
- Pydantic
- uv
- pytest
- pytest-cov
- ruff
- mypy

### Repo / CI
- Husky
- GitHub Actions
- Codecov
- CodeScene
- Codacy o Semgrep
- ADRs + architecture docs + AGENTS.md

Questa combinazione è abbastanza leggera per partire, ma abbastanza seria da sostenere una codebase generata in larga parte con AI.

