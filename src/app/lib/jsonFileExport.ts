import type { NetworkExportScope } from "../../adapters/portability";
import { buildTimestampedFileName, normalizeFileNamePart } from "./exportFileName";

interface BuildNetworkExportFilenameOptions {
  networkName?: string;
  networkTechnicalId?: string;
  networkCount?: number;
}

export function buildNetworkExportFilename(
  scope: NetworkExportScope,
  exportedAtIso: string,
  options?: BuildNetworkExportFilenameOptions
): string {
  if (options?.networkName !== undefined || options?.networkTechnicalId !== undefined) {
    return buildTimestampedFileName(
      ["electrical-network", options.networkName, options.networkTechnicalId],
      "json",
      exportedAtIso,
      "electrical-network"
    );
  }

  if (scope === "all" || (options?.networkCount ?? 0) > 1) {
    return buildTimestampedFileName(
      ["electrical-networks", options?.networkCount !== undefined ? `${options.networkCount}-items` : scope],
      "json",
      exportedAtIso,
      "electrical-networks"
    );
  }

  return buildTimestampedFileName(
    ["electrical-network", normalizeFileNamePart(scope) ?? scope],
    "json",
    exportedAtIso,
    "electrical-network"
  );
}

export function downloadJsonFile(fileName: string, content: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const blob = new Blob([content], {
    type: "application/json"
  });
  const urlFactory = window.URL ?? globalThis.URL;
  if (typeof urlFactory.createObjectURL !== "function" || typeof urlFactory.revokeObjectURL !== "function") {
    return false;
  }

  const href = urlFactory.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  window.setTimeout(() => {
    urlFactory.revokeObjectURL(href);
  }, 0);
  return true;
}

type SaveFilePickerOptions = {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

type SaveFilePickerHandle = {
  createWritable: () => Promise<{
    write: (content: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

function resolveSaveFilePicker(): ((options: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>) | null {
  if (typeof window === "undefined") {
    return null;
  }

  const candidate: unknown = (
    window as Window & {
      showSaveFilePicker?: unknown;
    }
  ).showSaveFilePicker;

  return typeof candidate === "function"
    ? (candidate as (options: SaveFilePickerOptions) => Promise<SaveFilePickerHandle>)
    : null;
}

export function supportsNativeSaveFilePicker(): boolean {
  return resolveSaveFilePicker() !== null;
}

export async function saveJsonFileWithPicker(
  fileName: string,
  content: string
): Promise<"saved" | "cancelled" | "unavailable" | "failed"> {
  const saveFilePicker = resolveSaveFilePicker();
  if (saveFilePicker === null) {
    return "unavailable";
  }

  try {
    const fileHandle = await saveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: "JSON file",
          accept: { "application/json": [".json"] }
        }
      ]
    });
    const writable = await fileHandle.createWritable();
    await writable.write(new Blob([content], { type: "application/json" }));
    await writable.close();
    return "saved";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }

    return "failed";
  }
}

export async function exportJsonFile(fileName: string, content: string): Promise<"saved" | "cancelled" | "failed"> {
  const pickerResult = await saveJsonFileWithPicker(fileName, content);
  if (pickerResult === "saved" || pickerResult === "cancelled") {
    return pickerResult;
  }

  return downloadJsonFile(fileName, content) ? "saved" : "failed";
}
