import type { ReactElement } from "react";
import type { ValidationIssue, ValidationSeverityFilter } from "../../types/app-controller";

interface ValidationWorkspaceContentProps {
  validationSeverityFilter: ValidationSeverityFilter;
  setValidationSeverityFilter: (value: ValidationSeverityFilter) => void;
  validationIssuesForSeverityCounts: ValidationIssue[];
  validationSeverityCountByLevel: Record<"error" | "warning", number>;
  validationCategoryFilter: string;
  setValidationCategoryFilter: (value: string) => void;
  validationIssuesForCategoryCounts: ValidationIssue[];
  validationCategories: string[];
  validationCategoryCountByName: Map<string, number>;
  moveVisibleValidationIssueCursor: (direction: 1 | -1) => void;
  visibleValidationIssues: ValidationIssue[];
  clearValidationFilters: () => void;
  validationIssues: ValidationIssue[];
  groupedValidationIssues: Array<[string, ValidationIssue[]]>;
  findValidationIssueIndex: (issueId: string) => number;
  validationIssueCursor: number;
  handleValidationIssueRowGoTo: (issue: ValidationIssue) => void;
  validationErrorCount: number;
  validationWarningCount: number;
}

export function ValidationWorkspaceContent({
  validationSeverityFilter,
  setValidationSeverityFilter,
  validationIssuesForSeverityCounts,
  validationSeverityCountByLevel,
  validationCategoryFilter,
  setValidationCategoryFilter,
  validationIssuesForCategoryCounts,
  validationCategories,
  validationCategoryCountByName,
  moveVisibleValidationIssueCursor,
  visibleValidationIssues,
  clearValidationFilters,
  validationIssues,
  groupedValidationIssues,
  findValidationIssueIndex,
  validationIssueCursor,
  handleValidationIssueRowGoTo,
  validationErrorCount,
  validationWarningCount
}: ValidationWorkspaceContentProps): ReactElement {
  return (
    <section className="panel-grid">
      <section className="panel">
        <h2>Validation center</h2>
        <div className="validation-toolbar">
          <span>Issue filters</span>
          <div className="chip-group" role="group" aria-label="Validation severity filter">
            {([
              ["all", "All severities"],
              ["error", "Errors"],
              ["warning", "Warnings"]
            ] as const).map(([severity, label]) => {
              const severityCount =
                severity === "all" ? validationIssuesForSeverityCounts.length : validationSeverityCountByLevel[severity];
              return (
                <button
                  key={severity}
                  type="button"
                  className={validationSeverityFilter === severity ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setValidationSeverityFilter(severity)}
                  disabled={severityCount === 0 && validationSeverityFilter !== severity}
                >
                  <span>{label}</span>
                  <span className="filter-chip-count" aria-hidden="true">({severityCount})</span>
                </button>
              );
            })}
          </div>
          <div className="chip-group" role="group" aria-label="Validation category filter">
            <button
              type="button"
              className={validationCategoryFilter === "all" ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setValidationCategoryFilter("all")}
            >
              <span>All</span>
              <span className="filter-chip-count" aria-hidden="true">({validationIssuesForCategoryCounts.length})</span>
            </button>
            {validationCategories.map((category) => {
              const categoryCount = validationCategoryCountByName.get(category) ?? 0;
              return (
                <button
                  key={category}
                  type="button"
                  className={validationCategoryFilter === category ? "filter-chip is-active" : "filter-chip"}
                  onClick={() => setValidationCategoryFilter(category)}
                  disabled={categoryCount === 0 && validationCategoryFilter !== category}
                >
                  <span>{category}</span>
                  <span className="filter-chip-count" aria-hidden="true">({categoryCount})</span>
                </button>
              );
            })}
          </div>
          <div className="row-actions compact">
            <button type="button" onClick={() => moveVisibleValidationIssueCursor(-1)} disabled={visibleValidationIssues.length === 0}>
              Previous issue
            </button>
            <button type="button" onClick={() => moveVisibleValidationIssueCursor(1)} disabled={visibleValidationIssues.length === 0}>
              Next issue
            </button>
            <button type="button" onClick={clearValidationFilters}>Clear filters</button>
          </div>
        </div>
        {validationIssues.length === 0 ? (
          <p className="empty-copy">No integrity issue found in the current model.</p>
        ) : visibleValidationIssues.length === 0 ? (
          <p className="empty-copy">No integrity issue matches the current filters.</p>
        ) : (
          <div className="validation-groups">
            {groupedValidationIssues.map(([category, issues]) => (
              <article key={category} className="validation-group">
                <h3>{category}</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Issue</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className={findValidationIssueIndex(issue.id) === validationIssueCursor ? "is-selected" : undefined}
                      >
                        <td>
                          <span className={issue.severity === "error" ? "status-chip is-error" : "status-chip is-warning"}>
                            {issue.severity.toUpperCase()}
                          </span>
                        </td>
                        <td>{issue.message}</td>
                        <td>
                          <button type="button" onClick={() => handleValidationIssueRowGoTo(issue)}>
                            Go to
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Validation summary</h2>
        <div className="summary-grid">
          <article>
            <h3>Total issues</h3>
            <p>{validationIssues.length}</p>
          </article>
          <article>
            <h3>Errors</h3>
            <p>{validationErrorCount}</p>
          </article>
          <article>
            <h3>Warnings</h3>
            <p>{validationWarningCount}</p>
          </article>
          <article>
            <h3>Visible</h3>
            <p>{visibleValidationIssues.length}</p>
          </article>
        </div>
        <p className="meta-line validation-active-filter">
          Active filters: {validationSeverityFilter === "all" ? "All severities" : validationSeverityFilter === "error" ? "Errors" : "Warnings"} / {" "}
          {validationCategoryFilter === "all" ? "All categories" : validationCategoryFilter}
        </p>
      </section>
    </section>
  );
}
