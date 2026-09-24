# Sicurezza nello sviluppo

Policy operative; la segnalazione di vulnerabilità è in
[`/SECURITY.md`](../../SECURITY.md).

## Supply chain

- Dipendenze fissate esattamente nel lockfile (`pnpm-lock.yaml` committato; CI con `--frozen-lockfile`).
- Dependabot (`.github/dependabot.yml`): PR raggruppate per npm e GitHub Actions; aggiornamenti major con review esplicita.
- Dependency Review in CI blocca nuove vulnerabilità note.
- Nuova dipendenza significativa ⇒ ADR.

## Segreti

- Mai committare segreti: `.env` reali sono gitignored; nel repo solo `.env.example` con valori finti ma strutturalmente validi. La sessione OAuth CodeScene vive in `~/.config/codehealth-mcp/` (fuori dal git); niente `CODESCENE_API_TOKEN`, `CODESCENE_TOKEN` o contenuto di `~/.codescene/token` nel repository.
- Gitleaks è gate: staged in `precommit`, working tree in `prepush`/`ci`, storia completa in `security.yml`.
- Niente segreti nei log (la redazione è responsabilità dell'adapter), nelle description/output dei tool MCP, negli eventi analytics.

## GitHub Actions

- Permission di default read-only; elevate solo sul singolo job.
- Action esterne fissate a full commit SHA (con commento `# tag: vX`); Dependabot le aggiorna.
- Niente `pull_request_target` senza review di sicurezza.
- Deploy con OIDC e protected environment, non credenziali persistenti (quando esisterà un deploy).
- `just workflows-check` (actionlint + zizmor) è gate su ogni modifica ai workflow.

## Dati esterni

Tutto ciò che entra nei confini del prodotto (HTTP, env, file, queue, webhook, API esterne, output LLM) è validato a runtime con Zod (ADR-0003). Tooling e test che leggono output tecnici devono validare il dato prima di restringerlo; niente `JSON.parse(...) as T` per saltare la validazione.

## File critici protetti (CODEOWNERS)

`/.github/`, `/AGENTS.md`, `/CLAUDE.md`, `/GEMINI.md`, `/docs/architecture/`, `/docs/product/`, `/docs/init/` (blueprint congelato), `/SECURITY.md`, `/conventions.conf`, e i file che definiscono i gate o la toolchain dei gate: `/justfile`, `/.githooks/`, `/biome.json`, `/.oxlintrc.json`, `/.markdownlint-cli2.jsonc`, `/cspell.json`, `/knip.json`, `/dependency-cruiser.config.mjs`, `/coverage-thresholds.json`, `/tools/scripts/`, `/tools/cspell/`, `/.mise.toml`, `/.node-version`, `/.kilo/kilo.jsonc`, `/.kilo/scripts/`, `/.kilo/command/`, `/.codescene-thresholds`.
