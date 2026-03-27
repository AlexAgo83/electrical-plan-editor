export interface ModelingDynamicSelectOption {
  value: string;
  label: string;
  technicalId?: string | null;
  isMissing?: boolean;
}

function normalizeOptionText(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim().toLocaleLowerCase() : "";
}

export function compareModelingDynamicSelectOptions(
  left: ModelingDynamicSelectOption,
  right: ModelingDynamicSelectOption
): number {
  const labelComparison = normalizeOptionText(left.label).localeCompare(normalizeOptionText(right.label), undefined, {
    sensitivity: "base"
  });
  if (labelComparison !== 0) {
    return labelComparison;
  }

  const technicalIdComparison = normalizeOptionText(left.technicalId).localeCompare(
    normalizeOptionText(right.technicalId),
    undefined,
    { sensitivity: "base" }
  );
  if (technicalIdComparison !== 0) {
    return technicalIdComparison;
  }

  return left.value.localeCompare(right.value, undefined, { sensitivity: "base" });
}

export function sortModelingDynamicSelectOptions(
  options: readonly ModelingDynamicSelectOption[]
): ModelingDynamicSelectOption[] {
  return [...options].sort(compareModelingDynamicSelectOptions);
}

interface BuildModelingDynamicSelectOptionsParams {
  options: readonly ModelingDynamicSelectOption[];
  selectedValue?: string | null;
  missingOption?: {
    label: string;
    technicalId?: string | null;
  } | null;
}

export function buildModelingDynamicSelectOptions({
  options,
  selectedValue,
  missingOption
}: BuildModelingDynamicSelectOptionsParams): ModelingDynamicSelectOption[] {
  const sortedOptions = sortModelingDynamicSelectOptions(options);
  const normalizedSelectedValue = selectedValue?.trim() ?? "";
  if (normalizedSelectedValue.length === 0) {
    return sortedOptions;
  }

  const selectedExists = sortedOptions.some((option) => option.value === normalizedSelectedValue);
  if (selectedExists) {
    return sortedOptions;
  }

  if (missingOption === null || missingOption === undefined) {
    return sortedOptions;
  }

  return [
    {
      value: normalizedSelectedValue,
      label: missingOption.label,
      technicalId: missingOption.technicalId ?? normalizedSelectedValue,
      isMissing: true
    },
    ...sortedOptions
  ];
}
