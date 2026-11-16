import type { HelloWorldOutput, Result } from "@project/contracts";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";

import { GreetingPage } from "./GreetingPage.tsx";
import { fetchHelloWorld } from "./hello-world-api.ts";

vi.mock("./hello-world-api.ts", () => ({
  fetchHelloWorld: vi.fn<() => Promise<Result<HelloWorldOutput>>>(),
}));

const fetchHelloWorldMock = vi.mocked(fetchHelloWorld);

function renderPage() {
  return render(<GreetingPage />);
}

beforeEach(() => {
  fetchHelloWorldMock.mockReset();
});

test("submits from the keyboard and shows the greeting", async () => {
  fetchHelloWorldMock.mockResolvedValue({ ok: true, value: { message: "Hello, Ada!" } });
  const user = userEvent.setup();

  renderPage();
  await user.type(screen.getByLabelText("Name"), "Ada{Enter}");

  expect(await screen.findByText("Hello, Ada!")).toBeInTheDocument();
  expect(fetchHelloWorldMock).toHaveBeenCalledWith("Ada");
});

test("shows a polite loading message while the request is pending", async () => {
  let resolveRequest: ((value: Result<HelloWorldOutput>) => void) | undefined;
  fetchHelloWorldMock.mockReturnValue(
    new Promise<Result<HelloWorldOutput>>((resolve) => {
      resolveRequest = resolve;
    }),
  );
  const user = userEvent.setup();

  renderPage();
  await user.type(screen.getByLabelText("Name"), "Ada{Enter}");

  expect(await screen.findByRole("status")).toHaveTextContent("Loading…");

  await act(async () => {
    resolveRequest?.({ ok: true, value: { message: "Hello, Ada!" } });
  });

  expect(await screen.findByText("Hello, Ada!")).toBeInTheDocument();
});

test("shows an assertive message on error", async () => {
  fetchHelloWorldMock.mockResolvedValue({
    ok: false,
    error: { code: "INTERNAL", message: "network error" },
  });
  const user = userEvent.setup();

  renderPage();
  await user.type(screen.getByLabelText("Name"), "Ada{Enter}");

  expect(await screen.findByRole("alert")).toHaveTextContent("network error");
});
