import type { WireColorMode } from "./cableColors";

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type NetworkId = Brand<string, "NetworkId">;
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
  catalogItemId?: CatalogItemId;
  manufacturerReference?: string;
  cableCalloutPosition?: {
    x: number;
    y: number;
  };
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
