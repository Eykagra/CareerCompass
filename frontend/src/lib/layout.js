const COL_W = 320;
const ROW_H = 188;

/**
 * Assign a depth (column) to every node via longest-path from roots, then lay
 * out columns left-to-right and stack siblings vertically. Deterministic and
 * dependency-free — good enough for the branching roadmaps we generate.
 */
export function layoutRoadmap(graph, completed) {
  const ids = graph.nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const edges = graph.edges.filter((e) => idSet.has(e.from) && idSet.has(e.to));

  const incoming = new Map();
  const adj = new Map();
  ids.forEach((id) => {
    incoming.set(id, 0);
    adj.set(id, []);
  });
  edges.forEach((e) => {
    adj.get(e.from).push(e.to);
    incoming.set(e.to, (incoming.get(e.to) || 0) + 1);
  });

  // Longest-path depth via BFS layering.
  const depth = new Map();
  ids.forEach((id) => depth.set(id, 0));
  let changed = true;
  let guard = 0;
  while (changed && guard < ids.length + 5) {
    changed = false;
    guard++;
    edges.forEach((e) => {
      const nd = (depth.get(e.from) || 0) + 1;
      if (nd > (depth.get(e.to) || 0)) {
        depth.set(e.to, nd);
        changed = true;
      }
    });
  }

  // Group by depth and assign rows.
  const byDepth = new Map();
  ids.forEach((id) => {
    const d = depth.get(id) || 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d).push(id);
  });

  const firstActive = pickActive(graph, completed);

  const nodes = graph.nodes.map((n) => {
    const d = depth.get(n.id) || 0;
    const col = byDepth.get(d);
    const row = col.indexOf(n.id);
    const offset = ((col.length - 1) * ROW_H) / 2;
    return {
      id: n.id,
      type: "phase",
      position: { x: d * COL_W, y: row * ROW_H - offset },
      data: {
        title: n.title,
        phase: n.phase || "",
        weeks: n.estimatedWeeks,
        skills: n.skills,
        done: completed.has(n.id),
        active: n.id === firstActive,
        locked: false,
      },
    };
  });

  const flowEdges = edges.map((e, i) => ({
    id: `e${i}-${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    label: e.condition || undefined,
    animated: e.to === firstActive,
    type: "smoothstep",
  }));

  return { nodes, edges: flowEdges };
}

function pickActive(graph, completed) {
  for (const n of graph.nodes) {
    if (!completed.has(n.id)) return n.id;
  }
  return null;
}
