/**
 * Downloads bytes as a file. Content is always delivered as a download and never opened or
 * rendered in the application (supplier attachments may contain active content).
 */
export function downloadBinaryFile(fileName: string, bytes: Uint8Array, mimeType: string): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  const urlFactory = window.URL ?? globalThis.URL;
  if (typeof urlFactory.createObjectURL !== "function" || typeof urlFactory.revokeObjectURL !== "function") {
    return false;
  }
  const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: mimeType });
  const href = urlFactory.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    urlFactory.revokeObjectURL(href);
  }, 0);
  return true;
}
