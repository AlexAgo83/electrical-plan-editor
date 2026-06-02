# Network Import Conflict Resolution Release Brief

## Objective

Make network import predictable and never silent: every collision must surface an explicit overwrite choice to the user, and every failure must surface a temporary feedback popup that explains why.

The release closes a regression where importing a network that collides with an existing one bypasses the overwrite dialog and either silently renames the imported network or silently drops it, forcing the user to delete the target network manually before re-importing.

## User Problem

A user imports a network whose identity collides with one already present in the workspace. Today, three different paths can fire silently or with insufficient information:

- The imported network shares the same `id` but the `name` and `technicalId` no longer match (for example because the user renamed the existing network after exporting it). The overwrite dialog never opens, the importer renames the incoming `id` with an `-import` suffix and inserts a duplicate side by side. The user reads "Networks imported" and only discovers the duplicate later in the network list.
- The imported network shares the same `technicalId` or `name` and the dialog does open, but the reducer can still reject silently in some edge paths (empty name/technicalId after normalization, partial payload), and the only signal is a generic aggregated warning in the toast summary.
- The import fails for an environment reason (file unreadable, parse error, schema unsupported) before any state change. Today the failure dialog is correct, but the toast and dialog are not consistent across every failure branch, and the user can be left looking at a closed file dialog with no surfaced reason.

The current workaround is to delete the target network first, then re-import. This is destructive, breaks references, and is not acceptable for everyday import workflows.

## Scope

- Extend conflict detection so that **any** identity overlap between the imported payload and the existing workspace triggers the overwrite dialog. In addition to today's `technicalId`, `name`, and `nameVariant` matching, raw `id` collisions must also produce a candidate.
- Make the overwrite dialog the single decision point for collisions. When the user opens the dialog, every imported network that matches an existing one by `id`, `technicalId`, `name`, or `nameVariant` must be listed with the match reason visible, and the user must be able to choose **Overwrite the existing network** or **Skip this import** per candidate.
- When the user chooses overwrite, the existing network is fully replaced by the incoming network (state, metadata, harness assembly membership), preserving the existing network's `id` so that intra-workspace references survive the replacement.
- When the user chooses skip, the candidate is not imported and no silent rename is performed. The import summary lists the skipped candidate with the original reason.
- Remove the silent `-import` / `-IMP` rename behavior from the default path. Renaming with a suffix is only kept as an explicit user choice (a third option in the dialog: **Keep both — rename incoming**), available for every match reason (`id`, `technicalId`, `name`, `nameVariant`), so the user always knows when a rename has happened.
- The overwrite dialog exposes a bulk shortcut row above the per-candidate list: **Apply to all remaining — Overwrite / Skip / Keep both**. Selecting a bulk action sets the choice for every candidate that has not yet been explicitly resolved by the user; per-candidate choices made afterwards override the bulk default.
- Guarantee that every terminal import outcome surfaces a temporary toast popup with a clear reason, in addition to the existing failure dialog where applicable. The required outcomes are:
  - file read error → toast `error` with the read failure message
  - parse / schema error → toast `error` with the parse error message
  - unsupported future schema version → toast `error` with the version mismatch message
  - resolved-zero (all candidates skipped or rejected) → toast `error` with the first explanatory reason
  - partial import (some imported, some skipped or warned) → toast `warning` with `{imported}/{skipped}/{warnings}/{errors}` summary
  - clean success → toast `success` with the count of imported networks
  - reducer-level rejection of one or more entries (currently silent) → toast `warning` with the rejected count **and** `ImportFailureDialog` opened with the full per-network rejection list (copyable, persistent until dismissed)
  - user-cancelled overwrite dialog → toast `info` "Import cancelled", workspace untouched
- Reducer-level rejection paths (`network/importMany`) must propagate their per-network reasons back to the controller hook so the toast and the failure dialog can surface them, instead of the reducer dropping the entry without trace.
- Toast popups are temporary (auto-dismiss) and use the existing `ToastViewport` infrastructure. The `ImportFailureDialog` remains in place for terminal failures that need a longer-lived, copyable explanation.

## Out Of Scope

- Persistence schema migrations or changes to the network file `schemaVersion`.
- Bulk multi-file import or import from URL / cloud storage.
- Conflict resolution at a level finer than the network (per-connector or per-wire merge).
- Changes to harness assembly import beyond what is required to follow the network-level overwrite decision.
- Changes to the AI Agent workspace.
- Release version bump, changelog, or Logics workflow updates.

## Acceptance Criteria

- Importing a file whose payload contains a network with the same `id` as an existing network opens the overwrite dialog with that network listed and `matchReason` set to `id`.
- Importing a file whose payload contains a network with the same `technicalId` (case-insensitive, trimmed) as an existing network opens the overwrite dialog with `matchReason` set to `technicalId`.
- Importing a file whose payload contains a network with the same `name` (case-insensitive, trimmed) as an existing network opens the overwrite dialog with `matchReason` set to `name`.
- Importing a file whose payload contains a network whose `name` or `technicalId` matches an existing one after stripping the `-imp\d*` / `-IMP\d*` suffix opens the dialog with `matchReason` set to `nameVariant`.
- The overwrite dialog offers three explicit choices per candidate: **Overwrite existing**, **Skip**, **Keep both (rename incoming)**, available for every match reason. The default highlighted choice is **Overwrite existing**.
- The overwrite dialog exposes a bulk row **Apply to all remaining** with the same three actions. A bulk action assigns its choice to every candidate that has not yet been resolved individually; subsequent per-candidate clicks override the bulk default.
- Choosing **Overwrite existing** replaces the existing network by the incoming network using the existing network's `id`. Intra-workspace references to that `id` keep resolving after import.
- Choosing **Skip** leaves the existing network untouched and does not insert the incoming network. The import summary lists it under `skippedNetworkIds`.
- Choosing **Keep both (rename incoming)** inserts the incoming network with an `-import` / `-IMP` suffix and lists the rename in the import summary warnings. No suffix rename happens automatically without this explicit choice.
- If the import resolves to zero accepted networks, an `error` toast appears with the first explanatory reason, and the `ImportFailureDialog` opens with the full list of reasons.
- If the import is partial, a `warning` toast appears with the `{imported}/{skipped}/{warnings}/{errors}` summary.
- If the import is fully successful, a `success` toast appears with the count of imported networks.
- If the reducer rejects one or more networks at the dispatch step (`empty name or technical ID`, `payload is incomplete`, `ID already exists` despite overwrite, `technical ID already exists` despite overwrite), a `warning` toast announces the rejected count **and** the `ImportFailureDialog` opens with the full per-network rejection list including network identity and reducer-side reason. No rejection is silent.
- Cancelling the overwrite dialog leaves the workspace state unchanged, clears the file input, and surfaces a neutral `info` toast "Import cancelled".
- Existing E2E and unit coverage for import is updated to reflect the new dialog options, the new `id` match reason, and the new toast contract.

## Resolved Decisions

- **Keep both (rename incoming)** is available for every match reason (`id`, `technicalId`, `name`, `nameVariant`).
- The overwrite dialog includes a bulk **Apply to all remaining** row with the same three actions; per-candidate clicks override the bulk default.
- Cancelling the overwrite dialog emits an `info` toast "Import cancelled".
- Reducer-level rejections raise a `warning` toast AND open the full `ImportFailureDialog` with the per-network reason list.
