---
description: Crea una nuova PDR in docs/product/pdr/ (titolo o intento in $ARGUMENTS)
---

Crea una nuova Product Decision Record per questo repository.

Titolo o intento fornito dall'utente: $ARGUMENTS

Procedura obbligatoria:

1. Leggi `conventions.conf` per la directory delle PDR (`PDR_PATH`) e `docs/product/pdr/README.md` per le regole dell'indice.
2. Determina il prossimo numero progressivo a 4 cifre elencando i file esistenti nella directory PDR (ignora `README.md`): se l'ultimo è `0001`, la nuova PDR è `0002`.
3. Usa `docs/product/pdr/0001-superficie-hello-world.md` come esempio di struttura e frontmatter. Il frontmatter YAML usa `type: PDR`, `id`, `title`, `status: proposed`, `date` (YYYY-MM-DD), `superseded_by`.
4. Se l'utente non ha fornito un titolo o un intento chiaro, chiediglielo prima di procedere (titolo breve, descrittivo, in italiano).
5. Crea `<PDR_PATH>/NNNN-titolo-breve.md` (titolo in kebab-case nel nome file) compilando: Intent 👁️, Design 🎨, Tradeoffs ⚖️, Non-obiettivi, Acceptance criteria, Metriche. Deduci le sezioni dal contesto della conversazione; in caso di dubbio chiedi all'utente.
6. Se questa PDR sostituisce una decisione precedente, valorizza `superseded_by` nel record precedente e dichiara la sostituzione nella nuova.
7. Aggiungi la riga all'indice `docs/product/pdr/README.md`: il docs guard di `just guards` verifica che ogni record sia indicizzato e che l'indice non punti a file mancanti.
8. Ricorda all'utente che la PDR va committata nello stesso commit del codice che applica la decisione.
