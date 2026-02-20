## item_006_v1_network_and_synthesis_views - V1 Network and Synthesis Views
> From version: 0.1.0
> Understanding: 95%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Electrical CAD
> Reminder: Update Understanding/Confidence/Progress and dependencies/references when you edit this doc. When you update backlog indicators, review and update any linked tasks as well.

# Problem
The model is not usable without operator-facing views for navigation and verification. V1 requires network visualization and connector/splice synthesis tables reflecting real-time occupancy and lengths.

# Scope
- In:
  - Global network view with nodes, segments, and sub-network grouping.
  - Connector view with wire list, destination, source/destination cavities, length.
  - Splice view with wire list, used port, destination, length.
  - Wire selection highlight across full route path.
- Out:
  - Advanced diagram editing UX polish.
  - Export/report generation screens.

# Acceptance criteria
- Selecting a wire highlights the complete route in network view.
- Connector view reflects cavity occupancy in real time.
- Splice view reflects port occupancy in real time.
- Length values displayed in synthesis views match computed route lengths.

# Priority
- Impact: High (AC4, AC5, AC6 visibility layer).
- Urgency: High after wire lifecycle.

# Notes
- Dependencies: item_001, item_002, item_005.
- Related AC: AC4, AC5, AC6.
