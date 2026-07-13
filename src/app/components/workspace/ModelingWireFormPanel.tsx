import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement } from "react";
import { CABLE_COLOR_BY_ID, CABLE_COLOR_CATALOG } from "../../../core/cableColors";
import { getConnectorCavityFallbackLabel, resolveConnectorCavityDisplayLabel } from "../../../core/connectorLayout";
import {
  FUNCTIONAL_FILTER_12V_POWER,
  FUNCTIONAL_FILTER_48V,
  FUNCTIONAL_FILTER_CAN,
  FUNCTIONAL_FILTER_GROUND_POWER,
  FUNCTIONAL_FILTER_SIGNAL
} from "../../../core/functionalSchematic";
import { normalizeConnectorTerminalMaterial } from "../../../core/connectorCatalogMaterials";
import type { CatalogItem, Connector, ConnectorTerminalMaterial, WireEndpoint } from "../../../core/entities";
import { resolveSplicePortMode } from "../../../core/splicePortMode";
import { useWireHandlersContext } from "../controller/ModelingController.context";
import { FORM_PANEL_IDS } from "../../lib/form-panel-scroll";
import { buildModelingDynamicSelectOptions } from "../../lib/modelingSelectOptions";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { renderFormHeader, renderIdleCopy } from "./ModelingFormsColumn.shared";

interface WireEndpointCatalogDefaults {
  connectionReference?: string;
  connectionName?: string;
  sealReference?: string;
  sealName?: string;
}

function buildDefaultLabel(label: string, defaultValue: string | undefined): string {
  return defaultValue === undefined ? label : `${label} (${defaultValue})`;
}

function resolveCatalogDefaultTerminalMaterial(
  connector: Connector | undefined,
  catalogItems: readonly CatalogItem[],
  cavityIndexText: string
): ConnectorTerminalMaterial | undefined {
  if (connector?.catalogItemId === undefined) {
    return undefined;
  }

  const cavityIndex = Number(cavityIndexText);
  if (!Number.isInteger(cavityIndex) || cavityIndex < 1) {
    return undefined;
  }

  const catalogItem = catalogItems.find((item) => item.id === connector.catalogItemId);
  const catalogDefaults = catalogItem?.connectorDefaults;
  if (catalogDefaults === undefined) {
    return undefined;
  }

  const cavityOverride = normalizeConnectorTerminalMaterial(catalogDefaults.terminalOverrides?.[cavityIndex]);
  if (cavityOverride !== undefined) {
    return cavityOverride;
  }

  if (catalogDefaults.allSameTerminals === true) {
    return normalizeConnectorTerminalMaterial(catalogDefaults.defaultTerminal);
  }

  return undefined;
}

function resolveWireEndpointCatalogDefaults(params: {
  kind: WireEndpoint["kind"];
  connectorId: string;
  cavityIndex: string;
  connectors: readonly Connector[];
  catalogItems: readonly CatalogItem[];
}): WireEndpointCatalogDefaults {
  if (params.kind !== "connectorCavity") {
    return {};
  }

  const connector = params.connectors.find((candidate) => candidate.id === params.connectorId);
  const material = resolveCatalogDefaultTerminalMaterial(connector, params.catalogItems, params.cavityIndex);
  return {
    connectionReference: material?.terminalReference,
    connectionName: material?.terminalName,
    sealReference: connector?.applyCatalogSeals === false ? undefined : material?.sealReference,
    sealName: connector?.applyCatalogSeals === false ? undefined : material?.sealName
  };
}

function resolveWireEndpointPhysicalLabelPreview(params: {
  connectorId: string;
  cavityIndexText: string;
  connectors: readonly Connector[];
  catalogItems: readonly CatalogItem[];
}): string | null {
  const cavityIndex = Number(params.cavityIndexText);
  if (!Number.isInteger(cavityIndex) || cavityIndex < 1 || params.connectorId.length === 0) {
    return null;
  }

  const connector = params.connectors.find((candidate) => candidate.id === params.connectorId);
  const catalogItem = connector?.catalogItemId === undefined
    ? undefined
    : params.catalogItems.find((candidate) => candidate.id === connector.catalogItemId);
  const resolvedLabel = resolveConnectorCavityDisplayLabel(connector, catalogItem, cavityIndex);
  return resolvedLabel === getConnectorCavityFallbackLabel(cavityIndex) ? null : resolvedLabel;
}

