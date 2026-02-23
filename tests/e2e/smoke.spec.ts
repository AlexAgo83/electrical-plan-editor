import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function dismissOnboardingIfVisible(page: Page): Promise<void> {
  const closeOnboardingButton = page.getByRole("button", { name: "Close onboarding", exact: true });
  if ((await closeOnboardingButton.count()) === 0) {
    return;
  }
  await closeOnboardingButton.click();
  await expect(page.getByRole("button", { name: "Close onboarding", exact: true })).toHaveCount(0);
}

test("bootstraps a comprehensive sample network on first launch", async ({ page }) => {
  const ensureNavigationDrawerOpen = async () => {
    const navigationToggle = page.locator(".header-nav-toggle");
    if ((await navigationToggle.getAttribute("aria-expanded")) !== "true") {
      await navigationToggle.click();
    }
    await expect(page.locator(".workspace-drawer.is-open")).toBeVisible();
  };
  const ensureNavigationDrawerClosed = async () => {
    const navigationToggle = page.locator(".header-nav-toggle");
    const backdrop = page.locator(".workspace-drawer-backdrop.is-open");
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true" && (await backdrop.count()) > 0) {
      await backdrop.click({ position: { x: 8, y: 8 } });
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await navigationToggle.click();
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await page.keyboard.press("Escape");
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await page.getByRole("button", { name: "Settings" }).focus();
    }
    await expect(navigationToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveCount(0);
  };
  const switchScreen = async (value: "modeling" | "analysis") => {
    await ensureNavigationDrawerOpen();
    await page
      .locator(".workspace-drawer.is-open .workspace-nav-row")
      .getByRole("button", { name: value === "modeling" ? "Modeling" : "Analysis", exact: true })
      .click();
    await ensureNavigationDrawerClosed();
  };
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "e-Plan Editor" })).toBeVisible();
  await dismissOnboardingIfVisible(page);
  await switchScreen("modeling");

  const connectorsPanel = page
    .locator("article.panel")
    .filter({ has: page.getByRole("heading", { name: "Connectors" }) });

  await expect(connectorsPanel).toContainText("Power Source Connector");
  await expect(connectorsPanel).toContainText("CONN-SRC-01");
});

