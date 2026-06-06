import type { ChatMessage, RoadmapGraph, UserProfile } from "@/lib/schema";

export const ROADMAP_SYSTEM = `You are an expert career roadmap architect. You design personalized, realistic, dependency-ordered learning roadmaps. You are honest about timelines and never pad steps. You always answer with strict JSON only.`;

export function roadmapUserPrompt(profile: UserProfile): string {
  return `Create a personalized career roadmap.

USER PROFILE:
- Goal: ${profile.goal}
- Stage: ${profile.stage}
- Known skills: ${profile.knownSkills.length ? profile.knownSkills.join(", ") : "none stated"}
- Time available: ${profile.hoursPerWeek} hours/week
- Budget: ${profile.budget}
- Target timeline: ${profile.timelineMonths} months

RULES:
1. Build the roadmap FROM the user's current stage/skills TO their goal. Do NOT include steps for skills they already have.
2. Order nodes by dependency (foundations first). Give each node a short "phase" label (e.g. "Foundations", "Core", "Specialization", "Job-ready").
3. Add branching forks where a real decision exists (e.g. "Frontend vs Backend"). Use the edge "condition" field to label the fork.
4. Respect time + budget. If budget is "free", prefer free resources. If the timeline is tight, cut nice-to-haves and say so in "why".
5. Each node needs: a clear title, 2-5 concrete skills, an honest estimatedWeeks (number), a one-sentence "why", and 1-3 real resources.
6. Use 6-12 nodes. Keep ids short and stable (n1, n2, ...).

Return ONLY valid JSON, no markdown fences, matching exactly:
{
  "title": "string",
  "summary": "string (1-2 sentences)",
  "nodes": [
    { "id": "n1", "title": "string", "phase": "string", "skills": ["string"], "estimatedWeeks": 4, "why": "string", "resources": [{ "name": "string", "url": "string", "cost": "free" }] }
  ],
  "edges": [ { "from": "n1", "to": "n2", "condition": "" } ]
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
