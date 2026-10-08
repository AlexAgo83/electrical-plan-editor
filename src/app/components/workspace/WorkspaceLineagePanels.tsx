import { translateCurrent as t, translateCurrentPlural } from "../../lib/i18n";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject
} from "react";
import { useModalDialog } from "../../hooks/useModalDialog";
import type { WorkspaceLineageModel } from "../../hooks/useWorkspaceLineages";
import { formatLineageDateTime, formatVersionNumber, sortVersionsForHistory, type LineageHandoffEntry, type LineageVersionEntry } from "../../lib/lineage/lineageFormat";
import {
  buildDefaultLegacyAdoptionPlan,
  validateLegacyAdoptionPlan,
  type LegacyAdoptionPlan,
  type LegacyAdoptionPreview
} from "../../lib/lineage/lineageLegacyImport";
import type { LineageRegistryRecord } from "../../lib/lineage/lineageLibrary";
import type { HandoffVerification } from "../../lib/lineage/lineageRepository";
import { activeExportReminderRecord, describeLineageExportReminder, describeLineageSaveStatus, type LineageStatusDescription } from "../../lib/lineage/lineageStatus";

const formatDateTime = formatLineageDateTime;

function formatBytes(byteLength: number): string {
  if (byteLength < 1024) {
    return `${byteLength} B`;
  }
  if (byteLength < 1024 * 1024) {
    return `${(byteLength / 1024).toFixed(1)} KiB`;
  }
  return `${(byteLength / 1024 / 1024).toFixed(1)} MiB`;
}

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// --------------------------------------------------------------------------- dialog shell

const LineageDialogThemeContext = createContext<string | null>(null);

function LineageDialog({
  title,
  onClose,
  children,
  footer,
  wide = false
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  wide?: boolean;
}): ReactElement {
  const titleId = useId();
  const themeHostClassName = useContext(LineageDialogThemeContext);
  const { dialogRef, onKeyDown } = useModalDialog<HTMLElement>({ isOpen: true, onClose, identity: title });
  return (
    <div className={themeHostClassName === null ? "confirm-dialog-layer" : `confirm-dialog-layer ${themeHostClassName}`} role="presentation">
      <button type="button" className="confirm-dialog-backdrop" aria-label={t("ui.workspaceLineageCloseDialog")} onClick={onClose} />
      <section
        ref={dialogRef}
        className={wide ? "confirm-dialog panel lineage-dialog is-wide" : "confirm-dialog panel lineage-dialog"}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className="confirm-dialog-header">
          <h2 id={titleId}>{title}</h2>
        </header>
        <div className="lineage-dialog-body">{children}</div>
        <footer className="confirm-dialog-actions">{footer}</footer>
      </section>
    </div>
  );
}

// --------------------------------------------------------------------------- selector and read-only banner

/** Workspace switcher shared by Home and Settings; uses the themed form field styles. */
export function WorkspaceLineageSelect({ model, label }: { model: WorkspaceLineageModel; label?: ReactNode }): ReactElement {
  const { snapshot } = model;
  const selectId = useId();
  const active = snapshot.active;
  return (
    <label className="stack-label workspace-lineage-select" htmlFor={selectId}>
      <span>{label ?? t("ui.workspaceLineageSelectLabel")}</span>
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
  );
}

function lineageStatusChipClassName(tone: LineageStatusDescription["tone"]): string {
  return tone === "success" ? "settings-state-chip is-ok" : tone === "neutral" ? "settings-state-chip" : "settings-state-chip is-warn";
}

/**
 * Save status of the active workspace plus, for browser-only workspaces, the separate export hint
 * with its adjacent action. Shared by Settings > Workspace storage and the operations panel.
 */
