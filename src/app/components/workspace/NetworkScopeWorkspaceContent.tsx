import type { FormEvent, ReactElement } from "react";
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
  handleOpenEditNetworkForm: () => void;
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

  return (
    <section className="panel-grid">
      <section className="stats-grid" aria-label="Entity counters">
        <article>
          <h2>Connectors</h2>
          <p>{connectorCount}</p>
        </article>
        <article>
          <h2>Splices</h2>
          <p>{spliceCount}</p>
        </article>
        <article>
          <h2>Nodes</h2>
          <p>{nodeCount}</p>
        </article>
        <article>
          <h2>Segments</h2>
          <p>{segmentCount}</p>
        </article>
        <article>
          <h2>Wires</h2>
          <p>{wireCount}</p>
        </article>
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
          <label>
            Active network
            <select value={activeNetworkId ?? ""} onChange={(event) => handleSelectNetwork(event.target.value as NetworkId)}>
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name} ({network.technicalId})
                </option>
              ))}
            </select>
          </label>
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
          <button type="button" onClick={handleOpenEditNetworkForm} disabled={!hasActiveNetwork}>
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
          <p className="meta-line">Edit mode targets the current active network selected on the left panel.</p>
        ) : null}
      </section>

    </section>
  );
}
