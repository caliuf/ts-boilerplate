# Domanda

Cos'è cspell e a cosa serve? Serve davvero in un progetto o è solo rumore? Spiegami bene perché dovrei tenerlo

# Risposta

## Cos'è cspell

**cspell** è uno spell checker (correttore ortografico) progettato specificamente per il codice e la documentazione tecnica. A differenza del correttore di Word, capisce la sintassi dei sorgenti:

- spezza gli identificatori `camelCase`, `snake_case`, `SCREAMING_SNAKE` in singole parole e le verifica separatamente;
- ignora automaticamente URL, hash, percorsi, sintassi del linguaggio;
- supporta dizionari multipli (lingue naturali + dizionari tecnici per TypeScript, Node, npm, ecc.);
- è fatto per girare in CI come gate deterministico: veloce, senza false partenze, configurabile via file.

## Come è configurato in QUESTO progetto

Non è una domanda astratta: qui cspell è già integrato, e la configurazione dice molto sul perché vale la pena tenerlo. Da `cspell.json` e `justfile`:

```
"language": "en,it",
"dictionaries": ["it", "en", "typescript", "node", "npm", "project-words"]
```

e nel `justfile`, dentro la ricetta `docs-check`:

```
pnpm exec markdownlint-cli2
pnpm exec cspell lint --no-progress "**/*.md"
lychee --offline --no-progress --include-fragments .
```

Tre cose da notare:

1. **Gira solo sui Markdown** (`**/*.md`), non sui sorgenti. È una scelta deliberata: niente falsi positivi sugli identificatori del codice, rumore quasi zero.
2. **È bilingue en+it**, con dizionario italiano (`@cspell/dict-it-it`) — sensato, perché la documentazione di questo repo è in italiano con termini tecnici inglesi mescolati.
3. **Ha un glossario di progetto** (`tools/cspell/project-words.txt`, 42 parole: `committare`, `greppabili`, `justfile`, `knip`, `idempotenza`...) con l'istruzione esplicita: _"Add domain terms, proper names and tool names here (not inline disables)"_. Questo è il meccanismo anti-rumore: quando segnala un termine di dominio legittimo, lo aggiungi a un file condiviso una volta sola, invece di disseminare disable inline.

# A cosa serve davvero

**1. I typo nella documentazione sono errori permanenti e pubblici.** Questo è un boilerplate pensato per essere clonato: `docs/PROJECT.md`, gli ADR, i PDR _sono_ il prodotto. Un refuso in un ADR resta lì per anni e mina la credibilità di tutto il documento. Gli occhi umani sono pessimi a intercettare refusi in testo misto italiano/inglese — esattamente il caso di questo repo.

**2. È un gate per il lavoro degli agenti AI.** Questo progetto è esplicitamente "AI-driven" (lo dice il commit di bootstrap). Gli LLM generano molta prosa — docstring, ADR, README — e sono notoriamente incapaci di accorgersi dei propri refusi. Un gate meccanico, veloce e deterministico che cattura un'intera classe di errori degli agenti è esattamente il tipo di rete di sicurezza che un workflow AI-driven richiede. markdownlint controlla la forma, lychee controlla i link, cspell controlla le parole: insieme coprono la qualità della documentazione senza affidarsi al giudizio dell'LLM di turno.

**3. I typo si propagano.** Un refuso in un identificatore o in un termine di dominio (`recieve`, `adress`) viene copiato ovunque — da umani e a maggior ragione dagli agenti, che lo riutilizzano fedelmente. Correggerlo dopo è una rename breaking; intercettarlo all'ingresso costa 10 secondi.

# È rumore? Dipenderebbe dalla configurazione — e qui è fatta bene

Lo spell checker diventa rumore quando:

- non ha un dizionario di progetto → falsi positivi continui sui termini di dominio → la gente inizia a ignorarlo o a disattivarlo;
- gira su file generati, lock file, dipendenze → migliaia di segnalazioni spurie;
- gira sul codice sorgente senza dizionari tecnici → segnala ogni identificatore.

Qui nessuna di queste condizioni si verifica: `ignorePaths` esclude `node_modules`, `pnpm-lock.yaml`, `coverage`, `dist`, `agent-docs`; il glossario esiste ed è curato; il perimetro è solo la documentazione. Il costo di manutenzione reale è aggiungere una riga a un file di testo ogni tanto.

Il confronto asimmetrico è questo: il **fallimento di cspell** è un falso positivo che risolvi in 10 secondi aggiungendo una parola al glossario; il **fallimento senza cspell** è un refuso cotto dentro documenti pubblici e propagato dagli agenti, che nessun altro gate del repo (typecheck, lint, test, arch) può intercettare.

# Verdetto

Tienilo. In un repo doc-heavy come questo — ADR, PDR, vademecum, documentazione di processo, e agenti AI che scrivono prosa a ogni task — il rapporto costo/beneficio è schiacciante a favore: costo di manutenzione prossimo allo zero, valore concreto su ogni PR che tocca documentazione. Rimuoverlo indebolirebbe `docs-check` lasciando un buco che nessun altro strumento della toolchain copre. L'unica cautela è quella già scritta nel file stesso: alimenta il glossario invece di spegnere le segnalazioni, e resterà un gate silenzioso e utile invece che rumore.