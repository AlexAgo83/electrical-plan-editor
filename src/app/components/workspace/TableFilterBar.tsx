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
  return (
    <label
      className="list-inline-number-filter"
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}
    >
      <span>{label}</span>
      <select
        aria-label={fieldLabel}
        value={fieldValue}
        onChange={(event) => onFieldChange(event.target.value)}
        style={{ flex: "0 0 auto" }}
      >
        {fieldOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={queryValue}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={placeholder}
        style={{ flex: "1 1 auto", minWidth: 0 }}
      />
    </label>
  );
}
