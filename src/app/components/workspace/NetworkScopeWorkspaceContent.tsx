import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  connectorCount: number;
  spliceCount: number;
  nodeCount: number;
  segmentCount: number;
  wireCount: number;
  activeNetworkId: NetworkId | null;
  activeNetworkLabel: string;
  hasActiveNetwork: boolean;
  handleSelectNetwork: (networkId: NetworkId) => void;
  handleDuplicateActiveNetwork: () => void;
  handleDeleteActiveNetwork: () => void;
  networkFormMode: "create" | "edit" | null;
  handleOpenCreateNetworkForm: () => void;
  handleOpenEditNetworkForm: (networkId: NetworkId) => void;
  handleCloseNetworkForm: () => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  networkFormError: string | null;
  networkTechnicalIdAlreadyUsed: boolean;
  handleSubmitNetworkForm: (event: FormEvent<HTMLFormElement>) => void;
}

export function NetworkScopeWorkspaceContent({
  networks,
  connectorCount,
  spliceCount,
  nodeCount,
  segmentCount,
  wireCount,
  activeNetworkId,
  activeNetworkLabel,
  hasActiveNetwork,
  handleSelectNetwork,
  handleDuplicateActiveNetwork,
  handleDeleteActiveNetwork,
  networkFormMode,
  handleOpenCreateNetworkForm,
  handleOpenEditNetworkForm,
  handleCloseNetworkForm,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkDescription,
  setNewNetworkDescription,
  networkFormError,
  networkTechnicalIdAlreadyUsed,
  handleSubmitNetworkForm
}: NetworkScopeWorkspaceContentProps): ReactElement {
  const isCreateMode = networkFormMode === "create";
  const isEditMode = networkFormMode === "edit";
  const isFormOpen = isCreateMode || isEditMode;
  const [focusedNetworkId, setFocusedNetworkId] = useState<NetworkId | null>(activeNetworkId);

  useEffect(() => {
    if (networks.length === 0) {
      setFocusedNetworkId(null);
      return;
    }

    const hasFocusedNetwork = focusedNetworkId !== null && networks.some((network) => network.id === focusedNetworkId);
    if (hasFocusedNetwork) {
      return;
    }

    setFocusedNetworkId(activeNetworkId ?? networks[0]?.id ?? null);
  }, [activeNetworkId, focusedNetworkId, networks]);
  const indicators = [
    { label: "Connectors", value: connectorCount },
    { label: "Splices", value: spliceCount },
    { label: "Nodes", value: nodeCount },
    { label: "Segments", value: segmentCount },
    { label: "Wires", value: wireCount }
  ];

  return (
    <section className="panel-grid network-scope-grid">
      <section className="network-scope-indicators" aria-label="Entity counters">
        {indicators.map((indicator) => (
          <article key={indicator.label} className="network-scope-indicator">
            <h2>{indicator.label}</h2>
            <p>{indicator.value}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <h2>Network Scope</h2>
        <p className="meta-line">
          Active network: <strong>{activeNetworkLabel}</strong>
        </p>
        <p className="meta-line">
          Available networks: <strong>{networks.length}</strong>
        </p>
        {networks.length === 0 ? (
          <p className="empty-copy">No network available. Create one to enable modeling and analysis.</p>
        ) : (
          <div className="network-scope-list-shell">
            <table className="data-table network-scope-list" aria-label="Networks list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Technical ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {networks.map((network) => {
                  const isActive = activeNetworkId === network.id;
                  const isFocused = focusedNetworkId === network.id;
                  return (
                    <tr
                      key={network.id}
                      className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                      aria-selected={isFocused}
                      tabIndex={0}
                      onClick={() => setFocusedNetworkId(network.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setFocusedNetworkId(network.id);
                        }
                      }}
                    >
                      <td>{network.name}</td>
                      <td><span className="technical-id">{network.technicalId}</span></td>
                      <td>{isActive ? <span className="network-scope-active-chip">Active</span> : "Available"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="row-actions compact">
          <button type="button" onClick={handleDuplicateActiveNetwork} disabled={!hasActiveNetwork}>
            Duplicate
          </button>
          <button type="button" onClick={handleDeleteActiveNetwork} disabled={!hasActiveNetwork}>
            Delete
          </button>
          <button type="button" onClick={handleOpenCreateNetworkForm}>
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              if (focusedNetworkId !== null) {
                handleSelectNetwork(focusedNetworkId);
              }
            }}
            disabled={focusedNetworkId === null || focusedNetworkId === activeNetworkId}
          >
            Set active
          </button>
          <button
            type="button"
            onClick={() => {
              if (focusedNetworkId !== null) {
                handleOpenEditNetworkForm(focusedNetworkId);
              }
            }}
            disabled={focusedNetworkId === null}
          >
            Edit
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>{isCreateMode ? "Create network" : isEditMode ? "Edit network" : "Network form"}</h2>
        {!isFormOpen ? (
          <>
            <p className="empty-copy">Choose Create or Edit from the network scope panel to open this form.</p>
          </>
        ) : (
          <form className="settings-grid" onSubmit={handleSubmitNetworkForm}>
            <label>
              Network name
              <input value={newNetworkName} onChange={(event) => setNewNetworkName(event.target.value)} placeholder="Vehicle platform A" />
            </label>
            <label>
              Network technical ID
              <input
                value={newNetworkTechnicalId}
                onChange={(event) => setNewNetworkTechnicalId(event.target.value)}
                placeholder="NET-PLAT-A"
              />
            </label>
            <label>
              Description (optional)
              <input
                value={newNetworkDescription}
                onChange={(event) => setNewNetworkDescription(event.target.value)}
                placeholder="Optional description"
              />
            </label>
            {networkFormError !== null ? <p className="form-error">{networkFormError}</p> : null}
            {networkTechnicalIdAlreadyUsed ? <p className="form-hint danger">Technical ID already used by another network.</p> : null}
            <div className="row-actions compact">
              <button type="submit">{isCreateMode ? "Create network" : "Save network"}</button>
              <button type="button" onClick={handleCloseNetworkForm}>
                Cancel
              </button>
            </div>
          </form>
        )}
        {isEditMode ? (
          <p className="meta-line">Edit mode targets the network currently selected in the list.</p>
        ) : null}
      </section>

    </section>
  );
}
