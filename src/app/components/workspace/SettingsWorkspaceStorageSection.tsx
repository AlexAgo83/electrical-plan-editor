import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useId, useRef, type ReactElement, type ReactNode, type RefObject } from "react";
import type { WorkspaceLineageModel } from "../../hooks/useWorkspaceLineages";
import type { WorkspaceFileStorageStatus } from "../../hooks/useWorkspaceFileStorage";
import { describeLineageSaveStatus, isNamedWorkspaceStorageMode } from "../../lib/lineage/lineageStatus";
import { describeLineageNotices, lineageNoticeTargetId, type LineageNotice } from "../../lib/lineage/lineageNotices";
import {
  consumeWorkspaceStorageFocusRequest,
  subscribeWorkspaceStorageFocusRequests,
  WORKSPACE_STORAGE_SECTION_ID
} from "../../lib/workspaceStorageFocus";
import { SettingsLabelText } from "../settings/SettingsLabelText";
import { formatLineageDateTime } from "../../lib/lineage/lineageFormat";
import { LineagePackageFileInput } from "./WorkspaceLineagePanels";

export interface LegacyWorkspaceFileControls {
  workspaceFileStatus: WorkspaceFileStorageStatus;
  openWorkspaceFile: () => void;
  relinkWorkspaceFile: () => void;
  resumeWorkspaceFile: () => void;
  saveWorkspaceFileNow: () => void;
  saveWorkspaceFileAs: () => void;
  unlinkWorkspaceFile: () => void;
  openLinkedWorkspaceFile: () => void;
  openResumableWorkspaceFile: () => void;
  loadLinkedFileVersion: () => void;
  keepLocalWorkspaceVersion: () => void;
}

interface SettingsWorkspaceStorageSectionProps {
  /** Absent only in isolated renders without the lineage runtime; the section then shows the legacy tools alone. */
  model?: WorkspaceLineageModel;
  legacy: LegacyWorkspaceFileControls;
  normalizedQuery: string;
}

function useWorkspaceStorageFocusTarget(sectionRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const focusPending = (): void => {
      const target = consumeWorkspaceStorageFocusRequest();
      if (target === null || sectionRef.current === null) {
        return;
      }
      const element =
        (target === WORKSPACE_STORAGE_SECTION_ID ? null : sectionRef.current.querySelector<HTMLElement>(`#${CSS.escape(target)}`)) ??
        sectionRef.current.querySelector<HTMLElement>(".settings-panel-header h2");
      element?.scrollIntoView?.({ block: "start" });
      element?.focus();
    };
    focusPending();
    return subscribeWorkspaceStorageFocusRequests(focusPending);
  }, [sectionRef]);
}

export function SettingsWorkspaceStorageSection({ model, legacy, normalizedQuery }: SettingsWorkspaceStorageSectionProps): ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  useWorkspaceStorageFocusTarget(sectionRef);
  const label = (text: string): ReactNode => <SettingsLabelText text={text} normalizedQuery={normalizedQuery} />;
  const isNamed = isNamedWorkspaceStorageMode(model?.snapshot);

  return (
    <section id={WORKSPACE_STORAGE_SECTION_ID} ref={sectionRef} className="panel settings-panel settings-workspace-storage">
      <header className="settings-panel-header">
        <h2 tabIndex={-1}>{t("ui.operationshealthpanelWorkspaceStorage")}</h2>
        <span className="settings-panel-chip">{t("ui.settingsworkspacecontentStorage")}</span>
      </header>
      <p className="settings-panel-intro">{isNamed ? t("ui.workspaceStorageIntroNamed") : t("ui.workspaceStorageIntroLegacy")}</p>
      {model !== undefined ? <NamedWorkspaceGroups model={model} label={label} /> : null}
      {!isNamed ? <LegacyCompatibilitySubsection legacy={legacy} model={model} label={label} /> : null}
    </section>
  );
}

// --------------------------------------------------------------------------- named workspace groups

