# 03 — Pipeline e guardrail di qualità

Questa è la parte più importante da copiare davvero da Tolaria.

## 1. Pattern chiave osservati in Tolaria

### Hook locali
- `pre-commit`: veloce, lint-only, salta molte verifiche se hai cambiato solo docs/hook/workflow
- `pre-push`: pesante, esegue build, coverage, smoke test, code health gate

### CI GitHub
- job separati per frontend e backend
- cache dedicate
- docs build controllata separatamente
- coverage uploadata
- code health gate remoto
- job di build compatibilità separato dal flusso veloce principale

### Policy di push
- niente bypass
- soglie di qualità a ratchet
- se il progetto migliora, il nuovo minimo va consolidato

## 2. Come replicarlo nel tuo progetto

## Pre-commit: economico e frequente
Scopo: bloccare errori facili prima del commit, senza rallentare troppo.

Controlli consigliati:

- lint frontend
- lint backend
- opzionale: formattazione check
- skip automatico se hai cambiato solo Markdown, docs, workflow, hook

Esempio logico:

```bash
if changed_only_docs_or_workflows; then
  exit 0
fi

pnpm lint:frontend
uv run ruff check backend
```

Non mettere qui Playwright, coverage completa, build lunghe o suite costose.

## Pre-push: il vero gate locale
Scopo: impedire che un push rompa la main.

Ordine consigliato:

1. lint frontend
2. lint backend
3. typecheck frontend
4. typecheck backend
5. build frontend
6. test frontend con coverage
7. test backend con coverage
8. smoke e2e
9. security scan
10. code health gate
11. docs build se necessario

L’ordine conta: metti prima i fail veloci.

## 3. Soglie raccomandate

## Frontend
- ESLint warnings: `0`
- coverage minima: `70%`
- typecheck obbligatorio

## Backend
- `ruff check`: verde
- `ruff format --check`: verde
- `mypy`: verde
- coverage minima: `85%`

## E2E smoke
Fai passare sempre i flussi più critici. Esempi:

- login
- creazione record principale
- modifica/salvataggio
- ricerca
- cancellazione controllata
- navigazione tra pagina elenco e dettaglio

## Security
Almeno uno tra:

- Codacy
- Semgrep
- CodeQL

Regola semplice:

- niente nuovi Critical/High
- i Medium vanno valutati

## Code health
Se usi CodeScene, crea un file come:

```bash
HOTSPOT_THRESHOLD=9.0
AVERAGE_THRESHOLD=9.0
```

Poi usalo come ratchet.

## 4. CI GitHub consigliata

Tolaria separa i job. È giusto farlo anche qui.

## Workflow `ci.yml`

### Job 1 — frontend-quality
Esegue:

- install
- `eslint`
- `tsc --noEmit`
- `vite build`
- `vitest --coverage`
- upload coverage frontend

### Job 2 — backend-quality
Esegue:

- setup Python / `uv`
- install dipendenze
- `ruff check`
- `ruff format --check`
- `mypy`
- `pytest --cov`
- upload coverage backend

### Job 3 — e2e-smoke
Esegue:

- build/run frontend
- run backend
- Playwright smoke suite

### Job 4 — docs-check
Esegue:

- build docs
- opzionale warning se cambia codice ma non cambiano docs

### Job 5 — security
Esegue:

- Codacy / Semgrep / CodeQL

### Job 6 — code-health
Esegue:

- fetch CodeScene project scores
- confronta con `.codescene-thresholds`
- fallisce se sotto soglia

## 5. Struttura consigliata dei workflow

```text
.github/workflows/
  ci.yml
  deploy-docs.yml
  release.yml
```

## `ci.yml`
Trigger:

- push su `main`
- pull request verso `main`
- workflow_dispatch

## `deploy-docs.yml`
Trigger:

- cambi su `docs/`, `site/`, `scripts/build-agent-docs.py`
- deploy su GitHub Pages

