import type { FormEvent, ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  activeNetworkId: NetworkId | null;
  activeNetworkLabel: string;
  hasActiveNetwork: boolean;
  handleSelectNetwork: (networkId: NetworkId) => void;
  handleDuplicateActiveNetwork: () => void;
  handleDeleteActiveNetwork: () => void;
  renameNetworkName: string;
  setRenameNetworkName: (value: string) => void;
  handleRenameActiveNetwork: () => void;
  newNetworkName: string;
  setNewNetworkName: (value: string) => void;
  newNetworkTechnicalId: string;
  setNewNetworkTechnicalId: (value: string) => void;
  newNetworkDescription: string;
  setNewNetworkDescription: (value: string) => void;
  networkFormError: string | null;
  networkTechnicalIdAlreadyUsed: boolean;
  handleCreateNetwork: (event: FormEvent<HTMLFormElement>) => void;
}

export function NetworkScopeWorkspaceContent({
  networks,
  activeNetworkId,
  activeNetworkLabel,
  hasActiveNetwork,
  handleSelectNetwork,
  handleDuplicateActiveNetwork,
  handleDeleteActiveNetwork,
  renameNetworkName,
  setRenameNetworkName,
  handleRenameActiveNetwork,
  newNetworkName,
  setNewNetworkName,
  newNetworkTechnicalId,
  setNewNetworkTechnicalId,
  newNetworkDescription,
  setNewNetworkDescription,
  networkFormError,
  networkTechnicalIdAlreadyUsed,
  handleCreateNetwork
}: NetworkScopeWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
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
        </div>
        <label>
          Rename active network
          <input
            value={renameNetworkName}
            onChange={(event) => setRenameNetworkName(event.target.value)}
            placeholder="Network name"
            disabled={!hasActiveNetwork}
          />
        </label>
        <div className="row-actions compact">
          <button type="button" onClick={handleRenameActiveNetwork} disabled={!hasActiveNetwork}>
            Rename
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Create network</h2>
        <form className="settings-grid" onSubmit={handleCreateNetwork}>
          <label>
            New network name
            <input value={newNetworkName} onChange={(event) => setNewNetworkName(event.target.value)} placeholder="Vehicle platform A" />
          </label>
          <label>
            New network technical ID
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
            <button type="submit">Create network</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>Network lifecycle</h2>
        {!hasActiveNetwork ? (
          <p className="empty-copy">
            No active network is currently selected.
          </p>
        ) : (
          <p className="empty-copy">
            Use duplicate, rename, and delete actions to manage the current network scope.
          </p>
        )}
      </section>
    </section>
  );
}
