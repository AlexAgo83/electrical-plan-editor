## item_620_network_summary_2d_single_pdf_export - Network Summary 2D Single PDF Export

> From version: 1.14.0
> Schema version: 1.0
> Status: Done
> Understanding: 82%
> Confidence: 80%
> Progress: 100%
> Complexity: Medium
> Theme: Export / Documentation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Operators can export Network Summary 2D plans as SVG/PNG, but they also need a PDF export that carries the same visual plan output for sharing and documentation. The PDF should behave like the current visual export, not a separate print-layout editor.

# Scope
- In:
  - Add a PDF export option to the Network Summary 2D export menu.
  - Generate a free-size PDF page from the rendered Network Summary 2D export dimensions.
  - Preserve existing background, frame, and cartouche options where applicable.
  - Preserve current SVG/PNG behavior.
  - Use a browser-side/offline-compatible implementation.
  - Add loading/error feedback for PDF generation.
  - Add focused tests for option availability and export failure handling.
- Out:
  - Functional schematic PDF export.
  - Grouped/multi-page PDF export, covered by `item_621`.
  - External image import.
  - Server-side export.
  - PDF/A compliance or a print-layout editor.

```mermaid
%% logics-kind: backlog
%% logics-signature: backlog|network-summary-2d-single-pdf-export|req-137-pdf-export-for-2d-plans-and-grou|operators-can-export-network-summary-2d|ac1-the-network-summary-2d-export
flowchart LR
    ExportMenu[Network Summary export menu] --> PDFOption[PDF option]
    PDFOption --> Render[Render existing 2D export]
    Render --> FreeSizePDF[Free-size PDF page]
    FreeSizePDF --> Download[Download PDF]
```

# Acceptance criteria
- AC1: The Network Summary 2D export menu exposes a PDF export option.
- AC2: A single exported PDF contains the same rendered plan content as the corresponding PNG/SVG export.
- AC3: PDF export preserves aspect ratio and does not crop by default.
- AC4: PDF page size can be large/free-size and is not forced into A4/A3.
- AC5: Existing export background, frame, and cartouche options apply where enabled.
- AC6: PDF generation shows loading feedback and exits cleanly on failure.
- AC7: Existing SVG and PNG export behavior remains unchanged.
- AC8: Automated tests cover option availability, filename extension, and failure handling at the available abstraction level.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1.
- request-AC2 -> This backlog slice. Proof: AC2, AC3.
- request-AC3 -> This backlog slice. Proof: AC5.
- request-AC4 -> This backlog slice. Proof: AC6.
- request-AC8 -> This backlog slice. Proof: browser-side implementation scope.
- request-AC9 -> This backlog slice. Proof: AC7.
- request-AC10 -> This backlog slice. Proof: AC8.

# Decision framing
- Product framing: Request-level framing is sufficient.
- Product signals: PDF is another packaging format for the existing Network Summary 2D export.
- Architecture framing: Consider dependency and bundle-size impact before choosing a PDF library.
- Architecture follow-up: No ADR expected unless PDF generation introduces a major export abstraction.

# Links
- Product brief(s): (none)
- Architecture decision(s): (none)
- Request: `logics/request/req_137_pdf_export_for_2d_plans_and_grouped_image_pdf_export.md`
- Primary task(s): `logics/tasks/task_129_network_summary_2d_single_pdf_export.md`

# AI Context
- Summary: Add a single free-size PDF export option for the current Network Summary 2D plan using the existing SVG/PNG visual export pipeline.
- Keywords: backlog-groom, PDF export, Network Summary 2D, free-size PDF, cartouche, frame, PNG, SVG
- Use when: Implementing or reviewing single-plan PDF export.
- Skip when: Work targets grouped PDF export, functional schematics, BOM, CSV, or wire color UX.

# Priority
- Impact: Medium; improves documentation and sharing.
- Urgency: Medium; requested as a near-term export convenience.

# Notes
- Source request: `req_137_pdf_export_for_2d_plans_and_grouped_image_pdf_export`.

# Tasks
- `logics/tasks/task_129_network_summary_2d_single_pdf_export.md`
