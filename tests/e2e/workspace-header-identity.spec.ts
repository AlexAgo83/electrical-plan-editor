import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function headerIdentity(page: Page): Locator {
  return page.locator(".header-block .header-workspace-identity");
}

function currentGroup(page: Page): Locator {
  return page.locator("#settings-workspace-storage").getByRole("region", { name: "Current workspace", exact: true });
}

async function openStorageSettings(page: Page): Promise<void> {
  await page.locator(".header-settings-toggle").click();
  await expect(page.locator("#settings-workspace-storage")).toBeVisible();
}

async function createWorkspace(page: Page, name: string): Promise<void> {
  await currentGroup(page).getByRole("button", { name: "New workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill(name);
  await dialog.getByLabel("Start from the current content").check();
  await dialog.getByLabel("This browser only (export ZIP packages to copy)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);
}

test("keeps the active workspace identity beside the brand across screens, rename and switch", async ({ page }) => {
  await preparePage(page);
  await page.goto("/");
  await expect(headerIdentity(page)).toHaveText(/Unnamed workspace/);

  await openStorageSettings(page);
  await createWorkspace(page, "Série A");
  await expect(headerIdentity(page).locator(".header-workspace-name")).toHaveText("Série A");
  // Same display name twice: identity follows the session, not a name lookup.
  await createWorkspace(page, "Série A");
  await expect(headerIdentity(page).locator(".header-workspace-name")).toHaveText("Série A");
  await createWorkspace(page, "Protos");
  await expect(headerIdentity(page).locator(".header-workspace-name")).toHaveText("Protos");

  for (const shortcut of ["Alt+1", "Alt+2", "Alt+4", "Alt+6", "Alt+7"]) {
    await page.keyboard.press(shortcut);
    await expect(headerIdentity(page).locator(".header-workspace-name")).toHaveText("Protos");
    // Placed immediately to the right of the brand.
    const brandBox = await page.locator(".header-block h1").boundingBox();
    const identityBox = await headerIdentity(page).boundingBox();
    expect(identityBox !== null && brandBox !== null && identityBox.x >= brandBox.x + brandBox.width).toBe(true);
    expect(identityBox !== null && brandBox !== null && identityBox.x - (brandBox.x + brandBox.width) < 40).toBe(true);
  }

  await currentGroup(page).getByRole("button", { name: "Rename" }).click();
  const renameDialog = page.getByRole("dialog", { name: "Rename workspace" });
  await renameDialog.getByLabel("Workspace name").fill("Prototypes 2027 — faisceau principal variante longue");
  await renameDialog.getByRole("button", { name: "Rename" }).click();
  await expect(headerIdentity(page)).toHaveAttribute("title", "Current workspace: Prototypes 2027 — faisceau principal variante longue");

  const select = currentGroup(page).getByRole("combobox", { name: "Workspace", exact: true });
  const firstSerie = await select.locator("option", { hasText: "Série A" }).first().getAttribute("value");
  await select.selectOption(firstSerie ?? "");
  await expect(headerIdentity(page).locator(".header-workspace-name")).toHaveText("Série A");
});

test("keeps a visible identity at 360px without hiding navigation or header actions", async ({ page }) => {
  await preparePage(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await page.locator(".header-settings-toggle").click();
  await expect(page.locator("#settings-workspace-storage")).toBeVisible();
  await createWorkspace(page, "Prototypes 2027 — faisceau principal variante longue");
  const identity = headerIdentity(page);
  await expect(identity).toBeVisible();
  const box = await identity.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(30);
  await expect(page.locator(".header-nav-toggle")).toBeVisible();
  await expect(page.locator(".header-settings-toggle")).toBeVisible();
  await expect(page.locator(".header-ops-toggle")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(identity).toHaveAttribute("title", /Prototypes 2027 — faisceau principal variante longue/);
});
