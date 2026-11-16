import { Moon, Sun } from "lucide-react";

import { Button } from "../primitives/button.tsx";

/**
 * Theme toggle pattern. It stays presentational: the app owns the theme state
 * and passes the resolved value, so the design system has no app dependency.
 * The icon shows the active theme (moon = dark, sun = light).
 */
export function ThemeToggle(props: { readonly isDark: boolean; readonly onToggle: () => void }) {
  return (
    <Button
      aria-label="Toggle theme"
      aria-pressed={props.isDark}
      onClick={props.onToggle}
      size="icon"
      variant="ghost"
    >
      {props.isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </Button>
  );
}
