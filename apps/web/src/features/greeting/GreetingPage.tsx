import type { FormEvent } from "react";
import { useState } from "react";

import { useTheme } from "../../app/providers/theme-provider.tsx";
import { Message } from "../../design-system/patterns/message.tsx";
import { Page } from "../../design-system/patterns/page.tsx";
import { TextField } from "../../design-system/patterns/text-field.tsx";
import { ThemeToggle } from "../../design-system/patterns/theme-toggle.tsx";
import { Button } from "../../design-system/primitives/button.tsx";
import { useHelloWorld } from "./use-hello-world.ts";

/**
 * Greeting feature screen: composes the design system, is keyboard-first
 * (native form submit with Enter) and keeps server state separate from UI state.
 */
export function GreetingPage() {
  const [name, setName] = useState("");
  const { state, run } = useHelloWorld();
  const { resolvedTheme, setTheme } = useTheme();

  const submit = () => {
    void run(name === "" ? undefined : name);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <Page
      title="project"
      description="A tiny end-to-end example across CLI, API, MCP and UI."
      actions={
        <ThemeToggle
          isDark={resolvedTheme === "dark"}
          onToggle={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        />
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          hint="Optional; defaults to world."
          label="Name"
          onChange={setName}
          placeholder="world"
          value={name}
        />
        <Button className="self-start" loading={state.status === "loading"} type="submit">
          Greet
        </Button>
      </form>
      {state.status === "success" && <Message text={state.data.message} />}
      {state.status === "error" && <Message error text={state.error.message} />}
      {state.status === "loading" && <Message text="Loading…" />}
    </Page>
  );
}
