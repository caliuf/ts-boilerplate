# Da boilerplate a progetto: guida di adozione

Cosa fare da quando prendi in mano questo boilerplate per iniziare un progetto nuovo. Pensata per essere eseguita **insieme a un agente AI**: ogni passo ha il prompt pronto da incollare.

> Quando l'adozione è completa, cancella questo file e `docs/init/`.

## 0. Prerequisiti

Una volta per macchina: [just](https://just.systems/man/en/packages.html),
[mise](https://mise.jdx.dev/getting-started.html), git, un account GitHub con
`gh` autenticato (`gh auth login`).

## 1. Crea la copia

```sh
git clone <url-di-questo-boilerplate> il-mio-progetto
cd il-mio-progetto
git remote remove origin        # il boilerplate resta una copia, non un fork
just setup                      # tool, dipendenze, hook, browser Playwright
just doctor                     # tutto ✅ prima di proseguire
```

## 2. Rinomina i placeholder

I meta-placeholder sono marcati e greppabili. Cerca `META:` nei file e lo scope `@project`:

```sh
grep -rn "META:" --include="*.md" --include="*.ts" --include="*.tsx" . | grep -v node_modules
grep -rln "@project" --include="*.json" --include="*.ts" . | grep -v node_modules
```

Cose da rinominare (prompt pronto):

```text
Adotta il boilerplate per il progetto "<NOME>": rinomina lo scope npm
`@project` in `@<nome>` in tutti i package.json e import, il bin della CLI da
`project` a `<nome>` (apps/cli/package.json, help in cli.ts), il prefisso URN
`urn:project:` in packages/contracts, il nome del server MCP in
apps/mcp/src/create-server.ts, il titolo in apps/web/index.html e il name nel
package.json radice. Risolvi tutti i commenti `META:` che riguardano nomi.
Aggiorna docs/PROJECT.md di conseguenza. Chiudi con `just ci` verde.
```

## 3. Descrivi il TUO progetto (la parte che decide l'umano)

Compila, anche a mano o dettandoli all'agente:

1. `docs/PROJECT.md` — obiettivo, non-obiettivi, superfici reali, servizi    esterni. È il primo file che ogni agente legge.
2. `docs/product/GLOSSARY.md` — le prime astrazioni di dominio.
3. Prima PDR `proposed` se hai già regole di prodotto.

Prompt pronto:

```text
Intervistami sul progetto che voglio costruire (scopo, utenti, superfici
necessarie tra CLI/API/MCP/UI, servizi esterni, dati sensibili) e poi riscrivi
docs/PROJECT.md, docs/product/OVERVIEW.md e docs/product/GLOSSARY.md di
conseguenza. Non toccare il codice. Fammi domande finché il quadro non è
completo.
```

## 4. Taglia ciò che non serve

Il vademecum vieta deployable ipotetici. Se il progetto non ha UI, elimina `apps/web` + `tests/e2e` + `e2e.yml`; se non ha MCP, elimina `apps/mcp`; ecc.

Prompt pronto:

```text
Questo progetto non avrà <UI web / server MCP / API>: rimuovi le app, i test e
i workflow corrispondenti, aggiorna pnpm-workspace, knip.json, vitest.config.ts,
docs/PROJECT.md (tabella deployable e mappa superfici) e GETTING-STARTED.md.
`just ci` deve restare verde.
```

## 5. Sostituisci il dimostratore col primo caso d'uso reale

`hello-world` esiste per mostrare la struttura. Sostituiscilo (non estenderlo):

```text
Sostituisci il bounded context `greetings` con il primo caso d'uso reale:
<COSA DEVE FARE>. Segui TDD: prima il test di integration che fallisce, poi
l'implementazione. Mantieni la struttura domain/application/ports, i contratti
in packages/contracts, l'esposizione sulle superfici decise con naming
parallelo e la mappa in docs/PROJECT.md aggiornata. Scrivi la PDR se il caso
d'uso introduce una regola di prodotto nuova. Chiudi con `just prepush` verde.
```

## 6. Setup GitHub

Crea il repo e configuralo (serve `gh` autenticato; altrimenti segui i passi in UI — stessa checklist):

```sh
gh repo create <nome> --private --source . --push
```

Poi, in *Settings* (o via API):

1. **Code security**: abilita Dependabot alerts, Dependabot security updates,    secret scanning e push protection.
2. **Rules → Rulesets** su `main`: require pull request, status check    obbligatori (i job di `ci.yml`: `quality`, `integration-and-coverage`,    `bun-compatibility`, `e2e`), block force pushes, squash merge, require    review from Code Owners.
3. Niente altro: i workflow partono da soli al primo push.

Prompt pronto (l'agente userà `gh api` dove serve):

```text
Configura il repo GitHub corrente secondo docs/development/WORKFLOWS.md:
abilita Dependabot alerts/security updates/secret scanning/push protection e
crea il ruleset di main con gli status check obbligatori elencati lì. Prima
leggi .github/workflows/ per i nomi esatti dei job. Riporta i comandi eseguiti
e le risposte dell'API.
```

## 7. Attiva i task schedulati

I guard girano via `.github/workflows/scheduled.yml` (cron settimanale): **non richiedono configurazione** oltre al repo attivo. Apriranno issue in caso di findings. Verifica dopo la prima settimana che il workflow sia girato (*Actions → scheduled*) e calendarizzati la prima retrospettiva di processo (prompt in `WORKFLOWS.md`).

Se lavori senza remoto GitHub: esegui `just guards` a mano ogni settimana.

## 8. Manutenzione ordinaria (prompt ricorrenti)

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

- [ ] `just doctor` tutto ✅
- [ ] placeholder rinominati (`@project`, `project`, `urn:project:`, `META:`)
- [ ] `docs/PROJECT.md` descrive il TUO progetto
- [ ] app/superflue rimosse; `just ci` verde
- [ ] `hello-world` sostituito dal primo caso d'uso reale
- [ ] repo GitHub creato, security settings e ruleset attivi
- [ ] prima esecuzione di `scheduled.yml` verificata
- [ ] questo file e `docs/init/` cancellati
