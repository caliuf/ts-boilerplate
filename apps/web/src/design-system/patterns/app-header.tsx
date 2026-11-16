import { Snowflake } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Application header pattern: brand on the left, global actions on the right.
 * It is presentational and domain-agnostic; the app passes the brand name and
 * the controls, so the design system never imports app code.
 */
export function AppHeader(props: { readonly brand: string; readonly actions?: ReactNode }) {
  return (
    <header className="border-b border-border/40">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Snowflake aria-hidden="true" className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">{props.brand}</span>
        </div>
        {props.actions === undefined ? null : (
          <div className="flex items-center gap-2">{props.actions}</div>
        )}
      </div>
    </header>
  );
}
