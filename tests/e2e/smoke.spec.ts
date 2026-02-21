import { expect, test } from "@playwright/test";

test("create -> route -> force -> recompute flow works end-to-end", async ({ page }) => {
  test.setTimeout(60_000);
  const switchSubScreen = async (value: "connector" | "splice" | "node" | "segment" | "wire") => {
    const labelBySubScreen = {
      connector: "Connector",
      splice: "Splice",
      node: "Node",
      segment: "Segment",
      wire: "Wire"
    } as const;
    await page
      .locator(".workspace-nav-row.secondary")
      .getByRole("button", { name: labelBySubScreen[value], exact: true })
      .click();
  };
  const switchScreen = async (value: "modeling" | "analysis") => {
    await page
      .locator(".workspace-nav-row")
      .first()
      .getByRole("button", { name: value === "modeling" ? "Modeling" : "Analysis", exact: true })
      .click();
  };

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Electrical Plan Editor" })).toBeVisible();

  await switchSubScreen("connector");
  const connectorForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Connector" }) });
  await connectorForm.getByLabel("Functional name").fill("Connector 1");
  await connectorForm.getByLabel("Technical ID").fill("C-1");
  await connectorForm.getByLabel("Cavity count").fill("2");
  await connectorForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("splice");
  const spliceForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Splice" }) });
  await spliceForm.getByLabel("Functional name").fill("Splice 1");
  await spliceForm.getByLabel("Technical ID").fill("S-1");
  await spliceForm.getByLabel("Port count").fill("2");
  await spliceForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("node");
  const nodeForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Node" }) });
  await nodeForm.getByLabel("Node ID").fill("NODE-C1");
  await nodeForm.getByLabel("Node kind").selectOption("connector");
  await nodeForm.locator("select").nth(1).selectOption({ label: "Connector 1 (C-1)" });
  await nodeForm.getByRole("button", { name: "Create" }).click();

  await nodeForm.getByLabel("Node ID").fill("NODE-MID");
  await nodeForm.getByLabel("Node kind").selectOption("intermediate");
  await nodeForm.getByLabel("Label").fill("MID");
  await nodeForm.getByRole("button", { name: "Create" }).click();

  await nodeForm.getByLabel("Node ID").fill("NODE-S1");
  await nodeForm.getByLabel("Node kind").selectOption("splice");
  await nodeForm.locator("select").nth(1).selectOption({ label: "Splice 1 (S-1)" });
  await nodeForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("segment");
  const segmentForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Segment" }) });
  await segmentForm.getByLabel("Segment ID").fill("SEG-A");
  await segmentForm.getByLabel("Node A").selectOption({ label: "Connector: Connector 1 (C-1)" });
  await segmentForm.getByLabel("Node B").selectOption({ label: "Intermediate: MID" });
  await segmentForm.getByLabel("Length (mm)").fill("40");
  await segmentForm.getByRole("button", { name: "Create" }).click();

  await segmentForm.getByLabel("Segment ID").fill("SEG-B");
  await segmentForm.getByLabel("Node A").selectOption({ label: "Intermediate: MID" });
  await segmentForm.getByLabel("Node B").selectOption({ label: "Splice: Splice 1 (S-1)" });
  await segmentForm.getByLabel("Length (mm)").fill("60");
  await segmentForm.getByRole("button", { name: "Create" }).click();

  await switchSubScreen("wire");
  const wireForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Create Wire" }) });
  await wireForm.getByLabel("Functional name").fill("Wire 1");
  await wireForm.getByLabel("Technical ID").fill("W-1");
  await wireForm.locator("fieldset").nth(0).locator("select").nth(1).selectOption({ label: "Connector 1 (C-1)" });
  await wireForm.locator("fieldset").nth(1).locator("select").nth(1).selectOption({ label: "Splice 1 (S-1)" });
  await wireForm.getByRole("button", { name: "Create" }).click();

  const wiresPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Wires" }) });
  const wireRow = wiresPanel.locator("tbody tr").first();
  await expect(wireRow).toContainText("100");
  await expect(wireRow).toContainText("Auto");
  await wireRow.getByRole("button", { name: "Select" }).click();
  const initialWireLengthRaw = await wireRow.locator("td").nth(3).textContent();
  const initialWireLength = Number(initialWireLengthRaw ?? "0");

  await switchScreen("analysis");
  await switchSubScreen("wire");
  const routeControlPanel = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Wire route control" }) });
  await routeControlPanel.getByRole("button", { name: "Lock forced route" }).click();
  await expect(routeControlPanel).toContainText("Locked");
  const currentRouteLine = await routeControlPanel.getByText(/^Current route:/).textContent();
  const [routeSegmentToEdit] = (currentRouteLine ?? "")
    .replace("Current route:", "")
    .split("->")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (routeSegmentToEdit === undefined) {
    throw new Error("Expected at least one route segment to edit in E2E flow.");
  }

  await switchScreen("modeling");
  await switchSubScreen("segment");
  const segmentsPanel = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Segments" }) });
  const targetSegmentRow = segmentsPanel.locator("tbody tr").filter({ hasText: routeSegmentToEdit }).first();
  const targetSegmentLengthRaw = await targetSegmentRow.locator("td").nth(3).textContent();
  const targetSegmentLength = Number(targetSegmentLengthRaw ?? "0");
  const updatedSegmentLength = targetSegmentLength + 40;
  const editTargetSegmentButton = targetSegmentRow.getByRole("button", { name: "Edit" });
  await editTargetSegmentButton.evaluate((button) => {
    (button as HTMLButtonElement).click();
  });
  await expect(page.getByRole("heading", { name: "Edit Segment" })).toBeVisible();

  const editSegmentForm = page.locator("article.panel").filter({ has: page.getByRole("heading", { name: "Edit Segment" }) });
  await editSegmentForm.getByLabel("Length (mm)").fill(String(updatedSegmentLength));
  await editSegmentForm.getByRole("button", { name: "Save" }).click();

  await switchSubScreen("wire");
  const refreshedWireRow = page
    .locator("article.panel")
    .filter({ has: page.getByRole("heading", { name: "Wires" }) })
    .locator("tbody tr")
    .first();
  await expect(refreshedWireRow.locator("td").nth(3)).toHaveText(String(initialWireLength + 40));
});
