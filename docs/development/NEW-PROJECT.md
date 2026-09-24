# Da boilerplate a progetto: guida di adozione

Cosa fare da quando prendi in mano questo boilerplate per iniziare un progetto nuovo. Il destinatario operativo è l'agente: tu incolli un prompt, lui legge questo file e ti guida. Non sei tenuto a leggerlo.

> Quando l'adozione è completa, cancella questo file e `docs/init/` dopo aver ripulito i riferimenti vivi e rieseguito i gate documentali.

## Modalità guidata dall'agente

Questa è la modalità di default. L'umano non esegue la guida da solo e non deve aprirla in un editor.

### Protocollo per l'agente

Se l'utente chiede di adottare il boilerplate, di essere guidato, o dice in sostanza «guarda NEW-PROJECT e fai tu le parti che ti competono»:

1. Leggi per intero questo file e [`GITHUB-CLI.md`](./GITHUB-CLI.md). Non chiedere all'utente di leggerli. Non incollare sezioni intere in chat.
2. Segui i passi 0–10 in ordine. Raggruppa il lavoro per attore, non per numero di passo.
3. Esegui tu, in un unico tratto, tutto l'Harness consecutivo (`just`, edit, `gh` dopo consenso esplicito per ogni scrittura su GitHub). Non scaricare sull'utente comandi che puoi lanciare tu.
4. Quando arrivano una o più azioni Utente consecutive, elenca **tutto il blocco** in una checklist (click path o comando interattivo per ciascuna). L'utente le esegue tutte e ti restituisce il controllo. Spezza il turno solo se in mezzo serve un'azione dell'agente. Niente ping-pong di un click alla volta.
5. Se manca un dato (nome, handle GitHub, visibilità, superfici da tenere), chiedilo subito, in blocco, prima del passo 2. Non interrogare a pioggia durante i passi.
6. Allinea il remote del derivato a questo boilerplate: squash, merge commit e rebase; **niente** `required_linear_history`; status check obbligatori sui job CI delle PR; bypass owner *Always*; `delete_branch_on_merge`. Lo squash resta comodo per le PR piccole; merge commit o rebase quando si vuole conservare i commit del branch.
7. Non creare il remote GitHub, non aprire PR e non toccare ruleset/security senza consenso esplicito. Se un `gh` viene rifiutato o risponde 403/404, fermati e riporta la risposta grezza.
8. Dopo un blocco Harness o un blocco Utente: una riga di stato e cosa farai al ritorno. In chiusura, la checklist finale compilata (fatto / saltato / bloccato).

### Prompt da incollare

Compila i campi tra parentesi uncinate (i `chiedimi` vanno lasciati così se non li sai ancora):

```text
Adotta questo boilerplate per il progetto "<NOME>".

Leggi docs/development/NEW-PROJECT.md (modalità guidata) e docs/development/GITHUB-CLI.md. Non farmeli leggere: guidami tu nell'ordine del file. Esegui tu tutto ciò che è Harness. Per ciò che è Utente dammi in un unico blocco tutte le azioni consecutive che posso fare io; le eseguo e ti restituisco il controllo. Spezza solo se in mezzo serve un'azione tua. Non creare remote GitHub né toccare ruleset/security senza consenso esplicito.

Dati:
- nome: <NOME>
- scope npm: @<nome>
- bin CLI: <nome>
- handle GitHub (CODEOWNERS): @<handle oppure chiedimi>
- visibilità repo: <public | private | chiedimi>
- licenza se pubblico: <MIT | Apache-2.0 | altra | chiedimi>
- superfici da tenere: <CLI, API, MCP, UI | chiedimi>
- merge: squash, merge commit e rebase; niente linear history obbligatoria

Parti dal passo 0.
```

