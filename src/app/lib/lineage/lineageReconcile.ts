/**
 * Reconciliation of an incoming copy of a known lineage (ZIP import or folder copy).
 *
 * Identity is decided by immutable IDs, content digests and recorded ancestry, never by
 * timestamps or display numbers:
 * - identical objects are deduplicated (import is idempotent);
 * - same ID with different content is quarantined under Recovery/quarantine and reported;
 * - new versions/handoffs are added with their original numbers (collisions stay visible);
 * - the working copy fast-forwards only when the local revision is a proven ancestor; an older
 *   copy never replaces newer state; otherwise the incoming head is kept as a divergent head that
 *   requires an explicit continuation choice. Model entities are never merged.
 */
import { createPortableId, parseWorkspaceFilePayload, type WorkspaceFilePayload } from "../workspaceFile";
import { decodeText, sha256Hex } from "./lineageDirectory";
import { RECOVERY_DIRECTORY, shortId, type LineageDivergentHead, type LineageRecoveryEntry } from "./lineageFormat";
import type { ValidatedLineagePackage } from "./lineagePackage";
import { LineageError, writeVerifiedFile, type LineageRepository } from "./lineageRepository";

export type WorkingReconcileOutcome = "same" | "fast-forward" | "kept-local" | "divergent" | "already-recorded";

export interface LineageReconcileReport {
  addedVersionIds: string[];
  duplicateVersionIds: string[];
  quarantinedVersionIds: string[];
  addedHandoffIds: string[];
  duplicateHandoffIds: string[];
  quarantinedHandoffIds: string[];
  working: WorkingReconcileOutcome;
  divergentHeadIds: string[];
}

function uniqueFileName(fileName: string, taken: Set<string>, digest: string): string {
  if (!taken.has(fileName)) {
    return fileName;
  }
  const suffix = `-dup-${digest.slice(0, 8)}`;
  return fileName.endsWith(".epe.json") ? fileName.replace(/\.epe\.json$/, `${suffix}.epe.json`) : `${fileName}${suffix}`;
}

function isAncestor(candidateRevision: string, descendant: WorkspaceFilePayload): boolean {
  return descendant.working?.ancestorRevisionIds.includes(candidateRevision) ?? false;
}

