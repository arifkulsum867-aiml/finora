import { expect, test } from "@playwright/test";

test("landing page presents Finora and its clearly labelled preview", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Spend smarter\./ })).toBeVisible();
  await expect(page.getByText("Sample dashboard preview")).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started" }).first()).toHaveAttribute("href", "/signup");
});

test("sign-in and sign-up screens explain missing Supabase setup", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign in to Finora" })).toBeVisible();
  await expect(page.getByText(/Supabase is not configured yet/)).toBeVisible();
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
});

test("unconfigured protected routes show setup rather than fabricated account totals", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Connect your private workspace" })).toBeVisible();
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(sizes.page).toBeLessThanOrEqual(sizes.viewport);
});
