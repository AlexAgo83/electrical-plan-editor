# Changelog (`1.14.0 -> 1.14.1`)

## Major Highlights

- Fixed harness assembly functional schematic filtering so unselected main connector boundaries stop traversal.
- Added regression coverage for selected master connector trace scoping.

## Patch Notes

- Fixed the harness assembly functional schematic so selected master connectors no longer leak unrelated connected branches through unselected main connectors.
- Added regression coverage for the assembly graph boundary case so the filtered trace stays aligned with the operator-selected roots.

## Version 1.14.1 - Harness Assembly Functional Trace Scope Boundaries

### Fixes

- `src/core/functionalSchematic.ts` now treats unselected `isMainHarnessConnector` boundaries as traversal stops for the assembly graph, preventing unrelated downstream corridors from appearing in the filtered trace.
- `src/tests/core.functional-schematic.spec.ts` adds a regression for the unselected-master leakage case.

### Verification

- `npm run -s lint`
- `npm run -s typecheck`
- `npx vitest run src/tests/core.functional-schematic.spec.ts`
