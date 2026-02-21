## item_042_sample_network_recreate_and_reset_user_actions - Sample Network Recreate and Reset User Actions
> From version: 0.1.0
> Understanding: 98%
> Confidence: 95%
> Progress: 100%
> Complexity: Medium
> Theme: UX Control
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
Users need explicit controls to restore demo context when sample data was changed or deleted, without affecting their own networks.

# Scope
- In:
  - Add UI actions to recreate sample network when missing.
  - Add UI action to reset sample network to baseline fixture.
  - Scope actions strictly to sample network lifecycle.
  - Provide confirmations/feedback for destructive reset behavior.
- Out:
  - Full onboarding tutorial flow.
  - Multi-template sample catalog.

# Acceptance criteria
- Users can recreate sample network on demand.
- Users can reset sample network to baseline deterministically.
- Reset/recreate actions do not modify non-sample networks.
- UI feedback clearly communicates operation result.

# Priority
- Impact: High (operability and onboarding support).
- Urgency: High after safe bootstrap baseline.

# Notes
- Dependencies: item_015, item_040, item_041.
- Blocks: item_044.
- Related AC: AC4.
- References:
  - `logics/request/req_007_bootstrap_with_comprehensive_sample_network.md`
  - `src/app/App.tsx`
  - `src/store/actions.ts`
  - `src/store/reducer.ts`

