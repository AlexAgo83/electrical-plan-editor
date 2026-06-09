import { useMemo, useState, type ReactElement } from "react";
import type { CatalogItem, Connector, ConnectorId, Network, PinElectricalRole, PinElectricalRoleKind, Splice, Wire } from "../../../core/entities";
import { PIN_ELECTRICAL_ROLE_KINDS, resolvePinElectricalRoleDescriptor } from "../../../core/pinElectricalRole";
import { computePinElectricalLoad } from "../../../core/pinElectricalLoad";
import { resolveAmpacityA } from "../../../core/wireAmpacity";

interface PinRoleMassEditPanelProps {
  activeNetwork: Network | null;
  connectors: Connector[];
  splices: Splice[];
  wires: Wire[];
  catalogItems: CatalogItem[];
  onApplyPinRoleMassEdit: (updates: PinRoleMassEditUpdate[]) => void;
}

export interface PinRoleMassEditUpdate {
  connectorId: ConnectorId;
  cavityIndex: number;
  role: PinElectricalRole | null;
}

type RoleFilter = "all" | PinElectricalRoleKind;
type DeclarationFilter = "all" | "declared" | "notDeclared";

interface MassEditRow {
  key: string;
  connector: Connector;
  cavityIndex: number;
  resolved: PinElectricalRole;
  source: "override" | "catalog" | "default";
  branchLoadA: number | null;
  isOverLoaded: boolean;
}

const ROLE_LABELS: Record<PinElectricalRoleKind, string> = {
  source: "Source",
  consumer: "Consumer",
  passive: "Passive",
  bidirectional: "Bidirectional"
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === "," && !quoted) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function isRoleKind(value: string): value is PinElectricalRoleKind {
  return PIN_ELECTRICAL_ROLE_KINDS.includes(value as PinElectricalRoleKind);
}

function buildRole(roleKind: PinElectricalRoleKind, currentA: string, label: string): PinElectricalRole {
  const role: PinElectricalRole = { role: roleKind };
  const trimmedCurrent = currentA.trim();
  if (trimmedCurrent.length > 0) {
    role.currentA = Number(trimmedCurrent);
  }
  const trimmedLabel = label.trim();
  if (trimmedLabel.length > 0) {
    role.label = trimmedLabel;
  }
  return role;
}

