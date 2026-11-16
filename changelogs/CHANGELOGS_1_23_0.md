# Changelog (`1.22.1 -> 1.23.0`)

Release date: 2026-11-16

## Major Highlights

- Network Scope plan revision buttons: +1 and -1 step through `OR/00`, `A/01`, `B/02` … `Z/26`, changing only the draft until Save network is pressed.
- Rejected edits now show an error notification with the refusal reason, including repeated attempts, without adding undo entries or showing a success notification.

## Patch Notes

- +1 starts an empty revision at `OR/00` and stops at `Z/26`. -1 steps back to `OR/00` and is disabled for an empty field or `OR/00`. Both buttons leave free text and mismatched letter/number pairs unchanged; manual editing stays available. Labels and sequence hints are available in English and French.
- Occupied connector ways and splice ports identify the endpoint and the wire already using it. A refused wire edit keeps the draft available for correction and retry, with stored wires and occupancy unchanged.
- Covered refusals: connector-way and splice-port reservation conflicts; out-of-range reservation or release indices; unknown connectors or splices; empty reservation references; connector, splice or node deletion blocked by dependencies; invalid connector data; invalid segment endpoints; unknown layout nodes; unknown wire routes; invalid network names; no active network; invalid or out-of-range stored wire endpoints; and exceptions thrown while applying an edit.
- A refused edit preserves earlier successful undo history. No-effect actions do not replay stale errors, and identical automatic background refusals remain idempotent.

## Maintenance

- Fix the dependency audit gate and preserve PWA bundle budgets.
