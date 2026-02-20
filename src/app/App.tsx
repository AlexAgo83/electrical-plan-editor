import { type FormEvent, type ReactElement, useMemo, useState, useSyncExternalStore } from "react";
import type { Connector, ConnectorId } from "../core/entities";
import {
  appActions,
  selectConnectorById,
  selectConnectorCavityStatuses,
  selectConnectorTechnicalIdTaken,
  selectConnectors,
  selectLastError,
  selectNodes,
  selectSegments,
  selectSelection,
  selectSplices,
  selectWires
} from "../store";
import { appStore } from "./store";
import "./styles.css";

function useAppSnapshot() {
  return useSyncExternalStore(appStore.subscribe, appStore.getState, appStore.getState);
}

function createConnectorId(): ConnectorId {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `conn-${randomPart}` as ConnectorId;
}

function toPositiveInteger(raw: string): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
}

export function App(): ReactElement {
  const state = useAppSnapshot();

  const connectors = selectConnectors(state);
  const splices = selectSplices(state);
  const nodes = selectNodes(state);
  const segments = selectSegments(state);
  const wires = selectWires(state);

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingConnectorId, setEditingConnectorId] = useState<ConnectorId | null>(null);
  const [functionalName, setFunctionalName] = useState("");
  const [technicalId, setTechnicalId] = useState("");
  const [cavityCount, setCavityCount] = useState("4");
  const [cavityIndexInput, setCavityIndexInput] = useState("1");
  const [occupantRefInput, setOccupantRefInput] = useState("manual-assignment");
  const [connectorFormError, setConnectorFormError] = useState<string | null>(null);

  const selected = selectSelection(state);
  const selectedConnectorId = selected?.kind === "connector" ? (selected.id as ConnectorId) : null;
  const selectedConnector =
    selectedConnectorId === null ? null : (selectConnectorById(state, selectedConnectorId) ?? null);

  const cavityStatuses = useMemo(() => {
    if (selectedConnectorId === null) {
      return [];
    }

    return selectConnectorCavityStatuses(state, selectedConnectorId);
  }, [state, selectedConnectorId]);

  const connectorIdExcludedFromUniqueness = formMode === "edit" ? editingConnectorId ?? undefined : undefined;
  const technicalIdAlreadyUsed =
    technicalId.trim().length > 0 &&
    selectConnectorTechnicalIdTaken(state, technicalId.trim(), connectorIdExcludedFromUniqueness);

  const lastError = selectLastError(state);

  function resetForm(): void {
    setFormMode("create");
    setEditingConnectorId(null);
    setFunctionalName("");
    setTechnicalId("");
    setCavityCount("4");
    setConnectorFormError(null);
  }

  function startEdit(connector: Connector): void {
    setFormMode("edit");
    setEditingConnectorId(connector.id);
    setFunctionalName(connector.name);
    setTechnicalId(connector.technicalId);
    setCavityCount(String(connector.cavityCount));
    appStore.dispatch(appActions.select({ kind: "connector", id: connector.id }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const trimmedName = functionalName.trim();
    const trimmedTechnicalId = technicalId.trim();
    const normalizedCavityCount = toPositiveInteger(cavityCount);

    if (trimmedName.length === 0 || trimmedTechnicalId.length === 0 || normalizedCavityCount < 1) {
      setConnectorFormError("All fields are required and cavity count must be >= 1.");
      return;
    }
    setConnectorFormError(null);

    const connectorId = formMode === "edit" && editingConnectorId !== null ? editingConnectorId : createConnectorId();

    appStore.dispatch(
      appActions.upsertConnector({
        id: connectorId,
        name: trimmedName,
        technicalId: trimmedTechnicalId,
        cavityCount: normalizedCavityCount
      })
    );

    const nextState = appStore.getState();
    if (nextState.connectors.byId[connectorId] !== undefined) {
      appStore.dispatch(appActions.select({ kind: "connector", id: connectorId }));
      resetForm();
    }
  }

  function handleDelete(connectorId: ConnectorId): void {
    appStore.dispatch(appActions.removeConnector(connectorId));

    if (editingConnectorId === connectorId) {
      resetForm();
    }
  }

  function handleReserveCavity(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (selectedConnectorId === null) {
      return;
    }

    const cavityIndex = toPositiveInteger(cavityIndexInput);
    appStore.dispatch(appActions.occupyConnectorCavity(selectedConnectorId, cavityIndex, occupantRefInput));
  }

  function handleReleaseCavity(cavityIndex: number): void {
    if (selectedConnectorId === null) {
      return;
    }

    appStore.dispatch(appActions.releaseConnectorCavity(selectedConnectorId, cavityIndex));
  }

  return (
    <main className="app-shell">
      <section className="header-block">
        <h1>Electrical Plan Editor</h1>
        <p>Wave 1 in progress: connector management and cavity occupancy controls are active.</p>
      </section>

      {lastError !== null ? (
        <section className="error-banner" role="alert">
          <p>{lastError}</p>
          <button type="button" onClick={() => appStore.dispatch(appActions.clearError())}>
            Clear
          </button>
        </section>
      ) : null}

      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{connectors.length}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{splices.length}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{nodes.length}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{segments.length}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{wires.length}</p>
        </article>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>{formMode === "create" ? "Create Connector" : "Edit Connector"}</h2>
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Functional name
              <input
                value={functionalName}
                onChange={(event) => setFunctionalName(event.target.value)}
                placeholder="Rear body connector"
                required
              />
            </label>

            <label>
              Technical ID
              <input
                value={technicalId}
                onChange={(event) => setTechnicalId(event.target.value)}
                placeholder="C-001"
                required
              />
            </label>
            {technicalIdAlreadyUsed ? <small className="inline-error">This technical ID is already used.</small> : null}

            <label>
              Cavity count
              <input
                type="number"
                min={1}
                step={1}
                value={cavityCount}
                onChange={(event) => setCavityCount(event.target.value)}
                required
              />
            </label>

            <div className="row-actions">
              <button type="submit" disabled={technicalIdAlreadyUsed}>
                {formMode === "create" ? "Create" : "Save"}
              </button>
              {formMode === "edit" ? (
                <button type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
            {connectorFormError !== null ? <small className="inline-error">{connectorFormError}</small> : null}
          </form>
        </article>

        <article className="panel">
          <h2>Connectors</h2>
          {connectors.length === 0 ? (
            <p className="empty-copy">No connector yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Technical ID</th>
                  <th>Cavities</th>
                  <th>Occupied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {connectors.map((connector) => {
                  const occupiedCount = selectConnectorCavityStatuses(state, connector.id).filter((slot) => slot.isOccupied)
                    .length;
                  const isSelected = selectedConnectorId === connector.id;

                  return (
                    <tr key={connector.id} className={isSelected ? "is-selected" : undefined}>
                      <td>{connector.name}</td>
                      <td>{connector.technicalId}</td>
                      <td>{connector.cavityCount}</td>
                      <td>{occupiedCount}</td>
                      <td>
                        <div className="row-actions compact">
                          <button
                            type="button"
                            onClick={() => appStore.dispatch(appActions.select({ kind: "connector", id: connector.id }))}
                          >
                            Select
                          </button>
                          <button type="button" onClick={() => startEdit(connector)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDelete(connector.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </article>
      </section>

      <section className="panel">
        <h2>Connector cavities</h2>
        {selectedConnector === null ? (
          <p className="empty-copy">Select a connector to view and manage cavity occupancy.</p>
        ) : (
          <>
            <p className="meta-line">
              <strong>{selectedConnector.name}</strong> ({selectedConnector.technicalId})
            </p>
            <form className="row-form" onSubmit={handleReserveCavity}>
              <label>
                Cavity index
                <input
                  type="number"
                  min={1}
                  max={selectedConnector.cavityCount}
                  step={1}
                  value={cavityIndexInput}
                  onChange={(event) => setCavityIndexInput(event.target.value)}
                  required
                />
              </label>

              <label>
                Occupant reference
                <input
                  value={occupantRefInput}
                  onChange={(event) => setOccupantRefInput(event.target.value)}
                  placeholder="wire-draft-001:A"
                  required
                />
              </label>

              <button type="submit">Reserve cavity</button>
            </form>

            <div className="cavity-grid" aria-label="Cavity occupancy grid">
              {cavityStatuses.map((slot) => (
                <article key={slot.cavityIndex} className={slot.isOccupied ? "cavity is-occupied" : "cavity"}>
                  <h3>C{slot.cavityIndex}</h3>
                  <p>{slot.isOccupied ? slot.occupantRef : "Free"}</p>
                  {slot.isOccupied ? (
                    <button type="button" onClick={() => handleReleaseCavity(slot.cavityIndex)}>
                      Release
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
