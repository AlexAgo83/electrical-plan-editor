import { describe, expect, it } from "vitest";
import { buildImagePdfBlob } from "../app/lib/pdfExport";

describe("buildImagePdfBlob", () => {
  it("creates a free-size PDF with one image object per page", async () => {
    const jpegDataUrl = "data:image/jpeg;base64,/9j/2w==";
    const blob = buildImagePdfBlob([
      { width: 320, height: 180, imageWidth: 1280, imageHeight: 720, jpegDataUrl },
      { width: 640, height: 360, jpegDataUrl }
    ]);

    expect(blob.type).toBe("application/pdf");
    const text = await blob.text();
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/Count 2");
    expect(text).toContain("/MediaBox [0 0 320 180]");
    expect(text).toContain("/Width 1280 /Height 720");
    expect(text).toContain("/MediaBox [0 0 640 360]");
    expect(text.match(/\/Subtype \/Image/g)).toHaveLength(2);
  });
});