test("create -> route -> force -> recompute flow works end-to-end", async ({ page }) => {
  test.setTimeout(60_000);
  const ensureNavigationDrawerOpen = async () => {
    const navigationToggle = page.locator(".header-nav-toggle");
    if ((await navigationToggle.getAttribute("aria-expanded")) !== "true") {
      await navigationToggle.click();
    }
    await expect(page.locator(".workspace-drawer.is-open")).toBeVisible();
  };
  const ensureNavigationDrawerClosed = async () => {
    const navigationToggle = page.locator(".header-nav-toggle");
    const backdrop = page.locator(".workspace-drawer-backdrop.is-open");
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true" && (await backdrop.count()) > 0) {
      await backdrop.click({ position: { x: 8, y: 8 } });
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await navigationToggle.click();
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await page.keyboard.press("Escape");
    }
    if ((await navigationToggle.getAttribute("aria-expanded")) === "true") {
      await page.getByRole("button", { name: "Settings" }).focus();
    }
    await expect(navigationToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveCount(0);
  };

  const switchSubScreen = async (value: "connector" | "splice" | "node" | "segment" | "wire") => {
    const labelBySubScreen = {
      connector: "Connector",
      splice: "Splice",
      node: "Node",
      segment: "Segment",
      wire: "Wire"
    } as const;
    await ensureNavigationDrawerOpen();
    if ((await page.locator(".workspace-drawer.is-open .workspace-nav-row.secondary").count()) === 0) {
      await page
        .locator(".workspace-drawer.is-open .workspace-nav-row")
        .getByRole("button", { name: "Modeling", exact: true })
        .click();
    }
    await page
      .locator(".workspace-drawer.is-open .workspace-nav-row.secondary")
      .getByRole("button", { name: labelBySubScreen[value], exact: true })
      .click();
    await ensureNavigationDrawerClosed();
  };
  const switchScreen = async (value: "modeling" | "analysis") => {
    await ensureNavigationDrawerOpen();
    await page
      .locator(".workspace-drawer.is-open .workspace-nav-row")
      .getByRole("button", { name: value === "modeling" ? "Modeling" : "Analysis", exact: true })
      .click();
    await ensureNavigationDrawerClosed();
  };
  const openCreateFormIfIdle = async (
    idleHeading: "Connector form" | "Splice form" | "Node form" | "Segment form" | "Wire form"
  ) => {
    const createHeadingByIdleHeading = {
      "Connector form": "Create Connector",
      "Splice form": "Create Splice",
      "Node form": "Create Node",
      "Segment form": "Create Segment",
      "Wire form": "Create Wire"
    } as const;
    const listHeadingByIdleHeading = {
      "Connector form": "Connectors",
      "Splice form": "Splices",
      "Node form": "Nodes",
      "Segment form": "Segments",
      "Wire form": "Wires"
    } as const;
    const createHeading = createHeadingByIdleHeading[idleHeading];
    if ((await page.getByRole("heading", { name: createHeading }).count()) > 0) {
      return;
    }

    const idlePanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: idleHeading }) });
    if ((await idlePanel.count()) > 0) {
      await idlePanel.getByRole("button", { name: "Create", exact: true }).click();
      return;
    }

    const listPanel = page.locator("article.panel").filter({
      has: page.getByRole("heading", { name: listHeadingByIdleHeading[idleHeading] })
    });
    await listPanel.getByRole("button", { name: "New", exact: true }).click();
  };

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "e-Plan Editor" })).toBeVisible();
  await dismissOnboardingIfVisible(page);

  await switchSubScreen("connector");
  await openCreateFormIfIdle("Connector form");
  const connectorForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Connector" }) });
  await connectorForm.getByLabel("Functional name").fill("Connector 1");
  await connectorForm.getByLabel("Technical ID").fill("C-1");
  await connectorForm.getByLabel("Way count").fill("2");
  await connectorForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("splice");
  await openCreateFormIfIdle("Splice form");
  const spliceForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Splice" }) });
  await spliceForm.getByLabel("Functional name").fill("Splice 1");
  await spliceForm.getByLabel("Technical ID").fill("S-1");
  await spliceForm.getByLabel("Port count").fill("2");
  await spliceForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("node");
  await openCreateFormIfIdle("Node form");
  const nodeForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Node" }) });
  await nodeForm.getByLabel("Node ID").fill("NODE-MID");
  await nodeForm.getByLabel("Node kind").selectOption("intermediate");
  await nodeForm.getByLabel("Label").fill("MID");
  await nodeForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("segment");
  await openCreateFormIfIdle("Segment form");
  const segmentForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Segment" }) });
  await segmentForm.getByLabel("Segment ID").fill("SEG-A");
  await segmentForm.getByLabel("Node A").selectOption({ label: "Connector 1 (C-1)" });
  await segmentForm.getByLabel("Node B").selectOption({ label: "MID" });
  await segmentForm.getByLabel("Length (mm)").fill("40");
  await segmentForm.getByRole("button", { name: "Create" }).click();

  await openCreateFormIfIdle("Segment form");
  const secondSegmentForm = page.locator("article.panel").filter({
    has: page.getByRole("heading", { name: "Create Segment" })
  });
  await secondSegmentForm.getByLabel("Segment ID").fill("SEG-B");
  await secondSegmentForm.getByLabel("Node A").selectOption({ label: "MID" });
  await secondSegmentForm.getByLabel("Node B").selectOption({ label: "Splice 1 (S-1)" });
  await secondSegmentForm.getByLabel("Length (mm)").fill("60");
  await secondSegmentForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("wire");
  await openCreateFormIfIdle("Wire form");
  const wireForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Wire" }) });
  await wireForm.getByLabel("Functional name").fill("Wire 1");
  await wireForm.getByLabel("Technical ID").fill("W-1");
  await wireForm.locator("fieldset").nth(0).locator("select").nth(1).selectOption({ label: "Connector 1 (C-1)" });
  await wireForm.locator("fieldset").nth(1).locator("select").nth(1).selectOption({ label: "Splice 1 (S-1)" });
  await wireForm.getByRole("button", { name: "Create" }).click();

  const wiresPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Wires" }) });
  const wireRow = wiresPanel.locator("tbody tr").filter({ hasText: "Wire 1" }).first();
  await expect(wireRow).toContainText("100");
  await expect(wireRow).toContainText("Auto");
  await wireRow.click();
  const initialWireLengthRaw = await wireRow.locator("td").nth(5).textContent();
  const initialWireLength = Number(initialWireLengthRaw ?? "0");

  await switchScreen("analysis");
  await switchSubScreen("wire");
  const routeControlPanel = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Wire analysis" }) });
  const routeInputValue = await routeControlPanel.getByLabel("Forced route segment IDs (comma-separated)").inputValue();
  const [routeSegmentToEdit] = routeInputValue
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (routeSegmentToEdit === undefined) {
    throw new Error("Expected at least one route segment to edit in E2E flow.");
  }

  await routeControlPanel.getByRole("button", { name: "Lock forced route" }).click();
  await expect(routeControlPanel).toContainText("Locked route");

  await switchScreen("modeling");
  await switchSubScreen("segment");
  const segmentsPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Segments" }) });
  const targetSegmentRow = segmentsPanel.locator("tbody tr").filter({ hasText: routeSegmentToEdit }).first();
  const targetSegmentLengthRaw = await targetSegmentRow.locator("td").nth(3).textContent();
  const targetSegmentLength = Number(targetSegmentLengthRaw ?? "0");
  const updatedSegmentLength = targetSegmentLength + 40;
  await targetSegmentRow.click();
  await expect(page.getByRole("heading", { name: "Edit Segment" })).toBeVisible();

  const editSegmentForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Edit Segment" }) });
  await editSegmentForm.getByLabel("Length (mm)").fill(String(updatedSegmentLength));
  await editSegmentForm.getByRole("button", { name: "Save" }).click();

  await switchSubScreen("wire");
  const refreshedWireRow = page
    .locator("article.panel")
    .filter({ has: page.getByRole("heading", { name: "Wires" }) })
    .locator("tbody tr")
    .filter({ hasText: "Wire 1" })
    .first();
  await expect(refreshedWireRow.locator("td").nth(5)).toHaveText(String(initialWireLength + 40));
});
