import { CircleCheck, MessageSquare, TriangleAlert } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../design-system/primitives/empty.tsx";
import { useHelloWorld } from "./use-hello-world.ts";

/**
 * Greeting feature screen: composes the design system, is keyboard-first
 * (native form submit with Enter) and keeps server state separate from UI state.
 */
export function GreetingPage() {
  const [name, setName] = useState("");
  const { state, run } = useHelloWorld();
  const isLoading = state.status === "loading";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(name === "" ? undefined : name);
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
        <form onSubmit={handleSubmit}>
          <CardContent>
            <TextField
              disabled={isLoading}
              hint="Press Enter or use the button. The API validates the name."
              invalid={state.status === "error"}
              label="Name"
              name="name"
              onChange={setName}
              placeholder="world"
              value={name}
            />
          </CardContent>
          <CardFooter>
            <Button loading={isLoading} type="submit">
              {isLoading ? "Loading…" : "Greet"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <section aria-label="Greeting result" className="min-h-24">
        {state.status === "idle" && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No greeting yet</EmptyTitle>
              <EmptyDescription>
                Submit the form to call the API and show its validated response here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {state.status === "success" && (
          <Message
            icon={<CircleCheck aria-hidden="true" />}
            text={state.data.message}
            title="Greeting"
          />
        )}
        {state.status === "error" && (
          <Message
            error
            icon={<TriangleAlert aria-hidden="true" />}
            text={state.error.message}
            title="Request failed"
          />
        )}
      </section>
    </Page>
  );
}
