import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRef, useState, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import {
  ConfigurableTableColumnsControl,
  type ConfigurableTableColumn
} from "../app/components/workspace/ConfigurableTableColumns";
import type { TableColumnPreferences } from "../app/hooks/uiPreferencesStorage";

const columns: ConfigurableTableColumn[] = [
  { id: "name", label: "Name", hideable: false },
  { id: "technicalId", label: "Technical ID" },
  { id: "manufacturerReference", label: "Mfr Ref" }
];

function Harness({
  initialPreferences = {}
}: {
  initialPreferences?: TableColumnPreferences;
}): ReactElement {
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [tableColumnPreferences, setTableColumnPreferences] = useState<TableColumnPreferences>(initialPreferences);

  return (
    <>
      <ConfigurableTableColumnsControl
        tableId="connectors"
        tableRef={tableRef}
        columns={columns}
        tableColumnPreferences={tableColumnPreferences}
        setTableColumnPreferences={setTableColumnPreferences}
      />
      <table ref={tableRef}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Technical ID</th>
            <th>Mfr Ref</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Connector A</td>
            <td>C-A</td>
            <td>REF-A</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

function getVisibleHeaderLabels(): string[] {
  return screen.getAllByRole("columnheader").map((header) => header.textContent?.trim() ?? "");
}

describe("ConfigurableTableColumnsControl", () => {
  it("hides only hideable columns and keeps the identifier column visible", async () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Columns ▾" }));
    const menu = screen.getByRole("menu");

    expect(within(menu).queryByLabelText("Name")).not.toBeInTheDocument();
    fireEvent.click(within(menu).getByLabelText("Mfr Ref"));

    await waitFor(() => {
      expect(screen.queryByRole("columnheader", { name: "Mfr Ref" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Connector A" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "REF-A" })).not.toBeInTheDocument();
  });

  it("restores hidden columns at their saved position", async () => {
    render(<Harness initialPreferences={{ connectors: { order: ["manufacturerReference", "name", "technicalId"], hidden: ["manufacturerReference"] } }} />);

    expect(getVisibleHeaderLabels()).toEqual(["Name", "Technical ID"]);

    fireEvent.click(screen.getByRole("button", { name: "Columns ▾" }));
    fireEvent.click(within(screen.getByRole("menu")).getByLabelText("Mfr Ref"));

    await waitFor(() => {
      expect(getVisibleHeaderLabels()).toEqual(["Mfr Ref", "Name", "Technical ID"]);
    });
  });

  it("reorders headers and body cells by dragging a column header", async () => {
    render(<Harness />);

    const draggedHeader = screen.getByRole("columnheader", { name: "Technical ID" });
    const targetHeader = screen.getByRole("columnheader", { name: "Name" });
    const transfer = new Map<string, string>();
    const dataTransfer = {
      setData: (format: string, value: string) => transfer.set(format, value),
      getData: (format: string) => transfer.get(format) ?? "",
      setDragImage: () => undefined
    };

    fireEvent.dragStart(draggedHeader, { dataTransfer });
    fireEvent.drop(targetHeader, { dataTransfer });

    await waitFor(() => {
      expect(getVisibleHeaderLabels()).toEqual(["Technical ID", "Name", "Mfr Ref"]);
    });
    expect(screen.getAllByRole("cell").map((cell) => cell.textContent?.trim() ?? "")).toEqual(["C-A", "Connector A", "REF-A"]);
  });
});
