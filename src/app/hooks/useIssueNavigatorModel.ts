interface IssueWithId {
  id: string;
}

interface UseIssueNavigatorModelParams<TIssue extends IssueWithId> {
  isValidationScreen: boolean;
  currentValidationIssue: TIssue | null;
  orderedValidationIssues: TIssue[];
  visibleValidationIssues: TIssue[];
}

export function useIssueNavigatorModel<TIssue extends IssueWithId>({
  isValidationScreen,
  currentValidationIssue,
  orderedValidationIssues,
  visibleValidationIssues
}: UseIssueNavigatorModelParams<TIssue>) {
  const issueNavigationScopeIssues = isValidationScreen ? visibleValidationIssues : orderedValidationIssues;
  const issueNavigationScopeLabel = isValidationScreen ? "Filtered issues" : "All issues";
  const currentIssuePositionInScope =
    currentValidationIssue === null
      ? -1
      : issueNavigationScopeIssues.findIndex((issue) => issue.id === currentValidationIssue.id);
  const issueNavigatorDisplay =
    issueNavigationScopeIssues.length === 0
      ? "No issue"
      : `${currentIssuePositionInScope >= 0 ? currentIssuePositionInScope + 1 : 1}/${issueNavigationScopeIssues.length}`;

  return {
    issueNavigationScopeIssues,
    issueNavigationScopeLabel,
    currentIssuePositionInScope,
    issueNavigatorDisplay
  };
}
