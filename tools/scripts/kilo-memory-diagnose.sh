#!/usr/bin/env bash
# Diagnostica rapida dello stato della memoria Kilo per il progetto corrente.
# Uso: tools/scripts/kilo-memory-diagnose.sh
# Uscita: 0 se tutto ok, 1 se la memoria è disabilitata o il progetto non è legato.
set -euo pipefail

KILO_DATA="${HOME}/.local/share/kilo"
MEMORY_DIR="${KILO_DATA}/memory"
DB="${KILO_DATA}/kilo.db"

green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
red() { printf '\033[0;31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$*"; }
blue() { printf '\033[0;34m%s\033[0m\n' "$*"; }

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || {
  red "❌ Non sei in un repository git."
  exit 1
}

cd "$repo_root"
project_name=$(basename "$repo_root")
blue "== Kilo Memory Diagnostic: ${project_name} =="

# --- 1. Verifica directory Kilo Data --------------------------------------------------------
if [ ! -d "${KILO_DATA}" ]; then
  red "❌ Kilo data directory non trovata: ${KILO_DATA}"
  red "   Kilo Memory non è mai stato inizializzato su questa macchina."
  exit 1
fi

green "✅ Kilo data directory trovata: ${KILO_DATA}"

# --- 2. Cerca il progetto nel DB Kilo (project_directory) -----------------------------------
if command -v python3 >/dev/null 2>&1 && [ -f "${DB}" ]; then
  project_hash=$(python3 - "$repo_root" "$DB" <<'PY' 2>/dev/null || true
import sqlite3, sys
root, db = sys.argv[1], sys.argv[2]
conn = sqlite3.connect(db)
cur = conn.cursor()
cur.execute("""
  SELECT p.id FROM project_directory pd
  JOIN project p ON p.id = pd.project_id
  WHERE pd.directory = ?
""", (root,))
row = cur.fetchone()
if row:
    print(row[0])
PY
)
  if [ -n "${project_hash:-}" ]; then
    green "✅ Progetto legato in kilo.db: hash=${project_hash}"
  else
    yellow "⚠️  Progetto NON trovato in kilo.db per directory $(realpath "$repo_root")"
    yellow "    Possibili cause: workspace multi-root, cartella mai aperta in VS Code, o binding scaduto."
  fi
else
  yellow "⚠️  python3 non disponibile o kilo.db assente — salto verifica DB"
fi

# --- 3. Cerca la directory memory del progetto ------------------------------------------------
if [ -d "${MEMORY_DIR}" ]; then
  canonical_path=$(realpath "$repo_root")
  memory_project_dir=$(python3 - "$canonical_path" "$MEMORY_DIR" <<'PY' 2>/dev/null || true
import json, os, sys
canonical, base = sys.argv[1], sys.argv[2]
for d in os.listdir(base):
    manifest = os.path.join(base, d, "manifest.json")
    if os.path.exists(manifest):
        with open(manifest) as f:
            data = json.load(f)
        if data.get("canonical") == canonical:
            print(os.path.join(base, d))
PY
)

  if [ -n "${memory_project_dir:-}" ] && [ -d "${memory_project_dir}" ]; then
    folder_name=$(basename "${memory_project_dir}")
    green "✅ Directory memory trovata: ${folder_name}"

    if [ -f "${memory_project_dir}/state.json" ]; then
      enabled=$(jq -r '.enabled // "unknown"' "${memory_project_dir}/state.json" 2>/dev/null || echo "unknown")
      auto_inject=$(jq -r '.autoInject // "unknown"' "${memory_project_dir}/state.json" 2>/dev/null || echo "unknown")
      last_injected=$(jq -r '.stats.lastInjectedAt // 0' "${memory_project_dir}/state.json" 2>/dev/null || echo "0")
      last_session=$(jq -r '.stats.lastInjectedSessionID // "n/a"' "${memory_project_dir}/state.json" 2>/dev/null || echo "n/a")

      if [ "${enabled}" = "true" ]; then
        green "✅ Kilo Memory abilitata (enabled=true)"
      else
        red "❌ Kilo Memory disabilitata (enabled=${enabled})"
      fi

      if [ "${auto_inject}" = "true" ]; then
        green "✅ Auto-inject attivo (autoInject=true)"
      else
        yellow "⚠️  Auto-inject disattivato (autoInject=${auto_inject})"
      fi

      if [ "${last_injected}" != "0" ] && [ "${last_injected}" != "n/a" ]; then
        last_injected_sec=$((last_injected / 1000))
        last_injected_human=$(date -u -d "@${last_injected_sec}" +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null || date -u -r "${last_injected_sec}" +"%Y-%m-%d %H:%M:%S UTC")
        green "✅ Ultima iniezione: ${last_injected_human} (sessione ${last_session})"
      else
        yellow "⚠️  Nessuna iniezione registrata"
      fi
    else
      yellow "⚠️  state.json non trovato in ${memory_project_dir}"
    fi
  else
    yellow "⚠️  Nessuna directory memory trovata con canonical=${repo_root}"
  fi
else
  yellow "⚠️  Directory memory non trovata: ${MEMORY_DIR}"
fi

# --- 4. Verifica repository memory bank -------------------------------------------------------
if [ -f "docs/memory/project.md" ] && [ -f "docs/memory/environment.md" ]; then
  green "✅ Repository memory bank presente in docs/memory/"
else
  yellow "⚠️  Repository memory bank assente o incompleto (docs/memory/)"
fi

# --- 5. Confronto rapido dimensioni Kilo memory vs repo memory bank --------------------------
if [ -d "${memory_project_dir:-}" ] && [ -d "docs/memory" ]; then
  kilo_text_bytes=$(find "${memory_project_dir}" -maxdepth 1 -type f \( -name '*.md' -o -name '*.kmem' \) -print0 2>/dev/null | xargs -0 stat -c %s 2>/dev/null | awk '{s+=$1} END {print s+0}')
  repo_text_bytes=$(find docs/memory -maxdepth 2 -type f -name '*.md' -print0 2>/dev/null | xargs -0 stat -c %s 2>/dev/null | awk '{s+=$1} END {print s+0}')
  blue "-- Dimensioni testo --"
  blue "   Kilo memory store: ${kilo_text_bytes} bytes"
  blue "   docs/memory bank:  ${repo_text_bytes} bytes"
  if [ "${kilo_text_bytes}" -gt 0 ] && [ "${repo_text_bytes}" -gt 0 ]; then
    green "✅ Entrambi i repository contengono memoria testuale."
  fi
fi

# --- 6. Suggerimenti se il messaggio "No active project for memory" persiste ------------------
blue "-- Azioni suggerite se il pannello Kilo Memory è vuoto --"
blue "   1. Apri un file del progetto (es. AGENTS.md) nell'editor prima di aprire il pannello."
blue "   2. Scrivi '/memory status' nella chat di Kilo Code per verificare l'associazione."
blue "   3. Riapri la cartella come singolo workspace (non multi-root) e ricarica la finestra."
blue "   4. Controlla VS Code → Output → Kilo Code per errori di binding."

exit 0
