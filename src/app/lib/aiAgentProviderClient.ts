import type { AiSettings } from "./aiSettings";
import type { AiAgentContext } from "./aiAgentContext";
import { AI_AGENT_OPERATION_SCHEMA_VERSION } from "./aiAgentOperationContract";

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
  return JSON.stringify({
    role: "electrical-plan-modeling-agent",
    instruction,
    contract: {
      schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
      requiredResponseShape: {
        schemaVersion: AI_AGENT_OPERATION_SCHEMA_VERSION,
        operations: []
      },
      supportedOperationTypes: [
        "add_connector",
        "add_splice",
        "add_node",
        "add_segment",
        "add_wire",
        "move_entity",
        "update_entity",
        "regenerate_route"
      ],
      deferredOperationTypes: ["assign_endpoint", "assign_catalog_reference", "delete_entity"]
    },
    context
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
    required: ["schemaVersion", "operations"],
    properties: {
      schemaVersion: {
        type: "number",
        enum: [AI_AGENT_OPERATION_SCHEMA_VERSION]
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
          "Return only valid JSON matching the requested operation contract. Do not include markdown or explanatory text.",
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "ai_agent_operation_proposal",
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
              text: "Return only valid JSON matching the requested operation contract. Do not include markdown or explanatory text."
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
