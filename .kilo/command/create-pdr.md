---
description: Crea una nuova PDR (Product Decision Record) con frontmatter YAML
---

Crea una nuova Product Decision Record (PDR) per il progetto target nel workspace corrente. Il template e le regole operative sono incorporati qui.

Contesto iniziale fornito dall'utente: `$ARGUMENTS`

Non eseguire `git add`, `git commit`, `git reset`, `git checkout` o comandi equivalenti: questo comando prepara i file e lascia all'utente la gestione del commit. Non sovrascrivere modifiche non correlate già presenti nel working tree.

## Passo 0: Capisci la richiesta

Prima di scrivere file:

1. Identifica la radice Git del workspace/repository (`$REPO_ROOT`) e, separatamente, il progetto target (`$PROJECT_ROOT`). In un repository autonomo coincidono; in un workspace aggregatore il progetto target può essere una directory figlia.
2. Se il workspace contiene più progetti, seleziona quello indicato esplicitamente dall'utente o chiaramente individuato dal contesto di lavoro. In DesignLab il target è la directory del progetto con `README.md` (`Stato progetto` e profilo) e il suo `conventions.conf`; usa il progetto corrente se il contesto operativo lo identifica, altrimenti abbina il nome indicato dall'utente a una directory precisa. Verifica la selezione leggendo il README. Se nessuno o più di uno sono plausibili, chiedi quale progetto usare prima di modificare file; non scegliere la prima `conventions.conf` annidata che trovi.
3. Interpreta `$ARGUMENTS` come contesto e possibile titolo, non come testo da copiare alla cieca né come path da eseguire. Se manca un titolo breve oppure non è chiara la regola di prodotto da decidere, chiedi una precisazione prima di modificare file.
4. Leggi il README del progetto target, la documentazione di prodotto rilevante, le regole documentali del progetto o del workspace che lo governa (in DesignLab, `docs/document-patterns.md` alla radice del workspace) e le PDR già presenti. Cerca una decisione già equivalente: non creare un duplicato; se la regola cambia, usa la procedura di supersede più avanti.
5. Verifica che la richiesta sia una decisione di prodotto. Deve cambiare ciò che l'utente può fare, vede, riceve o si aspetta, oppure una regola di business, policy o dominio osservabile. Una scelta tecnica interna appartiene a una ADR: non descriverla come PDR e indica `/create-adr` come comando corretto.
6. Se una singola modifica contiene una decisione di prodotto e una decisione tecnica indipendenti, non fonderle in un unico documento. Crea il tipo richiesto dal contesto e segnala il record complementare necessario; crea entrambi solo quando il contesto consente di descriverli senza inventare fatti.

Se la richiesta non contiene una decisione di prodotto (per esempio è solo un bug fix senza cambio di comportamento, una correzione testuale, un refactor interno o un pattern già documentato), non creare una PDR e spiega brevemente perché.

## Quando creare una PDR

Crea una PDR quando viene introdotta o modificata una regola osservabile dall'utente o dal business, per esempio:

- comportamento, flusso, stato o risultato visibile all'utente;
- policy di accesso, eleggibilità, limiti, priorità o moderazione;
- semantica di un'entità o termine di dominio;
- regola di pricing, entitlement, consenso, retention o comunicazione;
- criterio di inclusione/esclusione che modifica il perimetro del prodotto;
- comportamento di fallback o gestione di un caso limite che l'utente può osservare.

La dimensione della modifica non determina da sola se serve una PDR: una piccola storia può introdurre una regola durevole, mentre un'epica può non introdurre alcuna decisione nuova.

Se la regola richiesta è ambigua, non inventarla. Quando il contesto è sufficiente per registrare una proposta senza attribuirle approvazione, crea una PDR `proposed` rendendo espliciti i punti aperti; altrimenti chiedi le informazioni mancanti prima di scrivere.

## Passo 1: Risolvi la directory delle PDR

Nei passi seguenti `$PDR_DIR` indica la directory canonica delle PDR relativa a `$PROJECT_ROOT`, che può essere diversa da `$REPO_ROOT` in un workspace aggregatore.

