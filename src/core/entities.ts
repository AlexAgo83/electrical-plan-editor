import type { WireColorMode } from "./cableColors";

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type NetworkId = Brand<string, "NetworkId">;
export type HarnessAssemblyId = Brand<string, "HarnessAssemblyId">;
export type InterHarnessConnectorLinkId = Brand<string, "InterHarnessConnectorLinkId">;
export type CatalogItemId = Brand<string, "CatalogItemId">;
export type ConnectorId = Brand<string, "ConnectorId">;
export type SpliceId = Brand<string, "SpliceId">;
export type NodeId = Brand<string, "NodeId">;
export type SegmentId = Brand<string, "SegmentId">;
export type WireId = Brand<string, "WireId">;
export type WireMaterial = "copper" | "aluminum";

export interface Network {
  id: NetworkId;
  name: string;
  technicalId: string;
  description?: string;
  voltageV?: number;
  author?: string;
  projectCode?: string;
  logoUrl?: string;
  exportNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Connector {
  id: ConnectorId;
  name: string;
  technicalId: string;
  cavityCount: number;
  isMainHarnessConnector?: boolean;
  isTerminalConnector?: boolean;
  catalogItemId?: CatalogItemId;
  manufacturerReference?: string;
  applyCatalogPlugs?: boolean;
  applyCatalogSeals?: boolean;
  terminalOverrides?: Record<number, ConnectorTerminalMaterial>;
  cableCalloutPosition?: {
    x: number;
    y: number;
  };
}

export interface HarnessAssemblyMember {
  networkId: NetworkId;
  color: string;
}

export interface InterHarnessConnectorLink {
  id: InterHarnessConnectorLinkId;
  name?: string;
  sourceNetworkId: NetworkId;
  sourceConnectorId: ConnectorId;
  targetNetworkId: NetworkId;
  targetConnectorId: ConnectorId;
}

export interface HarnessAssembly {
  id: HarnessAssemblyId;
  name: string;
  technicalId: string;
  members: HarnessAssemblyMember[];
  masterConnectorRefs: Array<{
    networkId: NetworkId;
    connectorId: ConnectorId;
  }>;
  connectorLinks: InterHarnessConnectorLink[];
  createdAt: string;
  updatedAt: string;
}

export interface Splice {
  id: SpliceId;
  name: string;
  technicalId: string;
  portMode?: "bounded" | "unbounded" | "directional";
  portCount: number;
  sideInverted?: boolean;
  catalogItemId?: CatalogItemId;
  manufacturerReference?: string;
  cableCalloutPosition?: {
    x: number;
    y: number;
  };
}

export interface CatalogItem {
  id: CatalogItemId;
  manufacturerReference: string;
  connectionCount: number;
  name?: string;
  unitPriceExclTax?: number;
  url?: string;
  additionalAccessories?: CatalogAdditionalAccessory[];
  connectorDefaults?: ConnectorCatalogDefaults;
  connectorLayout?: ConnectorLayout;
}

export interface CatalogAdditionalAccessory {
  accessoryReference: string;
  accessoryName?: string;
}

export type ConnectorLayoutWayShape = "round" | "square" | "slot";
export type ConnectorLayoutKeyingSide = "none" | "top" | "right" | "bottom" | "left";
export type ConnectorLayoutKeyingShape = "arrow" | "square" | "round" | "diamond";
export type ConnectorLayoutShellShape = "square" | "circle";
export type ConnectorLayoutKeyingPlacement =
  | { mode: "guided"; pathPosition: number; snapToGrid?: boolean }
  | { mode: "free"; x: number; y: number; snapToGrid?: boolean };

export interface ConnectorLayoutKeying {
  /** @deprecated Use placement for keying positioning. */
  side: ConnectorLayoutKeyingSide;
  /** @deprecated Use placement for keying positioning. */
  position?: number;
  placement?: ConnectorLayoutKeyingPlacement;
  shape?: ConnectorLayoutKeyingShape;
  color?: string;
  scale?: number;
}

export interface ConnectorLayoutWay {
  cavityIndex: number;
  x: number;
  y: number;
  shape: ConnectorLayoutWayShape;
  label?: string;
}

export interface ConnectorLayout {
  version: 1;
  units: "grid";
  width: number;
  height: number;
  shellShape?: ConnectorLayoutShellShape;
  shellPadding?: number;
  shellCornerRadius?: number;
  shellStrokeWidth?: number;
  cellPadding?: number;
  keyings?: ConnectorLayoutKeying[];
  /** @deprecated Use keyings for zero-to-many connector keying features. */
  keying?: ConnectorLayoutKeying;
  ways: ConnectorLayoutWay[];
}

export interface ConnectorTerminalMaterial {
  terminalReference?: string;
  terminalName?: string;
  sealReference?: string;
  sealName?: string;
}

export interface ConnectorPlugDefinition {
  plugReference: string;
  plugName?: string;
  quantity: number;
}

export interface ConnectorCatalogDefaults {
  allSameTerminals?: boolean;
  defaultTerminal?: ConnectorTerminalMaterial;
  terminalOverrides?: Record<number, ConnectorTerminalMaterial>;
  plugs?: ConnectorPlugDefinition[];
}

export type NetworkNode =
  | {
      id: NodeId;
      kind: "connector";
      connectorId: ConnectorId;
    }
  | {
      id: NodeId;
      kind: "splice";
      spliceId: SpliceId;
    }
  | {
      id: NodeId;
      kind: "intermediate";
      label: string;
    };

export interface Segment {
  id: SegmentId;
  nodeA: NodeId;
  nodeB: NodeId;
  lengthMm: number;
  subNetworkTag?: string;
}

export type WireEndpoint =
  | {
      kind: "connectorCavity";
      connectorId: ConnectorId;
      cavityIndex: number;
    }
  | {
      kind: "splicePort";
      spliceId: SpliceId;
      portIndex: number;
      spliceSideOverride?: "L" | "R";
      spliceSideLocked?: boolean;
    };

export type WireProtection =
  | {
      kind: "fuse";
      catalogItemId: CatalogItemId;
    };

export interface Wire {
  id: WireId;
  name: string;
  technicalId: string;
  twistGroupLabel?: string;
  functionalDomainTag?: string;
  sectionMm2: number;
  currentA?: number;
  material?: WireMaterial;
  colorMode?: WireColorMode;
  primaryColorId: string | null;
  secondaryColorId: string | null;
  freeColorLabel?: string | null;
  endpointAConnectionReference?: string;
  endpointAConnectionName?: string;
  endpointASealReference?: string;
  endpointASealName?: string;
  endpointBConnectionReference?: string;
  endpointBConnectionName?: string;
  endpointBSealReference?: string;
  endpointBSealName?: string;
  endpointA: WireEndpoint;
  endpointB: WireEndpoint;
  protection?: WireProtection;
  routeSegmentIds: SegmentId[];
  lengthMm: number;
  isRouteLocked: boolean;
}
