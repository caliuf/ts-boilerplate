import { Alert, AlertDescription } from "../primitives/alert.tsx";

/**
 * Result message pattern over the Alert primitive. Non-error messages are
 * polite live regions; errors are assertive (Vademecum CSS §13.2).
 */
export function Message(props: { readonly text: string; readonly error?: boolean }) {
  return (
    <Alert
      role={props.error === true ? "alert" : "status"}
      variant={props.error === true ? "destructive" : "default"}
    >
      <AlertDescription className={props.error === true ? "text-destructive" : undefined}>
        {props.text}
      </AlertDescription>
    </Alert>
  );
}
