import { translateCurrent as t } from "../../lib/i18n";
import type { FormEvent, ReactElement } from "react";
import { createDefaultConnectorLayout } from "../../../core/connectorLayout";
import type { CatalogAdditionalAccessory, ConnectorLayout } from "../../../core/entities";
import { isValidCatalogUrlInput } from "../../../store";
import { FORM_PANEL_IDS, scrollToFormPanel } from "../../lib/form-panel-scroll";
import type { WorkspaceCurrencyCode } from "../../types/app-controller";
import { ConnectorLayoutEditor } from "./ConnectorLayoutEditor";
import { renderFormHeader } from "./ModelingFormsColumn.shared";
import { PinElectricalRolesEditor } from "./PinElectricalRolesEditor";
import type { ConnectorPinElectricalRoleDrafts } from "../../hooks/connectorPinElectricalRoles";
import type { CatalogCopySourceValue } from "../../hooks/useCatalogHandlers";

export interface CatalogCopySourceOption {
  value: CatalogCopySourceValue;
  label: string;
}

interface ModelingCatalogFormPanelProps {
  isCatalogSubScreen: boolean;
  catalogFormMode: "idle" | "create" | "edit";
  openCreateCatalogForm: () => void;
  handleCatalogSubmit: (event: FormEvent<HTMLFormElement>) => void;
  catalogManufacturerReference: string;
  setCatalogManufacturerReference: (value: string) => void;
  catalogConnectionCount: string;
  setCatalogConnectionCount: (value: string) => void;
  catalogName: string;
  setCatalogName: (value: string) => void;
  workspaceCurrencyCode: WorkspaceCurrencyCode;
  catalogUnitPriceExclTax: string;
  setCatalogUnitPriceExclTax: (value: string) => void;
  catalogUrl: string;
  setCatalogUrl: (value: string) => void;
  catalogAdditionalAccessories: CatalogAdditionalAccessory[];
  setCatalogAdditionalAccessories: (value: CatalogAdditionalAccessory[]) => void;
  catalogShowAdditionalAccessories: boolean;
  setCatalogShowAdditionalAccessories: (value: boolean) => void;
  catalogShowConnectorMaterialDefaults: boolean;
  setCatalogShowConnectorMaterialDefaults: (value: boolean) => void;
  catalogAllSameTerminals: boolean;
  setCatalogAllSameTerminals: (value: boolean) => void;
  catalogDefaultTerminalReference: string;
  setCatalogDefaultTerminalReference: (value: string) => void;
  catalogDefaultTerminalName: string;
  setCatalogDefaultTerminalName: (value: string) => void;
  catalogDefaultSealReference: string;
  setCatalogDefaultSealReference: (value: string) => void;
  catalogDefaultSealName: string;
  setCatalogDefaultSealName: (value: string) => void;
  catalogPlugDefinitionsText: string;
  setCatalogPlugDefinitionsText: (value: string) => void;
  catalogRearBackshellEnabled: boolean;
  setCatalogRearBackshellEnabled: (value: boolean) => void;
  catalogRearBackshellLengthMm: string;
  setCatalogRearBackshellLengthMm: (value: string) => void;
  catalogConnectorLayout: ConnectorLayout | undefined;
  setCatalogConnectorLayout: (value: ConnectorLayout | undefined) => void;
  catalogShowConnectorPhysicalLayout: boolean;
  setCatalogShowConnectorPhysicalLayout: (value: boolean) => void;
  catalogManufacturerReferenceAlreadyUsed: boolean;
  cancelCatalogEdit: () => void;
  catalogIsFuseBox: boolean;
  setCatalogIsFuseBox: (v: boolean) => void;
  catalogShowPinElectricalRoles: boolean;
  setCatalogShowPinElectricalRoles: (value: boolean) => void;
  catalogPinElectricalRoleDrafts: ConnectorPinElectricalRoleDrafts;
  setCatalogPinElectricalRoleDrafts: (value: ConnectorPinElectricalRoleDrafts) => void;
  catalogPinElectricalRoleSelection: number[];
  setCatalogPinElectricalRoleSelection: (value: number[]) => void;
  catalogCopySourceOptions: CatalogCopySourceOption[];
  copyCatalogFromSource: (value: CatalogCopySourceValue) => void;
  catalogFormError: string | null;
}

