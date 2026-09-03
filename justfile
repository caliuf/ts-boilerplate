# Public task interface (Vademecum §5). Agents and humans use ONLY these
# recipes; package.json scripts are implementation details.
#
# Budgets: precommit ≤ 10s · smoke ≤ 20s · prepush ≤ 60s · full CI ≤ 10min.

set shell := ["bash", "-euo", "pipefail", "-c"]

# Make the mise-pinned toolchain visible to every recipe, even in shells without
# the mise hook (agents, CI subshells, blocked direnv in worktrees). mise keeps a
# shim per installed tool in ~/.local/share/mise/shims; each shim resolves the
# version from the .mise.toml found walking up from the recipe cwd. If the
# directory does not exist (tools installed by hand) the extra PATH entry is a
# no-op and recipes fall back to the ambient PATH.

export PATH := env_var('HOME') / ".local/share/mise/shims" + ":" + env_var('PATH')

# Docs-only fast path (Vademecum §5): the exact, complete list of path
# patterns. Protected by CODEOWNERS. A mixed diff always takes the full path.

DOCS_ONLY_PATTERNS := "^docs/ ^README\\.md$ ^AGENTS\\.md$ ^CLAUDE\\.md$ ^GEMINI\\.md$ ^CONTRIBUTING\\.md$ ^SECURITY\\.md$ ^CHANGELOG\\.md$ ^\\.github/workflows/ ^\\.githooks/"

# Flags colore per i tool che ignorano FORCE_COLOR, attivi solo quando
# tools/scripts/run-checks.sh esporta RUN_CHECKS_COLORS=1 (gate su terminale
# interattivo senza NO_COLOR). Valutati dai just annidati dei gate; nelle
# esecuzioni standalone la variabile non c'è e il TTY basta da solo.

BIOME_COLORS := if env_var_or_default("RUN_CHECKS_COLORS", "") == "1" { "--colors=force" } else { "" }
TSC_PRETTY := if env_var_or_default("RUN_CHECKS_COLORS", "") == "1" { "--pretty" } else { "" }

# --- lifecycle -----------------------------------------------------------------

# Install Debian/Ubuntu system prerequisites, then the pinned mise toolchain.
# This is intentionally separate from `setup`: it changes the host, while setup
# changes only the repository environment.
install:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v apt-get >/dev/null 2>&1; then
      echo "❌ apt-get not found — just install supports Debian-based distributions only" >&2
      exit 1
    fi
    if [ "$(id -u)" -eq 0 ]; then
      apt-get update
      apt-get install -y bash ca-certificates coreutils curl findutils gawk git grep gh jq parallel python3 sed tar unzip xz-utils build-essential
    elif command -v sudo >/dev/null 2>&1; then
      sudo apt-get update
      sudo apt-get install -y bash ca-certificates coreutils curl findutils gawk git grep gh jq parallel python3 sed tar unzip xz-utils build-essential
    else
      echo "❌ install needs root or sudo to install Debian packages" >&2
      exit 1
    fi
    if ! command -v mise >/dev/null 2>&1; then
      echo "Installing mise with the official installer..."
      curl https://mise.run | sh
      export PATH="$HOME/.local/bin:$PATH"
    fi
    mise install
    npm install --global dotenv-cli
    npm install --global @colbymchenry/codegraph

# Install dependencies, tools and git hooks (idempotent)
setup:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v mise >/dev/null 2>&1; then
      mise install
    else
      echo "⚠️  mise not found — install the tools pinned in .mise.toml manually (see docs/development/GETTING-STARTED.md)"
    fi
    pnpm install
    if command -v direnv >/dev/null 2>&1; then
      direnv allow .
    else
      echo "⚠️  direnv not found — authorize the .envrc manually after installing it (see docs/development/ENVIRONMENT.md)"
    fi
    git config core.hooksPath .githooks
    pnpm --filter @project/tests exec playwright install chromium
    if command -v codegraph >/dev/null 2>&1; then
      codegraph init
      codegraph index
    else
      echo "⚠️  codegraph not found — skipping repo index (install codegraph to enable CodeGraph, see docs/development/GETTING-STARTED.md)"
    fi

# Pull latest changes and keep the environment in sync (tools, deps, hooks)
pull:
    #!/usr/bin/env bash
    set -euo pipefail
    git pull
    changed=""
    if git rev-parse --verify ORIG_HEAD >/dev/null 2>&1; then
      changed=$(git diff --name-only ORIG_HEAD..HEAD || true)
    fi
    if grep -qE '^(\.mise\.toml|\.node-version)$' <<< "$changed"; then
      if command -v mise >/dev/null 2>&1; then
        mise install
      else
        echo "⚠️  mise not found — install the tools pinned in .mise.toml manually (see docs/development/GETTING-STARTED.md)"
      fi
    fi
    if grep -qE '^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$' <<< "$changed"; then
      pnpm install
    fi
    if grep -qE '^\.githooks/' <<< "$changed"; then
      git config core.hooksPath .githooks
    fi
    if [ -d .codegraph ] && command -v codegraph >/dev/null 2>&1; then
      codegraph sync
    fi

