# Question

Leggendo questa sessione `.kilo/sessions/20260831-173559-bin-wrappers-direnv.md` e il relativo plan, mi spieghi perché esiste un file .envrc e magari anche un file .env? Sono la stessa cosa? Quale devo usare?

# Answer

No, non sono la stessa cosa. Ecco la distinzione, come emerge dal piano e dalla documentazione del repo.

## `.envrc`

- È un **file di direnv**.
- Committato alla root del repo (`.envrc`, riga 4 del piano).
- Non contiene direttamente le variabili d'ambiente in formato `KEY=VALUE`, ma istruzioni per direnv su quali file caricare.
- Contenuto attuale:
    
    ```
    # shellcheck shell=bash
    if [ -f .env.default ]; then dotenv .env.default; fi
    if [ -f .env ]; then dotenv .env; fi
    if [ -f .envrc.local ]; then source .envrc.local; fi
    ```
    
- Viene caricato automaticamente quando entri nella directory del repo (se il tuo shell ha l'hook direnv e il file è `direnv allow`-ato).
- È il meccanismo che rende effettivo il `.env` del repo: prima di direnv, il repo aveva `.env.example` e `.env` gitignored, ma nessuno caricava `.env` (nota nel piano §3).

## `.env`

- È il file **locale** con le tue variabili d'ambiente in formato `KEY=VALUE`.
- Gitignored, quindi non committato.
- Caricato dal `.envrc` del repo tramite `dotenv .env`.
- Serve per override locali dentro il repo.

## `.env.default`

- File committato, **sourced dai wrapper di `bin/`** come floor di default.
- Attualmente contiene solo commenti (riga 98 del piano).
- Deve restare libero da segreti.

## `.env.example`

- Template documentativo, committato.
- **Non caricato** da nessuno.
- Serve come riferimento per creare il tuo `.env` locale.

## Quale devi usare?

|Cosa vuoi fare|File da usare|
|---|---|
|Aggiungere variabili locali al repo (porta API, log level, nome di default)|`.env`|
|Definire un default sicuro che vale ovunque, anche fuori dal repo|`.env.default`|
|Segreti o override macchina-specifici|`.envrc.local`|
|Documentare quali variabili esistono|`.env.example`|
|Modificare il caricamento automatico in base alla directory|`.envrc`|

In sintesi: **`.envrc` è lo "switch" di direnv, `.env` è il tuo file locale di variabili.** Non sono intercambiabili, ma lavorano insieme: `.envrc` dice a direnv di caricare `.env.default` e `.env`.