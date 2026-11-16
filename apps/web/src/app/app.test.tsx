import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { App } from "./app.tsx";

test("shows the branded header and toggles the theme", async () => {
  const user = userEvent.setup();

  render(<App />);

  expect(screen.getByText("ts-boilerplate")).toBeInTheDocument();

  const toggle = screen.getByRole("button", { name: "Toggle theme" });
  expect(toggle).toHaveAttribute("aria-pressed", "false");

  await user.click(toggle);

  expect(document.documentElement).toHaveClass("dark");
  expect(localStorage.getItem("project-theme")).toBe("dark");
  expect(toggle).toHaveAttribute("aria-pressed", "true");
});
