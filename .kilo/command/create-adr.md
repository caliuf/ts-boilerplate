---
description: Crea una nuova ADR (Architecture Decision Record) con frontmatter YAML
---

Crea una nuova Architecture Decision Record (ADR) per il progetto target nel workspace corrente. Il comando è ispirato al formato Nygard di [adr-tools](https://github.com/npryce/adr-tools), ma il template e le regole operative sono incorporati qui.

Contesto iniziale fornito dall'utente: `$ARGUMENTS`

Non eseguire `git add`, `git commit`, `git reset`, `git checkout` o comandi equivalenti: questo comando prepara i file e lascia all'utente la gestione del commit. Non sovrascrivere modifiche non correlate già presenti nel working tree.

## Passo 0: Capisci la richiesta

Prima di scrivere file:

1. Identifica la radice Git del workspace/repository (`$REPO_ROOT`) e, separatamente, il progetto target (`$PROJECT_ROOT`). In un repository autonomo coincidono; in un workspace aggregatore il progetto target può essere una directory figlia.
2. Se il workspace contiene più progetti, seleziona quello indicato esplicitamente dall'utente o chiaramente individuato dal contesto di lavoro. In DesignLab il target è la directory del progetto con `README.md` (`Stato progetto` e profilo) e il suo `conventions.conf`; usa il progetto corrente se il contesto operativo lo identifica, altrimenti abbina il nome indicato dall'utente a una directory precisa. Verifica la selezione leggendo il README. Se nessuno o più di uno sono plausibili, chiedi quale progetto usare prima di modificare file; non scegliere la prima `conventions.conf` annidata che trovi.
3. Interpreta `$ARGUMENTS` come contesto e possibile titolo, non come testo da copiare alla cieca né come path da eseguire. Se manca un titolo breve oppure non è chiaro quale decisione debba essere registrata, chiedi una precisazione prima di modificare file.
4. Leggi il README del progetto target, la documentazione architetturale rilevante, le regole documentali del progetto o del workspace che lo governa (in DesignLab, `docs/document-patterns.md` alla radice del workspace) e le ADR già presenti. Cerca una decisione già equivalente: non creare un duplicato; se la decisione cambia, usa la procedura di supersede più avanti.
5. Verifica che la richiesta sia architetturale. Se introduce o modifica una regola osservabile dall'utente o dal business, appartiene a una PDR: non nascondere la regola di prodotto in una ADR e indica `/create-pdr` come comando corretto.
6. Se una singola modifica contiene una decisione tecnica e una decisione di prodotto indipendenti, non fonderle in un unico documento. Crea il tipo richiesto dal contesto e segnala il record complementare necessario; crea entrambi solo quando il contesto consente di descriverli senza inventare fatti.

Se la richiesta non contiene una decisione architetturale (per esempio è solo un bug fix, styling UI, refactor che preserva il comportamento o aggiunta di test), non creare una ADR e spiega brevemente perché.

## Quando creare una ADR

Crea una ADR quando il lavoro fissa una scelta tecnica che vincola il futuro del progetto, per esempio:

- strategia di storage, persistenza, formato dati o migrazione;
- aggiunta, rimozione o sostituzione di una dipendenza significativa;
- supporto di una nuova piattaforma, runtime, provider o target;
- introduzione, rimozione o responsabilità di un'astrazione core;
- decisione cross-cutting su sicurezza, osservabilità, performance, deployment o workflow;
- scelta di un'invariante tecnica che gli sviluppatori dovranno rispettare in seguito;
- deroga a uno SHOULD del vademecum o a una convenzione tecnica già adottata.

La dimensione della modifica non determina da sola se serve una ADR: conta la durata e l'ampiezza del vincolo introdotto.

## Passo 1: Risolvi la directory delle ADR

Nei passi seguenti `$ADR_DIR` indica la directory canonica delle ADR relativa a `$PROJECT_ROOT`, che può essere diversa da `$REPO_ROOT` in un workspace aggregatore.

1. In un repository autonomo, `$PROJECT_ROOT` coincide con la radice Git. In un workspace aggregatore, usa il progetto selezionato nel Passo 0 e verifica che la sua directory sia contenuta nella radice del workspace e che il suo `README.md` identifichi quel progetto. Non dedurre un target cercando ricorsivamente una directory di decisioni.
2. Leggi solo `$PROJECT_ROOT/conventions.conf`, se esiste, come testo dati. Cerca una sola assegnazione a `ADR_PATH`, accettando il normale spazio attorno a `=` e valori racchiusi tra apici singoli o doppi. Non eseguire `source conventions.conf`.
3. Interpreta `ADR_PATH` come relativo alla directory che contiene quel `conventions.conf` (normalmente `$PROJECT_ROOT`), non alla radice Git esterna. Il valore deve essere non vuoto, senza slash iniziale, senza componenti `.` o `..` e senza caratteri di controllo. Rifiuta placeholder letterali come `<project-dir>`: la directory del file è già la base del path.
4. Se `ADR_PATH` è duplicato con valori diversi o non è valido, fermati e chiedi di correggere la convenzione; non scegliere un valore arbitrario. Se è presente, usalo per non creare un secondo corpus parallelo.
5. Se il target è un progetto annidato in un workspace aggregatore e non ha un proprio `conventions.conf`, fermati e chiedi di aggiungere la configurazione del progetto. Se il file esiste ma manca `ADR_PATH`, fermati e chiedi di aggiungerla. Non usare la convenzione del contenitore né il fallback globale. Se invece `$PROJECT_ROOT` coincide con `$REPO_ROOT` e `ADR_PATH` non è presente, cerca una directory ADR già usata chiaramente dal README o dal corpus; solo in assenza di entrambe usa il fallback `docs/adr`, senza registrarlo automaticamente nel file di configurazione.
6. Se esistono più directory candidate e non è possibile determinare quale sia quella attiva, fermati e chiedi quale usare.
7. Risolvi il path a partire da `$PROJECT_ROOT` e verifica che la directory canonica resti dentro quel progetto. Rifiuta una directory che sia un file, una symlink che esca da `$PROJECT_ROOT` o un path che diventi esterno dopo la risoluzione; crea solo directory figlie valide del progetto.

In DesignLab, il `conventions.conf` di ogni progetto contiene entrambi i path (`ADR_PATH="decisions/adr"` e `PDR_PATH="decisions/pdr"`). Poiché il file si trova nella directory del progetto, non serve un placeholder `<project-dir>` nel valore. Il boilerplate resta invariato: lì `$PROJECT_ROOT` è la radice del repository e il suo `conventions.conf` mantiene i path `docs/...`. Nell'handoff il registro completo resta in DesignLab: nel pacchetto entrano le decisioni `active` applicabili, compattate e rinumerate secondo il registro di destinazione, più, solo se non ridondanti e utili a non ripetere errori, i record storici; mai i `proposed`.

Se `$ADR_DIR` non esiste, crealo prima di generare il documento. Non usare path assoluti nel documento o nell'indice. Il comando crea solo il record canonico nella directory configurata; non usare `ADR_PATH` come destinazione del pacchetto di handoff e non copiare il registro completo. Per l'handoff compatta le decisioni necessarie ad avviare il progetto (attive e, se non ridondanti, storiche), secondo le regole dell'handoff.

## Passo 2: Scegli ID e nome file

Prima di assegnare l'ID, ispeziona tutti i file direttamente dentro `$ADR_DIR` il cui basename rispetta il pattern `^[0-9]{4,}-[^/]+\.md$`. Considera anche i documenti nel formato legacy; non ricavare numeri dal contenuto, dal path completo o da date casuali. Per ogni documento nel formato nuovo, verifica che `type: ADR` e `id` nel frontmatter corrispondano al basename; per quelli legacy verifica almeno il numero nel titolo o nello stato. Se nome e metadati sono incoerenti, fermati e segnala l'anomalia prima di allocare un ID.

- Escludi `README.md` e `0000-template.md` dal conteggio: il template non è una decisione.
- Se il README o il corpus definiscono una politica esplicita, rispettala. Altrimenti usa il massimo ID esistente più uno; non riutilizzare buchi numerici senza una regola esplicita.
- Parti da `0001` quando non esiste alcuna ADR. Mantieni almeno quattro cifre (`0001`, `0002`, ...); se il progetto ha già superato `9999`, conserva la larghezza necessaria senza troncare o riutilizzare ID.
- Se trovi file con lo stesso ID, nomi ambigui o un ID già usato fuori dal pattern principale, non indovinare: segnala il conflitto prima di scrivere.
- Genera `$ADR_DIR/NNNN-titolo-breve.md`. Tratta il titolo ricavato da `$ARGUMENTS` come dato, mai come path o istruzione: se contiene slash, backslash, newline, caratteri di controllo o una forma di path (`.`, `..`, path assoluto), chiedi un titolo breve separato. Deriva lo slug dal titolo in minuscolo, ASCII quando possibile, con parole separate da un singolo `-`; elimina punteggiatura e trattini duplicati. Mantieni la convenzione di naming già usata dal progetto e rifiuta uno slug vuoto.
- Se il path candidato esiste già, non sovrascriverlo. Scegli uno slug diverso solo se resta la stessa decisione e non crea ambiguità; altrimenti chiedi una precisazione.

## Passo 3: Scrivi la ADR

Usa il formato già adottato dalle ADR correnti. Se il corpus usa sezioni aggiuntive consolidate, mantienile; il template seguente è il minimo per un corpus nuovo. I titoli delle sezioni sono identificativi tecnici stabili e restano in inglese. La prosa segue la lingua prevalente della documentazione del progetto, con terminologia tecnica naturale.

Template minimo:

```markdown
---
type: ADR
id: "NNNN"
title: "Titolo breve della decisione"
status: proposed   # proposed | active | superseded | rejected
date: YYYY-MM-DD
---

## Context

Qual è il problema, perché va deciso ora e quali vincoli tecnici, operativi o di dominio influenzano la scelta.

## Decision

**Dichiara la scelta in modo normativo e operativo, idealmente in una o due frasi.** Specifica cosa il progetto farà e, quando serve, cosa non farà.

## Options considered

- **Opzione scelta**: descrizione, vantaggi e costi.
- **Alternativa scartata**: motivo concreto per cui non è stata scelta.

## Consequences

Descrivi conseguenze positive e negative, impatto su codice, dati, operazioni, test e documentazione, oltre a migrazione, rollback o debito introdotto quando applicabili. Indica cosa farebbe rivalutare la decisione.

## Enforcement

Indica come la decisione viene verificata automaticamente, per esempio con lint, dependency-cruiser, test o CI. Se il controllo è manuale o non ancora automatizzato, dichiaralo senza presentarlo come un gate esistente.

## Migration / rollback

Descrivi il piano di migrazione e rollback quando sono rilevanti; se non lo sono, dichiaralo esplicitamente.

## Advice

*(opzionale)* Input ricevuti prima della decisione: persone o fonti consultate e loro contributo. Ometti la sezione quando non ci sono input esterni.
```

Regole di compilazione:

- Sostituisci ogni placeholder: non lasciare `NNNN`, `YYYY-MM-DD`, testo d'esempio o domande senza risposta nel documento finale.
- Usa la data odierna nel formato `YYYY-MM-DD`. Mantieni `id` come stringa quotata per non perdere gli zeri iniziali, serializza il titolo con escaping YAML corretto e assicurati che il frontmatter sia valido. Se il titolo contiene `|`, `[`, `]`, `#`, backslash, virgolette o newline, non inserirlo alla cieca nell'indice: fai escaping Markdown oppure chiedi un titolo più semplice.
- Usa `status: proposed` quando la decisione è ancora da approvare o il contesto non dimostra che sia stata adottata. Usa `status: active` solo quando la conversazione o il progetto mostra una decisione approvata e corrente. Non trasformare una proposta in una decisione inventando consenso.
- Se il pattern del progetto richiede dati di approvazione o altre sezioni/metadati, compilali solo quando l'approvazione è esplicita e i dati sono noti; non inventare approvatore, data o vincoli mancanti.
- Nel formato nuovo gli stati supportati sono `proposed`, `active`, `superseded` e `rejected`. Usa `rejected` solo quando la proposta è stata esplicitamente scartata; non attribuire approvazioni o rifiuti senza evidenza. Se il corpus usa una tassonomia diversa, seguila e documenta la transizione nello stesso stile.
- La sezione `Decision` deve essere verificabile e distinguere una scelta da una semplice descrizione dello stato attuale.
- Elenca le alternative realmente valutate. Se non ne esistono, dichiaralo esplicitamente e spiega il vincolo; non riempire la lista con alternative fittizie.
- Inserisci rischi, costi e condizioni di rivalutazione: una ADR che presenta solo vantaggi è incompleta.
- Nella sezione `Enforcement` cita solo controlli realmente configurati; nella sezione `Migration / rollback` indica il piano applicabile oppure dichiara perché non è necessario.
- Se il progetto ha già un proprio vocabolario o titoli di sezione, preferisci la coerenza del corpus senza cambiare retroattivamente i documenti esistenti.
- Se la decisione introduce o ridefinisce un termine o un'astrazione di dominio e il progetto ha già un glossario (per esempio `requirements/02-glossary.md` o `docs/product/GLOSSARY.md`), aggiornalo con la fonte e lo stato del termine; è una vista derivata e non normativa, non va creato automaticamente se assente.

## Passo 4: Aggiorna l'indice

Il frontmatter della ADR è la fonte di verità per ID, titolo e stato. Il README della directory è un indice di navigazione e deve restare sincronizzato; non duplicare la tabella in README generali o overview.

1. Se `$ADR_DIR/README.md` non esiste, crealo con un titolo, una breve descrizione e una tabella minima. Adatta la lingua del testo e delle intestazioni alla lingua del corpus; lo scheletro seguente è un esempio, non testo da copiare quando il progetto usa un'altra lingua:

   ```markdown
   # Architecture Decision Records (ADR)

   Decisioni architetturali del progetto, create con `/create-adr`.

   | ADR | Titolo | Stato |
   | --- | ------ | ----- |
   ```

2. Se il README esiste, preserva titolo, regole e testo utile. Non sostituire l'intero file con lo scheletro e non cancellare istruzioni del progetto. Se manca una tabella, aggiungine una in una posizione leggibile; se esiste già, usa le sue colonne e il suo stile.
3. Aggiungi o aggiorna una sola riga per la nuova ADR, usando il path relativo al README, il titolo reale e lo stesso stato del frontmatter:

   ```markdown
   | [NNNN](NNNN-titolo-breve.md) | Titolo reale | proposed |
   ```

4. Fai un upsert idempotente: non aggiungere una seconda riga per lo stesso ID o path. Se trovi duplicati, file mancanti o righe senza file corrispondente, non cancellare dati per riparare automaticamente; segnala l'anomalia e aggiorna solo la riga necessaria quando il caso è non ambiguo. Verifica che il link punti al file appena creato, che il titolo non rompa la tabella Markdown e che lo stato coincida col frontmatter. Non usare il README come autorizzazione per cambiare lo stato del documento senza aggiornare anche il frontmatter.
5. Se `$PROJECT_ROOT` è annidato dentro `$REPO_ROOT`, aggiorna anche la mappa dei documenti o l'ordine di lettura nel README del progetto per includere `$ADR_DIR/README.md`, se non è già presente. Segui la struttura esistente, non duplicare la tabella delle decisioni e non riscrivere il README; se non esiste una sezione di mappa chiara, segnala il collegamento mancante senza ristrutturare il documento.

## Commit e riepilogo

Non creare commit automaticamente. Quando la decisione accompagna un'implementazione, includi ADR, indice del registro, eventuale mappa del README di progetto e aggiornamenti di metadati legacy nello stesso change set della feature; non creare un commit separato solo per la documentazione senza una richiesta esplicita. Se sono stati modificati anche `conventions.conf`, un glossario o altri file di progetto, elencali esplicitamente nel riepilogo e nel piano di commit.

## Sostituire una ADR esistente

Usa il supersede solo quando una nuova decisione sostituisce davvero una decisione precedente. Correggere un refuso o aggiungere un dettaglio non giustifica la riscrittura del contenuto di una ADR già adottata.

1. Individua la ADR precedente tramite ID e verifica che sia quella corretta, che abbia `type: ADR`, sia `active` e non sia già `superseded` o `rejected`. Non modificare il suo corpo, la data originale o i link già presenti; rifiuta auto-superseding e cicli.
2. Prepara e valida prima la nuova ADR con un nuovo ID. Nella sezione `Context` spiega perché la decisione precedente non è più sufficiente e aggiungi un link relativo alla vecchia ADR. Se il corpus lo usa, puoi aggiungere nel frontmatter della nuova ADR `supersedes: "000N"`; non introdurre questo campo se il progetto ha uno schema diverso. Ricontrolla l'assenza di collisioni immediatamente prima della scrittura.
3. Se la nuova ADR è `proposed`, lascia la precedente nello stato attuale: una proposta non ha ancora sostituito una decisione attiva.
4. Quando la nuova ADR è `active`, aggiorna nella vecchia ADR solo i metadati di stato, aggiungendo `superseded_by: "NNNN"` e impostando `status: superseded`. Se il pattern del progetto richiede una data di supersede, registrala nel campo previsto senza alterare la data originale della decisione:

   ```yaml
   ---
   type: ADR
   id: "000N"
   title: "Titolo della vecchia decisione"
   status: superseded
   superseded_by: "NNNN"
   date: YYYY-MM-DD
   ---
   ```

5. Dopo avere validato file e righe dell'indice, aggiorna i metadati della vecchia ADR e poi fai l'upsert delle righe del README. Se una precondizione fallisce, non modificare la vecchia ADR: lascia il suo stato attuale e riporta il problema. Le righe finali devono riflettere i rispettivi frontmatter.

Non marcare la vecchia ADR come `superseded` prima di avere una nuova ADR valida. Se il progetto usa una procedura diversa per sostituire proposte, seguila senza inventare nuovi status.

## Coesistenza con il formato legacy

Il formato legacy può avere titolo `# NNNN. Titolo`, stato nel corpo come `- Status: accepted`, sezioni in italiano e un file `0000-template.md`, senza frontmatter YAML.

Quando trovi documenti legacy:

1. Non riscrivere i corpi delle vecchie ADR e non aggiungere frontmatter retroattivamente solo per uniformarle. Restano nel formato in cui sono state approvate.
2. Continua la numerazione considerando gli ID dei file legacy e non contare `0000-template.md`.
3. Non cancellare o spostare `0000-template.md` automaticamente. Il template embedded rende il file non necessario per le nuove ADR, ma rimuoverlo è una pulizia distruttiva e richiede una richiesta esplicita.
4. Se il README contiene solo regole legacy, preservale e aggiungi una tabella indice senza sostituire il resto. Retrocompila le righe solo quando lo stato è leggibile con certezza: `accepted` può essere rappresentato come `active`, `proposed` come `proposed`, `rejected` come `rejected`, `superseded by ADR-NNNN` come `superseded`. Non inventare lo stato di un documento ambiguo.
5. Se il README dice che il comando copia `0000-template.md`, aggiorna soltanto quella frase per descrivere il template embedded, senza riscrivere il regolamento del progetto.
6. Per supersedere una ADR legacy, non aggiungere frontmatter: aggiorna solo la riga `- Status:` preservando il formato, ad esempio `- Status: superseded by ADR-NNNN`, e crea la nuova ADR nel formato stabilito dal corpus corrente.

La migrazione dell'indice e la creazione della nuova ADR devono essere conservative e reversibili. Non convertire in massa i documenti legacy durante una normale invocazione del comando.

## Verifica finale

Prima di concludere:

- controlla che il frontmatter sia il primo contenuto del file, valido e coerente con `type`, `id`, nome e riga dell'indice;
- verifica che l'ID non collida e che il link dal README sia relativo e funzionante;
- cerca placeholder, sezioni vuote, caratteri che corrompono YAML/Markdown e riferimenti a file inesistenti;
- controlla il diff del solo lavoro svolto e segnala eventuali modifiche preesistenti senza toccarle;
- riporta path, ID, titolo, stato scelto e ogni decisione lasciata `proposed` o non risolta.

## Best practice

- **Una decisione per ADR**: se compare "e inoltre", valuta di separare i record.
- **Scrivi prima la `Decision`**: se non riesci a dichiararla in una o due frasi, la scelta è probabilmente vaga.
- **Il `Context` spiega perché ora**: descrivi il problema e i vincoli, non una cronologia infinita.
- **Le `Consequences` includono i lati negativi**: costi, rischi, migrazione e rollback fanno parte della decisione.
- **Il contenuto approvato è immutabile**: in seguito cambia solo lo stato e i metadati di supersede, mai la motivazione storica.
- **Nel dubbio non inventare**: una ADR `proposed` esplicita è migliore di una decisione attribuita al progetto senza evidenza.
