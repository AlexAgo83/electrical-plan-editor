import type { ReactElement } from "react";
import type { FunctionalSchematicNode } from "../../../core/functionalSchematic";

interface FunctionalNodePosition {
  x: number;
  y: number;
}

export function getFunctionalNodeClassName(node: FunctionalSchematicNode): string {
  return `functional-node functional-node--${node.kind} functional-node--${node.role}`;
}

export function renderFunctionalNodeShape(node: FunctionalSchematicNode, position: FunctionalNodePosition): ReactElement {
  if (node.kind === "splice") {
    return (
      <rect
        className="functional-node-shape"
        x={position.x - 22}
        y={position.y - 22}
        width={44}
        height={44}
        rx={7}
        transform={`rotate(45 ${position.x} ${position.y})`}
      />
    );
  }
  if (node.kind === "fuse") {
    return <rect className="functional-node-shape" x={position.x - 32} y={position.y - 18} width={64} height={36} rx={6} />;
  }
  if (node.kind === "interconnector") {
    return <rect className="functional-node-shape" x={position.x - 78} y={position.y - 33} width={156} height={66} rx={6} />;
  }
  if (node.kind === "connector" && node.detailTop !== undefined) {
    return <rect className="functional-node-shape" x={position.x - 55} y={position.y - 27} width={110} height={54} rx={7} />;
  }
  return <rect className="functional-node-shape" x={position.x - 46} y={position.y - 20} width={92} height={40} rx={7} />;
}

export function renderFunctionalNodeText(node: FunctionalSchematicNode, position: FunctionalNodePosition): ReactElement {
  if (node.kind === "interconnector") {
    return (
      <>
        <text className="functional-node-detail functional-node-detail--top" x={position.x} y={position.y - 16} textAnchor="middle">
          {node.detailTop ?? node.detail}
        </text>
        <text className="functional-node-label functional-node-label--interconnector" x={position.x} y={position.y + 3} textAnchor="middle">
          {node.label}
        </text>
        <text className="functional-node-detail functional-node-detail--bottom" x={position.x} y={position.y + 20} textAnchor="middle">
          {node.detailBottom ?? node.detail}
        </text>
      </>
    );
  }

  if (node.kind === "connector" && node.detailTop !== undefined) {
    return (
      <>
        <text className="functional-node-network-label" x={position.x - 48} y={position.y - 14} textAnchor="start">
          {node.detailTop}
        </text>
        <text className="functional-node-label" x={position.x} y={position.y + 2} textAnchor="middle">
          {node.label}
        </text>
        <text className="functional-node-detail" x={position.x} y={position.y + 17} textAnchor="middle">
          {node.detail}
        </text>
      </>
    );
  }

  return (
    <>
      <text className="functional-node-label" x={position.x} y={position.y - 2} textAnchor="middle">
        {node.label}
      </text>
      <text className="functional-node-detail" x={position.x} y={position.y + 13} textAnchor="middle">
        {node.detail}
      </text>
    </>
  );
}
