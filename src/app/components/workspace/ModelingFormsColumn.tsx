import type { ReactElement } from "react";
import { ModelingConnectorFormPanel } from "./ModelingConnectorFormPanel";
import { ModelingNodeFormPanel } from "./ModelingNodeFormPanel";
import { ModelingSegmentFormPanel } from "./ModelingSegmentFormPanel";
import { ModelingSpliceFormPanel } from "./ModelingSpliceFormPanel";
import type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";
import { ModelingWireFormPanel } from "./ModelingWireFormPanel";

export type { ModelingFormsColumnProps } from "./ModelingFormsColumn.types";

export function ModelingFormsColumn(props: ModelingFormsColumnProps): ReactElement {
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
