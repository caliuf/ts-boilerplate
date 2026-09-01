# Domanda

Su GitHub non mi interessa davvero tenere questo repo privato. Potrei passarlo secondo te a pubblico per risparmiare nel tempo di CI/CD?
Quando provo a farlo mi avverte: "All push rulesets will be disabled."

Cosa vuol dire? Lato codice qui devo fare qualcosa?
Inoltre quali regole mi conviene settare sul repo pubblico (e quali sul repo privato)?


# Risposta

## Conviene passare a pubblico per la CI?

Sì. Con un account GitHub Free i minuti di Actions sono:

- **Repo pubblico**: minuti illimitati e gratis sui runner standard Linux/Windows/macOS.
- **Repo privato**: 2.000 min/mese inclusi, poi si paga.

E in questo repo specifico c'è un bonus: i workflow sono già scritti per il cambio di visibilità. In `.github/workflows/security.yml` (riga 20) e `ci.yml` (riga 73) trovi:

```
if: github.event.repository.private == false
```

CodeQL (code scanning) e dependency-review **si auto-attivano gratis** appena il repo diventa pubblico (su privato richiederebbero GitHub Advanced Security, a pagamento — c'è proprio un commit recente su questo: `5986d2f`). Passando a pubblico non perdi solo il costo dei minuti: guadagni due controlli di sicurezza che ora sono saltati.

## Cosa significa "All push rulesets will be disabled"

Le **push rulesets** sono un tipo specifico di regole (diverse dalle branch/tag rulesets) che bloccano i push in base a percorsi file, estensioni, dimensione, ecc. Per documentazione GitHub esistono **solo su repo privati/interni** (piani Team/Enterprise), perché il loro scopo è applicare il blocco a tutto il "fork network" — concetto senza senso su un repo pubblico, dove chiunque può forkare.

Quindi:

- Vengono **disabilitate, non cancellate**: se tornassi privato potresti riattivarle.
- Le **branch rulesets e tag rulesets non vengono toccate** — restano attive.
- Se non hai mai creato una ruleset di tipo _push_ (controlla in Settings → Rules → Rulesets), l'avviso è un semplice no-op. Su account personale Free è quasi certo che non ne hai, perché non sono nemmeno creabili su privato.

Altri effetti del passaggio a pubblico elencati nella stessa schermata: star e watcher vengono azzerati, la history delle Actions e i log diventano pubblici, chiunque può forkare.

## Lato codice: cosa fare prima

Nulla di bloccante nei workflow (gestiscono già entrambi gli stati), ma quattro cose:

1. **Manca la LICENSE.** Un boilerplate pubblico senza licenza è legalmente "all rights reserved" — nessuno può riusarlo. Aggiungi un file `LICENSE` (MIT è la scelta tipica per boilerplate) _prima_ del passaggio.
2. **CODEOWNERS è ancora placeholder**: `.github/CODEOWNERS` contiene `@YOUR-GITHUB-USERNAME` ovunque. Su repo pubblico, se attivi "require review from code owners", un CODEOWNERS con handle inesistente rende la regola inutilizzabile. Sostituisci con `@caliuf`.
3. **Audit dei segreti su tutta la history**, non solo sul working tree: `just secrets` esegue `gitleaks dir` (solo file correnti). Prima di rendere pubblico lancia una scansione della storia con `gitleaks git --redact .` — e ricorda che anche i **log Actions passati diventano pubblici**, quindi verifica di non aver mai stampato segreti in CI.
4. Il `"private": true` in `package.json` riguarda la pubblicazione npm, non la visibilità GitHub: lascialo com'è (o rimuovilo se vorrai pubblicare i package).

## Regole consigliate

### Repo pubblico (tutto gratis)

**Branch ruleset su `main`** (Settings → Rules → Rulesets → New branch ruleset):

- _Restrict deletions_ e _Block force pushes_
- _Require a pull request_: 1 approvazione, dismiss stale reviews, require code owner review (dopo aver fixato CODEOWNERS)
- _Require status checks to pass_: `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`, `dependency-review`, `codeql` — i nomi dei job dei tuoi workflow
- _Require conversation resolution_
- _Require linear history_ (opzionale, ma coerente con il divieto di rewrite del tuo AGENTS.md)

**Tag ruleset su `v*`**: restrict creation e deletion, così i tag di release non sono cancellabili/manipolabili.

**Settings → Actions → General**:

- Fork pull request workflows: **"Require approval for all outside collaborators"** — su un repo pubblico è la protezione chiave contro l'abuso dei tuoi runner (crypto-mining via PR). Con un repo boilerplate pubblico le PR da fork arriveranno.
- Workflow permissions: default read-only — i tuoi workflow dichiarano già `permissions: contents: read`, bene.
- Le action sono già pinnate per SHA: ottimo, mantienilo.

**Settings → Code security**:

- Secret scanning + **push protection**: gratis e consigliato su pubblico
- Dependabot alerts e security updates: hai già `dependabot.yml`, abilitali
- Code scanning CodeQL: partirà da solo dal workflow appena pubblico

### Repo privato (se restasse tale)

Qui sta il punto dolente: su account personale **Free, le branch protection e le rulesets non sono disponibili sui repo privati** — servono GitHub Pro. Le push rulesets richiedono addirittura Team/Enterprise (organizzazioni). Quindi restare privato non solo fa pagare i minuti CI oltre soglia, ma per avere le stesse protezioni dovresti comunque pagare Pro. Se non hai esigenze di riservatezza, il passaggio a pubblico è vantaggioso su entrambi i fronti: minuti illimitati e protezioni complete a costo zero.

Se un giorno tornassi privato con Pro, la configurazione equivalente sarebbe: branch ruleset su `main` come sopra, ambienti con required reviewers per eventuali deploy, e niente regole sui fork (non applicabili).


---

# Domanda

Ho fatto le modifiche che mi hai detto, a parte mettere la LICENSE, però ora non riesco più a pushare. Indagheresti il motivo?

Errore:
```
To https://github.com/caliuf/ts-boilerplate.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/caliuf/ts-boilerplate.git'
```

# Risposta

Trovato. Il push fallisce perché **la ruleset che hai creato sta facendo esattamente il suo lavoro** — e nel configurarla hai creato anche due blocchi secondari che impediranno pure il flusso via PR. Dettaglio:

## Diagnosi

Il repo ora è pubblico (`isPrivate: false`) e c'è una ruleset attiva "Default" sul branch di default con:

```
rules: deletion, non_fast_forward, required_status_checks,
       required_linear_history, pull_request
bypass_actors: []   ← nessuno può bypassarla, nemmeno tu admin
```

La regola `pull_request` impone che **ogni modifica a `main` passi da una pull request**: il push diretto del commit `12c3837 docs: aggiunta doc in init` viene rifiutato lato server (errore tipico: `GH013: Repository rule violations found` / "Changes must be made through a pull request"). Prima, da repo privato su piano Free, non potevi avere ruleset attive, quindi il push diretto funzionava.

## Due problemi ulteriori che bloccherebbero anche le PR

1. **`codeql` è tra i check obbligatori ma non gira mai sulle PR.** La ruleset richiede i contesti `quality`, `integration-and-coverage`, `bun-compatibility`, `e2e`, `codeql`, `dependency-review`. Però `security.yml` ha solo trigger `schedule` (settimanale, per ADR-0005) e `workflow_dispatch` — **nessun `pull_request`**. Su ogni PR il check `codeql` non verrà mai riportato → required checks mai verdi → merge impossibile per sempre. (`dependency-review` invece gira su `pull_request`, quello è a posto.)
    
2. **`require_code_owner_review: true` + unico code owner = te stesso.** GitHub non permette di approvare la propria PR, quindi nessuna PR potrebbe mai soddisfare la regola. Con `bypass_actors` vuoto non puoi nemmeno forzare il merge da admin.
    

Bonus: `strict_required_status_checks_policy: true` significa anche "il branch deve essere aggiornato su main prima del merge" — lecito, ma aggiunge attrito.

## Come sbloccarsi

**Passo 1 — il commit fermo** (da eseguire tu, sono in modalità read-only):

```
git branch docs/init            # salva il commit su un branch
git reset --hard origin/main    # main locale torna allineato (il commit è al sicuro sul branch)
git push -u origin docs/init
gh pr create --fill
```

**Passo 2 — sistemare la ruleset** (Settings → Rules → Rulesets → Default), due strade:

- **Veloce (consigliata per maintainer singolo)**: aggiungi te stesso (o il ruolo _Repository admin_) alla **bypass list** con modalità _Always_. Il push diretto torna a funzionare subito e la ruleset resta attiva come difesa contro errori accidentali e PR esterne.
- **Pulita**: togli `codeql` dalla lista dei required checks (resta comunque attivo settimanalmente da `security.yml`, coerente con ADR-0005) **oppure** aggiungi `pull_request:` ai trigger di `security.yml`; disattiva _Require review from Code Owners_ o porta le approvazioni a 0 finché lavori da solo; valuta se togliere la strict policy sui branch aggiornati.

Nota finale: senza una delle due mosse il repo è di fatto congelato — nemmeno tu puoi modificare `main` in alcun modo. La bypass list è lo sblocco immediato; il resto è rifinitura del flusso PR per quando il progetto avrà contributori esterni.