function StorageGroup({ title, children }: { title: string; children: ReactNode }): ReactElement {
  const headingId = useId();
  return (
    <section className="settings-storage-group" aria-labelledby={headingId}>
      <h3 id={headingId}>{title}</h3>
      {children}
    </section>
  );
}

function NoticeActions({ notice, model, label }: { notice: LineageNotice; model: WorkspaceLineageModel; label: (text: string) => ReactNode }): ReactNode {
  const targetId = lineageNoticeTargetId(notice.kind);
  switch (notice.kind) {
    case "divergence":
      return (
        <button type="button" id={targetId} onClick={() => model.openDialog("divergence")} disabled={model.snapshot.busy}>
          {label(t("ui.workspaceLineageChooseHead"))}
        </button>
      );
    case "folder-permission":
      return (
        <button type="button" id={targetId} onClick={() => void model.relinkFolder()} disabled={model.snapshot.busy}>
          {label(t("ui.workspaceLineageReconnectFolder"))}
        </button>
      );
    case "orphans":
      return (
        <button type="button" id={targetId} onClick={() => void model.adoptOrphanVersions()} disabled={model.snapshot.busy}>
          {label(t("ui.workspaceLineageRecoverOrphans"))}
        </button>
      );
    case "preserved-legacy":
      return (
        <>
          <button type="button" id={targetId} onClick={() => void model.downloadPreservedLegacySnapshot()}>
            {label(t("ui.workspaceLineageDownloadPreservedLegacy"))}
          </button>
          <button type="button" onClick={() => void model.discardPreservedLegacySnapshot()}>
            {t("ui.workspaceLineageDismiss")}
          </button>
        </>
      );
    default:
      return null;
  }
}

function hasNoticeAction(notice: LineageNotice): boolean {
  return notice.kind === "divergence" || notice.kind === "folder-permission" || notice.kind === "orphans" || notice.kind === "preserved-legacy";
}

