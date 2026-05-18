# Harness Assembly usage report - 2026-05-13

## Scope

This report explains the current `Harness Assembly` behavior in the app, with focus on:

- what an assembly is used for;
- what changes when the active network changes;
- what changes when harness/network checkboxes are checked or unchecked;
- which behaviors may feel strange from an operator point of view.

Code anchors:

- Data model: `src/core/entities.ts`
- Assembly form: `src/app/components/network-summary/HarnessAssemblyManagerPanel.tsx`
- Assembly graph selection: `src/app/hooks/controller/useAppControllerNetworkSummaryPanelDomain.tsx`
- Cross-harness graph derivation: `src/core/functionalSchematic.ts`
- Reducer checks: `src/store/reducer/harnessAssemblyReducer.ts`

## Mental model

The implementation treats a `Network` as one harness. A `HarnessAssembly` is a global object above networks, not data stored inside one network.

An assembly stores:

- `members`: the checked networks/harnesses plus their display color;
- `masterConnectorRefs`: the selected trace roots, by network and connector;
- `connectorLinks`: physical interconnector links between connectors from different member networks.

The assembly does not create new wires. It derives a read-only functional schematic from existing wires, connectors, splices, member colors, master connector roots, and interconnector links.

## Where Harness Assembly appears

The top-level `Harness Assembly` workspace reuses the network-summary functional schematic area. It renders only when there is an active network. If no network is active, the assembly workspace content is `null`.

In that workspace, there are two separate concepts on the same screen:

- the manager panel, where the operator can select/edit/create an assembly;
- the functional schematic panel, which chooses its graph from the current active network context.

This is the main source of possible confusion: selecting an assembly in the manager dropdown does not directly choose the graph displayed below.

## How the active network changes behavior

The active graph selection is:

1. If there is no active network, no assembly functional panel is rendered.
2. If the active network belongs to at least one saved assembly, the first saved assembly containing that active network becomes the active assembly.
3. If the active network belongs to no saved assembly, the panel falls back to the normal single-network functional schematic.

Important details:

- The active network is a context selector for the assembly.
- Once an assembly is selected by active network membership, the graph is built from all saved member networks of that assembly.
- The active network does not limit the graph to itself.
- If the active network belongs to multiple assemblies, the first one in persisted `allIds` wins. There is no explicit "active assembly for graph" state.
- The title changes from `Functional schematic` to `Harness assembly functional schematic` only when an active assembly is found through active network membership.

Expected outcomes by active network:

| Active network state | Displayed graph |
| --- | --- |
| No active network | No Harness Assembly content |
| Active network not in any assembly | Single-network functional schematic for that network |
| Active network in one assembly | Cross-harness functional schematic for that assembly |
| Active network in multiple assemblies | Cross-harness schematic for the first matching saved assembly |

## How checked and unchecked harnesses behave

The checkboxes in the manager panel control `memberNetworkIds`, but they are form draft state until `Save assembly` is clicked.

Before save:

- checking a harness does not affect the graph;
- unchecking a harness does not affect the graph;
- root connector and link lists are updated in the form draft only.

After save:

- checked networks become persisted assembly members;
- unchecked networks are removed from members;
- master connector roots are kept only for still-checked members;
- interconnector links are kept only when both endpoints remain in checked members;
- member colors become the trace colors used on edges for that harness.

This means a harness can be checked and still not appear visually in the graph if no included trace reaches it. A checked member only becomes visible when its wires are included by root selection, same-network connectivity, domain filter, or an interconnector path.

Expected outcomes by checkbox state:

| Checkbox state | Saved? | Effect |
| --- | --- | --- |
| Checked | No | Draft only, graph unchanged |
| Unchecked | No | Draft only, graph unchanged |
| Checked | Yes | Network becomes an assembly member and can be used in roots/links/trace |
| Unchecked | Yes | Network is removed from the assembly and related roots/links are pruned |

If the active network is unchecked from the assembly and saved, that active network no longer matches the assembly. The functional panel can then fall back to the single-network schematic, even though the manager panel may still be showing/editing an assembly.

## Master connectors

Only connectors marked `isMainHarnessConnector === true` are offered in the `Master connectors` checklist.

Graph roots are resolved as follows:

1. If the saved assembly has explicit `masterConnectorRefs`, those are used.
2. If the saved assembly has no explicit roots, the graph falls back to all `isMainHarnessConnector` connectors in all member networks.
3. The graph starts from wires attached to the selected/root connector cavities.
4. If no wire is attached to the selected roots, the graph shows a warning: no wire could be resolved from the selected harness assembly master connector selection.

This can feel strange when a harness is checked but has no visible trace. The likely causes are:

- no master connector is checked and fallback roots are not connected to wires;
- the checked harness is only connected through an interconnector pin that is not reached from the roots;
- the current functional filter hides the reachable wires;
- the interconnector link uses a connector/cavity that has no matching wire endpoint.

## Interconnector links

Interconnector links are physical-only links between connectors from different member networks.

Current behavior:

- the UI only allows source and target networks to be different;
- source and target connector options come from selected member networks;
- pin mapping is symmetric: pin 1 to pin 1, pin 2 to pin 2, etc.;
- if the connectors have different cavity counts, only the shared pin range is traced;
- in the functional graph, linked connector pins collapse into one interconnector node.