Esempio compilato (progetto `aiboost`; handle, visibilità e superfici li chiede l'agente):

```text
Adotta questo boilerplate per il progetto "aiboost" usando il template guidato sopra.

Dati: scope npm @aiboost, bin CLI aiboost; chiedimi handle GitHub, visibilità e superfici da tenere. Mantieni squash, merge commit e rebase, senza linear history obbligatoria. Parti dal passo 0.
```

Il prompt minimale «guarda NEW-PROJECT e guidami passo passo facendo tu le parti che ti competono» è sufficiente *solo* se l'agente segue il protocollo sopra e chiede subito i dati mancanti. Meglio il template compilato: evita che parta senza nome o che ti rifili la guida intera.

I «prompt pronto» nei passi 2–8 restano per chi vuole eseguire un pezzo isolato; in modalità guidata non servirli all'utente, eseguili tu.

## Come leggere i ruoli

- **Utente**: interattivo, richiede un account, un browser, un segreto o una decisione di prodotto. L'agente non può farlo da solo.
- **Harness**: l'agente può eseguirlo con `gh`, `just` o edit del working tree, dopo aver letto [`GITHUB-CLI.md`](./GITHUB-CLI.md) e con consenso esplicito per ogni scrittura su GitHub.
- **Insieme**: l'umano decide, l'agente esegue e riporta i comandi.

Prima di qualsiasi operazione su PR, issue, check o impostazioni del repo via GitHub CLI, l'agente legge [`GITHUB-CLI.md`](./GITHUB-CLI.md), verifica `gh auth status` e non riprova un tool call rifiutato senza conferma.

## 0. Prerequisiti

Una volta per macchina.

Per l'utente:

- Account GitHub.
- Autenticazione GitHub CLI (flusso interattivo, apre il browser): `gh auth login`. Poi `gh auth status` deve mostrare scope `repo` (e `workflow` se dovrai toccare Actions oltre al push dei file già in `.github/`).
- Su Debian/Ubuntu: `just install` prepara i prerequisiti di sistema, installa mise se manca e i tool globali (`dotenv-cli`, `@colbymchenry/codegraph`). Non installa le dipendenze del repository.

Per l'harness (dopo che `just` e `gh` esistono):

- Verificare `just doctor` e `gh auth status`.
- Non sostituire `just install` con `just setup`: il primo tocca il sistema, il secondo prepara il clone.

Dettaglio tool e versioni: [`GETTING-STARTED.md`](./GETTING-STARTED.md).

## 1. Crea la copia

Copia, non fork: il boilerplate non deve restare `origin`.

```sh
git clone <url-di-questo-boilerplate> il-mio-progetto
cd il-mio-progetto
git remote remove origin
just setup                      # dipendenze, hook, Playwright, indice CodeGraph
just doctor                     # nessun ❌; registra o risolvi i warning
just smoke                      # baseline verde prima di rinominare o tagliare
```

`just setup` non è `just install`. Se i tool di sistema mancano, l'utente lancia prima `just install`.

## 2. Rinomina i placeholder

I meta-placeholder sono marcati e greppabili. Cerca tutti i placeholder nei file vivi, sempre escludendo `docs/init/` e questo file:

```sh
grep -RInE "META:|@project|urn:project:|project-|ts-boilerplate|<SECURITY_CONTACT>" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=coverage --exclude-dir=tmp --exclude-dir=docs/init --exclude=NEW-PROJECT.md .
grep -n "@caliuf\|@YOUR-GITHUB-USERNAME" .github/CODEOWNERS AGENTS.md
grep -RInE "83744|ts-boilerplate-0636824f8fd8|/home/dati/workspace/ts-boilerplate" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=coverage --exclude-dir=tmp --exclude-dir=docs/init --exclude=NEW-PROJECT.md .
```

Cose da rinominare:

- scope npm `@project` → `@<nome>` in package.json, lockfile rigenerato e import;
- bin della CLI `project` → `<nome>` (`apps/cli/package.json`, help in `cli.ts`);
- prefisso URN `urn:project:` in `packages/contracts`;
- nome del server MCP in `apps/mcp/src/create-server.ts`;
- titolo in `apps/web/index.html` e `name` nel `package.json` radice;
- prefisso dei wrapper in `bin/` (`project-*` → `<nome>-*`) e commento `META` nello script;
- handle in `.github/CODEOWNERS` (`@caliuf` → il maintainer reale). Un CODEOWNERS con handle inesistente rende inutilizzabile "require review from code owners";
- contatto `<SECURITY_CONTACT>` in `SECURITY.md`;
- pin CodeScene in `.kilo/kilo.jsonc` (`CS_DEFAULT_PROJECT_ID=83744`) e i riferimenti in [`CODESCENE.md`](./CODESCENE.md), `AGENTS.md` § CodeScene e `docs/memory/environment.md`: non riusare l'id del boilerplate (passo 7);
- path assoluto del workspace principale in `AGENTS.md` § Working rules e in questo file (`/home/dati/workspace/ts-boilerplate`): sostituiscilo con il path del tuo clone, o elimina la regola se non ti serve;
- path e hash di Kilo Memory in `docs/memory/` (passo 6): non copiare `ts-boilerplate-0636824f8fd8`;
- tutti i commenti `META:` nei file vivi: riscriverli se descrivono il progetto derivato, oppure rimuoverli quando sono istruzioni del boilerplate. Non modificare `docs/init/`.

Dopo il rename, esegui di nuovo la ricerca e non procedere se restano placeholder nei file vivi. Per il lockfile usa `just setup` o `pnpm install`; non modificare `pnpm-lock.yaml` a mano.

Prompt pronto:

```text
Adotta il boilerplate per il progetto "<NOME>": rinomina lo scope npm `@project` in `@<nome>` in tutti i package.json e import, il bin della CLI da `project` a `<nome>` (apps/cli/package.json, help in cli.ts), il prefisso URN `urn:project:` in packages/contracts, il nome del server MCP in apps/mcp/src/create-server.ts, il titolo in apps/web/index.html e il name nel package.json radice, e i file in `bin/` da `project-*` a `<nome>-*`. Sostituisci @caliuf in .github/CODEOWNERS con @<handle> e `<SECURITY_CONTACT>` in SECURITY.md con il contatto reale. Risolvi o rimuovi tutti i commenti `META:` nei file vivi, senza toccare docs/init. Aggiorna README.md e docs/PROJECT.md di conseguenza, rigenera il lockfile con `just setup` e richiudi la ricerca dei placeholder. Non toccare ancora GitHub remote, CodeScene id o lo store nativo di Kilo Memory. Chiudi con `just ci` verde.
```

## 3. Descrivi il TUO progetto (la parte che decide l'umano)

Compila, anche a mano o dettandoli all'agente:

1. `docs/PROJECT.md` — obiettivo, non-obiettivi, superfici reali, servizi esterni. È il primo file che ogni agente legge.
2. `docs/product/GLOSSARY.md` — le prime astrazioni di dominio.
3. Prima PDR `proposed` se hai già regole di prodotto.

Prompt pronto:

```text
Intervistami sul progetto che voglio costruire (scopo, utenti, superfici necessarie tra CLI/API/MCP/UI, servizi esterni, dati sensibili) e poi riscrivi docs/PROJECT.md, docs/product/OVERVIEW.md e docs/product/GLOSSARY.md di conseguenza. Non toccare il codice. Fammi domande finché il quadro non è completo.
```

## 4. Taglia ciò che non serve

Il vademecum vieta deployable ipotetici. Se il progetto non ha UI, elimina `apps/web` + `tests/e2e` + il job `e2e` da `ci.yml`; se non ha MCP, elimina `apps/mcp`; ecc.

Se hai già creato il ruleset GitHub (passo 5), allinealo subito: un check obbligatorio su un job che non gira più blocca ogni merge.

Prompt pronto:

```text
Questo progetto non avrà <UI web / server MCP / API>: rimuovi le app, i test, i workflow e le recipe `just` corrispondenti; aggiorna pnpm-workspace, knip.json, vitest.config.ts, justfile (inclusi i filtri di `just dev`), README.md, AGENTS.md, docs/INDEX.md, docs/PROJECT.md (tabella deployable e mappa superfici), GETTING-STARTED.md e gli ADR/PDR il cui perimetro cambia. Se esiste un ruleset su main, togli dagli status check i job che non esistono più. `just ci` deve restare verde.
```

## 4.1 Allinea ADR, PDR e viste correnti

Dopo il pruning delle superfici, rileggi l'indice ADR e l'indice PDR e valuta ogni record `active`. Una decisione non più applicabile va rimossa solo se è un artefatto del boilerplate, oppure sostituita da un nuovo record con `supersedes`/`superseded_by`; aggiorna anche `OVERVIEW.md`, `BOUNDARIES.md`, `docs/product/OVERVIEW.md`, `GLOSSARY.md`, `docs/PROJECT.md`, `AGENTS.md` e le guide operative interessate. La PDR-0001 è solo il dimostratore: quando `hello-world` viene sostituito, va sostituita o rimossa con una decisione esplicita.

## 5. Setup GitHub

I workflow in `.github/` partono da soli al primo push: non serve "accendere la CI". Serve invece configurare sicurezza, ruleset e (se pubblico) dependency graph. Riferimenti: [`WORKFLOWS.md`](./WORKFLOWS.md) § CI, [`GITHUB-CLI.md`](./GITHUB-CLI.md) § Impostazioni del repo e [`SECURITY.md`](./SECURITY.md).

### 5.1 Chi fa cosa

| Passo | Chi | Perché |
| --- | --- | --- |
| `gh auth login` e scelta visibilità (pubblico/privato) | **Utente** | Interattivo; implica piano GitHub, minuti CI e GHAS |
| Scelta e creazione di `LICENSE` se il repo sarà pubblico | **Insieme** | Senza licenza il boilerplate pubblico è "all rights reserved"; scegliere esplicitamente MIT, Apache-2.0 o altra licenza |
| CODEOWNERS con handle reale | **Harness** | Già nel passo 2; bloccante per il ruleset |
| `gh repo create` + push iniziale | **Harness** (consenso esplicito) | Crea un remote; non è un fork del boilerplate |
| Merge: squash, merge commit e rebase; `delete_branch_on_merge` | **Harness** | `gh repo edit` / API; niente linear history |
| Dependabot alerts e security updates | **Harness**, fallback **Utente** | API `vulnerability-alerts` e `automated-security-fixes`; se 403/404, UI |
| Secret scanning e push protection | **Harness**, fallback **Utente** | `PATCH` `security_and_analysis`; su privato Free spesso solo UI o piano a pagamento |
| Dependency graph | **Utente** | L'API `dependency_graph.enabled` su questo stack non è efficace; senza di esso `dependency-review` fallisce |
| Ruleset di `main` | **Harness**, fallback **Utente** | API `POST .../rulesets`; su account Free i ruleset **non esistono sui repo privati** (serve pubblico, o Pro) |
| Bypass admin del ruleset | **Insieme** | Necessario col solo maintainer: GitHub non fa self-approve |
| Actions: approval dei workflow da fork | **Utente** (consigliato in UI) | Su repo pubblico protegge i runner; verificare in *Settings → Actions → General* |
| Non mettere `codeql` fra i required checks delle PR | **Harness** | `security.yml` è solo `schedule` + `workflow_dispatch`: il check non compare mai sulle PR e il merge resterebbe impossibile |

### 5.2 Visibilità

- **Pubblico** (account Free): minuti Actions illimitati sui runner standard; CodeQL e Dependency Review si auto-attivano (`if: github.event.repository.private == false`); secret scanning e ruleset disponibili. Prima del passaggio: LICENSE, CODEOWNERS corretto, `just secrets` e una scansione della storia (`gitleaks git --redact .`) perché anche i log Actions passati diventano pubblici.
- **Privato** su Free: niente branch ruleset, minuti CI contingenti, CodeQL/dependency-review si auto-escludono finché non abiliti GitHub Advanced Security e togli le `if` nei workflow.

L'avviso "All push rulesets will be disabled" nel passaggio a pubblico riguarda solo le *push* ruleset (file path, estensioni, size). Le branch/tag ruleset restano. Su un account personale Free di solito non ne hai mai create.

### 5.3 Creare il remote

**Harness**, dopo consenso:

```sh
gh auth status
gh repo create <nome> --public --source . --remote origin --push
# oppure --private, consapevole dei limiti del piano
```

Non usare `--fork`. Il default branch è `main`.

Merge policy (allineata a questo boilerplate): squash, merge commit e rebase; niente `required_linear_history`; al merge di una PR GitHub cancella il branch remoto (`delete_branch_on_merge`) — con un merge commit i commit restano su `main`, sparisce solo l'etichetta del branch.

```sh
gh repo edit --enable-squash-merge --enable-merge-commit --enable-rebase-merge --allow-update-branch \
  --delete-branch-on-merge
gh api repos/<owner>/<nome> -X PATCH \
  -H "Accept: application/vnd.github+json" \
  -f allow_merge_commit=true -f allow_rebase_merge=true -f allow_squash_merge=true -f delete_branch_on_merge=true
```

### 5.4 Code security

**Harness** (riportare status code; se fallisce, l'utente completa in *Settings → Code security*):

```sh
# Stato attuale
gh api repos/<owner>/<nome> -H "Accept: application/vnd.github+json" \
  --jq '{private: .private, visibility: .visibility, dependency_graph_enabled: .dependency_graph_enabled, security_and_analysis: .security_and_analysis}'

# Dependabot alerts
gh api -X PUT repos/<owner>/<nome>/vulnerability-alerts \
  -H "Accept: application/vnd.github+json"

# Dependabot security updates
gh api -X PUT repos/<owner>/<nome>/automated-security-fixes \
  -H "Accept: application/vnd.github+json"

# Secret scanning + push protection (spesso 403 su privato Free)
printf '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}' |
  gh api repos/<owner>/<nome> -X PATCH \
    -H "Accept: application/vnd.github+json" --input -
```

**Utente, sempre, in UI:** *Settings → Code security → Dependency graph* → Enable. Poi verifica:

```sh
gh api repos/<owner>/<nome>/dependency-graph/sbom \
  -H "Accept: application/vnd.github+json"
```

404/403 = graph non attivo. Il tentativo `security_and_analysis.dependency_graph.enabled` è documentato ma non efficace qui (vedi [`GITHUB-CLI.md`](./GITHUB-CLI.md)).

`.github/dependabot.yml` è già nel repo: version updates settimanali per npm e GitHub Actions. Non duplicarlo. Resta l'ignore delle major di `@types/node` (ADR-0001) finché Node 24 è il runtime autorevole.

### 5.5 Ruleset di `main`

Obiettivi (stesso contratto di questo boilerplate):

- target branch default (`~DEFAULT_BRANCH` / `main`);
- require pull request: 1 approvazione, dismiss stale reviews, require code owner review, extra approval per commit non attribuiti; **niente** last-push-approval né conversation resolution obbligatoria;
- status check obbligatori: i job di `ci.yml` che **girano davvero sulle PR**. Oggi: `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`. Aggiungi `dependency-review` solo se il repo è pubblico (altrimenti il job si auto-esclude e il check non diventa mai verde). **Non** richiedere `codeql` (gira in `security.yml` a schedule, slow lane ADR-0005);
- block force push, restrict deletions di `main`;
- **non** attivare `required_linear_history`;
- merge methods: `merge`, `squash` e `rebase`;
- bypass list: owner in modalità *Always* (self-approve impossibile). Il bypass salta l'intero ruleset, check compresi: in locale il push su `main` non aspetta Actions; non usarlo per il merge di PR rosse. Le PR degli agenti remoti restano in review reale e, per chi non è in bypass, a CI verde.

**Harness** (dopo che i job CI sono comparsi almeno una volta: altrimenti GitHub può rifiutare i context). Su privato Free l'API risponderà che i ruleset non sono disponibili: fermarsi e dirlo, non inventare branch protection classiche se il piano non le ha.

```sh
# Attori di bypass: per un user owner, actor_type=User e actor_id numerico
gh api user --jq .id

printf '%s' '{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [
    {"actor_id": <USER_ID>, "actor_type": "User", "bypass_mode": "always"}
  ],
  "conditions": {
    "ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "require_extra_approval_for_unattributed_changes": true,
        "allowed_merge_methods": ["merge", "squash", "rebase"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": false,
        "required_status_checks": [
          {"context": "quality"},
          {"context": "integration-and-coverage"},
          {"context": "bun-compatibility"},
          {"context": "e2e"}
        ]
      }
    }
  ]
}' | gh api repos/<owner>/<nome>/rulesets -X POST \
  -H "Accept: application/vnd.github+json" --input -
```

Se hai rimosso l'E2E al passo 4, togli `e2e`. Se il repo è **pubblico**, aggiungi `{"context": "dependency-review"}` dopo aver verificato che il job sia comparso almeno una volta. Se il repo è privato, non aggiungerlo. Non aggiungere `codeql`.

**Utente in UI** se l'API non è disponibile: *Settings → Rules → Rulesets → New branch ruleset*, stessa checklist. Non attivare una regola `update` che blocca anche i merge via PR (errore tipico: push e PR rifiutati entrambi).

Opzionale: tag ruleset su `v*` con restrict creation/deletion, così i tag di release non sono manipolabili da chi ha solo write.

Dopo il ruleset, un push diretto su `main` da owner può comunque passare con

```text
Bypassed rule violations for refs/heads/main: Changes must be made through a pull request.
```

È atteso. Il flusso ordinario resta un task = un branch = una PR.

### 5.6 Actions su repo pubblico

**Utente** in *Settings → Actions → General*:

- Fork pull request workflows: **Require approval for all outside collaborators** (protezione contro abuso dei runner).
- Workflow permissions: Read repository contents and packages permissions (i workflow dichiarano già `permissions: contents: read`).

### 5.7 Verifica

```sh
gh api repos/<owner>/<nome>/rulesets --jq '.[] | {id,name,enforcement,target}'
gh api repos/<owner>/<nome> --jq '{private,delete_branch_on_merge,allow_squash_merge,allow_merge_commit,security_and_analysis,dependency_graph_enabled}'
gh run list --limit 5
```

Prompt pronto:

```text
Prima leggi docs/development/GITHUB-CLI.md e docs/development/NEW-PROJECT.md § Setup GitHub. Verifica gh auth status. Crea il remote GitHub del working tree corrente (non un fork), esegui il primo push e attendi che i job CI producano i context; solo dopo crea o aggiorna il ruleset. Allinea il remote a questo boilerplate: squash+merge+rebase, delete_branch_on_merge, niente linear history, ruleset come in § 5.5 (check CI obbligatori sulle PR, mai codeql, bypass owner always). Abilita via API Dependabot alerts/security updates e secret scanning/push protection. Non tentare di abilitare il dependency graph via API: dimmi di farlo in UI. Se un endpoint risponde 403/404 o il piano non supporta i ruleset, fermati e riporta la risposta grezza. Riporta ogni comando e lo status code.
```

## 6. Memoria Kilo (non ripartire da zero)

Ci sono due store, per ADR-0008:

| Store | Dove | Cosa è |
| --- | --- | --- |
| Bank nel repo | `docs/memory/` | Versionabile, clonato col progetto, letto da ogni agente anche senza Kilo Memory |
| Kilo Memory nativa | `~/.local/share/kilo/memory/<nome>-<hash>/` | Client-side, project-scoped, auto-inject; **non** è nel git |

La nativa è legata al *canonical path* del clone (vedi `manifest.json` e `kilo.db`). Copiare la cartella `ts-boilerplate-0636824f8fd8` nel nuovo progetto **non funziona**: hash e path non coincidono, il pannello resta vuoto o mostra un altro repo.

Il modo corretto di non ripartire da zero è **usare `docs/memory/` come seme**, ripulirlo, poi (quando Kilo ha associato il nuovo path) re-iniettare i fatti duraturi nella memoria nativa.

### 6.1 Ripulisci il bank nel repo

L'harness tiene struttura e convenzioni (`README.md`, `project.md`, `environment.md`, `corrections.md`, `sessions/`) e i fatti *trasferibili* del boilerplate, per esempio:

- ruoli di `.envrc` / `.env` / `.env.default` / `.env.example` / `.envrc.local`;
- Node come runtime autorevole, Bun solo smoke, niente `node:*`/`Bun.*` in domain/application;
- `just install` vs `just setup`;
- gate paralleli (`run-checks.sh` / GNU parallel);
- CodeGraph (`just setup` init/index, `just pull` sync);
- convenzioni GitHub (un task = un branch = una PR, naming, review col solo maintainer);
- pin e trappole tool che restano vere (Bun `process.version`, `just bun-smoke`, `just node`, worktree in `.kilo/worktrees/`).

Scarta o riscrivi ciò che identifica *questo* boilerplate o *questa* macchina:

- `memory.location` e `kilo.memory_path` con hash `ts-boilerplate-0636824f8fd8`;
- `codescene.project` id `83744`;
- digest in `docs/memory/sessions/` (sono sessioni del boilerplate);
- sessioni e piani locali del boilerplate in `.kilo/sessions/` e `.kilo/plans/`: sono storia di lavoro del boilerplate, non memoria di progetto;
- correzioni non più vere; tieni solo quelle ancora operative (es. Codacy scartato per TypeScript, ciclo pnpm dei task `typecheck` se usi ancora pnpm workspace);
- path assoluti (`/home/dati/workspace/ts-boilerplate`), hostname, `whoami`.

I commenti `META(boilerplate)` in `docs/memory/` si tolgono a adozione completata, insieme a questo file.

### 6.2 Abilita la nativa sul nuovo clone

Per l'utente:

1. Apri il nuovo progetto come workspace singolo (non multi-root).
2. Apri un file del repo (es. `AGENTS.md`) *prima* del pannello Memory: altrimenti compare `No active project for memory`.
3. In chat: `/memory status`. Deve risultare enabled + auto-inject.
4. Se il binding manca: ricarica la finestra, controlla Output → Kilo Code.

Per l'harness:

```sh
tools/scripts/kilo-memory-diagnose.sh
```

Lo script conferma directory dati, riga in `kilo.db`, cartella memory col canonical path giusto, `enabled`/`autoInject`, e confronta le dimensioni con `docs/memory/`. Non crea lo store e non importa i fatti: segnala solo lo stato.

Dopo il primo bind, aggiorna in `docs/memory/project.md` (e in environment) il path reale stampato dalla diagnostica, al posto dell'hash del boilerplate.

### 6.3 Semina la nativa dal bank

Non esiste un import bulk dello store globale. **Harness**, nella prima sessione Kilo sul nuovo repo, dopo che la diagnostica è verde:

```text
Kilo Memory è appena stata associata a questo clone. Leggi docs/memory/project.md, environment.md e corrections.md. Per ogni entry che è ancora vera per QUESTO progetto (non path, hash, CodeScene id o sessioni del boilerplate) salvala nella memoria nativa del client, se disponibile, usando il meccanismo documentato da quel client e mantenendo stessa chiave e stesso testo. Non copiare ~/.local/share/kilo/memory/ da altri progetti. Poi rilancia tools/scripts/kilo-memory-diagnose.sh e riporta enabled, autoInject, canonical path e dimensioni.
```

Da quel momento la nativa è la fonte veloce in-sessione; `docs/memory/` resta la fonte autorevole versionabile. Ogni fatto nuovo va nel file repository appropriato e, se il client lo supporta, anche nella memoria nativa, come da ADR-0008.

## 7. CodeScene (se adottato)

Se il progetto mantiene CodeScene, **Utente** (una tantum, account e Cloud): crea un progetto CodeScene Cloud *nuovo* che punta al git remote di questo repo. Non riusare `83744`.

Poi, insieme all'harness, segui [`CODESCENE.md`](./CODESCENE.md) § Setup:

1. MCP `codescene` già in `.kilo/kilo.jsonc` (comando `npx -y @codescene/codehealth-mcp`).
2. Login: `npx -y @codescene/codehealth-mcp auth` oppure tool MCP `login`.
3. Pin: sostituisci `CS_DEFAULT_PROJECT_ID` in `.kilo/kilo.jsonc` e i riferimenti in `CODESCENE.md` / `docs/memory/environment.md`.
4. Token REST in `~/.codescene/token` o `CODESCENE_API_TOKEN` (fuori dal git) per `just codescene-ratchet`. L'OAuth dell'MCP non basta per l'API progetto.
5. Riavvia la sessione Kilo.

Senza progetto proprio i gate `just codescene-safeguard` / `just codescene-changeset` restano usabili in locale sul working tree; hotspot e ratchet Cloud no. Se il progetto non adotta CodeScene, rimuovi il server da `.kilo/kilo.jsonc`, le recipe e i riferimenti CodeScene da hook, `AGENTS.md`, ADR-0006, `CODESCENE.md`, memoria e checklist; non lasciare un gate configurato verso il progetto del boilerplate.

## 8. Sostituisci il dimostratore col primo caso d'uso reale

`hello-world` esiste per mostrare la struttura. Sostituiscilo (non estenderlo):

```text
Sostituisci il bounded context `greetings` con il primo caso d'uso reale: <COSA DEVE FARE>. Segui TDD: prima il test di integration che fallisce, poi l'implementazione. Mantieni la struttura domain/application/ports, i contratti in packages/contracts, l'esposizione sulle superfici decise con naming parallelo e la mappa in docs/PROJECT.md aggiornata. Scrivi la PDR se il caso d'uso introduce una regola di prodotto nuova. Chiudi con `just prepush` verde.
```

## 9. Attiva i task schedulati

Se il derivato ha un remote GitHub, i guard girano via `.github/workflows/scheduled.yml` (cron settimanale): **non richiedono configurazione** oltre al repo attivo. Apriranno issue in caso di findings. Verifica dopo la prima settimana che il workflow sia girato (*Actions → scheduled*) e metti in calendario la prima retrospettiva di processo (prompt in `WORKFLOWS.md`). Senza remote, questa verifica GitHub è non applicabile.

Se lavori senza remoto GitHub: esegui `just guards` a mano ogni settimana.

## 10. Manutenzione ordinaria (prompt ricorrenti)

```text
# Dopo una feature che migliora la salute del codice:
just coverage-raise    # poi fai committare il cricchetto alzato

# Ogni tanto:
Esegui `just guards` e trasforma i findings in task; se un finding si ripete,
proponi di promuoverlo a gate deterministico.

# Upgrade di runtime/dipendenze major:
Apri una PR dedicata che aggiorna <tool> alla versione <X>: esegui l'intera
suite (`just ci`), aggiorna .mise.toml/.node-version/docs e non mescolare
feature applicative.
```

## Checklist finale di adozione

- [ ] `just doctor` senza errori; warning opzionali registrati o risolti
- [ ] `just smoke` verde dopo `just setup` e prima delle modifiche di progetto
- [ ] placeholder rinominati (`@project`, `project`, `urn:project:`, `bin/project-*`, CODEOWNERS, `META:`)
- [ ] contatto di sicurezza in `SECURITY.md` sostituito con un canale reale
- [ ] lockfile rigenerato con `just setup` dopo il rename; nessuna modifica manuale a `pnpm-lock.yaml`
- [ ] `README.md`, `AGENTS.md`, `docs/INDEX.md`, overview, glossary e guide vive aggiornati al nome e alle superfici reali
- [ ] `docs/PROJECT.md` descrive il TUO progetto
- [ ] app superflue rimosse; justfile/workflow/test/config/docs allineati; `just ci` verde
- [ ] ADR/PDR attivi verificati dopo il pruning; record non applicabili sostituiti o rimossi con decisione esplicita; PDR-0001 sostituita quando `hello-world` non è più il prodotto
- [ ] `just guards` verde dopo l'aggiornamento di indici ADR/PDR e della surface map
- [ ] se esiste un remote GitHub: copia non fork, squash/merge commit/rebase, `delete_branch_on_merge`, niente linear history, security e ruleset allineati; se non esiste, voce marcata N/A
- [ ] se il repo è pubblico: LICENSE, Dependabot alerts/updates, secret scanning, push protection e **dependency graph abilitato in UI**
- [ ] se il repo è privato: limiti di piano/GHAS documentati e non-required check rimossi dal ruleset
- [ ] `docs/memory/` ripulito; Kilo Memory nativa associata a *questo* clone (non copiata dal boilerplate); `kilo-memory-diagnose.sh` verde; fatti duraturi re-iniettati
- [ ] `.kilo/sessions/` e `.kilo/plans/` del boilerplate rimossi o svuotati; `.kilo/command/` e `.kilo/scripts/` mantenuti
- [ ] CodeScene adottato: progetto Cloud proprio e id aggiornato in `.kilo/kilo.jsonc` + `docs/development/CODESCENE.md` (non riusare `83744`), oppure rimosso completamente e marcato N/A
- [ ] `hello-world` sostituito dal primo caso d'uso reale
- [ ] con remote GitHub, prima esecuzione di `scheduled.yml` verificata; senza remote, `just guards` eseguito manualmente e voce marcata N/A
- [ ] prima di iniziare il primo caso d'uso, baseline `just ci` verde e task branch/issue separati secondo `WORKFLOWS.md`
- [ ] prima di cancellare questo file e `docs/init/`, rimossi i link/riferimenti operativi a entrambi in README, INDEX, guide e config; poi `just docs-check` verde
- [ ] questo file e `docs/init/` cancellati solo dopo il cleanup e la validazione finale
