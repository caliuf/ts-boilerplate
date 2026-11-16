import type { ReactNode } from "react";

/**
 * Page layout pattern. Native semantic structure (`main`, `header`, `h1`) lives
 * here so features keep composing the design system (Vademecum CSS §7.3).
 */
export function Page(props: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:py-16"
      id="main-content"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{props.title}</h1>
          {props.description === undefined ? null : (
            <p className="text-sm text-muted-foreground">{props.description}</p>
          )}
        </div>
        {props.actions === undefined ? null : (
          <div className="flex items-center gap-2">{props.actions}</div>
        )}
      </header>
      {props.children}
    </main>
  );
}
