## req_107_post_release_ci_csv_persistence_and_export_test_signal_hardening - Post-release CI, CSV, persistence, and export test-signal hardening
> From version: 1.4.0
> Status: Done
> Understanding: 100% (implemented and validated against the shared blocking CI path)
> Confidence: 98%
> Complexity: High
> Theme: Reliability / Security / CI
> Reminder: Update status/understanding/confidence and references when you edit this doc.

# Needs
- Local pre-push validation currently allows changes to pass `ci:local` while still failing the real GitHub CI workflow.
- CSV export hardening currently neutralizes formula-like cells only when the dangerous character is the very first character, leaving whitespace/control-character prefixed cases under-protected.
- Persistence write failures are currently silent, so users can continue working while local saves fail without visible warning.
- Export/callout measurement paths generate heavy `HTMLCanvasElement.getContext` noise in jsdom-based tests, reducing CI signal quality and masking real regressions.

# Context
- The `v1.4.0` release line passed full local validation repeatedly but still failed GitHub CI because blocking `logics` workflow gates were not part of `ci:local`.
- Post-release review confirmed the drift concretely:
  - GitHub Actions runs `logics_flow sync close-eligible-requests`, `workflow_audit`, and Logics kit Python tests before the JS quality gates;
  - local `ci:local` currently skips those steps.
- CSV downloads already defend against basic spreadsheet formula injection, but the current implementation only guards strings starting directly with `=`, `+`, `-`, or `@`.
- Persistence currently swallows storage write failures to keep reducer flow deterministic, but this means users get no runtime signal when local saves stop succeeding.
- Export/cartouche and callout measurement fallback paths rely on canvas text measurement in environments where jsdom does not fully implement canvas APIs, creating noisy non-blocking logs during otherwise successful CI runs.

# Objective
- Make local validation meaningfully representative of the blocking GitHub CI path.
- Harden CSV export neutralization against realistic spreadsheet-injection bypasses using leading whitespace/control characters.
- Surface persistence write failures through a controlled user-visible runtime signal instead of silent data-loss risk.
- Reduce export/callout measurement noise in tests so CI logs preserve high diagnostic value.

# Scope
- In:
  - align `ci:local` with the blocking GitHub CI gates, or extract a shared single-source validation command used by both local and CI paths;
  - harden CSV cell neutralization for dangerous spreadsheet formulas with leading whitespace/control characters;
  - add runtime persistence failure reporting for storage write failures without crashing the app;
  - reduce or eliminate jsdom `canvas.getContext` warning noise in export/callout measurement tests through deterministic fallback strategy and/or test-environment handling;
  - add targeted regression coverage for all four areas.
- Out:
  - redesign of the full GitHub Actions workflow;
  - server-side persistence or cloud sync;
  - broad export visual redesign unrelated to measurement/test-signal hardening;
  - generalized security hardening beyond CSV export behavior.

# Locked execution decisions
- Decision 1: Local validation must cover the same blocking gates as GitHub CI for the project’s normal developer workflow.
- Decision 2: This alignment should be achieved by shared orchestration where feasible, not by maintaining two drifting command lists indefinitely.
- Decision 3: CSV neutralization must treat strings with leading spaces, tabs, or equivalent control padding before `=`, `+`, `-`, or `@` as dangerous.
- Decision 4: Hardening must preserve current numeric export behavior and existing quoting/escaping semantics.
- Decision 5: Persistence write failures must produce a non-blocking but visible runtime error signal for the user.
- Decision 6: Persistence failure reporting must not break reducer determinism or crash the app when storage is unavailable.
- Decision 7: Export/callout measurement logic must keep deterministic rendering behavior while avoiding repeated noisy test logs in unsupported jsdom canvas environments.
- Decision 8: Test-signal hardening may use explicit feature detection, measurement abstraction, or targeted environment guards, but not by weakening export assertions.

# Recommended implementation by review point
## Point 1 - CI contract alignment
- Introduce a shared validation entry point for the full blocking pipeline used by both:
  - local pre-push / release verification,
  - GitHub Actions blocking CI path.
- Ensure the shared path includes:
  - `logics_lint`,
  - `logics_flow sync close-eligible-requests`,
  - `workflow_audit` blocking mode,
  - Logics kit Python tests,
  - JS lint/type/tests/build/PWA gates.
- Keep informational/non-blocking CI steps separate if needed.

## Point 2 - CSV neutralization hardening
- Normalize formula-risk detection to inspect leading whitespace/control-prefixed strings safely before export.
- Keep existing apostrophe-prefix neutralization approach unless a stronger project-wide CSV policy is adopted.
- Add explicit coverage for examples such as:
  - `" =SUM(A1:A2)"`
  - `"\t@cmd"`
  - `"\r-10+20"`
- Preserve plain numeric cells and normal text cells unchanged.

## Point 3 - Persistence failure visibility
- Add a controlled error-reporting path for failed storage writes.
- Expected behavior:
  - save failure does not throw,
  - app keeps working in-memory,
  - user receives visible feedback that persistence is currently failing,
  - repeated identical failures should avoid infinite noisy spam if possible.
- Prefer reusing the existing app error surface (`lastError` or equivalent runtime feedback channel) instead of inventing a parallel system.

## Point 4 - Export/callout measurement signal hardening
- Centralize unsupported-canvas fallback for measurement helpers used by:
  - export cartouche text measurement,
  - callout layout text measurement.
- In jsdom/unsupported environments:
  - fail over deterministically to non-canvas measurement or conservative width heuristics,
  - avoid repeated unhandled/not-implemented noise.
