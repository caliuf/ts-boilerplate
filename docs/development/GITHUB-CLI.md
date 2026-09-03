# Vademecum operazioni GitHub con `gh` CLI

Piccola guida di riferimento per operare sul repo `<owner>/<repo>` via GitHub CLI. Da consultare prima di qualsiasi azione su PR, issue, check o impostazioni del repo.

## Autenticazione e permessi

Verifica chi sei e quali scope ha il token:

```bash
gh auth status
gh api user -i | grep -i "x-oauth-scopes"
```

Per operazioni di scrittura (commenti, chiusura PR, modifiche a issue/impostazioni) serve uno scope adeguato (tipicamente `repo`). L'utente può bloccare singoli tool call: se un comando `gh ...` viene rifiutato, chiedi conferma esplicita prima di riprovare.

## Trovare le PR di Dependabot

Usa il filtro nativo `--app dependabot` per limitare i risultati alle PR aperte dall'applicazione GitHub di Dependabot:

```bash
gh pr list --app dependabot --state open --limit 100 \
  --json number,title,headRefName,url,createdAt,state,statusCheckRollup
```

Per vedere anche quelle chiuse:

```bash
gh pr list --app dependabot --state all --limit 100 \
  --json number,title,headRefName,url,createdAt,state,statusCheckRollup
```

## Dettagli di una PR

```bash
gh pr view <numero> --json number,title,body,headRefName,baseRefName,files,createdAt,author,state,url
```

## Leggere i log di un check fallito

Prendi l'ID del job dal campo `statusCheckRollup` (es. `99712947412`) o dall'indirizzo della run:

```bash
gh run view --job <job-id> --log
```

Per vedere solo la coda:

```bash
gh run view --job <job-id> --log | tail -40
```

## Rerun di un check

```bash
gh run rerun <run-id>
```

## Operazioni sulle PR

### Commentare

Usa **single quotes** per il body; i backtick vengono interpretati dalla shell e possono eseguire comandi o troncare il testo.

```bash
gh pr comment <numero> --body 'Testo del commento senza backtick.'
```

Se devi citare file o dipendenze, scrivili in piano:

```bash
gh pr comment 2 --body 'Chiusa in favore della configurazione repo-level in .github/dependabot.yml (ignora le major di @types/node).'
```

### Chiudere

```bash
gh pr close <numero> --comment 'Motivo della chiusura.'
```

Il commento è opzionale; senza `--comment` la PR viene chiusa senza aggiungere una nota.

### Eliminare un commento proprio

Trova l'ID del commento:

```bash
gh api repos/<owner>/<repo>/issues/<numero-pr>/comments --jq '.[-1].id'
```

Poi cancellalo:

```bash
gh api repos/<owner>/<repo>/issues/comments/<id> -X DELETE
```

## Impostazioni del repo

Alcune impostazioni di sicurezza non si abilitano via API anche con scope `repo`. Ad esempio, **Dependency graph** su un repo pubblico va attivato manualmente in *Settings → Code security → Dependency graph*.

Tentativo API (documentato ma non efficace qui):

```bash
printf '{"security_and_analysis":{"dependency_graph":{"enabled":true}}}' |
  gh api repos/<owner>/<repo> -X PATCH \
    -H "Accept: application/vnd.github+json" --input -
```

Se il check `dependency-review` fallisce con:

> Dependency review is not supported on this repository. Please ensure that Dependency graph is enabled...

la causa è quasi certamente Dependency graph disabilitato, non il codice della PR.

## Verificare lo stato delle security features

```bash
gh api repos/<owner>/<repo> \
  -H "Accept: application/vnd.github+json" \
  --jq '{private: .private, dependency_graph_enabled: .dependency_graph_enabled, security_and_analysis: .security_and_analysis}'
```

## Verificare SBOM / dependency graph

```bash
gh api repos/<owner>/<repo>/dependency-graph/sbom \
  -H "Accept: application/vnd.github+json"
```

Se restituisce 404/403, il dependency graph non è attivo.

## Push e ruleset

Il repo ha un ruleset che richiede le modifiche via PR. Il push diretto su `main` può andare a buon fine per l'owner, ma il remote segnala:

```text
Bypassed rule violations for refs/heads/main: Changes must be made through a pull request.
```

Preferisci sempre la PR per modifiche non urgenti; usa il push diretto solo quando l'utente lo richiede esplicitamente.

## Checklist prima di toccare GitHub

- [ ] Ho letto questo file.
- [ ] Ho verificato `gh auth status`.
- [ ] So se l'azione è di lettura o scrittura e, se di scrittura, ho il consenso dell'utente.
- [ ] Uso single quotes nei `gh pr comment --body`.
- [ ] Non uso `--no-verify` né forzo operazioni distruttive.
