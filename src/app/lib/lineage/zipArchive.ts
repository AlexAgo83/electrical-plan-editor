/**
 * Minimal ZIP reader/writer for portable lineage packages.
 *
 * Bundle-size assessment: implemented in-house (~250 lines, no dependency) instead of JSZip or
 * fflate. Compression uses the platform CompressionStream("deflate-raw") when available and falls
 * back to STORE. Decompression enforces entry count, per-entry, total and ratio limits on the
 * actual decoded byte stream, so forged size metadata cannot bypass them. ZIP64, encryption and
 * multi-disk archives are rejected.
 */
import { LINEAGE_LIMITS, type LineageLimits } from "./lineageLimits";

export interface ZipEntryInput {
  path: string;
  bytes: Uint8Array;
}

export interface ZipEntry {
  path: string;
  bytes: Uint8Array;
}

export class ZipArchiveError extends Error {
  readonly code: "malformed" | "unsupported" | "limit-exceeded";

  constructor(code: "malformed" | "unsupported" | "limit-exceeded", message: string) {
    super(message);
    this.name = "ZipArchiveError";
    this.code = code;
  }
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = (CRC_TABLE[(crc ^ (bytes[index] ?? 0)) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function hasDeflateRawStreams(): boolean {
  if (typeof CompressionStream !== "function" || typeof DecompressionStream !== "function") {
    return false;
  }
  try {
    new CompressionStream("deflate-raw");
    return true;
  } catch {
    return false;
  }
}

async function collectStream(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new ZipArchiveError("limit-exceeded", "Archive entry exceeds the decoded size limit.");
    }
    chunks.push(value);
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function streamFromBytes(bytes: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    }
  });
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  return collectStream(
    streamFromBytes(bytes).pipeThrough(new CompressionStream("deflate-raw") as unknown as ReadableWritablePair<Uint8Array, Uint8Array>),
    Number.MAX_SAFE_INTEGER
  );
}

async function inflateRaw(bytes: Uint8Array, limit: number): Promise<Uint8Array> {
  try {
    return await collectStream(
      streamFromBytes(bytes).pipeThrough(new DecompressionStream("deflate-raw") as unknown as ReadableWritablePair<Uint8Array, Uint8Array>),
      limit
    );
  } catch (error) {
    if (error instanceof ZipArchiveError) {
      throw error;
    }
    throw new ZipArchiveError("malformed", "Archive entry could not be decompressed.");
  }
}

const DOS_DATE_1980 = (0 << 9) | (1 << 5) | 1;

export async function createZipArchive(entries: readonly ZipEntryInput[], options: { compress?: boolean } = {}): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const compress = (options.compress ?? true) && hasDeflateRawStreams();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const crc = crc32(entry.bytes);
    let method = 0;
    let data = entry.bytes;
    if (compress && entry.bytes.byteLength > 64) {
      const deflated = await deflateRaw(entry.bytes);
      if (deflated.byteLength < entry.bytes.byteLength) {
        method = 8;
        data = deflated;
      }
    }
    const local = new Uint8Array(30 + name.byteLength);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, method, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, DOS_DATE_1980, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.byteLength, true);
    localView.setUint32(22, entry.bytes.byteLength, true);
    localView.setUint16(26, name.byteLength, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.byteLength);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, method, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, DOS_DATE_1980, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.byteLength, true);
    centralView.setUint32(24, entry.bytes.byteLength, true);
    centralView.setUint16(28, name.byteLength, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.byteLength + data.byteLength;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  const total = offset + centralSize + end.byteLength;
  const archive = new Uint8Array(total);
  let cursor = 0;
  for (const part of [...localParts, ...centralParts, end]) {
    archive.set(part, cursor);
    cursor += part.byteLength;
  }
  return archive;
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimum = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let position = view.byteLength - 22; position >= minimum; position -= 1) {
    if (view.getUint32(position, true) === 0x06054b50) {
      return position;
    }
  }
  throw new ZipArchiveError("malformed", "File is not a ZIP archive.");
}

