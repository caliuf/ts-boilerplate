import { useState } from "react";

import { Button } from "../../design-system/Button.tsx";
import { Message } from "../../design-system/Message.tsx";
import { Page } from "../../design-system/Page.tsx";
import { TextInput } from "../../design-system/TextInput.tsx";
import { useHelloWorld } from "./use-hello-world.ts";

/**
 * Greeting feature screen: only design-system components, keyboard-first
 * (Enter in the input submits, the button is focusable).
 */
export function GreetingPage() {
  const [name, setName] = useState("");
  const { state, run } = useHelloWorld();

  const submit = () => {
    void run(name === "" ? undefined : name);
  };

  return (
    <Page title="project">
      <TextInput
        label="Name"
        onChange={setName}
        onSubmit={submit}
        placeholder="world"
        value={name}
      />
      <Button onClick={submit}>Greet</Button>
      {state.status === "success" && <Message text={state.data.message} />}
      {state.status === "error" && <Message error text={state.error.message} />}
      {state.status === "loading" && <Message text="Loading…" />}
    </Page>
  );
}
