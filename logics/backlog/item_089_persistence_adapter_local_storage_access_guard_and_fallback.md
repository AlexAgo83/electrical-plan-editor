## item_089_persistence_adapter_local_storage_access_guard_and_fallback - Persistence Adapter `localStorage` Access Guard and Fallback
> From version: 0.5.0
> Understanding: 99%
> Confidence: 98%
> Progress: 0%
> Complexity: Medium
> Theme: Runtime Boot Resilience
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The default persistence adapter assumes `window.localStorage` access is always safe, but in some browser/privacy/security contexts the access itself can throw and crash the app boot path.

# Scope
- In:
  - Guard default `localStorage` access in persistence adapter with `try/catch`.
  - Return a deterministic non-crashing fallback (`null` storage) when access throws.
  - Preserve current load/save function signatures and behavior when storage is available.
  - Keep corruption/migration fallback behavior unchanged.
- Out:
  - New persistence backend introduction.
  - UI error banners for storage availability issues.

# Acceptance criteria
- Default persistence path does not crash when `window.localStorage` access throws.
- `loadState()` continues with deterministic fallback behavior when storage is unavailable.
- `saveState()` no-ops safely when storage is unavailable.
- Existing persistence tests remain green.

# Priority
- Impact: Very high (boot/runtime crash prevention).
- Urgency: High (reliability hardening).

# Notes
- Blocks: item_093.
- Related AC: AC1, AC7.
- References:
  - `logics/request/req_015_runtime_robustness_persistence_empty_workspace_semantics_and_ci_release_safety.md`
  - `src/adapters/persistence/localStorage.ts`
  - `src/tests/persistence.localStorage.spec.ts`

