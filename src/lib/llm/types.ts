import type { ChatMessage } from "@/lib/schema";

export type ProviderName = "gemini" | "nvidia" | "bedrock" | "mistral" | "demo";

export interface CompletionRequest {
  system: string;
  messages: ChatMessage[];
  /** Hint the provider to return strict JSON. */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  readonly name: ProviderName;
  complete(req: CompletionRequest): Promise<string>;
}

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
  ) {
    super(message);
    this.name = "LLMError";
  }
}
