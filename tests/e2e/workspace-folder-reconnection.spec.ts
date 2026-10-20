import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function homePanel(page: Page): Locator {
  return page.locator(".home-workspace-lineages-panel");
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
  const manage = homePanel(page).getByRole("button", { name: "Manage workspaces" });
  await manage.focus();
  await page.keyboard.press("Enter");
  await expect(storagePanel(page).getByRole("heading", { level: 2, name: "Workspace storage" })).toBeFocused();
}

// Native, structured-cloneable directory handles and real IndexedDB; the picker is substituted
// with OPFS, so this deliberately does not claim OS picker / transient activation coverage.

test.use({ launchOptions: process.env.EPE_NATIVE_FOLDER_EXECUTABLE ? { executablePath: process.env.EPE_NATIVE_FOLDER_EXECUTABLE } : {} });

for (const reload of [false, true]) {
test(`folder reconnection with native handles${reload ? " after reload" : " in the current session"}`, async ({ page, browser }) => {
  test.skip(reload && browser.version().startsWith("153.") && process.env.EPE_NATIVE_FOLDER_RELOAD !== "1", "Native OPFS handle deserialization crashes Chromium 153 with SIGTRAP in this environment; opt in to validate on a supported build.");
  await preparePage(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, "showDirectoryPicker", {
      configurable: true,
      value: () => navigator.storage.getDirectory()
    });
  });
  await page.goto("/");
  await openStorageSettings(page);
  await storageGroup(page, "Current workspace").getByRole("button", { name: "New workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill("Native handle regression");
  await dialog.getByLabel("Start from the current content").check();
  await dialog.getByLabel("A folder on disk (recommended)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);
  const workspaceId = await workspaceSelect(page).inputValue();
  await storageGroup(page, "Current workspace").getByRole("button", { name: "Save", exact: true }).click();
  const readWorking = () => page.evaluate(async () => {
    const parent = await navigator.storage.getDirectory();
    const root = await parent.getDirectoryHandle("native-handle-regression");
    const handle = await root.getFileHandle("native-handle-regression-travail.epe.json");
    return JSON.parse(await (await handle.getFile()).text()) as { workspaceId: string; revisionId: string };
  });
  await expect.poll(async () => (await readWorking()).workspaceId).toBe(workspaceId);
  const before = await readWorking();
  if (reload) {
    await page.reload();
    await openStorageSettings(page);
  }
  await expect(workspaceSelect(page)).toHaveValue(workspaceId);
  await storageGroup(page, "Transfer and recovery").getByRole("button", { name: "Choose folder…", exact: true }).click();
  await expect(page.getByText("Workspace folder reconnected", { exact: true })).toBeVisible();
  expect(await readWorking()).toEqual(before); // reconnect itself did not write
  await storageGroup(page, "Current workspace").getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await readWorking()).revisionId).not.toBe(before.revisionId);
  expect((await readWorking()).workspaceId).toBe(workspaceId);
});

}
