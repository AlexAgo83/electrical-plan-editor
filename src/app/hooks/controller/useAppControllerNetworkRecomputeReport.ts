import { translateCurrent as t } from "../../lib/i18n";
import { useEffect, useState } from "react";
import type { WireRecomputeReportEntry } from "../../../store";
import type { FileFeedbackDialogModel } from "../networkImportExportTypes";

export interface AppControllerNetworkRecomputeReport {
  networkRecomputeReportDialog: FileFeedbackDialogModel | null;
}

/**
 * Owns the manual full-network recompute report dialog. It watches the
 * transient `ui.lastRecomputeReport` signal produced by the `wire/recomputeAll`
 * action: when a recompute has just run it opens a scrollable report dialog
 * (listing every wire whose route, length, or directional splice side changed,
 * or an explicit no-change message) and clears the signal so it fires once.
 */
export function useAppControllerNetworkRecomputeReport(
  lastRecomputeReport: WireRecomputeReportEntry[] | null,
  onConsume: () => void
): AppControllerNetworkRecomputeReport {
  const [networkRecomputeReportDialog, setNetworkRecomputeReportDialog] =
    useState<FileFeedbackDialogModel | null>(null);

  useEffect(() => {
    if (lastRecomputeReport === null) {
      return;
    }

    const changeCount = lastRecomputeReport.length;
    setNetworkRecomputeReportDialog({
      title: t("ui.recomputeReport"),
      message:
        changeCount === 0
          ? t("ui.networkRecomputeNoChanges")
          : changeCount === 1
            ? t("ui.networkRecomputeOneChange")
            : t("ui.networkRecomputeManyChanges", { count: changeCount }),
      items: lastRecomputeReport.map((entry) => entry.message),
      onClose: () => setNetworkRecomputeReportDialog(null)
    });
    onConsume();
  }, [lastRecomputeReport, onConsume]);

  return { networkRecomputeReportDialog };
}