1. In un repository autonomo, `$PROJECT_ROOT` coincide con la radice Git. In un workspace aggregatore, usa il progetto selezionato nel Passo 0 e verifica che la sua directory sia contenuta nella radice del workspace e che il suo `README.md` identifichi quel progetto. Non dedurre un target cercando ricorsivamente una directory di decisioni.
2. Leggi solo `$PROJECT_ROOT/conventions.conf`, se esiste, come testo dati. Cerca una sola assegnazione a `PDR_PATH`, accettando il normale spazio attorno a `=` e valori racchiusi tra apici singoli o doppi. Non eseguire `source conventions.conf`.
3. Interpreta `PDR_PATH` come relativo alla directory che contiene quel `conventions.conf` (normalmente `$PROJECT_ROOT`), non alla radice Git esterna. Il valore deve essere non vuoto, senza slash iniziale, senza componenti `.` o `..` e senza caratteri di controllo. Rifiuta placeholder letterali come `<project-dir>`: la directory del file è già la base del path.
4. Se `PDR_PATH` è duplicato con valori diversi o non è valido, fermati e chiedi di correggere la convenzione; non scegliere un valore arbitrario. Se è presente, usalo per non creare un secondo corpus parallelo.
5. Se il target è un progetto annidato in un workspace aggregatore e non ha un proprio `conventions.conf`, fermati e chiedi di aggiungere la configurazione del progetto. Se il file esiste ma manca `PDR_PATH`, fermati e chiedi di aggiungerla. Non usare la convenzione del contenitore né il fallback globale. Se invece `$PROJECT_ROOT` coincide con `$REPO_ROOT` e `PDR_PATH` non è presente, cerca una directory PDR già usata chiaramente dal README o dal corpus; solo in assenza di entrambe usa il fallback `docs/pdr`, senza registrarlo automaticamente nel file di configurazione.
6. Se esistono più directory candidate e non è possibile determinare quale sia quella attiva, fermati e chiedi quale usare.
7. Risolvi il path a partire da `$PROJECT_ROOT` e verifica che la directory canonica resti dentro quel progetto. Rifiuta una directory che sia un file, una symlink che esca da `$PROJECT_ROOT` o un path che diventi esterno dopo la risoluzione; crea solo directory figlie valide del progetto.

In DesignLab, il `conventions.conf` di ogni progetto contiene entrambi i path (`ADR_PATH="decisions/adr"` e `PDR_PATH="decisions/pdr"`). Poiché il file si trova nella directory del progetto, non serve un placeholder `<project-dir>` nel valore. Il boilerplate resta invariato: lì `$PROJECT_ROOT` è la radice del repository e il suo `conventions.conf` mantiene i path `docs/...`. Nell'handoff il registro completo resta in DesignLab: nel pacchetto entrano le decisioni `active` applicabili, compattate e rinumerate secondo il registro di destinazione, più, solo se non ridondanti e utili a non ripetere errori, i record storici; mai i `proposed`.

Se `$PDR_DIR` non esiste, crealo prima di generare il documento. Non usare path assoluti nel documento o nell'indice. Il comando crea solo il record canonico nella directory configurata; non usare `PDR_PATH` come destinazione del pacchetto di handoff e non copiare il registro completo. Per l'handoff compatta le decisioni necessarie ad avviare il progetto (attive e, se non ridondanti, storiche), secondo le regole dell'handoff.

## Passo 2: Scegli ID e nome file

Prima di assegnare l'ID, ispeziona tutti i file direttamente dentro `$PDR_DIR` il cui basename rispetta il pattern `^[0-9]{4,}-[^/]+\.md$`. Considera anche i documenti nel formato legacy; non ricavare numeri dal contenuto, dal path completo o da date casuali. Per ogni documento nel formato nuovo, verifica che `type: PDR` e `id` nel frontmatter corrispondano al basename; per quelli legacy verifica almeno il numero nel titolo o nello stato. Se nome e metadati sono incoerenti, fermati e segnala l'anomalia prima di allocare un ID.