function formatCurrent(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

export function PinRoleMassEditPanel({
  activeNetwork,
  connectors,
  splices,
  wires,
  catalogItems,
  onApplyPinRoleMassEdit
}: PinRoleMassEditPanelProps): ReactElement {
  const [connectorFilter, setConnectorFilter] = useState<ConnectorId | "all">("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [declarationFilter, setDeclarationFilter] = useState<DeclarationFilter>("all");
  const [overLoadedOnly, setOverLoadedOnly] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<PinElectricalRoleKind>("source");
  const [bulkCurrentA, setBulkCurrentA] = useState("");
  const [bulkLabel, setBulkLabel] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvErrors, setCsvErrors] = useState<string[]>([]);

  const catalogItemsById = useMemo(() => new Map(catalogItems.map((item) => [item.id, item])), [catalogItems]);
  const rows = useMemo<MassEditRow[]>(() => {
    const load = computePinElectricalLoad(
      {
        networkId: activeNetwork?.id,
        connectors,
        splices,
        wires,
        catalogItemsById
      },
      { kind: "currentNetwork" }
    );
    const wireById = new Map(wires.map((wire) => [wire.id, wire]));
    const loadByPin = new Map<string, { loadA: number; overLoaded: boolean }>();
    for (const branchLoad of load.branchLoadByWire.values()) {
      const wire = wireById.get(branchLoad.wireId);
      const material = wire?.material ?? "copper";
      const ampacity = wire === undefined ? undefined : resolveAmpacityA(wire.sectionMm2, material, activeNetwork ?? undefined);
      const overLoaded = ampacity !== undefined && branchLoad.continuousA > ampacity;
      for (const ref of [...branchLoad.sourceRefs, ...branchLoad.consumerRefs]) {
        const key = `${ref.connectorId}:${ref.cavityIndex}`;
        const previous = loadByPin.get(key);
        if (previous === undefined || branchLoad.continuousA > previous.loadA) {
          loadByPin.set(key, { loadA: branchLoad.continuousA, overLoaded });
        } else if (overLoaded) {
          loadByPin.set(key, { ...previous, overLoaded: true });
        }
      }
    }

    return connectors.flatMap((connector) => {
      const catalogItem = connector.catalogItemId === undefined ? undefined : catalogItemsById.get(connector.catalogItemId);
      return Array.from({ length: Math.max(0, connector.cavityCount) }, (_, index) => {
        const cavityIndex = index + 1;
        const descriptor = resolvePinElectricalRoleDescriptor(connector, catalogItem, cavityIndex);
        const key = `${connector.id}:${cavityIndex}`;
        const loadInfo = loadByPin.get(key);
        return {
          key,
          connector,
          cavityIndex,
          resolved: descriptor.role,
          source: descriptor.source,
          branchLoadA: loadInfo?.loadA ?? null,
          isOverLoaded: loadInfo?.overLoaded ?? false
        };
      });
    });
  }, [activeNetwork, catalogItemsById, connectors, splices, wires]);

  const filteredRows = rows.filter((row) => {
    if (connectorFilter !== "all" && row.connector.id !== connectorFilter) {
      return false;
    }
    if (roleFilter !== "all" && row.resolved.role !== roleFilter) {
      return false;
    }
    if (declarationFilter === "declared" && row.source === "default") {
      return false;
    }
    if (declarationFilter === "notDeclared" && row.source !== "default") {
      return false;
    }
    if (overLoadedOnly && !row.isOverLoaded) {
      return false;
    }
    return true;
  });

  const selectedVisibleRows = filteredRows.filter((row) => selectedKeys.includes(row.key));

  function toggleSelection(key: string): void {
    setSelectedKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  function applyBulk(): void {
    if (selectedVisibleRows.length === 0) {
      return;
    }
    const currentText = bulkCurrentA.trim();
    if (currentText.length > 0 && (!Number.isFinite(Number(currentText)) || Number(currentText) < 0)) {
      setCsvErrors(["Bulk current must be a number greater than or equal to 0."]);
      return;
    }
    onApplyPinRoleMassEdit(
      selectedVisibleRows.map((row) => ({
        connectorId: row.connector.id,
        cavityIndex: row.cavityIndex,
        role: buildRole(bulkRole, bulkCurrentA, bulkLabel)
      }))
    );
    setSelectedKeys([]);
    setCsvErrors([]);
  }

  function resetSelected(): void {
    if (selectedVisibleRows.length === 0) {
      return;
    }
    onApplyPinRoleMassEdit(
      selectedVisibleRows.map((row) => ({
        connectorId: row.connector.id,
        cavityIndex: row.cavityIndex,
        role: null
      }))
    );
    setSelectedKeys([]);
    setCsvErrors([]);
  }

  function applyCsvPaste(): void {
    const lines = csvText.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
    const errors: string[] = [];
    const updates: PinRoleMassEditUpdate[] = [];
    const connectorByToken = new Map<string, Connector>();
    for (const connector of connectors) {
      connectorByToken.set(String(connector.id).toLowerCase(), connector);
      connectorByToken.set(connector.technicalId.toLowerCase(), connector);
      connectorByToken.set(connector.name.toLowerCase(), connector);
    }
    const dataLines = lines[0]?.toLowerCase().startsWith("connector,") ? lines.slice(1) : lines;
    dataLines.forEach((line, index) => {
      const [connectorToken = "", pinToken = "", roleToken = "", currentA = "", label = ""] = parseCsvLine(line);
      const connector = connectorByToken.get(connectorToken.toLowerCase());
      const pin = Number(pinToken);
      const role = roleToken.toLowerCase();
      const lineNumber = index + 1;
      if (connector === undefined) {
        errors.push(`Row ${lineNumber}: unknown connector '${connectorToken}'.`);
        return;
      }
      if (!Number.isInteger(pin) || pin < 1 || pin > connector.cavityCount) {
        errors.push(`Row ${lineNumber}: invalid pin '${pinToken}'.`);
        return;
      }
      if (!isRoleKind(role)) {
        errors.push(`Row ${lineNumber}: invalid role '${roleToken}'.`);
        return;
      }
      if (currentA.trim().length > 0 && (!Number.isFinite(Number(currentA)) || Number(currentA) < 0)) {
        errors.push(`Row ${lineNumber}: invalid current '${currentA}'.`);
        return;
      }
      updates.push({ connectorId: connector.id, cavityIndex: pin, role: buildRole(role, currentA, label) });
    });
    setCsvErrors(errors);
    if (updates.length > 0) {
      onApplyPinRoleMassEdit(updates);
      setCsvText("");
    }
  }

  return (
    <div className="pin-role-mass-edit-panel">
      <div className="pin-role-mass-edit-summary" aria-live="polite">
        <span className="analysis-wire-mode-chip">{filteredRows.length} pins</span>
        <span>{selectedVisibleRows.length} selected</span>
      </div>
      <div className="pin-role-mass-edit-section">
        <div className="pin-role-mass-edit-toolbar">
          <label className="stack-label">
            Connector
            <select value={connectorFilter} onChange={(event) => setConnectorFilter(event.target.value as ConnectorId | "all")}>
              <option value="all">All connectors</option>
              {connectors.map((connector) => (
                <option key={connector.id} value={connector.id}>
                  {connector.technicalId}
                </option>
              ))}
            </select>
          </label>
          <label className="stack-label">
            Role
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}>
              <option value="all">All roles</option>
              {PIN_ELECTRICAL_ROLE_KINDS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="stack-label">
            Declaration
            <select value={declarationFilter} onChange={(event) => setDeclarationFilter(event.target.value as DeclarationFilter)}>
              <option value="all">All pins</option>
              <option value="declared">Declared</option>
              <option value="notDeclared">Not declared</option>
            </select>
          </label>
          <label className="settings-checkbox pin-role-mass-edit-overloaded">
            <input type="checkbox" checked={overLoadedOnly} onChange={(event) => setOverLoadedOnly(event.target.checked)} />
            <span>Over-loaded</span>
          </label>
        </div>
      </div>
      <div className="pin-role-mass-edit-section">
        <div className="pin-role-mass-edit-toolbar pin-role-mass-edit-toolbar--actions">
          <label className="stack-label">
            Bulk role
            <select value={bulkRole} onChange={(event) => setBulkRole(event.target.value as PinElectricalRoleKind)}>
              {PIN_ELECTRICAL_ROLE_KINDS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="stack-label">
            Current (A)
            <input type="number" min={0} step={0.1} value={bulkCurrentA} onChange={(event) => setBulkCurrentA(event.target.value)} />
          </label>
          <label className="stack-label">
            Label
            <input type="text" value={bulkLabel} onChange={(event) => setBulkLabel(event.target.value)} />
          </label>
          <button type="button" className="button-with-icon confirm-dialog-confirm" onClick={applyBulk} disabled={selectedVisibleRows.length === 0}>
            <span className="action-button-icon is-save" aria-hidden="true" />
            Apply to selected
          </button>
          <button type="button" className="confirm-dialog-cancel" onClick={resetSelected} disabled={selectedVisibleRows.length === 0}>
            Reset selected
          </button>
        </div>
      </div>
      <div className="table-scroll-container">
        <table className="data-table pin-role-mass-edit-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Connector</th>
              <th>Pin</th>
              <th>Role</th>
              <th>Current</th>
              <th>Label</th>
              <th>Source</th>
              <th>Load</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.key} className={selectedKeys.includes(row.key) ? "is-selected" : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(row.key)}
                    onChange={() => toggleSelection(row.key)}
                    aria-label={`Select ${row.connector.technicalId} pin ${row.cavityIndex}`}
                  />
                </td>
                <td>{row.connector.technicalId}</td>
                <td>{row.cavityIndex}</td>
                <td>{ROLE_LABELS[row.resolved.role]}</td>
                <td>{formatCurrent(row.resolved.currentA)}</td>
                <td>{row.resolved.label ?? ""}</td>
                <td>{row.source}</td>
                <td>{row.branchLoadA === null ? "" : `${row.branchLoadA.toFixed(1)} A`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pin-role-mass-edit-section pin-role-mass-edit-csv-section">
        <label className="stack-label pin-role-mass-edit-csv">
          CSV paste
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            placeholder="connector,pin,role,currentA,label"
            rows={4}
          />
        </label>
        <div className="row-actions compact">
          <button type="button" className="button-with-icon" onClick={applyCsvPaste} disabled={csvText.trim().length === 0}>
            Apply CSV
          </button>
        </div>
      </div>
      {csvErrors.length > 0 ? (
        <div className="inline-error pin-role-mass-edit-errors" role="alert">
          {csvErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
