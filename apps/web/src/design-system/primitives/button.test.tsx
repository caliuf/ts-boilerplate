import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import { Button } from "./button.tsx";

test("renders an accessible button and calls onClick", async () => {
  const onClick = vi.fn<() => void>();
  const user = userEvent.setup();

  render(<Button onClick={onClick}>Save</Button>);

  const button = screen.getByRole("button", { name: "Save" });
  expect(button).toHaveAttribute("type", "button");

  await user.click(button);
  expect(onClick).toHaveBeenCalledOnce();
});

test("does not call onClick when disabled", async () => {
  const onClick = vi.fn<() => void>();
  const user = userEvent.setup();

  render(
    <Button disabled onClick={onClick}>
      Save
    </Button>,
  );

  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(onClick).not.toHaveBeenCalled();
});

test("loading shows aria-busy, disables the button and keeps the label", async () => {
  const onClick = vi.fn<() => void>();
  const user = userEvent.setup();

  render(
    <Button loading onClick={onClick}>
      Save
    </Button>,
  );

  const button = screen.getByRole("button", { name: "Save" });
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toBeDisabled();

  await user.click(button);
  expect(onClick).not.toHaveBeenCalled();
});
