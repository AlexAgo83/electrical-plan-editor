import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { expect } from "vitest";

export function openExportMenu(panel: HTMLElement): void {
  const exportButton = within(panel).getByRole("button", { name: "Export" });
  if (exportButton.getAttribute("aria-expanded") !== "true") {
    fireEvent.click(exportButton);
  }
}

export function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () =>
      reject(reader.error ?? new Error("Unable to read blob."));
    reader.readAsText(blob);
  });
}

export async function openSvgPreviewAndDownload(
  panel: HTMLElement,
): Promise<HTMLElement> {
  fireEvent.click(within(panel).getByRole("button", { name: "SVG" }));
  const previewDialog = await screen.findByRole("dialog", {
    name: "SVG preview",
  });
  fireEvent.click(
    within(previewDialog).getByRole("button", { name: "Download SVG" }),
  );
  return previewDialog;
}

export async function findBomPreviewDialog(): Promise<HTMLElement> {
  return screen.findByRole("dialog", { name: "BOM preview" });
}

export async function selectBomPreviewSheet(
  previewDialog: HTMLElement,
  sheetName: RegExp,
): Promise<void> {
  fireEvent.click(within(previewDialog).getByRole("tab", { name: sheetName }));

  await waitFor(() => {
    expect(
      within(previewDialog).getByRole("tab", { name: sheetName }),
    ).toHaveAttribute("aria-selected", "true");
  });
  expect(
    within(previewDialog).getByRole("tabpanel", { name: sheetName }),
  ).toBeInTheDocument();
}
