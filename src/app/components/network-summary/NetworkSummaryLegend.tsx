import { translateCurrent as t } from "../../lib/i18n";
import type { ReactElement } from "react";

export function NetworkSummaryLegend(): ReactElement {
  return (
    <ul className="network-legend network-summary-legend">
      <li>
        <span className="legend-swatch connector" />  {t("ui.connectorNode")}
      </li>
      <li>
        <span className="legend-swatch splice" />  {t("ui.spliceNode")}
      </li>
      <li>
        <span className="legend-swatch intermediate" />  {t("ui.intermediateNode")}
      </li>
      <li>
        <span className="legend-line selected" />  {t("ui.selectedSegment")}
      </li>
      <li>
        <span className="legend-line wire" />  {t("ui.wireHighlightedSegment")}
      </li>
    </ul>
  );
}