export function LineageSaveStatusRow({ model, showExportAction = true }: { model: WorkspaceLineageModel; showExportAction?: boolean }): ReactElement {
  const { snapshot } = model;
  const status = describeLineageSaveStatus(snapshot);
  const reminder = describeLineageExportReminder(activeExportReminderRecord(snapshot));
  return (
    <div className="settings-state-row lineage-status-row">
      <span className={lineageStatusChipClassName(status.tone)} aria-live="polite" aria-atomic="true">
        {status.label}
      </span>
      {reminder !== null ? (
        <span className={`lineage-export-hint is-${reminder.tone}`}>
          <span>{reminder.label}</span>
          {showExportAction ? (
            <span className="row-actions compact">
              <button type="button" onClick={() => void model.exportPackage()} disabled={snapshot.busy || snapshot.active?.manifest == null}>
                {t("ui.workspaceLineageExportNow")}
              </button>
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}

/**
 * The single read-only signal, shown on every screen (Settings included) while a frozen version is
 * open, so both exits stay reachable everywhere. There is no permanent workspace bar.
 */
export function WorkspaceLineageReadOnlyBanner({ model }: { model: WorkspaceLineageModel }): ReactElement | null {
  const historical = model.snapshot.historical;
  if (historical === null) {
    return null;
  }
  return (
    <section className="workspace-lineage-read-only-banner" aria-label={t("ui.workspaceLineageBarLabel")}>
      <div className="workspace-lineage-banner is-read-only" role="alert">
        <strong>{t("ui.workspaceLineageReadOnlyBanner", { version: historical.label })}</strong>
        <span>
          {model.snapshot.active?.displayName ?? ""} · {historical.title.length > 0 ? `${historical.title} · ` : ""}
          {formatDateTime(historical.createdAtIso)}
        </span>
        <span className="row-actions compact">
          <button type="button" onClick={() => model.returnToWorking()}>
            {t("ui.workspaceLineageReturnToWorking")}
          </button>
          <button type="button" className="is-danger-action" onClick={() => void model.restoreFromVersion(historical.versionId)} disabled={model.snapshot.busy}>
            {t("ui.workspaceLineageResumeFromVersion")}
          </button>
        </span>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------- home rows

function sortByRecentActivity(records: LineageRegistryRecord[]): LineageRegistryRecord[] {
  const activity = (record: LineageRegistryRecord): string => [record.lastDurableSaveIso ?? "", record.lastOpenedAtIso].sort().pop() ?? "";
  return [...records].sort((left, right) => activity(right).localeCompare(activity(left)));
}

/**
 * Home keeps resume navigation only; management lives in Settings > Workspace storage. The selector
 * shows the active workspace, the other workspaces are compact whole-row resume buttons.
 */
export function HomeWorkspaceLineagesPanel({
  model,
  onResume,
  onManage
}: {
  model: WorkspaceLineageModel;
  onResume: () => void;
  onManage: () => void;
}): ReactElement {
  const { snapshot } = model;
  const activeId = snapshot.active?.workspaceId ?? null;
  const others = sortByRecentActivity(snapshot.records.filter((record) => record.workspaceId !== activeId));
  const isEmpty = snapshot.records.length === 0;
  return (
    <section className="panel home-panel home-workspace-lineages-panel" aria-label={t("ui.workspaceLineageHomeTitle")}>
      <header className="home-panel-header">
        <h2>{t("ui.workspaceLineageHomeTitle")}</h2>
        <span className="settings-panel-chip">{snapshot.records.length}</span>
      </header>
      {isEmpty ? (
        <p className="settings-panel-intro">{t("ui.workspaceLineageHomeEmpty")}</p>
      ) : (
        <>
          <p className="settings-panel-intro">{t("ui.workspaceLineageHomeIntro")}</p>
          <WorkspaceLineageSelect model={model} />
        </>
      )}
      {others.length > 0 ? (
        <ul className="row-actions workspace-lineage-rows" aria-label={t("ui.workspaceLineageHomeOthersLabel")}>
          {others.map((record) => {
            const reminder = describeLineageExportReminder(record);
            return (
              <li key={record.workspaceId}>
                <button
                  type="button"
                  className="workspace-lineage-row"
                  aria-label={t("ui.workspaceLineageResumeCard", { name: record.displayName })}
                  title={record.displayName}
                  disabled={snapshot.busy}
                  onClick={() => {
                    void model.switchTo(record.workspaceId).then((ok) => {
                      if (ok) {
                        onResume();
                      }
                    });
                  }}
                >
                  <span className="workspace-lineage-row-name">{record.displayName}</span>
                  <span className="workspace-lineage-row-meta">
                    {translateCurrentPlural("ui.workspaceStorageVersionsCount", record.versionCount)} · {formatDateTime(record.lastDurableSaveIso)}
                  </span>
                  {reminder?.tone === "warning" ? <span className="settings-state-chip is-warn">{t("ui.workspaceLineageExportOverdueChip")}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <div className="row-actions">
        {isEmpty ? (
          <button type="button" className="button-with-icon lineage-primary-action" onClick={() => model.openDialog("create")} disabled={snapshot.busy || !snapshot.ready}>
            <span className="action-button-icon is-home-create" aria-hidden="true" />
            {t("ui.workspaceLineageHomeCreateFirst")}
          </button>
        ) : null}
        <button type="button" className="button-with-icon" onClick={onManage}>
          <span className="action-button-icon is-open" aria-hidden="true" />
          {t("ui.workspaceStorageManage")}
        </button>
      </div>
    </section>
  );
}

export function LineagePackageFileInput({ inputRef, model }: { inputRef: RefObject<HTMLInputElement | null>; model: WorkspaceLineageModel }): ReactElement {
  return (
    <input
      ref={inputRef}
      type="file"
      accept=".zip,application/zip"
      className="home-hidden-file-input"
      aria-label={t("ui.workspaceLineageImportPackage")}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        event.target.value = "";
        if (file !== null) {
          void model.importPackageFile(file);
        }
      }}
    />
  );
}

// --------------------------------------------------------------------------- dialogs

/** The single lineage dialog host, mounted once at app level independently of any trigger surface. */
export function WorkspaceLineageDialogs({ model, themeHostClassName }: { model: WorkspaceLineageModel; themeHostClassName?: string }): ReactElement | null {
  return (
    <LineageDialogThemeContext.Provider value={themeHostClassName ?? null}>
      <WorkspaceLineageDialogSwitch model={model} />
    </LineageDialogThemeContext.Provider>
  );
}

function WorkspaceLineageDialogSwitch({ model }: { model: WorkspaceLineageModel }): ReactElement | null {
  switch (model.dialog.kind) {
    case "create":
      return <CreateLineageDialog model={model} />;
    case "rename":
      return <RenameLineageDialog model={model} />;
    case "version":
      return <CreateVersionDialog model={model} operationId={model.dialog.operationId} />;
    case "history":
      return <HistoryDialog model={model} />;
    case "handoff":
      return (
        <HandoffDialog
          model={model}
          initialVersionId={model.dialog.versionId}
          supersedesHandoffId={model.dialog.supersedesHandoffId}
          operationId={model.dialog.operationId}
        />
      );
    case "legacy":
      return <LegacyImportDialog model={model} />;
    case "divergence":
      return <DivergenceDialog model={model} />;
    default:
      return null;
  }
}

function CreateLineageDialog({ model }: { model: WorkspaceLineageModel }): ReactElement {
  const [name, setName] = useState("");
  const [start, setStart] = useState<"current" | "empty">(model.snapshot.active === null ? "current" : "empty");
  const [storage, setStorage] = useState<"browser" | "folder">(model.snapshot.directoryAccessSupported ? "folder" : "browser");
  const [submitting, setSubmitting] = useState(false);
  const nameId = useId();
  const submit = async (): Promise<void> => {
    setSubmitting(true);
    const ok = await model.createLineage({ displayName: name, start, storage });
    setSubmitting(false);
    if (ok) {
      model.closeDialog();
    }
  };
  return (
    <LineageDialog
      title={t("ui.workspaceLineageCreateTitle")}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.cancel")}
          </button>
          <button type="button" className="confirm-dialog-confirm" disabled={submitting || name.trim().length === 0} onClick={() => void submit()}>
            {t("ui.workspaceLineageCreateConfirm")}
          </button>
        </>
      }
    >
      <label htmlFor={nameId}>{t("ui.workspaceLineageNameLabel")}</label>
      <input id={nameId} type="text" value={name} placeholder={t("ui.workspaceLineageNamePlaceholder")} onChange={(event) => setName(event.target.value)} />
      <fieldset>
        <legend>{t("ui.workspaceLineageStartLegend")}</legend>
        <label>
          <input type="radio" name="lineage-start" checked={start === "current"} onChange={() => setStart("current")} />
          {t("ui.workspaceLineageStartCurrent")}
        </label>
        <label>
          <input type="radio" name="lineage-start" checked={start === "empty"} onChange={() => setStart("empty")} />
          {t("ui.workspaceLineageStartEmpty")}
        </label>
      </fieldset>
      <fieldset>
        <legend>{t("ui.workspaceLineageStorageLegend")}</legend>
        <label>
          <input
            type="radio"
            name="lineage-storage"
            checked={storage === "folder"}
            disabled={!model.snapshot.directoryAccessSupported}
            onChange={() => setStorage("folder")}
          />
          {t("ui.workspaceLineageStorageFolderOption")}
        </label>
        <label>
          <input type="radio" name="lineage-storage" checked={storage === "browser"} onChange={() => setStorage("browser")} />
          {t("ui.workspaceLineageStorageBrowserOption")}
        </label>
        {!model.snapshot.directoryAccessSupported ? <p className="meta-line">{t("ui.workspaceLineageFolderUnsupported")}</p> : null}
      </fieldset>
    </LineageDialog>
  );
}

function RenameLineageDialog({ model }: { model: WorkspaceLineageModel }): ReactElement {
  const [name, setName] = useState(model.snapshot.active?.displayName ?? "");
  const nameId = useId();
  return (
    <LineageDialog
      title={t("ui.workspaceLineageRenameTitle")}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.cancel")}
          </button>
          <button
            type="button"
            className="confirm-dialog-confirm"
            disabled={name.trim().length === 0 || model.snapshot.busy}
            onClick={() => {
              void model.rename(name).then((ok) => {
                if (ok) {
                  model.closeDialog();
                }
              });
            }}
          >
            {t("ui.workspaceLineageRenameConfirm")}
          </button>
        </>
      }
    >
      <label htmlFor={nameId}>{t("ui.workspaceLineageNameLabel")}</label>
      <input id={nameId} type="text" value={name} onChange={(event) => setName(event.target.value)} />
      <p className="meta-line">{t("ui.workspaceLineageRenameHint")}</p>
    </LineageDialog>
  );
}

function CreateVersionDialog({ model, operationId }: { model: WorkspaceLineageModel; operationId: string }): ReactElement {
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const commentId = useId();
  const nextNumber = useMemo(
    () => (model.snapshot.active?.manifest?.versions ?? []).reduce((max, version) => Math.max(max, version.displayNumber), 0) + 1,
    [model.snapshot.active?.manifest?.versions]
  );
  const submit = async (): Promise<void> => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    // The operation ID is fixed for this dialog, so repeated clicks or retries cannot duplicate.
    const ok = await model.createVersion({ title, comment, operationId });
    setSubmitting(false);
    if (ok) {
      model.closeDialog();
    }
  };
  return (
    <LineageDialog
      title={t("ui.workspaceLineageVersionTitle", { version: formatVersionNumber(nextNumber) })}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.cancel")}
          </button>
          <button type="button" className="confirm-dialog-confirm" disabled={submitting || model.snapshot.busy} onClick={() => void submit()}>
            {submitting ? t("ui.workspaceLineageVersionCreating") : t("ui.workspaceLineageVersionConfirm")}
          </button>
        </>
      }
    >
      <p className="meta-line">{t("ui.workspaceLineageVersionIntro")}</p>
      <label htmlFor={titleId}>{t("ui.workspaceLineageVersionTitleLabel")}</label>
      <input id={titleId} type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      <label htmlFor={commentId}>{t("ui.workspaceLineageVersionCommentLabel")}</label>
      <textarea id={commentId} value={comment} rows={3} onChange={(event) => setComment(event.target.value)} />
    </LineageDialog>
  );
}

function versionMatchesFilter(version: LineageVersionEntry, label: string, handoffs: LineageHandoffEntry[], filter: string): boolean {
  const needle = filter.trim().toLocaleLowerCase();
  if (needle.length === 0) {
    return true;
  }
  return [label, version.title, version.comment, version.createdAtIso, version.originalFileName ?? "", ...handoffs.flatMap((handoff) => [handoff.recipient, handoff.handoffDate])]
    .join(" ")
    .toLocaleLowerCase()
    .includes(needle);
}

function HandoffDetails({ model, handoff, labels }: { model: WorkspaceLineageModel; handoff: LineageHandoffEntry; labels: Map<string, string> }): ReactElement {
  const [verification, setVerification] = useState<HandoffVerification | null>(null);
  const [expanded, setExpanded] = useState(false);
  const allHandoffs = model.snapshot.active?.manifest?.handoffs ?? [];
  const supersededBy = allHandoffs.filter((entry) => entry.supersedesHandoffId === handoff.handoffId);
  useEffect(() => {
    if (!expanded || verification !== null) {
      return;
    }
    void model.verifyHandoff(handoff.handoffId).then(setVerification);
  }, [expanded, handoff.handoffId, model, verification]);
  return (
    <li className="lineage-handoff">
      <span className="settings-panel-chip">{t("ui.workspaceLineageHandoffMarker")}</span>{" "}
      <strong>{handoff.recipient}</strong> · {handoff.handoffDate} ·{" "}
      {handoff.attachmentCount === 0 ? t("ui.workspaceLineageHandoffNoFiles") : t("ui.workspaceLineageHandoffFiles", { count: handoff.attachmentCount })}
      {handoff.supersedesHandoffId !== null ? <span className="meta-line"> · {t("ui.workspaceLineageHandoffSupersedes")}</span> : null}
      {supersededBy.length > 0 ? <span className="meta-line"> · {t("ui.workspaceLineageHandoffSuperseded")}</span> : null}
      <div className="row-actions">
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {t("ui.workspaceLineageHandoffShowFiles")}
        </button>
        <button type="button" onClick={() => model.openDialog("handoff", { versionId: handoff.versionId, supersedesHandoffId: handoff.handoffId })}>
          {t("ui.workspaceLineageHandoffCorrect")}
        </button>
      </div>
      {expanded ? (
        verification === null ? (
          <p className="meta-line">{t("ui.workspaceLineageVerifying")}</p>
        ) : (
          <div>
            <p className="meta-line">
              {labels.get(verification.record.versionId) ?? ""} · {verification.record.note}
            </p>
            {verification.attachments.length === 0 ? <p className="meta-line">{t("ui.workspaceLineageHandoffRecordOnly")}</p> : null}
            <ul>
              {verification.attachments.map(({ attachment, status }) => (
                <li key={attachment.attachmentId}>
                  {attachment.originalFileName} · {formatBytes(attachment.byteLength)} · <code title={attachment.sha256}>{attachment.sha256.slice(0, 12)}</code> ·{" "}
                  <span className={status === "ok" ? "lineage-attachment-ok" : "lineage-attachment-bad"}>
                    {status === "ok" ? t("ui.workspaceLineageAttachmentOk") : status === "missing" ? t("ui.workspaceLineageAttachmentMissing") : t("ui.workspaceLineageAttachmentCorrupt")}
                  </span>
                  <span className="row-actions compact">
                    <button type="button" disabled={status !== "ok"} onClick={() => void model.downloadAttachment(handoff.handoffId, attachment.attachmentId)}>
                      {t("ui.workspaceLineageDownload")}
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : null}
    </li>
  );
}

interface VersionMenuItem {
  key: string;
  label: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
  onSelect: () => void;
}

/**
 * Themed, keyboard-accessible dropdown (menu button pattern): arrows move between items, Escape
 * closes the menu without closing the dialog and returns focus to the trigger.
 */
function VersionActionsMenu({ triggerLabel, items }: { triggerLabel: string; items: VersionMenuItem[] }): ReactElement {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const enabledIndexes = items.flatMap((item, index) => (item.disabled === true ? [] : [index]));
  const firstEnabledIndex = enabledIndexes[0] ?? -1;

  useEffect(() => {
    if (!open) {
      return;
    }
    itemRefs.current[firstEnabledIndex]?.focus();
    const closeOnOutsidePointer = (event: PointerEvent): void => {
      if (containerRef.current !== null && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [firstEnabledIndex, open]);

  const close = (restoreFocus: boolean): void => {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const onMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const current = itemRefs.current.findIndex((element) => element === document.activeElement);
    const position = enabledIndexes.indexOf(current);
    const focusAt = (nextPosition: number): void => {
      const count = enabledIndexes.length;
      if (count > 0) {
        itemRefs.current[enabledIndexes[(nextPosition + count) % count]!]?.focus();
      }
    };
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(position + 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        focusAt(position - 1);
        return;
      case "Home":
        event.preventDefault();
        focusAt(0);
        return;
      case "End":
        event.preventDefault();
        focusAt(enabledIndexes.length - 1);
        return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      case "Tab":
        close(false);
        return;
      default:
    }
  };

  return (
    <div className="lineage-action-menu" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className="lineage-action-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {t("ui.workspaceLineageMoreActionsShort")}
        <span className="lineage-action-menu-caret" aria-hidden="true" />
      </button>
      {open ? (
        <div id={menuId} role="menu" aria-label={triggerLabel} className="panel row-actions lineage-action-menu-list" onKeyDown={onMenuKeyDown}>
          {items.map((item, index) => (
            <div key={item.key} role="none" className={item.separatorBefore === true ? "lineage-action-menu-entry has-separator" : "lineage-action-menu-entry"}>
              <button
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={item.danger === true ? "lineage-action-menu-item is-danger-action" : "lineage-action-menu-item"}
                disabled={item.disabled}
                onClick={() => {
                  close(false);
                  item.onSelect();
                }}
              >
                <span>{item.label}</span>
                {item.hint !== undefined ? <span className="lineage-action-menu-hint">{item.hint}</span> : null}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HistoryDialog({ model }: { model: WorkspaceLineageModel }): ReactElement {
  const [filter, setFilter] = useState("");
  const filterId = useId();
  const active = model.snapshot.active;
  const manifest = active?.manifest ?? null;
  const labels = active?.versionLabels ?? new Map<string, string>();
  const missing = new Set((active?.issues ?? []).flatMap((issue) => (issue.kind === "version-missing" ? [issue.versionId] : [])));
  const versions = sortVersionsForHistory(manifest?.versions ?? []);
  const handoffsByVersion = new Map<string, LineageHandoffEntry[]>();
  for (const handoff of manifest?.handoffs ?? []) {
    handoffsByVersion.set(handoff.versionId, [...(handoffsByVersion.get(handoff.versionId) ?? []), handoff]);
  }
  const visible = versions.filter((version) => versionMatchesFilter(version, labels.get(version.versionId) ?? "", handoffsByVersion.get(version.versionId) ?? [], filter));
  const isReadOnly = model.snapshot.historical !== null;

  return (
    <LineageDialog
      wide
      title={t("ui.workspaceLineageHistoryTitle", { name: active?.displayName ?? "" })}
      onClose={model.closeDialog}
      footer={
        <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
          {t("ui.workspaceLineageClose")}
        </button>
      }
    >
      <div className="row-actions lineage-history-toolbar">
        <button type="button" onClick={() => model.openDialog("handoff")} disabled={isReadOnly}>
          {t("ui.workspaceLineageRecordHandoff")}
        </button>
        <button type="button" onClick={() => void model.exportPackage()}>
          {t("ui.workspaceLineageExportPackage")}
        </button>
      </div>
      <label htmlFor={filterId}>{t("ui.workspaceLineageFilterLabel")}</label>
      <input
        id={filterId}
        type="search"
        className="lineage-history-filter"
        value={filter}
        placeholder={t("ui.workspaceLineageFilterPlaceholder")}
        onChange={(event) => setFilter(event.target.value)}
      />
      {versions.length === 0 ? <p className="empty-copy">{t("ui.workspaceLineageNoVersions")}</p> : null}
      <ol className="lineage-history-list" aria-label={t("ui.workspaceLineageHistoryListLabel")}>
        {visible.map((version) => {
          const label = labels.get(version.versionId) ?? formatVersionNumber(version.displayNumber);
          const handoffs = handoffsByVersion.get(version.versionId) ?? [];
          const isCurrentBase = active?.baseVersionId === version.versionId;
          const isMissing = missing.has(version.versionId);
          // Device labels are technical identifiers: provenance shows only meaningful facts.
          const provenance = [
            version.provenanceKind === "legacy-import" ? t("ui.workspaceLineageProvenanceLegacy", { file: version.originalFileName ?? "" }) : null,
            version.parentVersionId !== null ? t("ui.workspaceLineageParent", { version: labels.get(version.parentVersionId) ?? "?" }) : null,
            version.restoredFromVersionId !== null ? t("ui.workspaceLineageRestoredFrom", { version: labels.get(version.restoredFromVersionId) ?? "?" }) : null
          ].filter((entry): entry is string => entry !== null);
          return (
            <li key={version.versionId} className="lineage-history-entry" data-version-id={version.versionId}>
              <div className="lineage-history-row">
                <div className="lineage-history-heading">
                  <strong>{label}</strong>
                  {version.title.length > 0 ? <span> · {version.title}</span> : null}
                  <span className="meta-line"> · {formatDateTime(version.createdAtIso)}</span>
                  {isCurrentBase ? <span className="settings-panel-chip">{t("ui.workspaceLineageWorkingBase")}</span> : null}
                  {model.snapshot.historical?.versionId === version.versionId ? <span className="settings-panel-chip">{t("ui.workspaceLineageViewing")}</span> : null}
                </div>
                <div className="row-actions compact lineage-history-actions">
                  <button
                    type="button"
                    className="lineage-primary-action"
                    disabled={isMissing}
                    onClick={() => {
                      void model.openHistorical(version.versionId).then((ok) => {
                        if (ok) {
                          model.closeDialog();
                        }
                      });
                    }}
                  >
                    {t("ui.workspaceLineageOpenReadOnly")}
                  </button>
                  <VersionActionsMenu
                    triggerLabel={t("ui.workspaceLineageMoreActions", { version: label })}
                    items={[
                      { key: "download", label: t("ui.workspaceLineageDownloadVersion"), disabled: isMissing, onSelect: () => void model.downloadVersion(version.versionId) },
                      {
                        key: "handoff",
                        label: t("ui.workspaceLineageRecordHandoff"),
                        disabled: isReadOnly,
                        onSelect: () => model.openDialog("handoff", { versionId: version.versionId })
                      },
                      {
                        key: "resume",
                        label: t("ui.workspaceLineageResumeFromVersion"),
                        hint: t("ui.workspaceLineageResumeFromVersionHint"),
                        danger: true,
                        separatorBefore: true,
                        disabled: isMissing || model.snapshot.busy,
                        onSelect: () => {
                          void model.restoreFromVersion(version.versionId).then((ok) => {
                            if (ok) {
                              model.closeDialog();
                            }
                          });
                        }
                      }
                    ]}
                  />
                </div>
              </div>
              {version.comment.length > 0 ? <p className="meta-line">{version.comment}</p> : null}
              {provenance.length > 0 ? <p className="meta-line">{provenance.join(" · ")}</p> : null}
              {isMissing ? <p className="workspace-lineage-banner is-danger">{t("ui.workspaceLineageVersionFileMissing")}</p> : null}
              {handoffs.length > 0 ? (
                <ul className="lineage-handoff-list">
                  {handoffs.map((handoff) => (
                    <HandoffDetails key={handoff.handoffId} model={model} handoff={handoff} labels={labels} />
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </LineageDialog>
  );
}

const CURRENT_WORK_OPTION = "__current__";

function HandoffDialog({
  model,
  initialVersionId,
  supersedesHandoffId,
  operationId
}: {
  model: WorkspaceLineageModel;
  initialVersionId: string | null;
  supersedesHandoffId: string | null;
  operationId: string;
}): ReactElement {
  const manifest = model.snapshot.active?.manifest ?? null;
  const labels = model.snapshot.active?.versionLabels ?? new Map<string, string>();
  const superseded = manifest?.handoffs.find((entry) => entry.handoffId === supersedesHandoffId) ?? null;
  const [versionChoice, setVersionChoice] = useState(initialVersionId ?? CURRENT_WORK_OPTION);
  const [recipient, setRecipient] = useState(superseded?.recipient ?? "");
  const [handoffDate, setHandoffDate] = useState(todayIsoDate());
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const ids = { version: useId(), recipient: useId(), date: useId(), note: useId(), files: useId() };
  const submit = async (): Promise<void> => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const attachments = await Promise.all(
      files.map(async (file) => ({ fileName: file.name, bytes: new Uint8Array(await file.arrayBuffer()), mimeHint: file.type || "application/octet-stream" }))
    );
    const ok = await model.createHandoff({
      versionId: versionChoice === CURRENT_WORK_OPTION ? null : versionChoice,
      recipient,
      handoffDate,
      note,
      attachments,
      supersedesHandoffId,
      operationId
    });
    setSubmitting(false);
    if (ok) {
      model.openDialog("history");
    }
  };
  return (
    <LineageDialog
      title={superseded === null ? t("ui.workspaceLineageHandoffTitle") : t("ui.workspaceLineageHandoffCorrectionTitle")}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.cancel")}
          </button>
          <button
            type="button"
            className="confirm-dialog-confirm"
            disabled={submitting || model.snapshot.busy || recipient.trim().length === 0 || handoffDate.length === 0}
            onClick={() => void submit()}
          >
            {t("ui.workspaceLineageHandoffConfirm")}
          </button>
        </>
      }
    >
      <p className="meta-line">{t("ui.workspaceLineageHandoffIntro")}</p>
      <label htmlFor={ids.version}>{t("ui.workspaceLineageHandoffVersionLabel")}</label>
      <select id={ids.version} value={versionChoice} onChange={(event) => setVersionChoice(event.target.value)} disabled={superseded !== null}>
        <option value={CURRENT_WORK_OPTION}>{t("ui.workspaceLineageHandoffFreezeCurrent")}</option>
        {sortVersionsForHistory(manifest?.versions ?? []).map((version) => (
          <option key={version.versionId} value={version.versionId}>
            {labels.get(version.versionId) ?? formatVersionNumber(version.displayNumber)}
            {version.title.length > 0 ? ` · ${version.title}` : ""}
          </option>
        ))}
      </select>
      <label htmlFor={ids.recipient}>{t("ui.workspaceLineageHandoffRecipientLabel")}</label>
      <input id={ids.recipient} type="text" value={recipient} placeholder={t("ui.workspaceLineageHandoffRecipientPlaceholder")} onChange={(event) => setRecipient(event.target.value)} />
      <label htmlFor={ids.date}>{t("ui.workspaceLineageHandoffDateLabel")}</label>
      <input id={ids.date} type="date" value={handoffDate} onChange={(event) => setHandoffDate(event.target.value)} />
      <label htmlFor={ids.note}>{t("ui.workspaceLineageHandoffNoteLabel")}</label>
      <textarea id={ids.note} rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
      <label htmlFor={ids.files}>{t("ui.workspaceLineageHandoffFilesLabel")}</label>
      <input id={ids.files} type="file" multiple onChange={(event) => setFiles([...(event.target.files ?? [])])} />
      {files.length === 0 ? (
        <p className="meta-line">{t("ui.workspaceLineageHandoffRecordOnly")}</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>
              {file.name} · {formatBytes(file.size)}
            </li>
          ))}
        </ul>
      )}
    </LineageDialog>
  );
}

function LegacyImportDialog({ model }: { model: WorkspaceLineageModel }): ReactElement {
  const [preview, setPreview] = useState<LegacyAdoptionPreview | null>(null);
  const [plan, setPlan] = useState<LegacyAdoptionPlan | null>(null);
  const [target, setTarget] = useState<string>(model.snapshot.active?.workspaceId ?? "__new__");
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const ids = { files: useId(), target: useId(), name: useId() };
  const issues = preview !== null && plan !== null ? validateLegacyAdoptionPlan(preview, plan) : [];
  const entriesById = new Map((preview?.entries ?? []).map((entry) => [entry.entryId, entry]));
  const ordered = plan?.orderedEntryIds ?? [];
  const unplaced = (preview?.entries ?? []).filter((entry) => entry.status === "valid" && !ordered.includes(entry.entryId) && !(plan?.skippedEntryIds ?? []).includes(entry.entryId));
  const hasTies = issues.some((issue) => issue.kind === "ties-not-reviewed") || (plan?.tiesReviewed ?? false);
  const move = (entryId: string, delta: number): void => {
    setPlan((current) => {
      if (current === null) return current;
      const next = [...current.orderedEntryIds];
      const index = next.indexOf(entryId);
      const target = index + delta;
      if (index < 0 || target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return { ...current, orderedEntryIds: next };
    });
  };
  const canSubmit = preview !== null && plan !== null && issues.length === 0 && (target !== "__new__" || newName.trim().length > 0) && !submitting;
  return (
    <LineageDialog
      wide
      title={t("ui.workspaceLineageLegacyTitle")}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.cancel")}
          </button>
          <button
            type="button"
            className="confirm-dialog-confirm"
            disabled={!canSubmit}
            onClick={() => {
              if (preview === null || plan === null) return;
              setSubmitting(true);
              void model
                .applyLegacyImport(preview, plan, target === "__new__" ? { kind: "new", displayName: newName } : { kind: "existing", workspaceId: target })
                .then((ok) => {
                  setSubmitting(false);
                  if (ok) model.closeDialog();
                });
            }}
          >
            {t("ui.workspaceLineageLegacyConfirm", { count: ordered.length })}
          </button>
        </>
      }
    >
      <p className="meta-line">{t("ui.workspaceLineageLegacyIntro")}</p>
      <label htmlFor={ids.files}>{t("ui.workspaceLineageLegacyFilesLabel")}</label>
      <input
        id={ids.files}
        type="file"
        multiple
        accept="application/json,.json"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          if (files.length === 0) return;
          void model.previewLegacyFiles(files).then((nextPreview) => {
            setPreview(nextPreview);
            setPlan(buildDefaultLegacyAdoptionPlan(nextPreview));
          });
        }}
      />
      <label htmlFor={ids.target}>{t("ui.workspaceLineageLegacyTargetLabel")}</label>
      <select id={ids.target} value={target} onChange={(event) => setTarget(event.target.value)}>
        <option value="__new__">{t("ui.workspaceLineageLegacyTargetNew")}</option>
        {model.snapshot.records.map((record) => (
          <option key={record.workspaceId} value={record.workspaceId}>
            {record.displayName}
          </option>
        ))}
      </select>
      {target === "__new__" ? (
        <>
          <label htmlFor={ids.name}>{t("ui.workspaceLineageNameLabel")}</label>
          <input id={ids.name} type="text" value={newName} onChange={(event) => setNewName(event.target.value)} />
        </>
      ) : (
        <p className="meta-line">{t("ui.workspaceLineageLegacyAppendHint")}</p>
      )}
      {preview !== null && plan !== null ? (
        <>
          <h3>{t("ui.workspaceLineageLegacyOrderHeading")}</h3>
          <ol className="lineage-legacy-list">
            {ordered.map((entryId, index) => {
              const entry = entriesById.get(entryId);
              if (entry === undefined) return null;
              return (
                <li key={entryId} className="lineage-legacy-entry">
                  <strong>{t("ui.workspaceLineageLegacyAssigned", { position: index + 1 })}</strong> {entry.fileName}
                  <span className="meta-line">
                    {" "}
                    · {entry.suggestedDateIso === null ? t("ui.workspaceLineageLegacyUndated") : formatDateTime(entry.suggestedDateIso)}
                    {entry.dateSource === "embedded-date" ? ` (${t("ui.workspaceLineageLegacyEmbeddedDate")})` : entry.dateSource === "filename-timestamp" ? ` (${t("ui.workspaceLineageLegacyFilenameDate")})` : ""}
                    {" "}· {t("ui.workspaceLineageLegacyCounts", { networks: entry.networkCount, wires: entry.wireCount })}
                  </span>
                  {entry.duplicateOfEntryIds.length > 0 ? <span className="lineage-attachment-bad"> · {t("ui.workspaceLineageLegacyDuplicate")}</span> : null}
                  {entry.tiedWithEntryIds.length > 0 ? <span className="lineage-attachment-bad"> · {t("ui.workspaceLineageLegacyTie")}</span> : null}
                  <div className="row-actions">
                    <input
                      type="text"
                      aria-label={t("ui.workspaceLineageLegacyLabelInput", { file: entry.fileName })}
                      placeholder={t("ui.workspaceLineageVersionTitleLabel")}
                      value={plan.labels[entryId] ?? ""}
                      onChange={(event) => setPlan({ ...plan, labels: { ...plan.labels, [entryId]: event.target.value } })}
                    />
                    <button type="button" aria-label={t("ui.workspaceLineageLegacyMoveUp", { file: entry.fileName })} disabled={index === 0} onClick={() => move(entryId, -1)}>
                      ↑
                    </button>
                    <button type="button" aria-label={t("ui.workspaceLineageLegacyMoveDown", { file: entry.fileName })} disabled={index === ordered.length - 1} onClick={() => move(entryId, 1)}>
                      ↓
                    </button>
                    <label>
                      <input
                        type="radio"
                        name="legacy-working"
                        checked={plan.workingEntryId === entryId}
                        onChange={() => setPlan({ ...plan, workingEntryId: entryId })}
                      />
                      {t("ui.workspaceLineageLegacyWorkingChoice")}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPlan({
                          ...plan,
                          orderedEntryIds: plan.orderedEntryIds.filter((id) => id !== entryId),
                          skippedEntryIds: [...plan.skippedEntryIds, entryId],
                          workingEntryId: plan.workingEntryId === entryId ? null : plan.workingEntryId
                        })
                      }
                    >
                      {t("ui.workspaceLineageLegacySkip")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
          {target !== "__new__" ? (
            <label>
              <input type="radio" name="legacy-working" checked={plan.workingEntryId === null} onChange={() => setPlan({ ...plan, workingEntryId: null })} />
              {t("ui.workspaceLineageLegacyKeepWorking")}
            </label>
          ) : null}
          {unplaced.length > 0 || plan.skippedEntryIds.length > 0 ? (
            <>
              <h3>{t("ui.workspaceLineageLegacyUnplacedHeading")}</h3>
              <ul>
                {[...unplaced, ...plan.skippedEntryIds.map((id) => entriesById.get(id)).filter((entry) => entry !== undefined)].map((entry) => (
                  <li key={entry.entryId}>
                    {entry.fileName} · {entry.suggestedDateIso === null ? t("ui.workspaceLineageLegacyUndated") : formatDateTime(entry.suggestedDateIso)}
                    {plan.skippedEntryIds.includes(entry.entryId) ? ` · ${t("ui.workspaceLineageLegacySkipped")}` : ""}
                    <span className="row-actions compact">
                      <button
                        type="button"
                        onClick={() =>
                          setPlan({
                            ...plan,
                            orderedEntryIds: [...plan.orderedEntryIds, entry.entryId],
                            skippedEntryIds: plan.skippedEntryIds.filter((id) => id !== entry.entryId)
                          })
                        }
                      >
                        {t("ui.workspaceLineageLegacyPlace")}
                      </button>
                      {!plan.skippedEntryIds.includes(entry.entryId) ? (
                        <button type="button" onClick={() => setPlan({ ...plan, skippedEntryIds: [...plan.skippedEntryIds, entry.entryId] })}>
                          {t("ui.workspaceLineageLegacySkip")}
                        </button>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {preview.entries.some((entry) => entry.status === "invalid") ? (
            <>
              <h3>{t("ui.workspaceLineageLegacyInvalidHeading")}</h3>
              <ul>
                {preview.entries
                  .filter((entry) => entry.status === "invalid")
                  .map((entry) => (
                    <li key={entry.entryId} className="lineage-attachment-bad">
                      {entry.fileName} · {entry.error}
                    </li>
                  ))}
              </ul>
            </>
          ) : null}
          {hasTies ? (
            <label>
              <input type="checkbox" checked={plan.tiesReviewed} onChange={(event) => setPlan({ ...plan, tiesReviewed: event.target.checked })} />
              {t("ui.workspaceLineageLegacyTiesReviewed")}
            </label>
          ) : null}
          {issues.length > 0 ? (
            <p className="workspace-lineage-banner is-warning" role="status">
              {t("ui.workspaceLineageLegacyNeedsReview", { count: issues.length })}
            </p>
          ) : null}
        </>
      ) : null}
    </LineageDialog>
  );
}

function DivergenceDialog({ model }: { model: WorkspaceLineageModel }): ReactElement {
  const manifest = model.snapshot.active?.manifest ?? null;
  const labels = model.snapshot.active?.versionLabels ?? new Map<string, string>();
  const heads = manifest?.divergentHeads ?? [];
  const [choice, setChoice] = useState<string>("__current__");
  return (
    <LineageDialog
      title={t("ui.workspaceLineageDivergenceTitle")}
      onClose={model.closeDialog}
      footer={
        <>
          <button type="button" className="confirm-dialog-cancel" onClick={model.closeDialog}>
            {t("ui.workspaceLineageDecideLater")}
          </button>
          <button
            type="button"
            className="confirm-dialog-confirm"
            disabled={model.snapshot.busy}
            onClick={() => {
              void model.chooseWorkingHead(choice === "__current__" ? null : choice).then((ok) => {
                if (ok) model.closeDialog();
              });
            }}
          >
            {t("ui.workspaceLineageChooseHead")}
          </button>
        </>
      }
    >
      <p className="meta-line">{t("ui.workspaceLineageDivergenceIntro")}</p>
      <fieldset>
        <legend>{t("ui.workspaceLineageDivergenceLegend")}</legend>
        <label>
          <input type="radio" name="divergent-head" checked={choice === "__current__"} onChange={() => setChoice("__current__")} />
          {t("ui.workspaceLineageDivergenceKeepCurrent", { version: model.snapshot.active?.baseVersionId === null ? "—" : labels.get(model.snapshot.active?.baseVersionId ?? "") ?? "—" })}
        </label>
        {heads.map((head) => (
          <label key={head.headId}>
            <input type="radio" name="divergent-head" checked={choice === head.headId} onChange={() => setChoice(head.headId)} />
            {t("ui.workspaceLineageDivergenceHead", {
              source: head.sourceLabel,
              date: formatDateTime(head.updatedAtIso),
              version: head.baseVersionId === null ? "—" : labels.get(head.baseVersionId) ?? "?"
            })}
          </label>
        ))}
      </fieldset>
      <p className="meta-line">{t("ui.workspaceLineageDivergenceRetained")}</p>
    </LineageDialog>
  );
}
