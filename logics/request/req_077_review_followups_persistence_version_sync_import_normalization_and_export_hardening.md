## req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening - review followups persistence version sync import normalization and export hardening
> From version: 0.9.16
> Understanding: 99% (timestamp-normalization contract is now explicitly defined with deterministic fallback rules)
> Confidence: 97% (implementation ambiguity is reduced by locking import-time normalization policy)

# Needs
- A global technical review identified several reliability and safety follow-ups across persistence and import/export flows.
- Product decisions are now confirmed:
  - `APP_RELEASE_VERSION` must be synchronized with `package.json` version (single source of truth behavior).
  - malformed network timestamps in imported JSON must be normalized/fixed (not rejected as a strict hard error).
- The follow-up should close all review findings in one coherent hardening pass, including regression coverage.

# Confirmed decisions
- Decision 1: synchronize app release version metadata from `package.json` (remove drift risk between UI version and persisted/exported metadata).
- Decision 2: on network file import, normalize/fix invalid network timestamps to safe ISO values rather than rejecting the full import payload.
- Decision 3: timestamp normalization policy is deterministic:
  - capture one `importBaseIso` at import start,
  - if only one timestamp is invalid, copy the valid counterpart,
  - if both are invalid, set both to `importBaseIso`,
  - if both are valid but `updatedAt < createdAt`, set `updatedAt = createdAt`.

# Context
- Review findings to address:
  - persistence load fallback robustness issue when storage access throws during read.
  - release metadata drift: `APP_RELEASE_VERSION` differs from `package.json`.
  - network import currently accepts malformed network timestamps without normalization.
  - persistence save path re-reads/parses stored payload on each write to recover `createdAtIso` (avoidable overhead).
  - CSV export lacks spreadsheet formula-injection neutralization.
  - JSON export revokes object URL immediately after click, which is fragile on some browser timings.
- Existing architecture already has strong test coverage; this request should preserve behavior while hardening edge cases.

# Objective
- Deliver a targeted hardening bundle that:
  - removes known crash/consistency hazards,
  - aligns version metadata contracts,
  - normalizes imported malformed timestamps safely,
  - improves export safety and browser robustness,
  - preserves existing UX and file formats unless explicitly noted.

# Functional scope
## A. Persistence load robustness (high priority)
- Ensure `loadState` never throws when storage read APIs throw unexpectedly.
- Keep current fallback policy: preserve backup when possible, then bootstrap safe state with clear error messaging.

## B. Release version single source of truth (high priority)
- Synchronize persisted/exported `appVersion` with `package.json` version.
- Avoid manual version duplication drift between app UI/version badge and persistence/export metadata.

## C. Import timestamp normalization (high priority)
- Detect malformed `network.createdAt` / `network.updatedAt` during import parsing/conflict resolution.
- Normalize to valid deterministic ISO values (or safe fallback strategy) without rejecting otherwise valid payloads.
- Emit import warning diagnostics when normalization is applied.
- Apply the locked normalization contract:
  - single import-level baseline timestamp (`importBaseIso`) for deterministic fallback,
  - counterpart copy strategy when only one field is invalid,
  - monotonic fix to prevent `updatedAt` being earlier than `createdAt`.

## D. Persistence save-path efficiency (medium priority)
- Remove avoidable full payload parse on every `saveState` just to recover `createdAtIso`.
- Keep `createdAtIso` stable across updates.

## E. CSV export formula-injection hardening (medium priority)
- Neutralize cells starting with formula-trigger prefixes (`=`, `+`, `-`, `@`) in CSV export.
- Keep exported content readable and backward-compatible for normal text/number values.

## F. JSON export download robustness (low-medium priority)
- Make object URL revoke timing safe (defer revoke after click) to avoid intermittent download failures.

# Non-functional requirements
- No regressions in current import/export schema compatibility.
- No regressions in existing keyboard shortcuts, network workflows, or history behavior.
- Maintain deterministic export output ordering/content where already expected.

# Validation and regression safety
- Add/update targeted tests for each hardening point:
  - persistence load fallback when storage read throws.
  - version metadata synchronization contract.
  - malformed imported network timestamp normalization behavior + warning emission.
  - persistence createdAt preservation without repeated parse dependency.
  - CSV formula-injection neutralization.
  - JSON download flow stability with deferred object URL revoke.
- Run validation matrix:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test:ci:segmentation:check`
  - `npm run -s test:ci:fast -- --coverage`
  - `npm run -s test:ci:ui`

# Acceptance criteria
- AC1: persistence load path no longer throws when storage read access throws; safe fallback still applies.
- AC2: persisted/exported `appVersion` is synchronized with `package.json` version and no longer drifts.
- AC3: imported malformed network timestamps are normalized/fixed automatically; import succeeds with explicit warning(s).
- AC3a: normalized timestamps follow the deterministic contract (`importBaseIso`, counterpart copy, and `updatedAt >= createdAt` invariant).
- AC4: `saveState` preserves `createdAtIso` without requiring a full payload migration parse on each write.
- AC5: CSV export neutralizes formula-leading values to prevent spreadsheet formula execution.
- AC6: JSON export download remains reliable with safe URL revoke timing.
- AC7: all updated tests pass in CI-equivalent local validation.

# Out of scope
- Changing persistence or network-file schema major version for this hardening pass.
- Introducing cloud sync/back-end persistence.
- Broad refactors unrelated to identified review findings.

# References
- `src/adapters/persistence/localStorage.ts`
- `src/adapters/persistence/migrations.ts`
- `src/adapters/portability/networkFile.ts`
- `src/core/schema.ts`
- `src/app/lib/csv.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `package.json`
- `src/tests/persistence.localStorage.spec.ts`
- `src/tests/portability.network-file.spec.ts`
- `src/tests/csv.export.spec.ts`

# Backlog
- `logics/backlog/item_398_persistence_load_guard_when_storage_read_throws_and_safe_fallback_continuity.md`
- `logics/backlog/item_399_app_release_version_single_source_of_truth_from_package_json.md`
- `logics/backlog/item_400_network_import_timestamp_normalization_and_warning_diagnostics.md`
- `logics/backlog/item_401_persistence_save_state_created_at_stability_without_full_payload_reparse.md`
- `logics/backlog/item_402_csv_export_formula_injection_neutralization_contract.md`
- `logics/backlog/item_403_json_export_download_revoke_timing_hardening.md`
- `logics/backlog/item_404_req_077_hardening_bundle_closure_validation_and_traceability.md`
