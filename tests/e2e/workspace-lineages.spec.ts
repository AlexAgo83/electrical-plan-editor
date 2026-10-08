import type { Download, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const PDF_BYTES = Buffer.from("%PDF-1.7\n% fixture for Supplier A\n\u0000ÿ\u0080 binary tail\n", "latin1");

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function contextBar(page: Page): Locator {
  return page.getByRole("region", { name: "Named workspace", exact: true });
}

function storagePanel(page: Page): Locator {
  return page.locator("#settings-workspace-storage");
}

function storageGroup(page: Page, name: "Current workspace" | "Versions and handoffs" | "Transfer and recovery"): Locator {
  return storagePanel(page).getByRole("region", { name, exact: true });
}

function workspaceSelect(page: Page): Locator {
  return storageGroup(page, "Current workspace").getByRole("combobox", { name: "Workspace", exact: true });
}

async function openStorageSettings(page: Page): Promise<void> {
  const manage = (await contextBar(page).count()) > 0
    ? contextBar(page).getByRole("button", { name: "Manage workspaces" })
    : page.locator(".home-workspace-lineages-panel").getByRole("button", { name: "Manage workspaces" });
  await manage.focus();
  await page.keyboard.press("Enter");
  await expect(storagePanel(page).getByRole("heading", { level: 2, name: "Workspace storage" })).toBeFocused();
}

async function createWorkspace(page: Page, name: string, start: "current" | "empty"): Promise<void> {
  await storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill(name);
  await dialog.getByLabel(start === "current" ? "Start from the current content" : "Start empty").check();
  await dialog.getByLabel("This browser only (export ZIP packages to copy)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(workspaceSelect(page)).toHaveValue(/workspace_/);
  await expect(workspaceSelect(page).locator("option:checked")).toHaveText(name);
}

async function selectWorkspace(page: Page, name: string): Promise<void> {
  const select = workspaceSelect(page);
  const value = await select.locator("option", { hasText: name }).getAttribute("value");
  await select.selectOption(value ?? "");
  await expect(select.locator("option:checked")).toHaveText(name);
}

async function createVersion(page: Page, expectedLabel: string, title: string): Promise<void> {
  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "Create version" }).click();
  const dialog = page.getByRole("dialog", { name: `Create version ${expectedLabel}` });
  await dialog.getByLabel("Label (optional)").fill(title);
  await dialog.getByRole("button", { name: "Create version" }).click();
  await expect(dialog).toHaveCount(0);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

function historyEntry(dialog: Locator, label: string): Locator {
  return dialog.locator(".lineage-history-entry").filter({ has: dialog.page().locator(".lineage-history-heading strong", { hasText: new RegExp(`^${label}$`) }) });
}

async function savedDownloadBytes(download: Download): Promise<Buffer> {
  const path = await download.path();
  return readFile(path);
}

test("two named lineages, supplier archive and portable transfer into a clean browser", async ({ browser, page }) => {
  await preparePage(page);
  await page.goto("/");
  await openStorageSettings(page);
  // Legacy session: compatibility subsection with the single-file tools, no compact context yet.
  await expect(storagePanel(page).getByRole("region", { name: "Single-file compatibility" })).toBeVisible();
  await expect(contextBar(page)).toHaveCount(0);
  await expect(storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" })).toBeEnabled();

  await createWorkspace(page, "Série", "current");
  await createWorkspace(page, "Protos", "empty");
  await expect(storagePanel(page).getByRole("region", { name: "Single-file compatibility" })).toHaveCount(0);
  await expect(storagePanel(page).getByRole("button", { name: "Use a file for autosave" })).toHaveCount(0);
  await selectWorkspace(page, "Série");
  await createVersion(page, "v001", "Initial");
  await createVersion(page, "v002", "Livraison");

  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  const history = page.getByRole("dialog", { name: "History of Série" });
  await expect(history.locator(".lineage-history-entry")).toHaveCount(2);
  await historyEntry(history, "v001").getByRole("button", { name: "Record supplier handoff" }).click();
  const handoff = page.getByRole("dialog", { name: "Record supplier handoff" });
  await handoff.getByLabel("Recipient").fill("Supplier A");
  await handoff.getByLabel("Declared handoff date").fill("2026-10-05");
  await handoff.getByLabel("Delivered files (exact copies)").setInputFiles({ name: "plan-serie.pdf", mimeType: "application/pdf", buffer: PDF_BYTES });
  await handoff.getByRole("button", { name: "Record handoff" }).click();
  const historyAgain = page.getByRole("dialog", { name: "History of Série" });
  await expect(historyAgain.getByText("Supplier A")).toBeVisible();
  await historyAgain.getByRole("button", { name: "Close", exact: true }).click();
  await expect(historyAgain).toHaveCount(0);

  const packageDownloadPromise = page.waitForEvent("download");
  await storageGroup(page, "Transfer and recovery").getByRole("button", { name: "Export package (ZIP)" }).click();
  const packageDownload = await packageDownloadPromise;
  expect(packageDownload.suggestedFilename()).toMatch(/^serie-.*\.zip$/);
  const packageBytes = await savedDownloadBytes(packageDownload);

  // Narrow viewport: the storage groups wrap without page overflow.
  await page.setViewportSize({ width: 360, height: 800 });
  await storagePanel(page).scrollIntoViewIfNeeded();
  await expectNoHorizontalOverflow(page);
  await page.setViewportSize({ width: 1280, height: 800 });

  // Reload: both lineages and the active one survive; the compact context names it outside Settings.
  await page.reload();
  await expect(contextBar(page).getByText("Série", { exact: true })).toBeVisible();
  await openStorageSettings(page);
  await expect(workspaceSelect(page).locator("option:checked")).toHaveText("Série");
  await expect(workspaceSelect(page).locator("option")).toHaveText(["Protos", "Série"]);

  // Read-only consultation from history: the warning and its exit stay in the compact context.
  await storageGroup(page, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  await historyEntry(page.getByRole("dialog", { name: "History of Série" }), "v001").getByRole("button", { name: "Open read-only" }).click();
  await expect(contextBar(page).getByText("Read-only: viewing v001")).toBeVisible();
  await expect(storageGroup(page, "Current workspace").getByRole("button", { name: "Save" })).toBeDisabled();
  await contextBar(page).getByRole("button", { name: "Return to working copy" }).click();
  await expect(page.getByText("Read-only: viewing v001")).toHaveCount(0);
  await expect(storageGroup(page, "Current workspace").getByRole("button", { name: "Save" })).toBeEnabled();

  // Another computer: clean browser context, import the ZIP package from Settings.
  const cleanContext = await browser.newContext();
  const clean = await cleanContext.newPage();
  await preparePage(clean);
  await clean.goto("/");
  await openStorageSettings(clean);
  await expect(storageGroup(clean, "Transfer and recovery").getByRole("button", { name: "Import package (ZIP)" })).toBeEnabled();
  await storageGroup(clean, "Transfer and recovery").locator("input[type=file]").setInputFiles({ name: "serie.zip", mimeType: "application/zip", buffer: packageBytes });
  await expect(clean.getByText("Package imported").first()).toBeVisible();
  await selectWorkspace(clean, "Série");
  await storageGroup(clean, "Versions and handoffs").getByRole("button", { name: "History" }).click();
  const importedHistory = clean.getByRole("dialog", { name: "History of Série" });
  await expect(importedHistory.locator(".lineage-history-entry")).toHaveCount(2);
  await importedHistory.getByRole("button", { name: "Show files" }).click();
  await expect(importedHistory.getByText("Verified")).toBeVisible();
  const attachmentDownloadPromise = clean.waitForEvent("download");
  await importedHistory.locator(".lineage-handoff").getByRole("button", { name: "Download" }).click();
  const attachmentDownload = await attachmentDownloadPromise;
  expect(attachmentDownload.suggestedFilename()).toBe("plan-serie.pdf");
  expect((await savedDownloadBytes(attachmentDownload)).equals(PDF_BYTES)).toBe(true);
  await cleanContext.close();
});
