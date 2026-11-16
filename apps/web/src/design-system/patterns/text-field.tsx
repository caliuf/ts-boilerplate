import type { ChangeEvent } from "react";
import { useId } from "react";

import { Input } from "../primitives/input.tsx";
import { Label } from "../primitives/label.tsx";

/**
 * Text field pattern: label, input, hint and error are wired with the right
 * accessible relationships. Features never rebuild this wiring themselves.
 */
export function TextField(props: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly name?: string;
  readonly type?: "text" | "email" | "search" | "url";
  readonly hint?: string;
  readonly error?: string;
  readonly disabled?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy = [
    props.hint === undefined ? null : hintId,
    props.error === undefined ? null : errorId,
  ]
    .filter((value): value is string => value !== null)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{props.label}</Label>
      <Input
        id={id}
        aria-describedby={describedBy === "" ? undefined : describedBy}
        aria-invalid={props.error !== undefined}
        disabled={props.disabled === true}
        name={props.name}
        onChange={handleChange}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        value={props.value}
      />
      {props.hint === undefined ? null : (
        <p id={hintId} className="text-xs text-muted-foreground">
          {props.hint}
        </p>
      )}
      {props.error === undefined ? null : (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {props.error}
        </p>
      )}
    </div>
  );
}
