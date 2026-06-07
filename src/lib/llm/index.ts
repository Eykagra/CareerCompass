import { BedrockProvider } from "./bedrock";
import { GeminiProvider } from "./gemini";
import { MistralProvider } from "./mistral";
import { NvidiaProvider } from "./nvidia";
import type { LLMProvider, ProviderName } from "./types";

export * from "./types";

/**
 * Resolve the active LLM provider from environment variables.
 *
 * LLM_PROVIDER = gemini | nvidia | bedrock | mistral | demo (auto)
 *
 * When unset, we auto-detect from available keys, and fall back to a built-in
 * "demo" mode so the app is fully usable out-of-the-box (great for screenshots
 * and the AWS Activate demo) without any API key.
 */
export function getProvider(): LLMProvider | null {
  const explicit = (
    process.env.LLM_PROVIDER || ""
  ).toLowerCase() as ProviderName;

  const tryGemini = () =>
    process.env.GEMINI_API_KEY
      ? new GeminiProvider(process.env.GEMINI_API_KEY)
      : null;
  const tryNvidia = () =>
    process.env.NVIDIA_API_KEY
      ? new NvidiaProvider(process.env.NVIDIA_API_KEY)
      : null;
  const tryMistral = () =>
    process.env.MISTRAL_API_KEY
      ? new MistralProvider(process.env.MISTRAL_API_KEY)
      : null;
  const tryBedrock = () => new BedrockProvider();

  switch (explicit) {
    case "gemini":
      return tryGemini();
    case "nvidia":
      return tryNvidia();
    case "mistral":
      return tryMistral();
    case "bedrock":
      return tryBedrock();
    case "demo":
      return null;
  }

  // Auto-detect.
  return tryGemini() ?? tryNvidia() ?? tryMistral() ?? null;
}

export function activeProviderName(): ProviderName {
  const p = getProvider();
  return p ? p.name : "demo";
}
