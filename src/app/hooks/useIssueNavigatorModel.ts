import { translateCurrent as t } from "../lib/i18n";
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
  const issueNavigationScopeLabel = isValidationScreen ? t("ui.filteredIssues") : t("ui.allIssues");
  const currentIssuePositionInScope =
    currentValidationIssue === null
      ? -1
      : issueNavigationScopeIssues.findIndex((issue) => issue.id === currentValidationIssue.id);
  const issueNavigatorDisplay =
    issueNavigationScopeIssues.length === 0
      ? t("ui.noIssue")
      : `${currentIssuePositionInScope >= 0 ? currentIssuePositionInScope + 1 : 1}/${issueNavigationScopeIssues.length}`;

  return {
    issueNavigationScopeIssues,
    issueNavigationScopeLabel,
    currentIssuePositionInScope,
    issueNavigatorDisplay
  };
}
