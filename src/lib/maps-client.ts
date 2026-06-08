"use client";

import type { RoadmapGraph, UserProfile } from "@/lib/schema";

export type MapSummary = {
  id: string;
  title: string;
  goal: string;
  nodeCount: number;
  completedCount: number;
  createdAt: number;
  updatedAt: number;
};

export type StoredMap = {
  id: string;
  title: string;
  goal: string;
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed: string[];
  createdAt: number;
  updatedAt: number;
};

export type MapsList = {
  maps: MapSummary[];
  limit: number;
  remaining: number;
};

export async function fetchMaps(): Promise<MapsList> {
  const res = await fetch("/api/maps", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load maps");
  return res.json();
}

export async function fetchMap(id: string): Promise<StoredMap> {
  const res = await fetch(`/api/maps/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load map");
  const data = await res.json();
  return data.map as StoredMap;
}

export type SaveResult =
  | { ok: true; map: StoredMap }
  | { ok: false; error: string; limitReached: boolean };

export async function saveMap(input: {
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed?: string[];
}): Promise<SaveResult> {
  const res = await fetch("/api/maps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: data.error || "Could not save map.",
      limitReached: data.code === "LIMIT_REACHED",
    };
  }
  return { ok: true, map: data.map as StoredMap };
}

export async function deleteMap(id: string): Promise<boolean> {
  const res = await fetch(`/api/maps/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function patchCompleted(
  id: string,
  completed: string[],
): Promise<void> {
  await fetch(`/api/maps/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
}

/** Download a map as a JSON file (client-side export). */
export function exportMapJson(map: {
  title: string;
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed: string[];
}): void {
  const payload = {
    title: map.title,
    profile: map.profile,
    roadmap: map.roadmap,
    completed: map.completed,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = map.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  a.download = `careercompass-${safe || "roadmap"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
