/**
 * `just coverage-raise` — ratchet (Vademecum §1/§6): raises the coverage
 * thresholds in coverage-thresholds.json to the current measured values.
 * Thresholds may only go UP; this script never lowers them.
 *
 * Run `just coverage` first so coverage/coverage-summary.json is fresh.
 */
import { readFileSync, writeFileSync } from "node:fs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readPct(summary: unknown, key: string): number {
  if (!isRecord(summary) || !isRecord(summary["total"])) {
    throw new Error("coverage-summary.json: unexpected shape (missing total)");
  }
  const section = summary["total"][key];
  if (!isRecord(section) || typeof section["pct"] !== "number") {
    throw new Error(`coverage-summary.json: missing pct for ${key}`);
  }
  return section["pct"];
}

const thresholdsPath = "coverage-thresholds.json";
const summaryPath = "coverage/coverage-summary.json";

const summary: unknown = JSON.parse(readFileSync(summaryPath, "utf8"));
const thresholdsRaw: unknown = JSON.parse(readFileSync(thresholdsPath, "utf8"));
if (!isRecord(thresholdsRaw)) {
  throw new Error("coverage-thresholds.json: unexpected shape");
}
const thresholds: Record<string, number | string> = {};
for (const [key, value] of Object.entries(thresholdsRaw)) {
  if (typeof value === "number" || typeof value === "string") {
    thresholds[key] = value;
  }
}

const keys = ["lines", "statements", "functions", "branches"] as const;
let raised = 0;

for (const key of keys) {
  const current = Math.floor(readPct(summary, key));
  const existing = Number(thresholds[key]);
  if (current > existing) {
    console.log(`✅ ${key}: ${existing} → ${current}`);
    thresholds[key] = current;
    raised += 1;
  } else {
    console.log(`➖ ${key}: ${existing} (current ${String(readPct(summary, key))} — no raise)`);
  }
}

if (raised > 0) {
  writeFileSync(thresholdsPath, `${JSON.stringify(thresholds, null, 2)}\n`);
  console.log(`\n${raised} threshold(s) raised. Commit the updated coverage-thresholds.json.`);
} else {
  console.log("\nNothing to raise.");
}
