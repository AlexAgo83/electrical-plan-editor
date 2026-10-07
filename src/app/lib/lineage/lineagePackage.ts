/**
 * Portable lineage packages (ZIP). A package contains exactly one lineage root folder with the same
 * layout as a folder copy. Everything is validated before any registry activation: paths, schema,
 * declared digests, ownership references, required working payload and decoded size limits.
 */
import { parseWorkspaceFilePayload, type WorkspaceFilePayload } from "../workspaceFile";
import { decodeText, sha256Hex, type LineageDirectory } from "./lineageDirectory";
import {
  LINEAGE_MANIFEST_FILE_NAME,
  parseHandoffRecord,
  parseLineageManifest,
  type LineageManifest
} from "./lineageFormat";
import { LINEAGE_LIMITS, type LineageLimits } from "./lineageLimits";
import { createZipArchive, readZipArchive, ZipArchiveError } from "./zipArchive";

export interface ValidatedLineagePackage {
  manifest: LineageManifest;
  working: WorkspaceFilePayload;
  files: Map<string, Uint8Array>;
}

export type LineagePackageErrorCode =
  | "not-zip"
  | "unsafe-path"
  | "duplicate-path"
  | "multiple-roots"
  | "missing-manifest"
  | "future-schema"
  | "malformed"
  | "missing-working"
  | "foreign-file"
  | "missing-file"
  | "digest-mismatch"
  | "limit-exceeded";

export type LineagePackageReadResult =
  | { ok: true; package: ValidatedLineagePackage }
  | { ok: false; code: LineagePackageErrorCode; message: string };

/** Returns the normalized relative path, or `null` when the path is unsafe. */
export function normalizeArchivePath(rawPath: string): string | null {
  if (rawPath.length === 0 || rawPath.includes("\0")) {
    return null;
  }
  const slashed = rawPath.replace(/\\/g, "/");
  if (slashed.startsWith("/") || /^[A-Za-z]:/.test(slashed)) {
    return null;
  }
  const segments = slashed.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    return null;
  }
  return segments.join("/");
}

export async function exportLineagePackage(directory: LineageDirectory, rootName: string): Promise<Uint8Array> {
  const entries = [];
  for (const path of await directory.listFiles()) {
    const bytes = await directory.readFile(path);
    if (bytes !== null) {
      entries.push({ path: `${rootName}/${path}`, bytes });
    }
  }
  return createZipArchive(entries);
}

function fail(code: LineagePackageErrorCode, message: string): LineagePackageReadResult {
  return { ok: false, code, message };
}