function NamedWorkspaceGroups({ model, label }: { model: WorkspaceLineageModel; label: (text: string) => ReactNode }): ReactElement {
  const { snapshot } = model;
  const selectId = useId();
  const packageInputRef = useRef<HTMLInputElement | null>(null);
  const active = snapshot.active;
  const isReadOnly = snapshot.historical !== null;
  const status = describeLineageSaveStatus(snapshot);
  const notices = describeLineageNotices(snapshot);
  const hasManifest = active?.manifest != null;
  const versionCount = active?.manifest?.versions.length ?? 0;
  const handoffCount = active?.manifest?.handoffs.length ?? 0;
  const statusChipClassName = status.tone === "success" ? "settings-state-chip is-ok" : status.tone === "neutral" ? "settings-state-chip" : "settings-state-chip is-warn";

  return (
    <>
      {notices.length > 0 ? (
        <ul className="settings-storage-notices" aria-label={t("ui.workspaceStorageNoticesLabel")}>
          {notices.map((notice) => (
            <li
              key={notice.kind}
              className={`workspace-lineage-banner is-${notice.tone}`}
              id={hasNoticeAction(notice) ? undefined : notice.settingsTargetId}
              tabIndex={hasNoticeAction(notice) ? undefined : -1}
            >
              <span>{notice.message}</span>
              <NoticeActions notice={notice} model={model} label={label} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="settings-storage-groups">
        <StorageGroup title={t("ui.workspaceStorageGroupCurrent")}>
          <label className="settings-storage-field" htmlFor={selectId}>
            <span>{label(t("ui.workspaceLineageSelectLabel"))}</span>
            <select
              id={selectId}
              value={active?.workspaceId ?? ""}
              disabled={snapshot.busy || !snapshot.ready || snapshot.records.length === 0}
              onChange={(event) => {
                if (event.target.value.length > 0) {
                  void model.switchTo(event.target.value);
                }
              }}
            >
              {active === null ? <option value="">{t("ui.workspaceLineageNoneOption")}</option> : null}
              {snapshot.records.map((record) => (
                <option key={record.workspaceId} value={record.workspaceId}>
                  {record.displayName}
                </option>
              ))}
            </select>
          </label>
          <div className="settings-state-row">
            <span className={statusChipClassName} aria-live="polite" aria-atomic="true">
              {status.label}
            </span>
            {active?.storage === "folder" ? <span className="settings-state-chip">{t("ui.workspaceLineageStorageFolder", { folder: active.folderName ?? "" })}</span> : null}
          </div>
          {isReadOnly && snapshot.historical !== null ? (
            <div className="workspace-lineage-banner is-read-only" role="status">
              <span>{t("ui.workspaceLineageReadOnlyBanner", { version: snapshot.historical.label })}</span>
              <button type="button" onClick={() => model.returnToWorking()}>
                {t("ui.workspaceLineageReturnToWorking")}
              </button>
              <button type="button" onClick={() => void model.restoreFromVersion(snapshot.historical?.versionId ?? "")} disabled={snapshot.busy}>
                {label(t("ui.workspaceLineageResumeFromVersion"))}
              </button>
            </div>
          ) : null}
          <div className="row-actions settings-actions">
            {active !== null ? (
              <>
                <button
                  type="button"
                  className="button-with-icon"
                  onClick={() => void model.saveNow()}
                  disabled={isReadOnly || snapshot.busy}
                  aria-keyshortcuts="Control+S Meta+S"
                  title="Ctrl/Cmd + S"
                >
                  <span className="action-button-icon is-save" aria-hidden="true" />
                  {label(t("ui.workspaceLineageSave"))}
                </button>
                <button type="button" className="button-with-icon" onClick={() => model.openDialog("rename")} disabled={isReadOnly || snapshot.busy}>
                  <span className="action-button-icon is-edit" aria-hidden="true" />
                  {label(t("ui.workspaceLineageRename"))}
                </button>
              </>
            ) : null}
            <button type="button" className="button-with-icon" onClick={() => model.openDialog("create")} disabled={snapshot.busy || !snapshot.ready}>
              <span className="action-button-icon is-home-create" aria-hidden="true" />
              {label(t("ui.workspaceLineageNew"))}
            </button>
          </div>
        </StorageGroup>
        {active !== null ? (
          <StorageGroup title={t("ui.workspaceStorageGroupVersions")}>
            <p className="meta-line">{t("ui.workspaceStorageVersionsSummary", { versions: versionCount, handoffs: handoffCount })}</p>
            <div className="row-actions settings-actions">
              <button type="button" className="button-with-icon" onClick={() => model.openDialog("version")} disabled={!hasManifest || isReadOnly || snapshot.busy}>
                <span className="action-button-icon is-save" aria-hidden="true" />
                {label(t("ui.workspaceLineageCreateVersion"))}
              </button>
              <button type="button" className="button-with-icon" onClick={() => model.openDialog("history")} disabled={!hasManifest}>
                <span className="action-button-icon is-open" aria-hidden="true" />
                {label(t("ui.workspaceLineageHistory"))}
              </button>
              <button type="button" className="button-with-icon" onClick={() => model.openDialog("handoff")} disabled={!hasManifest || isReadOnly || snapshot.busy}>
                <span className="action-button-icon is-redo" aria-hidden="true" />
                {label(t("ui.workspaceLineageRecordHandoff"))}
              </button>
            </div>
          </StorageGroup>
        ) : null}
        <StorageGroup title={t("ui.workspaceStorageGroupTransfer")}>
          <div className="row-actions settings-actions">
            {active !== null ? (
              <button type="button" className="button-with-icon" onClick={() => void model.exportPackage()} disabled={!hasManifest || snapshot.busy}>
                <span className="action-button-icon is-save" aria-hidden="true" />
                {label(t("ui.workspaceLineageExportPackage"))}
              </button>
            ) : null}
            <button type="button" className="button-with-icon" onClick={() => packageInputRef.current?.click()} disabled={isReadOnly || snapshot.busy}>
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              {label(t("ui.workspaceLineageImportPackage"))}
            </button>
            {snapshot.directoryAccessSupported ? (
              <button type="button" className="button-with-icon" onClick={() => void model.openFolder()} disabled={snapshot.busy}>
                <span className="action-button-icon is-open" aria-hidden="true" />
                {label(t("ui.workspaceLineageOpenFolder"))}
              </button>
            ) : null}
            {active?.storage === "folder" ? (
              <button type="button" className="button-with-icon" onClick={() => void model.relinkFolder()} disabled={snapshot.busy}>
                <span className="action-button-icon is-swap" aria-hidden="true" />
                {label(t("ui.workspaceLineageReconnectFolder"))}
              </button>
            ) : null}
            <button type="button" className="button-with-icon" onClick={() => model.openDialog("legacy")} disabled={isReadOnly || snapshot.busy}>
              <span className="action-button-icon is-home-import" aria-hidden="true" />
              {label(t("ui.workspaceLineageImportLegacy"))}
            </button>
          </div>
          {!snapshot.directoryAccessSupported ? <p className="meta-line">{t("ui.workspaceLineageFolderUnsupported")}</p> : null}
          <LineagePackageFileInput inputRef={packageInputRef} model={model} />
        </StorageGroup>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------- legacy single-file compatibility

function legacyStatusCopy(status: WorkspaceFileStorageStatus): { title: string; description: string; tone: string } {
  if (status.conflict) {
    return { title: t("ui.workspaceStorageLegacyTitleConflict"), description: t("ui.workspaceStorageLegacyDescriptionConflict"), tone: "is-warn" };
  }
  if (status.mode === "linked") {
    return {
      title: t("ui.workspaceStorageLegacyTitleLinked", { file: status.fileName ?? t("ui.workspaceStorageLegacyAWorkspaceFile") }),
      description: t("ui.workspaceStorageLegacyDescriptionLinked"),
      tone: status.fileAvailability !== "unavailable" ? "is-ok" : ""
    };
  }
  if (status.resumeFileName !== null) {
    return { title: t("ui.workspaceStorageLegacyTitleResumable"), description: t("ui.workspaceStorageLegacyDescriptionResumable"), tone: "" };
  }
  return { title: t("ui.workspaceStorageLegacyTitleLocal"), description: t("ui.workspaceStorageLegacyDescriptionLocal"), tone: "" };
}

function formatLegacySavedAt(iso: string | null): string {
  return iso === null ? t("ui.workspaceStorageLegacyNotSavedYet") : formatLineageDateTime(iso);
}

function LegacyCompatibilitySubsection({
  legacy,
  model,
  label
}: {
  legacy: LegacyWorkspaceFileControls;
  model: WorkspaceLineageModel | undefined;
  label: (text: string) => ReactNode;
}): ReactElement {
  const status = legacy.workspaceFileStatus;
  const headingId = useId();
  const copy = legacyStatusCopy(status);
  const isRelink = status.mode === "linked" || status.resumeFileName !== null;
  const relinkLabel = isRelink ? t("ui.workspaceStorageLegacyRelinkVerb") : t("ui.workspaceStorageLegacyLinkVerb");
  type PrimaryAction = { kind: "conflict" | "restore" | "save-now" | "resume" | "save-as"; label: string; ariaLabel: string; title: string; onClick: () => void; disabled: boolean; icon: string };
  const primary: PrimaryAction = status.conflict
    ? {
        kind: "conflict",
        label: t("ui.settingsworkspacecontentResolveConflict"),
        ariaLabel: t("ui.settingsworkspacecontentResolveWorkspaceFileConflict"),
        title: t("ui.settingsworkspacecontentReviewTheLinkedFileConflictOptions"),
        onClick: legacy.loadLinkedFileVersion,
        disabled: false,
        icon: "is-open"
      }
    : status.mode === "linked"
      ? status.permission === "denied" || status.fileAvailability === "unavailable"
        ? {
            kind: "restore",
            label: t("ui.settingsworkspacecontentRestoreFileAccess"),
            ariaLabel: isRelink ? t("ui.workspaceStorageLegacyRelinkAria") : t("ui.workspaceStorageLegacyLinkAria"),
            title: t("ui.settingsworkspacecontentChooseTheWorkspaceFileAgainToRestoreBrowserPermission"),
            onClick: legacy.relinkWorkspaceFile,
            disabled: false,
            icon: "is-swap"
          }
        : {
            kind: "save-now",
            label: status.isSaving ? t("ui.workspaceStorageLegacySaving") : t("ui.settingssearchmodelSaveNow"),
            ariaLabel: t("ui.settingsworkspacecontentSaveWorkspaceFileNow"),
            title: t("ui.settingsworkspacecontentSaveTheCurrentWorkspaceToTheLinkedFileNow"),
            onClick: legacy.saveWorkspaceFileNow,
            disabled: status.isSaving,
            icon: "is-save"
          }
      : status.canResume
        ? {
            kind: "resume",
            label: t("ui.settingsworkspacecontentResumeLastFile"),
            ariaLabel: t("ui.operationshealthpanelResumeWorkspaceFile"),
            title: t("ui.operationshealthpanelResumeTheLastWorkspaceFileRememberedByThisBrowser"),
            onClick: legacy.resumeWorkspaceFile,
            disabled: false,
            icon: "is-redo"
          }
        : {
            kind: "save-as",
            label: t("ui.settingsworkspacecontentSaveAsFile"),
            ariaLabel: t("ui.operationshealthpanelSaveWorkspaceFileAs"),
            title: t("ui.operationshealthpanelSaveANewWorkspaceFileCopy"),
            onClick: legacy.saveWorkspaceFileAs,
            disabled: false,
            icon: "is-save"
          };

  return (
    <section className="settings-storage-group settings-storage-legacy" aria-labelledby={headingId}>
      <h3 id={headingId}>{t("ui.workspaceStorageLegacyHeading")}</h3>
      <p className="meta-line">{t("ui.workspaceStorageLegacyIntro")}</p>
      {model !== undefined ? (
        <div className="row-actions settings-actions">
          <button type="button" className="button-with-icon" onClick={() => model.openDialog("create")} disabled={model.snapshot.busy || !model.snapshot.ready}>
            <span className="action-button-icon is-home-create" aria-hidden="true" />
            {label(t("ui.workspaceStorageAdoptCurrent"))}
          </button>
        </div>
      ) : null}
      <div className={`settings-storage-current ${copy.tone}`} aria-label={t("ui.settingsworkspacecontentWorkspaceStorageStatus")}>
        <div className="settings-storage-current-copy">
          <span className="settings-storage-current-kicker">{t("ui.settingsworkspacecontentCurrentSaveLocation")}</span>
          <strong>{copy.title}</strong>
          <p>{copy.description}</p>
        </div>
        <div className="row-actions settings-storage-primary-action-row">
          <button
            type="button"
            className="button-with-icon settings-storage-primary-action"
            onClick={primary.onClick}
            disabled={primary.disabled}
            aria-label={primary.ariaLabel}
            title={primary.title}
          >
            <span className={`action-button-icon ${primary.icon}`} aria-hidden="true" />
            {label(primary.label)}
          </button>
        </div>
      </div>
      {status.message !== null ? <p className="meta-line settings-storage-message">{status.message}</p> : null}
      <div className="row-actions settings-actions settings-storage-secondary-actions" aria-label={t("ui.settingsworkspacecontentMoreWorkspaceFileActions")}>
        <button
          type="button"
          className="button-with-icon"
          onClick={legacy.openWorkspaceFile}
          aria-label={t("ui.operationshealthpanelOpenWorkspaceFile")}
          title={t("ui.operationshealthpanelOpenAWorkspaceFileAndReplaceTheCurrentWorkspace")}
        >
          <span className="action-button-icon is-open" aria-hidden="true" />
          {label(t("ui.operationshealthpanelOpenWorkspaceFile"))}
        </button>
        {primary.kind !== "save-as" ? (
          <button
            type="button"
            className="button-with-icon"
            onClick={legacy.saveWorkspaceFileAs}
            aria-label={t("ui.operationshealthpanelSaveWorkspaceFileAs")}
            title={t("ui.operationshealthpanelSaveANewWorkspaceFileCopy")}
          >
            <span className="action-button-icon is-save" aria-hidden="true" />
            {label(t("ui.settingssearchmodelSaveAsCopy"))}
          </button>
        ) : null}
        {status.canResume && status.mode !== "linked" && primary.kind !== "resume" ? (
          <button
            type="button"
            className="button-with-icon"
            onClick={legacy.resumeWorkspaceFile}
            aria-label={t("ui.operationshealthpanelResumeWorkspaceFile")}
            title={t("ui.operationshealthpanelResumeTheLastWorkspaceFileRememberedByThisBrowser")}
          >
            <span className="action-button-icon is-redo" aria-hidden="true" />
            {label(t("ui.settingsworkspacecontentResumeLastFile"))}
          </button>
        ) : null}
        <button
          type="button"
          className="button-with-icon"
          onClick={legacy.relinkWorkspaceFile}
          aria-label={t("ui.settingsworkspacecontentUseAFileForAutosave")}
          title={t("ui.settingsworkspacecontentRelinkworkspacelabelAWorkspaceFileForDirectFileAutosaveWhenSupported", { relinkWorkspaceLabel: relinkLabel })}
        >
          <span className="action-button-icon is-swap" aria-hidden="true" />
          {label(t("ui.settingsworkspacecontentUseAFileForAutosave"))}
        </button>
        {status.mode === "linked" ? (
          <>
            <button
              type="button"
              className="button-with-icon"
              onClick={legacy.saveWorkspaceFileNow}
              disabled={status.isSaving}
              aria-label={t("ui.settingsworkspacecontentSaveWorkspaceFileNow")}
              title={t("ui.settingsworkspacecontentSaveTheCurrentWorkspaceToTheLinkedFileNow")}
            >
              <span className="action-button-icon is-save" aria-hidden="true" />
              {label(t("ui.settingssearchmodelSaveNow"))}
            </button>
            <button
              type="button"
              className="button-with-icon"
              onClick={legacy.unlinkWorkspaceFile}
              aria-label={t("ui.settingsworkspacecontentUnlinkWorkspaceFile")}
              title={t("ui.settingsworkspacecontentStopAutosavingToTheLinkedFileAndKeepBrowserLocal")}
            >
              <span className="action-button-icon is-swap" aria-hidden="true" />
              {label(t("ui.settingssearchmodelStopAutosaveLink"))}
            </button>
          </>
        ) : null}
      </div>
      {status.conflict ? (
        <div className="settings-conflict-panel" role="alert">
          <p>{t("ui.settingsworkspacecontentTheLinkedFileChangedOutsideThisTabChooseWhichWorkspace")}</p>
          <div className="row-actions settings-actions">
            <button type="button" onClick={legacy.loadLinkedFileVersion}>{label(t("ui.settingssearchmodelLoadFileVersion"))}</button>
            <button type="button" onClick={legacy.keepLocalWorkspaceVersion}>{label(t("ui.settingssearchmodelKeepLocalVersion"))}</button>
            <button type="button" onClick={legacy.saveWorkspaceFileAs}>{label(t("ui.settingssearchmodelSaveLocalCopy"))}</button>
          </div>
        </div>
      ) : null}
      <details className="settings-storage-technical-details">
        <summary>{t("ui.settingsworkspacecontentStorageDetails")}</summary>
        <div className="settings-state-row" aria-label={t("ui.settingsworkspacecontentWorkspaceTechnicalStorageStatus")}>
          <span className={status.conflict ? "settings-state-chip is-warn" : "settings-state-chip is-ok"}>{status.label}</span>
          <span className="settings-state-chip">{status.mode === "linked" ? t("ui.settingssearchmodelLinkedFile") : t("ui.operationshealthpanelLocalOnly")}</span>
          <span className="settings-state-chip">
            {t("ui.settingsworkspacecontentPermission")}
            {status.permission}
          </span>
          <span className="settings-state-chip">
            {status.directFileAccessSupported ? t("ui.settingsworkspacecontentDirectFileAccess") : t("ui.settingsworkspacecontentFallbackDownload")}
          </span>
          <span className={status.fileAvailability === "unavailable" ? "settings-state-chip is-warn" : "settings-state-chip"}>
            {t("ui.operationshealthpanelFile")}
            {status.fileAvailability === "available"
              ? t("ui.networkscopeworkspacecontentAvailable")
              : status.fileAvailability === "unavailable"
                ? t("ui.workspaceStorageLegacyUnavailable")
                : t("ui.workspaceStorageLegacyUnknown")}
          </span>
        </div>
        <dl className="settings-storage-details">
          <div>
            <dt>{label(t("ui.settingssearchmodelPersistenceMode"))}</dt>
            <dd>{status.mode === "linked" ? t("ui.settingsworkspacecontentLinkedFileWithLocalCache") : t("ui.settingsworkspacecontentLocalBrowserStorageOnly")}</dd>
          </div>
          <div>
            <dt>{t("ui.settingsworkspacecontentAutosaveTarget")}</dt>
            <dd>
              {status.saveTarget === "linked-file"
                ? t("ui.settingsworkspacecontentLinkedWorkspaceFile")
                : status.saveTarget === "download"
                  ? t("ui.workspaceStorageLegacyDownloadedCopy")
                  : t("ui.workspaceStorageLegacyLocalCache")}
            </dd>
          </div>
          <div>
            <dt>{label(t("ui.settingssearchmodelLinkedFile"))}</dt>
            <dd>
              {status.fileName === null ? (
                t("ui.none")
              ) : (
                <button
                  type="button"
                  className="settings-storage-file-link"
                  onClick={legacy.openLinkedWorkspaceFile}
                  disabled={status.mode !== "linked"}
                  title={t("ui.settingsworkspacecontentOpenTheLinkedWorkspaceFileInANewBrowserTab")}
                >
                  {status.fileName}
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>{t("ui.settingsworkspacecontentResumableFile")}</dt>
            <dd>
              {status.resumeFileName === null ? (
                t("ui.none")
              ) : (
                <button
                  type="button"
                  className="settings-storage-file-link"
                  onClick={legacy.openResumableWorkspaceFile}
                  disabled={!status.canResume}
                  title={t("ui.settingsworkspacecontentOpenTheResumableWorkspaceFileInANewBrowserTab")}
                >
                  {status.resumeFileName}
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>{t("ui.settingsworkspacecontentResumeStatus")}</dt>
            <dd>
              {status.resumeStatus === "available"
                ? t("ui.settingsworkspacecontentResumeAvailable")
                : status.resumeStatus === "permission-required"
                  ? t("ui.workspaceStorageLegacyPermissionRequired")
                  : status.resumeStatus === "unavailable"
                    ? t("ui.workspaceStorageLegacyResumeUnavailable")
                    : t("ui.workspaceStorageLegacyNoResumableFile")}
            </dd>
          </div>
          <div>
            <dt>{t("ui.settingsworkspacecontentLastSaved")}</dt>
            <dd>{formatLegacySavedAt(status.lastSavedAtIso)}</dd>
          </div>
        </dl>
      </details>
    </section>
  );
}
