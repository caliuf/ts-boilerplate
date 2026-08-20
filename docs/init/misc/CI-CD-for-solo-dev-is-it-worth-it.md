# Domanda

Mi spieghi bene come funziona l'integrazione di questo repo con la CI/CD GitHub e perché dovrei tenerla?
Per un solo dev non è solo rumore?
Il mio flusso di lavoro ne beneficia, o visto che sviluppo da solo e solo su questo pc sarebbe meglio far eseguire all'AI i controlli in locale e basta, e lì correggerli?
Visto che terrò il repo pubblico, magari avendo minuti di CI/CD illimitati può dare un vantaggio, ma per un repo privato?

# Risposta

Ho esaminato i tre workflow, il justfile, l'ADR-0005 e la documentazione dei gate. Ecco il quadro completo.

## Come funziona l'integrazione CI/CD di questo repo

Il design è documentato in `docs/development/WORKFLOWS.md` e si basa su tre livelli:

|Livello|Dove|Cosa fa|
|---|---|---|
|**Guides**|testo (AGENTS.md, docs)|regole per umani/AI — utili ma fallibili|
|**Gates**|locale + CI|controlli bloccanti identici nelle due sedi|
|**Guards**|CI schedulata|controlli report-only che aprono issue|

Il punto chiave è nella riga 10 di WORKFLOWS.md: **"La CI riesegue le stesse recipe e fa fede; il locale dà feedback immediato."** I workflow GitHub non contengono logica propria: chiamano solo `just <recipe>`, le stesse che giri in locale.

### I tre workflow

**`ci.yml`** (push su main + PR, ADR-0005 "CI consolidata"):

- `quality`: format, lint, typecheck, dead-code, arch, docs-check, workflows-check, secrets
- `integration-and-coverage`: test unit, integration, smoke, coverage con ratchet
- `bun-compatibility`: suite di compatibilità Bun
- `e2e`: Playwright, con upload degli artifact in caso di fallimento
- `dependency-review`: solo su PR di repo pubblici (si auto-esclude sui privati perché richiede GitHub Advanced Security)

**`security.yml`** (settimanale, "slow lane"): CodeQL (solo repo pubblici) + gitleaks su **tutta la storia git**.

**`scheduled.yml`** (settimanale): `just guards` (coerenza docs↔recipe↔registry, apre issue se trova problemi) + lychee sui link esterni.

Più **Dependabot** (`dependabot.yml`): PR settimanali per aggiornamenti npm e GitHub Actions, con cooldown e raggruppamento.

## Perché NON è rumore, anche da solo

### 1. I controlli locali si degradano silenziosamente; la CI no

Questo è l'argomento decisivo contro "faccio girare tutto in locale all'AI". Guarda il justfile:

```
# workflows-check, secrets, docs-check, bun-smoke hanno tutti questo pattern:
if command -v zizmor >/dev/null 2>&1; then
  zizmor .
else
  echo "⚠️  zizmor not found — skipping (blocking in CI; run `mise install`)"
fi
```

actionlint, zizmor, gitleaks, lychee e bun **si auto-saltano in locale se lo strumento manca** — il gate passa verde senza aver verificato nulla. In CI `mise-action` installa le versioni esatte pinnate in `.mise.toml`: l'ambiente è pulito e riproducibile a ogni run. Se un tool si rompe sulla tua macchina (aggiornamento, PATH sporco, mise non eseguito), te ne accorgi solo dalla CI.

### 2. Gli hook git non sono una garanzia strutturale

Gli hook si attivano con `just setup` (`core.hooksPath .githooks`). Se cloni fresco e dimentichi il setup, o una sessione AI committa in un worktree senza hook, **nulla blocca il push**. `--no-verify` è vietato per policy, ma la policy è una "guide" — fallibile per definizione. La CI + ruleset su main (gratuito) rende il gate _strutturale_: è l'unico controllo che né tu né l'AI potete bypassare per distrazione.

### 3. Cose che il locale non fa proprio

- **gitleaks su tutta la storia** — in locale scansiona solo working tree/staged; un segreto committato tre settimane fa e pushato lo becca solo la slow lane
- **CodeQL** (SAST) — gratis sui repo pubblici
- **Dependabot** — è un servizio GitHub, non esiste equivalente locale; per un dev solo che altrimenti non aggiornerebbe mai le dipendenze è forse il valore più grande
- **lychee sui link esterni** — deliberatamente escluso dalla fast lane perché lento/instabile
- **guards settimanali con apertura automatica di issue** — il monitoraggio di salute del repo
- **e2e in ambiente pulito** con artifact Playwright scaricabili al fallimento
- **bun-compatibility** — hai bun installato localmente? In CI è garantito

### 4. L'AI che controlla se stessa è un conflitto di interesse

AGENTS.md dice esplicitamente che le guide sono fallibili e per questo esistono i gate. Far verificare il lavoro dell'AI solo dall'AI stessa, sulla stessa macchina possibilmente malconfigurata, elimina il "secondo parere" indipendente. La CI è l'auditor che non ha scritto il codice.

### 5. Il costo di tenerla è ~zero

ADR-0005 ha **già** fatto il lavoro di riduzione del rumore: da tre workflow per push a uno solo consolidato, security spostata in slow lane settimanale. Manutenzione: tre file piccoli che chiamano `just` — quando cambi una recipe locale, la CI è automaticamente aggiornata. Non c'è config parallela da sincronizzare.

## Pubblico vs privato: i numeri

||Pubblico|Privato (free)|
|---|---|---|
|Minuti Actions|**illimitati**|2000/mese gratis|
|CodeQL + dependency-review|gratis|richiedono GHAS (i job si auto-escludono)|
|Secret scanning + push protection|gratis|gratis|
|Dependabot|gratis|gratis|

Budget del repo: CI completa ≤10 min wall-clock (job paralleli). Anche sul privato, 2000 minuti bastano per ~80-100 push/mese nel caso peggiore — per un dev solo è abbondante. Sul pubblico, dove hai detto che lo terrai, è tutto gratis e illimitato, e CodeQL/dependency-review si attivano da soli.

Bonus per un boilerplate pubblico: badge verde e required checks sono un segnale di fiducia per chi lo trova, e `main` sempre verde significa che ogni clone è known-good — utile anche a te se cambi PC o ti muore il disco.

## Raccomandazione

Tienila tutta. L'ipotesi "rumore per un solo dev" era vera per la struttura originale del vademecum, ma ADR-0005 l'ha già corretta. Quello che resta è: un run per push che replica i gate locali in ambiente garantito, due run settimanali report-only, e Dependabot. Il rapporto valore/manutenzione per un dev solo è eccellente, e sul repo pubblico costa zero.

Se in futuro volessi ridurre ulteriormente, l'unico candidato sensato è `scheduled.yml` (i guards puoi corrergli a mano con `just guards`), ma a quel punto perdi l'apertura automatica delle issue e il controllo dei link esterni — risparmio di 2 run/settimana, non ne vale la pena.