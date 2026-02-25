export type TableAriaSort = "ascending" | "descending" | "none";

export function getTableAriaSort<Field extends string>(
  sortState: { field: Field; direction: "asc" | "desc" },
  field: Field
): TableAriaSort {
  if (sortState.field !== field) {
    return "none";
  }

  return sortState.direction === "asc" ? "ascending" : "descending";
}
