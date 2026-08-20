import { expect, test } from "@playwright/test";

/**
 * The critical user journey of the boilerplate: the web UI shows the
 * hello-world greeting through the real API. Keyboard-first (Vademecum §6).
 */
test("the greeting flow works from the keyboard", async ({ page }) => {
  await page.goto("/");

  const input = page.getByLabel("Name");
  await input.fill("Ada");
  await input.press("Enter");

  await expect(page.getByText("Hello, Ada!")).toBeVisible();
});

test("the button path shows the default greeting", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Greet" }).click();

  await expect(page.getByText("Hello, world!")).toBeVisible();
});
