import { AppHeader } from "../design-system/patterns/app-header.tsx";
import { ThemeToggle } from "../design-system/patterns/theme-toggle.tsx";
import { TooltipProvider } from "../design-system/primitives/tooltip.tsx";
import { GreetingPage } from "../features/greeting/GreetingPage.tsx";
import { ThemeProvider, useTheme } from "./providers/theme-provider.tsx";

const BRAND = "ts-boilerplate";

/** Application shell: landmarks, skip link, chrome and the feature screen. */
function Shell() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:inset-inline-start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:ring-3 focus:ring-ring/50"
        href="#main"
      >
        Skip to content
      </a>
      <AppHeader
        actions={
          <ThemeToggle isDark={isDark} onToggle={() => setTheme(isDark ? "light" : "dark")} />
        }
        brand={BRAND}
      />
      <GreetingPage />
      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>React, Vite, Tailwind CSS, shadcn/ui and Base UI.</p>
          <p>One use case, four surfaces.</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Shell />
      </TooltipProvider>
    </ThemeProvider>
  );
}
