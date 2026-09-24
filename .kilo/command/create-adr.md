---
description: Crea una nuova ADR in docs/architecture/adr/ (titolo o contesto in $ARGUMENTS)
---

Crea una nuova Architecture Decision Record per questo repository.

Titolo o contesto fornito dall'utente: $ARGUMENTS

Procedura obbligatoria:

1. Leggi `conventions.conf` per la directory delle ADR (`ADR_PATH`) e `docs/architecture/adr/README.md` per le regole dell'indice.
2. Determina il prossimo numero progressivo a 4 cifre elencando i file esistenti nella directory ADR (ignora `README.md`): se l'ultimo è `0008`, la nuova ADR è `0009`.
3. Usa un record recente come esempio di struttura e frontmatter, per esempio `docs/architecture/adr/0001-stack-tecnico.md`. Il frontmatter YAML usa `type: ADR`, `id`, `title`, `status: active`, `date` (YYYY-MM-DD).
4. Se l'utente non ha fornito un titolo chiaro, chiediglielo prima di procedere (titolo breve, descrittivo, in italiano).
5. Crea `<ADR_PATH>/NNNN-titolo-breve.md` (titolo in kebab-case nel nome file) compilando: Context, Decision, Options considered, Consequences, Enforcement, Migration / rollback. Deduci le sezioni dal contesto della conversazione; in caso di dubbio chiedi all'utente.
6. Se questa ADR sostituisce una decisione precedente, aggiorna il campo `status` del record precedente (`superseded by ADR-NNNN`) e dichiara la sostituzione nella nuova.
7. Aggiungi la riga all'indice `docs/architecture/adr/README.md`: il docs guard di `just guards` verifica che ogni record sia indicizzato e che l'indice non punti a file mancanti.
8. Ricorda all'utente che l'ADR va committata nello stesso commit del codice o della configurazione che applica la decisione.
