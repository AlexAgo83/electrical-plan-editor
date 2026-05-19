import { useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type ReactElement, type RefObject, type SetStateAction } from "react";
import type { CatalogItem, CatalogItemId, Wire } from "../../../core/entities";
import { buildWireEndpointReferenceEntries, type WireEndpointReferenceEntry } from "../../../core/wireReferences";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { compareSortableValues } from "../../lib/app-utils-shared";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import { formatPriceWithCurrencySymbol } from "../../lib/pricing";
import type { ImportExportStatus, WorkspaceCurrencyCode } from "../../types/app-controller";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

type CatalogFilterField = "manufacturerReference" | "name" | "any";
type CatalogSortField = "manufacturerReference" | "name" | "connectionCount" | "unitPriceExclTax";
type CatalogTableView = "items" | "endpointRefs" | "sealRefs";
type SortDirection = "asc" | "desc";
type WireEndpointReferenceNameHandler = (
  kind: "connection" | "seal",
  reference: string,
  nextName: string
) => Promise<boolean | { apply: () => void }> | boolean | { apply: () => void };

interface ModelingCatalogListPanelProps {
  isCatalogSubScreen: boolean;
  catalogItems: CatalogItem[];
  selectedCatalogItemId: CatalogItemId | null;
  catalogFormMode: "idle" | "create" | "edit";
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  isSelectedCatalogItemReferenced: boolean;
  activeView: CatalogTableView;
  setActiveView: Dispatch<SetStateAction<CatalogTableView>>;
  wires: Wire[];
  onOpenCreateCatalogItem: () => void;
  onEditCatalogItem: (item: CatalogItem) => void;
  onDeleteCatalogItem: (catalogItemId: CatalogItemId) => void;
  onUpdateWireEndpointReferenceName: WireEndpointReferenceNameHandler;
  onExportCatalogCsv?: () => void;
  onOpenCatalogCsvImportPicker?: () => void;
  catalogCsvImportFileInputRef?: RefObject<HTMLInputElement | null>;
  onCatalogCsvImportFileChange?: (event: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  catalogCsvImportExportStatus?: ImportExportStatus | null;
  catalogCsvLastImportSummaryLine?: string | null;
  onOpenCatalogOnboardingHelp?: () => void;
}

export function ModelingCatalogListPanel({
  isCatalogSubScreen,
  catalogItems,
  selectedCatalogItemId,
  catalogFormMode,
  workspaceCurrencyCode,
  isSelectedCatalogItemReferenced,
  activeView,
  setActiveView,
  wires,
  onOpenCreateCatalogItem,
  onEditCatalogItem,
  onDeleteCatalogItem,
  onUpdateWireEndpointReferenceName,
  onExportCatalogCsv,
  onOpenCatalogCsvImportPicker,
  catalogCsvImportFileInputRef,
  onCatalogCsvImportFileChange,
  catalogCsvImportExportStatus = null,
  catalogCsvLastImportSummaryLine = null,
  onOpenCatalogOnboardingHelp
}: ModelingCatalogListPanelProps): ReactElement {
  void isSelectedCatalogItemReferenced;
  const isMobileViewport = useIsMobileViewport();
  const [filterField, setFilterField] = useState<CatalogFilterField>("any");
  const [filterQuery, setFilterQuery] = useState("");
  const [sortState, setSortState] = useState<{ field: CatalogSortField; direction: SortDirection }>({
    field: "manufacturerReference",
    direction: "asc"
  });

  const normalizedFilter = filterQuery.trim().toLocaleLowerCase();
  const filteredCatalogItems = useMemo(() => {
    if (normalizedFilter.length === 0) {
      return catalogItems;
    }
    return catalogItems.filter((item) => {
      const searchableName = item.name ?? "";
      const values =
        filterField === "manufacturerReference"
          ? [item.manufacturerReference]
          : filterField === "name"
            ? [searchableName]
            : [item.manufacturerReference, searchableName];
      return values.some((value) => value.toLocaleLowerCase().includes(normalizedFilter));
    });
  }, [catalogItems, filterField, normalizedFilter]);

  const sortedCatalogItems = useMemo(() => {
    return [...filteredCatalogItems].sort((left, right) => {
      const getValue = (item: CatalogItem, field: CatalogSortField) => {
        if (field === "manufacturerReference") return item.manufacturerReference;
        if (field === "name") return item.name ?? "";
        if (field === "connectionCount") return item.connectionCount;
        return item.unitPriceExclTax ?? null;
      };
      const primary = compareSortableValues(getValue(left, sortState.field), getValue(right, sortState.field), sortState.direction);
      if (primary !== 0) {
        return primary;
      }
      return left.manufacturerReference.localeCompare(right.manufacturerReference, undefined, { sensitivity: "base" });
    });
  }, [filteredCatalogItems, sortState]);

  const selectedCatalogItem =
    selectedCatalogItemId === null ? null : (catalogItems.find((item) => item.id === selectedCatalogItemId) ?? null);
  const filterPlaceholder =
    filterField === "manufacturerReference"
      ? "Manufacturer reference"
      : filterField === "name"
        ? "Name"
        : "Manufacturer reference or name";
  const sortIndicator = (field: CatalogSortField) =>
    sortState.field === field ? (sortState.direction === "asc" ? "▲" : "▼") : "";
  const toggleSort = (field: CatalogSortField) =>
    setSortState((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }));
  const wireReferenceEntries = useMemo(() => buildWireEndpointReferenceEntries(wires), [wires]);
  const isItemsView = activeView === "items";

