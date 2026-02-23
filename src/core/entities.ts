export type Brand<T, B extends string> = T & { readonly __brand: B };

export type NetworkId = Brand<string, "NetworkId">;
export type ConnectorId = Brand<string, "ConnectorId">;
export type SpliceId = Brand<string, "SpliceId">;
export type NodeId = Brand<string, "NodeId">;
export type SegmentId = Brand<string, "SegmentId">;
export type WireId = Brand<string, "WireId">;

export interface Network {
  id: NetworkId;
  name: string;
  technicalId: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Connector {
  id: ConnectorId;
  name: string;
  technicalId: string;
  cavityCount: number;
  cableCalloutPosition?: {
    x: number;
    y: number;
  };
}

export interface Splice {
  id: SpliceId;
  name: string;
  technicalId: string;
  portCount: number;
  cableCalloutPosition?: {
    x: number;
    y: number;
  };
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
    };

export interface Wire {
  id: WireId;
  name: string;
  technicalId: string;
  sectionMm2: number;
  primaryColorId: string | null;
  secondaryColorId: string | null;
  endpointA: WireEndpoint;
  endpointB: WireEndpoint;
  routeSegmentIds: SegmentId[];
  lengthMm: number;
  isRouteLocked: boolean;
}