export function ModelingWireFormPanel(props: ModelingFormsColumnProps): ReactElement {
  const {
    isWireSubScreen,
    wireFormMode,
    wireEditAfterCreate,
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
    recommendedWireSectionMm2,
    handleApplyRecommendedWireSection,
    wireColorMode,
    setWireColorMode,
    wirePrimaryColorId,
    setWirePrimaryColorId,
    wireSecondaryColorId,
    setWireSecondaryColorId,
    setWireFreeColorLabel,
    wireFuseEnabled,
    setWireFuseEnabled,
    wireFuseCatalogItemId,
    setWireFuseCatalogItemId,
    wireTechnicalIdAlreadyUsed,
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
    wireEndpointAAllowSharedCavity,
    setWireEndpointAAllowSharedCavity,
    wireEndpointASlotHint,
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
    wireEndpointBAllowSharedCavity,
    setWireEndpointBAllowSharedCavity,
    wireEndpointBSlotHint,
    catalogItems,
    connectors,
    splices,
    nodes,
    wireFormError
  } = props;
  const wireHandlers = useWireHandlersContext();
  const primaryColor = wirePrimaryColorId.length > 0 ? CABLE_COLOR_BY_ID[wirePrimaryColorId] : undefined;
  const secondaryColor = wireSecondaryColorId.length > 0 ? CABLE_COLOR_BY_ID[wireSecondaryColorId] : undefined;
  // A splice can host a wire endpoint when it has a canonical floating placement
  // or still resolves through a legacy splice node (the same connectable states
  // accepted by `resolveWireEndpointAnchor`). Splices that are neither placed nor
  // backed by a node are unplaced and cannot be connected.
  const spliceIdsWithLegacyNode = new Set(
    nodes.filter((node) => node.kind === "splice").map((node) => node.spliceId)
  );
  const isSpliceConnectable = (splice: (typeof splices)[number]): boolean =>
    splice.placement !== undefined || spliceIdsWithLegacyNode.has(splice.id);
  const connectableSplices = splices.filter(isSpliceConnectable);
  const selectedEndpointASplice = splices.find((splice) => splice.id === wireEndpointASpliceId);
  const selectedEndpointBSplice = splices.find((splice) => splice.id === wireEndpointBSpliceId);
  const selectedEndpointASpliceIsUnplaced =
    selectedEndpointASplice !== undefined && !isSpliceConnectable(selectedEndpointASplice);
  const selectedEndpointBSpliceIsUnplaced =
    selectedEndpointBSplice !== undefined && !isSpliceConnectable(selectedEndpointBSplice);
  const endpointAIsDirectionalSplice =
    selectedEndpointASplice !== undefined && resolveSplicePortMode(selectedEndpointASplice) === "directional";
  const endpointBIsDirectionalSplice =
    selectedEndpointBSplice !== undefined && resolveSplicePortMode(selectedEndpointBSplice) === "directional";
  const primaryColorSelectValue =
    wireColorMode === "free" ? "__free__" : wireColorMode === "catalog" ? wirePrimaryColorId : "";
  function handleWirePrimaryColorSelection(nextValue: string): void {
    if (nextValue === "__free__") {
      setWireColorMode("free");
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
      setWireFreeColorLabel("");
      return;
    }
    if (nextValue.length === 0) {
      setWireColorMode("none");
      setWirePrimaryColorId("");
      setWireSecondaryColorId("");
      setWireFreeColorLabel("");
      return;
    }
    setWireColorMode("catalog");
    setWirePrimaryColorId(nextValue);
    setWireFreeColorLabel("");
  }
  const functionalDomainTagOptions = [
    FUNCTIONAL_FILTER_SIGNAL,
    FUNCTIONAL_FILTER_12V_POWER,
    FUNCTIONAL_FILTER_GROUND_POWER,
    FUNCTIONAL_FILTER_48V,
    FUNCTIONAL_FILTER_CAN
  ];
  const selectedFuseCatalogItemMissing =
    wireFuseCatalogItemId.trim().length > 0 &&
    !catalogItems.some((item) => item.id === wireFuseCatalogItemId);
  const fuseCatalogItemOptions = buildModelingDynamicSelectOptions({
    options: catalogItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturerReference}${item.name?.trim() ? ` - ${item.name.trim()}` : ""}`
    })),
    selectedValue: wireFuseCatalogItemId,
    missingOption: selectedFuseCatalogItemMissing ? { label: t("ui.missingCatalogItemValue", { itemId: wireFuseCatalogItemId }) } : null
  });
  const connectorOptions = buildModelingDynamicSelectOptions({
    options: connectors.map((connector) => ({
      value: connector.id,
      label: `${connector.name} (${connector.technicalId})`,
      technicalId: connector.technicalId
    })),
    selectedValue: wireEndpointAConnectorId,
    missingOption:
      wireEndpointAConnectorId.trim().length === 0
        ? null
        : { label: `Missing connector (${wireEndpointAConnectorId})`, technicalId: wireEndpointAConnectorId }
  });
  const endpointASpliceOptions = buildModelingDynamicSelectOptions({
    options: connectableSplices.map((splice) => ({
      value: splice.id,
      label: `${splice.name} (${splice.technicalId})`,
      technicalId: splice.technicalId
    })),
    selectedValue: wireEndpointASpliceId,
    missingOption:
      wireEndpointASpliceId.trim().length === 0
        ? null
        : selectedEndpointASpliceIsUnplaced
          ? { label: `Unplaced splice (${wireEndpointASpliceId})`, technicalId: wireEndpointASpliceId }
          : { label: `Missing splice (${wireEndpointASpliceId})`, technicalId: wireEndpointASpliceId }
  });
  const endpointBConnectorOptions = buildModelingDynamicSelectOptions({
    options: connectors.map((connector) => ({
      value: connector.id,
      label: `${connector.name} (${connector.technicalId})`,
      technicalId: connector.technicalId
    })),
    selectedValue: wireEndpointBConnectorId,
    missingOption:
      wireEndpointBConnectorId.trim().length === 0
        ? null
        : { label: `Missing connector (${wireEndpointBConnectorId})`, technicalId: wireEndpointBConnectorId }
  });
  const endpointBSpliceOptions = buildModelingDynamicSelectOptions({
    options: connectableSplices.map((splice) => ({
      value: splice.id,
      label: `${splice.name} (${splice.technicalId})`,
      technicalId: splice.technicalId
    })),
    selectedValue: wireEndpointBSpliceId,
    missingOption:
      wireEndpointBSpliceId.trim().length === 0
        ? null
        : selectedEndpointBSpliceIsUnplaced
          ? { label: `Unplaced splice (${wireEndpointBSpliceId})`, technicalId: wireEndpointBSpliceId }
          : { label: `Missing splice (${wireEndpointBSpliceId})`, technicalId: wireEndpointBSpliceId }
  });
  const endpointACatalogDefaults = resolveWireEndpointCatalogDefaults({
    kind: wireEndpointAKind,
    connectorId: wireEndpointAConnectorId,
    cavityIndex: wireEndpointACavityIndex,
    connectors,
    catalogItems
  });
  const endpointAPhysicalLabelPreview = resolveWireEndpointPhysicalLabelPreview({
    connectorId: wireEndpointAConnectorId,
    cavityIndexText: wireEndpointACavityIndex,
    connectors,
    catalogItems
  });
  const endpointBCatalogDefaults = resolveWireEndpointCatalogDefaults({
    kind: wireEndpointBKind,
    connectorId: wireEndpointBConnectorId,
    cavityIndex: wireEndpointBCavityIndex,
    connectors,
    catalogItems
  });
  const endpointBPhysicalLabelPreview = resolveWireEndpointPhysicalLabelPreview({
    connectorId: wireEndpointBConnectorId,
    cavityIndexText: wireEndpointBCavityIndex,
    connectors,
    catalogItems
  });

  const swatch = (hex: string | undefined, label: string): ReactElement => (
    <span
      aria-hidden="true"
      title={label}
      style={{
        display: "inline-block",
        width: "0.9rem",
        height: "0.9rem",
        borderRadius: "999px",
        border: "1px solid var(--panel-border, rgba(255,255,255,0.2))",
        background: hex ?? "transparent",
        marginRight: "0.35rem",
        verticalAlign: "text-bottom",
        boxShadow: hex === undefined ? "inset 0 0 0 1px rgba(255,255,255,0.25)" : undefined
      }}
    />
  );

  return (
<article className="panel" hidden={!isWireSubScreen} data-form-panel={FORM_PANEL_IDS.wire}>
  {renderFormHeader(wireFormMode === "create" ? t("ui.createWire") : wireFormMode === "edit" ? t("ui.editWire") : t("ui.wireForm"), wireFormMode)}
  {wireFormMode === "idle" ? renderIdleCopy("wire", wireHandlers.resetWireForm) : (
  <form className="stack-form" onSubmit={wireHandlers.handleWireSubmit}>
    <label>
      
      {t("ui.functionalName")}
      <input value={wireName} onChange={(event) => setWireName(event.target.value)} placeholder={t("ui.feedWire")} required />
    </label>
    <label>
      
      {t("ui.technicalID")}
      <input value={wireTechnicalId} onChange={(event) => setWireTechnicalId(event.target.value)} placeholder="W-001" required />
    </label>
    <label>
      {t("ui.analysisconnectorworkspacepanelsTwistGroup")}<input
        value={wireTwistGroupLabel}
        onChange={(event) => setWireTwistGroupLabel(event.target.value)}
        maxLength={80}
        placeholder={t("ui.modelingwireformpanelOptionalEGCAN1")}
      />
    </label>
    <label>
      {t("ui.analysisconnectorworkspacepanelsFunctionalTag")}<select value={wireFunctionalDomainTag} onChange={(event) => setWireFunctionalDomainTag(event.target.value)}>
        <option value="">{t("ui.auto")}</option>
        {functionalDomainTagOptions.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </label>
    <label>
      
      {t("ui.sectionMm2")}
      <input
        type="number"
        min={0.01}
        step={0.01}
        value={wireSectionMm2}
        onChange={(event) => setWireSectionMm2(event.target.value)}
        placeholder="0.5"
        required
      />
    </label>
    {recommendedWireSectionMm2 !== null ? (
      <div className="stack-form">
        <small className="inline-help">{t("ui.modelingwireformpanelRecommendedSection")}{recommendedWireSectionMm2} mm²</small>
        <div className="row-actions compact">
          <button type="button" className="button-with-icon" onClick={handleApplyRecommendedWireSection}>
            <span className="action-button-icon is-save" aria-hidden="true" />
            {t("ui.modelingaiagentpanelApply")}</button>
        </div>
      </div>
    ) : null}
    <label>
      {t("ui.modelingwireformpanelCurrentA")}<input
        type="number"
        min={0.01}
        step={0.01}
        value={wireCurrentA}
        onChange={(event) => setWireCurrentA(event.target.value)}
        placeholder="10"
      />
    </label>
    <label>
      {t("ui.modelingwireformpanelMaterial")}<select value={wireMaterial} onChange={(event) => setWireMaterial(event.target.value as typeof wireMaterial)}>
        <option value="copper">{t("ui.modelingwireformpanelCopper")}</option>
        <option value="aluminum">{t("ui.modelingwireformpanelAluminum")}</option>
      </select>
    </label>
    <label className="settings-checkbox">
      <input
        type="checkbox"
        checked={wireFuseEnabled}
        onChange={(event) => setWireFuseEnabled(event.target.checked)}
      />{" "}
      {t("ui.analysiswireworkspacepanelsFuse")}</label>
    {wireFuseEnabled ? (
      <>
        <label>
          
          {t("ui.fuseCatalogItem")}
          <select
            value={wireFuseCatalogItemId}
            onChange={(event) => setWireFuseCatalogItemId(event.target.value)}
            required={wireFuseEnabled}
            aria-required={wireFuseEnabled}
          >
            <option value="">{t("ui.selectCatalogItem")}</option>
            {fuseCatalogItemOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <small className="inline-help">{t("ui.fuseReferenceIsTakenFromTheLinkedCatalogItemS")}</small>
      </>
    ) : null}
    <label>
      
      {t("ui.primaryColor")}
      <select
        value={primaryColorSelectValue}
        onChange={(event) => handleWirePrimaryColorSelection(event.target.value)}
      >
        <option value="">{t("ui.modelingwireformpanelNotSpecified")}</option>
        <option value="__free__">{t("ui.free")}</option>
        {CABLE_COLOR_CATALOG.map((color) => (
          <option key={color.id} value={color.id}>
            {color.id} - {color.label}
          </option>
        ))}
      </select>
    </label>
    {wireColorMode === "catalog" && wirePrimaryColorId.length > 0 ? (
      <label>
        
        {t("ui.secondaryColor")}
        <select
          value={wireSecondaryColorId}
          onChange={(event) => setWireSecondaryColorId(event.target.value)}
        >
          <option value="">{t("ui.none")}</option>
          {CABLE_COLOR_CATALOG.map((color) => (
            <option key={color.id} value={color.id}>
              {color.id} - {color.label}
            </option>
          ))}
        </select>
      </label>
    ) : null}
    {wireColorMode === "catalog" ? (
      <small className="inline-help">
        {primaryColor === undefined ? (
          <>{t("ui.modelingwireformpanelNotSpecified")}</>
        ) : (
          <>
            {swatch(primaryColor.hex, primaryColor.label)}
            {primaryColor.id} {primaryColor.label}
            {secondaryColor !== undefined ? (
              <>
                {" + "}
                {swatch(secondaryColor.hex, secondaryColor.label)}
                {secondaryColor.id} {secondaryColor.label}
              </>
            ) : null}
          </>
        )}
      </small>
    ) : null}
    {wireTechnicalIdAlreadyUsed ? <small className="inline-error">{t("ui.thisTechnicalIDIsAlreadyUsed")}</small> : null}
    <div className="form-split wire-endpoints-grid">
      <fieldset className="inline-fieldset wire-endpoint-fieldset">
        <legend>{t("ui.endpointA")}</legend>
        <label>
          
          {t("ui.type")}
          <select value={wireEndpointAKind} onChange={(event) => setWireEndpointAKind(event.target.value as WireEndpoint["kind"])}>
            <option value="connectorCavity">{t("ui.connectorWay")}</option>
            <option value="splicePort">{t("ui.splicePort")}</option>
          </select>
        </label>
        {wireEndpointAKind === "connectorCavity" ? (
          <>
            <label>
              
              {t("ui.connector")}
              <select value={wireEndpointAConnectorId} onChange={(event) => setWireEndpointAConnectorId(event.target.value)}>
                <option value="">{t("ui.selectConnector")}</option>
                {connectorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              
              {t("ui.wayIndex")}
              <input type="number" min={1} step={1} value={wireEndpointACavityIndex} onChange={(event) => setWireEndpointACavityIndex(event.target.value)} />
            </label>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={wireEndpointAAllowSharedCavity}
                onChange={(event) => setWireEndpointAAllowSharedCavity(event.target.checked)}
              />{" "}
              {t("ui.modelingwireformpanelAllowOverloadShareWaySeveralWiresCrimpedTogether")}</label>
            {endpointAPhysicalLabelPreview !== null ? (
              <small className="inline-help">{t("ui.modelingwireformpanelPhysicalLabel")}{endpointAPhysicalLabelPreview}</small>
            ) : null}
            {wireEndpointASlotHint !== null ? (
              <small className={wireEndpointASlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointASlotHint.message}</small>
            ) : null}
          </>
        ) : (
          <>
            <label>
              
              {t("ui.splice")}
              <select value={wireEndpointASpliceId} onChange={(event) => setWireEndpointASpliceId(event.target.value)}>
                <option value="">{t("ui.selectSplice")}</option>
                {endpointASpliceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <small className={selectedEndpointASpliceIsUnplaced ? "inline-error" : "inline-help"}>
              {t("ui.modelingwireformpanelOnlyPlacedSplicesCanBeConnectedToWireEndpoints")}</small>
            {endpointAIsDirectionalSplice ? (
              <>
                <label>
                  {t("ui.modelingwireformpanelSide")}<select
                    value={wireEndpointASpliceSideOverride}
                    onChange={(event) => setWireEndpointASpliceSideOverride(event.target.value as typeof wireEndpointASpliceSideOverride)}
                  >
                    <option value="auto">{t("ui.modelingwireformpanelAutoByRouting")}</option>
                    <option value="L">{t("ui.modelingwireformpanelForceL")}</option>
                    <option value="R">{t("ui.modelingwireformpanelForceR")}</option>
                  </select>
                </label>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={wireEndpointASpliceSideLocked}
                    onChange={(event) => setWireEndpointASpliceSideLocked(event.target.checked)}
                    disabled={wireEndpointASpliceSideOverride === "auto"}
                  />{" "}
                  {t("ui.modelingwireformpanelLockForcedSide")}</label>
              </>
            ) : (
              <label>
                
                {t("ui.portIndex")}
                <input type="number" min={1} step={1} value={wireEndpointAPortIndex} onChange={(event) => setWireEndpointAPortIndex(event.target.value)} />
              </label>
            )}
            {wireEndpointASlotHint !== null ? (
              <small className={wireEndpointASlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointASlotHint.message}</small>
            ) : null}
          </>
        )}
        <div className="stack-form">
          <small className="inline-help">{t("ui.sideAMetadata")}</small>
          <label>
            {buildDefaultLabel(t("ui.connectionReference"), endpointACatalogDefaults.connectionReference)}
            <input
              value={wireEndpointAConnectionReference}
              onChange={(event) => setWireEndpointAConnectionReference(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel("Connection name", endpointACatalogDefaults.connectionName)}
            <input
              value={wireEndpointAConnectionName}
              onChange={(event) => setWireEndpointAConnectionName(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel(t("ui.sealReference"), endpointACatalogDefaults.sealReference)}
            <input
              value={wireEndpointASealReference}
              onChange={(event) => setWireEndpointASealReference(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel("Seal name", endpointACatalogDefaults.sealName)}
            <input
              value={wireEndpointASealName}
              onChange={(event) => setWireEndpointASealName(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="inline-fieldset wire-endpoint-fieldset">
        <legend>{t("ui.endpointB")}</legend>
        <label>
          
          {t("ui.type")}
          <select value={wireEndpointBKind} onChange={(event) => setWireEndpointBKind(event.target.value as WireEndpoint["kind"])}>
            <option value="connectorCavity">{t("ui.connectorWay")}</option>
            <option value="splicePort">{t("ui.splicePort")}</option>
          </select>
        </label>
        {wireEndpointBKind === "connectorCavity" ? (
          <>
            <label>
              
              {t("ui.connector")}
              <select value={wireEndpointBConnectorId} onChange={(event) => setWireEndpointBConnectorId(event.target.value)}>
                <option value="">{t("ui.selectConnector")}</option>
                {endpointBConnectorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              
              {t("ui.wayIndex")}
              <input type="number" min={1} step={1} value={wireEndpointBCavityIndex} onChange={(event) => setWireEndpointBCavityIndex(event.target.value)} />
            </label>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={wireEndpointBAllowSharedCavity}
                onChange={(event) => setWireEndpointBAllowSharedCavity(event.target.checked)}
              />{" "}
              {t("ui.modelingwireformpanelAllowOverloadShareWaySeveralWiresCrimpedTogether")}</label>
            {endpointBPhysicalLabelPreview !== null ? (
              <small className="inline-help">{t("ui.modelingwireformpanelPhysicalLabel")}{endpointBPhysicalLabelPreview}</small>
            ) : null}
            {wireEndpointBSlotHint !== null ? (
              <small className={wireEndpointBSlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointBSlotHint.message}</small>
            ) : null}
          </>
        ) : (
          <>
            <label>
              
              {t("ui.splice")}
              <select value={wireEndpointBSpliceId} onChange={(event) => setWireEndpointBSpliceId(event.target.value)}>
                <option value="">{t("ui.selectSplice")}</option>
                {endpointBSpliceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <small className={selectedEndpointBSpliceIsUnplaced ? "inline-error" : "inline-help"}>
              {t("ui.modelingwireformpanelOnlyPlacedSplicesCanBeConnectedToWireEndpoints")}</small>
            {endpointBIsDirectionalSplice ? (
              <>
                <label>
                  {t("ui.modelingwireformpanelSide")}<select
                    value={wireEndpointBSpliceSideOverride}
                    onChange={(event) => setWireEndpointBSpliceSideOverride(event.target.value as typeof wireEndpointBSpliceSideOverride)}
                  >
                    <option value="auto">{t("ui.modelingwireformpanelAutoByRouting")}</option>
                    <option value="L">{t("ui.modelingwireformpanelForceL")}</option>
                    <option value="R">{t("ui.modelingwireformpanelForceR")}</option>
                  </select>
                </label>
                <label className="settings-checkbox">
                  <input
                    type="checkbox"
                    checked={wireEndpointBSpliceSideLocked}
                    onChange={(event) => setWireEndpointBSpliceSideLocked(event.target.checked)}
                    disabled={wireEndpointBSpliceSideOverride === "auto"}
                  />{" "}
                  {t("ui.modelingwireformpanelLockForcedSide")}</label>
              </>
            ) : (
              <label>
                
                {t("ui.portIndex")}
                <input type="number" min={1} step={1} value={wireEndpointBPortIndex} onChange={(event) => setWireEndpointBPortIndex(event.target.value)} />
              </label>
            )}
            {wireEndpointBSlotHint !== null ? (
              <small className={wireEndpointBSlotHint.tone === "error" ? "inline-error" : "inline-help"}>{wireEndpointBSlotHint.message}</small>
            ) : null}
          </>
        )}
        <div className="stack-form">
          <small className="inline-help">{t("ui.sideBMetadata")}</small>
          <label>
            {buildDefaultLabel(t("ui.connectionReference"), endpointBCatalogDefaults.connectionReference)}
            <input
              value={wireEndpointBConnectionReference}
              onChange={(event) => setWireEndpointBConnectionReference(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel("Connection name", endpointBCatalogDefaults.connectionName)}
            <input
              value={wireEndpointBConnectionName}
              onChange={(event) => setWireEndpointBConnectionName(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel(t("ui.sealReference"), endpointBCatalogDefaults.sealReference)}
            <input
              value={wireEndpointBSealReference}
              onChange={(event) => setWireEndpointBSealReference(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
          <label>
            {buildDefaultLabel("Seal name", endpointBCatalogDefaults.sealName)}
            <input
              value={wireEndpointBSealName}
              onChange={(event) => setWireEndpointBSealName(event.target.value)}
              maxLength={120}
              placeholder={t("ui.optional")}
            />
          </label>
        </div>
      </fieldset>
    </div>

    <div className="row-actions">
      <button
        type="submit"
        className="button-with-icon"
        disabled={wireTechnicalIdAlreadyUsed}
      >
        {wireFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {wireFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {wireFormMode === "create" ? t("ui.create") : t("ui.save")}
      </button>
      {wireFormMode === "edit" && wireEditAfterCreate ? (
        <button type="button" className="button-with-icon" onClick={wireHandlers.resetWireForm}>
          <span className="action-button-icon is-new" aria-hidden="true" />
          
          {t("ui.new")}
        </button>
      ) : null}
      {wireFormMode === "edit" ? (
        <button type="button" className="button-with-icon" onClick={wireHandlers.handleSwapWireEndpoints}>
          <span className="action-button-icon is-swap" aria-hidden="true" />
          
          {t("ui.swapEndpoints")}
        </button>
      ) : null}
      <button
        type="button"
        className={wireFormMode === "edit" ? "button-with-icon" : undefined}
        onClick={wireHandlers.cancelWireEdit}
      >
        {wireFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
        {wireFormMode === "edit" ? t("ui.cancelEdit") : t("ui.cancel")}
      </button>
    </div>
    {wireFormError !== null ? <small className="inline-error">{wireFormError}</small> : null}
  </form>
  )}
</article>
  );
}
