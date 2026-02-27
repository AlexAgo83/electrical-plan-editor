## req_078_update_app_button_breathing_glow_and_timestamped_save_filename - update app button breathing glow and timestamped save filename
> From version: 0.9.16
> Understanding: 100% (animation, timestamped filenames, and lazy-loading behavior are implemented with locked V1 contracts)
> Confidence: 99% (delivery is validated by targeted tests and full UI lane execution)

# Needs
- The `Update app` header action should use a smooth breathing glow and should not blink.
- Save/export files should include a timestamp in the filename so multiple exports are distinguishable and traceable.
- It would be interesting to add lazy loading for Home changelog entries: load additional changelogs only when the user scrolls (infinite scroll style).

# Context
- Existing update-ready visual behavior was introduced in `req_073`.
- Existing save/export keyboard and action workflow was updated in `req_076`.
- Current network JSON export filenames are static by scope (`active`, `selected`, `all`) and can overwrite or be hard to distinguish in downloads.

# Objective
- Replace blinking behavior of the `Update app` action with a breathing glow animation that remains attention-grabbing but visually stable.
- Add deterministic timestamp suffixes to save/export filenames while preserving existing payload format/content.
- Improve Home changelog feed loading behavior by progressively rendering/loading additional entries on scroll.

# Default decisions (V1)
- Animation policy:
  - No blink/flicker steps.
  - Use continuous breathing glow (opacity/box-shadow pulse) with smooth easing.
  - Respect reduced-motion preference with a static non-animated highlighted state.
- Timestamp policy for save/export filename:
  - Include local-export timestamp in filename.
  - Use a filesystem-safe format (no `:` or `.`), e.g. `YYYY-MM-DDTHH-mm-ss-SSSZ`.
  - Keep current scope prefix semantics (`active`, `selected`, `all`) and append timestamp.
- Home changelog lazy-loading policy:
  - initial batch size: `4` changelog entries.
  - incremental batch size: `+4` entries.
  - loading trigger: `IntersectionObserver` on a bottom sentinel inside the changelog panel (avoid raw scroll-event coupling).

# Functional scope
## A. Update app button animation behavior
- Update styling/animation of the `Update app` action to breathing glow.
- Remove any blinking behavior from this action.
- Keep existing visibility/trigger conditions for update availability unchanged.

## B. Timestamped save/export filenames
- Apply timestamp suffix to network export/save filenames.
- Keep exported JSON payload schema and content unchanged.
- Keep current export status messages and action flow behavior.

## C. Accessibility and UX safety
- Ensure breathing effect remains legible in light/dark themes.
- Add reduced-motion fallback to avoid forced animation for motion-sensitive users.

## D. Home changelog lazy loading on scroll (interesting enhancement)
- Add progressive loading for Home changelog entries.
- Keep initial render lightweight by showing only the first chunk of changelog cards.
- Load/render next chunks when the user scrolls near the end of the changelog panel (infinite-scroll behavior).
- Preserve current changelog ordering and content rendering semantics.
- Use the locked V1 policy (`4` initial + `4` per near-end trigger via sentinel observer).

# Non-functional requirements
- No regression in PWA update workflow behavior.
- No regression in Ctrl/Cmd+S save/export flow behavior.
- No changes to import compatibility or exported JSON schema versioning.
- Home screen should stay responsive with many changelog files.

# Validation and regression safety
- Add/update tests to verify:
  - update action uses breathing glow class/contract and does not use blink class/contract.
  - reduced-motion fallback applies non-animated highlight mode.
  - exported save filenames include timestamp and remain scope-distinct.
  - existing save/export action paths still work for active/selected/all scopes.
  - Home changelog feed initially renders a limited batch and loads next batches on scroll.
- Run:
  - `npm run -s lint`
  - `npm run -s typecheck`
  - `npm run -s test -- src/tests/pwa.header-actions.spec.tsx`
  - `npm run -s test -- src/tests/app.ui.settings.spec.tsx`
  - `npm run -s test:ci:ui`

# Acceptance criteria
- AC1: `Update app` action no longer blinks.
- AC2: `Update app` action displays a breathing glow when update is available.
- AC3: Reduced-motion environments do not receive forced breathing animation and keep an accessible highlighted state.
- AC4: Save/export filenames include a timestamp suffix.
- AC5: Filename timestamp format is filesystem-safe and deterministic.
- AC6: Export payload content/schema remains unchanged.
- AC7: Home changelog feed supports lazy loading on scroll (infinite-scroll style) while preserving entry order.
- AC7a: lazy-loading batch contract is deterministic (`4` initial, `+4` incremental, sentinel-based near-end trigger).

# Out of scope
- Redesign of other header button animations.
- Changing save/export payload structure.
- Server-side save history features.

# Delivery status
- Status: delivered.
- Task: `logics/tasks/task_071_super_orchestration_delivery_execution_for_req_077_and_req_078_with_validation_gates.md`.

# References
- `logics/request/req_073_pwa_update_ready_button_glow_when_available.md`
- `logics/request/req_076_ctrl_cmd_s_override_to_export_active_plan.md`
- `src/app/hooks/useWorkspaceShellChrome.ts`
- `src/app/hooks/useNetworkImportExport.ts`
- `src/app/AppController.tsx`
- `src/app/components/workspace/HomeWorkspaceContent.tsx`
- `src/app/lib/changelogFeed.ts`
- `src/tests/pwa.header-actions.spec.tsx`
- `src/tests/app.ui.settings.spec.tsx`
- `src/tests/app.ui.home.spec.tsx`

# Backlog
- `logics/backlog/item_405_update_app_button_breathing_glow_motion_policy_and_theme_safety.md` (done)
- `logics/backlog/item_406_timestamped_network_export_filename_contract_scope_preservation.md` (done)
- `logics/backlog/item_407_home_changelog_feed_progressive_lazy_loading_on_scroll.md` (done)
- `logics/backlog/item_408_req_078_update_glow_export_filename_and_changelog_lazy_loading_closure_validation_and_traceability.md` (done)
