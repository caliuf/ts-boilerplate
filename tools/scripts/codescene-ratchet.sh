#!/usr/bin/env bash
# CodeScene Code Health ratchet gate.
# Compares the project's current Hotspot and Average Code Health against the
# floors recorded in .codescene-thresholds. Improves the floor when the remote
# score is better, fails when it is worse.
#
# This gate uses the CodeScene REST API because project-level Hotspot and
# Average Code Health are not exposed through the CodeScene MCP tools. The MCP
# remains the right tool for file-level reviews and change-set analysis.
#
# Configuration:
#   CODESCENE_API_TOKEN    CodeScene REST API token (Bearer). Required.
#   CODESCENE_PROJECT_ID   CodeScene Cloud project id.
#
# If CODESCENE_API_TOKEN is not set, the script reads ~/.codescene/token.
# If CODESCENE_PROJECT_ID is not set, the script reads the project id from
# .kilo/kilo.jsonc (where the MCP server is pinned as CS_DEFAULT_PROJECT_ID).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
THRESHOLDS_FILE="${ROOT}/.codescene-thresholds"

fail() {
  echo "❌ $1" >&2
  exit 1
}

warn() {
  echo "⚠️  $1" >&2
}

# --- token -------------------------------------------------------------------

token="${CODESCENE_API_TOKEN:-${CODESCENE_TOKEN:-}}"
if [ -z "$token" ] && [ -f "${HOME}/.codescene/token" ]; then
  token="$(cat "${HOME}/.codescene/token")"
fi

if [ -z "$token" ]; then
  fail "CodeScene API token not found.

Set CODESCENE_API_TOKEN or write the token to ~/.codescene/token.
Create a token in CodeScene Cloud under the project settings."
fi

# --- project id --------------------------------------------------------------

project_id="${CODESCENE_PROJECT_ID:-}"
if [ -z "$project_id" ] && [ -f "${ROOT}/.kilo/kilo.jsonc" ]; then
  # .kilo/kilo.jsonc pins the project id under the name expected by the external
  # CodeScene MCP server (CS_DEFAULT_PROJECT_ID).
  project_id="$(grep -oP '"CS_DEFAULT_PROJECT_ID"\s*:\s*"\K[^"]+' "${ROOT}/.kilo/kilo.jsonc" || true)"
fi

if [ -z "$project_id" ]; then
  fail "CodeScene project id not found.

Set CODESCENE_PROJECT_ID or add CS_DEFAULT_PROJECT_ID to .kilo/kilo.jsonc under mcp.codescene.environment."
fi

# --- thresholds --------------------------------------------------------------

if [ ! -f "$THRESHOLDS_FILE" ]; then
  fail "Threshold file not found: ${THRESHOLDS_FILE}"
fi

read_threshold() {
  local name="$1"
  local value
  value="$(grep -E "^${name}=" "$THRESHOLDS_FILE" | cut -d= -f2- | tr -d '[:space:]' || true)"
  if [ -z "$value" ]; then
    fail "Missing threshold: ${name} in ${THRESHOLDS_FILE}"
  fi
  echo "$value"
}

hotspot_floor="$(read_threshold HOTSPOT_THRESHOLD)"
average_floor="$(read_threshold AVERAGE_THRESHOLD)"

# --- fetch remote metrics ----------------------------------------------------

api_url="https://api.codescene.io/v2/projects/${project_id}?fields=analysis.code_health.now,analysis.hotspot_code_health.now"
response="$(curl -sS -H "Authorization: Bearer ${token}" "$api_url" 2>&1)" || fail "Failed to contact CodeScene API"

if [ -z "$response" ]; then
  fail "Empty response from CodeScene API"
fi

# Hide the token if it ever leaks into error output.
response="${response//$token/\"***\"}"

parse_metric() {
  local path="$1"
  node -e "
    const r = JSON.parse(process.argv[1]);
    const path = '${path}'.split('.');
    let v = r;
    for (const p of path) v = v?.[p];
    console.log(typeof v === 'number' ? v.toFixed(2) : '');
  " "$response"
}

if echo "$response" | grep -q '"status"\s*:'; then
  fail "CodeScene API error: ${response:0:400}"
fi

hotspot_current="$(parse_metric 'analysis.hotspot_code_health.now')"
average_current="$(parse_metric 'analysis.code_health.now')"

if [ -z "$hotspot_current" ] || [ -z "$average_current" ]; then
  fail "Could not parse Code Health metrics from response: ${response:0:400}"
fi

# --- ratchet -----------------------------------------------------------------

compare() {
  awk -v a="$1" -v b="$2" 'BEGIN { if (a < b) print "below"; else if (a > b) print "above"; else print "equal" }'
}

updated=0
new_hotspot_floor="$hotspot_floor"
new_average_floor="$average_floor"

case "$(compare "$hotspot_current" "$hotspot_floor")" in
  below)
    fail "Hotspot Code Health ${hotspot_current} is below the ratchet floor ${hotspot_floor}.
Refactor the worst hotspots before committing (run: just codescene-ratchet)."
    ;;
  above)
    new_hotspot_floor="$hotspot_current"
    updated=1
    ;;
  equal) ;;
esac

case "$(compare "$average_current" "$average_floor")" in
  below)
    fail "Average Code Health ${average_current} is below the ratchet floor ${average_floor}.
Refactor before committing (run: just codescene-ratchet)."
    ;;
  above)
    new_average_floor="$average_current"
    updated=1
    ;;
  equal) ;;
esac

if [ "$updated" -eq 1 ]; then
  cat > "$THRESHOLDS_FILE" <<EOF
HOTSPOT_THRESHOLD=${new_hotspot_floor}
AVERAGE_THRESHOLD=${new_average_floor}
EOF
  echo "🔧 CodeScene floors ratcheted up:"
  echo "   Hotspot: ${hotspot_floor} → ${new_hotspot_floor}"
  echo "   Average: ${average_floor} → ${new_average_floor}"
  fail "Thresholds updated. Stage .codescene-thresholds, commit it, then retry."
fi

echo "✅ CodeScene ratchet passed (Hotspot ${hotspot_current}, Average ${average_current})"
exit 0