- Keep browser/runtime export behavior unchanged where canvas text measurement is available.

# Functional behavior contract
## A. CI/local parity
- Running the project’s canonical local CI command must exercise the same blocking gates as GitHub CI.
- A change that fails GitHub blocking CI should also fail the canonical local validation path before push/release.

## B. CSV export safety
- Spreadsheet-dangerous string cells are neutralized even when prefixed by leading whitespace/control characters.
- Standard numeric values remain numeric in exported CSV content.
- Existing CSV quoting and UTF-8 BOM behavior remain non-regressed.

## C. Persistence failure runtime behavior
- If local storage writes fail, the app does not crash.
- The current session continues in memory.
- The user receives a clear visible warning/error that persistence is failing.
- When persistence resumes working, the app can continue saving normally.

## D. Export/callout measurement behavior
- Export/cartouche and callout measurement remain deterministic in the browser.
- Test environments without usable canvas text measurement do not flood logs with repeated not-implemented noise.
- Export assertions remain meaningful and are not watered down to hide the problem.

# Acceptance criteria
- AC1: The canonical local CI command includes the same blocking `logics` gates as GitHub CI.
- AC2: GitHub CI and local CI orchestration no longer drift silently on blocking validation steps.
- AC3: CSV export neutralizes formula-like strings when dangerous characters are preceded by whitespace/control characters.
- AC4: Numeric values and normal text values remain non-regressed in CSV export output.
- AC5: Regression tests cover whitespace/control-prefixed dangerous CSV inputs.
- AC6: Persistence write failures surface a visible runtime error/warning without crashing the app.
- AC7: Persistence failure reporting is covered by tests and does not break reducer/store determinism.
- AC8: Export/cartouche and callout measurement paths no longer emit repeated jsdom canvas not-implemented noise during normal successful tests.
- AC9: Export/callout fallback behavior remains deterministic and covered by targeted tests.
- AC10: `logics_lint`, blocking `workflow_audit`, and the canonical local CI command pass after implementation.

# Validation and regression safety
- `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
- `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
- canonical local CI command after alignment
- targeted checks around:
  - local/remote blocking CI parity;
  - CSV export neutralization with leading whitespace/control characters;
  - persistence write-failure runtime feedback;
  - export/cartouche and callout measurement behavior in jsdom-like unsupported canvas environments.

# Definition of Ready (DoR)
- [x] Review findings are translated into explicit product/engineering problems.
- [x] Scope boundaries are explicit.
- [x] Acceptance criteria are testable.
- [x] Risks and tradeoffs are identified.

# Delivery closure
- Implemented through `task_086_req_107_post_release_ci_csv_persistence_and_export_test_signal_hardening_orchestration_and_delivery_control`.
- Delivered safeguards:
  - shared `ci:blocking` orchestration between local and GitHub blocking CI;
  - CSV dangerous-formula neutralization with leading whitespace/control-character hardening;
  - visible persistence write-failure feedback with automatic recovery clearing;
  - shared unsupported-canvas text-measurement fallback used by export/cartouche/callout paths.
- Validation executed at closure:
  - `python3 logics/skills/logics-doc-linter/scripts/logics_lint.py`
  - `python3 logics/skills/logics-flow-manager/scripts/workflow_audit.py --legacy-cutoff-version 1.1.0 --group-by-doc --skip-ac-traceability`
  - `npm test -- --run src/tests/csv.export.spec.ts src/tests/store.create-store.spec.ts src/tests/app.ui.persistence-feedback.spec.tsx src/tests/app.ui.network-summary-bom-export.spec.tsx src/tests/app.ui.network-summary-workflow-polish.spec.tsx`
  - `npm run -s test:ci:segmentation:check`
  - `npm run -s quality:ui-modularization`
  - `npm run -s ci:blocking`

# Risks
- Over-aligning local CI with remote CI can slow the default developer loop if there is no distinction between quick-check and release-check workflows.
- CSV hardening changes can surprise downstream consumers if text values begin gaining apostrophe prefixes in more cases.
- Persistence-failure feedback can become noisy if repeated save attempts are surfaced without deduplication strategy.
- Measurement fallback refactors can accidentally alter export/callout layout if browser/runtime and test-runtime paths diverge too much.

# Backlog
- To create from this request:
  - `item_525_local_and_github_blocking_ci_command_parity_and_shared_orchestration.md`
  - `item_526_csv_formula_neutralization_hardening_for_whitespace_and_control_prefixed_inputs.md`
  - `item_527_persistence_write_failure_runtime_feedback_without_reducer_instability.md`
  - `item_528_export_and_callout_measurement_fallback_signal_hardening_for_jsdom_canvas_gaps.md`
  - `item_529_req_107_validation_matrix_and_traceability_closure.md`

# Orchestration task
- `logics/tasks/task_086_req_107_post_release_ci_csv_persistence_and_export_test_signal_hardening_orchestration_and_delivery_control.md`

# References
- `package.json`
- `.github/workflows/ci.yml`
- `src/app/lib/csv.ts`
- `src/tests/csv.export.spec.ts`
- `src/app/store.ts`
- `src/adapters/persistence/localStorage.ts`
- `src/app/components/network-summary/export/networkSummaryExport.ts`
- `src/app/components/network-summary/callouts/calloutLayout.ts`
- `src/tests/app.ui.network-summary-bom-export.spec.tsx`
- `src/tests/persistence.localStorage.spec.ts`
