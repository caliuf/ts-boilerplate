import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useId, useState } from "react";

import { Message } from "../../design-system/patterns/message.tsx";
import { Page } from "../../design-system/patterns/page.tsx";
import { TextField } from "../../design-system/patterns/text-field.tsx";
import { Button } from "../../design-system/primitives/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../design-system/primitives/card.tsx";
import { useHelloWorld } from "./use-hello-world.ts";

/**
 * Greeting feature screen: composes the design system, is keyboard-first
 * (native form submit with Enter) and keeps server state separate from UI state.
 */
export function GreetingPage() {
  const [name, setName] = useState("");
  const { state, run } = useHelloWorld();
  const formId = useId();

  const submit = () => {
    void run(name === "" ? undefined : name);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  return (
    <Page
      title="Hello world"
      description="One use case, four surfaces. Ask the API for a greeting through the same contract used by the CLI, HTTP API and MCP server."
    >
      <Card>
        <CardHeader>
          <CardTitle>Say hello</CardTitle>
          <CardDescription>Leave the name empty to greet the world.</CardDescription>
        </CardHeader>
        <form id={formId} onSubmit={handleSubmit}>
          <CardContent>
            <TextField
              hint="Press Enter or use the button. The API validates the name."
              label="Name"
              onChange={setName}
              placeholder="world"
              value={name}
            />
          </CardContent>
        </form>
        <CardFooter>
          <Button className="px-4" form={formId} loading={state.status === "loading"} type="submit">
            Greet
          </Button>
        </CardFooter>
      </Card>
      {state.status === "success" && (
        <Message
          icon={<CircleCheck aria-hidden="true" />}
          text={state.data.message}
          title="Greeting"
        />
      )}
      {state.status === "loading" && (
        <Message
          icon={<Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
          text="Loading…"
          title="Greeting"
        />
      )}
      {state.status === "error" && (
        <Message
          error
          icon={<CircleAlert aria-hidden="true" />}
          text={state.error.message}
          title="Error"
        />
      )}
    </Page>
  );
}
