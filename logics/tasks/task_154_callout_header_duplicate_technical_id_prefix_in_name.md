## task_154_callout_header_duplicate_technical_id_prefix_in_name - Callout header duplicates the technical ID prefix carried by the entity name
> From version: 1.17.0
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 92
> Progress: 100%
> Complexity: Low
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.

# Backlog
- `item_645_callout_header_duplicate_technical_id_prefix_in_name`

# Acceptance criteria
- AC1: A splice named `AV-EP-01 Epissure Masse` with technicalId `AV-EP-01` renders header `EP-01 · Epissure Masse` (prefix shown once, label only).
- AC2: A name that starts with the stripped ID (e.g. `EP-01 Epissure Masse`) also yields `EP-01 · Epissure Masse`.
- AC3: A name with no embedded ID (e.g. `Epissure Masse`) is unchanged: `EP-01 · Epissure Masse`.
- AC4: The same de-duplication applies to connector callouts.
- AC5: If the name equals exactly the ID (raw or stripped), only the stripped ID is shown (no trailing ` · `), and a name that would become empty after stripping is left intact.
- AC6: No table cell / row content changes; only the callout title is affected.

# Implementation notes
- Extend the callout header display path to strip a leading technical-ID token from the free-form name before composing the title.
  - Target helper: `buildCalloutHeaderDisplay` (`src/app/components/network-summary/callouts/calloutLayout.ts:210`).
  - The helper currently receives only the formatted (prefix-stripped) ID. To match names that embed the *raw* ID (e.g. `AV-EP-01`), pass the raw technicalId (or both raw + formatted) from the call sites:
    - splice: `src/app/components/network-summary/callouts/calloutModel.ts:402`
    - connector: `src/app/components/network-summary/callouts/calloutModel.ts:342`
- De-dup rule: if `trimmedName` starts with the raw OR the formatted technical ID followed by a separator (` `, `·`, `-`, `:`, `_`) or end-of-string, remove that leading token plus the separator and use the remainder as the label. If the remainder is empty, keep the original name. Comparison is case-sensitive on the canonical ID; trim whitespace around the resulting label.
- Keep the existing title composition (`${formattedId} · ${label}`) and the equal-ID short-circuit (just the ID, no ` · `).
- Pure display change only — do not mutate stored `name`.

# Validation
- Add/extend unit tests covering raw-prefixed, stripped-prefixed, clean, and equal-to-ID names (alongside `src/tests/network-summary-callout-prefix.spec.ts` or a dedicated `buildCalloutHeaderDisplay` spec).
- Run the project's typecheck + unit test suite (e.g. `npm run test` / the repo's lint+test gates).
- Run `python3 -m logics_manager lint --require-status`.
- Run `python3 -m logics_manager flow finish task task_154_callout_header_duplicate_technical_id_prefix_in_name.md` after implementation (if the `flow` subcommand is available; otherwise close manually and update linked docs).

# Report
- Implemented on 2026-06-29.
- `buildCalloutHeaderDisplay` now takes an optional third `rawTechnicalId` arg and strips a leading technical-ID token (raw `AV-EP-01` or stripped `EP-01` form) from the free-form name before composing the title (`src/app/components/network-summary/callouts/calloutLayout.ts:210`). Added private helper `stripLeadingTechnicalIdFromName` with conservative separator-bounded matching (` `, tab, `·`, `-`, `:`, `_`).
- Both call sites pass the raw technical ID: connector `src/app/components/network-summary/callouts/calloutModel.ts:342`, splice `:402`.
- Added unit spec `src/tests/callout-header-display.spec.ts` (11 cases covering AC1–AC6 + backward compatibility + the `EP-010` non-truncation guard).
- Validation: `tsc --noEmit` clean; `eslint` clean on changed files; `vitest run` green (16 tests across the new spec + existing `network-summary-callout-prefix.spec.ts`).
- Pure display change — stored entity `name` is not mutated; table-row content is untouched.
- Linked backlog item: `item_645_callout_header_duplicate_technical_id_prefix_in_name`
- Related request: `req_159_callout_header_duplicate_technical_id_prefix_in_name`

# AI Context
- Summary: Implement callout-header technical-ID prefix de-duplication so a name beginning with its own (raw) technical ID is not repeated after the stripped ID in the title.
- Keywords: task, callout-header, technical-id, prefix-dedup, splice, connector, network-summary
- Use when: You need a bounded implementation task for the callout-header prefix de-dup backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_159_callout_header_duplicate_technical_id_prefix_in_name`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
