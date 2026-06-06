import type { CompletionRequest, LLMProvider } from "./types";
import { LLMError } from "./types";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Google Gemini provider (free tier friendly).
 * Uses the REST API directly so no SDK dependency is required.
 */
export class GeminiProvider implements LLMProvider {
  readonly name = "gemini" as const;

  constructor(private readonly apiKey: string) {}

  async complete(req: CompletionRequest): Promise<string> {
    const contents = req.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body = {
      systemInstruction: { parts: [{ text: req.system }] },
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.6,
        maxOutputTokens: req.maxTokens ?? 2048,
        ...(req.json ? { responseMimeType: "application/json" } : {}),
      },
    };

    const res = await fetch(
      `${BASE}/${DEFAULT_MODEL}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LLMError(
        `Gemini request failed (${res.status}): ${detail.slice(0, 300)}`,
      );
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ??
      "";
    if (!text) throw new LLMError("Gemini returned an empty response");
    return text;
  }
}
