# Project Memory

<!-- META(boilerplate): replace the entries below with facts, decisions, and constraints specific to your project. Keep the same categories and the `key :: value` format. -->

## Facts

- env.local_secrets_file :: `.envrc.local` è il posto per segreti e override macchina-specifici, caricato da `.envrc`.
- env.env_example_purpose :: `.env.example` è un template documentativo committato e non viene caricato da nessun file.
- env.env_default_purpose :: `.env.default` è committato, usato come floor di default dai wrapper in `bin/`, e deve restare libero da segreti.
- env.env_purpose :: `.env` è gitignored e contiene variabili locali in formato `KEY=VALUE`, caricate da `.envrc` tramite `dotenv .env`.
- env.envrc_purpose :: `.envrc` è il file di configurazione direnv committato in root che carica `.env.default`, `.env` e `.envrc.local`.
- runtime.authoritative :: Node 26.13.1 è il runtime autorevole (Active LTS dal 2026-10-28, ADR-0010); Bun 1.4.0 è solo compatibility target, non dipendenza di dominio.
- runtime.node26_lts :: Node 26 «Lithium» è Active LTS dal 2026-10-28 (26.13.1, supporto fino al 2029-04-30); Node 24 è passato a Maintenance LTS il 2026-10-20 (supporto fino al 2028-04-30).
- memory.location :: Kilo Memory è abilitata e salvata in `~/.local/share/kilo/memory/ts-boilerplate-0636824f8fd8/`; il repository memory bank in `docs/memory/` ne è il fallback portatile e versionabile.
- frontend.stack :: `apps/web` usa React 19 + Vite 8 con Tailwind CSS 4, shadcn/ui su Base UI, CVA, `cn`, Lucide e token semantici in `apps/web/src/design-system/theme/tokens.css`; decisione in ADR-0009, visual language in PDR-0002.
- frontend.theme :: tema `light | dark | system` applicato prima del primo paint dallo script in `apps/web/index.html`, persistito da `ThemeProvider` in `localStorage` con chiave `project-theme`.

## Decisions

- runtime.dual_vs_switch :: Non dual-runtime configurabile Node+Bun e non switch completo ora: tenere Node per esecuzione/tooling e Bun solo come smoke del core; switch solo con spike reale e ADR che supersede ADR-0010.
- dependabot.ignore_types_node_major :: Le major di `@types/node` restano ignorate da Dependabot e si aggiornano insieme al major runtime nella PR dedicata (ADR-0010), per evitare disallineamenti types/runtime.
- memory.repo_bank :: Mantenere un memory bank nel repository (`docs/memory/`) come fallback visibile e portabile della Kilo Memory nativa; vedi ADR-0008.
- github.branch_pr_flow :: Flusso strutturato di default: un task = un branch = una PR. Merge non squash-only: squash, merge commit e rebase. Niente `required_linear_history`. Nel workspace principale si può lavorare su `main` e lasciare il commit all'utente solo quando non è stata richiesta una PR; non usare il bypass per chiudere PR rosse. Convenzioni in `docs/development/WORKFLOWS.md` § Branching, PR e worktree.
- github.main_ruleset :: Ruleset `Default` su `~DEFAULT_BRANCH`: deletion, non_fast_forward, PR (1 approve, CODEOWNERS, dismiss stale, extra approval unattributed; no last-push-approval, no thread resolution), required checks `quality` `integration-and-coverage` `bun-compatibility` `e2e` e `dependency-review` solo sui repository pubblici, bypass user Always. `delete_branch_on_merge` acceso. CodeQL resta slow lane, non è required check.
- github.branch_naming :: Naming branch `<tipo>/<issue>-<slug>` (tipi = conventional commit); il numero issue GitHub è il progressivo univoco, niente contatori manuali nel nome (race condition con agenti paralleli).
- github.review_solo_maintainer :: Con un solo code owner la review obbligatoria del ruleset non è self-approvabile: le PR locali del maintainer si mergiano con bypass owner a CI verde (auditato); le PR degli agenti remoti (GitHub App) vanno in review reale.
- frontend.design_system :: Il design system vive in `apps/web/src/design-system/` con `primitives/`, `patterns/`, `theme/` e `lib/utils.ts`; i componenti shadcn si aggiungono con il CLI e il codice generato diventa proprietà del progetto (ADR-0009).
- frontend.visual_direction :: La UI dimostrativa replica esattamente `py-boilerplate` (PDR-0003): token OKLCH condivisi in `theme/tokens.css`, nessun webfont (stack sans di sistema), header sticky `AppHeader` con `Sparkles`, shell con skip link `#main` e footer applicativo, card `base-nova` con footer d'azione, empty state e alert per gli esiti; PDR-0002 resta la base di token e accessibilità.

## Constraints

- runtime.domain_no_node_builtins :: Domain/application e packages greetings/contracts senza `node:*` né `Bun.*`; I/O dietro adapter (ADR-0002); `just arch` lo verifica.
- git.moves_with_git_mv :: Spostamenti e rinomine di file sempre con `git mv`, mai delete+ricrea, e quando possibile in un commit dedicato separato dalle modifiche di contenuto, per mantenere l'atomicità dello staging e rename detection, `git log --follow` e `git blame` coerenti. Dettagli in `docs/development/WORKFLOWS.md` § Movimenti e rinomine di file.
- github.gate_files_protected :: CODEOWNERS protegge i file che definiscono gate e toolchain (`justfile`, `.githooks/`, `biome.json`, `.oxlintrc.json`, `.markdownlint-cli2.jsonc`, `cspell.json`, `knip.json`, `dependency-cruiser.config.mjs`, `coverage-thresholds.json`, `vitest.config.ts`, `apps/web/{components.json,vite.config.ts,tsconfig.json}`, `lychee.toml`, `tools/scripts/`, `tools/cspell/`, `.mise.toml`, `.node-version`, `.kilo/{kilo.jsonc,scripts,command}`, `.codescene-thresholds`, `conventions.conf`) e il blueprint congelato `docs/init/`.
- frontend.ds_boundaries :: Le feature non importano `@base-ui/react` direttamente e il design system non importa `app/` o `features/`; entrambe le regole sono gate dependency-cruiser (`just arch`). Le classi Tailwind devono essere statiche e i colori semantici (Vademecum CSS §5.2, §6).

## Open Questions
