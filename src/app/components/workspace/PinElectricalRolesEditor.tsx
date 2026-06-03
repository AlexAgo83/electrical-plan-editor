import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import type { CatalogItem, ConnectorLayout, PinElectricalRoleKind } from "../../../core/entities";
import { getConnectorLayoutWayDisplayLabel } from "../../../core/connectorLayout";
import {
  PIN_ELECTRICAL_ROLE_KINDS,
  resolvePinElectricalRoleDescriptor
} from "../../../core/pinElectricalRole";
import {
  applyRoleToSelectedDrafts,
  createEmptyPinElectricalRoleDraft,
  getPinElectricalRoleDraftError,
  resetSelectedDraftsToCatalog,
  type ConnectorPinElectricalRoleDrafts,
  type PinElectricalRoleDraft
} from "../../hooks/connectorPinElectricalRoles";

export interface PinElectricalRolesEditorProps {
  cavityCount: number;
  drafts: ConnectorPinElectricalRoleDrafts;
  setDrafts: (value: ConnectorPinElectricalRoleDrafts) => void;
  selection: number[];
  setSelection: (value: number[]) => void;
  catalogItem: CatalogItem | undefined;
  connectorLayout?: ConnectorLayout;
  allowInheritedRoles?: boolean;
  mode?: "fieldset" | "panel";
  title?: string;
  showPanelHeader?: boolean;
  footerActions?: ReactNode;
}

const ROLE_LABELS: Record<PinElectricalRoleKind, string> = {
  source: "Source",
  consumer: "Consumer",
  passive: "Passive",
  bidirectional: "Bidirectional"
};

