## prod_016_shared_connector_way_multi_wire_crimp - Shared connector way (multi-wire crimp)
> Date: 2026-07-12
> Status: Settled
> Related request: `req_165_shared_connector_way_multi_wire_crimp_with_opt_in_overload_checkbox`
> Related backlog: `item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability`
> Related task: `task_161_orchestrate_shared_connector_way_multi_wire_crimp`
> Related architecture: (none yet)
> Reminder: Update status, linked refs, scope, decisions, success signals, and open questions when you edit this doc.

# Overview
Opt-in overload of a connector way so 2+ wire endpoints can share one terminal, gated by a per-endpoint checkbox, with shared-way indicators across views and exports.

# Goals
- Model the real-world practice of crimping several wires into one terminal.
- Keep exclusivity the safe default; overload is an explicit per-endpoint choice on the incoming wire only.
- Make shared ways visible everywhere occupancy is shown (physical view, analysis panel, stats, validation, exports).

# Non-goals
- No limit enforcement on occupants per way.
- No seal/terminal compatibility warnings for shared ways.
- No change to splice port occupancy semantics.
- No change to manual cavity reservation (connector/occupyCavity stays exclusive).

# Scope and guardrails
- In: scaffolded request, product, backlog, orchestration task, validation, and handoff context.
- Out: unrelated workflow docs and implementation of generated tasks.

# Key product decisions
- Use structured input as the source of truth for generated docs.
- Keep generated write paths local and repo-bounded.

# Success signals
- Generated docs pass lint and audit without broad manual rewrites.
- Context-pack output can be handed to an implementation agent directly.

# References
- Product back-reference: `item_665_core_model_array_occupancy_allowsharedcavity_flag_migration_and_portability`
- Task back-reference: `task_161_orchestrate_shared_connector_way_multi_wire_crimp`
