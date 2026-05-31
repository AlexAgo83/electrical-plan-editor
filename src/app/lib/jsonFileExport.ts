import type { NetworkExportScope } from "../../adapters/portability";

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function toFilesystemSafeTimestamp(exportedAtIso: string): string {
  const exportedAt = new Date(exportedAtIso);
  if (Number.isNaN(exportedAt.getTime())) {
    const withoutMilliseconds = exportedAtIso.replace(/\.\d{3}(?=Z$)/, "");
    return withoutMilliseconds.replace(/[:.]/g, "-").replace("T", "_").replace(/Z$/i, "");
  }

  const year = exportedAt.getFullYear();
  const month = pad2(exportedAt.getMonth() + 1);
  const day = pad2(exportedAt.getDate());
  const hour = pad2(exportedAt.getHours());
  const minute = pad2(exportedAt.getMinutes());
  const second = pad2(exportedAt.getSeconds());
  return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}

export function buildNetworkExportFilename(scope: NetworkExportScope, exportedAtIso: string): string {
  return `electrical-network-${scope}-${toFilesystemSafeTimestamp(exportedAtIso)}.json`;
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
