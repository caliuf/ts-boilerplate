# Impostazioni GitHub: contratto, alternative e flussi di lavoro

Questo testo fissa **perché** il remote di `ts-boilerplate` (e dei progetti derivati, che devono restare allineati) è configurato così. Il contratto operativo da copiare sta in [`docs/development/NEW-PROJECT.md`](../../development/NEW-PROJECT.md) § Setup GitHub e in [`docs/development/WORKFLOWS.md`](../../development/WORKFLOWS.md). I gotcha della CLI in [`docs/development/GITHUB-CLI.md`](../../development/GITHUB-CLI.md).

Boilerplate e derivati condividono lo stesso modo di sviluppare. Non si duplica un ruleset «più morbido» o «più duro» nel progetto nuovo.

## Cosa c'è sul remote oggi

Tre strati distinti, facili da confondere:

| Strato | Dove | Cosa decide |
| --- | --- | --- |
| Impostazioni repo | *Settings → General* (API `PATCH /repos/...`) | Metodi di merge visibili nel menu, cancellazione del branch della PR, visibilità, ecc. |
| Ruleset di branch | *Settings → Rules → Rulesets*, nome `Default`, target `~DEFAULT_BRANCH` | Cosa è **vietato** su `main` a chi non è in bypass list |
| Actions / security | workflow in `.github/` + *Code security* | Cosa **gira**. Un job può esistere senza essere un required check |

Valori attuali (verificati via API sul boilerplate):

- Repo: `allow_squash_merge`, `allow_merge_commit`, `allow_rebase_merge` tutti `true`. `delete_branch_on_merge` `true`.
- Ruleset `Default`, enforcement `active`, condizioni `~DEFAULT_BRANCH`.
- Bypass: l'owner (user id del maintainer) in modalità **Always**.
- Regole: `deletion`, `non_fast_forward`, `pull_request`, `required_status_checks`. **Non** c'è `required_linear_history`.
- PR: 1 approvazione, CODEOWNERS, dismiss stale reviews, extra approval per commit non attribuiti; last-push-approval **off**; conversation resolution **off**; `allowed_merge_methods`: merge, squash, rebase.
- Status check obbligatori sulle PR: `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`, `dependency-review`. Mai `codeql`.
- CodeQL vive in `security.yml` (cron settimanale + `workflow_dispatch`), slow lane ADR-0005, gratis sui pubblici, auto-skip sui privati.

Su account **Free**, i ruleset di branch **non esistono sui repo privati** (servono pubblico, o GitHub Pro). I derivati privati su Free non possono copiare questo ruleset: va detto esplicitamente, non simulato con branch protection inesistenti.

## Flussi di lavoro

Il ruleset è pensato per convivere con tre modi di lavorare, non per imporne uno solo.

### 1. Sviluppo in locale su `main`

È il default quando si è nel checkout principale (`realpath` = `/home/dati/workspace/ts-boilerplate`) e non si è chiesto un branch/PR: l'agente modifica il working tree, il commit resta all'umano, poi `git push origin main`.

Cosa succede al push:

1. Hook `prepush` (`just prepush`): gli stessi gate di qualità in locale. Se falliscono, il push non parte. Qui si aspetta, ed è voluto.
2. `git push` verso GitHub. L'owner è in bypass *Always*: GitHub accetta il push **subito** e registra un bypass del ruleset (tipicamente *Changes must be made through a pull request*). Non si aspetta Actions.
3. `ci.yml` parte in background sul commit appena arrivato. Informativo. Un rosso in Actions **non** ritira il commit già su `main`.

Pro: zero andata e ritorno con GitHub; si può stare giorni senza aprire il browser; i gate che contano per te sono quelli locali. Contro: `main` remoto può contenere un commit che in CI risulta rosso (toolchain diversa, flaky E2E, ecc.); la rete di sicurezza GitHub in questo flusso non è un cancello, è un allarme dopo il fatto.

Non usare il bypass per «passare» una PR con CI rossa. Serve solo a non trasformare il lavoro quotidiano in una coda Actions.

### 2. Sviluppo in locale su worktree (Agent Manager)

Ogni task isolato vive in `.kilo/worktrees/<nome>` con branch dedicato. Setup: `.kilo/setup-script.sh`. Niente `git stash` fra worktree (è condiviso). A fine lavoro: Apply / merge del branch / PR dalla UI, poi si rimuove il worktree.

