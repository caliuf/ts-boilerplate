/**
 * `just guards` — report-only fallback procedures (Vademecum §10).
 *
 * Guards NEVER modify code and NEVER auto-fix: they produce a report; the CI
 * scheduled workflow turns findings into issues. Exit code is always 0.
 *
 * Implemented guards:
 * - docs guard (lite): every `just <recipe>` cited in docs exists in the
 *   justfile; every CLI command in the registry appears in the surface map
 *   of docs/PROJECT.md.
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
    const match = /^([a-z][a-z0-9-]*)(?:\s[^:=]*)?:/.exec(line);
    if (match?.[1] !== undefined) {
      recipes.add(match[1]);
    }
  }
  return recipes;
}

// --- docs guard ----------------------------------------------------------------

function docsGuard(): void {
  const recipes = justfileRecipes();
  const files = [...listMarkdown("docs"), "README.md", "AGENTS.md", "CONTRIBUTING.md"].filter(
    (file) => existsSync(file),
  );
  const cited = new Set<string>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/`just ([a-z][a-z0-9-]*)`/g)) {
      if (match[1] !== undefined) {
        cited.add(match[1]);
      }
      if (match[1] !== undefined && !recipes.has(match[1])) {
        findings.push({
          guard: "docs",
          message: `\`${file}\` cites \`just ${match[1]}\`, which does not exist in the justfile`,
        });
      }
    }
  }
  notes.push(`docs guard: checked ${String(cited.size)} cited recipes against the justfile`);

  // Surface map freshness: every CLI command appears in docs/PROJECT.md.
  const projectPath = "docs/PROJECT.md";
  if (!existsSync(projectPath)) {
    findings.push({ guard: "docs", message: "docs/PROJECT.md is missing" });
    return;
  }
  const project = readFileSync(projectPath, "utf8");
  const registry = readFileSync("apps/cli/src/registry.ts", "utf8");
  for (const match of registry.matchAll(/from "\.\/commands\/([a-z0-9-]+)\.ts"/g)) {
    if (match[1] !== undefined && !project.includes(match[1])) {
      findings.push({
        guard: "docs",
        message: `CLI command \`${match[1]}\` is missing from the surface map in docs/PROJECT.md`,
      });
    }
  }
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
