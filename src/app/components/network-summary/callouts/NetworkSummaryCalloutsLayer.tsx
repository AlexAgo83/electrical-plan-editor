import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactElement } from "react";
import type { ConnectorId, SpliceId, Wire } from "../../../../core/entities";
import {
  CALLOUT_COLOR_SWATCH_GAP,
  CALLOUT_COLOR_SWATCH_RADIUS,
  getCalloutColorSwatchesWidth,
  getCalloutRowCellValue,
  type CableCalloutViewModel,
  type CalloutTargetKey,
  type RenderedCableCallout
} from "./calloutLayout";

interface NetworkSummaryCalloutLeadersProps {
  renderedCableCallouts: RenderedCableCallout[];
  networkOffset: { x: number; y: number };
  networkScale: number;
}

export function NetworkSummaryCalloutLeaders({
  renderedCableCallouts,
  networkOffset,
  networkScale
}: NetworkSummaryCalloutLeadersProps): ReactElement {
  return (
    <g transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}>
      {renderedCableCallouts.map(({ callout, lineEnd, calloutClassName }) => (
        <g key={`${callout.key}-leader`} className={calloutClassName}>
          <line
            className="network-callout-leader-line"
            x1={callout.nodePosition.x}
            y1={callout.nodePosition.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
          />
        </g>
      ))}
    </g>
  );
}

interface NetworkSummaryCalloutsLayerProps {
  renderedCableCallouts: RenderedCableCallout[];
  inverseLabelScale: number;
  selectedWireId: Wire["id"] | null;
  onHoverCallout: (calloutKey: CalloutTargetKey | null) => void;
  onCalloutMouseDown: (
    event: ReactMouseEvent<SVGGElement>,
    callout: Pick<CableCalloutViewModel, "key" | "kind" | "entityId" | "position">
  ) => void;
  onSelectConnectorFromCallout: (connectorId: ConnectorId) => void;
  onSelectSpliceFromCallout: (spliceId: SpliceId) => void;
  networkOffset: { x: number; y: number };
  networkScale: number;
}

