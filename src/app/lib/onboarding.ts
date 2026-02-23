import type { SubScreenId } from "../types/app-controller";

export type OnboardingStepId = "networkScope" | "connectorSpliceLibrary" | "nodes" | "segments" | "wires";
export type OnboardingModalMode = "full" | "single";

export interface OnboardingStepDescriptionPart {
  text: string;
  strong?: boolean;
}

export interface OnboardingStepDefinition {
  id: OnboardingStepId;
  title: string;
  badge: string;
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
    description: [
      { text: "Start in " },
      { text: "Network Scope", strong: true },
      { text: " to create the harness/wiring plan container you will model." }
    ],
    target: {
      screen: "networkScope",
      panelSelector: '[data-onboarding-panel="network-scope"]',
      panelLabel: "Network Scope"
    }
  },
  {
    id: "connectorSpliceLibrary",
    title: "Build the connectors and splices library",
    badge: "LIB",
    description: [
      { text: "Define reusable " },
      { text: "connectors", strong: true },
      { text: ", " },
      { text: "splices", strong: true },
      { text: ", and their available ways/ports before placing them in the network." }
    ],
    target: {
      screen: "modeling",
      subScreen: "connector",
      panelSelector: '[data-onboarding-panel="modeling-connectors"]',
      panelLabel: "Connectors"
    }
  },
  {
    id: "nodes",
    title: "Create nodes for network points",
    badge: "ND",
    description: [
      { text: "Create " },
      { text: "nodes", strong: true },
      { text: " to represent connectors, splices, and intermediate hubs in the network graph." }
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
    description: [
      { text: "Use " },
      { text: "segments", strong: true },
      { text: " to define physical links and lengths between nodes." }
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
    description: [
      { text: "Create " },
      { text: "wires/cables", strong: true },
      { text: " and route them across segments from endpoint A to endpoint B." }
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
