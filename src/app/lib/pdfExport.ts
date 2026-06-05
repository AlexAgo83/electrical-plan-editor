export interface PdfImagePage {
  width: number;
  height: number;
  imageWidth?: number;
  imageHeight?: number;
  jpegDataUrl: string;
}

function bytesFromBase64(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  throw new Error("Base64 decoding is not available in this environment.");
}

function bytesFromJpegDataUrl(dataUrl: string): Uint8Array {
  const marker = "base64,";
  const markerIndex = dataUrl.indexOf(marker);
  if (!dataUrl.startsWith("data:image/jpeg") || markerIndex === -1) {
    throw new Error("PDF export expects JPEG data URLs.");
  }
  return bytesFromBase64(dataUrl.slice(markerIndex + marker.length));
}

function arrayBufferFromBytes(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function normalizePdfDimension(value: number): number {
  return Math.max(1, Math.round(Number.isFinite(value) ? value : 1));
}

export function buildImagePdfBlob(pages: readonly PdfImagePage[]): Blob {
  if (pages.length === 0) {
    throw new Error("PDF export requires at least one page.");
  }

  const objects: BlobPart[][] = [];
  const pageObjectIds: number[] = [];
  let nextObjectId = 3;

  for (const page of pages) {
    const width = normalizePdfDimension(page.width);
    const height = normalizePdfDimension(page.height);
    const imageWidth = normalizePdfDimension(page.imageWidth ?? width);
    const imageHeight = normalizePdfDimension(page.imageHeight ?? height);
    const pageObjectId = nextObjectId;
    const imageObjectId = nextObjectId + 1;
    const contentObjectId = nextObjectId + 2;
    nextObjectId += 3;
    pageObjectIds.push(pageObjectId);

    const imageBytes = bytesFromJpegDataUrl(page.jpegDataUrl);
    const imageBuffer = arrayBufferFromBytes(imageBytes);
    const content = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;

    objects.push([
      `${pageObjectId} 0 obj\n`,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>\n`,
      "endobj\n"
    ]);
    objects.push([
      `${imageObjectId} 0 obj\n`,
      `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.byteLength} >>\n`,
      "stream\n",
      imageBuffer,
      "\nendstream\nendobj\n"
    ]);
    objects.push([
      `${contentObjectId} 0 obj\n`,
      `<< /Length ${content.length} >>\nstream\n`,
      content,
      "endstream\nendobj\n"
    ]);
  }

  const catalogObject: BlobPart[] = ["1 0 obj\n", "<< /Type /Catalog /Pages 2 0 R >>\n", "endobj\n"];
  const pagesObject: BlobPart[] = [
    "2 0 obj\n",
    `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>\n`,
    "endobj\n"
  ];
  const allObjects = [catalogObject, pagesObject, ...objects];

  const parts: BlobPart[] = [];
  const offsets: number[] = [0];
  let byteOffset = 0;
  const appendPart = (part: BlobPart): void => {
    parts.push(part);
    if (typeof part === "string") {
      byteOffset += new TextEncoder().encode(part).byteLength;
    } else if (part instanceof ArrayBuffer) {
      byteOffset += part.byteLength;
    } else if (ArrayBuffer.isView(part)) {
      byteOffset += part.byteLength;
    } else if (part instanceof Blob) {
      byteOffset += part.size;
    }
  };
  appendPart("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  for (const objectParts of allObjects) {
    offsets.push(byteOffset);
    objectParts.forEach(appendPart);
  }

  const xrefOffset = byteOffset;
  appendPart(`xref\n0 ${allObjects.length + 1}\n`);
  appendPart("0000000000 65535 f \n");
  for (const offset of offsets.slice(1)) {
    appendPart(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }
  appendPart(`trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(parts, { type: "application/pdf" });
}

export function downloadPdfBlob(fileName: string, blob: Blob): void {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    return;
  }
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 0);
}
