import { useMemo, useState, type ReactElement } from "react";
import type { CatalogItem, CatalogItemId } from "../../../core/entities";
import { getTableAriaSort } from "../../lib/accessibility";
import { compareSortableValues } from "../../lib/app-utils-shared";
import { TableEntryCountFooter } from "./TableEntryCountFooter";
import { TableFilterBar } from "./TableFilterBar";

type CatalogFilterField = "manufacturerReference" | "name" | "any";
type CatalogSortField = "manufacturerReference" | "name" | "connectionCount" | "unitPriceExclTax";
type SortDirection = "asc" | "desc";

interface ModelingCatalogListPanelProps {
  isCatalogSubScreen: boolean;
  catalogItems: CatalogItem[];
  selectedCatalogItemId: CatalogItemId | null;
  catalogFormMode: "idle" | "create" | "edit";
  isSelectedCatalogItemReferenced: boolean;
  onOpenCreateCatalogItem: () => void;
  onEditCatalogItem: (item: CatalogItem) => void;
  onDeleteCatalogItem: (catalogItemId: CatalogItemId) => void;
  onOpenCatalogOnboardingHelp?: () => void;
}

export function ModelingCatalogListPanel({
  isCatalogSubScreen,
  catalogItems,
  selectedCatalogItemId,
  catalogFormMode,
  isSelectedCatalogItemReferenced,
  onOpenCreateCatalogItem,
  onEditCatalogItem,
  onDeleteCatalogItem,
  onOpenCatalogOnboardingHelp
}: ModelingCatalogListPanelProps): ReactElement {
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

  return (
    <article className="panel" hidden={!isCatalogSubScreen} data-onboarding-panel="modeling-catalog">
      <header className="list-panel-header">
        <h2>Catalog</h2>
        <div className="list-panel-header-tools">
          <div className="list-panel-header-tools-row">
            {onOpenCatalogOnboardingHelp !== undefined ? (
              <button type="button" className="filter-chip onboarding-help-button" onClick={onOpenCatalogOnboardingHelp}>
                <span className="action-button-icon is-help" aria-hidden="true" />
                <span>Help</span>
              </button>
            ) : null}
          </div>
          <div className="list-panel-header-tools-row">
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
        </div>
      </header>

      {catalogItems.length === 0 ? (
        <>
          <p className="empty-copy">No catalog item yet.</p>
          <div className="row-actions compact">
            <button type="button" className="button-with-icon" onClick={onOpenCreateCatalogItem}>
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
                    Manufacturer ref <span className="sort-indicator">{sortIndicator("manufacturerReference")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "name")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("name")}>
                    Name <span className="sort-indicator">{sortIndicator("name")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "connectionCount")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("connectionCount")}>
                    Connections <span className="sort-indicator">{sortIndicator("connectionCount")}</span>
                  </button>
                </th>
                <th aria-sort={getTableAriaSort(sortState, "unitPriceExclTax")}>
                  <button type="button" className="sort-header-button" onClick={() => toggleSort("unitPriceExclTax")}>
                    Unit price HT <span className="sort-indicator">{sortIndicator("unitPriceExclTax")}</span>
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
                    onClick={() => onEditCatalogItem(item)}
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
                    <td>{item.unitPriceExclTax ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <TableEntryCountFooter count={sortedCatalogItems.length} />
        </>
      )}

      <div className="row-actions compact modeling-list-actions">
        <button type="button" className="button-with-icon" onClick={onOpenCreateCatalogItem}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          New
        </button>
        <button
          type="button"
          className="button-with-icon"
          onClick={() => selectedCatalogItem !== null && onEditCatalogItem(selectedCatalogItem)}
          disabled={selectedCatalogItem === null}
        >
          <span className="action-button-icon is-edit" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          className="modeling-list-action-delete button-with-icon"
          onClick={() => selectedCatalogItem !== null && onDeleteCatalogItem(selectedCatalogItem.id)}
          disabled={selectedCatalogItem === null || catalogFormMode === "create" || isSelectedCatalogItemReferenced}
        >
          <span className="action-button-icon is-delete" aria-hidden="true" />
          Delete
        </button>
      </div>
    </article>
  );
}

export type { ModelingCatalogListPanelProps };
