import { NextResponse } from "next/server";
import { activeProviderName } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    provider: activeProviderName(),
    time: new Date().toISOString(),
  });
}
