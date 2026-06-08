import { z } from "zod";

export const StageEnum = z.enum([
  "high_school",
  "college",
  "new_grad",
  "career_switcher",
  "self_taught",
]);
export type Stage = z.infer<typeof StageEnum>;

export const BudgetEnum = z.enum(["free", "low", "flexible"]);
export type Budget = z.infer<typeof BudgetEnum>;

export const UserProfileSchema = z.object({
  goal: z.string().min(2).max(120),
  stage: StageEnum,
  knownSkills: z.array(z.string().max(60)).max(40).default([]),
  hoursPerWeek: z.number().int().min(1).max(80),
  budget: BudgetEnum,
  timelineMonths: z.number().int().min(1).max(60),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ResourceSchema = z.object({
  name: z.string().max(120),
  url: z.string().max(300).optional().default(""),
  // Models sometimes return variants like "free (audit mode)", "Free", or
  // "$" instead of the strict enum. Normalize to "free" | "paid" rather than
  // failing the whole roadmap. Anything that isn't clearly paid defaults to free.
  cost: z
    .union([z.string(), z.boolean(), z.null()])
    .optional()
    .transform((val) => {
      if (typeof val !== "string") return "free" as const;
      return /paid|\$|cost|subscri|premium/i.test(val)
        ? ("paid" as const)
        : ("free" as const);
    }),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const RoadmapNodeSchema = z.object({
  id: z.string().min(1).max(40),
  title: z.string().min(2).max(120),
  skills: z.array(z.string().max(60)).max(12).default([]),
  estimatedWeeks: z.number().min(0).max(260),
  why: z.string().max(400).default(""),
  phase: z.string().max(60).optional().default(""),
  resources: z.array(ResourceSchema).max(5).default([]),
});
export type RoadmapNode = z.infer<typeof RoadmapNodeSchema>;

export const RoadmapEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  condition: z.string().max(120).optional().default(""),
});
export type RoadmapEdge = z.infer<typeof RoadmapEdgeSchema>;

export const RoadmapGraphSchema = z.object({
  title: z.string().max(120).optional().default(""),
  summary: z.string().max(600).optional().default(""),
  nodes: z.array(RoadmapNodeSchema).min(1).max(40),
  edges: z.array(RoadmapEdgeSchema).max(80),
});
export type RoadmapGraph = z.infer<typeof RoadmapGraphSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/**
 * Extract a JSON object from a model response that may include prose or code fences.
 * Handles truncated/malformed JSON by attempting to repair it.
 */
export function extractJson(raw: string): unknown {
  if (!raw) throw new Error("Empty model response");
  let text = raw.trim();

  // Strip ```json ... ``` or ``` ... ``` fences.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) text = fence[1].trim();

  // Fall back to the first balanced-looking object slice.
  if (!text.startsWith("{")) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      text = text.slice(start, end + 1);
    }
  }

  // Try to parse as-is first
  try {
    return JSON.parse(text);
  } catch (firstError) {
    // If JSON is truncated, try to repair it by finding the last complete object
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace !== -1) {
      // Count braces to find balanced JSON
      let openBraces = 0;
      let closeBraces = 0;
      let lastValidPos = -1;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === "{") openBraces++;
        if (text[i] === "}") {
          closeBraces++;
          if (openBraces === closeBraces) {
            lastValidPos = i;
          }
        }
      }

      if (lastValidPos !== -1) {
        const repairedText = text.slice(0, lastValidPos + 1);
        try {
          return JSON.parse(repairedText);
        } catch {
          // If repair fails, throw original error
        }
      }
    }

    // Re-throw original error with more context
    throw new Error(
      `JSON parse failed: ${(firstError as Error).message}. Text length: ${text.length}`,
    );
  }
}
