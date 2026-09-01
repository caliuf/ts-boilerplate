# Workflow: gate, CI/CD e task schedulati

Guida per chi non ha familiarità con CI/CD: cosa gira, dove, e perché.

## Il modello in 30 secondi

- **Guides**: regole testuali (`AGENTS.md`, queste docs). Utili ma fallibili.
- **Gates**: controlli automatici che bloccano codice non conforme. Girano in locale (`just precommit`, `just prepush`) e in CI (`.github/workflows/`). La CI riesegue le stesse recipe e fa fede; il locale dà feedback immediato.
- **Guards**: controlli schedulati report-only (`just guards` + `scheduled.yml`): non bloccano, aprono issue.

## Gate locali (hook git)

Gli hook versionati in `.githooks/` (attivati da `just setup`) chiamano solo:

- `just precommit` a ogni `git commit` (≤ 10s): format, lint, shell-check sui wrapper, docs, segreti sullo staged, test correlati ai file in stage.
- `just prepush` a ogni `git push` (≤ 60s): static analysis completa (incluso shell-check), integration, smoke, coverage.

Mai saltare gli hook (`--no-verify` è vietato; vedi `AGENTS.md`). Se un gate fallisce e non sai rimediare: fermati e riporta il fallimento esatto.

Fast path docs-only: se il diff tocca solo docs/markdown/workflow/hook, i gate si riducono a `docs-check` + `workflows-check`. La lista dei path è la variabile `DOCS_ONLY_PATTERNS` nel justfile, protetta da CODEOWNERS. Un diff misto percorre sempre il percorso completo.

## CI (GitHub Actions)

I workflow vivono in `.github/workflows/` e sono verificati da `just workflows-check` (actionlint + zizmor). Tutte le action esterne sono fissate a SHA completo; le permission di default sono read-only.

| Workflow | Quando | Cosa fa |
|---|---|---|
| `ci.yml` | PR, push su main, manuale | un unico run: quality + integration & coverage + bun-compatibility + e2e + dependency-review (ADR-0005) |
| `security.yml` | settimanale, manuale | CodeQL + scansione segreti su tutta la storia (slow lane) |
| `scheduled.yml` | cron settimanale, manuale | guard (apre issue sui findings) + link esterni |

> CodeQL (`security.yml`) e Dependency Review (`ci.yml`) sono gratuiti sui repository pubblici; sui privati richiedono GitHub Advanced Security. I job si auto-escludono sui repo privati: abilita GHAS in *Settings → Code security* e rimuovi le condizioni `if` per attivarli lì.

### Cosa devi fare tu (una tantum, sul repo GitHub)

1. **Niente per far partire la CI**: i workflow partono da soli al primo push.
2. Abilita in *Settings → Code security*: Dependabot alerts, security updates, secret scanning, push protection.
3. Abilita **Dependency graph** in *Settings → Code security → Dependency graph* (richiesto dal job `dependency-review` in `ci.yml`; senza di esso il check fallisce in pochi secondi).
4. Crea il ruleset di `main` (*Settings → Rules → Rulesets*): require PR, status check obbligatori (i job di `ci.yml`: `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`), no force push, squash merge, Code Owner review. Vedi la checklist con i prompt pronti in
   [`NEW-PROJECT.md`](./NEW-PROJECT.md).

## Task schedulati (guards)

`scheduled.yml` gira settimanalmente (lunedì 03:17 UTC) ed esegue:

- `just guards` — report-only: coerenza docs↔recipe↔registry, budget della suite, slot per performance/i18n/telemetria quando esisteranno. Se ci sono findings apre una issue col report (nessun auto-fix, nessun commit: i guard creano task, non codice).
- `lychee` online — verifica i link esterni della documentazione (slow lane: troppo lento/instabile per la fast lane).

Per cambiare frequenza: modifica il `cron` in `scheduled.yml` (<https://crontab.guru> per la sintassi). In assenza del remoto GitHub, esegui `just guards` a mano con cadenza regolare: è obbligo del maintainer.

### Retrospettiva di processo (guard speciale, manuale)

Con cadenza regolare (settimanale o a fine ciclo intenso), chiedi all'agente:

```text
Esegui la retrospettiva di processo: analizza i gate falliti di recente, le istruzioni di AGENTS.md ignorate o ambigue, i workaround che hai tentato. Proponi in una PR: aggiornamenti mirati di AGENTS.md (rule of thumb: <200 righe, non un gate), regole da promuovere da guida a gate, regole morte da rimuovere.
```

## Tool opzionali (MAY)

**Adottato:** CodeScene via MCP come autorità di Code Health per gli agenti (ADR-0006). Non è un hook git: uso operativo in [`CODESCENE.md`](./CODESCENE.md).

**Adottato:** repository-local memory bank in `docs/memory/` come fallback portatile e versionabile della Kilo Memory nativa (ADR-0008). Gli agenti leggono `docs/memory/project.md` e `docs/memory/environment.md` all'avvio e aggiornano i file quando emergono fatti o correzioni duraturi.

Quando il progetto cresce, valuta con un'ADR: SonarQube Community (qualità continua, duplicazione), CodeCharta/CodeMaat (hotspot da git history, nel health guard), lizard (gate di complessità), Semgrep CE (SAST). Codacy non è usato: codacy-cli-v2 non supporta TypeScript in locale (parser assente, ESLint fallisce su `.ts`/`.tsx`; verificato 2026-09-01). Riferimenti: vademecum §4 in `docs/init/`.

## Messaggi di commit

Convenzione (guida, non gate): prefisso conventional (`feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `build`, `ci`, `revert`), una riga riassuntiva, riga vuota, lista puntata Markdown col dettaglio. L'agente mantiene la bozza in `tmp/commit-message.md` (gitignored).
