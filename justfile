# Public task interface (Vademecum §5). Agents and humans use ONLY these
# recipes; package.json scripts are implementation details.
#
# Budgets: precommit ≤ 10s · smoke ≤ 20s · prepush ≤ 60s · full CI ≤ 10min.

set shell := ["bash", "-euo", "pipefail", "-c"]

# Docs-only fast path (Vademecum §5): the exact, complete list of path
# patterns. Protected by CODEOWNERS. A mixed diff always takes the full path.
DOCS_ONLY_PATTERNS := "^docs/ ^README\\.md$ ^AGENTS\\.md$ ^CLAUDE\\.md$ ^GEMINI\\.md$ ^CONTRIBUTING\\.md$ ^SECURITY\\.md$ ^CHANGELOG\\.md$ ^\\.github/workflows/ ^\\.githooks/"

# --- lifecycle -----------------------------------------------------------------

# Install dependencies, tools and git hooks
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

# Verify runtimes, tools and configuration
doctor:
    node tools/scripts/doctor.ts

# Start API + web dev servers
dev:
    pnpm --parallel --filter @project/api --filter @project/web run dev

# --- static analysis -------------------------------------------------------------

# Apply format and safe fixes
fix:
    pnpm exec biome check --write .

# Verify formatting and import organization
format-check:
    pnpm exec biome check .

# Full typecheck
typecheck:
    pnpm exec tsc -p tsconfig.json
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

# CodeScene Code Health gate on staged/modified files (local, fresh data)
codescene-safeguard:
    python3 .kilo/scripts/codescene-gate.py staged

# CodeScene Code Health gate on the branch change-set vs a base ref (local, fresh data)
codescene-changeset base="origin/main":
    python3 .kilo/scripts/codescene-gate.py changeset --base-ref {{base}}

# CodeScene Code Health ratchet gate (project-level Hotspot and Average floors)
codescene-ratchet:
    tools/scripts/codescene-ratchet.sh

# Fast checks on staged/related files (pre-commit hook)
precommit:
    #!/usr/bin/env bash
    set -euo pipefail
    scope=$(node tools/scripts/diff-scope.ts --staged {{DOCS_ONLY_PATTERNS}})
    if [ "$scope" = "docs-only" ]; then
      just docs-check
      just workflows-check
      exit 0
    fi
    just codescene-safeguard
    just format-check
    just lint
    just shell-check
    just docs-check
    if command -v gitleaks >/dev/null 2>&1; then
      gitleaks git --staged --redact --no-banner .
    else
      echo "⚠️  gitleaks not found — skipping staged secrets scan (blocking in CI; run \`mise install\`)"
    fi
    just test-related

# Static analysis and main integration suites (pre-push hook)
prepush:
    #!/usr/bin/env bash
    set -euo pipefail
    scope=$(node tools/scripts/diff-scope.ts --prepush {{DOCS_ONLY_PATTERNS}})
    if [ "$scope" = "docs-only" ]; then
      just docs-check
      just workflows-check
      exit 0
    fi
    just format-check
    just lint
    just shell-check
    just typecheck
    just dead-code
    just arch
    just docs-check
    just workflows-check
    just secrets
    just codescene-changeset
    just test-unit
    just test-integration
    just smoke
    just coverage

# Exact local replica of the CI pipeline
ci: format-check lint shell-check typecheck dead-code arch docs-check workflows-check secrets
    just test-unit
    just test-integration
    just coverage
    just smoke
    just bun-smoke
    just test-e2e