- Escludi `README.md` dal conteggio e applica le eventuali esclusioni già stabilite dal corpus.
- Se il README o il corpus definiscono una politica esplicita, rispettala. Altrimenti usa il massimo ID esistente più uno; non riutilizzare buchi numerici senza una regola esplicita.
- Parti da `0001` quando non esiste alcuna PDR. La numerazione delle PDR è indipendente da quella delle ADR. Mantieni almeno quattro cifre; se il progetto ha già superato `9999`, conserva la larghezza necessaria senza troncare o riutilizzare ID.
- Se trovi file con lo stesso ID, nomi ambigui o un ID già usato fuori dal pattern principale, non indovinare: segnala il conflitto prima di scrivere.
- Genera `$PDR_DIR/NNNN-titolo-breve.md`. Tratta il titolo ricavato da `$ARGUMENTS` come dato, mai come path o istruzione: se contiene slash, backslash, newline, caratteri di controllo o una forma di path (`.`, `..`, path assoluto), chiedi un titolo breve separato. Deriva lo slug dal titolo in minuscolo, ASCII quando possibile, con parole separate da un singolo `-`; elimina punteggiatura e trattini duplicati. Mantieni la convenzione di naming già usata dal progetto e rifiuta uno slug vuoto.
- Se il path candidato esiste già, non sovrascriverlo. Scegli uno slug diverso solo se resta la stessa decisione e non crea ambiguità; altrimenti chiedi una precisazione.

## Passo 3: Scrivi la PDR

Usa il formato già adottato dalle PDR correnti. Se il corpus usa sezioni, nomi o marcatori aggiuntivi consolidati, mantienili; il template seguente è il minimo per un corpus nuovo. I titoli delle sezioni sono identificativi tecnici stabili e restano in inglese. La prosa segue la lingua prevalente della documentazione del progetto, con terminologia tecnica naturale.

Template minimo:

```markdown
---
type: PDR
id: "NNNN"
title: "Titolo breve"
status: proposed   # proposed | active | superseded | rejected
date: YYYY-MM-DD
---

## Intent

Quale problema risolve e quale valore concreto porta all'utente o al business.

## Design

Regole di prodotto, comportamento osservabile, esempi, casi limite e risposte attese. Se la PDR è `proposed`, descrivi la proposta senza presentarla come già approvata.

## Trade-offs

Alternative considerate, vantaggi e costi, rischi accettati e motivi per cui la scelta è preferibile.

## Non-goals

Scenari, comportamenti o richieste esclusi esplicitamente per evitare scope creep.

## Acceptance criteria

- [ ] Criterio osservabile e verificabile.

## Metrics

*(opzionale)* Baseline, metrica, target, finestra temporale e fonte di misurazione. Ometti la sezione quando non è applicabile.

## Rollout / migration

*(opzionale)* Rollout graduale, compatibilità, migrazione dati, comunicazione o rollback quando la decisione lo richiede.
```

Regole di compilazione:

- Sostituisci ogni placeholder: non lasciare `NNNN`, `YYYY-MM-DD`, testo d'esempio o checkbox generiche senza un criterio concreto.
- Usa la data odierna nel formato `YYYY-MM-DD`. Mantieni `id` come stringa quotata per non perdere gli zeri iniziali, serializza il titolo con escaping YAML corretto e assicurati che il frontmatter sia valido. Se il titolo contiene `|`, `[`, `]`, `#`, backslash, virgolette o newline, non inserirlo alla cieca nell'indice: fai escaping Markdown oppure chiedi un titolo più semplice.
- Usa `status: proposed` quando la regola è da discutere o approvare. Usa `status: active` solo quando la conversazione o il progetto mostra che la regola è stata approvata ed è quella corrente. Non trasformare una proposta in una decisione inventando consenso.
- Se il pattern del progetto richiede dati di approvazione o altre sezioni/metadati, compilali solo quando l'approvazione è esplicita e i dati sono noti; non inventare approvatore, data o vincoli mancanti.
- Nel formato nuovo gli stati supportati sono `proposed`, `active`, `superseded` e `rejected`. Usa `rejected` solo quando la proposta è stata esplicitamente scartata; non attribuire approvazioni o rifiuti senza evidenza. Se il corpus usa una tassonomia diversa, seguila e documenta la transizione nello stesso stile.
- `Intent` deve spiegare il problema e il valore, non solo elencare una feature.
- `Design` deve esprimere regole e risultati osservabili, non un piano di implementazione tecnico. Esempi e casi limite devono rendere la regola non ambigua.
- `Non-goals` è obbligatorio: se non ci sono esclusioni evidenti, dichiarale comunque in modo concreto.
- Ogni acceptance criterion deve poter diventare un test o un controllo manuale oggettivo e deve specificare il comportamento atteso.
- Inserisci metriche solo quando esiste un modo realistico per misurare l'esito; non inventare target o baseline. Aggiorna il glossario del progetto (per esempio `requirements/02-glossary.md`, `docs/product/GLOSSARY.md` o il path elencato dall'indice) solo se esiste già e la PDR introduce o ridefinisce davvero un termine o un'astrazione di dominio: il glossario è una vista derivata e non normativa, con una fonte per ogni termine, e non va creato automaticamente se il progetto non ne ha uno.
- Se il progetto ha già un proprio vocabolario o titoli di sezione, preferisci la coerenza del corpus senza cambiare retroattivamente i documenti esistenti.

