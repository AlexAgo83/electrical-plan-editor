import { useEffect, useMemo, useState, type ChangeEvent, type ReactElement } from "react";
import type { CatalogItemId, Connector, ConnectorId, Splice, SpliceId, Wire } from "../../../core/entities";
import { buildWireEndpointReferenceEntries, type WireEndpointReferenceEntry } from "../../../core/wireReferences";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

interface CatalogAnalysisWorkspaceContentProps {
  isCatalogSubScreen: boolean;
  selectedCatalogItemId: CatalogItemId | null;
  linkedConnectors: Connector[];
  linkedSplices: Splice[];
  wires: Wire[];
  onCreateConnectorFromCatalog: (catalogItemId: CatalogItemId) => void;
  onCreateSpliceFromCatalog: (catalogItemId: CatalogItemId) => void;
  onOpenConnector: (connectorId: ConnectorId) => void;
  onOpenSplice: (spliceId: SpliceId) => void;
  onUpdateWireEndpointReferenceName: (
    kind: "connection" | "seal",
    reference: string,
    nextName: string
  ) => Promise<boolean | { apply: () => void }> | boolean | { apply: () => void };
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
  technicalIdLabel: string;
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

function WireEndpointReferenceNamesSection({
  heading,
  kind,
  entries,
  onUpdateWireEndpointReferenceName
}: {
  heading: string;
  kind: "connection" | "seal";
  entries: WireEndpointReferenceEntry[];
  onUpdateWireEndpointReferenceName: (
    kind: "connection" | "seal",
    reference: string,
    nextName: string
  ) => Promise<boolean | { apply: () => void }> | boolean | { apply: () => void };
}): ReactElement {
  const [draftsByReference, setDraftsByReference] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftsByReference(
      Object.fromEntries(entries.map((entry) => [entry.reference, entry.name ?? ""]))
    );
  }, [entries]);

  const visibleEntries = useMemo(() => entries, [entries]);

  if (visibleEntries.length === 0) {
    return (
      <article className="panel">
        <header className="analysis-wire-route-header">
          <h2>{heading}</h2>
        </header>
        <p className="empty-copy">No {kind} references yet.</p>
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
            <th>Reference</th>
            <th>Name</th>
            <th>Count</th>
            <th className="validation-actions-cell">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleEntries.map((entry) => {
            const draftValue = draftsByReference[entry.reference] ?? "";
            return (
              <tr key={entry.reference} className="data-table-editable-row">
                <td className="technical-id">{entry.reference}</td>
                <td>
                  <input
                    className="data-table-text-input"
                    aria-label={`${heading} name for ${entry.reference}`}
                    value={draftValue}
                    maxLength={120}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      const nextValue = event.target.value;
                      setDraftsByReference((current) => ({
                        ...current,
                        [entry.reference]: nextValue
                      }));
                    }}
                    placeholder="Optional"
                  />
                </td>
                <td>{entry.quantity}</td>
                <td className="validation-actions-cell">
                  <button
                    type="button"
                    className="validation-row-go-to-button button-with-icon"
                    onClick={() => {
                      void (async () => {
                        const result = await Promise.resolve(onUpdateWireEndpointReferenceName(kind, entry.reference, draftValue));
                        if (result !== false && result !== true) {
                          result.apply();
                        }
                      })();
                    }}
                  >
                    <span className="action-button-icon is-save" aria-hidden="true" />
                    Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <TableEntryCountFooter count={visibleEntries.length} />
    </article>
  );
}

export function CatalogAnalysisWorkspaceContent({
  isCatalogSubScreen,
  selectedCatalogItemId,
  linkedConnectors,
  linkedSplices,
  wires,
  onCreateConnectorFromCatalog,
  onCreateSpliceFromCatalog,
  onOpenConnector,
  onOpenSplice,
  onUpdateWireEndpointReferenceName
}: CatalogAnalysisWorkspaceContentProps): ReactElement {
  const isMobileViewport = useIsMobileViewport();
  const wireReferenceEntries = useMemo(() => buildWireEndpointReferenceEntries(wires), [wires]);

  if (!isCatalogSubScreen) {
    return <section className="panel-grid analysis-panel-grid" hidden />;
  }

  const hasSelection = selectedCatalogItemId !== null;

  return (
    <section className="panel-grid analysis-panel-grid">
      {!hasSelection ? (
        <article className="panel">
          <header className="analysis-wire-route-header">
            <h2>Catalog analysis</h2>
          </header>
          <p className="empty-copy">Select a catalog item to inspect usage.</p>
        </article>
      ) : null}

      {hasSelection ? (
        <>
          <CatalogUsageTableSection
            heading="Connectors"
            rows={linkedConnectors}
            technicalIdLabel={isMobileViewport ? "ID" : "Technical ID"}
            createLabel="Create Connector"
            createIconClass="is-connectors"
            onCreate={() => onCreateConnectorFromCatalog(selectedCatalogItemId)}
            onGoTo={(id) => onOpenConnector(id as ConnectorId)}
          />
          <CatalogUsageTableSection
            heading="Splices"
            rows={linkedSplices}
            technicalIdLabel={isMobileViewport ? "ID" : "Technical ID"}
            createLabel="Create Splice"
            createIconClass="is-splices"
            onCreate={() => onCreateSpliceFromCatalog(selectedCatalogItemId)}
            onGoTo={(id) => onOpenSplice(id as SpliceId)}
          />
        </>
      ) : null}
      <WireEndpointReferenceNamesSection
        heading="Wire endpoint references"
        kind="connection"
        entries={wireReferenceEntries.connection}
        onUpdateWireEndpointReferenceName={onUpdateWireEndpointReferenceName}
      />
      <WireEndpointReferenceNamesSection
        heading="Wire seal references"
        kind="seal"
        entries={wireReferenceEntries.seal}
        onUpdateWireEndpointReferenceName={onUpdateWireEndpointReferenceName}
      />
    </section>
  );
}

export type { CatalogAnalysisWorkspaceContentProps };
