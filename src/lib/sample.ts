import type { RoadmapGraph, UserProfile } from "@/lib/schema";

/**
 * Built-in demo roadmaps. Used when no LLM key is configured so the product is
 * always demoable. Keyed loosely by goal keyword.
 */
const BACKEND: RoadmapGraph = {
  title: "Backend Engineer Roadmap",
  summary:
    "A focused path from basic programming to a job-ready backend engineer, weighted toward fundamentals, real projects, and system design.",
  nodes: [
    {
      id: "n1",
      title: "Programming fundamentals",
      phase: "Foundations",
      skills: ["A language (Python/Go/Java)", "Control flow", "Functions"],
      estimatedWeeks: 4,
      why: "Everything else builds on writing clean, correct code.",
      resources: [
        {
          name: "CS50x (Harvard)",
          url: "https://cs50.harvard.edu/x/",
          cost: "free",
        },
      ],
    },
    {
      id: "n2",
      title: "Data structures & algorithms",
      phase: "Foundations",
      skills: ["Arrays & maps", "Big-O", "Recursion"],
      estimatedWeeks: 6,
      why: "Interviews and real performance work both depend on this.",
      resources: [
        { name: "NeetCode 150", url: "https://neetcode.io", cost: "free" },
      ],
    },
    {
      id: "n3",
      title: "Databases & SQL",
      phase: "Core",
      skills: ["PostgreSQL", "Schema design", "Indexes"],
      estimatedWeeks: 3,
      why: "Backends are mostly about storing and querying data well.",
      resources: [
        { name: "SQLBolt", url: "https://sqlbolt.com", cost: "free" },
      ],
    },
    {
      id: "n4",
      title: "Build a REST API",
      phase: "Core",
      skills: ["HTTP", "Routing", "Auth", "Validation"],
      estimatedWeeks: 4,
      why: "Your first portfolio project that proves you can ship a service.",
      resources: [{ name: "Build a Node/Express API", url: "", cost: "free" }],
    },
    {
      id: "n5",
      title: "Choose a specialization",
      phase: "Specialization",
      skills: ["Decision point"],
      estimatedWeeks: 0,
      why: "Depth beats breadth when applying for your first role.",
      resources: [],
    },
    {
      id: "n6",
      title: "Distributed systems & scale",
      phase: "Specialization",
      skills: ["Caching", "Queues", "Load balancing"],
      estimatedWeeks: 6,
      why: "Differentiates a senior-track backend engineer.",
      resources: [
        {
          name: "System Design Primer",
          url: "https://github.com/donnemartin/system-design-primer",
          cost: "free",
        },
      ],
    },
    {
      id: "n7",
      title: "Cloud & DevOps basics",
      phase: "Specialization",
      skills: ["Docker", "CI/CD", "AWS basics"],
      estimatedWeeks: 4,
      why: "Modern backend roles expect you to deploy what you build.",
      resources: [
        {
          name: "Docker Getting Started",
          url: "https://docs.docker.com/get-started/",
          cost: "free",
        },
      ],
    },
    {
      id: "n8",
      title: "Capstone project + interview prep",
      phase: "Job-ready",
      skills: ["Portfolio", "Behavioral", "Mock interviews"],
      estimatedWeeks: 6,
      why: "A strong capstone plus practice is what converts to offers.",
      resources: [
        {
          name: "Pramp mock interviews",
          url: "https://www.pramp.com",
          cost: "free",
        },
      ],
    },
  ],
  edges: [
    { from: "n1", to: "n2", condition: "" },
    { from: "n2", to: "n3", condition: "" },
    { from: "n3", to: "n4", condition: "" },
    { from: "n4", to: "n5", condition: "" },
    { from: "n5", to: "n6", condition: "Want senior / scale track" },
    { from: "n5", to: "n7", condition: "Want product / cloud track" },
    { from: "n6", to: "n8", condition: "" },
    { from: "n7", to: "n8", condition: "" },
  ],
};

function relabel(base: RoadmapGraph, goal: string): RoadmapGraph {
  return { ...base, title: `${goal} Roadmap`.slice(0, 110) };
}

export function demoRoadmap(profile: UserProfile): RoadmapGraph {
  const goal = profile.goal.toLowerCase();
  // A single high-quality template, relabeled. In demo mode this is enough to
  // showcase the full experience; real generation happens once a key is set.
  if (
    goal.includes("backend") ||
    goal.includes("engineer") ||
    goal.includes("developer")
  ) {
    return relabel(BACKEND, profile.goal);
  }
  return relabel(BACKEND, profile.goal);
}

export function demoMentorReply(question: string): string {
  return (
    `Here's how I'd think about "${question.slice(0, 80)}": focus on the earliest unfinished node in your roadmap and ship something small this week. ` +
    `Momentum compounds. (You're seeing the built-in demo mentor — add a GEMINI_API_KEY or NVIDIA_API_KEY, or switch LLM_PROVIDER=bedrock, to enable the live AI mentor.)`
  );
}
