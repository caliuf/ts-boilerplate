import { AppHeader } from "../design-system/patterns/app-header.tsx";
import { ThemeToggle } from "../design-system/patterns/theme-toggle.tsx";
import { GreetingPage } from "../features/greeting/GreetingPage.tsx";
import { ThemeProvider, useTheme } from "./providers/theme-provider.tsx";

const BRAND = "ts-boilerplate";

function Shell() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <AppHeader
        brand={BRAND}
        actions={
          <ThemeToggle isDark={isDark} onToggle={() => setTheme(isDark ? "light" : "dark")} />
        }
      />
      <GreetingPage />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        href="#main-content"
      >
        Skip to content
      </a>
      <Shell />
    </ThemeProvider>
  );
}
