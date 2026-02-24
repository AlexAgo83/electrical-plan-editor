import type { SubScreenId } from "../types/app-controller";

export type OnboardingStepId = "networkScope" | "catalog" | "connectorSpliceLibrary" | "nodes" | "segments" | "wires";
export type OnboardingModalMode = "full" | "single";

export interface OnboardingStepDescriptionPart {
  text: string;
  strong?: boolean;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  badge: string;
  badgeIconClass?: string;
  description: OnboardingStepDescriptionPart[];
  target: {
    screen: "networkScope" | "modeling";
    subScreen?: SubScreenId;
    panelSelector: string;
    panelLabel: string;
  };
}

export const ONBOARDING_AUTO_OPEN_STORAGE_KEY = "electrical-plan-editor.onboarding.auto-open-enabled.v1";

export const ONBOARDING_STEPS: readonly OnboardingStepDefinition[] = [
  {
    id: "networkScope",
    title: "Create your first network",
    badge: "N1",
    badgeIconClass: "is-network-scope",
    description: [
      { text: "Start in " },
      { text: "Network Scope", strong: true },
      { text: " to create the harness/wiring plan container you will model, duplicate, and export." }
    ],
    target: {
      screen: "networkScope",
      panelSelector: '[data-onboarding-panel="network-scope"]',
      panelLabel: "Network Scope"
    }
  },
  {
    id: "catalog",
    title: "Create catalog items first",
    badge: "CAT",
    badgeIconClass: "is-catalog",
    description: [
      { text: "Create " },
      { text: "catalog items", strong: true },
      { text: " first to define reusable manufacturer references and connection counts before creating connectors or splices. Connector/splice forms then reuse the selected catalog item." }
    ],
    target: {
      screen: "modeling",
      subScreen: "catalog",
      panelSelector: '[data-onboarding-panel="modeling-catalog"]',
      panelLabel: "Catalog"
    }
  },
  {
    id: "connectorSpliceLibrary",
    title: "Build the connectors and splices library",
    badge: "LIB",
    badgeIconClass: "is-connectors",
    description: [
      { text: "Define reusable " },
      { text: "connectors", strong: true },
      { text: ", " },
      { text: "splices", strong: true },
      { text: " from " },
      { text: "catalog items", strong: true },
      { text: " before placing them in the network. Create forms can also auto-create linked nodes." }
    ],
    target: {
      screen: "modeling",
      subScreen: "connector",
      panelSelector: '[data-onboarding-panel="modeling-connectors"]',
      panelLabel: "Connectors / Splices"
    }
  },
  {
    id: "nodes",
    title: "Create nodes for network points",
    badge: "ND",
    badgeIconClass: "is-nodes",
    description: [
      { text: "Create " },
      { text: "nodes", strong: true },
      { text: " to represent connectors, splices, and intermediate hubs in the network graph. You can rename node IDs safely in edit mode." }
    ],
    target: {
      screen: "modeling",
      subScreen: "node",
      panelSelector: '[data-onboarding-panel="modeling-nodes"]',
      panelLabel: "Nodes"
    }
  },
  {
    id: "segments",
    title: "Create segments between nodes",
    badge: "SG",
    badgeIconClass: "is-segments",
    description: [
      { text: "Use " },
      { text: "segments", strong: true },
      { text: " to define physical links and lengths between nodes used by routed wires and route previews." }
    ],
    target: {
      screen: "modeling",
      subScreen: "segment",
      panelSelector: '[data-onboarding-panel="modeling-segments"]',
      panelLabel: "Segments"
    }
  },
  {
    id: "wires",
    title: "Create wires and cables",
    badge: "WR",
    badgeIconClass: "is-wires",
    description: [
      { text: "Create " },
      { text: "wires/cables", strong: true },
      { text: " and route them across segments from endpoint A to endpoint B. Wire forms support section (mm²), optional colors, endpoint references, and endpoint occupancy guidance." }
    ],
    target: {
      screen: "modeling",
      subScreen: "wire",
      panelSelector: '[data-onboarding-panel="modeling-wires"]',
      panelLabel: "Wires"
    }
  }
] as const;

export function getOnboardingStepById(stepId: OnboardingStepId): OnboardingStepDefinition {
  const step = ONBOARDING_STEPS.find((candidate) => candidate.id === stepId);
  if (step === undefined) {
    throw new Error(`Unknown onboarding step '${stepId}'.`);
  }
  return step;
}

export function readOnboardingAutoOpenEnabled(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    const raw = window.localStorage.getItem(ONBOARDING_AUTO_OPEN_STORAGE_KEY);
    if (raw === null) {
      return true;
    }
    return raw !== "false";
  } catch {
    return true;
  }
}

export function writeOnboardingAutoOpenEnabled(enabled: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(ONBOARDING_AUTO_OPEN_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // Best effort only; onboarding remains usable even if persistence is unavailable.
  }
}
