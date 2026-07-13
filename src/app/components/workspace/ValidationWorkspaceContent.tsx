import { translateCurrent as t } from "../../lib/i18n";
import { useMemo, useState, type ReactElement } from "react";
import { useIsMobileViewport } from "../../hooks/useIsMobileViewport";
import { getTableAriaSort } from "../../lib/accessibility";
import { sortByTableColumns } from "../../lib/app-utils-shared";
import { downloadCsvFile } from "../../lib/csv";
import type { ValidationIssue, ValidationSeverityFilter } from "../../types/app-controller";
import { TableEntryCountFooter } from "./TableEntryCountFooter";

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
  visibleValidationIssues: ValidationIssue[];
  validationIssues: ValidationIssue[];
  groupedValidationIssues: Array<[string, ValidationIssue[]]>;
  findValidationIssueIndex: (issueId: string) => number;
  validationIssueCursor: number;
  setValidationIssueCursorFromIssue: (issue: ValidationIssue) => void;
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
  visibleValidationIssues,
  validationIssues,
  groupedValidationIssues,
  findValidationIssueIndex,
  validationIssueCursor,
  setValidationIssueCursorFromIssue,
  handleValidationIssueRowGoTo,
  validationErrorCount,
  validationWarningCount
}: ValidationWorkspaceContentProps): ReactElement {
  type ValidationTableSortField = "severity" | "issue" | "actions";
  const isMobileViewport = useIsMobileViewport();
  const [validationTableSort, setValidationTableSort] = useState<{ field: ValidationTableSortField; direction: "asc" | "desc" }>({
    field: "severity",
    direction: "asc"
  });
  const sortedValidationGroups = useMemo(
    () =>
      groupedValidationIssues.map(([category, issues]) => [
        category,
        sortByTableColumns(
          issues,
          validationTableSort,
          (issue, field) => {
            if (field === "severity") return issue.severity;
            if (field === "issue") return issue.message;
            return `${issue.subScreen}:${issue.selectionKind}:${issue.selectionId}`;
          },
          (issue) => issue.id
        )
      ] as const),
    [groupedValidationIssues, validationTableSort]
  );
  const validationTableSortIndicator = (field: ValidationTableSortField) =>
    validationTableSort.field === field ? (validationTableSort.direction === "asc" ? "▲" : "▼") : "";
  const toggleValidationTableSort = (field: ValidationTableSortField) => {
    setValidationTableSort((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  return (
    <section className="panel-grid validation-panel-stack">
      <section className="panel validation-summary-panel">
        <h2>{t("ui.validationSummary")}</h2>
        <div className="summary-grid">
          <article>
            <h3>{t("ui.totalIssues2")}</h3>
            <p>{validationIssues.length}</p>
          </article>
          <article>
            <h3>{t("ui.errors2")}</h3>
            <p>{validationErrorCount}</p>
          </article>
          <article>
            <h3>{t("ui.warnings2")}</h3>
            <p>{validationWarningCount}</p>
          </article>
          <article>
            <h3>{t("ui.visible")}</h3>
            <p>{visibleValidationIssues.length}</p>
          </article>
        </div>
        <p className="meta-line validation-active-filter">
          
          {t("ui.activeFilters")} {validationSeverityFilter === "all" ? t("ui.allSeverities") : validationSeverityFilter === "error" ? t("ui.errors2") : t("ui.warnings2")} / {" "}
          {validationCategoryFilter === "all" ? t("ui.allCategories") : validationCategoryFilter}
        </p>
      </section>
      <section className="panel">
        <header className="validation-center-header">
          <h2>{t("ui.validationCenter")}</h2>
          <div className="validation-center-header-actions">
            <button
              type="button"
              className="filter-chip table-export-button"
              onClick={() =>
                downloadCsvFile(
                  "validation-issues",
                  [t("ui.category"), t("ui.severity"), t("ui.issue"), t("ui.screen"), t("ui.selectionKind"), t("ui.selectionID")],
                  visibleValidationIssues.map((issue) => [
                    issue.category,
                    issue.severity.toUpperCase(),
                    issue.message,
                    issue.subScreen,
                    issue.selectionKind,
                    issue.selectionId
                  ])
                )
              }
              disabled={visibleValidationIssues.length === 0}
            >
              <span className="table-export-icon" aria-hidden="true" />
              CSV
            </button>
          </div>
        </header>
        <div className="validation-toolbar">
          <span>{t("ui.issueFilters")}</span>
          <div className="chip-group" role="group" aria-label={t("ui.validationSeverityFilter")}>
            {([
              ["all", t("ui.allSeverities")],
              ["error", t("ui.errors2")],
              ["warning", t("ui.warnings2")]
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
          <div className="chip-group" role="group" aria-label={t("ui.validationCategoryFilter")}>
            <button
              type="button"
              className={validationCategoryFilter === "all" ? "filter-chip is-active" : "filter-chip"}
              onClick={() => setValidationCategoryFilter("all")}
            >
              <span>{t("ui.all")}</span>
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
        </div>
        {validationIssues.length === 0 ? (
          <p className="empty-copy">{t("ui.noIntegrityIssueFoundInTheCurrentModel")}</p>
        ) : visibleValidationIssues.length === 0 ? (
          <>
            <p className="empty-copy">{t("ui.noIntegrityIssueMatchesTheCurrentFilters")}</p>
            <TableEntryCountFooter count={0} />
          </>
        ) : (
          <div className="validation-groups">
            {sortedValidationGroups.map(([category, issues]) => (
              <article key={category} className="validation-group">
                <h3>{category}</h3>
                <table className="data-table validation-issues-table">
                  <colgroup>
                    {!isMobileViewport ? <col className="validation-col-severity" /> : null}
                    <col className="validation-col-issue" />
                    <col className="validation-col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      {!isMobileViewport ? (
                        <th aria-sort={getTableAriaSort(validationTableSort, "severity")}>
                          <button type="button" className="sort-header-button" onClick={() => toggleValidationTableSort("severity")}>
                            
                            {t("ui.severity")} <span className="sort-indicator">{validationTableSortIndicator("severity")}</span>
                          </button>
                        </th>
                      ) : null}
                      <th aria-sort={getTableAriaSort(validationTableSort, "issue")}>
                        <button type="button" className="sort-header-button" onClick={() => toggleValidationTableSort("issue")}>
                          
                          {t("ui.issue")} <span className="sort-indicator">{validationTableSortIndicator("issue")}</span>
                        </button>
                      </th>
                      <th className="validation-actions-cell" aria-sort={getTableAriaSort(validationTableSort, "actions")}>
                        <button type="button" className="sort-header-button" onClick={() => toggleValidationTableSort("actions")}>
                          
                          {t("ui.actions")} <span className="sort-indicator">{validationTableSortIndicator("actions")}</span>
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr
                        key={issue.id}
                        className={
                          findValidationIssueIndex(issue.id) === validationIssueCursor ? "is-selected is-focusable-row" : "is-focusable-row"
                        }
                        aria-selected={findValidationIssueIndex(issue.id) === validationIssueCursor}
                        tabIndex={0}
                        onClick={() => setValidationIssueCursorFromIssue(issue)}
                        onKeyDown={(event) => {
                          if (event.target !== event.currentTarget) {
                            return;
                          }
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }
                          event.preventDefault();
                          setValidationIssueCursorFromIssue(issue);
                        }}
                      >
                        {!isMobileViewport ? (
                          <td>
                            <span className={issue.severity === "error" ? "status-chip is-error" : "status-chip is-warning"}>
                              {issue.severity.toUpperCase()}
                            </span>
                          </td>
                        ) : null}
                        <td>{issue.message}</td>
                        <td className="validation-actions-cell">
                          <button
                            type="button"
                            className="validation-row-go-to-button button-with-icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleValidationIssueRowGoTo(issue);
                            }}
                          >
                            <span className="action-button-icon is-open" aria-hidden="true" />
                            
                            {t("ui.goTo")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <TableEntryCountFooter count={issues.length} />
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
