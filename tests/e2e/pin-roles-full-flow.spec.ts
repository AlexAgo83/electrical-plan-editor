import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function dismissOnboardingIfVisible(page: Page): Promise<void> {
  const closeOnboardingButton = page.getByRole("button", { name: "Close onboarding", exact: true });
  if (!(await closeOnboardingButton.isVisible({ timeout: 3_000 }).catch(() => false))) {
    return;
  }
  await closeOnboardingButton.click();
  await expect(closeOnboardingButton).toHaveCount(0);
}

async function findVisibleSidebarButtonByText(
  page: Page,
  selector: ".workspace-nav-row" | ".workspace-nav-row.secondary",
  text: string
): Promise<Locator | null> {
  const buttons = page.locator(`${selector} button`).filter({ hasText: text });
  const buttonCount = await buttons.count();
  for (let index = 0; index < buttonCount; index += 1) {
    const candidate = buttons.nth(index);
    if (await candidate.isVisible()) {
      return candidate;
    }
  }
  const labeledButtons = page.locator(`${selector} button[aria-label]`);
  const labeledButtonCount = await labeledButtons.count();
  for (let index = 0; index < labeledButtonCount; index += 1) {
    const candidate = labeledButtons.nth(index);
    const accessibleLabel = (await candidate.getAttribute("aria-label")) ?? "";
    if (accessibleLabel.includes(text) && (await candidate.isVisible())) {
      return candidate;
    }
  }
  return null;
}

async function ensureNavigationDrawerOpen(page: Page): Promise<void> {
  const navigationToggle = page.locator(".header-nav-toggle");
  await page.locator(".header-nav-toggle, .workspace-nav-row").first().waitFor({ state: "attached" });
  if ((await findVisibleSidebarButtonByText(page, ".workspace-nav-row", "Modeling")) !== null) {
    return;
  }
  if ((await navigationToggle.count()) === 0) {
    await expect(page.locator(".workspace-nav-row").first()).toBeVisible();
    return;
  }
  if ((await navigationToggle.getAttribute("aria-expanded")) !== "true") {
    await navigationToggle.click();
  }
  await expect(page.locator(".workspace-nav-row").first()).toBeVisible();
}

async function ensureNavigationDrawerClosed(page: Page): Promise<void> {
  const navigationToggle = page.locator(".header-nav-toggle");
  if ((await navigationToggle.count()) === 0) {
    return;
  }
  if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
    await navigationToggle.click();
  }
  if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
    await page.keyboard.press("Escape");
  }
  await expect(navigationToggle).toHaveAttribute("aria-expanded", "false");
}

async function switchMainScreen(page: Page, label: "Modeling"): Promise<void> {
  await ensureNavigationDrawerOpen(page);
  const button = await findVisibleSidebarButtonByText(page, ".workspace-nav-row", label);
  if (button === null) {
    throw new Error(`Unable to find a visible ${label} navigation button.`);
  }
  await button.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
  await ensureNavigationDrawerClosed(page);
}

test("pin roles full flow covers mass edit and multi-network analysis surfaces", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "e-Plan Editor" })).toBeVisible();
  await dismissOnboardingIfVisible(page);

  await switchMainScreen(page, "Modeling");
  const massEditPanel = page.locator("section.pin-role-mass-edit-panel");
  await expect(massEditPanel.getByRole("heading", { name: "Pin role mass edit" })).toBeVisible();
  await massEditPanel.getByLabel("CSV paste").fill("CONN-SRC-01,1,consumer,4,E2E_CONSUMER");
  await massEditPanel.getByRole("button", { name: "Apply CSV" }).click();
  await expect(massEditPanel).toContainText("E2E_CONSUMER");
  await massEditPanel.getByLabel("CSV paste").fill("CONN-SRC-01,2,source,6,E2E_SOURCE");
  await massEditPanel.getByRole("button", { name: "Apply CSV" }).click();
  await expect(massEditPanel).toContainText("E2E_SOURCE");
  await expect(massEditPanel).toContainText("Source");

  const multiNetworkPanel = page.locator("section.panel").filter({
    has: page.getByRole("heading", { name: "Multi-network functional analysis" })
  });
  await expect(multiNetworkPanel).toBeVisible();
  await multiNetworkPanel.getByRole("button", { name: /Active assembly/ }).click();
  await expect(multiNetworkPanel).toContainText("Union graph:");
});
