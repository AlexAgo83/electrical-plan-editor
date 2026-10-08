import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// req_169: layout, theming, truthful status, single read-only signal, Home rows and History hierarchy.

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function homeLineagesPanel(page: Page): Locator {
  return page.locator(".home-workspace-lineages-panel");
}

function storagePanel(page: Page): Locator {
  return page.locator("#settings-workspace-storage");
}

function storageGroup(page: Page, name: "Current workspace" | "Versions and handoffs" | "Transfer and recovery"): Locator {
  return storagePanel(page).getByRole("region", { name, exact: true });
}

async function openScreen(page: Page, label: string): Promise<void> {
  if (label === "Settings") {
    const settings = page.getByRole("button", { name: "Settings", exact: true }).first();
    if ((await settings.getAttribute("aria-pressed")) !== "true") {
      await settings.click();
    }
    return;
  }
  const toggle = page.locator(".header-nav-toggle");
  if ((await toggle.count()) > 0 && (await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
  await page
    .locator(".workspace-nav-row button", { hasText: label })
    .first()
    .evaluate((element) => (element as HTMLButtonElement).click());
  if ((await toggle.count()) > 0 && (await toggle.getAttribute("aria-expanded")) === "true") {
    await toggle.click();
  }
  await expect(toggle).not.toHaveAttribute("aria-expanded", "true");
}

async function openStorageSettings(page: Page): Promise<void> {
  await openScreen(page, "Home");
  await homeLineagesPanel(page).getByRole("button", { name: "Manage workspaces" }).click();
  await expect(storagePanel(page).getByRole("heading", { level: 2, name: "Workspace storage" })).toBeFocused();
}

async function fillCreateDialog(page: Page, name: string, start: "current" | "empty"): Promise<void> {
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill(name);
  await dialog.getByLabel(start === "current" ? "Start from the current content" : "Start empty").check();
  await dialog.getByLabel("This browser only (export ZIP packages to copy)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);
}

async function createWorkspaceFromSettings(page: Page, name: string): Promise<void> {
  await storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" }).click();
  await fillCreateDialog(page, name, "empty");
  await expect(storageGroup(page, "Current workspace").getByRole("combobox", { name: "Workspace", exact: true }).locator("option:checked")).toHaveText(name);
}

async function createVersion(page: Page, label: string, title: string): Promise<void> {
  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "Create version" }).click();
  const dialog = page.getByRole("dialog", { name: `Create version ${label}` });
  await dialog.getByLabel("Label (optional)").fill(title);
  await dialog.getByRole("button", { name: "Create version" }).click();
  await expect(dialog).toHaveCount(0);
}

async function setTheme(page: Page, themeMode: string): Promise<void> {
  await openScreen(page, "Settings");
  await page.getByLabel("Theme mode").selectOption(themeMode);
}

async function expectHomePanelsDoNotOverlap(page: Page): Promise<void> {
  const layout = await page.evaluate(() => {
    const column = document.querySelector(".home-left-column") as HTMLElement;
    const panels = [...column.querySelectorAll<HTMLElement>(":scope > .home-panel")].map((panel) => panel.getBoundingClientRect());
    const whatsNew = (document.querySelector(".home-whats-new-panel") as HTMLElement).getBoundingClientRect();
    const quickStartButtons = [...document.querySelectorAll<HTMLButtonElement>(".home-quick-start-panel .home-primary-actions button")].map((button) => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { visible: rect.width > 0 && rect.height > 0, reachable: hit !== null && button.contains(hit) };
    });
    const columnRect = column.getBoundingClientRect();
    const fullWidth = panels.every((rect) => Math.abs(rect.width - columnRect.width) <= 1);
    return { fullWidth, panels: panels.map((rect) => ({ top: rect.top, bottom: rect.bottom })), columnBottom: column.getBoundingClientRect().bottom, whatsNewBottom: whatsNew.bottom, quickStartButtons };
  });
  expect(layout.fullWidth).toBe(true);
  for (let index = 1; index < layout.panels.length; index += 1) {
    expect(layout.panels[index]!.top).toBeGreaterThanOrEqual(layout.panels[index - 1]!.bottom - 0.5);
  }
  // The last panel reaches the column bottom and What's new follows the same height: no large gap.
  expect(Math.abs(layout.columnBottom - layout.panels[layout.panels.length - 1]!.bottom)).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.columnBottom - layout.whatsNewBottom)).toBeLessThanOrEqual(1);
  for (const button of layout.quickStartButtons) {
    expect(button).toEqual({ visible: true, reachable: true });
  }
}

