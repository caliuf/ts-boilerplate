import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "../primitives/alert.tsx";

/**
 * Result message pattern over the Alert primitive. Non-error messages are
 * polite live regions; errors are assertive (Vademecum CSS §13.2). Title and
 * icon are optional so the pattern stays useful for one-line feedback too.
 * Styling is the Alert variant default: `bg-card` with a hairline border.
 */
export function Message(props: {
  readonly text: string;
  readonly title?: string;
  readonly error?: boolean;
  readonly icon?: ReactNode;
}) {
  return (
    <Alert
      role={props.error === true ? "alert" : "status"}
      variant={props.error === true ? "destructive" : "default"}
    >
      {props.icon}
      {props.title === undefined ? null : <AlertTitle>{props.title}</AlertTitle>}
      <AlertDescription>{props.text}</AlertDescription>
    </Alert>
  );
}
