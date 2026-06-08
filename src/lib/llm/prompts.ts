import type { ChatMessage, RoadmapGraph, UserProfile } from "@/lib/schema";

export const ROADMAP_SYSTEM = `You are an expert career roadmap architect. You design personalized, realistic, dependency-ordered learning roadmaps. You are honest about timelines and never pad steps. You MUST return ONLY valid JSON with no markdown fences, no explanations, just the raw JSON object.`;

export function roadmapUserPrompt(profile: UserProfile): string {
  return `Create a career roadmap for: ${profile.goal}

Profile: ${profile.stage} stage, ${profile.knownSkills.length ? profile.knownSkills.join(", ") : "no prior skills"}, ${profile.hoursPerWeek}h/week, ${profile.budget} budget, ${profile.timelineMonths}mo timeline.

Requirements:
- Start from their current level, exclude skills they already have
- 6-10 nodes ordered by dependency
- Each node: short title, 2-5 skills, realistic estimatedWeeks (number), one-sentence "why", 1-3 resources
- For each resource, "cost" MUST be exactly "free" or "paid" (no other words)
- Group nodes by phase (e.g. "Foundations", "Core", "Advanced")
- Add edges showing dependencies, use "condition" for forks
- Respect time/budget constraints (prefer free resources if budget="free")
- Use short stable IDs (n1, n2, n3, etc)

Return ONLY this JSON structure (no markdown, no fences):
{
  "title": "Backend Engineer Roadmap",
  "summary": "Brief 1-2 sentence overview",
  "nodes": [
    {
      "id": "n1",
      "title": "Node Title",
      "phase": "Foundations",
      "skills": ["skill1", "skill2"],
      "estimatedWeeks": 4,
      "why": "One sentence reason",
      "resources": [{"name": "Resource Name", "url": "https://...", "cost": "free"}]
    }
  ],
  "edges": [{"from": "n1", "to": "n2", "condition": ""}]
}`;
}

export const MENTOR_SYSTEM = `You are a supportive, sharp, and honest career mentor inside an app called CareerCompass. You guide the user along THEIR specific roadmap. Be concrete, reference their actual node titles, and never give generic filler. Keep replies focused and under ~160 words unless asked for depth.`;

export function mentorContext(
  profile: UserProfile,
  roadmap: RoadmapGraph,
): string {
  return `USER PROFILE:
${JSON.stringify(profile)}

THEIR CURRENT ROADMAP (titles + phases):
${roadmap.nodes.map((n) => `- [${n.phase || "step"}] ${n.title} (${n.estimatedWeeks}w)`).join("\n")}

Guidance:
- Answer using their real roadmap and profile.
- If they want to change constraints (e.g. "I only have weekends now"), adapt your advice in plain language. Do not output JSON to the user.`;
}

export function buildMentorMessages(
  profile: UserProfile,
  roadmap: RoadmapGraph,
  history: ChatMessage[],
  question: string,
): ChatMessage[] {
  const seeded: ChatMessage[] = [
    { role: "assistant", content: mentorContext(profile, roadmap) },
    ...history.slice(-10),
    { role: "user", content: question },
  ];
  return seeded;
}

export const INTAKE_SYSTEM = `You convert a person's free-text description of where they are in their career into a structured JSON profile. You never invent skills they did not mention. You answer with strict JSON only.`;

export function intakeUserPrompt(rawAnswers: string): string {
  return `USER ANSWERS:
${rawAnswers}

Return ONLY valid JSON:
{
  "goal": "string",
  "stage": "high_school" | "college" | "new_grad" | "career_switcher" | "self_taught",
  "knownSkills": ["string"],
  "hoursPerWeek": 10,
  "budget": "free" | "low" | "flexible",
  "timelineMonths": 12
}
If a field is unknown, use a sensible default (hoursPerWeek 10, budget "free", timelineMonths 12, stage "self_taught"). Never invent skills.`;
}
