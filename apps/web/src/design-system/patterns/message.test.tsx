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
