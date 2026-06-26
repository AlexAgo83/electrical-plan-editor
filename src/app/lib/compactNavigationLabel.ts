const MIN_COMPACT_LABEL_LENGTH = 6;

const COMPACT_LABEL_BY_NORMALIZED_LABEL: Record<string, string> = {
  catalog: "Cat.",
  catalogue: "Cat.",
  connector: "Conn.",
  connectors: "Conn.",
  connecteur: "Conn.",
  connecteurs: "Conn.",
  splice: "Spl.",
  splices: "Spl.",
  epissure: "Epis.",
  epissures: "Epis.",
  segment: "Seg.",
  segments: "Seg."
};

function normalizeLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getCountedNavigationLabel(label: string, count: number, useInitialAbove99 = false): string {
  const trimmedLabel = label.trim();
  if (useInitialAbove99 && count > 99) {
    return Array.from(trimmedLabel)[0] ?? label;
  }

  if (count <= 9 || Array.from(trimmedLabel).length < MIN_COMPACT_LABEL_LENGTH) {
    return label;
  }

  return COMPACT_LABEL_BY_NORMALIZED_LABEL[normalizeLabel(trimmedLabel)] ?? `${Array.from(trimmedLabel).slice(0, 4).join("")}.`;
}

export function getCountedNavigationAriaLabel(label: string, count: number): string {
  void count;
  return label;
}
