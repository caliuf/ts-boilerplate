> **Errata (verifica 2026-08):** le risposte sotto contengono errori: DeepSource **non** è gratuito per repository privati e Qodana **non** è gratuito per TypeScript (il linter `qodana-js` richiede una licenza a pagamento; solo JVM, Python, .NET e C/C++ hanno edizione Community gratuita). Le raccomandazioni verificate sono nel § 4 *Tooling statico* di `docs/init/Vademecum Typescript.md`.

# Question

vi sono tool gratuiti che fanno quello che fanno CodeScene o Codacy?
# Answer

Sì, esistono diversi tool gratuiti e open source che offrono funzionalità simili a quelle di CodeScene (analisi comportamentale del codice e debito tecnico) e Codacy (analisi statica automatizzata e qualità del codice). [1]

Mentre CodeScene si concentra sull'evoluzione del codice legata al fattore umano (version control analysis), Codacy è un aggregatore di linter e analizzatori statici. Di seguito sono elencate le migliori alternative gratuite divise per categoria.

## Alternative a Codacy (Analisi Statica e Qualità del Codice)

- SonarQube (Community Edition): È il punto di riferimento per l'ispezione continua del codice. La versione Community è gratuita, self-hosted e rileva bug, vulnerabilità e code smell in oltre 15 linguaggi.
- Mega-Linter: Un tool open source formidabile che racchiude oltre 100 linter e analizzatori di sicurezza in un unico pacchetto Docker. Può essere integrato gratuitamente in qualsiasi pipeline di CI/CD (GitHub Actions, GitLab CI, ecc.).
- GitHub Super Linter: Una combinazione di linter pronta all'uso creata da GitHub, utile per standardizzare la qualità del codice direttamente nelle Pull Request senza costi aggiuntivi.

## Alternative a CodeScene (Analisi Comportamentale e Debito Tecnico)

- CodeMaat: Un tool open source a riga di comando sviluppato proprio da Adam Tornhill (il creatore di CodeScene). Analizza i dati dei log di Git per identificare accoppiamenti logici e aree del codice modificate troppo spesso (hotspot).
- Gourse: Strumento di visualizzazione open source che trasforma la storia di Git in un'animazione interattiva. Aiuta a capire visivamente quali parti del codice attirano il maggior numero di modifiche e l'interazione del team.
- GitInspector: Uno strumento di analisi statistica per repository Git che traccia i contributi dei singoli sviluppatori, la timeline delle modifiche e la stabilità del codice nel tempo.

## Tabelle di confronto rapido

|Funzionalità|CodeScene / Codacy|Alternativa Gratuita Consigliata|Tipo di Deployment|
|---|---|---|---|
|Analisi Qualità & Bug|Codacy|SonarQube Community / Mega-Linter|Self-hosted / CI Pipeline|
|Analisi Hotspot & Git|CodeScene|CodeMaat|Riga di comando (CLI)|

## Il consiglio per iniziare

Se cerchi una soluzione simile a Codacy per controllare la qualità del codice ad ogni commit, la combinazione migliore è Mega-Linter integrato in GitHub Actions. Se invece vuoi replicare l'analisi dei "punti caldi" di CodeScene, installa CodeMaat per estrarre i dati comportamentali direttamente dalla cronologia del tuo repository Git.

[1] [https://www.ictsecuritymagazine.com](https://www.ictsecuritymagazine.com/articoli/digital-forensics-costo-zero/)

# Question

Userò principalmente typescript e occasionalmente python.
Preferisco self hosted, ma se vi è una versione cloud gratuita in cui possa scansionare progetti privati mi interessa ugualmente

# Answer

Per TypeScript e Python, la combinazione di soluzioni self-hosted e cloud con piani gratuiti per privati offre ottime opzioni. Entrambi i linguaggi sono supportati nativamente dai principali tool di analisi.

Ecco le migliori soluzioni adatte alle tue preferenze:

## Opzioni Self-Hosted (Consigliate per il massimo controllo)

- SonarQube Community Edition
    
    - Cosa fa: È il re dell'analisi statica. Trova bug, vulnerabilità di sicurezza e debito tecnico.
    - Supporto: Python e TypeScript sono supportati nativamente e inclusi nella versione gratuita.
    - Come si usa: Si avvia facilmente tramite un container Docker ufficiale sul proprio server o PC locale.
    
- Mega-Linter
    
    - Cosa fa: Aggrega i migliori linter esistenti. Per TypeScript usa tool come _ESLint_, mentre per Python usa _Flake8_, _Black_ e _Bandit_.
    - Supporto: Eccellente per entrambi i linguaggi.
    - Come si usa: Gira come container Docker. Puoi eseguirlo localmente sulla tua macchina prima di fare il commit o integrarlo in un server CI privato (es. GitLab CI self-hosted).
    
- CodeMaat
    
    - Cosa fa: Sostituisce la parte "comportamentale" di CodeScene. Essendo basato sulla cronologia Git, è totalmente indipendente dal linguaggio utilizzato (funziona perfettamente sia su TypeScript che su Python).
    - Come si usa: È un file JAR (Java) a riga di comando che analizza i log esportati da Git.
    

---

## Opzioni Cloud Gratuite (Compatibili con Repository Privati)

Se non vuoi gestire l'infrastruttura ma hai bisogno di analizzare progetti privati senza pagare, le opzioni sono più limitate (molti tool cloud offrono il piano gratuito solo per l'open source), ma ci sono due eccezioni fondamentali:

- SonarCloud (tramite coupon/promozioni o integrazioni specifiche)
    
    - _Nota importante_: Di base, SonarCloud è gratuito solo per progetti pubblici. Tuttavia, se utilizzi GitHub, puoi sfruttare la funzionalità nativa di GitHub Code Scanning (basata su CodeQL), che è gratuita per i repository pubblici, ma richiede piani enterprise per i privati.
    
- Qodana (di JetBrains)
    
    - Cosa fa: È la piattaforma di qualità del codice di JetBrains che usa gli stessi motori di analisi di IntelliJ e WebStorm/PyCharm.
    - Supporto: Esiste una versione Community self-hosted (Docker) e una versione Cloud. Il piano cloud gratuito permette di collegare un numero limitato di progetti privati per piccoli team. Rileva alla perfezione problemi in TypeScript e Python.
    
- DeepSource (Piano Free)
    
    - Cosa fa: Un analizzatore statico cloud molto moderno e focalizzato sulla sicurezza e sulle performance.
    - Supporto: Ha "analyzer" specifici e molto approfonditi sia per Python che per TypeScript.
    - Repository Privati: Il loro piano "Free" include l'analisi di repository privati con limitazioni sul numero di membri del team (di solito fino a 3 sviluppatori) e sul numero di analisi mensili.
    

---

## Tabella comparativa per TypeScript & Python

|Strumento|Tipo|Gratuito per Privati?|Focus Principale|
|---|---|---|---|
|SonarQube Community|Self-Hosted (Docker)|Sì (Illimitato)|Qualità, Bug, Sicurezza|
|Mega-Linter|Self-Hosted (Docker/CLI)|Sì (Illimitato)|Linting completo e Standard|
|CodeMaat|Self-Hosted (CLI)|Sì (Illimitato)|Hotspot e Analisi in stile CodeScene|
|DeepSource|Cloud|Sì (Con limiti di team/uso)|Bug, Sicurezza e Performance|

Quale di questi approcci preferisci approfondire? Posso fornirti i comandi Docker per avviare SonarQube localmente, oppure mostrarti come configurare un file di pipeline per DeepSource o Mega-Linter.