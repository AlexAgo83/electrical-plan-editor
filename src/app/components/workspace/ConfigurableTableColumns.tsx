import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactElement, type RefObject, type SetStateAction } from "react";
import type { TableColumnPreferences } from "../../hooks/uiPreferencesStorage";

export interface ConfigurableTableColumn {
  id: string;
  label: string;
  hideable?: boolean;
}

interface ConfigurableTableColumnsControlProps {
  tableId: string;
  tableRef: RefObject<HTMLTableElement | null>;
  columns: ConfigurableTableColumn[];
  leadingColumnCount?: number;
  tableColumnPreferences: TableColumnPreferences;
  setTableColumnPreferences: Dispatch<SetStateAction<TableColumnPreferences>>;
}

function mergeColumnOrder(savedOrder: string[] | undefined, activeColumnIds: string[]): string[] {
  const active = new Set(activeColumnIds);
  const saved = (savedOrder ?? []).filter((columnId) => active.has(columnId));
  return [...saved, ...activeColumnIds.filter((columnId) => !saved.includes(columnId))];
}

export function ConfigurableTableColumnsControl({
  tableId,
  tableRef,
  columns,
  leadingColumnCount = 0,
  tableColumnPreferences,
  setTableColumnPreferences
}: ConfigurableTableColumnsControlProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const preference = tableColumnPreferences[tableId];
  const activeColumnIds = useMemo(() => columns.map((column) => column.id), [columns]);
  const orderedColumnIds = useMemo(
    () => mergeColumnOrder(preference?.order, activeColumnIds),
    [activeColumnIds, preference?.order]
  );
  const hiddenColumnIds = useMemo(() => new Set(preference?.hidden ?? []), [preference?.hidden]);
  const hideableColumns = columns.filter((column) => column.hideable !== false);

  const updatePreference = useCallback((updater: (current: { order: string[]; hidden: string[] }) => { order: string[]; hidden: string[] }) => {
    setTableColumnPreferences((current) => {
      const currentPreference = current[tableId] ?? { order: activeColumnIds, hidden: [] };
      return {
        ...current,
        [tableId]: updater({
          order: mergeColumnOrder(currentPreference.order, activeColumnIds),
          hidden: currentPreference.hidden.filter((columnId) => activeColumnIds.includes(columnId))
        })
      };
    });
  }, [activeColumnIds, setTableColumnPreferences, tableId]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current !== null && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const table = tableRef.current;
    if (table === null) {
      return;
    }

    const activeColumnIdSet = new Set(activeColumnIds);
    const orderedIndex = new Map(orderedColumnIds.map((columnId, index) => [columnId, index]));

    for (const row of Array.from(table.rows)) {
      const cells = Array.from(row.children) as HTMLElement[];
      const configurableCells = cells.slice(leadingColumnCount);
      const hasExistingIds = configurableCells.every((cell) => activeColumnIdSet.has(cell.dataset.columnId ?? ""));
      configurableCells.forEach((cell, index) => {
        if (!hasExistingIds) {
          cell.dataset.columnId = activeColumnIds[index] ?? "";
        }
        const columnId = cell.dataset.columnId ?? "";
        cell.hidden = hiddenColumnIds.has(columnId);
      });
      configurableCells
        .filter((cell) => activeColumnIdSet.has(cell.dataset.columnId ?? ""))
        .sort((left, right) => (orderedIndex.get(left.dataset.columnId ?? "") ?? 0) - (orderedIndex.get(right.dataset.columnId ?? "") ?? 0))
        .forEach((cell) => row.appendChild(cell));
    }

    const headerCells = Array.from(table.tHead?.rows[0]?.children ?? []) as HTMLElement[];
    const configurableHeaders = headerCells.slice(leadingColumnCount);
    for (const header of configurableHeaders) {
      const columnId = header.dataset.columnId;
      if (columnId === undefined || !activeColumnIdSet.has(columnId)) {
        continue;
      }
      header.draggable = true;
      header.ondragstart = (event) => {
        event.dataTransfer?.setData("text/plain", columnId);
        event.dataTransfer?.setDragImage(header, 8, 8);
      };
      header.ondragover = (event) => {
        event.preventDefault();
      };
      header.ondrop = (event) => {
        event.preventDefault();
        const sourceColumnId = event.dataTransfer?.getData("text/plain");
        if (sourceColumnId === undefined || sourceColumnId.length === 0 || sourceColumnId === columnId) {
          return;
        }
        updatePreference((current) => {
          const withoutSource = current.order.filter((id) => id !== sourceColumnId);
          const targetIndex = withoutSource.indexOf(columnId);
          if (targetIndex < 0) {
            return current;
          }
          return {
            ...current,
            order: [...withoutSource.slice(0, targetIndex), sourceColumnId, ...withoutSource.slice(targetIndex)]
          };
        });
      };
    }
  }, [activeColumnIds, hiddenColumnIds, leadingColumnCount, orderedColumnIds, tableRef, updatePreference]);

  return (
    <div ref={wrapperRef} className="network-summary-view-menu-wrapper">
      <button type="button" className="filter-chip" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)}>
        Columns ▾
      </button>
      {isOpen ? (
        <div className="panel network-summary-view-menu network-summary-view-menu--right" role="menu">
          {hideableColumns.map((column) => (
            <label key={column.id} className="network-summary-view-menu-item table-column-menu-option">
              <input
                type="checkbox"
                checked={!hiddenColumnIds.has(column.id)}
                onChange={(event) => {
                  updatePreference((current) => ({
                    ...current,
                    hidden: event.target.checked
                      ? current.hidden.filter((columnId) => columnId !== column.id)
                      : [...new Set([...current.hidden, column.id])]
                  }));
                }}
              />
              {column.label}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
