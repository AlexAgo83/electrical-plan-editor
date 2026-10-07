/**
 * Minimal virtual directory used by lineage repositories. Folder (File System Access),
 * browser (IndexedDB) and in-memory/ZIP storages implement the same contract so the
 * commit protocol is written once. Paths are POSIX-style and relative to the lineage root.
 */
export interface LineageDirectory {
  readonly kind: "folder" | "browser" | "memory";
  readonly label: string;
  /** Returns `null` when the file does not exist. */
  readFile(path: string): Promise<Uint8Array | null>;
  writeFile(path: string, bytes: Uint8Array): Promise<void>;
  /** Lists every file path below the root. */
  listFiles(): Promise<string[]>;
  removeFile(path: string): Promise<void>;
}

export class MemoryLineageDirectory implements LineageDirectory {
  readonly kind = "memory" as const;
  readonly label: string;
  private readonly files = new Map<string, Uint8Array>();

  constructor(label = "memory", initialFiles?: Iterable<readonly [string, Uint8Array]>) {
    this.label = label;
    if (initialFiles !== undefined) {
      for (const [path, bytes] of initialFiles) {
        this.files.set(path, bytes.slice());
      }
    }
  }

  readFile(path: string): Promise<Uint8Array | null> {
    const bytes = this.files.get(path);
    return Promise.resolve(bytes === undefined ? null : bytes.slice());
  }

  writeFile(path: string, bytes: Uint8Array): Promise<void> {
    this.files.set(path, bytes.slice());
    return Promise.resolve();
  }

  listFiles(): Promise<string[]> {
    return Promise.resolve([...this.files.keys()].sort());
  }

  removeFile(path: string): Promise<void> {
    this.files.delete(path);
    return Promise.resolve();
  }

  snapshot(): Map<string, Uint8Array> {
    return new Map([...this.files].map(([path, bytes]) => [path, bytes.slice()]));
  }
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: false });

export function encodeText(value: string): Uint8Array {
  return textEncoder.encode(value);
}

export function decodeText(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

export function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === undefined) {
    throw new Error("SHA-256 is unavailable in this browser context.");
  }
  const digest = await subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}
