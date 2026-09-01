/**
 * `just doctor` — verifies runtimes, tools and configuration.
 * Exit code 1 on hard failures (❌), 0 with warnings (⚠️) otherwise.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

type Check = {
  readonly label: string;
  readonly status: "ok" | "warn" | "fail";
  readonly detail?: string | undefined;
};
const checks: Check[] = [];

const ok = (label: string, detail?: string) => checks.push({ label, status: "ok", detail });
const warn = (label: string, detail?: string) => checks.push({ label, status: "warn", detail });
const fail = (label: string, detail?: string) => checks.push({ label, status: "fail", detail });

function hasBinary(name: string): string | undefined {
  try {
    return execFileSync("bash", ["-c", `command -v ${name}`], { encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
}

function versionOf(command: string): string | undefined {
  try {
    return execFileSync("bash", ["-c", `${command} 2>/dev/null | head -1`], {
      encoding: "utf8",
    }).trim();
  } catch {
    return undefined;
  }
}

// --- Node.js ---------------------------------------------------------------
const expectedNode = readFileSync(".node-version", "utf8").trim();
const actualNode = process.version.replace(/^v/, "");
if (actualNode === expectedNode) {
  ok("node", actualNode);
} else if (actualNode.split(".")[0] === expectedNode.split(".")[0]) {
  warn("node", `${actualNode} (pinned: ${expectedNode})`);
} else {
  fail("node", `${actualNode} does not match pinned ${expectedNode} — run \`mise install\``);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// --- pnpm ------------------------------------------------------------------
const pkgRaw: unknown = JSON.parse(readFileSync("package.json", "utf8"));
const packageManager =
  isRecord(pkgRaw) && typeof pkgRaw["packageManager"] === "string"
    ? pkgRaw["packageManager"]
    : undefined;
const expectedPnpm = packageManager?.split("@")[1];
const pnpmPath = hasBinary("pnpm");
if (!pnpmPath) {
  fail("pnpm", "not found — run `mise install`");
} else {
  const actualPnpm = versionOf("pnpm --version");
  if (expectedPnpm !== undefined && actualPnpm !== expectedPnpm) {
    warn("pnpm", `${actualPnpm} (pinned: ${expectedPnpm})`);
  } else {
    ok("pnpm", actualPnpm);
  }
}

// --- install state ---------------------------------------------------------
if (existsSync("node_modules")) {
  ok("dependencies installed");
} else {
  fail("dependencies installed", "run `just setup`");
}

// --- git hooks ---------------------------------------------------------------
try {
  const hooksPath = execFileSync("git", ["config", "core.hooksPath"], { encoding: "utf8" }).trim();
  if (hooksPath === ".githooks") {
    ok("git hooks", hooksPath);
  } else {
    fail("git hooks", `core.hooksPath is "${hooksPath}" — run \`just setup\``);
  }
} catch {
  fail("git hooks", "core.hooksPath not set — run `just setup`");
}

// --- direnv ------------------------------------------------------------------
const direnvPath = hasBinary("direnv");
if (!direnvPath) {
  fail(
    "direnv",
    "not found — required by bin/ wrappers; run `mise install` or see docs/development/ENVIRONMENT.md",
  );
} else {
  ok("direnv", versionOf("direnv version"));
}

try {
  execFileSync("direnv", ["exec", ".", "true"], { encoding: "utf8", stdio: "pipe" });
  ok(".envrc", "allowed");
} catch {
  warn(".envrc", "blocked — run `direnv allow`");
}

// --- external gate tools -----------------------------------------------------
// These are blocking in CI. Locally a missing tool downgrades its recipe to a
// warning, but do not let that become an habit: install them via mise.
const externalTools = [
  "bun",
  "gitleaks",
  "actionlint",
  "zizmor",
  "lychee",
  "shellcheck",
  "codegraph",
];
for (const tool of externalTools) {
  const path = hasBinary(tool);
  if (path) {
    ok(tool);
  } else {
    warn(tool, "not found — locally its gate is skipped; in CI it is blocking. Run `mise install`");
  }
}

// --- report ------------------------------------------------------------------
const icons = { ok: "✅", warn: "⚠️ ", fail: "❌" } as const;
for (const check of checks) {
  const detail = check.detail === undefined ? "" : ` — ${check.detail}`;
  console.log(`${icons[check.status]} ${check.label}${detail}`);
}
if (checks.some((check) => check.status === "fail")) {
  process.exitCode = 1;
}
