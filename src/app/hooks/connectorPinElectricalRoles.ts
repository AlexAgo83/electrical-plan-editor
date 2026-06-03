import type { PinElectricalRole, PinElectricalRoleKind } from "../../core/entities";
import { PIN_ELECTRICAL_ROLE_KINDS } from "../../core/pinElectricalRole";

export interface PinElectricalRoleDraft {
  role: PinElectricalRoleKind | "";
  currentA: string;
  label: string;
  notes: string;
}

export type ConnectorPinElectricalRoleDrafts = Record<number, PinElectricalRoleDraft>;

export function createEmptyPinElectricalRoleDraft(): PinElectricalRoleDraft {
  return { role: "", currentA: "", label: "", notes: "" };
}

export function formatPinElectricalRoleDraft(role: PinElectricalRole | undefined): PinElectricalRoleDraft {
  if (role === undefined) {
    return createEmptyPinElectricalRoleDraft();
  }
  return {
    role: role.role,
    currentA: role.currentA !== undefined ? String(role.currentA) : "",
    label: role.label ?? "",
    notes: role.notes ?? ""
  };
}

export function formatPinElectricalRoleDrafts(
  roles: Record<number, PinElectricalRole> | undefined,
  cavityCount: number
): ConnectorPinElectricalRoleDrafts {
  const drafts: ConnectorPinElectricalRoleDrafts = {};
  for (let cavityIndex = 1; cavityIndex <= cavityCount; cavityIndex += 1) {
    drafts[cavityIndex] = formatPinElectricalRoleDraft(roles?.[cavityIndex]);
  }
  return drafts;
}

export function getPinElectricalRoleDraftError(draft: PinElectricalRoleDraft): string | null {
  if (draft.role !== "" && !PIN_ELECTRICAL_ROLE_KINDS.includes(draft.role)) {
    return "Invalid role.";
  }
  const currentText = draft.currentA.trim();
  if (currentText.length > 0) {
    const value = Number(currentText);
    if (!Number.isFinite(value)) {
      return "Enter a numeric current.";
    }
    if (value < 0) {
      return "Current must be 0 A or greater.";
    }
  }
  if (draft.label.length > 80) {
    return "Label must be 80 characters or fewer.";
  }
  return null;
}

export function hasInvalidPinElectricalRoleDraft(drafts: ConnectorPinElectricalRoleDrafts): boolean {
  return Object.values(drafts).some((draft) => getPinElectricalRoleDraftError(draft) !== null);
}

function serializeSingleDraft(draft: PinElectricalRoleDraft): PinElectricalRole | undefined {
  if (draft.role === "") {
    return undefined;
  }
  if (getPinElectricalRoleDraftError(draft) !== null) {
    return undefined;
  }
  const result: PinElectricalRole = { role: draft.role };
  const currentText = draft.currentA.trim();
  if (currentText.length > 0) {
    result.currentA = Number(currentText);
  }
  const label = draft.label.trim();
  if (label.length > 0) {
    result.label = label;
  }
  const notes = draft.notes.trim();
  if (notes.length > 0) {
    result.notes = notes;
  }
  return result;
}

export function serializePinElectricalRoleDrafts(
  drafts: ConnectorPinElectricalRoleDrafts,
  cavityCount: number
): Record<number, PinElectricalRole> | undefined {
  const result: Record<number, PinElectricalRole> = {};
  for (const [key, draft] of Object.entries(drafts)) {
    const cavityIndex = Number(key);
    if (!Number.isInteger(cavityIndex) || cavityIndex < 1 || cavityIndex > cavityCount) {
      continue;
    }
    const serialized = serializeSingleDraft(draft);
    if (serialized !== undefined) {
      result[cavityIndex] = serialized;
    }
  }
  return Object.keys(result).length === 0 ? undefined : result;
}

export function applyRoleToSelectedDrafts(
  drafts: ConnectorPinElectricalRoleDrafts,
  selectedCavityIndexes: ReadonlyArray<number>,
  role: PinElectricalRoleKind
): ConnectorPinElectricalRoleDrafts {
  const next: ConnectorPinElectricalRoleDrafts = { ...drafts };
  for (const cavityIndex of selectedCavityIndexes) {
    const current = next[cavityIndex] ?? createEmptyPinElectricalRoleDraft();
    next[cavityIndex] = { ...current, role };
  }
  return next;
}

export function resetSelectedDraftsToCatalog(
  drafts: ConnectorPinElectricalRoleDrafts,
  selectedCavityIndexes: ReadonlyArray<number>
): ConnectorPinElectricalRoleDrafts {
  const next: ConnectorPinElectricalRoleDrafts = { ...drafts };
  for (const cavityIndex of selectedCavityIndexes) {
    next[cavityIndex] = createEmptyPinElectricalRoleDraft();
  }
  return next;
}
