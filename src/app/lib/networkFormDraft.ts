import { translateCurrent as t } from "./i18n";
import {
  NETWORK_PLAN_PARTY_FIELDS,
  getNetworkPlanPartyFieldMaxLength,
  hasNetworkPlanPartyLineBreak,
  isNetworkLogoUrlValid,
  isNetworkProjectCodeValid,
  normalizeNetworkLogoUrl,
  normalizeNetworkPlanIssueDate,
  normalizeNetworkPlanPartyValue,
  normalizeNetworkPlanRevision,
  normalizeNetworkProjectCode,
  parseLocalDateInputToIso
} from "../../core/networkMetadata";
import { normalizeNetworkEntityPrefix } from "../../core/networkEntityPrefix";
import { normalizeNetworkVoltageV } from "../../core/wireSizing";
import type { Network, NetworkPlanPartyField } from "../../core/entities";

/** Raw form text of the four plan manufacturer/supplier fields. */
export type NetworkPlanPartiesFormValues = Record<NetworkPlanPartyField, string>;

export const EMPTY_NETWORK_PLAN_PARTIES_FORM_VALUES: NetworkPlanPartiesFormValues = {
  planManufacturerName: "",
  planManufacturerReference: "",
  planSupplierName: "",
  planSupplierReference: ""
};

export function toNetworkPlanPartiesFormValues(
  network: Pick<Network, NetworkPlanPartyField>
): NetworkPlanPartiesFormValues {
  return {
    planManufacturerName: network.planManufacturerName ?? "",
    planManufacturerReference: network.planManufacturerReference ?? "",
    planSupplierName: network.planSupplierName ?? "",
    planSupplierReference: network.planSupplierReference ?? ""
  };
}

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
  planParties?: NetworkPlanPartiesFormValues;
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
        planParties: NetworkPlanPartiesFormValues;
      };
    };

export type NetworkFormDraft = Extract<NetworkFormDraftResult, { kind: "valid" }>["draft"];

/** Network metadata carried by a valid form draft, shared by create and update. */
export function toNetworkDraftMetadata(draft: NetworkFormDraft) {
  return {
    createdAt: draft.createdAtIso,
    author: draft.author,
    voltageV: draft.voltageV,
    projectCode: draft.projectCode,
    entityPrefix: draft.entityPrefix,
    logoUrl: draft.logoUrl,
    exportNotes: draft.exportNotes,
    planRevision: draft.planRevision,
    planIssueDate: draft.planIssueDate,
    ...draft.planParties
  };
}

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

  const planPartiesInput = input.planParties ?? EMPTY_NETWORK_PLAN_PARTIES_FORM_VALUES;
  const planParties = { ...EMPTY_NETWORK_PLAN_PARTIES_FORM_VALUES };
  for (const field of NETWORK_PLAN_PARTY_FIELDS) {
    const rawValue = planPartiesInput[field];
    if (hasNetworkPlanPartyLineBreak(rawValue)) {
      return { kind: "error", message: t("ui.planPartyValueMustBeSingleLine") };
    }
    if (rawValue.trim().length > getNetworkPlanPartyFieldMaxLength(field)) {
      return {
        kind: "error",
        message: t("ui.planPartyValueIsTooLong", { max: getNetworkPlanPartyFieldMaxLength(field) })
      };
    }
    // Empty strings are explicit "clear" requests; the reducer normalizes them to unset.
    planParties[field] = normalizeNetworkPlanPartyValue(field, rawValue) ?? "";
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
      planIssueDate: normalizedPlanIssueDate ?? "",
      planParties
    }
  };
}