export async function reconcileLineagePackage(
  repository: LineageRepository,
  incoming: ValidatedLineagePackage,
  sourceLabel: string
): Promise<LineageReconcileReport> {
  return repository.runExclusive(async ({ readManifestForWrite, publishManifest, replaceWorking }) => {
    const manifest = await readManifestForWrite();
    if (manifest.workspaceId !== incoming.manifest.workspaceId) {
      throw new LineageError("invalid-input", "The package belongs to a different workspace.");
    }
    const directory = repository.directory;
    const report: LineageReconcileReport = {
      addedVersionIds: [],
      duplicateVersionIds: [],
      quarantinedVersionIds: [],
      addedHandoffIds: [],
      duplicateHandoffIds: [],
      quarantinedHandoffIds: [],
      working: "same",
      divergentHeadIds: []
    };
    const nowIso = new Date().toISOString();
    const takenPaths = new Set(await directory.listFiles());
    const versions = [...manifest.versions];
    const handoffs = [...manifest.handoffs];
    const recovery = [...manifest.recovery];
    const divergentHeads: LineageDivergentHead[] = [...manifest.divergentHeads];

    const quarantine = async (bytes: Uint8Array, label: string, digest: string, note: string): Promise<void> => {
      const fileName = `${RECOVERY_DIRECTORY}/quarantine/${label}-${digest.slice(0, 8)}.json`;
      if (!takenPaths.has(fileName)) {
        await writeVerifiedFile(directory, fileName, bytes);
        takenPaths.add(fileName);
        recovery.push({ recoveryId: createPortableId("recovery"), kind: "quarantine", fileName, createdAtIso: nowIso, note });
      }
    };

    for (const version of incoming.manifest.versions) {
      const bytes = incoming.files.get(version.fileName);
      if (bytes === undefined) {
        continue;
      }
      const local = versions.find((entry) => entry.versionId === version.versionId);
      if (local !== undefined) {
        if (local.contentDigest === version.contentDigest) {
          report.duplicateVersionIds.push(version.versionId);
        } else {
          report.quarantinedVersionIds.push(version.versionId);
          await quarantine(bytes, version.versionId, version.contentDigest, `Same version ID with different content from ${sourceLabel}`);
        }
        continue;
      }
      const fileName = uniqueFileName(version.fileName, takenPaths, version.contentDigest);
      await writeVerifiedFile(directory, fileName, bytes);
      takenPaths.add(fileName);
      versions.push({ ...version, fileName });
      report.addedVersionIds.push(version.versionId);
    }

    for (const handoff of incoming.manifest.handoffs) {
      const local = handoffs.find((entry) => entry.handoffId === handoff.handoffId);
      const recordBytes = incoming.files.get(handoff.recordPath);
      if (recordBytes === undefined) {
        continue;
      }
      if (local !== undefined) {
        if (local.recordDigest === handoff.recordDigest) {
          report.duplicateHandoffIds.push(handoff.handoffId);
        } else {
          report.quarantinedHandoffIds.push(handoff.handoffId);
          await quarantine(recordBytes, handoff.handoffId, await sha256Hex(recordBytes), `Same handoff ID with different content from ${sourceLabel}`);
        }
        continue;
      }
      if (!versions.some((version) => version.versionId === handoff.versionId)) {
        report.quarantinedHandoffIds.push(handoff.handoffId);
        continue;
      }
      const prefix = `Handoffs/${handoff.handoffId}/`;
      for (const [path, bytes] of incoming.files) {
        if (path.startsWith(prefix) && path !== handoff.recordPath) {
          await writeVerifiedFile(directory, path, bytes);
          takenPaths.add(path);
        }
      }
      // The record is published last so an interrupted import never exposes a partial archive.
      await writeVerifiedFile(directory, handoff.recordPath, recordBytes);
      takenPaths.add(handoff.recordPath);
      handoffs.push(handoff);
      report.addedHandoffIds.push(handoff.handoffId);
    }

    for (const entry of incoming.manifest.recovery) {
      if (recovery.some((known) => known.recoveryId === entry.recoveryId)) {
        continue;
      }
      const bytes = incoming.files.get(entry.fileName);
      if (bytes === undefined) {
        continue;
      }
      const fileName = uniqueFileName(entry.fileName, takenPaths, await sha256Hex(bytes));
      await writeVerifiedFile(directory, fileName, bytes);
      takenPaths.add(fileName);
      recovery.push({ ...entry, fileName } satisfies LineageRecoveryEntry);
    }

    const localWorking = repository.getWorking();
    const incomingWorking = incoming.working;
    let nextWorking: WorkspaceFilePayload | null = null;
    const recordHead = async (payload: WorkspaceFilePayload, bytes: Uint8Array, label: string): Promise<void> => {
      if (payload.revisionId === localWorking.revisionId || divergentHeads.some((head) => head.revisionId === payload.revisionId)) {
        return;
      }
      const fileName = `${RECOVERY_DIRECTORY}/heads/${payload.revisionId.replace(/[^A-Za-z0-9_-]/g, "")}.epe.json`;
      if (!takenPaths.has(fileName)) {
        await writeVerifiedFile(directory, fileName, bytes);
        takenPaths.add(fileName);
      }
      const headId = `head_${shortId(payload.revisionId)}_${divergentHeads.length + 1}`;
      divergentHeads.push({
        headId,
        revisionId: payload.revisionId,
        baseVersionId: payload.working?.baseVersionId ?? null,
        fileName,
        updatedAtIso: payload.updatedAtIso,
        sourceLabel: label
      });
      report.divergentHeadIds.push(headId);
    };

    const incomingWorkingBytes = incoming.files.get(incoming.manifest.workingFileName);
    if (incomingWorking.revisionId === localWorking.revisionId) {
      report.working = "same";
    } else if (isAncestor(localWorking.revisionId, incomingWorking)) {
      report.working = "fast-forward";
      nextWorking = incomingWorking;
    } else if (isAncestor(incomingWorking.revisionId, localWorking)) {
      report.working = "kept-local";
    } else if (divergentHeads.some((head) => head.revisionId === incomingWorking.revisionId)) {
      report.working = "already-recorded";
    } else if (incomingWorkingBytes !== undefined) {
      report.working = "divergent";
      await recordHead(incomingWorking, incomingWorkingBytes, sourceLabel);
    }

    for (const head of incoming.manifest.divergentHeads) {
      const bytes = incoming.files.get(head.fileName);
      if (bytes === undefined) {
        continue;
      }
      const parsed = parseWorkspaceFilePayload(decodeText(bytes));
      if (parsed.payload !== null && parsed.payload.workspaceId === manifest.workspaceId) {
        await recordHead(parsed.payload, bytes, head.sourceLabel || sourceLabel);
      }
    }

    const published = await publishManifest({ ...manifest, versions, handoffs, recovery, divergentHeads });
    if (nextWorking !== null) {
      await replaceWorking(nextWorking, published);
    }
    return report;
  });
}
