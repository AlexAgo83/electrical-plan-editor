## item_399_app_release_version_single_source_of_truth_from_package_json - App release version single source of truth from package.json
> From version: 0.9.16
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Low-Medium
> Theme: Release metadata consistency across UI and persistence/export
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
`APP_RELEASE_VERSION` drift from `package.json` version creates metadata inconsistency in persisted/exported data and UI version reporting.

# Scope
- In:
  - Derive app release version metadata from `package.json` as the single source of truth.
  - Remove or neutralize duplicate manual version sources that can drift.
  - Keep current version rendering and persistence/export contracts intact.
- Out:
  - Release automation pipeline redesign.
  - New semantic-versioning policies.

# Acceptance criteria
- Persisted/exported `appVersion` always matches `package.json` version.
- Version source duplication no longer allows drift.
- Regression coverage validates version sync contract.

# Priority
- Impact: High.
- Urgency: High.

# Notes
- Dependencies: `req_077`.
- Blocks: `item_404`.
- Related AC: AC2.
- References:
  - `logics/request/req_077_review_followups_persistence_version_sync_import_normalization_and_export_hardening.md`
  - `package.json`
  - `src/adapters/persistence/localStorage.ts`
  - `src/adapters/portability/networkFile.ts`

