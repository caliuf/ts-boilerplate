import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { Message } from "./message.tsx";

test("non-error messages are polite status regions", () => {
  render(<Message text="Hello, world!" />);
  expect(screen.getByRole("status")).toHaveTextContent("Hello, world!");
});

test("errors are assertive alerts", () => {
  render(<Message error text="network error" />);
  expect(screen.getByRole("alert")).toHaveTextContent("network error");
});

test("renders an optional title and icon inside the live region", () => {
  render(<Message icon={<span data-testid="icon" />} text="Hello, world!" title="Greeting" />);

  const status = screen.getByRole("status");
  expect(status).toHaveTextContent("Greeting");
  expect(status).toHaveTextContent("Hello, world!");
  expect(screen.getByTestId("icon")).toBeInTheDocument();
});
