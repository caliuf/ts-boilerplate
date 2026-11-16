import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Application header pattern: sticky brand bar on a centered container, with
 * global actions on the right. Presentational and domain-agnostic: the app
 * passes the brand name and the controls.
 */
export function AppHeader(props: { readonly brand: string; readonly actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-primary" />
          <span className="font-heading truncate text-sm font-semibold">{props.brand}</span>
        </div>
        {props.actions === undefined ? null : (
          <div className="flex items-center gap-2">{props.actions}</div>
        )}
      </div>
    </header>
  );
}
