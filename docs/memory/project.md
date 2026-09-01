# Project Memory

<!-- META(boilerplate): replace the entries below with facts, decisions, and constraints specific to your project. Keep the same categories and the `key :: value` format. -->

## Facts

- env.local_secrets_file :: `.envrc.local` è il posto per segreti e override macchina-specifici, caricato da `.envrc`.
- env.env_example_purpose :: `.env.example` è un template documentativo committato e non viene caricato da nessun file.
- env.env_default_purpose :: `.env.default` è committato, usato come floor di default dai wrapper in `bin/`, e deve restare libero da segreti.
- env.env_purpose :: `.env` è gitignored e contiene variabili locali in formato `KEY=VALUE`, caricate da `.envrc` tramite `dotenv .env`.
- env.envrc_purpose :: `.envrc` è il file di configurazione direnv committato in root che carica `.env.default`, `.env` e `.envrc.local`.
- runtime.authoritative :: Node 24 è il runtime autorevole; Bun 1.3.14 è solo compatibility target, non dipendenza di dominio.
- memory.location :: Kilo Memory è abilitata e salvata in `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/`; il repository memory bank in `docs/memory/` ne è il fallback portatile e versionabile.

## Decisions

- runtime.dual_vs_switch :: Non dual-runtime configurabile Node+Bun e non switch completo ora: tenere Node per esecuzione/tooling e Bun solo come smoke del core; switch solo con spike reale e ADR che supersede ADR-0001.
- memory.repo_bank :: Mantenere un memory bank nel repository (`docs/memory/`) come fallback visibile e portabile della Kilo Memory nativa; vedi ADR-0008.
- github.branch_pr_flow :: Flusso di default: un task = un branch = una PR, merge squash. Push diretto su `main` (bypass owner) solo per urgenze o micro-modifiche su richiesta esplicita. Convenzioni in `docs/development/WORKFLOWS.md` § Branching, PR e worktree.
- github.branch_naming :: Naming branch `<tipo>/<issue>-<slug>` (tipi = conventional commit); il numero issue GitHub è il progressivo univoco, niente contatori manuali nel nome (race condition con agenti paralleli).
- github.review_solo_maintainer :: Con un solo code owner la review obbligatoria del ruleset non è self-approvabile: le PR locali del maintainer si mergiano con bypass owner a CI verde (auditato); le PR degli agenti remoti (GitHub App) vanno in review reale.

## Constraints

- runtime.domain_no_node_builtins :: Domain/application e packages greetings/contracts senza `node:*` né `Bun.*`; I/O dietro adapter (ADR-0002); `just arch` lo verifica.

## Open Questions
