import type { CompletionRequest, LLMProvider } from "./types";
import { LLMError } from "./types";

const DEFAULT_MODEL =
  process.env.NVIDIA_MODEL || "mistralai/mistral-7b-instruct-v0.3";
const BASE =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

/**
 * NVIDIA NIM provider (OpenAI-compatible).
 * Works with any model hosted on build.nvidia.com (Mistral, DeepSeek, Llama, ...).
 */
export class NvidiaProvider implements LLMProvider {
  readonly name = "nvidia" as const;

  constructor(private readonly apiKey: string) {}

  async complete(req: CompletionRequest): Promise<string> {
    const messages = [
      { role: "system", content: req.system },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: req.temperature ?? 0.6,
        max_tokens: req.maxTokens ?? 2048,
        ...(req.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LLMError(
        `NVIDIA NIM request failed (${res.status}): ${detail.slice(0, 300)}`,
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new LLMError("NVIDIA NIM returned an empty response");
    return text;
  }
}
