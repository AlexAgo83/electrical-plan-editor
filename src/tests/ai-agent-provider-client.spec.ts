import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildAiAgentContext } from "../app/lib/aiAgentContext";
import { requestAiAgentProviderProposal } from "../app/lib/aiAgentProviderClient";
import { DEFAULT_AI_SETTINGS, type AiSettings } from "../app/lib/aiSettings";
import { createSampleNetworkState } from "../store";

function buildSettings(provider: AiSettings["provider"]): AiSettings {
  return {
    ...DEFAULT_AI_SETTINGS,
    provider,
    providers: {
      openai: {
        ...DEFAULT_AI_SETTINGS.providers.openai,
        apiKey: "test-openai-key"
      },
      gemini: {
        ...DEFAULT_AI_SETTINGS.providers.gemini,
        apiKey: "test-gemini-key"
      }
    }
  };
}

describe("AI agent provider client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("requests and parses an OpenAI modified plan payload", async () => {
    const context = buildAiAgentContext(createSampleNetworkState(), "activeNetwork");
    const modifiedPlan = {
      schemaVersion: 1,
      connectors: context.entities.connectors,
      splices: context.entities.splices,
      nodes: context.entities.nodes,
      segments: context.entities.segments,
      wires: context.entities.wires
    };
    const fetchMock = vi.fn<typeof fetch>(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            output_text: JSON.stringify({
              schemaVersion: 1,
              modifiedPlan
            })
          }),
          { status: 200 }
        )
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestAiAgentProviderProposal({
      settings: buildSettings("openai"),
      context,
      instruction: "Add a node."
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/responses", expect.any(Object));
    const openAiRequestInit = fetchMock.mock.calls[0]?.[1];
    expect(openAiRequestInit?.method).toBe("POST");
    expect((openAiRequestInit?.headers as Record<string, string> | undefined)?.Authorization).toBe("Bearer test-openai-key");
    expect(typeof openAiRequestInit?.body).toBe("string");
    const openAiBody = JSON.parse(openAiRequestInit?.body as string) as {
      text?: { format?: { type?: string; name?: string } };
      truncation?: string;
    };
    expect(openAiBody.text?.format?.type).toBe("json_schema");
    expect(openAiBody.text?.format?.name).toBe("ai_agent_modified_plan");
    expect(openAiBody.truncation).toBe("auto");
    expect(openAiRequestInit?.body).toContain("editablePlan");
    expect(result.payload).toEqual({
      schemaVersion: 1,
      modifiedPlan
    });
  });

  it("requests and parses a Gemini operation payload", async () => {
    const fetchMock = vi.fn<typeof fetch>(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        schemaVersion: 1,
                        operations: [{ type: "regenerate_route", wireIds: ["W1"] }]
                      })
                    }
                  ]
                }
              }
            ]
          }),
          { status: 200 }
        )
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestAiAgentProviderProposal({
      settings: buildSettings("gemini"),
      context: buildAiAgentContext(createSampleNetworkState(), "activeNetwork"),
      instruction: "Regenerate route."
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=test-gemini-key",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(result.payload).toEqual({
      schemaVersion: 1,
      operations: [{ type: "regenerate_route", wireIds: ["W1"] }]
    });
  });

  it("reports invalid provider JSON with an actionable error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              output_text: "not-json"
            }),
            { status: 200 }
          )
        )
      )
    );

    await expect(
      requestAiAgentProviderProposal({
        settings: buildSettings("openai"),
        context: buildAiAgentContext(createSampleNetworkState(), "activeNetwork"),
        instruction: "Return broken JSON."
      })
    ).rejects.toThrow("AI provider returned invalid JSON for the operation contract.");
  });

  it("includes OpenAI error details when a proposal request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              error: {
                message: "Unsupported response format."
              }
            }),
            {
              status: 400,
              headers: {
                "x-request-id": "req-test"
              }
            }
          )
        )
      )
    );

    await expect(
      requestAiAgentProviderProposal({
        settings: buildSettings("openai"),
        context: buildAiAgentContext(createSampleNetworkState(), "activeNetwork"),
        instruction: "Generate a proposal."
      })
    ).rejects.toThrow("OpenAI proposal request failed with HTTP 400. Unsupported response format. Request ID: req-test.");
  });
});
