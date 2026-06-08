import { beforeEach, describe, expect, it } from "vitest";
import {
  AI_AGENT_INSTRUCTION_HISTORY_LIMIT,
  AI_AGENT_INSTRUCTION_HISTORY_STORAGE_KEY,
  clearAiAgentInstructionHistory,
  rememberAiAgentInstruction
} from "../app/lib/aiAgentPanelPreferences";

describe("AI agent panel preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps instruction history bounded, normalized, and de-duplicated", () => {
    expect(rememberAiAgentInstruction("   ")).toEqual([]);

    for (let index = 0; index < AI_AGENT_INSTRUCTION_HISTORY_LIMIT + 2; index += 1) {
      rememberAiAgentInstruction(`Instruction ${index}`);
    }
    const movedHistory = rememberAiAgentInstruction("  Instruction   4  ");

    expect(movedHistory).toHaveLength(AI_AGENT_INSTRUCTION_HISTORY_LIMIT);
    expect(movedHistory[0]).toBe("Instruction 4");
    expect(movedHistory.filter((instruction) => instruction === "Instruction 4")).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(AI_AGENT_INSTRUCTION_HISTORY_STORAGE_KEY) ?? "{}")).toMatchObject({
      instructions: movedHistory
    });

    clearAiAgentInstructionHistory();
    expect(localStorage.getItem(AI_AGENT_INSTRUCTION_HISTORY_STORAGE_KEY)).toBeNull();
  });
});
