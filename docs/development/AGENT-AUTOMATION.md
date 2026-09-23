# Automazione del flusso di lavoro (agenti e human)

Script che tolgono il lavoro ripetitivo dal flusso "un task = un branch = una PR". Stanno in `tools/scripts/`, sono committati e girano identici in main, nei worktree e in CI. Ognuno stampa il contesto che serve in un colpo solo, invece di richiedere N comandi esplorativi.

| Script | Quando | Cosa fa |
|---|---|---|
| `tools/scripts/agent-briefing.sh` | a inizio task | Dump unico del contesto: repo/worktree, git status, ultime commit, stato dei tool dei gate, memoria di progetto, draft di commit, PR e issue aperte. Read-only. `--no-prs` salta la parte GitHub. |
| `tools/scripts/gh-prs.sh` | per orientarsi sulle PR | `list` (aperte + branch + autore), `all` (anche chiuse), `dependabot` (PR aperte dall'applicazione Dependabot), `view <n>...` (body, file, check di una o più PR), `content` (contenuto di tutte le aperte). Read-only; per comment/close/merge vedi `GITHUB-CLI.md`. |
| `tools/scripts/finish-task.sh` | a fine task, solo su branch dedicato e con consenso esplicito | `commit` → `push -u` → apre la PR **solo se il branch non ne ha già una**. Verifica prima che gli hook versionati siano attivi. `--all` fa `git add -A`: usarlo solo dopo aver controllato ogni file; preferire lo staging esplicito. `-m "msg"` usa un messaggio al posto di `tmp/commit-message.md`. |

## Perché `finish-task.sh` non lancia `just precommit` / `just prepush`

Gli hook git in `.githooks/` lo fanno già: `git commit` esegue `just precommit`, `git push` esegue `just prepush`. Rilanciarli a mano prima del commit/push duplica il lavoro (è il back-and-forth che questo script elimina). Se un gate fallisce, l'hook abortisce commit/push e lo script si ferma lì.

Conseguenza pratica per gli agenti autorizzati: **non** fare `just precommit && git commit && just prepush && git push`. Dopo aver eseguito il feedback loop previsto, basta `tools/scripts/finish-task.sh` (o, a mano, `git commit` e `git push`: gli hook coprono i gate). Senza consenso esplicito a commit, push e PR, fermati al report.

Se `gh` non è disponibile, lo script può avere già eseguito commit e push ma termina con errore e non considera il task concluso: crea la PR manualmente e verifica i check prima di riportare il completamento.

## Ciclo canonico per un agente

1. **Avvio**: esegui `agent-briefing.sh` (con `--no-prs` se GitHub non è nel perimetro), leggi `AGENTS.md`, gli indici e i record pertinenti, poi verifica `just doctor` e `just smoke` prima di iniziare un task su una base non verde.
2. **Lavoro**: stabilisci branch/worktree e baseline, usa CodeScene quando disponibile, lavora test-first (`red → green → refactor`) e aggiorna la memoria repository nel file appropriato quando nasce un fatto o una decisione durevole.
3. **Consegna**: esegui `just prepush`, riepiloga gate e rischi, e usa `finish-task.sh` solo dopo consenso esplicito a commit, push e PR. Se il consenso non c'è, lascia le modifiche nel working tree e ferma l'automazione al report.

## Toolchain visibile ovunque (fix dei "tool not found")

I gate (`docs-check`, `workflows-check`, `secrets`, `shell-check`, `bun-smoke`) chiamano `lychee`, `actionlint`, `zizmor`, `gitleaks`, `shellcheck`, `bun`: tool pinnati in `.mise.toml` e **bloccanti in CI**. In locale venivano saltati con un warning quando la shell non aveva l'hook mise attivo (agenti, subshell CI, worktree con direnv bloccato).

Fix sistemico in testa al `justfile`:

```just
export PATH := env_var('HOME') / ".local/share/mise/shims" + ":" + env_var('PATH')
```

mise mantiene uno shim per tool in `~/.local/share/mise/shims`; ogni shim risolve la versione dal `.mise.toml` trovato risalendo dalla cwd della recipe. Così ogni recipe vede la toolchain pinnata senza hook di shell e senza `mise exec` per comando. Se la directory non esiste (tool installati a mano), la voce in più nel PATH è innocua e si ricade sul PATH ambiente: chi non usa mise non è penalizzato.

Regola: **non ignorare mai un warning "tool non trovato"**. Non è rumore atteso: è un sintomo di PATH senza shim mise. Risalire al PATH, non accettare lo skip.

## Worktree e direnv

`.kilo/setup-script.sh` (repo principale, eseguito da Agent Manager alla creazione del worktree) ora fa anche `direnv allow .`: ogni worktree ha il proprio inode di `.envrc`, quindi l'allow dato sul main repo non si propaga e i wrapper in `bin/` fallirebbero il preflight con "direnv: error ... .envrc is blocked". Senza questo passo bastava `cd` nel worktree per vedere l'errore.

## Note operative per gli agenti

- Per una verifica preliminare su un file usa il tool locale tramite `pnpm exec` (`pnpm exec cspell lint file.md`, `pnpm exec markdownlint-cli2 file`) **senza** staggare: stagiare per far girare un gate e poi fare unstage è un giro inutile, e aggiungere file di supporto allo staging può cambiare il diff-scope (es. esce dal fast path docs-only) attivando gate extra.
- `agent-briefing.sh` è il primo comando di un task; sostituisce la sequenza manuale git status + git log + controllo presenza tool + lettura memoria + lista PR. Non sostituisce `just doctor`, che va eseguito dopo il setup o quando il preflight leggero segnala problemi.
