import type { ChangeEvent } from "react";
import { useId } from "react";

import { cn } from "../lib/utils.ts";
import { Input } from "../primitives/input.tsx";
import { Label } from "../primitives/label.tsx";

/**
 * Text field pattern: label, input, hint and error are wired with the right
 * accessible relationships. Features never rebuild this wiring themselves.
 * `invalid` marks the field as failed without rendering an extra message,
 * which is how a use case shows the server-side error elsewhere.
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
  readonly invalid?: boolean;
  readonly disabled?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const isInvalid = props.invalid === true || props.error !== undefined;

  const describedBy = [
    props.hint === undefined ? null : hintId,
    props.error === undefined ? null : errorId,
  ]
    .filter((value): value is string => value !== null)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value);

  return (
    <div className="flex flex-col gap-2">
      <Label className={cn("leading-snug", isInvalid && "text-destructive")} htmlFor={id}>
        {props.label}
      </Label>
      <Input
        id={id}
        aria-describedby={describedBy === "" ? undefined : describedBy}
        aria-invalid={isInvalid}
        disabled={props.disabled === true}
        name={props.name}
        onChange={handleChange}
        placeholder={props.placeholder}
        type={props.type ?? "text"}
        value={props.value}
      />
      {props.hint === undefined ? null : (
        <p id={hintId} className="text-sm leading-normal text-muted-foreground">
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
