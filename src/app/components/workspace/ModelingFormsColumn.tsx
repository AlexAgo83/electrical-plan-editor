import type { ReactElement } from "react";
import { ModelingBatchContextPanel } from "./ModelingBatchContextPanel";
import { ModelingConnectorFormPanel } from "./ModelingConnectorFormPanel";
import { ModelingNodeFormPanel } from "./ModelingNodeFormPanel";
import { ModelingSegmentFormPanel } from "./ModelingSegmentFormPanel";
import { ModelingSpliceFormPanel } from "./ModelingSpliceFormPanel";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { ModelingWireFormPanel } from "./ModelingWireFormPanel";

export type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";

export function ModelingFormsColumn(props: ModelingFormsColumnProps): ReactElement {
  if (props.modelingBatchSelection !== null) {
    return (
      <ModelingBatchContextPanel
        scope={props.modelingBatchSelection.scope}
        selectedCount={props.modelingBatchSelection.selectedCount}
        directCount={props.modelingBatchSelection.directCount}
        cascadeCount={props.modelingBatchSelection.cascadeCount}
        blockedCount={props.modelingBatchSelection.blockedCount}
        summaryCategories={props.modelingBatchSelection.summaryCategories}
        summaryNote={props.modelingBatchSelection.summaryNote}
        onDeleteSelected={props.modelingBatchSelection.onDeleteSelected}
        onCancelBatchMode={props.modelingBatchSelection.onCancelBatchMode}
      />
    );
  }

  return (
    <section className="panel-grid workspace-column workspace-column-right">
      <ModelingConnectorFormPanel {...props} />
      <ModelingSpliceFormPanel {...props} />
      <ModelingNodeFormPanel {...props} />
      <ModelingSegmentFormPanel {...props} />
      <ModelingWireFormPanel {...props} />
    </section>
  );
}
