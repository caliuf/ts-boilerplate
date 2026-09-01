# Strategia di testing

La "coppa": pochi E2E, moltissimi integration, pochi unit, ampia base di static checks.

## TDD come ciclo di default

Red → green → refactor. **Un test mai visto fallire è sospetto**: può essere tautologico o scollegato dal codice. Per un bug fix, il primo passo è un regression test che fallisce.

## Qualità dei test (Kent Beck, test desiderata)

Ogni test è: isolato, deterministico, veloce, comportamentale (comportamento osservabile, non struttura interna), specifico (un motivo di fallimento), leggibile.

## Dove mettere i test

| Tipo | Dove | Recipe |
| --- | --- | --- |
| Unit (pochi, specialistici) | colocati: `<file>.test.ts` | `just test-unit` |
| Integration (la parte principale) | `tests/integration/` | `just test-integration` |
| E2E (pochi, alto valore) | `tests/e2e/` | `just test-e2e` |
| Live (servizi reali/LLM) | `tests/live/` (quando esistono) | `just test-live` |

- Integration: casi d'uso attraverso l'API pubblica, con adapter reali; mock solo ai confini esterni (qui: nessuno — il `Logger` ha un adapter in-memory in `testkit`). La suite `cli-contract.test.ts` itera il registry e verifica `--help`, `--json`, exit code e separazione degli stream per OGNI comando: i comandi nuovi la ereditano gratis.
- UI: non mockare la UI; renderizzare flussi reali, interazioni da tastiera, HTTP al più finto al confine (MSW/fake server).
- E2E: journey critici; Playwright conserva trace/screenshot solo sui fallimenti.

## Coverage: guardrail a cricchetto

- Soglie versionate in `coverage-thresholds.json` (protetto da CODEOWNERS).
- Possono solo **salire**: `just coverage-raise` le allinea al valore corrente dopo un miglioramento. Abbassarle è aggiramento del gate.
- Esclusioni documentate in `vitest.config.ts` (composition root: coperti da test a subprocess; web: coperto da E2E).
- Niente test senza valore per coprire una riga.

## Regole per feature e bug fix

- Feature: happy path, errori previsti, boundary case, permessi, retry/idempotenza dove rilevanti.
- Bug fix: riproduci con test fallente → fix → verifica il caso originale e quelli adiacenti. Zero-bugs policy: i bug hanno priorità sulle feature.

## Prompt di esempio

```text
Aggiungi il caso d'uso <x> seguendo TDD: prima scrivi il test di integration
in tests/integration/ e guardalo fallire, poi implementa. Esporlo su CLI come
`project <gruppo> <verbo>` seguendo apps/cli/src/commands/hello-world.ts.
Chiudi con `just prepush` verde e riporta l'output verbatim.
```