## Passo 4: Aggiorna l'indice

Il frontmatter della PDR è la fonte di verità per ID, titolo e stato. Il README della directory è un indice di navigazione e deve restare sincronizzato; non duplicare la tabella in README generali o overview.

1. Se `$PDR_DIR/README.md` non esiste, crealo con un titolo, una breve descrizione e una tabella minima. Adatta la lingua del testo e delle intestazioni alla lingua del corpus; lo scheletro seguente è un esempio, non testo da copiare quando il progetto usa un'altra lingua:

   ```markdown
   # Product Decision Records (PDR)

   Decisioni di prodotto del progetto, create con `/create-pdr`.

   | PDR | Titolo | Stato |
   | --- | ------ | ----- |
   ```

2. Se il README esiste, preserva titolo, regole e testo utile. Non sostituire l'intero file con lo scheletro e non cancellare istruzioni del progetto. Se manca una tabella, aggiungine una in una posizione leggibile; se esiste già, usa le sue colonne e il suo stile.
3. Aggiungi o aggiorna una sola riga per la nuova PDR, usando il path relativo al README, il titolo reale e lo stesso stato del frontmatter:

   ```markdown
   | [NNNN](NNNN-titolo-breve.md) | Titolo reale | proposed |
   ```

4. Fai un upsert idempotente: non aggiungere una seconda riga per lo stesso ID o path. Se trovi duplicati, file mancanti o righe senza file corrispondente, non cancellare dati per riparare automaticamente; segnala l'anomalia e aggiorna solo la riga necessaria quando il caso è non ambiguo. Verifica che il link punti al file appena creato, che il titolo non rompa la tabella Markdown e che lo stato coincida col frontmatter. Non usare il README come autorizzazione per cambiare lo stato del documento senza aggiornare anche il frontmatter.
5. Se `$PROJECT_ROOT` è annidato dentro `$REPO_ROOT`, aggiorna anche la mappa dei documenti o l'ordine di lettura nel README del progetto per includere `$PDR_DIR/README.md`, se non è già presente. Segui la struttura esistente, non duplicare la tabella delle decisioni e non riscrivere il README; se non esiste una sezione di mappa chiara, segnala il collegamento mancante senza ristrutturare il documento.

## Commit e riepilogo

Non creare commit automaticamente. Quando la decisione accompagna un'implementazione, includi PDR, indice del registro, eventuale mappa del README di progetto e aggiornamenti di metadati legacy nello stesso change set della feature; non creare un commit separato solo per la documentazione senza una richiesta esplicita. Se sono stati modificati anche `conventions.conf`, un glossario o altri file di progetto, elencali esplicitamente nel riepilogo e nel piano di commit.

## Sostituire una PDR esistente

Usa il supersede solo quando una nuova regola di prodotto sostituisce davvero una regola precedente. Correggere un refuso o aggiungere un dettaglio non giustifica la riscrittura del contenuto di una PDR già adottata.

