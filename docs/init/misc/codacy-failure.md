# Question

Sto valutando se inserire i controlli di Codacy su questo progetto.
Ho già un account e ho scansionato il progetto, quindi lato server è tutto a posto.
Ho l'estensione installata su VS Code (serve?)
Vorrei che tu mi preparassi il progetto e tutto quello che serve per poterla utilizzare.
Controlla quanto ho fatto per Codescene e cerca di fare qualcosa di simile per permettere l'esecuzione sia in locale che in CI.
Attualmente vi sono diversi file creati dall'estensione di Codacy (che non ho ancora committato), valuta se sia utile tenerli oppure sia meglio cassarli.
Vedo che sulla dashboard di Codacy ci sono errori strampalati, tipo duplicazioni fra AGENTS.md e CLAUDE.md (ci mancherebbe, il secondo è un sym link al primo!) e indicazioni di procedure troppo lunghe solo perché per un qualche motivo fallisce nel capire la chiusura di una funzione... Se metterlo a posto è troppo sbattimento e le segnalazioni sono poco utili o addirittura del tutto inutili e falsi positivi, direi che posso cassare Codacy
Dopo aver analizzato indicami cosa andrai a fare e fammi domande se ce ne hai prima di procedere.

# Result

Oggi 01-09-2026 Kimi-2.7-code ha fatto le prove e ha dedotto:

```
Ho testato codacy-cli-v2 in locale. I risultati sono pessimi per TypeScript: ESLint di Codacy genera 52 errori di parsing sui file .ts/.tsx perché la config locale non include il parser TypeScript (e il CLI stesso dice che i plugin ESLint non sono ancora supportati). PMD in locale fallisce perché non trova Java in PATH. Opengrep e Trivy trovano 0 issue. Lizard è ok. Quindi codacy-cli-v2 in locale non è usabile per 'quality' su questo progetto. Le opzioni sono: A) Cassare Codacy (il progetto ha già Biome, oxlint, CodeScene, CodeQL, gitleaks). B) Tenere Codacy solo come dashboard cloud, senza CLI locale né CI workflow (configuro solo `.codacy.yml` per escludere symlink/docs). C) Passare al legacy CLI `codacy-analysis-cli` per locale/CI (richiede Docker, più pesante, ma supporta TypeScript come visto nel file `.codacy/codacy.config.json` dell'estensione). Cosa preferisci?
```


## Perché Codacy viene cassata

Durante il test di `codacy-cli-v2` (versione `1.0.0-main.382.sha.473b61c`):

- `codacy-cli analyze --tool eslint` ha prodotto **52 errori di parsing** sui file `.ts`/`.tsx` del progetto (`Parsing error: Unexpected token {`, `Unexpected token type`, `Unexpected token as`, ecc.).
- Il messaggio di `codacy-cli init` avverte esplicitamente: _"ESLint plugins are not supported yet"_; la config generata non include `@typescript-eslint/parser`.
- `codacy-cli analyze --tool pmd` ha fallito con `No java executable found in PATH`.
- `codacy-cli analyze --tool opengrep` ha trovato **0 findings**.
- `codacy-cli analyze --tool trivy` ha trovato **0 vulnerabilità** e **0 secrets**.
- `codacy-cli analyze --tool lizard` è l'unico tool funzionante, ma non ha superato alcuna soglia.

Quindi `codacy-cli-v2` in locale non è usabile per l'obiettivo "quality" su TypeScript. Il progetto ha già strumenti equivalenti o migliori:

- **Quality**: Biome, Oxlint (type-aware), TypeScript strict, Knip, dependency-cruiser.
- **Security**: CodeQL, Gitleaks, Dependabot, GitHub secret scanning.
- **Coverage**: Vitest con cricchetto.
- **Duplicazione**: non c'è un gate dedicato, ma SonarQube Community/SonarQube Cloud sono citati nel Vademecum come alternative valide.

## Estensione VS Code di Codacy

Per il lavoro che faccio io (Kilo nel TUI/sidebar) **l'estensione non serve**. Kilo non usa l'MCP server fornito dall'estensione VS Code; se in futuro si volesse esporre Codacy a Kilo, andrebbe registrato esplicitamente in `~/.config/kilo/kilo.jsonc` con `@codacy/codacy-mcp`. L'estensione è utile solo per ricevere annotazioni in IDE/Copilot. Dato che si cassa Codacy, puoi disinstallarla.