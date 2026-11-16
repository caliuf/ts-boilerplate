import { GreetingPage } from "../features/greeting/GreetingPage.tsx";
import { ThemeProvider } from "./providers/theme-provider.tsx";

export function App() {
  return (
    <ThemeProvider>
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
        href="#main-content"
      >
        Skip to content
      </a>
      <GreetingPage />
    </ThemeProvider>
  );
}