/** Every lineage button shares the theme button look of a reference .row-actions button. */
async function expectThemedLineageButtons(page: Page, scope: string): Promise<void> {
  const result = await page.evaluate((selector) => {
    const reference = document.querySelector<HTMLButtonElement>(".home-quick-start-panel .home-primary-actions button, .settings-workspace-storage .row-actions button");
    const signature = (element: Element) => {
      const style = getComputedStyle(element);
      return { radius: style.borderTopLeftRadius, font: style.fontFamily };
    };
    const expected = reference === null ? null : signature(reference);
    const buttons = [...document.querySelectorAll<HTMLButtonElement>(selector)];
    return {
      expected,
      count: buttons.length,
      outsideConvention: buttons.filter((button) => button.closest(".row-actions") === null).map((button) => button.textContent),
      mismatches: buttons.filter((button) => JSON.stringify(signature(button)) !== JSON.stringify(expected)).map((button) => button.textContent)
    };
  }, scope);
  expect(result.count).toBeGreaterThan(0);
  expect(result.outsideConvention).toEqual([]);
  expect(result.mismatches).toEqual([]);
  expect(parseFloat(result.expected?.radius ?? "0")).toBeGreaterThan(0);
}

test("Home panels never overlap from 980px to 1920px with 0, 1, 2 and 8 named workspaces", async ({ page }) => {
  await preparePage(page);
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto("/");
  await openScreen(page, "Home");
  await expectHomePanelsDoNotOverlap(page);

  // Empty library: one-step creation of the first workspace from Home.
  await homeLineagesPanel(page).getByRole("button", { name: "Create your first workspace" }).click();
  await fillCreateDialog(page, "Série principale avec un nom particulièrement long pour vérifier l'ellipse", "current");
  await expect(homeLineagesPanel(page).getByRole("combobox", { name: "Workspace", exact: true }).locator("option:checked")).toHaveText(/Série principale/);
  await expectHomePanelsDoNotOverlap(page);

  await openStorageSettings(page);
  // The untouched sample was not announced as a preserved workspace.
  await expect(page.getByText(/Recovery copy/)).toHaveCount(0);
  await createWorkspaceFromSettings(page, "Prototypes de câblage avec un nom très long également");
  await openScreen(page, "Home");
  await expectHomePanelsDoNotOverlap(page);
  const rows = homeLineagesPanel(page).getByRole("list", { name: "Other workspaces" }).getByRole("button");
  await expect(rows).toHaveCount(1);
  const rowHeight = await rows.first().evaluate((element) => element.getBoundingClientRect().height);
  expect(rowHeight).toBeLessThan(48);

  await openStorageSettings(page);
  for (let index = 3; index <= 8; index += 1) {
    await createWorkspaceFromSettings(page, `Atelier ${index} — variante de faisceau avec un libellé long`);
  }
  await openScreen(page, "Home");
  await expect(rows).toHaveCount(7);
  for (const width of [980, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expectHomePanelsDoNotOverlap(page);
  }
  await page.setViewportSize({ width: 1366, height: 800 });

  // Whole-row resume opens the other workspace and goes to Modeling.
  await rows.first().click();
  await expect(page.locator(".workspace-nav-row button.is-active, .workspace-nav-row [aria-current]").first()).toBeAttached();
  await openScreen(page, "Home");
  await expect(rows).toHaveCount(7);

  await page.setViewportSize({ width: 360, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("lineage buttons use the themed style in every reviewed theme", async ({ page }) => {
  await preparePage(page);
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto("/");
  await openStorageSettings(page);
  await createWorkspaceFromSettings(page, "Série");
  await createWorkspaceFromSettings(page, "Protos");
  await createVersion(page, "v001", "Initial");
  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  await page.getByRole("dialog", { name: "History of Protos" }).getByRole("button", { name: "Open read-only" }).click();
  await expect(page.locator(".workspace-lineage-banner.is-read-only")).toHaveCount(1);

  for (const theme of ["warmBrown", "normal", "dark", "cyberpunk", "circleMobilityDark", "sagePaper"]) {
    await setTheme(page, theme);
    await expectThemedLineageButtons(page, ".workspace-lineage-read-only-banner button, .settings-workspace-storage button:not(.settings-storage-file-link)");
    await openScreen(page, "Home");
    await expectThemedLineageButtons(page, ".home-workspace-lineages-panel button");
  }
});

test("read-only consultation shows one banner and no spurious toast; status and dates follow the app locale", async ({ page }) => {
  await preparePage(page);
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto("/");
  await openStorageSettings(page);
  await storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" }).click();
  await fillCreateDialog(page, "Série", "current");
  await createVersion(page, "v001", "Initial");

  // Browser-only normal state: success status, separate neutral export hint with its action.
  const current = storageGroup(page, "Current workspace");
  await expect(current.locator(".settings-state-chip.is-ok")).toContainText("Stored in this browser");
  await expect(current.locator(".lineage-export-hint.is-neutral")).toContainText("Not exported as a package yet");
  await expect(current.locator(".lineage-export-hint").getByRole("button", { name: "Export now" })).toBeVisible();
  await expect(storageGroup(page, "Versions and handoffs")).toContainText("Latest: v001");
  await expect(storageGroup(page, "Versions and handoffs")).toContainText("1 version · 0 supplier handoffs");

  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  await page.getByRole("dialog", { name: "History of Série" }).getByRole("button", { name: "Open read-only" }).click();
  await expect(page.locator(".workspace-lineage-banner.is-read-only")).toHaveCount(1);
  await expect(storagePanel(page).getByText(/Viewing v001 read-only/)).toBeVisible();
  await expect(storagePanel(page).getByRole("button", { name: "Return to working copy" })).toHaveCount(0);

  for (const screen of ["Modeling", "Statistics", "Validation", "Network Scope", "Home", "Settings", "Modeling"]) {
    await openScreen(page, screen);
    await page.waitForTimeout(400);
    await expect(page.locator(".toast-notification", { hasText: "Read-only version" })).toHaveCount(0);
  }
  // A real edit attempt is still blocked and still notifies.
  await page.keyboard.press("Control+z");
  await expect(page.locator(".toast-notification", { hasText: "Read-only version" }).first()).toBeVisible();
  await page.locator(".workspace-lineage-read-only-banner").getByRole("button", { name: "Return to working copy" }).click();
  await expect(page.locator(".workspace-lineage-banner.is-read-only")).toHaveCount(0);

  await openScreen(page, "Settings");
  await page.getByLabel("Language").selectOption("fr");
  // Screen visits persist view state; wait for the autosave, then read the 24-hour French time.
  await expect(storagePanel(page).locator(".lineage-status-row .settings-state-chip").first()).toHaveText(/^Stocké dans ce navigateur \d{2}:\d{2}$/, { timeout: 10_000 });
  await expect(storagePanel(page).locator(".settings-storage-latest")).toContainText(/\d{1,2} [a-zéû]+\.? \d{4}/);
  await expect(storagePanel(page)).toContainText("1 version · 0 remise fournisseur");
});

test("History rows expose one primary action and a keyboard menu; toasts stay above the dialog", async ({ page }) => {
  await preparePage(page);
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto("/");
  await openStorageSettings(page);
  await storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" }).click();
  await fillCreateDialog(page, "Série", "current");
  await createVersion(page, "v001", "Initial");
  await createVersion(page, "v002", "Livraison");
  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  const history = page.getByRole("dialog", { name: "History of Série" });
  const firstRow = history.locator(".lineage-history-entry").first();

  // Filter at rest is not highlighted and not focused; no storage line, no device id.
  const filter = history.getByLabel("Filter history");
  await expect(filter).not.toBeFocused();
  expect(await filter.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
  await expect(history).not.toContainText("Stored in this browser");
  await expect(history).not.toContainText(/device-[a-z0-9]{4}/);
  await expect(history.getByRole("button", { name: "Record supplier handoff" })).toHaveCount(1);

  await expect(firstRow.locator(".lineage-history-actions > button")).toHaveText(["Open read-only"]);
  const more = firstRow.getByRole("button", { name: "More actions for v002" });
  await more.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu", { name: "More actions for v002" });
  await expect(menu.getByRole("menuitem")).toHaveText([/Download file/, /Record supplier handoff/, /Resume from this version/]);
  await expect(menu.getByRole("menuitem", { name: /Download file/ })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  const resume = menu.getByRole("menuitem", { name: /Resume from this version/ });
  await expect(resume).toBeFocused();
  await expect(resume).toHaveClass(/is-danger-action/);
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(history).toBeVisible();
  await expect(more).toBeFocused();

  // Resume keeps its confirmation.
  await more.click();
  await menu.getByRole("menuitem", { name: /Resume from this version/ }).click();
  const confirm = page.getByRole("dialog", { name: "Resume from an older version" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancel" }).click();
  await expect(confirm).toHaveCount(0);
  await expect(history).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await history.getByRole("button", { name: "Export package (ZIP)" }).click();
  await downloadPromise;
  const toast = page.locator(".toast-notification").filter({ hasText: "Package download initiated" }).first();
  await expect(toast).toBeVisible();
  const toastOnTop = await toast.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return hit !== null && element.contains(hit);
  });
  expect(toastOnTop).toBe(true);

  await page.setViewportSize({ width: 360, height: 800 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
