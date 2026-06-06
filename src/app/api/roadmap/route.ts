import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { ROADMAP_SYSTEM, roadmapUserPrompt } from "@/lib/llm/prompts";
import { LLMError } from "@/lib/llm/types";
import {
  RoadmapGraphSchema,
  UserProfileSchema,
  extractJson,
} from "@/lib/schema";
import { demoRoadmap } from "@/lib/sample";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = UserProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid profile", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const profile = parsed.data;

  const provider = getProvider();

  // Demo mode: no key configured.
  if (!provider) {
    return NextResponse.json({
      roadmap: demoRoadmap(profile),
      provider: "demo",
    });
  }

  try {
    // One retry on malformed JSON.
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await provider.complete({
        system: ROADMAP_SYSTEM,
        messages: [{ role: "user", content: roadmapUserPrompt(profile) }],
        json: true,
        temperature: 0.5,
        maxTokens: 3000,
      });
      try {
        const candidate = RoadmapGraphSchema.parse(extractJson(raw));
        return NextResponse.json({
          roadmap: candidate,
          provider: provider.name,
        });
      } catch (e) {
        lastErr = e;
      }
    }
    throw new LLMError(
      `Model returned data that did not match the roadmap schema: ${String(
        (lastErr as Error)?.message || lastErr,
      ).slice(0, 200)}`,
    );
  } catch (err) {
    const status = err instanceof LLMError ? err.status : 502;
    return NextResponse.json(
      { error: (err as Error).message || "Generation failed" },
      { status },
    );
  }
}
