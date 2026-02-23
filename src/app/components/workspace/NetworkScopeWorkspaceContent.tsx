import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import { nextSortState, sortByNameAndTechnicalId } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { SortState } from "../../types/app-controller";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  networkSort: SortState;
  setNetworkSort: (value: SortState | ((current: SortState) => SortState)) => void;
  networkEntityCountsById: Partial<
    Record<
      NetworkId,
      {
        connectorCount: number;
        spliceCount: number;
        nodeCount: number;
        segmentCount: number;
        wireCount: number;
      }
    >
  >;
  activeNetworkId: NetworkId | null;
  handleSelectNetwork: (networkId: NetworkId) => void;
  handleDuplicateNetwork: (networkId: NetworkId | null) => void;
  handleDeleteNetwork: (networkId: NetworkId | null) => void;
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
  focusRequestedNetworkId: NetworkId | null;
  focusRequestedNetworkToken: number;
}

export function NetworkScopeWorkspaceContent({
  networks,
  networkSort,
  setNetworkSort,
  networkEntityCountsById,
  activeNetworkId,
  handleSelectNetwork,
  handleDuplicateNetwork,
  handleDeleteNetwork,
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
  handleSubmitNetworkForm,
  focusRequestedNetworkId,
  focusRequestedNetworkToken
}: NetworkScopeWorkspaceContentProps): ReactElement {
  const isCreateMode = networkFormMode === "create";
  const isEditMode = networkFormMode === "edit";
  const isFormOpen = isCreateMode || isEditMode;
  const [focusedNetworkId, setFocusedNetworkId] = useState<NetworkId | null>(activeNetworkId);
  const rowRefs = useRef<Partial<Record<NetworkId, HTMLTableRowElement | null>>>({});
  const lastHandledFocusRequestTokenRef = useRef<number>(-1);

  const sortedNetworks = useMemo(
    () =>
      sortByNameAndTechnicalId(
        networks,
        networkSort,
        (network) => network.name,
        (network) => network.technicalId
      ),
    [networkSort, networks]
  );
  const focusedNetwork = focusedNetworkId === null ? null : networks.find((network) => network.id === focusedNetworkId) ?? null;
  const focusedNetworkCounts =
    focusedNetworkId === null ? null : networkEntityCountsById[focusedNetworkId] ?? null;
  const networkSortIndicator = (field: "name" | "technicalId"): "asc" | "desc" | null => {
    if (networkSort.field !== field) {
      return null;
    }
    return networkSort.direction;
  };

  useEffect(() => {
    if (networks.length === 0) {
      setFocusedNetworkId(null);
      return;
    }

    if (focusedNetworkId === null) {
      return;
    }

    const hasFocusedNetwork = networks.some((network) => network.id === focusedNetworkId);
    if (hasFocusedNetwork) {
      return;
    }

    setFocusedNetworkId(activeNetworkId ?? networks[0]?.id ?? null);
  }, [activeNetworkId, focusedNetworkId, networks]);

  useEffect(() => {
    if (focusRequestedNetworkId === null) {
      return;
    }

    if (lastHandledFocusRequestTokenRef.current === focusRequestedNetworkToken) {
      return;
    }

    if (!networks.some((network) => network.id === focusRequestedNetworkId)) {
      return;
    }

    lastHandledFocusRequestTokenRef.current = focusRequestedNetworkToken;
    setFocusedNetworkId(focusRequestedNetworkId);
    if (typeof window === "undefined") {
      rowRefs.current[focusRequestedNetworkId]?.focus();
      return;
    }
    window.requestAnimationFrame(() => {
      rowRefs.current[focusRequestedNetworkId]?.focus();
    });
  }, [focusRequestedNetworkId, focusRequestedNetworkToken, networks]);

  const indicators = [
    { label: "Connectors", value: focusedNetworkCounts?.connectorCount ?? 0 },
    { label: "Splices", value: focusedNetworkCounts?.spliceCount ?? 0 },
    { label: "Nodes", value: focusedNetworkCounts?.nodeCount ?? 0 },
    { label: "Segments", value: focusedNetworkCounts?.segmentCount ?? 0 },
    { label: "Wires", value: focusedNetworkCounts?.wireCount ?? 0 }
  ];

  return (
    <section className="panel-grid network-scope-grid">
      <section className="panel network-scope-panel">
        <header className="list-panel-header">
          <h2>Network Scope</h2>
          <div className="list-panel-header-tools">
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() =>
                downloadCsvFile(
                  "network-scope",
                  ["Name", "Technical ID", "Status"],
                  sortedNetworks.map((network) => [
                    network.name,
                    network.technicalId,
                    activeNetworkId === network.id ? "Active" : "Available"
                  ])
                )
              }
              disabled={sortedNetworks.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
        {networks.length === 0 ? (
          <p className="empty-copy">No network available. Create one to enable modeling and analysis.</p>
        ) : (
          <>
            <div className="network-scope-list-shell">
              <table className="data-table network-scope-list" aria-label="Networks list">
                <colgroup>
                  <col className="network-scope-col-name" />
                  <col className="network-scope-col-technical-id" />
                  <col className="network-scope-col-status" />
                </colgroup>
                <thead>
                  <tr>
                    <th>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkSort((current) => nextSortState(current, "name"))}
                      >
                        Name{" "}
                        <span
                          className={
                            networkSortIndicator("name") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("name")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("name") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                    <th>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkSort((current) => nextSortState(current, "technicalId"))}
                      >
                        Technical ID{" "}
                        <span
                          className={
                            networkSortIndicator("technicalId") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("technicalId")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("technicalId") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedNetworks.map((network) => {
                    const isActive = activeNetworkId === network.id;
                    const isFocused = focusedNetworkId === network.id;
                    return (
                      <tr
                        key={network.id}
                        ref={(element) => {
                          rowRefs.current[network.id] = element;
                        }}
                        className={isFocused ? "is-selected is-focusable-row" : "is-focusable-row"}
                        aria-selected={isFocused}
                        tabIndex={0}
                        onClick={(event) => {
                          event.currentTarget.focus();
                          setFocusedNetworkId(network.id);
                          handleOpenEditNetworkForm(network.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setFocusedNetworkId(network.id);
                            handleOpenEditNetworkForm(network.id);
                          }
                        }}
                      >
                        <td>{network.name}</td>
                        <td><span className="technical-id">{network.technicalId}</span></td>
                        <td>
                          <span className={isActive ? "network-scope-status-chip is-active" : "network-scope-status-chip is-available"}>
                            {isActive ? "Active" : "Available"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="row-actions compact network-scope-list-actions">
          <button type="button" className="network-scope-create-button button-with-icon" onClick={handleOpenCreateNetworkForm}>
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => {
              if (focusedNetwork !== null) {
                handleSelectNetwork(focusedNetwork.id);
              }
            }}
            disabled={focusedNetwork === null || isCreateMode || focusedNetwork.id === activeNetworkId}
          >
            <span className="action-button-icon is-active" aria-hidden="true" />
            Set active
          </button>
          <button
            type="button"
            className="button-with-icon"
            onClick={() => {
              if (focusedNetwork !== null) {
                handleDuplicateNetwork(focusedNetwork.id);
              }
            }}
            disabled={focusedNetwork === null || isCreateMode}
          >
            <span className="action-button-icon is-duplicate" aria-hidden="true" />
            Duplicate
          </button>
          <button
            type="button"
            className="network-delete-button button-with-icon"
            onClick={() => {
              if (focusedNetwork !== null) {
                handleDeleteNetwork(focusedNetwork.id);
              }
            }}
            disabled={focusedNetwork === null || isCreateMode}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      </section>

      <section className="panel network-form-panel">
        <header className="network-form-header">
          <h2>{isCreateMode ? "Create network" : isEditMode ? "Edit network" : "Network form"}</h2>
          <span
            className={
              isCreateMode
                ? "network-form-mode-chip is-create"
                : isEditMode
                  ? "network-form-mode-chip is-edit"
                  : "network-form-mode-chip"
            }
          >
            {isCreateMode ? "Create mode" : isEditMode ? "Edit mode" : "Idle"}
          </span>
        </header>
        <section className="network-scope-indicators network-scope-indicators-form" aria-label="Focused network entity counters">
          {indicators.map((indicator) => (
            <article key={indicator.label} className="network-scope-indicator">
              <span className="network-scope-indicator-label">{indicator.label}</span>
              <strong className="network-scope-indicator-value">{indicator.value}</strong>
            </article>
          ))}
        </section>
        {!isFormOpen ? (
          <>
            <p className="empty-copy">Choose Create or Edit from the network scope panel to open this form.</p>
            <div className="row-actions compact idle-panel-actions">
              <button type="button" className="button-with-icon" onClick={handleOpenCreateNetworkForm}>
                <span className="action-button-icon is-new" aria-hidden="true" />
                Create
              </button>
            </div>
          </>
        ) : (
          <form className="settings-grid network-form-grid" onSubmit={handleSubmitNetworkForm}>
            <label className="stack-label">
              <span className="network-form-label">Network name</span>
              <input value={newNetworkName} onChange={(event) => setNewNetworkName(event.target.value)} placeholder="Vehicle platform A" />
            </label>
            <label className="stack-label">
              <span className="network-form-label">Network technical ID</span>
              <input
                value={newNetworkTechnicalId}
                onChange={(event) => setNewNetworkTechnicalId(event.target.value)}
                placeholder="NET-PLAT-A"
              />
            </label>
            <label className="stack-label">
              <span className="network-form-label">Description (optional)</span>
              <input
                value={newNetworkDescription}
                onChange={(event) => setNewNetworkDescription(event.target.value)}
                placeholder="Optional description"
              />
            </label>
            {networkFormError !== null ? <p className="form-error">{networkFormError}</p> : null}
            {networkTechnicalIdAlreadyUsed ? <p className="form-hint danger">Technical ID already used by another network.</p> : null}
            <div className="row-actions compact network-form-submit-actions">
              <button type="submit" className={isFormOpen ? "button-with-icon" : undefined}>
                {isCreateMode ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
                {isEditMode ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
                {isCreateMode ? "Create network" : "Save network"}
              </button>
              <button
                type="button"
                className={isEditMode ? "button-with-icon" : undefined}
                onClick={() => {
                  setFocusedNetworkId(null);
                  handleCloseNetworkForm();
                }}
              >
                {isEditMode ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

    </section>
  );
}