## `release.yml`
Trigger:

- tag o release manuale
- build artifact
- publish image/container/package

## 6. Esempio di matrice mentale per i gate

| Gate | Locale commit | Locale push | CI GitHub |
|---|---:|---:|---:|
| Lint frontend | ✅ | ✅ | ✅ |
| Lint backend | ✅ | ✅ | ✅ |
| Typecheck frontend | opzionale | ✅ | ✅ |
| Typecheck backend | opzionale | ✅ | ✅ |
| Build frontend | ❌ | ✅ | ✅ |
| Unit tests frontend | ❌ | ✅ | ✅ |
| Coverage frontend | ❌ | ✅ | ✅ |
| Unit/API tests backend | ❌ | ✅ | ✅ |
| Coverage backend | ❌ | ✅ | ✅ |
| Playwright smoke | ❌ | ✅ | ✅ |
| Docs build | ❌ | se necessario | ✅ |
| Security scan | ❌ | opzionale | ✅ |
| Code health gate | ❌ | ✅ | ✅ |

## 7. Docs-only fast path

Uno dei dettagli più intelligenti di Tolaria è che evita di far girare tutto quando cambi solo documentazione o hook.

Replica questa policy:

### Se hai cambiato solo
- `docs/**`
- `*.md`
- `.github/workflows/**`
- `.husky/**`

allora:

- il `pre-commit` fa quasi nulla
- il `pre-push` può limitarsi a `docs:build`
- la CI può far partire solo i job docs/lint minimi

Questo riduce attrito senza indebolire i gate reali.

## 8. Quality ratchet: come implementarlo bene

Tolaria usa CodeScene come ratchet remoto. Il pattern è ottimo anche in astratto.

### Regola
Mai abbassare soglie manualmente per far passare una modifica.

### Possibili ratchet nel tuo repo

- `.codescene-thresholds`
- coverage minima per aree core
- complexity massima per file/func
- numero massimo di warning statici

### Policy pratica

- se una modifica peggiora metriche importanti, refactor prima di chiuderla
- se una metrica migliora in modo consolidato, alza il pavimento

## 9. Security / static analysis consigliata

Tolaria cita Codacy come gate. Su GitHub puoi usare una combinazione robusta:

### Minimo serio
- `Semgrep`
- `CodeQL`
- `pip-audit` per Python
- `pnpm audit --prod` o equivalente ragionato per frontend

### Se vuoi replicare Tolaria più da vicino
- Codacy come dashboard/gate
- CodeScene per code health
- Codecov per coverage trend

## 10. Release discipline da copiare

Tolaria separa:

- CI qualità
- deploy docs
- release alpha/stable

Per il tuo progetto puoi fare più semplice:

### Alpha / preview
- deploy automatico su ogni merge in `main`
- preview environment
- pacchetti/container marcati come prerelease

### Stable
- tag semver
- changelog/release notes
- publish su GitHub Releases
- opzionale deploy in produzione

## 11. GitHub settings che ti consiglio

### Branch protection su `main`
Abilita:

- require status checks
- require branches up to date
- prevent force pushes
- prevent bypass

### Secrets
Prevedi almeno:

- `CODESCENE_PAT`
- `CODESCENE_PROJECT_ID`
- `CODECOV_TOKEN` se non usi OIDC
- eventuali token deploy/docs
- variabili telemetry solo se servono

## 12. Checklist finale dei guardrail minimi

Se vuoi davvero il “livello Tolaria”, il tuo repo deve avere almeno:

- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ABSTRACTIONS.md`
- `docs/GETTING-STARTED.md`
- `docs/adr/`
- `.husky/pre-commit`
- `.husky/pre-push`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-docs.yml`
- `.codescene-thresholds`
- security scan in CI
- coverage enforced frontend + backend
- smoke suite separata

Senza questi pezzi puoi avere un buon progetto. Con questi pezzi hai molte più probabilità di avere una **buona codebase AI-first**.

