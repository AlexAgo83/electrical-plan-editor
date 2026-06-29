## req_159_callout_header_duplicate_technical_id_prefix_in_name - Callout header duplicates the technical ID prefix carried by the entity name
> From version: 1.17.0
> Schema version: 1.0
> Status: Done
> Understanding: 95%
> Confidence: 92%
> Complexity: Low
> Theme: edition-plan
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- In the network-summary callouts, the splice/connector header must not repeat the technical ID prefix when the free-form entity name already starts with that ID.
- Today a splice named `AV-EP-01 Epissure Masse` with technicalId `AV-EP-01` renders the header `EP-01 · AV-EP-01 Epissure Masse` instead of the expected `EP-01 · Epissure Masse`.
- Goal: a clean, non-redundant callout title that shows the prefix-stripped ID once, followed by the human label only.

# Context
- Reported by Codex after inspecting an exported SVG. The only `AV-` occurrences in the callouts are the titles, never the table cells — confirming the leak comes from the title builder, not the rows.
- The header is built by `buildCalloutHeaderDisplay(name, formatEntityId(technicalId))`:
  - splice site: `src/app/components/network-summary/callouts/calloutModel.ts:402`
  - connector site: `src/app/components/network-summary/callouts/calloutModel.ts:342`
- `buildCalloutHeaderDisplay` (`src/app/components/network-summary/callouts/calloutLayout.ts:210`) concatenates `${technicalId} · ${name}` when both are present and differ. It receives the *formatted* (prefix-stripped) technicalId, but the raw `name`.
- The network entity prefix (e.g. `AV-`) is stripped from IDs by the injected `formatEntityId` (`FormatEntityId`), driven by the network entity-prefix display setting (see `src/core/networkEntityPrefix.ts`, `formatEntityIdForDisplay`). The free-form `name` is never passed through any cleanup, so when an operator names an entity with its own prefixed ID baked in, the prefixed ID survives into the title.
- Root cause: prefix masking is applied to `technicalId` only, not to `name`. The name may legitimately begin with the canonical (raw, un-stripped) technical ID followed by a separator and the human label.

# Decisions
- Clean the displayed name in the callout header when it begins with the canonical technical ID of the same entity, then show the prefix-stripped ID once + the remaining label.
- The de-duplication must compare against the *raw/canonical* technicalId (e.g. `AV-EP-01`), since that is what operators paste into the name — not just the already-stripped form. It should also tolerate the stripped form (e.g. `EP-01`) at the start of the name.
- Strip only a leading ID token followed by a separator (space, `·`, `-`, `:`, `_`) or end-of-string; never strip mid-string occurrences, and leave the name untouched if removing the prefix would empty it.
- Apply the same fix to both the splice and connector header call sites for consistency (`calloutModel.ts:342` and `:402`).
- Keep the behavior in the pure display layer (`buildCalloutHeaderDisplay` or a small helper it calls); no data-model mutation, the stored `name` is unchanged.

# Acceptance criteria
- AC1: A splice named `AV-EP-01 Epissure Masse` with technicalId `AV-EP-01` renders header `EP-01 · Epissure Masse` (prefix shown once, label only).
- AC2: A name that starts with the stripped ID (e.g. `EP-01 Epissure Masse`) also yields `EP-01 · Epissure Masse`.
- AC3: A name with no embedded ID (e.g. `Epissure Masse`) is unchanged: `EP-01 · Epissure Masse`.
- AC4: The same de-duplication applies to connector callouts.
- AC5: If the name equals exactly the ID (raw or stripped), only the stripped ID is shown (no trailing ` · `), and a name that would become empty after stripping is left intact.
- AC6: No table cell / row content changes; only the callout title is affected.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Scope
- In: de-duplicate the leading technical-ID prefix from the free-form name in the splice and connector callout headers; add unit coverage for `buildCalloutHeaderDisplay` (or its helper) covering raw-prefixed, stripped-prefixed, and clean names.
- Out: editing or normalizing stored entity names; changing the entity-prefix display setting; touching table-row rendering; any change outside the callout header display path.

# Risks / Open questions
- The de-dup must use the entity's *raw* technicalId (pre-`formatEntityId`) to match what operators embed in names; `buildCalloutHeaderDisplay` currently only receives the formatted ID. The call sites likely need to pass the raw technicalId (or a precomputed prefix list) so the helper can match both raw and stripped forms.
- Separator handling must be conservative: only strip a leading ID token bounded by a separator/end so legitimate names beginning with similar text are not truncated.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `src/app/components/network-summary/callouts/calloutLayout.ts:210` (`buildCalloutHeaderDisplay`)
- `src/app/components/network-summary/callouts/calloutModel.ts:342` (connector header call site)
- `src/app/components/network-summary/callouts/calloutModel.ts:402` (splice header call site)
- `src/core/networkEntityPrefix.ts:147` (`formatEntityIdForDisplay` / prefix stripping)
- `src/tests/network-summary-callout-prefix.spec.ts` (existing callout prefix coverage)

# AI Context
- Summary: Fix callout headers repeating the technical-ID prefix when the entity's free-form name already begins with its (raw) technical ID, so a splice named `AV-EP-01 Epissure Masse` shows `EP-01 · Epissure Masse` instead of `EP-01 · AV-EP-01 Epissure Masse`.
- Keywords: callout-header, technical-id, prefix-dedup, splice, connector, network-summary, edition-plan, buildCalloutHeaderDisplay
- Use when: working on callout title rendering or entity-prefix display in the network summary.
- Skip when: touching table-row content, stored-name normalization, or unrelated rendering.

# Backlog
- none
- `item_645_callout_header_duplicate_technical_id_prefix_in_name`
