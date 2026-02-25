import type { ReactElement } from "react";
import type { CatalogItemId, Connector, ConnectorId, Splice, SpliceId } from "../../../core/entities";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface CatalogAnalysisWorkspaceContentProps {
  isCatalogSubScreen: boolean;
  selectedCatalogItemId: CatalogItemId | null;
  selectedCatalogItemManufacturerReference: string | null;
  linkedConnectors: Connector[];
  linkedSplices: Splice[];
  onCreateConnectorFromCatalog: (catalogItemId: CatalogItemId) => void;
  onCreateSpliceFromCatalog: (catalogItemId: CatalogItemId) => void;
  onOpenConnector: (connectorId: ConnectorId) => void;
  onOpenSplice: (spliceId: SpliceId) => void;
}

function CatalogUsageTableSection({
  heading,
  rows,
  technicalIdLabel,
  onGoTo,
  createLabel,
  createIconClass,
  onCreate
}: {
  heading: "Connectors" | "Splices";
  rows: Array<Connector | Splice>;
  technicalIdLabel: "Technical ID";
  onGoTo: (id: string) => void;
  createLabel: "Create Connector" | "Create Splice";
  createIconClass: "is-connectors" | "is-splices";
  onCreate: () => void;
}): ReactElement {
  if (rows.length === 0) {
    return (
      <article className="panel">
        <header className="analysis-wire-route-header">
          <h2>{heading}</h2>
        </header>
        <p className="empty-copy">No linked {heading.toLocaleLowerCase()} for the selected catalog item.</p>
        <div className="row-actions compact">
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
      <header className="analysis-wire-route-header">
        <h2>{heading}</h2>
      </header>
      <table className="data-table">
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
                  className="validation-row-go-to-button button-with-icon"
                  onClick={() => onGoTo(row.id)}
                >
                  <span className="action-button-icon is-open" aria-hidden="true" />
                  Go to
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
  selectedCatalogItemManufacturerReference,
  linkedConnectors,
  linkedSplices,
  onCreateConnectorFromCatalog,
  onCreateSpliceFromCatalog,
  onOpenConnector,
  onOpenSplice
}: CatalogAnalysisWorkspaceContentProps): ReactElement {
  if (!isCatalogSubScreen) {
    return <section className="panel-grid analysis-panel-grid" hidden />;
  }

  const hasSelection = selectedCatalogItemId !== null;
  const summaryLabel = `${linkedConnectors.length} connectors / ${linkedSplices.length} splices`;

  return (
    <section className="panel-grid analysis-panel-grid">
      <article className="panel">
        <header className="analysis-wire-route-header">
          <h2>Catalog analysis</h2>
        </header>
        {!hasSelection ? (
          <p className="empty-copy">Select a catalog item to inspect usage.</p>
        ) : (
          <div className="analysis-wire-route-content">
            <article className="analysis-wire-identity">
              <span className="analysis-wire-identity-label">Selected catalog item</span>
              <p className="analysis-wire-identity-value">{selectedCatalogItemManufacturerReference ?? selectedCatalogItemId}</p>
            </article>
            <article className="analysis-wire-route-current">
              <h3>Usage summary</h3>
              <p>{summaryLabel}</p>
            </article>
          </div>
        )}
      </article>

      {hasSelection ? (
        <>
          <CatalogUsageTableSection
            heading="Connectors"
            rows={linkedConnectors}
            technicalIdLabel="Technical ID"
            createLabel="Create Connector"
            createIconClass="is-connectors"
            onCreate={() => onCreateConnectorFromCatalog(selectedCatalogItemId)}
            onGoTo={(id) => onOpenConnector(id as ConnectorId)}
          />
          <CatalogUsageTableSection
            heading="Splices"
            rows={linkedSplices}
            technicalIdLabel="Technical ID"
            createLabel="Create Splice"
            createIconClass="is-splices"
            onCreate={() => onCreateSpliceFromCatalog(selectedCatalogItemId)}
            onGoTo={(id) => onOpenSplice(id as SpliceId)}
          />
        </>
      ) : null}
    </section>
  );
}

export type { CatalogAnalysisWorkspaceContentProps };
