import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, test } from "vitest";

import { TextField } from "./text-field.tsx";

function Harness() {
  const [value, setValue] = useState("");
  return <TextField label="Name" onChange={setValue} value={value} />;
}

test("associates label, hint and error with the input", () => {
  render(
    <TextField error="Required" hint="Optional" label="Name" onChange={() => undefined} value="" />,
  );

  const input = screen.getByLabelText("Name");
  expect(input).toHaveAccessibleDescription("Optional Required");
  expect(input).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByRole("alert")).toHaveTextContent("Required");
});

test("updates the controlled value while typing", async () => {
  const user = userEvent.setup();

  render(<Harness />);

  const input = screen.getByLabelText("Name");
  await user.type(input, "Ada");
  expect(input).toHaveValue("Ada");
});

test("can be disabled", () => {
  render(<TextField disabled label="Name" onChange={() => undefined} value="" />);
  expect(screen.getByLabelText("Name")).toBeDisabled();
});