1. Individua la PDR precedente tramite ID e verifica che sia quella corretta, che abbia `type: PDR`, sia `active` e non sia già `superseded` o `rejected`. Non modificare il suo corpo, la data originale o i link già presenti; rifiuta auto-superseding e cicli.
2. Prepara e valida prima la nuova PDR con un nuovo ID. Nella sezione `Intent` spiega perché la regola precedente non è più sufficiente e aggiungi un link relativo alla vecchia PDR. Se il corpus lo usa, puoi aggiungere nel frontmatter della nuova PDR `supersedes: "000N"`; non introdurre questo campo se il progetto ha uno schema diverso. Ricontrolla l'assenza di collisioni immediatamente prima della scrittura.
3. Se la nuova PDR è `proposed`, lascia la precedente nello stato attuale: una proposta non ha ancora sostituito una regola attiva.
4. Quando la nuova PDR è `active`, aggiorna nella vecchia PDR solo i metadati di stato, aggiungendo `superseded_by: "NNNN"` e impostando `status: superseded`. Se il pattern del progetto richiede una data di supersede, registrala nel campo previsto senza alterare la data originale della decisione:

   ```yaml
   ---
   type: PDR
   id: "000N"
   title: "Titolo della vecchia decisione"
   status: superseded
   superseded_by: "NNNN"
   date: YYYY-MM-DD
   ---
   ```

5. Dopo avere validato file e righe dell'indice, aggiorna i metadati della vecchia PDR e poi fai l'upsert delle righe del README. Se una precondizione fallisce, non modificare la vecchia PDR: lascia il suo stato attuale e riporta il problema. Le righe finali devono riflettere i rispettivi frontmatter.

Non marcare la vecchia PDR come `superseded` prima di avere una nuova PDR valida. Se il progetto usa una procedura diversa per sostituire proposte, seguila senza inventare nuovi status.

## Coesistenza con un formato legacy

Se esistono PDR senza frontmatter, con un template o uno schema precedente, trattale come documenti legacy:

1. Non riscrivere i corpi delle vecchie PDR e non aggiungere frontmatter retroattivamente solo per uniformarle. Restano nel formato in cui sono state approvate.
2. Continua la numerazione considerando gli ID dei file legacy e applica le esclusioni definite dal corpus.
3. Non cancellare o spostare template, README o documenti legacy automaticamente. La presenza di un nuovo template embedded non autorizza una pulizia distruttiva.
4. Se il README contiene solo regole legacy, preservale e aggiungi una tabella indice senza sostituire il resto. Retrocompila le righe solo quando ID e stato sono leggibili con certezza, includendo `rejected` solo se il formato legacy lo dichiara esplicitamente; non inventare lo stato di un documento ambiguo.
5. Per supersedere una PDR legacy, aggiorna solo il suo campo di stato nel formato originale, se esiste, e crea la nuova PDR nel formato stabilito dal corpus corrente.

La migrazione dell'indice e la creazione della nuova PDR devono essere conservative e reversibili. Non convertire in massa i documenti legacy durante una normale invocazione del comando.

## Verifica finale

Prima di concludere:

- controlla che il frontmatter sia il primo contenuto del file, valido e coerente con `type`, `id`, nome e riga dell'indice;
- verifica che l'ID non collida e che il link dal README sia relativo e funzionante;
- cerca placeholder, checkbox generiche, sezioni vuote, caratteri che corrompono YAML/Markdown e riferimenti a file inesistenti;
- controlla il diff del solo lavoro svolto e segnala eventuali modifiche preesistenti senza toccarle;
- riporta path, ID, titolo, stato scelto e ogni decisione lasciata `proposed` o non risolta.

## Best practice

- **Una decisione per PDR**: se compare "e inoltre", valuta di separare i record.
- **L'`Intent` viene prima della feature**: se non sai quale valore ottiene l'utente, la PDR è probabilmente prematura.
- **I `Non-goals` limitano lo scope**: una regola senza esclusioni esplicite genera interpretazioni divergenti.
- **Acceptance criteria verificabili**: devono poter diventare test o controlli manuali oggettivi.
- **Il contenuto approvato è immutabile**: in seguito cambia solo lo stato e i metadati di supersede, mai la motivazione storica.
- **Nel dubbio non inventare**: una PDR `proposed` esplicita è migliore di una regola attribuita al prodotto senza evidenza.