  return (
    <article className="panel" hidden={!isCatalogSubScreen} data-onboarding-panel="modeling-catalog">
      <header className="list-panel-header list-panel-header-mobile-inline-tools">
        <h2>Catalog</h2>
        <div className="list-panel-header-tools">
          <div className="list-panel-header-tools-row is-title-actions">
            <div className="chip-group" aria-label="Catalog tables">
              <button
                type="button"
                aria-pressed={activeView === "items"}
                className={`filter-chip${activeView === "items" ? " is-active" : ""}`}
                onClick={() => setActiveView("items")}
              >
                Items
              </button>
              <button
                type="button"
                aria-pressed={activeView === "endpointRefs"}
                className={`filter-chip${activeView === "endpointRefs" ? " is-active" : ""}`}
                onClick={() => setActiveView("endpointRefs")}
              >
                Endpoint refs
              </button>
              <button
                type="button"
                aria-pressed={activeView === "sealRefs"}
                className={`filter-chip${activeView === "sealRefs" ? " is-active" : ""}`}
                onClick={() => setActiveView("sealRefs")}
              >
                Seal refs
              </button>
            </div>
            {isItemsView && onExportCatalogCsv !== undefined ? (
              <button
                type="button"
                className="filter-chip onboarding-help-button"
                onClick={onExportCatalogCsv}
                disabled={catalogItems.length === 0}
              >
                <span className="table-export-icon" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            ) : null}
            {onOpenCatalogOnboardingHelp !== undefined ? (
              <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenCatalogOnboardingHelp}>
                <span className="action-button-icon is-help" aria-hidden="true" />
                <span>Help</span>
              </button>
            ) : null}
          </div>
          {isItemsView ? (
            <div className="list-panel-header-tools-row is-filter-row">
              <TableFilterBar
                label="Filter"
                fieldLabel="Catalog filter field"
                fieldValue={filterField}
                onFieldChange={(value) => setFilterField(value as CatalogFilterField)}
                fieldOptions={[
                  { value: "manufacturerReference", label: "Manufacturer ref" },
                  { value: "name", label: "Name" },
                  { value: "any", label: "Any" }
                ]}
                queryValue={filterQuery}
                onQueryChange={setFilterQuery}
                placeholder={filterPlaceholder}
              />
            </div>
          ) : null}
        </div>
      </header>

