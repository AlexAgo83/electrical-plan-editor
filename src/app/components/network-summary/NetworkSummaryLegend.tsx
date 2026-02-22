import type { ReactElement } from "react";

export function NetworkSummaryLegend(): ReactElement {
  return (
    <ul className="network-legend">
      <li>
        <span className="legend-swatch connector" /> Connector node
      </li>
      <li>
        <span className="legend-swatch splice" /> Splice node
      </li>
      <li>
        <span className="legend-swatch intermediate" /> Intermediate node
      </li>
      <li>
        <span className="legend-line selected" /> Selected segment
      </li>
      <li>
        <span className="legend-line wire" /> Wire highlighted segment
      </li>
    </ul>
  );
}
