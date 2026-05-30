import type { AiSettings } from "./aiSettings";
import type { AiAgentContext } from "./aiAgentContext";
import { AI_AGENT_OPERATION_SCHEMA_VERSION } from "./aiAgentOperationContract";
import { buildAiAgentEditablePlan } from "./aiAgentPlanDiff";

export interface AiAgentProviderRequest {
  settings: AiSettings;
  context: AiAgentContext;
  instruction: string;
}

export interface AiAgentProviderResponse {
  payload: unknown;
  rawText: string;
}

function buildProviderPrompt(context: AiAgentContext, instruction: string): string {
  const editablePlan = buildAiAgentEditablePlan(context);
  return JSON.stringify({
    role: "electrical-plan-modeling-agent",
    instruction,
    workflow:
      "Edit the provided editablePlan JSON to satisfy the instruction. Return the full modifiedPlan. Do not return prose.",
    contract: {
      schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
      requiredResponseShape: {
        schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
        modifiedPlan: editablePlan
      },
      editableFields:
        "Only change existing scoped entities needed by the instruction. Add new intermediate nodes and segments when a requested wire needs missing topology. Add new wires to wires with id, name, technicalId, endpointA, endpointB, and sectionMm2. Modify existing wires by editing name, technicalId, endpoints, sectionMm2, currentA, material, color fields, twistGroupLabel, or functionalDomainTag. Delete wires by removing them from wires. For catalog requests, edit catalogItems fields such as manufacturerReference, name, connectionCount, unitPriceExclTax, url, additionalAccessories, connectorDefaults, or connectorLayout. For connector/splice requests, edit names, technical IDs, capacity, linked catalog refs, manufacturer refs, terminal overrides, and safe catalog-application flags. For movement, edit node.position on the connector/splice/intermediate node. Preserve ids and references unless intentionally deleting a wire.",
      deferredChanges: ["assign_endpoint", "assign_catalog_reference"],
      compatibility:
        "If you cannot return modifiedPlan, you may return the legacy {schemaVersion, operations} contract, but modifiedPlan is preferred."
    },
    context,
    editablePlan
  });
}

function parseJsonText(rawText: string): unknown {
  const trimmed = rawText.trim();
  if (trimmed.length === 0) {
    throw new Error("AI provider returned an empty response.");
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error("AI provider returned invalid JSON for the operation contract.");
  }
}

function asUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

function buildOperationResponseJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["schemaVersion"],
    properties: {
      schemaVersion: {
        type: "number",
        enum: [AI_AGENT_OPERATION_SCHEMA_VERSION]
      },
      modifiedPlan: {
        type: "object",
        additionalProperties: true
      },
      operations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: true,
          required: ["type"],
          properties: {
            type: {
              type: "string"
            }
          }
        }
      },
      plan: {
        type: "object",
        additionalProperties: true
      }
    }
  };
}

async function readProviderError(response: Response, providerLabel: string): Promise<string> {
  const requestId = response.headers.get("x-request-id");
  let detail = "";
  try {
    const payload: unknown = await response.json();
    if (typeof payload === "object" && payload !== null) {
      const error = (payload as Record<string, unknown>).error;
      if (typeof error === "object" && error !== null) {
        const message = (error as Record<string, unknown>).message;
        if (typeof message === "string") {
          detail = message;
        }
      }
    }
  } catch {
    try {
      detail = await response.text();
    } catch {
      detail = "";
    }
  }
  const requestSuffix = requestId === null ? "" : ` Request ID: ${requestId}.`;
  const detailSuffix = detail.trim().length === 0 ? "" : ` ${detail.trim()}`;
  return `${providerLabel} proposal request failed with HTTP ${response.status}.${detailSuffix}${requestSuffix}`;
}

function extractOpenAiText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "";
  }
  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string") {
    return record.output_text;
  }
  const output = asUnknownArray(record.output);
  return output
    .flatMap((item) => {
      if (typeof item !== "object" || item === null) {
        return [];
      }
      const content = (item as Record<string, unknown>).content;
      return asUnknownArray(content);
    })
    .map((contentItem) => {
      if (typeof contentItem !== "object" || contentItem === null) {
        return "";
      }
      const text = (contentItem as Record<string, unknown>).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

function extractGeminiText(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return "";
  }
  const candidates = (payload as Record<string, unknown>).candidates;
  if (!Array.isArray(candidates)) {
    return "";
  }
  return asUnknownArray(candidates)
    .flatMap((candidate) => {
      if (typeof candidate !== "object" || candidate === null) {
        return [];
      }
      const content = (candidate as Record<string, unknown>).content;
      if (typeof content !== "object" || content === null) {
        return [];
      }
      const parts = (content as Record<string, unknown>).parts;
      return asUnknownArray(parts);
    })
    .map((part) => {
      if (typeof part !== "object" || part === null) {
        return "";
      }
      const text = (part as Record<string, unknown>).text;
      return typeof text === "string" ? text : "";
    })
    .join("");
}

export async function requestAiAgentProviderProposal({
  settings,
  context,
  instruction
}: AiAgentProviderRequest): Promise<AiAgentProviderResponse> {
  const providerConfig = settings.providers[settings.provider];
  const endpoint = providerConfig.endpoint.replace(/\/+$/, "");
  const prompt = buildProviderPrompt(context, instruction);

  if (settings.provider === "openai") {
    const response = await fetch(`${endpoint}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerConfig.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: providerConfig.model,
        instructions:
          "Return only valid JSON with schemaVersion and modifiedPlan. Do not include markdown or explanatory text.",
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "ai_agent_modified_plan",
            schema: buildOperationResponseJsonSchema(),
            strict: false
          }
        },
        truncation: "auto"
      })
    });
    if (!response.ok) {
      throw new Error(await readProviderError(response, "OpenAI"));
    }
    const responsePayload: unknown = await response.json();
    const rawText = extractOpenAiText(responsePayload);
    return {
      payload: parseJsonText(rawText),
      rawText
    };
  }

  const response = await fetch(
    `${endpoint}/models/${encodeURIComponent(providerConfig.model)}:generateContent?key=${encodeURIComponent(providerConfig.apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        },
        systemInstruction: {
          parts: [
            {
              text: "Return only valid JSON with schemaVersion and modifiedPlan. Do not include markdown or explanatory text."
            }
          ]
        }
      })
    }
  );
  if (!response.ok) {
    throw new Error(await readProviderError(response, "Gemini"));
  }
  const responsePayload: unknown = await response.json();
  const rawText = extractGeminiText(responsePayload);
  return {
    payload: parseJsonText(rawText),
    rawText
  };
}