      {activeView === "endpointRefs" ? (
        <WireEndpointReferenceNamesTable
          heading="Wire endpoint references"
          kind="connection"
          entries={wireReferenceEntries.connection}
          onUpdateWireEndpointReferenceName={onUpdateWireEndpointReferenceName}
        />
      ) : activeView === "sealRefs" ? (
        <WireEndpointReferenceNamesTable
          heading="Wire seal references"
          kind="seal"
          entries={wireReferenceEntries.seal}
          onUpdateWireEndpointReferenceName={onUpdateWireEndpointReferenceName}
        />
      ) : catalogItems.length === 0 ? (
        <>
          <p className="empty-copy">No catalog item yet.</p>
          <div className="row-actions compact">
            <button
              type="button"
              className="button-with-icon"
              onClick={() => {
                onOpenCreateCatalogItem();
                scrollToFormPanel(FORM_PANEL_IDS.catalog);
              }}
            >
              <span className="action-button-icon is-new" aria-hidden="true" />
              Create catalog item
            </button>
          </div>
        </>
      ) : sortedCatalogItems.length === 0 ? (
        <>
          <p className="empty-copy">No catalog item matches the current filters.</p>
          <TableEntryCountFooter count={0} />
        </>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th aria-sort={getTableAriaSort(sortState, "manufacturerReference")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("manufacturerReference")}>
                    {isMobileViewport ? "Mnf ref" : "Manufacturer ref"}{" "}
                    <span className="sort-indicator">{sortIndicator("manufacturerReference")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "name")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("name")}>
                    Name <span className="sort-indicator">{sortIndicator("name")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "connectionCount")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("connectionCount")}>
                    {isMobileViewport ? "Con." : "Connections"} <span className="sort-indicator">{sortIndicator("connectionCount")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "unitPriceExclTax")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("unitPriceExclTax")}>
                    {isMobileViewport ? "Price" : `Unit price HT (${workspaceCurrencyCode})`}{" "}
                    <span className="sort-indicator">{sortIndicator("unitPriceExclTax")}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCatalogItems.map((item) => {
                const isSelected = selectedCatalogItem?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    className={isSelected ? "is-selected is-focusable-row" : "is-focusable-row"}
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => {
                      onEditCatalogItem(item);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onEditCatalogItem(item);
                      }
                    }}
                  >
                    <td className="technical-id">{item.manufacturerReference}</td>
                    <td>{item.name ?? ""}</td>
                    <td>{item.connectionCount}</td>
                    <td>{formatPriceWithCurrencySymbol(item.unitPriceExclTax, workspaceCurrencyCode)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TableEntryCountFooter count={sortedCatalogItems.length} />
        </>
      )}

      {isItemsView ? (
        <div className="row-actions compact modeling-list-actions catalog-modeling-list-actions">
          <button
            type="button"
            className="button-with-icon"
            onClick={() => {
              onOpenCreateCatalogItem();
              scrollToFormPanel(FORM_PANEL_IDS.catalog);
            }}
          >
            <span className="action-button-icon is-new" aria-hidden="true" />
            New
          </button>
          {onOpenCatalogCsvImportPicker !== undefined ? (
            <button type="button" onClick={onOpenCatalogCsvImportPicker}>
              {isMobileViewport ? "Import" : "Import CSV"}
            </button>
          ) : null}
          <button
            type="button"
            className="button-with-icon"
            onClick={() => {
              if (selectedCatalogItem === null) {
                return;
              }
              onEditCatalogItem(selectedCatalogItem);
              scrollToFormPanel(FORM_PANEL_IDS.catalog);
            }}
            disabled={selectedCatalogItem === null}
          >
            <span className="action-button-icon is-edit" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className="modeling-list-action-delete button-with-icon"
            onClick={() => selectedCatalogItem !== null && onDeleteCatalogItem(selectedCatalogItem.id)}
            disabled={selectedCatalogItem === null || catalogFormMode === "create"}
          >
            <span className="action-button-icon is-delete" aria-hidden="true" />
            Delete
          </button>
        </div>
      ) : null}
      {isItemsView && catalogCsvImportFileInputRef !== undefined && onCatalogCsvImportFileChange !== undefined ? (
        <input
          ref={catalogCsvImportFileInputRef}
          type="file"
          accept="text/csv,.csv"
          hidden
          onChange={(event) => {
            void onCatalogCsvImportFileChange(event);
          }}
        />
      ) : null}
      {isItemsView && catalogCsvImportExportStatus !== null ? (
        <p className={`meta-line import-status is-${catalogCsvImportExportStatus.kind}`}>{catalogCsvImportExportStatus.message}</p>
      ) : null}
      {isItemsView && catalogCsvLastImportSummaryLine !== null ? <p className="meta-line">{catalogCsvLastImportSummaryLine}</p> : null}
    </article>
  );
}

function WireEndpointReferenceNamesTable({
  heading,
  kind,
  entries,
  onUpdateWireEndpointReferenceName
}: {
  heading: string;
  kind: "connection" | "seal";
  entries: WireEndpointReferenceEntry[];
  onUpdateWireEndpointReferenceName: WireEndpointReferenceNameHandler;
}): ReactElement {
  const [draftsByReference, setDraftsByReference] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraftsByReference(Object.fromEntries(entries.map((entry) => [entry.reference, entry.name ?? ""])));
  }, [entries]);

  if (entries.length === 0) {
    return <p className="empty-copy">No {kind} references yet.</p>;
  }

  return (
    <>
      <h3 className="list-subheading">{heading}</h3>
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
          {entries.map((entry) => {
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
      <TableEntryCountFooter count={entries.length} />
    </>
  );
}

export type { CatalogTableView, ModelingCatalogListPanelProps };
