import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { MENTOR_SYSTEM, buildMentorMessages } from "@/lib/llm/prompts";
import { LLMError } from "@/lib/llm/types";
import {
  ChatMessageSchema,
  RoadmapGraphSchema,
  UserProfileSchema,
} from "@/lib/schema";
import { demoMentorReply } from "@/lib/sample";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  profile: UserProfileSchema,
  roadmap: RoadmapGraphSchema,
  history: z.array(ChatMessageSchema).max(40).default([]),
  question: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { profile, roadmap, history, question } = parsed.data;

  const provider = getProvider();
  if (!provider) {
    return NextResponse.json({
      reply: demoMentorReply(question),
      provider: "demo",
    });
  }

  try {
    const reply = await provider.complete({
      system: MENTOR_SYSTEM,
      messages: buildMentorMessages(profile, roadmap, history, question),
      temperature: 0.7,
      maxTokens: 700,
    });
    return NextResponse.json({ reply: reply.trim(), provider: provider.name });
  } catch (err) {
    const status = err instanceof LLMError ? err.status : 502;
    return NextResponse.json(
      { error: (err as Error).message || "Mentor request failed" },
      { status },
    );
  }
}
