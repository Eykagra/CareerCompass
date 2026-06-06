import type { CompletionRequest, LLMProvider } from "./types";
import { LLMError } from "./types";

const DEFAULT_MODEL =
  process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-5-sonnet-20240620-v1:0";
const REGION = process.env.AWS_REGION || "us-east-1";

/**
 * Amazon Bedrock provider (Anthropic Claude messages API).
 * The AWS SDK is imported dynamically so the app still builds/runs when the
 * optional dependency is absent (e.g. while prototyping on Gemini/NVIDIA).
 */
export class BedrockProvider implements LLMProvider {
  readonly name = "bedrock" as const;

  async complete(req: CompletionRequest): Promise<string> {
    let mod: typeof import("@aws-sdk/client-bedrock-runtime");
    try {
      mod = await import("@aws-sdk/client-bedrock-runtime");
    } catch {
      throw new LLMError(
        "Bedrock provider selected but @aws-sdk/client-bedrock-runtime is not installed.",
        500,
      );
    }

    const { BedrockRuntimeClient, InvokeModelCommand } = mod;
    const client = new BedrockRuntimeClient({ region: REGION });

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: req.maxTokens ?? 2048,
      temperature: req.temperature ?? 0.6,
      system: req.json
        ? `${req.system}\nRespond with valid JSON only.`
        : req.system,
      messages: req.messages.map((m) => ({
        role: m.role,
        content: [{ type: "text", text: m.content }],
      })),
    };

    try {
      const res = await client.send(
        new InvokeModelCommand({
          modelId: DEFAULT_MODEL,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(body),
        }),
      );
      const decoded = JSON.parse(new TextDecoder().decode(res.body)) as {
        content?: Array<{ text?: string }>;
      };
      const text = decoded.content?.map((c) => c.text || "").join("") ?? "";
      if (!text) throw new LLMError("Bedrock returned an empty response");
      return text;
    } catch (err) {
      if (err instanceof LLMError) throw err;
      throw new LLMError(
        `Bedrock request failed: ${(err as Error).message}`.slice(0, 300),
      );
    }
  }
}
