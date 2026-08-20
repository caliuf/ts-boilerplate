import type { ReactNode } from "react";

/** Page layout shell. Raw <main> lives here, not in features. */
export function Page(props: { readonly title: string; readonly children: ReactNode }) {
  return (
    <main className="ds-page">
      <h1>{props.title}</h1>
      {props.children}
    </main>
  );
}
