import type { ReactElement } from "react";

export interface TableFilterBarOption {
  value: string;
  label: string;
}

interface TableFilterBarProps {
  label: string;
  fieldLabel: string;
  fieldValue: string;
  onFieldChange: (value: string) => void;
  fieldOptions: readonly TableFilterBarOption[];
  queryValue: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
}

export function TableFilterBar({
  label,
  fieldLabel,
  fieldValue,
  onFieldChange,
  fieldOptions,
  queryValue,
  onQueryChange,
  placeholder
}: TableFilterBarProps): ReactElement {
  const orderedFieldOptions =
    fieldOptions.find((option) => option.value === "any") === undefined
      ? fieldOptions
      : [
          ...fieldOptions.filter((option) => option.value === "any"),
          ...fieldOptions.filter((option) => option.value !== "any")
        ];

  return (
    <label className="list-inline-number-filter list-inline-table-filter">
      <span>{label}</span>
      <select
        className="list-inline-table-filter-select"
        aria-label={fieldLabel}
        value={fieldValue}
        onChange={(event) => onFieldChange(event.target.value)}
      >
        {orderedFieldOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        className="list-inline-table-filter-input"
        type="text"
        value={queryValue}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
