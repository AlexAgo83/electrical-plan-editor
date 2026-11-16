/** Explicit user action only: free text and the end of the A–Z sequence stay unchanged. */
export function nextPlanRevision(value: string): string | null {
  const revision = value.trim();
  if (revision === "") return "OR/00";
  if (revision === "OR/00") return "A/01";

  const match = /^([A-Z])\/(\d{2})$/.exec(revision);
  if (match === null) return null;
  const number = match[1]!.charCodeAt(0) - 64;
  if (Number(match[2]) !== number || number === 26) return null;
  return `${String.fromCharCode(65 + number)}/${String(number + 1).padStart(2, "0")}`;
}
