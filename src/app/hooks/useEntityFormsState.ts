import { useState } from "react";
import type {
  CatalogItemId,
  ConnectorId,
  NetworkNode,
  NodeId,
  SegmentId,
  SpliceId,
  WireEndpoint,
  WireId,
  WireMaterial
} from "../../core/entities";
import { DEFAULT_NEW_SPLICE_PORT_MODE, type SplicePortMode } from "../../core/splicePortMode";
import type { DirectionalSpliceSide } from "../../core/directionalSplice";

export function useEntityFormsState() {
  const [catalogFormMode, setCatalogFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingCatalogItemId, setEditingCatalogItemId] = useState<CatalogItemId | null>(null);
  const [catalogManufacturerReference, setCatalogManufacturerReference] = useState("");
  const [catalogConnectionCount, setCatalogConnectionCount] = useState("4");
  const [catalogName, setCatalogName] = useState("");
  const [catalogUnitPriceExclTax, setCatalogUnitPriceExclTax] = useState("");
  const [catalogUrl, setCatalogUrl] = useState("");
  const [catalogFormError, setCatalogFormError] = useState<string | null>(null);

  const [connectorFormMode, setConnectorFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [connectorEditAfterCreate, setConnectorEditAfterCreate] = useState(false);
  const [editingConnectorId, setEditingConnectorId] = useState<ConnectorId | null>(null);
  const [connectorName, setConnectorName] = useState("");
  const [connectorTechnicalId, setConnectorTechnicalId] = useState("");
  const [connectorCatalogItemId, setConnectorCatalogItemId] = useState("");
  const [connectorManufacturerReference, setConnectorManufacturerReference] = useState("");
  const [connectorIsMainHarnessConnector, setConnectorIsMainHarnessConnector] = useState(false);
  const [connectorAutoCreateLinkedNode, setConnectorAutoCreateLinkedNode] = useState(true);
  const [cavityCount, setCavityCount] = useState("4");
  const [cavityIndexInput, setCavityIndexInput] = useState("1");
  const [connectorOccupantRefInput, setConnectorOccupantRefInput] = useState("manual-assignment");
  const [connectorFormError, setConnectorFormError] = useState<string | null>(null);

  const [spliceFormMode, setSpliceFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [spliceEditAfterCreate, setSpliceEditAfterCreate] = useState(false);
  const [editingSpliceId, setEditingSpliceId] = useState<SpliceId | null>(null);
  const [spliceName, setSpliceName] = useState("");
  const [spliceTechnicalId, setSpliceTechnicalId] = useState("");
  const [spliceCatalogItemId, setSpliceCatalogItemId] = useState("");
  const [splicePortMode, setSplicePortMode] = useState<SplicePortMode>(DEFAULT_NEW_SPLICE_PORT_MODE);
  const [spliceSideInverted, setSpliceSideInverted] = useState(false);
  const [spliceManufacturerReference, setSpliceManufacturerReference] = useState("");
  const [spliceAutoCreateLinkedNode, setSpliceAutoCreateLinkedNode] = useState(true);
  const [portCount, setPortCount] = useState("4");
  const [portIndexInput, setPortIndexInput] = useState("1");
  const [spliceOccupantRefInput, setSpliceOccupantRefInput] = useState("manual-assignment");
  const [spliceFormInfo, setSpliceFormInfo] = useState<string | null>(null);
  const [spliceFormError, setSpliceFormError] = useState<string | null>(null);

  const [nodeFormMode, setNodeFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [nodeEditAfterCreate, setNodeEditAfterCreate] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [nodeIdInput, setNodeIdInput] = useState("");
  const [nodeKind, setNodeKind] = useState<NetworkNode["kind"]>("intermediate");
  const [nodeConnectorId, setNodeConnectorId] = useState("");
  const [nodeSpliceId, setNodeSpliceId] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeFormError, setNodeFormError] = useState<string | null>(null);

  const [segmentFormMode, setSegmentFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [segmentEditAfterCreate, setSegmentEditAfterCreate] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<SegmentId | null>(null);
  const [segmentIdInput, setSegmentIdInput] = useState("");
  const [segmentNodeA, setSegmentNodeA] = useState("");
  const [segmentNodeB, setSegmentNodeB] = useState("");
  const [segmentLengthMm, setSegmentLengthMm] = useState("120");
  const [segmentSubNetworkTag, setSegmentSubNetworkTag] = useState("");
  const [segmentFormError, setSegmentFormError] = useState<string | null>(null);

  const [wireFormMode, setWireFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [wireEditAfterCreate, setWireEditAfterCreate] = useState(false);
  const [editingWireId, setEditingWireId] = useState<WireId | null>(null);
  const [wireName, setWireName] = useState("");
  const [wireTechnicalId, setWireTechnicalId] = useState("");
  const [wireTwistGroupLabel, setWireTwistGroupLabel] = useState("");
  const [wireFunctionalDomainTag, setWireFunctionalDomainTag] = useState("");
  const [wireSectionMm2, setWireSectionMm2] = useState("0.5");
  const [wireCurrentA, setWireCurrentA] = useState("");
  const [wireMaterial, setWireMaterial] = useState<WireMaterial>("copper");
  const [wireColorMode, setWireColorMode] = useState<"none" | "catalog" | "free">("none");
  const [wirePrimaryColorId, setWirePrimaryColorId] = useState("");
  const [wireSecondaryColorId, setWireSecondaryColorId] = useState("");
  const [wireFreeColorLabel, setWireFreeColorLabel] = useState("");
  const [wireFuseEnabled, setWireFuseEnabled] = useState(false);
  const [wireFuseCatalogItemId, setWireFuseCatalogItemId] = useState("");
  const [wireEndpointAConnectionReference, setWireEndpointAConnectionReference] = useState("");
  const [wireEndpointAConnectionName, setWireEndpointAConnectionName] = useState("");
  const [wireEndpointASealReference, setWireEndpointASealReference] = useState("");
  const [wireEndpointASealName, setWireEndpointASealName] = useState("");
  const [wireEndpointAKind, setWireEndpointAKind] = useState<WireEndpoint["kind"]>("connectorCavity");
  const [wireEndpointAConnectorId, setWireEndpointAConnectorId] = useState("");
  const [wireEndpointACavityIndex, setWireEndpointACavityIndex] = useState("1");
  const [wireEndpointASpliceId, setWireEndpointASpliceId] = useState("");
  const [wireEndpointAPortIndex, setWireEndpointAPortIndex] = useState("1");
  const [wireEndpointASpliceSideOverride, setWireEndpointASpliceSideOverride] = useState<DirectionalSpliceSide | "auto">("auto");
  const [wireEndpointASpliceSideLocked, setWireEndpointASpliceSideLocked] = useState(false);
  const [wireEndpointBConnectionReference, setWireEndpointBConnectionReference] = useState("");
  const [wireEndpointBConnectionName, setWireEndpointBConnectionName] = useState("");
  const [wireEndpointBSealReference, setWireEndpointBSealReference] = useState("");
  const [wireEndpointBSealName, setWireEndpointBSealName] = useState("");
  const [wireEndpointBKind, setWireEndpointBKind] = useState<WireEndpoint["kind"]>("splicePort");
  const [wireEndpointBConnectorId, setWireEndpointBConnectorId] = useState("");
  const [wireEndpointBCavityIndex, setWireEndpointBCavityIndex] = useState("1");
  const [wireEndpointBSpliceId, setWireEndpointBSpliceId] = useState("");
  const [wireEndpointBPortIndex, setWireEndpointBPortIndex] = useState("1");
  const [wireEndpointBSpliceSideOverride, setWireEndpointBSpliceSideOverride] = useState<DirectionalSpliceSide | "auto">("auto");
  const [wireEndpointBSpliceSideLocked, setWireEndpointBSpliceSideLocked] = useState(false);
  const [wireForcedRouteInput, setWireForcedRouteInput] = useState("");
  const [wireFormError, setWireFormError] = useState<string | null>(null);

  return {
    catalogFormMode,
    setCatalogFormMode,
    editingCatalogItemId,
    setEditingCatalogItemId,
    catalogManufacturerReference,
    setCatalogManufacturerReference,
    catalogConnectionCount,
    setCatalogConnectionCount,
    catalogName,
    setCatalogName,
    catalogUnitPriceExclTax,
    setCatalogUnitPriceExclTax,
    catalogUrl,
    setCatalogUrl,
    catalogFormError,
    setCatalogFormError,
    connectorFormMode,
    setConnectorFormMode,
    connectorEditAfterCreate,
    setConnectorEditAfterCreate,
    editingConnectorId,
    setEditingConnectorId,
    connectorName,
    setConnectorName,
    connectorTechnicalId,
    setConnectorTechnicalId,
    connectorCatalogItemId,
    setConnectorCatalogItemId,
    connectorManufacturerReference,
    setConnectorManufacturerReference,
    connectorIsMainHarnessConnector,
    setConnectorIsMainHarnessConnector,
    connectorAutoCreateLinkedNode,
    setConnectorAutoCreateLinkedNode,
    cavityCount,
    setCavityCount,
    cavityIndexInput,
    setCavityIndexInput,
    connectorOccupantRefInput,
    setConnectorOccupantRefInput,
    connectorFormError,
    setConnectorFormError,
    spliceFormMode,
    setSpliceFormMode,
    spliceEditAfterCreate,
    setSpliceEditAfterCreate,
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    spliceCatalogItemId,
    setSpliceCatalogItemId,
    splicePortMode,
    setSplicePortMode,
    spliceSideInverted,
    setSpliceSideInverted,
    spliceManufacturerReference,
    setSpliceManufacturerReference,
    spliceAutoCreateLinkedNode,
    setSpliceAutoCreateLinkedNode,
    portCount,
    setPortCount,
    portIndexInput,
    setPortIndexInput,
    spliceOccupantRefInput,
    setSpliceOccupantRefInput,
    spliceFormInfo,
    setSpliceFormInfo,
    spliceFormError,
    setSpliceFormError,
    nodeFormMode,
    setNodeFormMode,
    nodeEditAfterCreate,
    setNodeEditAfterCreate,
    editingNodeId,
    setEditingNodeId,
    nodeIdInput,
    setNodeIdInput,
    nodeKind,
    setNodeKind,
    nodeConnectorId,
    setNodeConnectorId,
    nodeSpliceId,
    setNodeSpliceId,
    nodeLabel,
    setNodeLabel,
    nodeFormError,
    setNodeFormError,
    segmentFormMode,
    setSegmentFormMode,
    segmentEditAfterCreate,
    setSegmentEditAfterCreate,
    editingSegmentId,
    setEditingSegmentId,
    segmentIdInput,
    setSegmentIdInput,
    segmentNodeA,
    setSegmentNodeA,
    segmentNodeB,
    setSegmentNodeB,
    segmentLengthMm,
    setSegmentLengthMm,
    segmentSubNetworkTag,
    setSegmentSubNetworkTag,
    segmentFormError,
    setSegmentFormError,
    wireFormMode,
    setWireFormMode,
    wireEditAfterCreate,
    setWireEditAfterCreate,
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireTwistGroupLabel,
    setWireTwistGroupLabel,
    wireFunctionalDomainTag,
    setWireFunctionalDomainTag,
    wireSectionMm2,
    setWireSectionMm2,
    wireCurrentA,
    setWireCurrentA,
    wireMaterial,
    setWireMaterial,
    wireColorMode,
    setWireColorMode,
    wirePrimaryColorId,
    setWirePrimaryColorId,
    wireSecondaryColorId,
    setWireSecondaryColorId,
    wireFreeColorLabel,
    setWireFreeColorLabel,
    wireFuseEnabled,
    setWireFuseEnabled,
    wireFuseCatalogItemId,
    setWireFuseCatalogItemId,
    wireEndpointAConnectionReference,
    setWireEndpointAConnectionReference,
    wireEndpointAConnectionName,
    setWireEndpointAConnectionName,
    wireEndpointASealReference,
    setWireEndpointASealReference,
    wireEndpointASealName,
    setWireEndpointASealName,
    wireEndpointAKind,
    setWireEndpointAKind,
    wireEndpointAConnectorId,
    setWireEndpointAConnectorId,
    wireEndpointACavityIndex,
    setWireEndpointACavityIndex,
    wireEndpointASpliceId,
    setWireEndpointASpliceId,
    wireEndpointAPortIndex,
    setWireEndpointAPortIndex,
    wireEndpointASpliceSideOverride,
    setWireEndpointASpliceSideOverride,
    wireEndpointASpliceSideLocked,
    setWireEndpointASpliceSideLocked,
    wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference,
    wireEndpointBConnectionName,
    setWireEndpointBConnectionName,
    wireEndpointBSealReference,
    setWireEndpointBSealReference,
    wireEndpointBSealName,
    setWireEndpointBSealName,
    wireEndpointBKind,
    setWireEndpointBKind,
    wireEndpointBConnectorId,
    setWireEndpointBConnectorId,
    wireEndpointBCavityIndex,
    setWireEndpointBCavityIndex,
    wireEndpointBSpliceId,
    setWireEndpointBSpliceId,
    wireEndpointBPortIndex,
    setWireEndpointBPortIndex,
    wireEndpointBSpliceSideOverride,
    setWireEndpointBSpliceSideOverride,
    wireEndpointBSpliceSideLocked,
    setWireEndpointBSpliceSideLocked,
    wireForcedRouteInput,
    setWireForcedRouteInput,
    wireFormError,
    setWireFormError
  };
}

export type EntityFormsStateModel = ReturnType<typeof useEntityFormsState>;
