import type { ReactNode } from "react";

/**
 * Page layout pattern. Native semantic structure (`main`, `header`, `h1`) lives
 * here so features keep composing the design system (Vademecum CSS §7.3).
 * The reading column stays narrow and centered; the app header lives outside.
 */
export function Page(props: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-24"
      id="main-content"
    >
      <header className="mb-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight">{props.title}</h1>
          {props.description === undefined ? null : (
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              {props.description}
            </p>
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
