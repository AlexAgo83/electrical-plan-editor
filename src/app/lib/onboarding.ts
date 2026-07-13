import { translateCurrent as t } from "./i18n";
import type { SubScreenId } from "../types/app-controller";

export type OnboardingStepId =
  | "networkScope"
  | "catalog"
  | "connectorSpliceLibrary"
  | "pinRoles"
  | "nodes"
  | "segments"
  | "wires"
  | "harnessAssembly"
  | "settingsOverview";
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
    screen: "networkScope" | "harnessAssembly" | "modeling" | "settings";
    subScreen?: SubScreenId;
    panelSelector: string;
    panelLabel: string;
  };
}

export const ONBOARDING_AUTO_OPEN_STORAGE_KEY = "electrical-plan-editor.onboarding.auto-open-enabled.v1";

export function getOnboardingSteps(): readonly OnboardingStepDefinition[] {
  return [
  {
    id: "networkScope",
    title: t("ui.createYourFirstNetwork"),
    badge: "N1",
    badgeIconClass: "is-network-scope",
    description: [
      { text: "Start in " },
      { text: t("ui.networkScope"), strong: true },
      { text: " to create the harness/wiring plan container you will model, duplicate, and export." }
    ],
    target: {
      screen: "networkScope",
      panelSelector: '[data-onboarding-panel="network-scope"]',
      panelLabel: t("ui.networkScope")
    }
  },
  {
    id: "catalog",
    title: t("ui.createCatalogItemsFirst"),
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
      panelLabel: t("ui.catalog")
    }
  },
  {
    id: "connectorSpliceLibrary",
    title: t("ui.buildTheConnectorsAndSplicesLibrary"),
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
      panelLabel: t("ui.connectorsSplices")
    }
  },
  {
    id: "pinRoles",
    title: "Declare pin roles",
    badge: "PIN",
    badgeIconClass: "is-connectors",
    description: [
      { text: "Use the connector inspector's " },
      { text: "Pin electrical roles", strong: true },
      { text: " section to declare source, consumer, passive, or bidirectional pins with optional continuous current and labels. These declarations feed electrical dimensioning diagnostics." }
    ],
    target: {
      screen: "modeling",
      subScreen: "connector",
      panelSelector: '[data-onboarding-panel="modeling-connectors"]',
      panelLabel: t("ui.connectors")
    }
  },
  {
    id: "nodes",
    title: t("ui.createNodesForNetworkPoints"),
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
      panelLabel: t("ui.nodes")
    }
  },
  {
    id: "segments",
    title: t("ui.createSegmentsBetweenNodes"),
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
      panelLabel: t("ui.segments")
    }
  },
  {
    id: "wires",
    title: t("ui.createWiresAndCables"),
    badge: "WR",
    badgeIconClass: "is-wires",
    description: [
      { text: "Create " },
      { text: t("ui.wiresCables"), strong: true },
      { text: " and route them across segments from endpoint A to endpoint B. Wire forms support section (mm²), optional colors, endpoint references, and endpoint occupancy guidance." },
      { text: " You can also enable " },
      { text: "Fuse", strong: true },
      { text: " mode and link it to a catalog item manufacturer reference when modeling protected wires." }
    ],
    target: {
      screen: "modeling",
      subScreen: "wire",
      panelSelector: '[data-onboarding-panel="modeling-wires"]',
      panelLabel: t("ui.wires")
    }
  },
  {
    id: "harnessAssembly",
    title: "Build harness assemblies",
    badge: "HAR",
    badgeIconClass: "is-harness-assembly",
    description: [
      { text: "Use " },
      { text: "Harness Assembly", strong: true },
      { text: " to group networks into physical harnesses, select master connector roots, and define interconnector links. The functional graph then traces the saved assembly and can be exported as SVG or PNG." }
    ],
    target: {
      screen: "harnessAssembly",
      panelSelector: '[data-onboarding-panel="harness-assembly-functional"]',
      panelLabel: "Harness Assembly"
    }
  },
  {
    id: "settingsOverview",
    title: t("ui.configureYourWorkspaceDefaults"),
    badge: "CFG",
    badgeIconClass: "is-settings",
    description: [
      { text: "Before continuing, review key " },
      { text: t("ui.settings"), strong: true },
      { text: ": " },
      { text: t("ui.language"), strong: true },
      { text: ", " },
      { text: t("ui.theme"), strong: true },
      { text: ", " },
      { text: t("ui.keyboardShortcuts"), strong: true },
      { text: ", " },
      { text: t("ui.canvasRenderPreferences"), strong: true },
      { text: ", and " },
      { text: t("ui.globalPreferences"), strong: true },
      { text: " for your default workflow ergonomics." }
    ],
    target: {
      screen: "settings",
      panelSelector: '[data-onboarding-panel="settings-global-preferences"]',
      panelLabel: t("ui.settings")
    }
  }
  ] as const;
}

export function getOnboardingStepById(stepId: OnboardingStepId): OnboardingStepDefinition {
  const step = getOnboardingSteps().find((candidate) => candidate.id === stepId);
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
