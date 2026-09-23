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

function parseGitLines(out: string | undefined): string[] | undefined {
  return out?.split("\n").filter(Boolean);
}

function stagedFiles(): string[] | undefined {
  return parseGitLines(git(["diff", "--cached", "--name-only", "--diff-filter=ACMRD"]));
}

function workingTreeFiles(): string[] | undefined {
  const unstaged = parseGitLines(git(["diff", "--name-only", "--diff-filter=ACMRD"]));
  const staged = stagedFiles();
  const untracked = parseGitLines(git(["ls-files", "--others", "--exclude-standard"]));
  if (unstaged === undefined) return undefined;
  if (staged === undefined) return undefined;
  if (untracked === undefined) return undefined;
  return [...new Set([...unstaged, ...staged, ...untracked])];
}

function upstreamFiles(): string[] | undefined {
  const upstream = git(["rev-parse", "--abbrev-ref", "@{upstream}"])?.trim();
  if (!upstream) {
    return undefined;
  }
  return parseGitLines(git(["diff", "--name-only", `${upstream}...HEAD`, "--diff-filter=ACMRD"]));
}

function mergeBaseFiles(): string[] | undefined {
  for (const base of ["origin/main", "origin/master", "main", "master"]) {
    const mergeBase = git(["merge-base", base, "HEAD"])?.trim();
    if (!mergeBase) {
      continue;
    }
    const files = parseGitLines(
      git(["diff", "--name-only", `${mergeBase}...HEAD`, "--diff-filter=ACMRD"]),
    );
    if (files !== undefined) {
      return files;
    }
  }
  return undefined;
}

function changedFiles(): string[] | undefined {
  if (mode === "--staged") {
    return stagedFiles();
  }
  // --prepush: include committed branch changes and the current working tree.
  // Hooks run before a commit/push, so local changes must not be hidden by the
  // upstream range used to find the branch baseline.
  const baseline = upstreamFiles() ?? mergeBaseFiles();
  const local = workingTreeFiles();
  if (baseline === undefined || local === undefined) {
    return undefined;
  }
  return [...new Set([...baseline, ...local])];
}

const files = changedFiles();
if (files === undefined || files.length === 0 || patterns.length === 0) {
  console.log("full");
} else {
  console.log(
    files.every((file) => patterns.some((pattern) => pattern.test(file))) ? "docs-only" : "full",
  );
}
