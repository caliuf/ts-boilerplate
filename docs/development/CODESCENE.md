# CodeScene

Code Health e debito tecnico per gli agenti, via MCP e REST API. Decisione: [ADR-0006](../architecture/adr/0006-codescene-mcp.md). Non è un hook git né una recipe `just`: quando l'MCP è connesso è comunque obbligatorio usarlo invece di indovinare la maintainability.

**Quale strumento usare:**

- **MCP** per i check a livello di file (`code_health_score`, `code_health_review`, `pre_commit_code_health_safeguard`) e per l'analisi del change-set (`analyze_change_set`). Questi girano in locale sul working tree, quindi producono dati sempre freschi.
- **REST API** per il ratchet progetto (`just codescene-ratchet`), perché Hotspot e Average Code Health non sono esposti dai tool MCP. Il ratchet è progettuale e legge la scansione Cloud, che è in ritardo rispetto ai commit locali: per questo **non** è un gate di commit/push.

## Cosa c'è già

| Pezzo | Dove |
| --- | --- |
| Progetto Cloud | `ts-boilerplate`, id `83744` |
| Pin Kilo di questo repo | `.kilo/kilo.jsonc` → `CS_DEFAULT_PROJECT_ID=83744` (nome atteso dal server MCP esterno) |
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
| Prima di un commit di codice toccato dall'agente | `pre_commit_code_health_safeguard` (o `just codescene-safeguard`) | Regressioni su staged/modified |
| Prima di aprire una PR | `analyze_change_set` (o `just codescene-changeset`) | Branch vs base, verdetto improved/degraded/stable |
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
- Mai committare token (`CODESCENE_API_TOKEN`, contenuto di `~/.codescene/token`, contenuto di `~/.config/codehealth-mcp/`).
- Non è un sostituto di `just precommit` / `just prepush`: si aggiunge, non li rimpiazza.

## Setup (umano, una tantum)

Già fatto su questa macchina. Per un clone nuovo o un altro computer:

1. Account CodeScene e progetto Cloud che punta a questo git remote.
2. In Kilo: server MCP `codescene` con comando `npx -y @codescene/codehealth-mcp`.
3. Login: `npx -y @codescene/codehealth-mcp auth`.
4. Pin: `CS_DEFAULT_PROJECT_ID` (o `set_config default_project_id`) all'id del progetto Cloud. Questa variabile è necessaria al server MCP CodeScene; nel resto del progetto usa `CODESCENE_PROJECT_ID`.
5. Crea un **CodeScene REST API token** nel progetto Cloud e salvalo in `~/.codescene/token`, oppure esporta `CODESCENE_API_TOKEN`. L'OAuth token dell'MCP non basta per le chiamate API progetto usate dal ratchet.
6. Riavviare la sessione Kilo.

In un progetto derivato da questo boilerplate: crea un progetto Cloud nuovo, aggiorna l'id in `.kilo/kilo.jsonc` e in questa pagina. Non riusare `83744`.

## Gate locali (pre-commit e pre-push)

I gate di commit e push usano le analisi **locali** del server MCP (CLI embedded, working tree), quindi misurano sempre i dati freschi di ciò che stai committando o pushando, non la scansione Cloud che è in ritardo rispetto ai commit locali.

- `just codescene-safeguard` (in `just precommit`): esegue `pre_commit_code_health_safeguard` sui file staged/modificati. Fallisce se un file toccato degrada il Code Health.
- `just codescene-changeset` (in `just prepush`): esegue `analyze_change_set` sul change-set del branch rispetto a `origin/main` (override con `just codescene-changeset <base>`). Fallisce se il change-set introduce regressioni.

Entrambi i gate passano per `.kilo/scripts/codescene-gate.py`, che parla MCP su stdio, estrae `quality_gates` dal payload e restituisce exit code non zero su fallimento (`0` passed, `1` gates falliti, `2` tool non raggiungibile). Richiedono la sessione OAuth locale (`~/.config/codehealth-mcp/`), non il token REST API.

## Ratchet progetto (informativo, non gate)

`just codescene-ratchet` legge `.codescene-thresholds` e confronta le soglie con i punteggi correnti di Hotspot e Average Code Health del progetto Cloud.

- Se uno dei due punteggi è inferiore alla soglia, il gate fallisce: refactor prima di alzare il pavimento.
- Se i punteggi sono migliori, lo script aggiorna `.codescene-thresholds` con i nuovi valori e fallisce intenzionalmente, in modo che il nuovo pavimento venga committato.
- Le soglie sono un cricchetto: salgono solo, non scendono.

Poiché legge la scansione Cloud (che riflette `origin/main`, non il working tree), il ratchet **non** è nei gate di commit/push: va eseguito dopo il push, quando la scansione Cloud si è aggiornata, per alzare i pavimenti. Usarlo come gate di commit bloccherebbe su dati vecchi.

## Ratchet in CI (GitHub Actions)

In CI non c'è sessione MCP e non si possono committare secret. Configurare il ratchet come step del workflow che usa il progetto Cloud:

1. Crea un repository secret `CODESCENE_API_TOKEN` con il CodeScene REST API token.
2. Opzionalmente crea un repository variable `CODESCENE_PROJECT_ID` con l'id del progetto Cloud (es. `83744`). Se omesso, lo script legge il valore da `.kilo/kilo.jsonc` (dove è salvato come `CS_DEFAULT_PROJECT_ID` per il server MCP).
3. Esegui lo script nello step di pre-commit/quality gate:

```yaml
- name: CodeScene ratchet
  env:
    CODESCENE_API_TOKEN: ${{ secrets.CODESCENE_API_TOKEN }}
    CODESCENE_PROJECT_ID: ${{ vars.CODESCENE_PROJECT_ID }}
  run: tools/scripts/codescene-ratchet.sh
```

Il fallimento dello script blocca il workflow esattamente come blocca il pre-commit locale.
