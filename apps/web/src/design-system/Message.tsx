/** Result block. Raw text containers live here, not in features. */
export function Message(props: { readonly text: string; readonly error?: boolean }) {
  return (
    <output className="ds-message" data-error={props.error === true ? "true" : "false"}>
      {props.text}
    </output>
  );
}
