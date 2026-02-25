import type { WorkspaceCurrencyCode } from "../types/app-controller";

export function getCurrencySymbol(currencyCode: WorkspaceCurrencyCode): string {
  switch (currencyCode) {
    case "USD":
      return "$";
    case "CAD":
      return "C$";
    case "CHF":
      return "CHF";
    case "GBP":
      return "£";
    case "EUR":
    default:
      return "€";
  }
}

export function formatPriceWithCurrencySymbol(
  value: number | undefined,
  currencyCode: WorkspaceCurrencyCode
): string {
  if (value === undefined || !Number.isFinite(value)) {
    return "";
  }

  return `${value.toFixed(2)} ${getCurrencySymbol(currencyCode)}`;
}
