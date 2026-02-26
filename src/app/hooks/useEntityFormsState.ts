import { useState } from "react";
import type { CatalogItemId, ConnectorId, NetworkNode, NodeId, SegmentId, SpliceId, WireEndpoint, WireId } from "../../core/entities";

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
  const [editingConnectorId, setEditingConnectorId] = useState<ConnectorId | null>(null);
  const [connectorName, setConnectorName] = useState("");
  const [connectorTechnicalId, setConnectorTechnicalId] = useState("");
  const [connectorCatalogItemId, setConnectorCatalogItemId] = useState("");
  const [connectorManufacturerReference, setConnectorManufacturerReference] = useState("");
  const [connectorAutoCreateLinkedNode, setConnectorAutoCreateLinkedNode] = useState(true);
  const [cavityCount, setCavityCount] = useState("4");
  const [cavityIndexInput, setCavityIndexInput] = useState("1");
  const [connectorOccupantRefInput, setConnectorOccupantRefInput] = useState("manual-assignment");
  const [connectorFormError, setConnectorFormError] = useState<string | null>(null);

  const [spliceFormMode, setSpliceFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingSpliceId, setEditingSpliceId] = useState<SpliceId | null>(null);
  const [spliceName, setSpliceName] = useState("");
  const [spliceTechnicalId, setSpliceTechnicalId] = useState("");
  const [spliceCatalogItemId, setSpliceCatalogItemId] = useState("");
  const [spliceManufacturerReference, setSpliceManufacturerReference] = useState("");
  const [spliceAutoCreateLinkedNode, setSpliceAutoCreateLinkedNode] = useState(true);
  const [portCount, setPortCount] = useState("4");
  const [portIndexInput, setPortIndexInput] = useState("1");
  const [spliceOccupantRefInput, setSpliceOccupantRefInput] = useState("manual-assignment");
  const [spliceFormError, setSpliceFormError] = useState<string | null>(null);

  const [nodeFormMode, setNodeFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingNodeId, setEditingNodeId] = useState<NodeId | null>(null);
  const [nodeIdInput, setNodeIdInput] = useState("");
  const [nodeKind, setNodeKind] = useState<NetworkNode["kind"]>("intermediate");
  const [nodeConnectorId, setNodeConnectorId] = useState("");
  const [nodeSpliceId, setNodeSpliceId] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
  const [nodeFormError, setNodeFormError] = useState<string | null>(null);

  const [segmentFormMode, setSegmentFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingSegmentId, setEditingSegmentId] = useState<SegmentId | null>(null);
  const [segmentIdInput, setSegmentIdInput] = useState("");
  const [segmentNodeA, setSegmentNodeA] = useState("");
  const [segmentNodeB, setSegmentNodeB] = useState("");
  const [segmentLengthMm, setSegmentLengthMm] = useState("120");
  const [segmentSubNetworkTag, setSegmentSubNetworkTag] = useState("");
  const [segmentFormError, setSegmentFormError] = useState<string | null>(null);

  const [wireFormMode, setWireFormMode] = useState<"idle" | "create" | "edit">("idle");
  const [editingWireId, setEditingWireId] = useState<WireId | null>(null);
  const [wireName, setWireName] = useState("");
  const [wireTechnicalId, setWireTechnicalId] = useState("");
  const [wireSectionMm2, setWireSectionMm2] = useState("0.5");
  const [wireColorMode, setWireColorMode] = useState<"none" | "catalog" | "free">("none");
  const [wirePrimaryColorId, setWirePrimaryColorId] = useState("");
  const [wireSecondaryColorId, setWireSecondaryColorId] = useState("");
  const [wireFreeColorLabel, setWireFreeColorLabel] = useState("");
  const [wireFuseEnabled, setWireFuseEnabled] = useState(false);
  const [wireFuseCatalogItemId, setWireFuseCatalogItemId] = useState("");
  const [wireEndpointAConnectionReference, setWireEndpointAConnectionReference] = useState("");
  const [wireEndpointASealReference, setWireEndpointASealReference] = useState("");
  const [wireEndpointAKind, setWireEndpointAKind] = useState<WireEndpoint["kind"]>("connectorCavity");
  const [wireEndpointAConnectorId, setWireEndpointAConnectorId] = useState("");
  const [wireEndpointACavityIndex, setWireEndpointACavityIndex] = useState("1");
  const [wireEndpointASpliceId, setWireEndpointASpliceId] = useState("");
  const [wireEndpointAPortIndex, setWireEndpointAPortIndex] = useState("1");
  const [wireEndpointBConnectionReference, setWireEndpointBConnectionReference] = useState("");
  const [wireEndpointBSealReference, setWireEndpointBSealReference] = useState("");
  const [wireEndpointBKind, setWireEndpointBKind] = useState<WireEndpoint["kind"]>("splicePort");
  const [wireEndpointBConnectorId, setWireEndpointBConnectorId] = useState("");
  const [wireEndpointBCavityIndex, setWireEndpointBCavityIndex] = useState("1");
  const [wireEndpointBSpliceId, setWireEndpointBSpliceId] = useState("");
  const [wireEndpointBPortIndex, setWireEndpointBPortIndex] = useState("1");
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
    editingSpliceId,
    setEditingSpliceId,
    spliceName,
    setSpliceName,
    spliceTechnicalId,
    setSpliceTechnicalId,
    spliceCatalogItemId,
    setSpliceCatalogItemId,
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
    spliceFormError,
    setSpliceFormError,
    nodeFormMode,
    setNodeFormMode,
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
    editingWireId,
    setEditingWireId,
    wireName,
    setWireName,
    wireTechnicalId,
    setWireTechnicalId,
    wireSectionMm2,
    setWireSectionMm2,
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
    wireEndpointASealReference,
    setWireEndpointASealReference,
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
    wireEndpointBConnectionReference,
    setWireEndpointBConnectionReference,
    wireEndpointBSealReference,
    setWireEndpointBSealReference,
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
    wireForcedRouteInput,
    setWireForcedRouteInput,
    wireFormError,
    setWireFormError
  };
}
