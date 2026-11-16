import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "@playwright/test";
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

test("the theme toggle switches to dark mode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Toggle theme" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
});

const themes = ["light", "dark"] as const;

for (const theme of themes) {
  test(`an invalid name surfaces the API validation error in the ${theme} theme`, async ({
    page,
  }) => {
    await page.goto("/");
    if (theme === "dark") {
      await page.getByRole("button", { name: "Toggle theme" }).click();
    }

    await page.getByLabel("Name").fill("x".repeat(101));
    await page.getByRole("button", { name: "Greet" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });
}

test("the layout reflows at 320 CSS pixels without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});

for (const theme of themes) {
  test(`the ${theme} theme has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto("/");
    if (theme === "dark") {
      await page.getByRole("button", { name: "Toggle theme" }).click();
    }

    expect(await axeViolations(page)).toEqual([]);
  });
}

function axeViolations(page: Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze()
    .then((results) => results.violations);
}
