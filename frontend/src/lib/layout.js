import dagre from 'dagre';

const nodeWidth = 320;
const nodeHeight = 188;

/**
 * Uses Dagre to arrange nodes in a logical hierarchical graph layout,
 * avoiding overlapping edges and ensuring dependencies flow logically.
 */
export function layoutRoadmap(graph, completed) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Setup dagre graph configuration
  // rankdir 'TB' flows top-to-bottom, solving the 'long horizontal line' issue naturally
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

  graph.nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  graph.edges.forEach((edge) => {
    // Only layout edges where both nodes exist
    if (graph.nodes.find(n => n.id === edge.from) && graph.nodes.find(n => n.id === edge.to)) {
      dagreGraph.setEdge(edge.from, edge.to);
    }
  });

  dagre.layout(dagreGraph);

  const firstActive = pickActive(graph, completed);

  const nodes = graph.nodes.map((n) => {
    const nodeWithPosition = dagreGraph.node(n.id);
    
    // Dagre sets x, y as the center of the node, while React Flow assumes top-left
    const xPos = nodeWithPosition.x - nodeWidth / 2;
    const yPos = nodeWithPosition.y - nodeHeight / 2;

    return {
      id: n.id,
      type: "phase",
      position: { x: xPos, y: yPos },
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

  const flowEdges = graph.edges.map((e, i) => ({
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