Because the linked pins collapse into an interconnector node, the original connector endpoint nodes may disappear from the graph. This is expected in the current design, but it can look surprising if the operator expects to see both connector blocks plus a link between them.

The traversal also stops at terminal connectors. If an endpoint is marked `isTerminalConnector`, the trace does not continue through interconnector expansion from that endpoint.

## Difference between manager selection and graph selection

The manager dropdown has local state named `selectedAssemblyId`. It controls which assembly is being edited.

The graph uses `activeHarnessAssembly`, which is computed independently from `activeNetworkId`.

Practical consequence:

- You can select assembly B in the dropdown for editing while the graph still displays assembly A, if the active network belongs to assembly A.
- Saving assembly B can change stored data, but the graph may still show assembly A until the active network changes or until the active network becomes a member of B.
- If you create a new assembly in the panel, it will not drive the graph until saved and until the active network is a member of it.

This is probably the most confusing current behavior.

## Validation and warnings

There are two validation levels:

- the reducer blocks empty name/technical ID, duplicate assembly technical ID, unknown member networks, duplicate member networks, and invalid member colors;
- core validation can detect missing networks, missing connectors, self-links, duplicate connector participation, and mismatched pin counts.

However, from the current code scan, the core `validateHarnessAssembly` helper is covered by tests but does not appear to be wired into the app validation center. The functional graph itself still emits display warnings for missing interconnector endpoints or missing master-root trace wires.

Practical consequence:

- some assembly problems may appear only as graph warnings;
- some deeper assembly validation issues may not show in the main validation workspace yet;
- stale connector links after connector deletion may result in missing endpoint warnings rather than a guided repair workflow.

## Import and export behavior

Network file export includes harness assemblies only when at least one exported network is a member.

During export:

- assemblies are filtered to exported networks;
- members not in the export set are removed;
- master connector refs outside the export set are removed;
- connector links are kept only if both endpoint networks are exported.

During import:

- assembly member network IDs are remapped to imported network IDs;
- assemblies with no imported members are skipped with a warning;
- links whose endpoint networks were not imported are dropped.

This can explain differences after partial export/import: an assembly may survive but with fewer members, fewer roots, and fewer connector links.

## Behaviors that are likely to feel strange

1. Dropdown selection does not select the displayed graph.

The graph is selected by active network membership, not by the manager dropdown. This is likely the biggest UX mismatch.

2. Checkbox changes do nothing until save.

The checkboxes are a form draft. This is normal for persistence, but the screen does not strongly separate "draft assembly" from "displayed assembly graph".

3. A checked harness may not appear in the trace.

Membership makes the harness available. It does not force all wires to render. Wires must be reachable from roots and pass the active functional filter.

4. Active network can change the displayed assembly unexpectedly.

Opening an interconnector endpoint switches active network. If that target network belongs to a different first-matching assembly, the displayed assembly can change.

5. Multiple assemblies containing the same network are ambiguous.

The first persisted matching assembly wins. There is no conflict warning or explicit chooser for the graph.

6. Assembly export metadata still leans on the active network.

The functional panel receives the active network for export metadata and fallback labels. In an assembly context, this may produce export titles/cartouche data that feel network-centric rather than assembly-centric.

7. Validation coverage is uneven in the UI.

The core validation helper exists, but app-level validation wiring appears incomplete for assembly-specific issues.

## Operator checklist for debugging a strange assembly trace

Use this order:

1. Confirm the active network is a member of the assembly you expect to display.
2. Confirm the graph title says `Harness assembly functional schematic`.
3. Confirm the selected assembly in the dropdown is the same assembly that contains the active network.
4. Save after changing member checkboxes.
5. Check that at least one master connector is selected, or that member networks have connectors marked as main harness connectors for fallback roots.
6. Check that root connector cavities actually have wire endpoints.
7. Check that interconnector links use connectors from checked member networks.
8. Check that the linked connector pins have matching cavity indexes and attached wires.
9. Check the active functional filter; try `All`.
10. If a network is in multiple assemblies, expect the first saved matching assembly to win until the UI gets an explicit graph assembly selector.

## Recommended follow-up fixes

High value:

- Add an explicit `Displayed assembly` selector/state for the graph instead of deriving it only from active network.
- Add a visible badge showing which saved assembly currently drives the graph.
- Show an "unsaved changes" state in the manager when checkbox/root/link edits differ from the persisted assembly.
- Wire `validateHarnessAssembly` into the validation workspace.
- Warn when a network belongs to multiple assemblies and active-network selection becomes ambiguous.

Medium value:

- Use assembly metadata for assembly schematic export title/cartouche instead of active network metadata.
- Make checked-but-not-visible harnesses explain why no wires are included.
- Add a repair action for stale connector links after connector deletion.
- Show root fallback behavior explicitly when no master connectors are checked.

## Bottom line

The current implementation is coherent as a derived read-only assembly trace, but the UI mixes two selection models:

- the form dropdown selects the assembly being edited;
- the active network selects the assembly being displayed.

That split explains most of the surprising behavior. A more explicit displayed-assembly selector and better validation/warnings would make the feature much easier to reason about.
