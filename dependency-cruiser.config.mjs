/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "No circular dependencies (Vademecum §3).",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-deep-imports-from-apps",
      severity: "error",
      comment:
        "Apps may only import the public entry point of a package, never its internals (Vademecum §3, entrypoint gate).",
      from: { path: "^apps/" },
      to: {
        path: "^packages/[^/]+/src/(?!index\\.ts$)",
        pathNot: "^packages/testkit/",
      },
    },
    {
      name: "no-testkit-in-production",
      severity: "error",
      comment: "Production code must not import testkit (Vademecum §3).",
      from: { path: "^(apps|packages)/", pathNot: ["\\.test\\.tsx?$", "^packages/testkit/"] },
      to: { path: "^packages/testkit/" },
    },
    {
      name: "contracts-is-a-leaf",
      severity: "error",
      comment:
        "contracts holds DTOs, schemas and the error taxonomy; it must not import other packages.",
      from: { path: "^packages/contracts/" },
      to: { path: "^packages/(?!contracts)" },
    },
    {
      name: "domain-is-pure",
      severity: "error",
      comment:
        "domain imports nothing external: no npm deps, no node:* core modules, no other layers (Vademecum §3).",
      from: { path: "^packages/[^/]+/src/domain/" },
      to: {
        dependencyTypes: ["npm", "core", "unknown"],
      },
    },
    {
      name: "domain-no-cross-layer",
      severity: "error",
      comment:
        "domain must not import application or ports (dependency rule: domain ← application ← adapters).",
      from: { path: "^packages/[^/]+/src/domain/" },
      to: { path: "^packages/[^/]+/src/(application|ports)/" },
    },
    {
      name: "application-no-core-modules",
      severity: "error",
      comment:
        "No node:* in the application layer: I/O lives behind ports/adapters (Vademecum §2, Bun compatibility).",
      from: { path: "^packages/[^/]+/src/(application|ports)/" },
      to: { dependencyTypes: ["core"] },
    },
    {
      name: "no-orphans",
      severity: "warn",
      comment: "Modules not reachable from any entry point are suspicious.",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$",
          "\\.d\\.ts$",
          "(^|/)(vite|vitest|playwright)\\.config\\.ts$",
          "\\.test\\.tsx?$",
          "\\.spec\\.tsx?$",
          "(^|/)index\\.html$",
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
};
