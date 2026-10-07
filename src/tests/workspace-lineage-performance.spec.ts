import { describe, expect, it } from "vitest";
import { createSampleNetworkState, type AppState } from "../store";
import type { WireId } from "../core/entities";
import { MemoryLineageDirectory } from "../app/lib/lineage/lineageDirectory";
import { exportLineagePackage } from "../app/lib/lineage/lineagePackage";
import { LineageRepository } from "../app/lib/lineage/lineageRepository";
import { buildVersionDisplayLabels, sortVersionsForHistory } from "../app/lib/lineage/lineageFormat";

const VERSION_COUNT = 100;
const WIRE_COUNT = 150;

function stateWithWires(revision: number): AppState {
  const state = createSampleNetworkState();
  const templateId = state.wires.allIds[0];
  const template = templateId === undefined ? undefined : state.wires.byId[templateId];
  if (template === undefined) {
    throw new Error("sample has no wire");
  }
  const byId = { ...state.wires.byId };
  const allIds = [...state.wires.allIds];
  for (let index = allIds.length; index < WIRE_COUNT; index += 1) {
    const id = `W-PERF-${index}` as WireId;
    byId[id] = { ...template, id, name: `Perf wire ${index} r${revision}`, technicalId: `W-PERF-${index}` };
    allIds.push(id);
  }
  return { ...state, wires: { byId, allIds } };
}

class CountingDirectory extends MemoryLineageDirectory {
  versionReads = 0;

  override readFile(path: string): Promise<Uint8Array | null> {
    if (path.startsWith("Versions/")) {
      this.versionReads += 1;
    }
    return super.readFile(path);
  }
}

describe("large lineage history", () => {
  it(`opens and lists ${VERSION_COUNT} versions of ${WIRE_COUNT} wires without parsing snapshots eagerly`, async () => {
    const directory = new CountingDirectory("perf");
    const repository = await LineageRepository.initialize(directory, { displayName: "Série", state: stateWithWires(0) });
    for (let index = 1; index <= VERSION_COUNT; index += 1) {
      await repository.createVersion(stateWithWires(index), { operationId: `op_${index}`, title: `Milestone ${index}` });
    }
    expect(stateWithWires(1).wires.allIds.length).toBeGreaterThanOrEqual(WIRE_COUNT);

    directory.versionReads = 0;
    const openStart = performance.now();
    const reopened = new LineageRepository(directory);
    const opened = await reopened.open();
    const openMs = performance.now() - openStart;
    const listStart = performance.now();
    const labels = buildVersionDisplayLabels(opened.manifest.versions);
    const history = sortVersionsForHistory(opened.manifest.versions);
    const listMs = performance.now() - listStart;
    expect(history).toHaveLength(VERSION_COUNT);
    expect(labels.get(history[0]!.versionId)).toBe("v100");
    expect(directory.versionReads).toBe(0);

    const readStart = performance.now();
    await reopened.readVersion(history[50]!.versionId);
    const readOneMs = performance.now() - readStart;
    expect(directory.versionReads).toBe(1);

    const exportStart = performance.now();
    const archive = await exportLineagePackage(directory, "serie");
    const exportMs = performance.now() - exportStart;
    const rawBytes = (await Promise.all((await directory.listFiles()).map((path) => directory.readFile(path)))).reduce(
      (sum, bytes) => sum + (bytes?.byteLength ?? 0),
      0
    );
    // Measurements are reported, not asserted against hardware-specific thresholds.
    process.stdout.write(
      `[lineage-perf] versions=${VERSION_COUNT} wires/snapshot=${WIRE_COUNT} raw=${(rawBytes / 1024 / 1024).toFixed(2)}MiB ` +
        `zip=${(archive.byteLength / 1024 / 1024).toFixed(2)}MiB open=${openMs.toFixed(1)}ms history=${listMs.toFixed(1)}ms ` +
        `readOne=${readOneMs.toFixed(1)}ms export=${exportMs.toFixed(1)}ms\n`
    );
  }, 120_000);
});
