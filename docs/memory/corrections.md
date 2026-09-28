# Corrections

<!-- META(boilerplate): clear this file when adopting the boilerplate; populate it only with explicit corrections issued during real sessions. -->

Explicit corrections or clarifications issued during sessions. Each entry records the original misunderstanding and the corrected understanding.

- codacy.rejected :: Codacy scartato per il progetto TypeScript: codacy-cli-v2 non supporta il parser TypeScript in locale (52 parsing error su `.ts`/`.tsx`, ESLint plugins non supportati, PMD richiede Java, altri tool zero finding). Vedi sessione 2026-09-01.
- lychee.ignore_paths :: `.lycheeignore` non esclude i path: le sue righe sono regex applicate agli URL (equivalente a `--exclude`). Il file conteneva `docs/init` e `docs/init/**` come se fossero glob di file, quindi l'esclusione non ha mai funzionato e il job `external-links` scansionava il blueprint congelato fallendo sempre. Per escludere file serve `exclude_path` in `lychee.toml` (o `--exclude-path`); per le URL si usa `exclude` (o `--exclude`).
