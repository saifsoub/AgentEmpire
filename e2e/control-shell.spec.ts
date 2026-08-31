import { expect, test } from "@playwright/test";

const viewports = [
  { label: "320px", width: 320, height: 720, mode: "mobile" },
  { label: "768px", width: 768, height: 900, mode: "mobile" },
  { label: "1024px", width: 1024, height: 768, mode: "desktop" },
  { label: "1440px", width: 1440, height: 900, mode: "desktop" },
] as const;

for (const viewport of viewports) {
  test(`${viewport.label} exposes the responsive control shell without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/control");

    await expect(page.getByRole("heading", { level: 1, name: "Control" })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Health:/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Production cutover owner-gated" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const menuTrigger = page.getByRole("button", { name: "Open navigation" });
    const desktopNavigation = page.getByRole("navigation", { name: "Primary navigation" }).first();
    if (viewport.mode === "mobile") {
      await expect(menuTrigger).toBeVisible();
      await expect(desktopNavigation).toBeHidden();
    } else {
      await expect(menuTrigger).toBeHidden();
      await expect(desktopNavigation).toBeVisible();
    }
  });
}

test("mobile drawer traps focus and restores it after Escape", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/control");

  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Mobile navigation" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Close navigation" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(drawer.getByRole("link", { name: "Settings" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(drawer.getByRole("button", { name: "Close navigation" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("command palette supports keyboard open, navigation, and focus restoration", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/control");

  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "Search command destinations" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();
  await expect(page.locator("[data-app-shell-content]")).toHaveAttribute("inert", "");
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Close command palette" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await input.fill("agents");
  await expect(dialog.getByRole("option", { name: /Agents/ })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/agents$/);

  const trigger = page.getByRole("button", { name: "Open command palette" });
  await page.keyboard.press("Control+K");
  await expect(page.getByRole("dialog", { name: "Search command destinations" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.locator("[data-app-shell-content]")).not.toHaveAttribute("inert", "");
});

test("skip link and reduced-motion mode remain operable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/control");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const transitionDuration = await page.getByRole("button", { name: "Open command palette" }).evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.00001);
});
