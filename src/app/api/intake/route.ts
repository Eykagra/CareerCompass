import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { INTAKE_SYSTEM, intakeUserPrompt } from "@/lib/llm/prompts";
import { LLMError } from "@/lib/llm/types";
import { UserProfileSchema, extractJson } from "@/lib/schema";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ text: z.string().min(2).max(4000) });

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const provider = getProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Free-text intake needs an LLM key. Use the guided form instead.",
      },
      { status: 503 },
    );
  }

  try {
    const raw = await provider.complete({
      system: INTAKE_SYSTEM,
      messages: [{ role: "user", content: intakeUserPrompt(parsed.data.text) }],
      json: true,
      temperature: 0.2,
      maxTokens: 600,
    });
    const profile = UserProfileSchema.parse(extractJson(raw));
    return NextResponse.json({ profile, provider: provider.name });
  } catch (err) {
    const status = err instanceof LLMError ? err.status : 502;
    return NextResponse.json(
      { error: (err as Error).message || "Intake parsing failed" },
      { status },
    );
  }
}
