import type { FormEvent, ReactElement } from "react";
import type { Connector, ConnectorId, Splice, SpliceId, Wire, WireId } from "../../../core/entities";
import type { ConnectorSynthesisRow, SortState, SpliceSynthesisRow } from "../../types/app-controller";

interface OccupancyStatus {
  isOccupied: boolean;
  occupantRef: string | null;
}

export interface ConnectorCavityStatus extends OccupancyStatus {
  cavityIndex: number;
}

export interface SplicePortStatus extends OccupancyStatus {
  portIndex: number;
}

export interface AnalysisWorkspaceContentProps {
  isConnectorSubScreen: boolean;
  isSpliceSubScreen: boolean;
  isWireSubScreen: boolean;
  networkSummaryPanel: ReactElement;
  selectedConnector: Connector | null;
  selectedConnectorId: ConnectorId | null;
  connectorOccupancyFilter: "all" | "occupied" | "free";
  setConnectorOccupancyFilter: (value: "all" | "occupied" | "free") => void;
  connectors: Connector[];
  visibleConnectors: Connector[];
  connectorSort: SortState;
  setConnectorSort: (value: SortState | ((current: SortState) => SortState)) => void;
  connectorOccupiedCountById: Map<ConnectorId, number>;
  onSelectConnector: (connectorId: ConnectorId) => void;
  cavityIndexInput: string;
  setCavityIndexInput: (value: string) => void;
  connectorOccupantRefInput: string;
  setConnectorOccupantRefInput: (value: string) => void;
  handleReserveCavity: (event: FormEvent<HTMLFormElement>) => void;
  connectorCavityStatuses: ConnectorCavityStatus[];
  handleReleaseCavity: (cavityIndex: number) => void;
  sortedConnectorSynthesisRows: ConnectorSynthesisRow[];
  connectorSynthesisSort: SortState;
  setConnectorSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  getSortIndicator: (sortState: SortState, field: "name" | "technicalId") => string;
  selectedSplice: Splice | null;
  selectedSpliceId: SpliceId | null;
  spliceOccupancyFilter: "all" | "occupied" | "free";
  setSpliceOccupancyFilter: (value: "all" | "occupied" | "free") => void;
  splices: Splice[];
  visibleSplices: Splice[];
  spliceSort: SortState;
  setSpliceSort: (value: SortState | ((current: SortState) => SortState)) => void;
  spliceOccupiedCountById: Map<SpliceId, number>;
  onSelectSplice: (spliceId: SpliceId) => void;
  splicePortStatuses: SplicePortStatus[];
  portIndexInput: string;
  setPortIndexInput: (value: string) => void;
  spliceOccupantRefInput: string;
  setSpliceOccupantRefInput: (value: string) => void;
  handleReservePort: (event: FormEvent<HTMLFormElement>) => void;
  handleReleasePort: (portIndex: number) => void;
  sortedSpliceSynthesisRows: SpliceSynthesisRow[];
  spliceSynthesisSort: SortState;
  setSpliceSynthesisSort: (value: SortState | ((current: SortState) => SortState)) => void;
  wireRouteFilter: "all" | "auto" | "locked";
  setWireRouteFilter: (value: "all" | "auto" | "locked") => void;
  wires: Wire[];
  visibleWires: Wire[];
  wireSort: SortState;
  setWireSort: (value: SortState | ((current: SortState) => SortState)) => void;
  selectedWireId: WireId | null;
  onSelectWire: (wireId: WireId) => void;
  selectedWire: Wire | null;
  describeWireEndpoint: (endpoint: Wire["endpointA"]) => string;
  describeWireEndpointId: (endpoint: Wire["endpointA"]) => string;
  wireForcedRouteInput: string;
  setWireForcedRouteInput: (value: string) => void;
  handleLockWireRoute: () => void;
  handleResetWireRoute: () => void;
  wireFormError: string | null;
}
