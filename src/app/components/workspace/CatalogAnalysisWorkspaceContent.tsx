import { useState, type ReactElement } from "react";
import type { CatalogItemId, Connector, ConnectorId, Splice, SpliceId } from "../../../core/entities";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface CatalogAnalysisWorkspaceContentProps {
  isCatalogSubScreen: boolean;
  selectedCatalogItemId: CatalogItemId | null;
  linkedConnectors: Connector[];
  linkedSplices: Splice[];
  onCreateConnectorFromCatalog: (catalogItemId: CatalogItemId) => void;
  onCreateSpliceFromCatalog: (catalogItemId: CatalogItemId) => void;
  onOpenConnector: (connectorId: ConnectorId) => void;
  onOpenSplice: (spliceId: SpliceId) => void;
}

type CatalogUsageMode = "connectors" | "splices";

function CatalogUsageTableSection({
  activeMode,
  setActiveMode,
  rows,
  technicalIdLabel,
  onGoTo,
  createLabel,
  createIconClass,
  onCreate,
  linkedConnectorCount,
  linkedSpliceCount
}: {
  activeMode: CatalogUsageMode;
  setActiveMode: (mode: CatalogUsageMode) => void;
  rows: Array<Connector | Splice>;
  technicalIdLabel: string;
  onGoTo: (id: string) => void;
  createLabel: "Create Connector" | "Create Splice";
  createIconClass: "is-connectors" | "is-splices";
  onCreate: () => void;
  linkedConnectorCount: number;
  linkedSpliceCount: number;
}): ReactElement {
  const activeLabel = activeMode === "connectors" ? "connectors" : "splices";
  const renderHeader = () => (
    <header className="analysis-wire-route-header catalog-usage-header">
      <h2>Used by</h2>
      <div className="chip-group" aria-label="Catalog usage type">
        <button
          type="button"
          aria-label={`Connectors ${linkedConnectorCount}`}
          aria-pressed={activeMode === "connectors"}
          className={`filter-chip${activeMode === "connectors" ? " is-active" : ""}`}
          onClick={() => setActiveMode("connectors")}
        >
          Connectors
          <span className="filter-chip-count">{linkedConnectorCount}</span>
        </button>
        <button
          type="button"
          aria-label={`Splices ${linkedSpliceCount}`}
          aria-pressed={activeMode === "splices"}
          className={`filter-chip${activeMode === "splices" ? " is-active" : ""}`}
          onClick={() => setActiveMode("splices")}
        >
          Splices
          <span className="filter-chip-count">{linkedSpliceCount}</span>
        </button>
      </div>
    </header>
  );

  if (rows.length === 0) {
    return (
      <article className="panel">
        {renderHeader()}
        <p className="empty-copy">No linked {activeLabel} for the selected catalog item.</p>
        <div className="row-actions compact catalog-usage-empty-actions">
          <button type="button" className="button-with-icon" onClick={onCreate}>
            <span className={`action-button-icon ${createIconClass}`} aria-hidden="true" />
            {createLabel}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="panel">
      {renderHeader()}
      <table className="data-table catalog-usage-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>{technicalIdLabel}</th>
            <th className="validation-actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name.trim().length > 0 ? row.name : row.technicalId}</td>
              <td className="technical-id">{row.technicalId}</td>
              <td className="validation-actions-cell">
                <button
                  type="button"
                  aria-label="Go to"
                  className="validation-row-go-to-button button-with-icon"
                  onClick={() => onGoTo(row.id)}
                >
                  <span className="action-button-icon is-open" aria-hidden="true" />
                  <span className="catalog-usage-go-to-label">Go to</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TableEntryCountFooter count={rows.length} />
      <div className="row-actions compact">
        <button type="button" className="button-with-icon" onClick={onCreate}>
          <span className={`action-button-icon ${createIconClass}`} aria-hidden="true" />
          {createLabel}
        </button>
      </div>
    </article>
  );
}

export function CatalogAnalysisWorkspaceContent({
  isCatalogSubScreen,
  selectedCatalogItemId,
  linkedConnectors,
  linkedSplices,
  onCreateConnectorFromCatalog,
  onCreateSpliceFromCatalog,
  onOpenConnector,
  onOpenSplice
}: CatalogAnalysisWorkspaceContentProps): ReactElement {
  const isMobileViewport = useIsMobileViewport();
  const [activeUsageMode, setActiveUsageMode] = useState<CatalogUsageMode>("connectors");

  if (!isCatalogSubScreen) {
    return <section className="panel-grid analysis-panel-grid" hidden />;
  }

  const hasSelection = selectedCatalogItemId !== null;
  const activeUsageRows = activeUsageMode === "connectors" ? linkedConnectors : linkedSplices;

  return (
    <section className="panel-grid analysis-panel-grid">
      {hasSelection ? (
        <CatalogUsageTableSection
          activeMode={activeUsageMode}
          setActiveMode={setActiveUsageMode}
          rows={activeUsageRows}
          technicalIdLabel={isMobileViewport ? "ID" : "Technical ID"}
          createLabel={activeUsageMode === "connectors" ? "Create Connector" : "Create Splice"}
          createIconClass={activeUsageMode === "connectors" ? "is-connectors" : "is-splices"}
          onCreate={() => {
            if (activeUsageMode === "connectors") {
              onCreateConnectorFromCatalog(selectedCatalogItemId);
            } else {
              onCreateSpliceFromCatalog(selectedCatalogItemId);
            }
          }}
          onGoTo={(id) => {
            if (activeUsageMode === "connectors") {
              onOpenConnector(id as ConnectorId);
            } else {
              onOpenSplice(id as SpliceId);
            }
          }}
          linkedConnectorCount={linkedConnectors.length}
          linkedSpliceCount={linkedSplices.length}
        />
      ) : null}
    </section>
  );
}

export type { CatalogAnalysisWorkspaceContentProps };
