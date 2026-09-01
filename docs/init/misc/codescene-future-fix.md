Se in futuro il threshold dovesse scendere sotto 10 per un qualche motivo, dovremo aggiungere questo capitoletto in AGENTS.md preso e reinterpretato da Tolaria:

```
## CodeScene code health gate (ratchet)

CodeScene is a before/after gate, not only a final score. The project-level ratchet is enforced by `just codescene-ratchet`, which compares the current Hotspot and Average Code Health with the floors recorded in `.codescene-thresholds`. Thresholds only ever go up.

- Before writing code, run `just codescene-ratchet`. If either project score is below its floor, stop and refactor the worst hotspots first; do not start feature work on a below-threshold codebase.
- Before editing an existing code file, capture its current file-level Code Health score. After your edits, re-run the same review and verify the score is higher. A file that starts at `10.0` must remain `10.0`.
- Every new scorable code file must reach CodeScene score `10.0` before commit. If CodeScene reports `null` / "no scorable code", the file must still have zero findings.
- If `just codescene-ratchet` sees improved remote scores, it writes the new floor to `.codescene-thresholds` and stops so you can commit the updated floor.
- If a gate blocks you, improve the code. Do not lower thresholds, extend ignore-lists, add suppressions, or use `--no-verify` to bypass the hook.
```

Attualmente il ratchet c'è ed è enforced, ma a 10 non avrebbe davvero senso (il precommit blocca se il 10 non è raggiunto)

Lo tengo solo per eventuali usi futuri