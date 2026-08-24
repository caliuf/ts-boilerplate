# CodeScene

Code Health e debito tecnico per gli agenti, via MCP. Decisione: [ADR-0006](../architecture/adr/0006-codescene-mcp.md). Non è un hook git né una recipe `just`: quando l'MCP è connesso è comunque obbligatorio usarlo invece di indovinare la maintainability.

## Cosa c'è già

| Pezzo | Dove |
| --- | --- |
| Progetto Cloud | `ts-boilerplate`, id `83744` |
| Pin Kilo di questo repo | `.kilo/kilo.jsonc` → `CS_DEFAULT_PROJECT_ID=83744` |
| Server MCP (tutti i repo) | `~/.config/kilo/kilo.jsonc` → `mcp.codescene` = `npx -y @codescene/codehealth-mcp` |
| Sessione OAuth | `~/.config/codehealth-mcp/` (fuori dal git) |

L'estensione VS Code "CodeScene CodeHealth MCP" serve Copilot, non Kilo. Kilo parla solo al server registrato in `kilo.jsonc`.

## Prerequisiti per l'agente

1. Il server `codescene` risulta connesso nella sessione (riavvia o ricarica i server MCP se lo hai appena aggiunto).
2. Sessione autenticata. Se i tool rispondono unauthenticated: chiedere all'utente di eseguire `npx -y @codescene/codehealth-mcp auth` (apre il browser) oppure chiamare il tool MCP `login`.
3. Progetto selezionato. Con il pin `83744` `select_project` restituisce questo repo già bloccato. Senza pin, chiamare `select_project` e scegliere `ts-boilerplate`.

Se l'MCP non è raggiungibile, riportare il blocker. Non dichiarare un check CodeScene passato.

## Quando chiamare cosa

| Momento | Tool | Perché |
| --- | --- | --- |
| Prima di toccare un file, o per triage | `code_health_score` | Score 1.0–10.0, veloce |
| Prima di refactoring o per capire un smell | `code_health_review` | Score + findings azionabili |
| Prima di un commit di codice toccato dall'agente | `pre_commit_code_health_safeguard` | Regressioni su staged/modified |
| Prima di aprire una PR | `analyze_change_set` | Branch vs base, verdetto improved/degraded/stable |
| Cosa migliorare nel repo | `list_technical_debt_hotspots_for_project` | Hotspot ad alto impatto |
| Un file specifico già in hotspot | `list_technical_debt_hotspots_for_project_file` | Metriche di quel path |
| Goal di debito già aperti in Cloud | `list_technical_debt_goals_for_project` / `_for_project_file` | Solo file con goal non vuoti |
| Chi conosce un path | `code_ownership_for_path` | Owner / reviewer probabili |
| Business case di un refactor | `code_health_refactoring_business_case` | Stima velocità/difetti |
| Setup rotto | `verify_installation` / `get_config` | Diagnosi, non indovinare |

I tool `*_for_project*` richiedono CodeScene Core (OAuth o PAT) e il progetto selezionato. Score, review, safeguard e change-set girano in locale sul working tree.

## Regole

- Code Health è la fonte di verità sulla maintainability. Non stimarla a occhio.
- Target di lavoro nuovo: non lasciare un file peggio di come lo hai trovato. Se safeguard o change-set segnalano regressione: `code_health_review`, refactor, misura di nuovo. Non dichiarare fatto.
- Vietato aggirare: niente ignore-list, niente soglie abbassate, niente “skip perché l'MCP è scomodo”.
- Mai committare token (`CS_ACCESS_TOKEN`, contenuto di `~/.config/codehealth-mcp/`).
- Non è un sostituto di `just precommit` / `just prepush`: si aggiunge, non li rimpiazza.

## Setup (umano, una tantum)

Già fatto su questa macchina. Per un clone nuovo o un altro computer:

1. Account CodeScene e progetto Cloud che punta a questo git remote.
2. In Kilo: server MCP `codescene` con comando `npx -y @codescene/codehealth-mcp`.
3. Login: `npx -y @codescene/codehealth-mcp auth`.
4. Pin: `CS_DEFAULT_PROJECT_ID` (o `set_config default_project_id`) all'id del progetto Cloud.
5. Riavviare la sessione Kilo.

In un progetto derivato da questo boilerplate: crea un progetto Cloud nuovo, aggiorna l'id in `.kilo/kilo.jsonc` e in questa pagina. Non riusare `83744`.
