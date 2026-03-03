## item_491_network_metadata_model_extension_author_project_code_logo_url_export_notes - Network metadata model extension for author, project code, logo URL, and export notes
> From version: 1.3.0
> Status: Draft
> Understanding: 96%
> Confidence: 92%
> Progress: 0%
> Complexity: Medium
> Theme: Data model / Export
> Reminder: Update status/understanding/confidence/progress and linked task references when you edit this doc.

# Problem
Export cartouche requirements need network-scoped identity metadata that does not currently exist in the network model.  
Without explicit fields and constraints, the export feature cannot be implemented reliably or migrated safely.

# Scope
- In:
  - extend network metadata contract with `author`, `projectCode`, `logoUrl`, and `exportNotes`;
  - define deterministic field constraints:
    - `author` <= 80 chars,
    - `projectCode` <= 40 chars,
    - `logoUrl` <= 2048 chars,
    - `exportNotes` <= 2000 chars;
  - keep backward compatibility for existing networks with defaults;
  - ensure action/reducer typing alignment for metadata updates.
- Out:
  - UI form layout details in `Network Scope`;
  - export rendering logic (frame/cartouche drawing).

# Acceptance criteria
- AC1: Network model/types include the 4 metadata fields with deterministic defaults.
- AC2: Metadata constraints are normalized/enforced consistently.
- AC3: Existing networks without metadata load safely and receive defaults.
- AC4: Store action/reducer contracts remain type-safe and backward-compatible.

# AC Traceability
- AC1 -> Model extension contract is explicit and stable.
- AC2 -> Field-length constraints prevent layout/data drift.
- AC3 -> Legacy compatibility is preserved.
- AC4 -> Store contract remains coherent for downstream UI/export work.

# Priority
- Impact: High (foundational prerequisite for req_102).
- Urgency: High (blocks all export cartouche features).

# Notes
- Derived from `logics/request/req_102_export_frame_and_network_identity_cartouche_for_svg_png.md`.
- Orchestrated by `logics/tasks/task_078_req_102_export_frame_and_network_identity_cartouche_for_svg_png_orchestration_and_delivery_control.md`.
