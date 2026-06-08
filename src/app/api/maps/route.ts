import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  FREE_MAP_LIMIT,
  countMaps,
  createMap,
  listMaps,
} from "@/lib/db";
import { RoadmapGraphSchema, UserProfileSchema } from "@/lib/schema";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  profile: UserProfileSchema,
  roadmap: RoadmapGraphSchema,
  completed: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const maps = listMaps(email).map((m) => ({
    id: m.id,
    title: m.title,
    goal: m.goal,
    nodeCount: m.roadmap.nodes.length,
    completedCount: m.completed.length,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));

  return NextResponse.json({
    maps,
    limit: FREE_MAP_LIMIT,
    remaining: Math.max(0, FREE_MAP_LIMIT - maps.length),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (countMaps(email) >= FREE_MAP_LIMIT) {
    return NextResponse.json(
      {
        error: `Free plan is limited to ${FREE_MAP_LIMIT} saved maps. Delete one to save a new roadmap.`,
        code: "LIMIT_REACHED",
      },
      { status: 403 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = CreateBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid map payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const map = createMap(email, parsed.data);
  return NextResponse.json({ map }, { status: 201 });
}
