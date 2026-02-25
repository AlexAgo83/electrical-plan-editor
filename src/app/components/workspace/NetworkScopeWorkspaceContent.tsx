import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactElement } from "react";
import type { NetworkId } from "../../../core/entities";
import { focusElementWithoutScroll, nextSortState, sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { SortState } from "../../types/app-controller";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

interface NetworkScopeWorkspaceContentProps {
  networks: Array<{ id: NetworkId; name: string; technicalId: string }>;
  networkSort: SortState;
  setNetworkSort: (value: SortState | ((current: SortState) => SortState)) => void;
  networkEntityCountsById: Partial<
    Record<
      NetworkId,
      {
        catalogCount: number;
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
  handleOpenNetworkInModeling: (networkId: NetworkId) => void;
  handleDuplicateNetwork: (networkId: NetworkId | null) => void;
  handleExportActiveNetwork: () => void;
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
  onOpenOnboardingHelp?: () => void;
}

export function NetworkScopeWorkspaceContent({
  networks,
  networkSort,
  setNetworkSort,
  networkEntityCountsById,
  activeNetworkId,
  handleSelectNetwork,
  handleOpenNetworkInModeling,
  handleDuplicateNetwork,
  handleExportActiveNetwork,
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
  focusRequestedNetworkToken,
  onOpenOnboardingHelp
}: NetworkScopeWorkspaceContentProps): ReactElement {
  type NetworkScopeFilterField = "name" | "technicalId" | "any";
  type NetworkScopeTableSortField = "name" | "technicalId" | "status";
  const isCreateMode = networkFormMode === "create";
  const isEditMode = networkFormMode === "edit";
  const isFormOpen = isCreateMode || isEditMode;
  const [focusedNetworkId, setFocusedNetworkId] = useState<NetworkId | null>(null);
  const [hasExplicitNetworkSelection, setHasExplicitNetworkSelection] = useState(false);
  const [networkFilterField, setNetworkFilterField] = useState<NetworkScopeFilterField>("any");
  const [networkFilterQuery, setNetworkFilterQuery] = useState("");
  const [networkTableSort, setNetworkTableSort] = useState<{ field: NetworkScopeTableSortField; direction: "asc" | "desc" }>({
    field: networkSort.field === "technicalId" ? "technicalId" : "name",
    direction: networkSort.direction
  });
  const rowRefs = useRef<Partial<Record<NetworkId, HTMLTableRowElement | null>>>({});
  const lastHandledFocusRequestTokenRef = useRef<number>(-1);

  const sortedNetworks = useMemo(
    () =>
      sortByTableColumns(
        networks,
        networkTableSort,
        (network, field) => {
          if (field === "name") return network.name;
          if (field === "technicalId") return network.technicalId;
          return activeNetworkId === network.id ? "active" : "available";
        },
        (network) => `${network.technicalId}::${network.name}`
      ),
    [activeNetworkId, networkTableSort, networks]
  );
  const focusedNetwork = focusedNetworkId === null ? null : networks.find((network) => network.id === focusedNetworkId) ?? null;
  const showNetworkFormPanel = isCreateMode || (isEditMode && focusedNetwork !== null && hasExplicitNetworkSelection);
  const focusedNetworkCounts =
    focusedNetworkId === null ? null : networkEntityCountsById[focusedNetworkId] ?? null;
  const networkSortIndicator = (field: NetworkScopeTableSortField): "asc" | "desc" | null => {
    if (networkTableSort.field !== field) {
      return null;
    }
    return networkTableSort.direction;
  };
  const setNetworkTableSortField = (field: NetworkScopeTableSortField) => {
    setNetworkTableSort((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }));
    if (field === "name" || field === "technicalId") {
      setNetworkSort((current) => nextSortState(current, field));
    }
  };
  const normalizedNetworkFilterQuery = networkFilterQuery.trim().toLocaleLowerCase();
  const visibleNetworks = useMemo(() => {
    if (normalizedNetworkFilterQuery.length === 0) {
      return sortedNetworks;
    }

    return sortedNetworks.filter((network) => {
      const nameText = network.name.toLocaleLowerCase();
      const technicalIdText = network.technicalId.toLocaleLowerCase();
      if (networkFilterField === "name") {
        return nameText.includes(normalizedNetworkFilterQuery);
      }
      if (networkFilterField === "technicalId") {
        return technicalIdText.includes(normalizedNetworkFilterQuery);
      }
      return `${nameText} ${technicalIdText}`.includes(normalizedNetworkFilterQuery);
    });
  }, [networkFilterField, normalizedNetworkFilterQuery, sortedNetworks]);
  const networkFilterPlaceholder =
    networkFilterField === "name"
      ? "Network name"
      : networkFilterField === "technicalId"
        ? "Technical ID"
        : "Name or technical ID";

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
      focusElementWithoutScroll(rowRefs.current[focusRequestedNetworkId]);
      return;
    }
    window.requestAnimationFrame(() => {
      focusElementWithoutScroll(rowRefs.current[focusRequestedNetworkId]);
    });
  }, [focusRequestedNetworkId, focusRequestedNetworkToken, networks]);

  useEffect(() => {
    if (!isEditMode || focusedNetwork !== null) {
      return;
    }

    handleCloseNetworkForm();
  }, [focusedNetwork, handleCloseNetworkForm, isEditMode]);

  useEffect(() => {
    if (isCreateMode) {
      setHasExplicitNetworkSelection(false);
      return;
    }

    if (!isEditMode) {
      setHasExplicitNetworkSelection(false);
    }
  }, [isCreateMode, isEditMode]);

  const indicators = [
    { label: "Catalog", value: focusedNetworkCounts?.catalogCount ?? 0 },
    { label: "Connectors", value: focusedNetworkCounts?.connectorCount ?? 0 },
    { label: "Splices", value: focusedNetworkCounts?.spliceCount ?? 0 },
    { label: "Nodes", value: focusedNetworkCounts?.nodeCount ?? 0 },
    { label: "Segments", value: focusedNetworkCounts?.segmentCount ?? 0 },
    { label: "Wires", value: focusedNetworkCounts?.wireCount ?? 0 }
  ];

  return (
    <section className="panel-grid network-scope-grid">
      <section className="panel network-scope-panel" data-onboarding-panel="network-scope">
        <header className="list-panel-header">
          <h2>Network Scope</h2>
          <div className="list-panel-header-tools">
            <div className="list-panel-header-tools-row">
              <button
                type="button"
                className="filter-chip table-export-button"
                onClick={() =>
                  downloadCsvFile(
                    "network-scope",
                    ["Name", "Technical ID", "Status"],
                    visibleNetworks.map((network) => [
                      network.name,
                      network.technicalId,
                      activeNetworkId === network.id ? "Active" : "Available"
                    ])
                  )
                }
                disabled={visibleNetworks.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                CSV
              </button>
              {onOpenOnboardingHelp !== undefined ? (
                <button
                  type="button"
                  className="filter-chip onboarding-help-button"
                  onClick={onOpenOnboardingHelp}
                >
                  <span className="action-button-icon is-help" aria-hidden="true" />
                  <span>Help</span>
                </button>
              ) : null}
            </div>
            <div className="list-panel-header-tools-row">
              <TableFilterBar
                label="Filter"
                fieldLabel="Network filter field"
                fieldValue={networkFilterField}
                onFieldChange={(value) => setNetworkFilterField(value as NetworkScopeFilterField)}
                fieldOptions={[
                  { value: "any", label: "Any" },
                  { value: "name", label: "Name" },
                  { value: "technicalId", label: "Technical ID" }
                ]}
                queryValue={networkFilterQuery}
                onQueryChange={setNetworkFilterQuery}
                placeholder={networkFilterPlaceholder}
              />
            </div>
          </div>
        </header>
        {networks.length === 0 ? (
          <p className="empty-copy">No network available. Create one to enable modeling and analysis.</p>
        ) : visibleNetworks.length === 0 ? (
          <>
            <p className="empty-copy">No network matches the current filters.</p>
            <TableEntryCountFooter count={0} />
          </>
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
                        onClick={() => setNetworkTableSortField("name")}
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
                        onClick={() => setNetworkTableSortField("technicalId")}
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
                    <th>
                      <button
                        type="button"
                        className="sort-header-button"
                        onClick={() => setNetworkTableSortField("status")}
                      >
                        Status{" "}
                        <span
                          className={
                            networkSortIndicator("status") === null
                              ? "sort-indicator"
                              : `sort-indicator is-${networkSortIndicator("status")}`
                          }
                          aria-hidden="true"
                        >
                          {networkSortIndicator("status") === null ? "" : "▲"}
                        </span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleNetworks.map((network) => {
                    const isActive = activeNetworkId === network.id;
                    const isFocused = focusedNetworkId === network.id;
                    const canSetActive = !isCreateMode && !isActive;
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
                          setHasExplicitNetworkSelection(true);
                          handleOpenEditNetworkForm(network.id);
                        }}
                        onDoubleClick={() => {
                          if (!canSetActive) {
                            return;
                          }
                          handleSelectNetwork(network.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setFocusedNetworkId(network.id);
                            setHasExplicitNetworkSelection(true);
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
            <TableEntryCountFooter count={visibleNetworks.length} />
          </>
        )}
        <div className="row-actions compact network-scope-list-actions">
          <div className="network-scope-list-actions-row">
            <button
              type="button"
              className="button-with-icon"
              onClick={() => {
                if (focusedNetwork !== null) {
                  handleOpenNetworkInModeling(focusedNetwork.id);
                }
              }}
              disabled={focusedNetwork === null || isCreateMode}
            >
              <span className="action-button-icon is-open" aria-hidden="true" />
              Open
            </button>
            <button type="button" className="network-scope-create-button button-with-icon" onClick={handleOpenCreateNetworkForm}>
              <span className="action-button-icon is-new" aria-hidden="true" />
              New
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
              className="button-with-icon network-scope-export-button"
              onClick={handleExportActiveNetwork}
              disabled={activeNetworkId === null || isCreateMode}
            >
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="panel network-form-panel" hidden={!showNetworkFormPanel}>
        <header className="network-form-header">
          <h2>{isCreateMode ? "Create network" : "Edit network"}</h2>
          <span
            className={
              isCreateMode
                ? "network-form-mode-chip is-create"
                : isEditMode
                  ? "network-form-mode-chip is-edit"
                  : "network-form-mode-chip"
            }
          >
            {isCreateMode ? "Create mode" : "Edit mode"}
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
        {showNetworkFormPanel ? (
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
              {isEditMode ? (
                <button
                  type="button"
                  className="button-with-icon"
                  onClick={() => {
                    if (focusedNetwork !== null) {
                      handleSelectNetwork(focusedNetwork.id);
                    }
                  }}
                  disabled={focusedNetwork === null || focusedNetwork.id === activeNetworkId}
                >
                  <span className="action-button-icon is-active" aria-hidden="true" />
                  Set active
                </button>
              ) : null}
              {isEditMode ? (
                <button
                  type="button"
                  className="network-delete-button button-with-icon"
                  onClick={() => {
                    if (focusedNetwork !== null) {
                      handleDeleteNetwork(focusedNetwork.id);
                    }
                  }}
                  disabled={focusedNetwork === null}
                >
                  <span className="action-button-icon is-delete" aria-hidden="true" />
                  Delete
                </button>
              ) : null}
              <button
                type="button"
                className={isEditMode ? "button-with-icon" : undefined}
                onClick={() => {
                  setFocusedNetworkId(null);
                  setHasExplicitNetworkSelection(false);
                  handleCloseNetworkForm();
                }}
              >
                {isEditMode ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </section>

    </section>
  );
}
