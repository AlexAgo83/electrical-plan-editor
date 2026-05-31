import { useRef } from "react";
import type { HarnessAssemblyId } from "../../../core/entities";
import type { AppStore } from "../../../store";
import { ModelingAiAgentPanel } from "../../components/workspace/ModelingAiAgentPanel";
import { applyAiAgentAcceptedOperations, createAiAgentSessionSnapshot, rollbackAiAgentSession, type AiAgentSessionSnapshot } from "../../lib/aiAgentApply";
import { buildAiAgentContext } from "../../lib/aiAgentContext";
import { validateAiAgentOperations } from "../../lib/aiAgentOperationContract";
import {
  buildAiAgentEditablePlan,
  buildAiAgentOperationsFromPlanDiff,
  extractAiAgentModifiedPlan
} from "../../lib/aiAgentPlanDiff";
import { prepareAiAgentProposalDraft } from "../../lib/aiAgentProposal";
import { requestAiAgentProviderProposal } from "../../lib/aiAgentProviderClient";
import type { AiProviderReadiness } from "../../lib/aiSettings";
import type { AiSettingsModel } from "../useAiSettings";

interface UseAppControllerAiAgentWorkspaceContentParams {
  isOpen: boolean;
  providerReadiness: AiProviderReadiness;
  aiSettings: AiSettingsModel;
  selectedHarnessAssemblyId: HarnessAssemblyId | null;
  store: AppStore;
  replaceStateWithHistory: (state: ReturnType<AppStore["getState"]>) => void;
}

export function useAppControllerAiAgentWorkspaceContent({
  isOpen,
  providerReadiness,
  aiSettings,
  selectedHarnessAssemblyId,
  store,
  replaceStateWithHistory
}: UseAppControllerAiAgentWorkspaceContentParams) {
  const lastAiAgentSessionSnapshotRef = useRef<AiAgentSessionSnapshot | null>(null);

  return isOpen ? (
    <ModelingAiAgentPanel
      providerReadiness={providerReadiness}
      experimentalDirectExecutionEnabled={aiSettings.settings.experimentalDirectExecutionEnabled}
      contextSummaries={{
        activeNetwork: buildAiAgentContext(store.getState(), "activeNetwork").summary,
        currentSelection: buildAiAgentContext(store.getState(), "currentSelection").summary,
        selectedHarness: buildAiAgentContext(store.getState(), "selectedHarness", { selectedHarnessAssemblyId }).summary,
        allNetworks: buildAiAgentContext(store.getState(), "allNetworks").summary
      }}
      onPrepareProposal={async (request) => {
        const currentState = store.getState();
        const context = buildAiAgentContext(currentState, request.scope, { selectedHarnessAssemblyId });
        try {
          const providerResponse = await requestAiAgentProviderProposal({
            settings: aiSettings.settings,
            context,
            instruction: request.instruction
          });
          const modifiedPlan = extractAiAgentModifiedPlan(providerResponse.payload);
          const payload =
            modifiedPlan === null
              ? providerResponse.payload
              : {
                  schemaVersion: 1,
                  operations: buildAiAgentOperationsFromPlanDiff(buildAiAgentEditablePlan(context), modifiedPlan)
                };
          return {
            summary: `Provider draft generated from ${providerResponse.rawText.length} response characters.`,
            rawResponse: providerResponse.rawText,
            validation: validateAiAgentOperations({
              state: currentState,
              payload,
              scope: request.scope,
              selection: currentState.ui.selected,
              permissions: request.permissions,
              instruction: request.instruction,
              selectedHarnessAssemblyId
            })
          };
        } catch (error) {
          const fallback = prepareAiAgentProposalDraft({
            state: currentState,
            scope: request.scope,
            instruction: request.instruction,
            permissions: request.permissions,
            selectedHarnessAssemblyId
          });
          return {
            ...fallback,
            summary: `${error instanceof Error ? error.message : "Provider proposal failed."} Local draft generated instead.`
          };
        }
      }}
      onApplyProposal={(validation) => {
        const currentState = store.getState();
        const snapshot = createAiAgentSessionSnapshot(currentState, validation, "AI modeling proposal");
        const result = applyAiAgentAcceptedOperations(currentState, validation);
        if (result.nextState !== currentState) {
          lastAiAgentSessionSnapshotRef.current = snapshot;
          replaceStateWithHistory(result.nextState);
        }
        return {
          appliedCount: result.appliedCount,
          skippedCount: result.skippedCount,
          impactPreview: snapshot.impactPreview,
          canRollback: result.nextState !== currentState
        };
      }}
      onRollbackLastSession={() => {
        const snapshot = lastAiAgentSessionSnapshotRef.current;
        if (snapshot === null) {
          return false;
        }
        replaceStateWithHistory(rollbackAiAgentSession(snapshot));
        lastAiAgentSessionSnapshotRef.current = null;
        return true;
      }}
    />
  ) : null;
}