export function NetworkSummaryCalloutsLayer({
  renderedCableCallouts,
  inverseLabelScale,
  selectedWireId,
  onHoverCallout,
  onCalloutMouseDown,
  onSelectConnectorFromCallout,
  onSelectSpliceFromCallout,
  networkOffset,
  networkScale
}: NetworkSummaryCalloutsLayerProps): ReactElement {
  return (
    <g
      className="network-graph-layer network-graph-layer-callouts"
      transform={`translate(${networkOffset.x} ${networkOffset.y}) scale(${networkScale})`}
    >
      {renderedCableCallouts.map(({ callout, layout, calloutClassName, isVisibleInViewport }) => {
        const contentLeftX = -layout.width / 2 + 4;
        const headerY = -layout.height / 2 + layout.headerY;
        const rowsStartY = -layout.height / 2 + layout.rowsStartY;
        const lastColumn = layout.columns[layout.columns.length - 1];
        const tableRightX =
          lastColumn === undefined ? contentLeftX : contentLeftX + lastColumn.x + lastColumn.width;

        return (
          <g
            key={callout.key}
            className={calloutClassName}
            onMouseEnter={() => onHoverCallout(callout.key)}
            onMouseLeave={() => onHoverCallout(null)}
          >
            <g
              className="network-callout-anchor"
              transform={`translate(${callout.position.x} ${callout.position.y}) scale(${inverseLabelScale})`}
              role="button"
              tabIndex={isVisibleInViewport ? 0 : -1}
              focusable={isVisibleInViewport ? "true" : "false"}
              aria-hidden={isVisibleInViewport ? undefined : true}
              aria-label={`Select ${callout.kind} ${callout.title}`}
              style={isVisibleInViewport ? undefined : { pointerEvents: "none" }}
              onMouseDown={(event) => onCalloutMouseDown(event, callout)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onKeyDown={(event: ReactKeyboardEvent<SVGGElement>) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                if (callout.kind === "connector") {
                  onSelectConnectorFromCallout(callout.entityId as ConnectorId);
                } else {
                  onSelectSpliceFromCallout(callout.entityId as SpliceId);
                }
              }}
            >
              <rect
                className="network-callout-frame"
                x={-layout.width / 2}
                y={-layout.height / 2}
                width={layout.width}
                height={layout.height}
              />
              <g className="network-callout-content">
                <text
                  className="network-callout-title"
                  x={-layout.width / 2 + 4}
                  y={-layout.height / 2 + layout.titleStartY}
                  textAnchor="start"
                  dominantBaseline="hanging"
                >
                  {callout.title}
                </text>
                {layout.subtitleStartY !== null ? (
                  <text
                    className="network-callout-subtitle"
                    x={-layout.width / 2 + 4}
                    y={-layout.height / 2 + layout.subtitleStartY}
                    textAnchor="start"
                    dominantBaseline="hanging"
                  >
                    {callout.subtitle}
                  </text>
                ) : null}
                {layout.columns.map((column) => {
                  const x =
                    column.textAnchor === "end"
                      ? contentLeftX + column.x + column.width
                      : contentLeftX + column.x;
                  return (
                    <text
                      key={`${callout.key}-header-${column.key}`}
                      className="network-callout-table-header-cell"
                      x={x}
                      y={headerY}
                      textAnchor={column.textAnchor}
                      dominantBaseline="hanging"
                      data-locale-exempt={
                        column.key === "technicalId" ||
                        column.key === "color" ||
                        column.key === "targetId" ||
                        column.key === "length" ||
                        column.key === "section"
                          ? "true"
                          : undefined
                      }
                    >
                      {column.header}
                    </text>
                  );
                })}
                <line
                  className="network-callout-table-divider"
                  x1={contentLeftX}
                  y1={rowsStartY - 0.35}
                  x2={tableRightX}
                  y2={rowsStartY - 0.35}
                />
                {layout.rows.map((row, rowIndex) => {
                  const rowY = rowsStartY + rowIndex * layout.rowStep;
                  const isSelectedWireRow = selectedWireId !== null && row.wireId === selectedWireId;
                  const rowClassName = `network-callout-table-row${isSelectedWireRow ? " is-selected-wire" : ""}`;
                  return (
                    <g
                      key={`${callout.key}-row-${rowIndex}`}
                      className={rowClassName}
                      data-wire-id={row.wireId}
                    >
                      {isSelectedWireRow ? (
                        <rect
                          className="network-callout-table-row-highlight"
                          x={contentLeftX - 0.8}
                          y={rowY - 0.25}
                          width={Math.max(0, tableRightX - contentLeftX + 1.6)}
                          height={layout.rowHeight + 0.45}
                          rx={0.5}
                          ry={0.5}
                        />
                      ) : null}
                      {layout.columns.map((column) => {
                        const x =
                          column.textAnchor === "end"
                            ? contentLeftX + column.x + column.width
                            : contentLeftX + column.x;
                        if (column.key === "color") {
                          const swatchWidth = getCalloutColorSwatchesWidth(row);
                          const dotDiameter = CALLOUT_COLOR_SWATCH_RADIUS * 2;
                          const swatchCenterY = rowY + layout.rowHeight / 2;
                          return (
                            <g key={`${callout.key}-row-${rowIndex}-${column.key}`}>
                              {row.colorPrimaryHex !== null ? (
                                <circle
                                  className="network-callout-color-dot"
                                  cx={x + CALLOUT_COLOR_SWATCH_RADIUS}
                                  cy={swatchCenterY}
                                  r={CALLOUT_COLOR_SWATCH_RADIUS}
                                  fill={row.colorPrimaryHex}
                                />
                              ) : null}
                              {row.colorSecondaryHex !== null ? (
                                <circle
                                  className="network-callout-color-dot"
                                  cx={x + CALLOUT_COLOR_SWATCH_RADIUS + dotDiameter + CALLOUT_COLOR_SWATCH_GAP}
                                  cy={swatchCenterY}
                                  r={CALLOUT_COLOR_SWATCH_RADIUS}
                                  fill={row.colorSecondaryHex}
                                />
                              ) : null}
                              <text
                                className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                                x={x + swatchWidth}
                                y={rowY}
                                textAnchor={column.textAnchor}
                                dominantBaseline="hanging"
                              >
                                {getCalloutRowCellValue(row, column.key)}
                              </text>
                            </g>
                          );
                        }
                        return (
                          <text
                            key={`${callout.key}-row-${rowIndex}-${column.key}`}
                            className={`network-callout-table-cell${isSelectedWireRow ? " is-selected-wire" : ""}`}
                            x={x}
                            y={rowY}
                            textAnchor={column.textAnchor}
                            dominantBaseline="hanging"
                          >
                            {getCalloutRowCellValue(row, column.key)}
                          </text>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
