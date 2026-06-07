import type { CompletionRequest, LLMProvider } from "./types";
import { LLMError } from "./types";

const DEFAULT_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";
const BASE = process.env.MISTRAL_BASE_URL || "https://api.mistral.ai/v1";

/**
 * Mistral AI provider (OpenAI-compatible).
 * Supports models like mistral-large-latest, mistral-small-latest, etc.
 */
export class MistralProvider implements LLMProvider {
  readonly name = "mistral" as const;

  constructor(private readonly apiKey: string) {}

  async complete(req: CompletionRequest): Promise<string> {
    const messages = [
      { role: "system", content: req.system },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Create an AbortController for timeout handling (55s to stay under nginx 60s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages,
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens ?? 4096,
          ...(req.json ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new LLMError(
          `Mistral AI request failed (${res.status}): ${detail.slice(0, 300)}`,
        );
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content ?? "";
      if (!text) throw new LLMError("Mistral AI returned an empty response");
      return text;
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === "AbortError") {
        throw new LLMError(
          "Mistral AI request timed out after 55 seconds. Try reducing maxTokens or simplifying the prompt.",
        );
      }
      
      throw err;
    }
  }
}
