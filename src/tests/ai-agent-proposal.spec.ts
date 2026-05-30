import { describe, expect, it } from "vitest";
import { createSampleNetworkState } from "../store";
import { prepareAiAgentProposalDraft } from "../app/lib/aiAgentProposal";
import type { AiAgentOperationPermissions } from "../app/lib/aiAgentOperationContract";

const DEFAULT_PERMISSIONS: AiAgentOperationPermissions = {
  add: true,
  move: true,
  update: true,
  route: true,
  delete: false
};

describe("AI agent proposal draft", () => {
  it("generates a locally validated proposal preview without mutating state", () => {
    const state = createSampleNetworkState();
    const draft = prepareAiAgentProposalDraft({
      state,
      scope: "activeNetwork",
      instruction: "Add an intermediate routing point.",
      permissions: DEFAULT_PERMISSIONS
    });

    expect(draft.summary).toContain("Local draft generated");
    expect(draft.validation.accepted.map((operation) => operation.type)).toEqual(["add_node"]);
    expect(draft.validation.unsupported.map((issue) => issue.operationType)).toEqual(["assign_endpoint"]);
    expect(state.nodes.byId).not.toHaveProperty("AI proposed routing node");
  });

  it("keeps rejected operations visible when permissions block every supported draft operation", () => {
    const state = createSampleNetworkState();
    const draft = prepareAiAgentProposalDraft({
      state,
      scope: "activeNetwork",
      instruction: "Try a blocked draft.",
      permissions: {
        ...DEFAULT_PERMISSIONS,
        add: false,
        move: false,
        route: false
      }
    });

    expect(draft.validation.accepted).toHaveLength(0);
    expect(draft.validation.unsupported.map((issue) => issue.operationType)).toEqual(["delete_entity", "assign_endpoint"]);
  });
});