Due sotto-casi:

- **Integri in locale su `main` e fai push** (stesso profilo del flusso 1): bypass, niente attesa GitHub.
- **Apri una PR dal branch del worktree**: per te, owner, il merge può comunque usare il bypass. Per disciplina, aspetta il verde o fidati del `prepush` già fatto. Il branch remoto della PR viene cancellato al merge (`delete_branch_on_merge`); i commit, se hai usato un merge commit, restano su `main`.

Pro: parallelismo senza una seconda finestra VS Code. Contro: collisioni di porte sui dev server (derivarle da `WORKTREE_PATH`); più rami da non far sopravvivere dopo il merge.

### 3. Sviluppo remoto (cloud agents, GitHub App)

L'autore della PR è l'app, non il maintainer. Il maintainer **può** (e deve) fare review: niente self-approve, il ruleset funziona come progettato.

Per chi **non** è in bypass list (l'app, Dependabot, un fork):

- Serve una PR verso `main`.
- Serve 1 approvazione di un code owner (tu).
- I required check devono essere verdi. Qui **sì**, si aspetta Actions. Non è il tuo push quotidiano.
- `dependency-review` gira solo sulle PR (e solo se il repo è pubblico). È uno dei required check: su una PR pubblica è un cancello vero.

Pro: agenti e contributor esterni non possono fondere codice senza review umana e senza CI GitHub. Contro: il giro PR+CI è più lento del push su `main`; è il prezzo del lavoro che non passa dai tuoi hook locali.

Dependabot è lo stesso profilo: PR dell'app, tu reviewi, CI deve essere verde, squash o merge a scelta.

Fork su repo pubblico: *Settings → Actions → General* dovrebbe richiedere approval per i workflow dei collaboratori esterni (abuso runner). Non è nel ruleset; è una spunta Actions.

## Le scelte, una per una

Per ciascuna: che cos'è, alternative, perché così.

### Visibilità (pubblico vs privato)

Il boilerplate è pubblico.

- **Pubblico, Free:** minuti Actions illimitati sui runner standard; CodeQL e Dependency Review gratis; ruleset di branch disponibili; secret scanning disponibile. La history di Actions e i log sono visibili. Serve LICENSE se altri devono riusarlo. CODEOWNERS deve avere un handle reale.
- **Privato, Free:** minuti contingenti; niente ruleset di branch; CodeQL e dependency-review si auto-escludono (`if: repository.private == false`) finché non paghi GHAS. Più riservatezza, meno denti.
- L'avviso *All push rulesets will be disabled* nel passaggio a pubblico riguarda solo le *push* ruleset (path, estensioni, size), non le branch ruleset. Su un account personale Free di solito è un no-op.

Scelta: pubblico per il boilerplate. I derivati scelgono in base ai dati: se restano privati su Free, il ruleset non si può clonare.

### Metodi di merge (squash, merge commit, rebase)

Impostazione repo **e** `allowed_merge_methods` del ruleset. Oggi tutti e tre. Si sceglie **per PR**, non a livello di repo.

| Metodo | Cosa fa su `main` | Pro | Contro |
| --- | --- | --- | --- |
| **Squash** | Un solo commit, messaggio della PR | Storia piatta, ideale per PR piccole o rumorose (typo, wip) | Perdi i commit del branch |
| **Merge commit** | Nodo di merge + tutti i commit del branch, SHA originali | Conserva la storia; unico modo di atterrare una PR **senza riscrivere** gli SHA | `git log` ha i bubble; `git bisect` è un filo più rumoroso |
| **Rebase** | I commit del branch vengono riassegnati in linea su `main` | Linea pulita **e** commit conservati come pezzi | Riscrive gli SHA (contrasta la regola «non riscrivere i commit» di AGENTS.md); conflitti in rebase |

Alternative scartate: solo squash (non puoi conservare i commit); solo merge (anche i typo restano come commit su `main`).

### `required_linear_history`

Vieta i merge commit sul ref. Restano squash o rebase.

- **On:** `main` è una linea. Bisect e log sono semplici. **Incompatibile** col merge commit, anche se il menu lo mostra.
- **Off (scelta):** puoi usare il merge commit quando ti serve la storia. `main` può avere nodi. Non è un gate di qualità; è un gusto di history. Tenere linear history *e* `allowed_merge_methods: merge` è contraddittorio (il merge poi fallisce).

Tolta dal boilerplate e vietata nei derivati, perché l'obiettivo dichiarato è poter conservare i commit.

### Bypass owner (*Always*)

GitHub non permette di approvare la propria PR. Con un solo code owner, senza bypass le PR locali restano bloccate per sempre.

| Modalità | Effetto |
| --- | --- |
| **Always (scelta)** | Push diretto e merge PR: l'owner può ignorare l'intero ruleset (review **e** status check). Evento auditato. |
| `pull_request` | Bypass solo dal bottone Merge, non da `git push` su `main`. Il flusso quotidiano su `main` si rompe. |
| Nessun bypass | Serve un secondo reviewer o un bot. In solo è un vicolo cieco. |

Il bypass *Always* **non** è «i check non contano». È «il maintainer in locale non sta in coda Actions». Policy: non chiudere PR rosse con il bypass; per il lavoro tuo su `main` è lo strumento giusto.

Fraintendimento frequente (anche in doc vecchia): *il bypass salta solo la review, non i check*. Sui **ruleset** con *Always* salta **tutto** il ruleset. Sulla classic branch protection era diverso. Qui valgono i ruleset.

### Obbligo di PR, 1 approvazione, CODEOWNERS

- **PR obbligatoria:** chi non è in bypass non pusha su `main`. Gli agenti remoti e i fork passano da PR.
- **1 approvazione:** minimo GitHub. In solo è vacuamente soddisfatta dal bypass sulle tue PR; sulle PR dell'app è una review vera.
- **CODEOWNERS:** i file-gate (`justfile`, hook, CI, AGENTS.md, …) hanno un owner. Handle inesistente = regola rotta. Va sostituito nei derivati (`@caliuf` → il maintainer).

Alternative: PR senza review (debole in pubblico); niente obbligo PR (CI e review diventano opzionali per tutti).

### Dismiss stale reviews (on)

Un push nuovo sulla PR invalida gli approve. Evita di fondere un diff diverso da quello approvato. Contro: un altro click dopo un fixup. In solo sulle tue PR è irrilevante (bypass); sulle PR degli agenti è utile.

### Last-push approval (off)

L'ultimo push deve essere approvato da **qualcun altro**. Con un maintainer sei quasi sempre tu l'ultimo push: accenderlo blocca il merge senza bypass, sempre. Ha senso da due persone in su.

### Conversation resolution (off)

I thread di review aperti bloccano il merge. Utile con review umane lunghe; con agenti restano thread aperti per niente. In solo è friction. Off.

### Extra approval per commit non attribuiti (on)

Se la PR contiene commit di chi **non ha write** sul repo, serve un'approvazione in più. Difesa supply-chain su pubblico (commit copiati, fork). Contro: un click in più su PR da contributor senza write. On, repo pubblico.

### `deletion` + `non_fast_forward` (entrambi on)

Non si cancella `main`. Non si force-push su `main`. Salvo bypass. Impedisce a un agente (o a te stanco) di distruggere il default branch. Togliere `deletion` è un disastro in potenza. Togliere `non_fast_forward` autorizza la riscrittura di `main`.

### Status check obbligatori

I job di `ci.yml` che **esistono sulle PR** sono required: `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`, e `dependency-review` se il repo è pubblico.

Cosa **non** sono:

- Non ritardano il `git push` dell'owner (bypass).
- Non sostituiscono `just prepush`. In locale i gate restano la prima linea.
- Non includono `codeql`: quel job non gira sulle PR. Pinnalo come required e **nessuna PR diventa verde**.

Cosa sono: il cancello per chi non ha i tuoi hook — PR di agenti, Dependabot, fork. Senza di essi si può premere Merge sul rosso.

`dependency-review` gira solo su `pull_request` e solo se il repo è pubblico. Su un push a `main` risulta `skipped`: per l'owner è irrilevante (bypass); su una PR pubblica deve passare. Su derivato **privato** non va messo fra i required (il job si auto-esclude, il check non esiste).

`strict_required_status_checks_policy`: la PR deve essere aggiornata rispetto a `main` prima del merge. Riguarda solo chi mergia PR, non il push diretto.

Se al passo di adozione togli `apps/web` / E2E, togli `e2e` dai required. Un context che non gira mai blocca ogni merge.

### CodeQL (schedulato, non required)

SAST di GitHub: cerca bug e pattern insicuri nel codice. Nel boilerplate è il job `codeql` di `security.yml`, lunedì 03:29 UTC, più `workflow_dispatch`. Gratis sui pubblici; sui privati serve GHAS e va tolta la `if`.

Conviene **tenerlo acceso** sui pubblici: zero costo, zero impatto sul push locale, report in *Code scanning*. Non conviene **né** lanciarlo su ogni PR (ADR-0005: troppo lento/rumoroso per la fast lane) **né** metterlo fra i required check (non comparirebbe).

### `delete_branch_on_merge` (on)

Dopo il merge di una **PR**, GitHub cancella `refs/heads/<branch-della-pr>` sul remote. Non tocca `main`. Non tocca i worktree locali. Non tocca i push diretti su `main` (non c'è una PR, non c'è un head da cancellare).

- Squash: i commit del branch sono già collassati nel squash; cancellare il branch è solo pulizia.
- Merge commit: i commit sono già raggiungibili da `main` tramite il nodo di merge; sparisce l'etichetta, **non** lo storico.
- Rebase: su `main` restano i commit riassegnati; il vecchio puntatore sparisce.

Off significherebbe accumulare branch morti sul remote. On è allineato a squash **e** a merge commit.

### Dependency graph, Dependabot, secret scanning

Non sono ruleset.

- **Dependency graph:** va acceso in UI (*Code security*). L'API `dependency_graph.enabled` su questo stack non è efficace. Senza di esso `dependency-review` fallisce in pochi secondi. Verifica: `GET .../dependency-graph/sbom` (404/403 = spento).
- **Dependabot alerts + security updates:** API `PUT .../vulnerability-alerts` e `PUT .../automated-security-fixes`. `.github/dependabot.yml` è già nel repo (npm + Actions, ignore major di `@types/node`).
- **Secret scanning + push protection:** `PATCH` `security_and_analysis`. Su privato Free spesso 403. Push protection rifiuta un push che contiene un segreto noto **prima** che entri in history.

I workflow partono al primo push: non c'è uno switch «accendi la CI».

## Cosa si aspetta, e cosa no

| Azione | Aspetti i gate locali? | Aspetti Actions? |
| --- | --- | --- |
| Commit (hook `precommit`) | Sì, secondi | No |
| `git push` da owner su `main` | Sì, `prepush` | No (bypass, CI in background) |
| Merge della **tua** PR con bypass | No, se salti i check | No, se usi il bypass — **non farlo sul rosso** |
| Merge di una PR di agente / Dependabot / fork | No (non è la tua macchina) | **Sì**, required check + la tua review |

## Cosa non copiare alla cieca

- L'id utente nel bypass list è **del maintainer di quel repo**, non `10155161` del boilerplate.
- `CS_DEFAULT_PROJECT_ID=83744` e lo store Kilo `ts-boilerplate-<hash>` non c'entrano col ruleset; vanno rifatti nel derivato (vedi NEW-PROJECT § Memoria Kilo e CodeScene).
- `codeql` e `dependency-review` dipendono da visibilità/GHAS. Pinnali come required solo se il job gira davvero su quella classe di evento.
- Il workspace «modifiche su `main` senza PR» è una convenzione **di questa macchina** (`WORKFLOWS.md` § Workspace di sviluppo principale). Un derivato su un altro path torna al default un task = un branch = una PR, col bypass comunque disponibile per l'owner.

## Come verificarlo

```sh
gh api repos/<owner>/<repo>/rulesets --jq '.[] | {id,name,enforcement,target}'
gh api repos/<owner>/<repo>/rulesets/<id> --jq '{rules:[.rules[].type], merge:(.rules[]|select(.type=="pull_request")|.parameters), checks:(.rules[]|select(.type=="required_status_checks")|.parameters.required_status_checks), bypass:.bypass_actors}'
gh api repos/<owner>/<repo> --jq '{private,delete_branch_on_merge,allow_squash_merge,allow_merge_commit,allow_rebase_merge,dependency_graph_enabled,security_and_analysis}'
```
