/**
 * `diff-scope` — decides whether the current change is docs-only (fast path,
 * Vademecum §5) or full. Prints exactly "docs-only" or "full" on stdout.
 *
 * Usage:
 *   node tools/scripts/diff-scope.ts --staged  <pattern>...
 *   node tools/scripts/diff-scope.ts --prepush <pattern>...
 *
 * Patterns are regexes (the authoritative list lives in the justfile
 * variable DOCS_ONLY_PATTERNS, protected by CODEOWNERS).
 * Any doubt (no git, no upstream, empty diff) resolves to "full" — the safe path.
 */
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const mode = args.find((arg) => arg === "--staged" || arg === "--prepush");
const patterns = args.filter((arg) => !arg.startsWith("--")).map((pattern) => new RegExp(pattern));

function git(args_: readonly string[]): string | undefined {
  try {
    return execFileSync("git", [...args_], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return undefined;
  }
}

function changedFiles(): string[] | undefined {
  if (mode === "--staged") {
    return git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
      ?.split("\n")
      .filter(Boolean);
  }
  // --prepush: upstream range, then main/master merge-base, then give up (full).
  const upstream = git(["rev-parse", "--abbrev-ref", "@{upstream}"])?.trim();
  if (upstream !== undefined && upstream !== "") {
    const out = git(["diff", "--name-only", `${upstream}...HEAD`, "--diff-filter=ACMR"]);
    if (out !== undefined) {
      return out.split("\n").filter(Boolean);
    }
  }
  for (const base of ["origin/main", "origin/master", "main", "master"]) {
    const mergeBase = git(["merge-base", base, "HEAD"])?.trim();
    if (mergeBase !== undefined && mergeBase !== "") {
      const out = git(["diff", "--name-only", `${mergeBase}...HEAD`, "--diff-filter=ACMR"]);
      if (out !== undefined) {
        return out.split("\n").filter(Boolean);
      }
    }
  }
  return undefined;
}

const files = changedFiles();
if (files === undefined || files.length === 0 || patterns.length === 0) {
  console.log("full");
} else {
  console.log(
    files.every((file) => patterns.some((pattern) => pattern.test(file))) ? "docs-only" : "full",
  );
}
