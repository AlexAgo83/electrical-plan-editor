## task_100_flatten_bom_export_into_a_single_plane - Flatten BOM Export Into a Single Plane
> From version: 1.4.4
> Schema version: 1.0
> Status: Ready
> Understanding: 95%
> Confidence: 86%
> Progress: 0%
> Complexity: High
> Theme: Export
> Non-semantic edit: linked adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Derived from backlog item `item_586_flatten_bom_export_into_a_single_plane`.
- Source file: `logics\backlog\item_586_flatten_bom_export_into_a_single_plane.md`.
- Related request(s): `req_119_bom_and_catalog_export_enhancements`.
The current BOM output uses a separate wire termination block. The export needs one flat BOM structure so connectors, seals, and connection references are represented with the same column layout.

```mermaid
%% logics-kind: task
%% logics-signature: task|flatten-bom-export-into-a-single-plane|item-586-flatten-bom-export-into-a-singl|1-confirm-scope-dependencies-and-linked|run-the-relevant-automated-tests-for
stateDiagram-v2
    state "item_586_flatten_bom_export_into_a_single_" as Backlog
    state "1. Confirm scope dependencies and linked" as Scope
    state "2. Implement the next coherent delivery" as Build
    state "3. Checkpoint the wave in a" as Verify
    state "Run the relevant automated tests for" as Validation
    state "Done report" as Report
    [*] --> Backlog
    Backlog --> Scope
    Scope --> Build
    Build --> Verify
    Verify --> Validation
    Validation --> Report
    Report --> [*]
```

# Plan
- [ ] 1. Inspect the current BOM row builder and isolate the wire termination block logic.
- [ ] 2. Replace the split structure with a single normalized BOM row model.
- [ ] 3. Keep ordering deterministic so the unified export is readable and stable.
- [ ] 4. Update any callers or tests that still expect the old separate termination section.
- [ ] 5. Validate the export output and update linked Logics docs before closing the wave.

# Delivery checkpoints
- Each completed wave should leave the repository in a coherent, commit-ready state.
- Update the linked Logics docs during the wave that changes the behavior, not only at final closure.
- Prefer a reviewed commit checkpoint at the end of each meaningful wave instead of accumulating several undocumented partial states.
- If the shared AI runtime is active and healthy, use `python logics/skills/logics.py flow assist commit-all` to prepare the commit checkpoint for each meaningful step, item, or wave.
- Do not mark a wave or step complete until the relevant automated tests and quality checks have been run successfully.

# AC Traceability
- AC1 -> Scope: BOM export uses one common row structure for connector, seal, and connection reference data.. Proof: capture validation evidence in this doc.
- AC2 -> Scope: The old separate wire termination section no longer appears in the exported BOM.. Proof: capture validation evidence in this doc.
- AC3 -> Scope: The unified export keeps a stable and readable row order.. Proof: capture validation evidence in this doc.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Required
- Architecture signals: data model and persistence, contracts and integration
- Architecture follow-up: Create or link an architecture decision before irreversible implementation work starts.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): `adr_005_bom_and_export_contracts_for_csv_xlsx_and_reference_naming`
- Backlog item: `item_586_flatten_bom_export_into_a_single_plane`
- Request(s): `req_119_bom_and_catalog_export_enhancements`

# AI Context
- Summary: The current BOM output uses a separate wire termination block. The export needs one flat BOM structure so...
- Keywords: flatten, bom, export, single, plane, the, current, output
- Use when: Use when executing the current implementation wave for Flatten BOM Export Into a Single Plane.
- Skip when: Skip when the work belongs to another backlog item or a different execution wave.
# References
- `logics/skills/logics-ui-steering/SKILL.md`

# Validation
- `npm run lint`
- `npm run typecheck`
- `npm run test:ci:fast`
- `npm run build`
- Confirm the exported BOM now contains one unified structure and no longer emits a separate wire termination section.

# Definition of Done (DoD)
- [ ] Scope implemented and acceptance criteria covered.
- [ ] Validation commands executed and results captured.
- [ ] No wave or step was closed before the relevant automated tests and quality checks passed.
- [ ] Linked request/backlog/task docs updated during completed waves and at closure.
- [ ] Each completed wave left a commit-ready checkpoint or an explicit exception is documented.
- [ ] Status is `Done` and progress is `100%`.

# Report