/** Reads every file entry, enforcing limits on decoded bytes. Directory entries are skipped. */
export async function readZipArchive(archive: Uint8Array, limits: LineageLimits = { ...LINEAGE_LIMITS }): Promise<ZipEntry[]> {
  if (archive.byteLength < 22) {
    throw new ZipArchiveError("malformed", "File is not a ZIP archive.");
  }
  const view = new DataView(archive.buffer, archive.byteOffset, archive.byteLength);
  const endOffset = findEndOfCentralDirectory(view);
  if (view.getUint16(endOffset + 4, true) !== 0 || view.getUint16(endOffset + 6, true) !== 0) {
    throw new ZipArchiveError("unsupported", "Multi-disk ZIP archives are not supported.");
  }
  const entryCount = view.getUint16(endOffset + 10, true);
  const centralSize = view.getUint32(endOffset + 12, true);
  const centralOffset = view.getUint32(endOffset + 16, true);
  if (entryCount === 0xffff || centralOffset === 0xffffffff) {
    throw new ZipArchiveError("unsupported", "ZIP64 archives are not supported.");
  }
  if (entryCount > limits.maxEntries) {
    throw new ZipArchiveError("limit-exceeded", `Archive contains more than ${limits.maxEntries} entries.`);
  }
  if (centralOffset + centralSize > endOffset) {
    throw new ZipArchiveError("malformed", "ZIP central directory is out of bounds.");
  }
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const entries: ZipEntry[] = [];
  let cursor = centralOffset;
  let totalDecoded = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > endOffset || view.getUint32(cursor, true) !== 0x02014b50) {
      throw new ZipArchiveError("malformed", "ZIP central directory entry is malformed.");
    }
    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const crc = view.getUint32(cursor + 16, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const declaredSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const path = decoder.decode(archive.subarray(cursor + 46, cursor + 46 + nameLength));
    cursor += 46 + nameLength + extraLength + commentLength;
    if ((flags & 0x1) !== 0) {
      throw new ZipArchiveError("unsupported", "Encrypted ZIP entries are not supported.");
    }
    if (path.endsWith("/")) {
      continue;
    }
    if (method !== 0 && method !== 8) {
      throw new ZipArchiveError("unsupported", `Unsupported ZIP compression method ${method}.`);
    }
    if (localOffset + 30 > archive.byteLength || view.getUint32(localOffset, true) !== 0x04034b50) {
      throw new ZipArchiveError("malformed", "ZIP local header is malformed.");
    }
    const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
    if (dataStart + compressedSize > archive.byteLength) {
      throw new ZipArchiveError("malformed", "ZIP entry data is out of bounds.");
    }
    if (declaredSize > limits.maxAttachmentBytes || totalDecoded + declaredSize > limits.maxTotalUncompressedBytes) {
      throw new ZipArchiveError("limit-exceeded", `Archive entry exceeds size limits: ${path}`);
    }
    const compressed = archive.subarray(dataStart, dataStart + compressedSize);
    const entryLimit = Math.min(
      limits.maxAttachmentBytes,
      limits.maxTotalUncompressedBytes - totalDecoded,
      Math.max(compressedSize, 1) * limits.maxCompressionRatio
    );
    let bytes: Uint8Array;
    if (method === 0) {
      if (compressedSize > entryLimit) {
        throw new ZipArchiveError("limit-exceeded", `Archive entry exceeds size limits: ${path}`);
      }
      bytes = compressed.slice();
    } else {
      if (!hasDeflateRawStreams()) {
        throw new ZipArchiveError("unsupported", "This browser cannot decompress ZIP entries.");
      }
      bytes = await inflateRaw(compressed, entryLimit);
    }
    if (bytes.byteLength !== declaredSize || crc32(bytes) !== crc) {
      throw new ZipArchiveError("malformed", `Archive entry failed its integrity check: ${path}`);
    }
    totalDecoded += bytes.byteLength;
    entries.push({ path, bytes });
  }
  return entries;
}
