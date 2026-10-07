import type { Download, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const PDF_BYTES = Buffer.from("%PDF-1.7\n% fixture for Supplier A\n\u0000ÿ\u0080 binary tail\n", "latin1");

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function lineageBar(page: Page): Locator {
  return page.getByRole("region", { name: "Named workspace", exact: true });
}

async function createWorkspace(page: Page, name: string, start: "current" | "empty"): Promise<void> {
  await lineageBar(page).getByRole("button", { name: "New workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill(name);
  await dialog.getByLabel(start === "current" ? "Start from the current content" : "Start empty").check();
  await dialog.getByLabel("This browser only (export ZIP packages to copy)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(lineageBar(page).getByLabel("Workspace")).toHaveValue(/workspace_/);
  await expect(lineageBar(page).getByLabel("Workspace").locator("option:checked")).toHaveText(name);
}

async function selectWorkspace(page: Page, name: string): Promise<void> {
  const select = lineageBar(page).getByLabel("Workspace");
  const value = await select.locator("option", { hasText: name }).getAttribute("value");
  await select.selectOption(value ?? "");
  await expect(select.locator("option:checked")).toHaveText(name);
}

async function createVersion(page: Page, expectedLabel: string, title: string): Promise<void> {
  await lineageBar(page).getByRole("button", { name: "Create version" }).click();
  const dialog = page.getByRole("dialog", { name: `Create version ${expectedLabel}` });
  await dialog.getByLabel("Label (optional)").fill(title);
  await dialog.getByRole("button", { name: "Create version" }).click();
  await expect(dialog).toHaveCount(0);
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
  await expect(lineageBar(page).getByLabel("Workspace")).toBeEnabled();

  await createWorkspace(page, "Série", "current");
  await createWorkspace(page, "Protos", "empty");
  await selectWorkspace(page, "Série");
  await createVersion(page, "v001", "Initial");
  await createVersion(page, "v002", "Livraison");

  await lineageBar(page).getByRole("button", { name: "History" }).click();
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

  const packageDownloadPromise = page.waitForEvent("download");
  await historyAgain.getByRole("button", { name: "Export package (ZIP)" }).click();
  const packageDownload = await packageDownloadPromise;
  expect(packageDownload.suggestedFilename()).toMatch(/^serie-.*\.zip$/);
  const packageBytes = await savedDownloadBytes(packageDownload);
  await historyAgain.getByRole("button", { name: "Close", exact: true }).click();

  // Reload: both lineages and the active one survive in this browser.
  await page.reload();
  await expect(lineageBar(page).getByLabel("Workspace").locator("option:checked")).toHaveText("Série");
  await expect(lineageBar(page).getByLabel("Workspace").locator("option")).toHaveText(["Protos", "Série"]);

  // Read-only consultation from history.
  await lineageBar(page).getByRole("button", { name: "History" }).click();
  await historyEntry(page.getByRole("dialog", { name: "History of Série" }), "v001").getByRole("button", { name: "Open read-only" }).click();
  await expect(page.getByText("Read-only: viewing v001")).toBeVisible();
  await expect(lineageBar(page).getByRole("button", { name: "Save" })).toBeDisabled();
  await lineageBar(page).getByRole("button", { name: "Return to working copy" }).click();
  await expect(page.getByText("Read-only: viewing v001")).toHaveCount(0);

  // Another computer: clean browser context, import the ZIP package.
  const cleanContext = await browser.newContext();
  const clean = await cleanContext.newPage();
  await preparePage(clean);
  await clean.goto("/");
  await expect(lineageBar(clean).getByLabel("Workspace")).toBeEnabled();
  await clean.locator(".home-workspace-lineages-panel input[type=file]").setInputFiles({ name: "serie.zip", mimeType: "application/zip", buffer: packageBytes });
  await expect(clean.getByText("Package imported").first()).toBeVisible();
  await selectWorkspace(clean, "Série");
  await lineageBar(clean).getByRole("button", { name: "History" }).click();
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
