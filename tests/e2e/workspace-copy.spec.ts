import type { Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("electrical-plan-editor.onboarding.auto-open-enabled.v1", "false");
  });
}

function currentGroup(page: Page): Locator {
  return page.locator("#settings-workspace-storage").getByRole("region", { name: "Current workspace", exact: true });
}

async function openStorageSettings(page: Page): Promise<void> {
  await page.locator(".header-settings-toggle").click();
  await expect(page.locator("#settings-workspace-storage")).toBeVisible();
}

test("Copy downloads the displayed workspace as one .epe.json, unsaved edits included, without saving", async ({ page }) => {
  await preparePage(page);
  await page.goto("/");
  await openStorageSettings(page);
  await currentGroup(page).getByRole("button", { name: "New workspace" }).click();
  const dialog = page.getByRole("dialog", { name: "New named workspace" });
  await dialog.getByLabel("Workspace name").fill("Série A");
  await dialog.getByLabel("Start from the current content").check();
  await dialog.getByLabel("This browser only (export ZIP packages to copy)").check();
  await dialog.getByRole("button", { name: "Create workspace" }).click();
  await expect(dialog).toHaveCount(0);

  // Unsaved in-memory edit of the active network.
  await page.keyboard.press("Alt+2");
  const scope = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Network Scope", exact: true }) }).first();
  await scope.locator("tbody tr").first().click();
  const form = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Edit network" }) }).first();
  await form.getByLabel("Network name").fill("Edited before copy");
  await form.getByLabel(/Plan revision/).fill("B02");
  await form.getByRole("button", { name: "Save network" }).click();

  await openStorageSettings(page);
  const copy = currentGroup(page).getByRole("button", { name: "Copy", exact: true });
  await expect(copy).toHaveAttribute("title", /snapshot/);
  const downloads: string[] = [];
  page.on("download", (download) => downloads.push(download.suggestedFilename()));
  const downloadPromise = page.waitForEvent("download");
  await copy.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^serie-a-copy-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.epe\.json$/);
  const payload = JSON.parse(await readFile(await download.path(), "utf8")) as {
    payloadKind: string;
    workspaceId: string;
    lineage?: { displayName: string };
    state: { networks: { allIds: string[]; byId: Record<string, { name: string; planRevision?: string }> } };
  };
  expect(payload.payloadKind).toBe("electrical-plan-editor.workspace-file");
  expect(payload.lineage?.displayName).toBe("Série A");
  expect(payload.state.networks.allIds.length).toBeGreaterThan(1);
  expect(Object.values(payload.state.networks.byId).some((network) => network.name === "Edited before copy" && network.planRevision === "B02")).toBe(true);
  await expect(page.getByText("Copy download initiated")).toBeVisible();
  // Copy never triggers the Save package download nor registers another workspace.
  await page.waitForTimeout(500);
  expect(downloads.filter((name) => name.endsWith(".zip"))).toEqual([]);
  await expect(currentGroup(page).getByRole("combobox", { name: "Workspace", exact: true }).locator("option")).toHaveCount(1);
});
