import { MemoryLineageDirectory, type LineageDirectory } from "../../app/lib/lineage/lineageDirectory";

/** Directory wrapper that fails selected writes, simulating interrupted or revoked storage. */
export class FaultyLineageDirectory implements LineageDirectory {
  readonly kind = "memory" as const;
  readonly label = "faulty";
  readonly inner: MemoryLineageDirectory;
  private failures: Array<{ match: (path: string) => boolean; remaining: number; corrupt: boolean }> = [];

  constructor(inner: MemoryLineageDirectory = new MemoryLineageDirectory()) {
    this.inner = inner;
  }

  /** Fails the next `count` writes whose path matches; `corrupt` writes truncated bytes instead of throwing. */
  failWrites(match: (path: string) => boolean, options: { count?: number; corrupt?: boolean } = {}): void {
    this.failures.push({ match, remaining: options.count ?? 1, corrupt: options.corrupt ?? false });
  }

  readFile(path: string): Promise<Uint8Array | null> {
    return this.inner.readFile(path);
  }

  async writeFile(path: string, bytes: Uint8Array): Promise<void> {
    const failure = this.failures.find((entry) => entry.remaining > 0 && entry.match(path));
    if (failure !== undefined) {
      failure.remaining -= 1;
      if (failure.corrupt) {
        await this.inner.writeFile(path, bytes.slice(0, Math.floor(bytes.byteLength / 2)));
        return;
      }
      throw new DOMException("Injected write failure", "NotAllowedError");
    }
    await this.inner.writeFile(path, bytes);
  }

  listFiles(): Promise<string[]> {
    return this.inner.listFiles();
  }

  removeFile(path: string): Promise<void> {
    return this.inner.removeFile(path);
  }
}

let clock = Date.parse("2026-10-01T08:00:00.000Z");

export function createTestClock(startIso = "2026-10-01T08:00:00.000Z"): () => string {
  clock = Date.parse(startIso);
  return () => {
    clock += 1000;
    return new Date(clock).toISOString();
  };
}
