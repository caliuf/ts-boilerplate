#!/usr/bin/env bash
# agent-briefing.sh — one-shot context dump for the start of a task.
#
# Prints everything an agent (or a human) needs before touching the code, in a
# single call, so the workflow does not start with N exploratory round-trips:
# repo/worktree identity, git state, quality-gate tooling, project memory,
# open PRs and issues. Read-only: never mutates the working tree.
#
# Usage: tools/scripts/agent-briefing.sh [--no-prs]
#   --no-prs   skip the GitHub section (offline work, or no gh token).
set -euo pipefail

# Same toolchain visibility as the justfile: make the mise shims available even
# when this runs from a shell without the mise hook, so the tooling check below
# reflects what the gates will actually see.
if [ -d "$HOME/.local/share/mise/shims" ]; then
  export PATH="$HOME/.local/share/mise/shims:$PATH"
fi

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

with_prs=1
for arg in "$@"; do
  case "$arg" in
    --no-prs) with_prs=0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

section() {
  printf '\n=== %s ===\n' "$1"
}

section "Repo"
printf 'root:    %s\n' "$repo_root"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  common_dir=$(git rev-parse --git-common-dir 2>/dev/null || true)
  git_dir=$(git rev-parse --git-dir)
  if [ "$git_dir" != "$common_dir" ]; then
    printf 'worktree: yes (main repo: %s)\n' "$(cd "$common_dir/.." && pwd)"
  else
    printf 'worktree: no (main checkout)\n'
  fi
fi
printf 'remote:  %s\n' "$(git remote get-url origin 2>/dev/null || echo 'none')"

section "Git"
printf 'branch:  %s\n' "$(git branch --show-current)"
git status --short --branch
printf '\nlast commits:\n'
git --no-pager log --oneline -5

section "Gates tooling"
missing=0
for tool in node pnpm just mise direnv gitleaks actionlint zizmor lychee shellcheck parallel; do
  if command -v "$tool" >/dev/null 2>&1; then
    printf '  ok   %s\n' "$tool"
  else
    printf '  MISS %s  (blocking in CI — run: mise install)\n' "$tool"
    missing=1
  fi
done
if [ "$missing" -eq 1 ]; then
  printf '\nSome tools are missing. Do NOT ignore this: gates degrade to warnings\n'
  # shellcheck disable=SC2016
  printf 'locally but block in CI. Run `mise install` and re-run this briefing.\n'
fi

section "Project memory (docs/memory)"
for f in docs/memory/project.md docs/memory/environment.md; do
  if [ -f "$f" ]; then
    printf -- '--- %s ---\n' "$f"
    cat "$f"
  fi
done

section "Commit message draft (tmp/commit-message.md)"
if [ -f tmp/commit-message.md ]; then
  cat tmp/commit-message.md
else
  echo "(absent — create it when the task starts; see AGENTS.md)"
fi

if [ "$with_prs" -eq 1 ] && command -v gh >/dev/null 2>&1; then
  section "Open PRs (gh)"
  gh pr list --state open --limit 30 \
    --json number,title,author,headRefName,isDraft,updatedAt \
    --template '{{range .}}#{{.number}} {{.title}} ({{.headRefName}}, by {{.author.login}}, updated {{timeago .updatedAt}}){{"\n"}}{{end}}' \
    2>/dev/null || echo "(gh pr list failed — offline or missing scopes)"

  section "Open issues (gh)"
  gh issue list --state open --limit 20 \
    --json number,title,updatedAt \
    --template '{{range .}}#{{.number}} {{.title}} (updated {{timeago .updatedAt}}){{"\n"}}{{end}}' \
    2>/dev/null || echo "(gh issue list failed — offline or missing scopes)"
fi

section "Done"
echo "Context loaded. Next: read docs/PROJECT.md + docs/INDEX.md, then work test-first."