export function ModelingCatalogFormPanel({
  isCatalogSubScreen,
  catalogFormMode,
  openCreateCatalogForm: _openCreateCatalogForm,
  handleCatalogSubmit,
  catalogManufacturerReference,
  setCatalogManufacturerReference,
  catalogConnectionCount,
  setCatalogConnectionCount,
  catalogName,
  setCatalogName,
  workspaceCurrencyCode,
  catalogUnitPriceExclTax,
  setCatalogUnitPriceExclTax,
  catalogUrl,
  setCatalogUrl,
  catalogAdditionalAccessories,
  setCatalogAdditionalAccessories,
  catalogShowAdditionalAccessories,
  setCatalogShowAdditionalAccessories,
  catalogShowConnectorMaterialDefaults,
  setCatalogShowConnectorMaterialDefaults,
  catalogAllSameTerminals,
  setCatalogAllSameTerminals,
  catalogDefaultTerminalReference,
  setCatalogDefaultTerminalReference,
  catalogDefaultTerminalName,
  setCatalogDefaultTerminalName,
  catalogDefaultSealReference,
  setCatalogDefaultSealReference,
  catalogDefaultSealName,
  setCatalogDefaultSealName,
  catalogPlugDefinitionsText,
  setCatalogPlugDefinitionsText,
  catalogRearBackshellEnabled,
  setCatalogRearBackshellEnabled,
  catalogRearBackshellLengthMm,
  setCatalogRearBackshellLengthMm,
  catalogConnectorLayout,
  setCatalogConnectorLayout,
  catalogShowConnectorPhysicalLayout,
  setCatalogShowConnectorPhysicalLayout,
  catalogManufacturerReferenceAlreadyUsed,
  cancelCatalogEdit,
  catalogIsFuseBox,
  setCatalogIsFuseBox,
  catalogShowPinElectricalRoles,
  setCatalogShowPinElectricalRoles,
  catalogPinElectricalRoleDrafts,
  setCatalogPinElectricalRoleDrafts,
  catalogPinElectricalRoleSelection,
  setCatalogPinElectricalRoleSelection,
  catalogCopySourceOptions,
  copyCatalogFromSource,
  catalogFormError
}: ModelingCatalogFormPanelProps): ReactElement | null {
  void _openCreateCatalogForm;
  const hasUrlValidationError = catalogUrl.trim().length > 0 && !isValidCatalogUrlInput(catalogUrl);
  const showPanel = isCatalogSubScreen && catalogFormMode !== "idle";
  const catalogSubmitDisabled = catalogManufacturerReferenceAlreadyUsed || hasUrlValidationError;
  const catalogSubmitLabel = catalogFormMode === "create" ? t("ui.create") : t("ui.save");

  if (!showPanel) {
    return null;
  }

  function renderCatalogSubmitButton(): ReactElement {
    return (
      <button type="submit" className="button-with-icon" disabled={catalogSubmitDisabled}>
        {catalogFormMode === "create" ? <span className="action-button-icon is-new" aria-hidden="true" /> : null}
        {catalogFormMode === "edit" ? <span className="action-button-icon is-save" aria-hidden="true" /> : null}
        {catalogSubmitLabel}
      </button>
    );
  }

  function renderCatalogFormError(): ReactElement | null {
    return catalogFormError !== null ? <small className="inline-error">{catalogFormError}</small> : null;
  }

  function resolveCatalogLayoutConnectionCount(): number {
    const parsed = Number(catalogConnectionCount);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }

  function updateAdditionalAccessory(index: number, patch: Partial<CatalogAdditionalAccessory>): void {
    setCatalogAdditionalAccessories(
      catalogAdditionalAccessories.map((accessory, accessoryIndex) =>
        accessoryIndex === index ? { ...accessory, ...patch } : accessory
      )
    );
  }

  return (
    <form className="stack-form catalog-item-edit-form" onSubmit={handleCatalogSubmit}>
      <article
        className="panel"
        data-onboarding-panel="modeling-catalog-edit"
        data-form-panel={FORM_PANEL_IDS.catalog}
      >
        {renderFormHeader(
          catalogFormMode === "create" ? t("ui.createCatalogItem") : t("ui.editCatalogItem"),
          catalogFormMode
        )}
        {catalogFormMode === "create" && catalogCopySourceOptions.length > 0 ? (
          <label>
            {t("ui.modelingcatalogformpanelCopyFrom")}<select
              aria-label={t("ui.modelingcatalogformpanelCopyFromCatalogReference")}
              value=""
              onChange={(event) => {
                const value = event.target.value as CatalogCopySourceValue;
                if (value.length > 0) {
                  copyCatalogFromSource(value);
                }
              }}
            >
              <option value="">{t("ui.modelingcatalogformpanelSelectAReference")}</option>
              {catalogCopySourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          
          {t("ui.manufacturerReference")}
          <input
            value={catalogManufacturerReference}
            onChange={(event) => setCatalogManufacturerReference(event.target.value)}
            placeholder={t("ui.eGTE19676161")}
            maxLength={120}
            required
          />
        </label>
        {catalogManufacturerReferenceAlreadyUsed ? (
          <small className="inline-error">{t("ui.thisManufacturerReferenceIsAlreadyUsedInThisNetworkCatalog")}</small>
        ) : null}
        <label>
          
          {t("ui.connectionCount")}
          <input
            type="number"
            min={1}
            step={1}
            value={catalogConnectionCount}
            onChange={(event) => setCatalogConnectionCount(event.target.value)}
            required
          />
        </label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogIsFuseBox}
            onChange={(event) => setCatalogIsFuseBox(event.target.checked)}
          />
          {t("ui.modelingcatalogformpanelFuseBox")}</label>
        {catalogIsFuseBox ? (
          <small className="meta-line">
            {t("ui.modelingcatalogformpanelAutoPairs")}{" "}
            {Array.from({ length: Math.floor(Number(catalogConnectionCount) / 2) || 0 }, (_, i) =>
              `(${i * 2 + 1}↔${i * 2 + 2})`
            ).join(", ") || t("ui.none2")}
          </small>
        ) : null}
        <label>
          
          {t("ui.name")}
          <input value={catalogName} onChange={(event) => setCatalogName(event.target.value)} placeholder={t("ui.optionalDisplayName")} />
        </label>
        <label>
          {t("ui.unitPriceExclTaxCurrency", { currency: workspaceCurrencyCode })}
          <input
            type="number"
            min={0}
            step={0.01}
            value={catalogUnitPriceExclTax}
            onChange={(event) => setCatalogUnitPriceExclTax(event.target.value)}
            placeholder={t("ui.optional")}
            inputMode="decimal"
          />
        </label>
        <label>
          {t("ui.modelingcatalogformpanelUrl")}<input
            type="url"
            value={catalogUrl}
            onChange={(event) => setCatalogUrl(event.target.value)}
            placeholder="https://example.com/product"
          />
        </label>
        {hasUrlValidationError ? <small className="inline-error">{t("ui.useAnAbsoluteHttpHttpsURL")}</small> : null}
        {catalogUrl.trim().length > 0 && !hasUrlValidationError ? (
          <div className="row-actions compact">
            <a
              className="button-with-icon"
              href={catalogUrl.trim()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="action-button-icon is-open" aria-hidden="true" />
              
              {t("ui.openLink")}
            </a>
          </div>
        ) : null}
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowAdditionalAccessories}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowAdditionalAccessories(checked);
              if (!checked) {
                setCatalogAdditionalAccessories([]);
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogAdditionalAccessories);
              }
            }}
          />
          {t("ui.modelingcatalogformpanelAdditionalAccessories")}</label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowConnectorMaterialDefaults}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowConnectorMaterialDefaults(checked);
              if (!checked) {
                setCatalogAllSameTerminals(false);
                setCatalogDefaultTerminalReference("");
                setCatalogDefaultTerminalName("");
                setCatalogDefaultSealReference("");
                setCatalogDefaultSealName("");
                setCatalogPlugDefinitionsText("");
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogConnectorDefaults);
              }
            }}
          />
          {t("ui.modelingcatalogformpanelConnectorMaterialDefaults")}</label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowPinElectricalRoles}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowPinElectricalRoles(checked);
              if (!checked) {
                setCatalogPinElectricalRoleDrafts({});
                setCatalogPinElectricalRoleSelection([]);
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogPinElectricalRoles);
              }
            }}
          />
          {t("ui.modelingcatalogformpanelPinElectricRoles")}</label>
        <label className="settings-checkbox">
          <input
            type="checkbox"
            checked={catalogShowConnectorPhysicalLayout}
            onChange={(event) => {
              const checked = event.target.checked;
              setCatalogShowConnectorPhysicalLayout(checked);
              if (!checked) {
                setCatalogConnectorLayout(undefined);
              } else if (catalogConnectorLayout === undefined) {
                setCatalogConnectorLayout(createDefaultConnectorLayout(resolveCatalogLayoutConnectionCount()));
              }
              if (checked) {
                scrollToFormPanel(FORM_PANEL_IDS.catalogConnectorLayout);
              }
            }}
          />
          {t("ui.connectorlayouteditorConnectorPhysicalLayout")}</label>
        <div className="row-actions catalog-item-submit-actions">
          {renderCatalogSubmitButton()}
          <button type="button" className={catalogFormMode === "edit" ? "button-with-icon" : undefined} onClick={cancelCatalogEdit}>
            {catalogFormMode === "edit" ? <span className="action-button-icon is-cancel" aria-hidden="true" /> : null}
            {catalogFormMode === "edit" ? t("ui.cancelEdit") : t("ui.cancel")}
          </button>
        </div>
        {renderCatalogFormError()}
      </article>

      {catalogShowAdditionalAccessories ? (
        <article className="panel catalog-accessories-panel" data-form-panel={FORM_PANEL_IDS.catalogAdditionalAccessories}>
          {renderFormHeader("Additional accessories", catalogFormMode)}
          <div className="catalog-accessory-panel-toolbar">
            <span className="catalog-accessory-count">
              {catalogAdditionalAccessories.length === 0
                ? t("ui.modelingcatalogformpanelNoAccessory")
                : `${catalogAdditionalAccessories.length} ${catalogAdditionalAccessories.length === 1 ? "accessory" : "accessories"}`}
            </span>
            <button
              type="button"
              className="button-with-icon catalog-accessory-action-button"
              onClick={() =>
                setCatalogAdditionalAccessories([
                  ...catalogAdditionalAccessories,
                  { accessoryReference: "", accessoryName: "" }
                ])
              }
            >
              <span className="action-button-icon is-new" aria-hidden="true" />
              {t("ui.modelingcatalogformpanelAddAdditionalAccessory")}</button>
          </div>
          <div className="catalog-accessory-list">
            {catalogAdditionalAccessories.length > 0 ? (
              <div className="catalog-accessory-row catalog-accessory-row-header" aria-hidden="true">
                <span />
                <span>{t("ui.reference")}</span>
                <span>{t("ui.name")}</span>
                <span />
              </div>
            ) : null}
            {catalogAdditionalAccessories.length === 0 ? (
              <div className="catalog-accessory-empty-state">
                <span className="action-button-icon is-catalog" aria-hidden="true" />
                <small className="meta-line">{t("ui.modelingcatalogformpanelNoAdditionalAccessory")}</small>
              </div>
            ) : null}
            {catalogAdditionalAccessories.map((accessory, index) => (
              <div className="catalog-accessory-row" key={index}>
                <span className="catalog-accessory-index" aria-hidden="true">
                  {index + 1}
                </span>
                <label className="catalog-accessory-field">
                  <span className="visually-hidden">
                  {t("ui.modelingcatalogformpanelAccessoryReference")}</span>
                  <input
                    aria-label={t("ui.modelingcatalogformpanelAccessoryReference")}
                    value={accessory.accessoryReference}
                    onChange={(event) => updateAdditionalAccessory(index, { accessoryReference: event.target.value })}
                    placeholder={t("ui.reference")}
                    maxLength={120}
                  />
                </label>
                <label className="catalog-accessory-field">
                  <span className="visually-hidden">
                  {t("ui.modelingcatalogformpanelAccessoryName")}</span>
                  <input
                    aria-label={t("ui.modelingcatalogformpanelAccessoryName")}
                    value={accessory.accessoryName ?? ""}
                    onChange={(event) => updateAdditionalAccessory(index, { accessoryName: event.target.value })}
                    placeholder={t("ui.name")}
                  />
                </label>
                <button
                  type="button"
                  className="button-with-icon catalog-accessory-action-button catalog-accessory-remove-button"
                  aria-label={t("ui.modelingcatalogformpanelRemoveAccessoryIndex", { index: index + 1 })}
                  title={t("ui.modelingcatalogformpanelRemoveAccessoryIndex", { index: index + 1 })}
                  onClick={() =>
                    setCatalogAdditionalAccessories(
                      catalogAdditionalAccessories.filter((_accessory, accessoryIndex) => accessoryIndex !== index)
                    )
                  }
                >
                  <span className="action-button-icon is-delete" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowConnectorMaterialDefaults ? (
        <article className="panel catalog-material-defaults-panel" data-form-panel={FORM_PANEL_IDS.catalogConnectorDefaults}>
          {renderFormHeader("Connector material defaults", catalogFormMode)}
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={catalogAllSameTerminals}
              onChange={(event) => setCatalogAllSameTerminals(event.target.checked)}
            />
            {t("ui.modelingcatalogformpanelAllSameTerminals")}</label>
          <label>
            {t("ui.modelingcatalogformpanelDefaultTerminalReference")}<input
              value={catalogDefaultTerminalReference}
              onChange={(event) => setCatalogDefaultTerminalReference(event.target.value)}
              placeholder={t("ui.modelingcatalogformpanelOptionalTerminalRef")}
            />
          </label>
          <label>
            {t("ui.modelingcatalogformpanelDefaultTerminalName")}<input
              value={catalogDefaultTerminalName}
              onChange={(event) => setCatalogDefaultTerminalName(event.target.value)}
              placeholder={t("ui.modelingcatalogformpanelOptionalTerminalName")}
            />
          </label>
          <label>
            {t("ui.modelingcatalogformpanelDefaultSealReference")}<input
              value={catalogDefaultSealReference}
              onChange={(event) => setCatalogDefaultSealReference(event.target.value)}
              placeholder={t("ui.modelingcatalogformpanelOptionalSealRef")}
            />
          </label>
          <label>
            {t("ui.modelingcatalogformpanelDefaultSealName")}<input
              value={catalogDefaultSealName}
              onChange={(event) => setCatalogDefaultSealName(event.target.value)}
              placeholder={t("ui.modelingcatalogformpanelOptionalSealName")}
            />
          </label>
          <label>
            {t("ui.modelingcatalogformpanelPlugDefinitions")}<textarea
              value={catalogPlugDefinitionsText}
              onChange={(event) => setCatalogPlugDefinitionsText(event.target.value)}
              placeholder={"PLUG-REF,2,Plug name\nPLUG-ALT,1"}
              rows={3}
            />
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={catalogRearBackshellEnabled}
              onChange={(event) => setCatalogRearBackshellEnabled(event.target.checked)}
            />
            {t("ui.modelingcatalogformpanelRearBackshellHelperNode")}</label>
          {catalogRearBackshellEnabled ? (
            <label>
              {t("ui.modelingcatalogformpanelRearBackshellLengthMm")}<input
                type="number"
                min={1}
                step={0.1}
                value={catalogRearBackshellLengthMm}
                onChange={(event) => setCatalogRearBackshellLengthMm(event.target.value)}
              />
            </label>
          ) : null}
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowPinElectricalRoles ? (
        <article className="panel catalog-pin-electrical-roles-panel" data-form-panel={FORM_PANEL_IDS.catalogPinElectricalRoles}>
          {renderFormHeader("Pin electric roles", catalogFormMode)}
          <PinElectricalRolesEditor
            cavityCount={Number(catalogConnectionCount)}
            drafts={catalogPinElectricalRoleDrafts}
            setDrafts={setCatalogPinElectricalRoleDrafts}
            selection={catalogPinElectricalRoleSelection}
            setSelection={setCatalogPinElectricalRoleSelection}
            catalogItem={undefined}
            connectorLayout={catalogConnectorLayout}
            allowInheritedRoles={false}
            mode="panel"
            title={t("ui.modelingcatalogformpanelPinElectricRoles")}
            showPanelHeader={false}
          />
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}

      {catalogShowConnectorPhysicalLayout ? (
        <article className="panel catalog-connector-layout-panel" data-form-panel={FORM_PANEL_IDS.catalogConnectorLayout}>
          {renderFormHeader("Connector physical layout", catalogFormMode)}
          <ConnectorLayoutEditor
            connectionCount={catalogConnectionCount}
            connectorLayout={catalogConnectorLayout}
            setConnectorLayout={setCatalogConnectorLayout}
            showLegend={false}
          />
          <div className="row-actions catalog-item-submit-actions">
            {renderCatalogSubmitButton()}
            <button
              type="button"
              className="button-with-icon"
              onClick={() => setCatalogConnectorLayout(createDefaultConnectorLayout(resolveCatalogLayoutConnectionCount()))}
            >
              <span className="action-button-icon is-catalog" aria-hidden="true" />
              {t("ui.modelingcatalogformpanelAutoLayout")}</button>
            <button type="button" className="button-with-icon" onClick={() => setCatalogConnectorLayout(undefined)}>
              <span className="action-button-icon is-cancel" aria-hidden="true" />
              {t("ui.modelingcatalogformpanelClearCustomLayout")}</button>
          </div>
          {renderCatalogFormError()}
        </article>
      ) : null}
    </form>
  );
}

export type { ModelingCatalogFormPanelProps };
