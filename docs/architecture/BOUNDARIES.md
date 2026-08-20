# Confini e regole di dipendenza

Tutte le regole qui sotto sono **gate** (`just arch`, dependency-cruiser), non convenzioni: principio gate-first del vademecum. File di configurazione: `dependency-cruiser.config.mjs` (protetto da CODEOWNERS).

## Direzione delle dipendenze

```text
domain  ←  application + ports  ←  adapters  ←  apps (composition root)
```

## Regole attive

| Regola | Cosa vieta | Severità |
| --- | --- | --- |
| `no-circular` | dipendenze circolari ovunque | errore |
| `no-deep-imports-from-apps` | `apps/**` che importa internals di `packages/**` (solo `src/index.ts` è pubblico) | errore |
| `no-testkit-in-production` | import di `packages/testkit` fuori dai test | errore |
| `contracts-is-a-leaf` | `contracts` che importa altri package interni | errore |
| `domain-is-pure` | npm/`node:*`/unknown nel dominio | errore |
| `domain-no-cross-layer` | dominio che importa `application` o `ports` | errore |
| `application-no-core-modules` | `node:*` in `application` e `ports` | errore |
| `no-orphans` | moduli irraggiungibili (warning: segnale di codice morto) | warning |

Regole correlate applicate da altri gate:

- niente `console.log` fuori da `tools/scripts` e `apps/web` → Oxlint   `no-console` (`just lint`);
- niente `any`, `@ts-ignore`, non-null assertion fuori dai test → Oxlint   (`just lint`);
- codice morto (file, export, dipendenze) → Knip (`just dead-code`);
- segreti → Gitleaks (`just secrets`).

## Aggiungere una regola

1. Esprimila in `dependency-cruiser.config.mjs` (o Oxlint/Biome se più adatto).
2. Se è una deroga o una decisione nuova: ADR nello stesso commit.
3. Se non è esprimibile come gate, va in `AGENTS.md` come guida — ma è la    seconda scelta, non la prima.
