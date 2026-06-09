import type { ReactElement } from "react";
import { ModelingBatchContextDialog } from "./ModelingBatchContextPanel";
import { ModelingConnectorFormPanel } from "./ModelingConnectorFormPanel";
import { ModelingNodeFormPanel } from "./ModelingNodeFormPanel";
import { ModelingSegmentFormPanel } from "./ModelingSegmentFormPanel";
import { ModelingSpliceFormPanel } from "./ModelingSpliceFormPanel";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { ModelingWireFormPanel } from "./ModelingWireFormPanel";

export type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";

export function ModelingFormsColumn(
  props: ModelingFormsColumnProps,
): ReactElement {
  const batchSelectionDialog =
    props.modelingBatchSelection === null ? null : (
      <ModelingBatchContextDialog
        isOpen={props.modelingBatchSelection.isDialogOpen}
        scope={props.modelingBatchSelection.scope}
        selectedCount={props.modelingBatchSelection.selectedCount}
        directCount={props.modelingBatchSelection.directCount}
        cascadeCount={props.modelingBatchSelection.cascadeCount}
        blockedCount={props.modelingBatchSelection.blockedCount}
        summaryCategories={props.modelingBatchSelection.summaryCategories}
        summaryNote={props.modelingBatchSelection.summaryNote}
        onDeleteSelected={props.modelingBatchSelection.onDeleteSelected}
        onCancelBatchMode={props.modelingBatchSelection.onCancelBatchMode}
        onCloseDialog={props.modelingBatchSelection.onCloseDialog}
        segmentBatchEdit={props.modelingBatchSelection.segmentBatchEdit}
      />
    );

  return (
    <>
      <section className="panel-grid workspace-column workspace-column-right">
        <ModelingConnectorFormPanel {...props} />
        <ModelingSpliceFormPanel {...props} />
        <ModelingNodeFormPanel {...props} />
        <ModelingSegmentFormPanel {...props} />
        <ModelingWireFormPanel {...props} />
      </section>
      {batchSelectionDialog}
    </>
  );
}
