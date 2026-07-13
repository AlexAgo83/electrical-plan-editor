import { translateCurrent as t } from "../../lib/i18n";
import { useCallback, useEffect, useState } from "react";
import { consumeLastSpliceMigrationReport } from "../../../adapters/persistence";
import type { FileFeedbackDialogModel } from "../networkImportExportTypes";

export interface AppControllerSpliceMigrationReport {
  spliceMigrationReportDialog: FileFeedbackDialogModel | null;
  showSpliceMigrationReport: (entries: string[]) => void;
}

/**
 * Owns the legacy splice-node migration report dialog: it exposes the dialog
 * model surfaced to the user, the imperative `showSpliceMigrationReport` entry
 * point wired into the workspace runtime and network domain, and the load-time
 * effect that drains any report produced while hydrating the workspace.
 */
export function useAppControllerSpliceMigrationReport(): AppControllerSpliceMigrationReport {
  const [spliceMigrationReportDialog, setSpliceMigrationReportDialog] = useState<FileFeedbackDialogModel | null>(null);
  const showSpliceMigrationReport = useCallback((entries: string[]): void => {
    if (entries.length === 0) {
      return;
    }

    setSpliceMigrationReportDialog({
      title: t("ui.useappcontrollersplicemigrationreportSpliceMigrationReport"),
      message:
        entries.length === 1
          ? "A legacy splice-node migration ran while loading this workspace."
          : `Legacy splice-node migration ran and produced ${String(entries.length)} report entries.`,
      items: entries,
      onClose: () => setSpliceMigrationReportDialog(null)
    });
  }, []);
  useEffect(() => {
    const pendingEntries = consumeLastSpliceMigrationReport().map((entry) => entry.message);
    if (pendingEntries.length > 0) {
      showSpliceMigrationReport(pendingEntries);
    }
  }, [showSpliceMigrationReport]);
  return { spliceMigrationReportDialog, showSpliceMigrationReport };
}