/** Validates a lineage file set (from a ZIP or folder copy) without writing anything. */
export async function validateLineageFiles(files: Map<string, Uint8Array>, limits: LineageLimits = { ...LINEAGE_LIMITS }): Promise<LineagePackageReadResult> {
  const manifestBytes = files.get(LINEAGE_MANIFEST_FILE_NAME);
  if (manifestBytes === undefined) {
    return fail("missing-manifest", "The package does not contain a workspace manifest.");
  }
  const parsedManifest = parseLineageManifest(decodeText(manifestBytes));
  if (!parsedManifest.ok) {
    return fail(parsedManifest.errorKind === "future-schema" ? "future-schema" : "malformed", parsedManifest.error);
  }
  const manifest = parsedManifest.manifest;
  const workingBytes = files.get(manifest.workingFileName);
  if (workingBytes === undefined) {
    return fail("missing-working", "The package does not contain the working copy declared by its manifest.");
  }
  const working = parseWorkspaceFilePayload(decodeText(workingBytes));
  if (working.payload === null) {
    return fail(working.errorKind === "future-schema" ? "future-schema" : "malformed", working.error ?? "Working copy is unreadable.");
  }
  if (working.payload.workspaceId !== manifest.workspaceId) {
    return fail("foreign-file", "The working copy belongs to a different workspace than the manifest.");
  }
  for (const version of manifest.versions) {
    const bytes = files.get(version.fileName);
    if (bytes === undefined) {
      return fail("missing-file", `Version file is missing from the package: ${version.fileName}`);
    }
    if ((await sha256Hex(bytes)) !== version.contentDigest) {
      return fail("digest-mismatch", `Version file does not match its recorded digest: ${version.fileName}`);
    }
    const parsed = parseWorkspaceFilePayload(decodeText(bytes));
    if (parsed.payload === null) {
      return fail(parsed.errorKind === "future-schema" ? "future-schema" : "malformed", `Version file is unreadable: ${version.fileName}`);
    }
    if (parsed.payload.workspaceId !== manifest.workspaceId || parsed.payload.version?.versionId !== version.versionId) {
      return fail("foreign-file", `Version file identity does not match the manifest: ${version.fileName}`);
    }
  }
  for (const handoff of manifest.handoffs) {
    const recordBytes = files.get(handoff.recordPath);
    if (recordBytes === undefined) {
      return fail("missing-file", `Handoff record is missing from the package: ${handoff.recordPath}`);
    }
    if (handoff.recordDigest.length > 0 && (await sha256Hex(recordBytes)) !== handoff.recordDigest) {
      return fail("digest-mismatch", `Handoff record does not match its recorded digest: ${handoff.recordPath}`);
    }
    const record = parseHandoffRecord(decodeText(recordBytes));
    if (record === null || record.handoffId !== handoff.handoffId || record.workspaceId !== manifest.workspaceId) {
      return fail("malformed", `Handoff record is unreadable or belongs elsewhere: ${handoff.recordPath}`);
    }
    for (const attachment of record.attachments) {
      if (normalizeArchivePath(attachment.storagePath) !== attachment.storagePath || !attachment.storagePath.startsWith(`Handoffs/${handoff.handoffId}/`)) {
        return fail("unsafe-path", `Handoff attachment path is unsafe: ${attachment.storagePath}`);
      }
      if (attachment.byteLength > limits.maxAttachmentBytes) {
        return fail("limit-exceeded", `Handoff attachment exceeds the size limit: ${attachment.originalFileName}`);
      }
      const bytes = files.get(attachment.storagePath);
      if (bytes === undefined) {
        return fail("missing-file", `Handoff attachment is missing from the package: ${attachment.originalFileName}`);
      }
      if ((await sha256Hex(bytes)) !== attachment.sha256) {
        return fail("digest-mismatch", `Handoff attachment does not match its recorded digest: ${attachment.originalFileName}`);
      }
    }
  }
  return { ok: true, package: { manifest, working: working.payload, files } };
}

export async function readLineagePackage(archive: Uint8Array, limits: LineageLimits = { ...LINEAGE_LIMITS }): Promise<LineagePackageReadResult> {
  let entries;
  try {
    entries = await readZipArchive(archive, limits);
  } catch (error) {
    if (error instanceof ZipArchiveError) {
      return fail(error.code === "limit-exceeded" ? "limit-exceeded" : "not-zip", error.message);
    }
    return fail("not-zip", "The package could not be read as a ZIP archive.");
  }
  const normalized: Array<{ path: string; bytes: Uint8Array }> = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const path = normalizeArchivePath(entry.path);
    if (path === null) {
      return fail("unsafe-path", `Unsafe path in package: ${entry.path}`);
    }
    const key = path.toLowerCase();
    if (seen.has(key)) {
      return fail("duplicate-path", `Duplicate path in package: ${entry.path}`);
    }
    seen.add(key);
    normalized.push({ path, bytes: entry.bytes });
  }
  const files = new Map<string, Uint8Array>();
  const hasRootManifest = normalized.some((entry) => entry.path === LINEAGE_MANIFEST_FILE_NAME);
  if (hasRootManifest) {
    for (const entry of normalized) {
      files.set(entry.path, entry.bytes);
    }
  } else {
    const roots = new Set(normalized.map((entry) => entry.path.split("/")[0]));
    if (roots.size !== 1 || normalized.some((entry) => !entry.path.includes("/"))) {
      return fail(roots.size > 1 ? "multiple-roots" : "missing-manifest", "A package must contain exactly one workspace folder.");
    }
    for (const entry of normalized) {
      files.set(entry.path.slice(entry.path.indexOf("/") + 1), entry.bytes);
    }
  }
  return validateLineageFiles(files, limits);
}
