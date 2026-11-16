import { Moon, Sun } from "lucide-react";

import { Button } from "../primitives/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../primitives/tooltip.tsx";

/**
 * Theme toggle pattern. Presentational: the app owns the theme state and
 * passes the resolved value, so the design system has no app dependency.
 * The icon shows the active theme (moon = dark, sun = light) and the tooltip
 * names the action.
 */
export function ThemeToggle(props: { readonly isDark: boolean; readonly onToggle: () => void }) {
  const label = props.isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={props.onToggle}
        render={<Button aria-label={label} size="icon" variant="ghost" />}
      >
        {props.isDark ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
      </TooltipTrigger>
      <TooltipContent>{props.isDark ? "Light theme" : "Dark theme"}</TooltipContent>
    </Tooltip>
  );
}
