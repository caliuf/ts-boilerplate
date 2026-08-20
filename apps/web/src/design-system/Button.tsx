import type { ReactNode } from "react";

/** Primary action button. Raw <button> lives here, not in features. */
export function Button(props: { readonly onClick: () => void; readonly children: ReactNode }) {
  return (
    <button className="ds-button" onClick={props.onClick} type="button">
      {props.children}
    </button>
  );
}
