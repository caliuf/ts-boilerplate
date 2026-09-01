#!/usr/bin/env bash
# gh-prs.sh — GitHub PR helper: one command to see all PRs and their content.
#
# Usage:
#   tools/scripts/gh-prs.sh                 list open PRs with checks rollup
#   tools/scripts/gh-prs.sh all             include closed/merged PRs
#   tools/scripts/gh-prs.sh view <n> [<m>]  full content of PR(s): body, files, checks
#   tools/scripts/gh-prs.sh content         content of every open PR (careful: verbose)
#
# Read-only. For comment/close/merge follow docs/development/GITHUB-CLI.md.
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI not found." >&2
  exit 1
fi

mode="${1:-list}"

pr_content() {
  local n="$1"
  echo "──────────────── PR #$n ────────────────"
  gh pr view "$n" \
    --json number,title,state,author,headRefName,baseRefName,body,url,files,statusCheckRollup \
    --template '{{.title}} ({{.state}})
{{.url}}
{{.headRefName}} → {{.baseRefName}} · by {{.author.login}}

{{.body}}

Files:
{{range .files}}  +{{.additions}} -{{.deletions}}  {{.path}}
{{end}}
Checks:
{{range .statusCheckRollup}}  {{.status}} {{.conclusion}}  {{.name}}
{{end}}'
}

case "$mode" in
  list)
    gh pr list --state open --limit 50 \
      --json number,title,author,headRefName,isDraft,updatedAt,statusCheckRollup \
      --template '{{range .}}#{{.number}} {{.title}}
    branch: {{.headRefName}} · by {{.author.login}}{{if .isDraft}} · DRAFT{{end}} · updated {{timeago .updatedAt}}
{{end}}'
    ;;
  all)
    gh pr list --state all --limit 50 \
      --json number,title,state,author,headRefName,updatedAt \
      --template '{{range .}}#{{.number}} [{{.state}}] {{.title}} ({{.headRefName}}, by {{.author.login}}){{"\n"}}{{end}}'
    ;;
  view)
    shift
    if [ "$#" -eq 0 ]; then
      echo "Usage: $0 view <n> [<m> ...]" >&2
      exit 2
    fi
    for n in "$@"; do
      pr_content "$n"
    done
    ;;
  content)
    numbers=$(gh pr list --state open --limit 50 --json number --template '{{range .}}{{.number}}{{"\n"}}{{end}}')
    if [ -z "$numbers" ]; then
      echo "No open PRs."
      exit 0
    fi
    for n in $numbers; do
      pr_content "$n"
    done
    ;;
  *)
    echo "Unknown mode: $mode" >&2
    echo "Usage: $0 [list|all|view <n>...|content]" >&2
    exit 2
    ;;
esac
