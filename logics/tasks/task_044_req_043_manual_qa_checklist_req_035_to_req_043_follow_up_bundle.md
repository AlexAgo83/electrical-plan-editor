## task_044_req_043_manual_qa_checklist_req_035_to_req_043_follow_up_bundle - Manual QA Checklist for req_035 to req_043 Follow-up Bundle
> From version: 0.8.1
> Understanding: 99%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: Manual QA Checklist and Execution Notes for Baseline + Follow-up Bundle

# Purpose
Provide an explicit manual QA checklist for the delivered `req_035` through `req_043` bundle and record execution notes for `task_044` closure.

# Manual QA Checklist
- [ ] Onboarding auto-open on first launch, dismiss, and persisted opt-out behavior.
- [ ] Home `Help` relaunch opens the full onboarding flow from step 1.
- [ ] Contextual onboarding help buttons open the expected single-step help in `Network Scope`, `Connectors`, `Splices`, `Nodes`, `Segments`, and `Wires`.
- [ ] Onboarding step badges/icons use feature icons (or documented fallback) and `Next`/`Finish` matches primary button look.
- [ ] Shared `Connectors / Splices` onboarding step shows both `Open Connectors` and `Open Splices` and navigates/scrolls correctly.
- [ ] Contextual onboarding launched from `Splices` scrolls/focuses the `Splices` panel (best-effort parity).
- [ ] Node ID rename updates connected segments/selection/route-preview continuity without graph breakage.
- [ ] Wire occupancy hint and next-free prefill work in create mode; edit mode excludes current wire slot from false positives.
- [ ] Wire section default prefills create form from Settings and legacy wires remain compatible.
- [ ] Wire colors support optional no-color, mono-color, and duplicate bi-color normalization (`primary == secondary -> mono`).
- [ ] Connector/Splice manufacturer reference supports create/edit/clear and trims empty values.
- [ ] Wire endpoint connection/seal references support create/edit/clear and survive endpoint type changes non-destructively.
- [ ] Edit-form `Save` restores focus to the edited row in modeling table-backed forms.
- [ ] Connector/Splice auto-create linked-node checkboxes work in create flows and respect the shared Settings default preset.
- [ ] `Wires` panel keeps `Help` aligned on the same row as route filter chips / CSV action.
- [ ] `Network Scope` panel exposes `Export` under `Duplicate` and exports the active/selected network as intended.
- [ ] Filter bars (`Filter` + selector + full-width input) work on `Wires`, `Network Scope`, `Connectors`, `Splices`, `Nodes`, and `Segments`.
- [ ] Wire table / inspector surfaces section + color (`No color` fallback) and inspector surfaces manufacturer and endpoint refs.

# Execution notes
- Automated validation gates were executed during `task_044` waves and in the final closure gate (see `task_044` report for command-level snapshots and commit checkpoints).
- Manual QA checklist authored as part of `req_043` closure. If a dedicated manual QA run is performed after merge/release, record pass/fail notes in this file or link the execution report from `task_044`.

# References
- `logics/request/req_043_post_req_035_to_req_042_phase_2_rollout_optional_metadata_surfacing_test_hardening_and_delivery_closure.md`
- `logics/tasks/task_044_req_043_follow_up_phase_2_rollout_onboarding_polish_metadata_surfacing_test_hardening_and_doc_sync_orchestration.md`
