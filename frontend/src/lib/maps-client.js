export async function fetchMaps() {
  const res = await fetch("/api/maps");
  if (!res.ok) throw new Error("Failed to load maps");
  return res.json();
}

export async function fetchMap(id) {
  const res = await fetch(`/api/maps/${id}`);
  if (!res.ok) throw new Error("Failed to load map");
  const data = await res.json();
  return data.map;
}

export async function saveMap(input) {
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
  return { ok: true, map: data.map };
}

export async function deleteMap(id) {
  const res = await fetch(`/api/maps/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function patchCompleted(id, completed) {
  await fetch(`/api/maps/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
}

/** Download a map as a JSON file (client-side export). */
export function exportMapJson(map) {
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
