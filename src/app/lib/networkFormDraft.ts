import { translateCurrent as t } from "./i18n";
import {
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkLogoUrl,
  normalizeNetworkPlanIssueDate,
  normalizeNetworkPlanRevision,
  normalizeNetworkProjectCode,
  parseLocalDateInputToIso
} from "../../core/networkMetadata";
import { normalizeNetworkEntityPrefix } from "../../core/networkEntityPrefix";
import { normalizeNetworkVoltageV } from "../../core/wireSizing";

export interface NetworkFormDraftInput {
  name: string;
  technicalId: string;
  createdAtDate: string;
  description: string;
  author: string;
  voltageV: string;
  projectCode: string;
  entityPrefix: string;
  logoUrl: string;
  exportNotes: string;
  planRevision: string;
  planIssueDate: string;
}

export type NetworkFormDraftResult =
  | {
      kind: "error";
      message: string;
    }
  | {
      kind: "valid";
      draft: {
        name: string;
        technicalId: string;
        createdAtIso: string;
        description: string | undefined;
        author: string;
        voltageV: number | undefined;
        projectCode: string;
        entityPrefix: string;
        logoUrl: string;
        exportNotes: string;
        planRevision: string;
        planIssueDate: string;
      };
    };

export function buildNetworkFormDraft(input: NetworkFormDraftInput): NetworkFormDraftResult {
  const trimmedName = input.name.trim();
  const trimmedTechnicalId = input.technicalId.trim();
  if (trimmedName.length === 0 || trimmedTechnicalId.length === 0) {
    return { kind: "error", message: t("ui.networkNameAndTechnicalIDAreRequired") };
  }

  const normalizedProjectCode = normalizeNetworkProjectCode(input.projectCode);
  if (normalizedProjectCode !== undefined && !isNetworkProjectCodeValid(normalizedProjectCode)) {
    return { kind: "error", message: t("ui.projectCodeSupportsLettersNumbersSpacesAndCharactersOnly") };
  }

  const normalizedLogoUrl = normalizeNetworkLogoUrl(input.logoUrl);
  if (normalizedLogoUrl !== undefined && !isNetworkLogoUrlValid(normalizedLogoUrl)) {
    return { kind: "error", message: t("ui.logoURLMustUseHttpHttpsOrDataImage") };
  }

  const trimmedEntityPrefix = input.entityPrefix.trim();
  if (trimmedEntityPrefix.length > 0 && normalizeNetworkEntityPrefix(trimmedEntityPrefix) === undefined) {
    return { kind: "error", message: t("ui.entityPrefixSupportsLettersNumbersUnderscoreAndHyphenOnly") };
  }

  const createdAtIso = parseLocalDateInputToIso(input.createdAtDate);
  if (createdAtIso === null) {
    return { kind: "error", message: t("ui.creationDateIsInvalid") };
  }

  const normalizedPlanIssueDate = normalizeNetworkPlanIssueDate(input.planIssueDate);
  if (normalizedPlanIssueDate === null) {
    return { kind: "error", message: t("ui.planIssueDateIsInvalid") };
  }

  const rawVoltage = input.voltageV.trim();
  const parsedVoltage = rawVoltage.length === 0 ? undefined : Number(rawVoltage);
  const normalizedVoltageV = rawVoltage.length === 0 ? undefined : normalizeNetworkVoltageV(parsedVoltage);
  if (rawVoltage.length > 0 && normalizedVoltageV === undefined) {
    return { kind: "error", message: t("ui.networkformdraftNetworkVoltageMustBeAPositiveValueInV") };
  }

  return {
    kind: "valid",
    draft: {
      name: trimmedName,
      technicalId: trimmedTechnicalId,
      createdAtIso,
      description: input.description.trim().length === 0 ? undefined : input.description.trim(),
      author: input.author,
      voltageV: normalizedVoltageV,
      projectCode: input.projectCode,
      entityPrefix: input.entityPrefix,
      logoUrl: input.logoUrl,
      exportNotes: input.exportNotes,
      // Empty strings are explicit "clear" requests; the reducer normalizes them to unset.
      planRevision: normalizeNetworkPlanRevision(input.planRevision) ?? "",
      planIssueDate: normalizedPlanIssueDate ?? ""
    }
  };
}
