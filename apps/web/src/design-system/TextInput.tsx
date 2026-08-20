import type { ChangeEvent, KeyboardEvent } from "react";

/** Text input of the design system. Raw <input> lives here, not in features. */
export function TextInput(props: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSubmit?: () => void;
  readonly placeholder?: string;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => props.onChange(event.target.value);
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && props.onSubmit) {
      props.onSubmit();
    }
  };
  return (
    <div className="ds-field">
      <label style={{ alignSelf: "center" }}>
        {props.label}
        <input
          aria-label={props.label}
          className="ds-input"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={props.placeholder}
          style={{ marginLeft: "0.5rem" }}
          type="text"
          value={props.value}
        />
      </label>
    </div>
  );
}
