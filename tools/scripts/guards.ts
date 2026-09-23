/**
 * `just guards` — report-only fallback procedures (Vademecum §10).
 *
 * Guards NEVER modify code and NEVER auto-fix: they produce a report; the CI
 * scheduled workflow turns findings into issues. Exit code is always 0.
 *
 * Implemented guards:
 * - docs guard (lite): every `just <recipe>` cited in docs exists in the
 *   justfile; every CLI command in the registry appears in the surface map
 *   of docs/PROJECT.md; ADR/PDR indexes point to existing records and list all
 *   records in their directories.
 * - testing guard: the unit+integration suite stays within its time budget.
 * - placeholder guards (performance, localization, telemetry): report their
 *   non-applicability until probes/i18n/analytics exist.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

type Finding = { readonly guard: string; readonly message: string };
const findings: Finding[] = [];
const notes: string[] = [];

// --- helpers -----------------------------------------------------------------

function listMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (entry === "init") {
      continue; // docs/init is the frozen blueprint, not living documentation
    }
    if (statSync(path).isDirectory()) {
      out.push(...listMarkdown(path));
    } else if (entry.endsWith(".md")) {
      out.push(path);
    }
  }
  return out;
}

function justfileRecipes(): Set<string> {
  const text = readFileSync("justfile", "utf8");
  const recipes = new Set<string>();
  for (const line of text.split("\n")) {
    // I parametri possono avere valori con `=`, ad esempio `base="origin/main"`.
    const match = /^([a-z][a-z0-9-]*)(?:\s[^:]*)?:/.exec(line);
    if (match?.[1] !== undefined) {
      recipes.add(match[1]);
    }
  }
  return recipes;
}

// --- docs guard ----------------------------------------------------------------

function collectCitedRecipes(files: readonly string[], recipes: ReadonlySet<string>): Set<string> {
  const cited = new Set<string>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/`just ([a-z][a-z0-9-]*)`/g)) {
      const recipe = match[1];
      if (recipe === undefined) {
        continue;
      }
      cited.add(recipe);
      if (!recipes.has(recipe)) {
        findings.push({
          guard: "docs",
          message: `\`${file}\` cites \`just ${recipe}\`, which does not exist in the justfile`,
        });
      }
    }
  }
  return cited;
}

function checkSurfaceMap(projectPath: string, registry: string): void {
  if (!existsSync(projectPath)) {
    findings.push({ guard: "docs", message: "docs/PROJECT.md is missing" });
    return;
  }
  const project = readFileSync(projectPath, "utf8");
  for (const match of registry.matchAll(/from "\.\/commands\/([a-z0-9-]+)\.ts"/g)) {
    const command = match[1];
    if (command !== undefined && !project.includes(command)) {
      findings.push({
        guard: "docs",
        message: `CLI command \`${command}\` is missing from the surface map in docs/PROJECT.md`,
      });
    }
  }
}

type DecisionIndexConfig = { indexPath: string; directory: string; kind: string };

function collectIndexedRecords(config: DecisionIndexConfig): Set<string> {
  const indexed = new Set(
    Array.from(
      readFileSync(config.indexPath, "utf8").matchAll(/\]\(([^)]+\.md)\)/g),
      (match) => match[1],
    )
      .filter((record): record is string => record !== undefined)
      .filter((record) => record !== "README.md"),
  );
  return indexed;
}

function reportMissingRecords(config: DecisionIndexConfig, indexed: Set<string>): void {
  for (const record of indexed) {
    if (existsSync(join(config.directory, record))) continue;
    findings.push({
      guard: "docs",
      message: `${config.kind} index points to missing record ${record}`,
    });
  }
}

function reportUnindexedRecords(config: DecisionIndexConfig, indexed: Set<string>): void {
  for (const entry of readdirSync(config.directory)) {
    if (!entry.endsWith(".md")) continue;
    if (entry === "README.md") continue;
    if (indexed.has(entry)) continue;
    findings.push({
      guard: "docs",
      message: `${config.kind} record ${entry} is missing from its index`,
    });
  }
}

function checkDecisionIndex(config: DecisionIndexConfig): void {
  if (!existsSync(config.indexPath) || !existsSync(config.directory)) return;
  const indexed = collectIndexedRecords(config);
  reportMissingRecords(config, indexed);
  reportUnindexedRecords(config, indexed);
  /*
   * Keep the index check report-only: record applicability still belongs to
   * the adoption review and cannot be inferred from filenames alone.
   */
}

function docsGuard(): void {
  const recipes = justfileRecipes();
  const files = [...listMarkdown("docs"), "README.md", "AGENTS.md", "CONTRIBUTING.md"].filter(
    (file) => existsSync(file),
  );
  const cited = collectCitedRecipes(files, recipes);
  notes.push(`docs guard: checked ${String(cited.size)} cited recipes against the justfile`);

  // Surface map freshness: every CLI command appears in docs/PROJECT.md.
  // A derived project may remove the CLI entirely, but a partial CLI is an error.
  const registryPath = "apps/cli/src/registry.ts";
  if (existsSync(registryPath)) {
    checkSurfaceMap("docs/PROJECT.md", readFileSync(registryPath, "utf8"));
  } else if (existsSync("apps/cli")) {
    findings.push({ guard: "docs", message: "apps/cli exists but its registry is missing" });
  } else {
    notes.push("docs guard: CLI absent; surface map check skipped");
  }

  checkDecisionIndex({
    indexPath: "docs/architecture/adr/README.md",
    directory: "docs/architecture/adr",
    kind: "ADR",
  });
  checkDecisionIndex({
    indexPath: "docs/product/pdr/README.md",
    directory: "docs/product/pdr",
    kind: "PDR",
  });
}

// --- testing guard -------------------------------------------------------------

const TEST_BUDGET_MS = 10 * 60 * 1000;

async function testingGuard(): Promise<void> {
  const started = Date.now();
  try {
    execFileSync("pnpm", ["exec", "vitest", "run", "--reporter=dot"], {
      stdio: ["ignore", "ignore", "inherit"],
    });
  } catch {
    findings.push({ guard: "testing", message: "the test suite is RED — restore health first" });
    return;
  }
  const elapsed = Date.now() - started;
  notes.push(`testing guard: suite completed in ${String(Math.round(elapsed / 1000))}s`);
  if (elapsed > TEST_BUDGET_MS) {
    findings.push({
      guard: "testing",
      message: `test suite took ${String(Math.round(elapsed / 1000))}s, over the 10 minute budget`,
    });
  }
}

// --- placeholder guards --------------------------------------------------------

function placeholderGuards(): void {
  notes.push("performance guard: not applicable yet (no probes in the codebase)");
  notes.push("localization guard: not applicable yet (no i18n)");
  notes.push("telemetry guard: not applicable yet (no product analytics)");
}

// --- report --------------------------------------------------------------------

docsGuard();
await testingGuard();
placeholderGuards();

console.log("# Guards report\n");
console.log(`Date: ${new Date().toISOString()}\n`);
if (findings.length === 0) {
  console.log("No findings. ✅\n");
} else {
  console.log("## Findings\n");
  for (const finding of findings) {
    console.log(`- ❌ [${finding.guard}] ${finding.message}`);
  }
  console.log("");
}
console.log("## Notes\n");
for (const note of notes) {
  console.log(`- ${note}`);
}
