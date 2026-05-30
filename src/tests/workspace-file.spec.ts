import { describe, expect, it } from "vitest";
import {
  PERSISTED_STATE_PAYLOAD_KIND,
  PERSISTED_STATE_SCHEMA_VERSION
} from "../adapters/persistence";
import { APP_RELEASE_VERSION, APP_SCHEMA_VERSION } from "../core/schema";
import { createSampleNetworkState } from "../store";
import {
  buildWorkspaceFileName,
  buildWorkspaceFilePayload,
  parseWorkspaceFilePayload,
  serializeWorkspaceFilePayload,
  WORKSPACE_FILE_PAYLOAD_KIND,
  WORKSPACE_FILE_SCHEMA_VERSION
} from "../app/lib/workspaceFile";

describe("workspace file format", () => {
  it("serializes and parses a full workspace snapshot", () => {
    const state = createSampleNetworkState();
    const payload = buildWorkspaceFilePayload(state, null, "2026-05-30T10:00:00.000Z");

    expect(payload.payloadKind).toBe(WORKSPACE_FILE_PAYLOAD_KIND);
    expect(payload.schemaVersion).toBe(WORKSPACE_FILE_SCHEMA_VERSION);
    expect(payload.appVersion).toBe(APP_RELEASE_VERSION);
    expect(payload.appSchemaVersion).toBe(APP_SCHEMA_VERSION);
    expect(payload.createdAtIso).toBe("2026-05-30T10:00:00.000Z");
    expect(payload.updatedAtIso).toBe("2026-05-30T10:00:00.000Z");

    const parsed = parseWorkspaceFilePayload(serializeWorkspaceFilePayload(payload), "2026-05-30T10:01:00.000Z");

    expect(parsed.error).toBeNull();
    expect(parsed.payload?.workspaceId).toBe(payload.workspaceId);
    expect(parsed.payload?.revisionId).toBe(payload.revisionId);
    expect(parsed.state).toEqual(state);
  });

  it("keeps workspace identity while creating a new revision", () => {
    const state = createSampleNetworkState();
    const first = buildWorkspaceFilePayload(state, null, "2026-05-30T10:00:00.000Z");
    const second = buildWorkspaceFilePayload(state, first, "2026-05-30T10:10:00.000Z");

    expect(second.workspaceId).toBe(first.workspaceId);
    expect(second.createdAtIso).toBe(first.createdAtIso);
    expect(second.revisionId).not.toBe(first.revisionId);
    expect(second.updatedAtIso).toBe("2026-05-30T10:10:00.000Z");
  });

  it("builds a stable workspace file name", () => {
    expect(buildWorkspaceFileName("2026-05-30T10:11:12.000Z")).toBe("electrical-workspace-2026-05-30_10-11-12.epe.json");
  });

  it("derives stable revisions when importing legacy persisted workspace snapshots", () => {
    const state = createSampleNetworkState();
    const legacySnapshot = JSON.stringify({
      payloadKind: PERSISTED_STATE_PAYLOAD_KIND,
      schemaVersion: PERSISTED_STATE_SCHEMA_VERSION,
      appVersion: APP_RELEASE_VERSION,
      appSchemaVersion: APP_SCHEMA_VERSION,
      createdAtIso: "2026-05-30T09:00:00.000Z",
      updatedAtIso: "2026-05-30T09:30:00.000Z",
      state
    });

    const first = parseWorkspaceFilePayload(legacySnapshot, "2026-05-30T10:00:00.000Z");
    const second = parseWorkspaceFilePayload(legacySnapshot, "2026-05-30T10:10:00.000Z");

    expect(first.error).toBeNull();
    expect(second.error).toBeNull();
    expect(first.payload?.workspaceId).toBe(second.payload?.workspaceId);
    expect(first.payload?.revisionId).toBe(second.payload?.revisionId);
    expect(first.payload?.revisionId).toMatch(/^rev_/);
  });
});