export function PinElectricalRolesEditor(props: PinElectricalRolesEditorProps): ReactElement {
  const {
    cavityCount,
    drafts,
    setDrafts,
    selection,
    setSelection,
    catalogItem,
    connectorLayout,
    allowInheritedRoles = true,
    mode = "fieldset",
    title = "Pin electrical roles",
    showPanelHeader = true,
    footerActions
  } = props;
  const [isOpen, setIsOpen] = useState(mode === "panel");
  const [bulkRole, setBulkRole] = useState<PinElectricalRoleKind>("source");
  const safeCavityCount = Number.isFinite(cavityCount) && cavityCount > 0 ? Math.trunc(cavityCount) : 0;

  function updateDraftField(cavityIndex: number, field: keyof PinElectricalRoleDraft, value: string): void {
    const current = drafts[cavityIndex] ?? createEmptyPinElectricalRoleDraft();
    if (allowInheritedRoles && field === "role" && value === "") {
      setDrafts({ ...drafts, [cavityIndex]: createEmptyPinElectricalRoleDraft() });
      return;
    }
    setDrafts({ ...drafts, [cavityIndex]: { ...current, [field]: value } });
  }

  function toggleSelection(cavityIndex: number): void {
    if (selection.includes(cavityIndex)) {
      setSelection(selection.filter((index) => index !== cavityIndex));
      return;
    }
    setSelection([...selection, cavityIndex]);
  }

  function selectAll(): void {
    const all: number[] = [];
    for (let cavityIndex = 1; cavityIndex <= safeCavityCount; cavityIndex += 1) {
      all.push(cavityIndex);
    }
    setSelection(all);
  }

  function clearSelection(): void {
    setSelection([]);
  }

  function applyBulkRole(): void {
    if (selection.length === 0) {
      return;
    }
    setDrafts(applyRoleToSelectedDrafts(drafts, selection, bulkRole));
  }

  function resetSelectionToCatalog(): void {
    if (selection.length === 0) {
      return;
    }
    setDrafts(resetSelectedDraftsToCatalog(drafts, selection));
  }

  function formatPinLabel(cavityIndex: number): string {
    const layoutWay = connectorLayout?.ways.find((way) => way.cavityIndex === cavityIndex);
    return getConnectorLayoutWayDisplayLabel(layoutWay ?? { cavityIndex });
  }

  if (safeCavityCount === 0) {
    return <></>;
  }

  const editorBody = (
    <>
      <div className="pin-electrical-roles-bulk row-form row-actions compact">
        <button type="button" className="link-button" onClick={selectAll}>
          Select all
        </button>
        <button type="button" className="link-button" onClick={clearSelection}>
          Clear selection
        </button>
        <label className="pin-electrical-roles-bulk-role">
          Bulk role
          <select
            value={bulkRole}
            onChange={(event) => setBulkRole(event.target.value as PinElectricalRoleKind)}
          >
            {PIN_ELECTRICAL_ROLE_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {ROLE_LABELS[kind]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button-with-icon"
          disabled={selection.length === 0}
          onClick={applyBulkRole}
        >
          Apply role to selected pins
        </button>
        {allowInheritedRoles ? (
          <button
            type="button"
            className="button-with-icon"
            disabled={selection.length === 0}
            onClick={resetSelectionToCatalog}
          >
            Reset to catalog default
          </button>
        ) : null}
      </div>
      <div
        className="pin-electrical-roles-table"
        role="table"
        aria-label="Pin electrical roles"
      >
        <div className="pin-electrical-roles-row pin-electrical-roles-row--header" role="row">
          <span role="columnheader">
            <span className="sr-only">Select</span>
          </span>
          <span role="columnheader">Pin</span>
          <span role="columnheader">Role</span>
          <span role="columnheader">Max current (A)</span>
          <span role="columnheader">Label</span>
        </div>
        {Array.from({ length: safeCavityCount }, (_, index) => {
          const cavityIndex = index + 1;
          const pinLabel = formatPinLabel(cavityIndex);
          const draft = drafts[cavityIndex] ?? createEmptyPinElectricalRoleDraft();
          const draftError = getPinElectricalRoleDraftError(draft);
          const resolved = resolvePinElectricalRoleDescriptor({ pinElectricalRoles: undefined }, catalogItem, cavityIndex);
          const isSelected = selection.includes(cavityIndex);
          const hasSelectedRole = draft.role !== "";
          const isInherited = allowInheritedRoles && !hasSelectedRole;
          const hidesRoleDetails = !hasSelectedRole;
          const emptyRoleOptionLabel =
            allowInheritedRoles && resolved.source === "catalog"
              ? `(inherit: ${ROLE_LABELS[resolved.role.role]})`
              : allowInheritedRoles
                ? "(inherit)"
                : "";
          return (
            <div
              className={`pin-electrical-roles-row row-form${draftError === null ? "" : " has-error"}`}
              role="row"
              key={cavityIndex}
              data-pin-role-invalid={draftError === null ? undefined : "true"}
            >
              <span role="cell" data-label="Select">
                <label className="sr-only" htmlFor={`pin-role-select-${cavityIndex}`}>
                  Select pin {pinLabel}
                </label>
                <input
                  id={`pin-role-select-${cavityIndex}`}
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(cavityIndex)}
                  aria-label={`Select pin ${pinLabel}`}
                />
              </span>
              <span role="cell" className="pin-electrical-roles-index" data-label="Pin">
                {pinLabel}
              </span>
              <span role="cell" data-label="Role">
                <label className="sr-only" htmlFor={`pin-role-role-${cavityIndex}`}>
                  Role for pin {pinLabel}
                </label>
                <select
                  id={`pin-role-role-${cavityIndex}`}
                  value={draft.role}
                  onChange={(event) =>
                    updateDraftField(cavityIndex, "role", event.target.value)
                  }
                >
                  <option value="">{emptyRoleOptionLabel}</option>
                  {PIN_ELECTRICAL_ROLE_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {ROLE_LABELS[kind]}
                    </option>
                  ))}
                </select>
              </span>
              <span role="cell" data-label="Max current (A)">
                {hidesRoleDetails ? null : (
                  <>
                    <label className="sr-only" htmlFor={`pin-role-current-${cavityIndex}`}>
                      Max current for pin {pinLabel}
                    </label>
                    <input
                      id={`pin-role-current-${cavityIndex}`}
                      type="number"
                      name={`pin-role-current-${cavityIndex}`}
                      autoComplete="off"
                      min={0}
                      step={0.1}
                      value={draft.currentA}
                      aria-invalid={draftError === null ? undefined : true}
                      onChange={(event) =>
                        updateDraftField(cavityIndex, "currentA", event.target.value)
                      }
                    />
                  </>
                )}
                {isInherited && resolved.role.currentA !== undefined ? (
                  <small className="pin-electrical-roles-effective">{resolved.role.currentA} A</small>
                ) : null}
                {draftError === null ? null : (
                  <small className="inline-error">{draftError}</small>
                )}
              </span>
              <span role="cell" data-label="Label">
                {hidesRoleDetails ? null : (
                  <>
                    <label className="sr-only" htmlFor={`pin-role-label-${cavityIndex}`}>
                      Label for pin {pinLabel}
                    </label>
                    <input
                      id={`pin-role-label-${cavityIndex}`}
                      type="text"
                      name={`pin-role-label-${cavityIndex}`}
                      autoComplete="off"
                      maxLength={80}
                      value={draft.label}
                      placeholder="BAT+, KL15, LS_OUT..."
                      onChange={(event) =>
                        updateDraftField(cavityIndex, "label", event.target.value)
                      }
                    />
                  </>
                )}
                {isInherited && resolved.role.label !== undefined ? (
                  <small className="pin-electrical-roles-effective">{resolved.role.label}</small>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>
      {footerActions === undefined ? null : <div className="pin-electrical-roles-footer row-actions compact">{footerActions}</div>}
    </>
  );

  if (mode === "panel") {
    return (
      <section className="pin-electrical-roles-editor pin-electrical-roles-editor--panel" aria-label={title}>
        {showPanelHeader ? (
          <header className="pin-electrical-roles-panel-header">
            <h3>{title}</h3>
          </header>
        ) : null}
        {editorBody}
      </section>
    );
  }

  return (
    <fieldset className="inline-fieldset pin-electrical-roles-editor">
      <legend>
        <button
          type="button"
          className="link-button pin-electrical-roles-toggle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          {title} ({safeCavityCount})
        </button>
      </legend>
      {isOpen ? editorBody : null}
    </fieldset>
  );
}