# Verify runtimes, tools and configuration
doctor:
    node tools/scripts/doctor.ts

# Run a command with the pinned Node toolchain from .mise.toml. Use this
# when a recipe or script must invoke node deterministically. mise exec
# resolves the shim from .mise.toml; in environments without mise (CI
# images, scratch containers) the recipe falls back to the node already
# in PATH and asserts it matches the pinned major. Misalignment fails
# loudly instead of silently running a different runtime.
[positional-arguments]
node *args:
    #!/usr/bin/env bash
    set -euo pipefail
    pinned=$(awk -F'=' '/^node[[:space:]]*=/{gsub(/[" ]/,"",$2); print $2; exit}' .mise.toml)
    if [ -z "$pinned" ]; then
      echo "❌ no `node` pin found in .mise.toml" >&2
      exit 1
    fi
    pinned_major="${pinned%%.*}"
    if command -v mise >/dev/null 2>&1; then
      exec mise exec -- node "$@"
    fi
    if ! command -v node >/dev/null 2>&1; then
      echo "❌ node not found in PATH and mise is not installed — install one of them (see docs/development/GETTING-STARTED.md)" >&2
      exit 1
    fi
    actual_major=$(node -p 'process.versions.node.split(".")[0]')
    if [ "$actual_major" != "$pinned_major" ]; then
      echo "❌ node $actual_major in PATH but .mise.toml pins $pinned (major mismatch) — install mise or the matching Node" >&2
      exit 1
    fi
    exec node "$@"

# Start API + web dev servers
dev:
    pnpm --parallel --filter @project/api --filter @project/web run dev

# --- static analysis -------------------------------------------------------------

# Apply format and safe fixes
fix:
    pnpm exec biome check --write .

# Verify formatting and import organization
format-check:
    pnpm exec biome check {{ BIOME_COLORS }} .

# Full typecheck (TSC_PRETTY vale solo per il typecheck di root; l'output
# per-package via pnpm -r resta plain, come già prima dei gate paralleli,

# perché pnpm lo incapsula in pipe)
typecheck:
    pnpm exec tsc -p tsconfig.json {{ TSC_PRETTY }}
    pnpm -r --if-present run typecheck

# Type-aware lint
lint:
    pnpm exec oxlint --type-aware --config .oxlintrc.json .

# Dead code: unused files, exports, dependencies
dead-code:
    pnpm exec knip

# Architectural rules and dependency cycles
arch:
    pnpm exec depcruise apps packages tools tests --config dependency-cruiser.config.mjs

# Markdown lint, spelling, local links
docs-check:
    #!/usr/bin/env bash
    set -euo pipefail
    pnpm exec markdownlint-cli2
    pnpm exec cspell lint --no-progress "**/*.md"
    if command -v lychee >/dev/null 2>&1; then
      lychee --offline --no-progress --include-fragments .
    else
      echo "⚠️  lychee not found — skipping local link check (blocking in CI; run \`mise install\`)"
    fi

# GitHub Actions syntax and security
workflows-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v actionlint >/dev/null 2>&1; then
      actionlint
    else
      echo "⚠️  actionlint not found — skipping (blocking in CI; run \`mise install\`)"
    fi
    if command -v zizmor >/dev/null 2>&1; then
      zizmor .
    else
      echo "⚠️  zizmor not found — skipping (blocking in CI; run \`mise install\`)"
    fi

# Secrets scan of the working tree
secrets:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v gitleaks >/dev/null 2>&1; then
      gitleaks dir --redact --no-banner .
    else
      echo "⚠️  gitleaks not found — skipping secrets scan (blocking in CI; run \`mise install\`)"
    fi

# Secrets scan of the staged diff only (pre-commit hook)
secrets-staged:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v gitleaks >/dev/null 2>&1; then
      gitleaks git --staged --redact --no-banner .
    else
      echo "⚠️  gitleaks not found — skipping staged secrets scan (blocking in CI; run \`mise install\`)"
    fi

# Shell script lint (blocking in CI). -x follows sourced files from bin/.
shell-check:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v shellcheck >/dev/null 2>&1; then
      # Exclude unused check
      shellcheck -e SC2329 -x bin/* tools/scripts/*.sh
    else
      echo "⚠️  shellcheck not found — skipping shell lint (blocking in CI; run \`mise install\`)"
    fi

# --- tests -----------------------------------------------------------------------

# Small specialist unit suite
test-unit:
    pnpm exec vitest run --project unit

# Main integration suite
test-integration:
    pnpm exec vitest run --project integration

# Tests related to the staged files
test-related:
    #!/usr/bin/env bash
    set -euo pipefail
    files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx)$' || true)
    if [ -z "$files" ]; then
      echo "No staged TypeScript files — nothing related to run."
      exit 0
    fi
    pnpm exec vitest related --run $files

# End-to-end flows (Playwright)
test-e2e:
    pnpm --filter @project/tests exec playwright test --config playwright.config.ts

# Live services/LLM tests — never implicit (none defined yet)
test-live:
    @echo "No live services or LLM providers in this project yet."
    @echo "When they appear, add tests under tests/live/ and wire them here (never in the fast lane)."

# Suite with coverage and ratchet thresholds
coverage:
    pnpm exec vitest run --coverage

# Raise coverage thresholds to the current values (only ever UP)
coverage-raise: coverage
    node tools/scripts/coverage-raise.ts

# Critical subset (≤ 20s)
smoke:
    pnpm exec vitest run --project integration tests/integration/smoke.test.ts

# Bun compatibility suite
bun-smoke:
    #!/usr/bin/env bash
    set -euo pipefail
    if command -v bun >/dev/null 2>&1; then
      bun run tools/scripts/bun-smoke.ts
    else
      echo "⚠️  bun not found — skipping compatibility suite (blocking in CI; run \`mise install\`)"
    fi

# Report-only guards (Vademecum §10)
guards:
    node tools/scripts/guards.ts

# --- gates -----------------------------------------------------------------------
# precommit/prepush eseguono i check via tools/scripts/run-checks.sh:
# - con GNU parallel i check girano in parallelo ma stdout/stderr restano
#   raggruppati per comando nell'ordine originale; senza, tornano sequenziali
#   (parallel è un'accelerazione opzionale, non pinnabile via mise);
# - fail-late: tutti i check girano sempre anche dopo un fallimento e il gate
#   fallisce alla fine, così un solo giro riporta tutti i problemi;
# - su terminale interattivo i colori dei tool sono forzati (FORCE_COLOR,
#   JUST_COLOR, RUN_CHECKS_COLORS); con NO_COLOR settata o output su pipe
#   l'output resta plain (meno ANSI, meno token per gli agenti);
# - su whoami=caio i check girano sotto nice -n 19 (mai in CI).

# CodeScene Code Health gate on staged/modified files (local, fresh data)
codescene-safeguard:
    python3 .kilo/scripts/codescene-gate.py staged

# CodeScene Code Health gate on the branch change-set vs a base ref (local, fresh data)
codescene-changeset base="origin/main":
    python3 .kilo/scripts/codescene-gate.py changeset --base-ref {{ base }}

# CodeScene Code Health ratchet gate (project-level Hotspot and Average floors)
codescene-ratchet:
    tools/scripts/codescene-ratchet.sh

# Fast checks on staged/related files (pre-commit hook)
precommit:
    #!/usr/bin/env bash
    set -euo pipefail
    scope=$(node tools/scripts/diff-scope.ts --staged {{ DOCS_ONLY_PATTERNS }})
    if [ "$scope" = "docs-only" ]; then
      tools/scripts/run-checks.sh "just docs-check" "just workflows-check"
      exit 0
    fi
    # Tutti i check sono read-only: nessun ordine di dipendenza, solo ordine di stampa.
    tools/scripts/run-checks.sh \
      "just codescene-safeguard" \
      "just format-check" \
      "just lint" \
      "just shell-check" \
      "just docs-check" \
      "just secrets-staged" \
      "just test-related"

# Static analysis and main integration suites (pre-push hook)
prepush:
    #!/usr/bin/env bash
    set -euo pipefail
    scope=$(node tools/scripts/diff-scope.ts --prepush {{ DOCS_ONLY_PATTERNS }})
    if [ "$scope" = "docs-only" ]; then
      tools/scripts/run-checks.sh "just docs-check" "just workflows-check"
      exit 0
    fi
    # Fail-late anche fra le onde: se l'analisi statica fallisce le suite di
    # test girano comunque, così un solo giro riporta tutti i problemi.
    rc=0
    # Onda 1: analisi statica, tutta read-only (biome, oxlint, shellcheck, tsc
    # --noEmit, knip, depcruise, markdownlint, cspell, lychee, actionlint,
    # zizmor, gitleaks, CodeScene).
    tools/scripts/run-checks.sh \
      "just format-check" \
      "just lint" \
      "just shell-check" \
      "just typecheck" \
      "just dead-code" \
      "just arch" \
      "just docs-check" \
      "just workflows-check" \
      "just secrets" \
      "just codescene-changeset" || rc=1
    # Onda 2: suite vitest in parallelo fra loro, ma separate dall'onda statica
    # per non contendere CPU con le scansioni whole-repo (tsc, knip, depcruise).
    tools/scripts/run-checks.sh \
      "just test-unit" \
      "just test-integration" \
      "just smoke" \
      "just coverage" || rc=1
    exit "$rc"

# Exact local replica of the CI pipeline
ci: format-check lint shell-check typecheck dead-code arch docs-check workflows-check secrets
    just test-unit
    just test-integration
    just coverage
    just smoke
    just bun-smoke
    just test-e2e
