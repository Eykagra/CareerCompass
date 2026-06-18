import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PhaseNode } from "./PhaseNode";
import { layoutRoadmap } from "@/lib/layout";

const nodeTypes = { phase: PhaseNode };
const proOptions = { hideAttribution: true };
const fitViewOptions = { padding: 0.2, maxZoom: 1 };
const defaultEdgeOptions = { type: "smoothstep" };

export function RoadmapCanvas({
  roadmap,
  completed,
  onSelect,
}) {
  const { nodes, edges } = useMemo(
    () => layoutRoadmap(roadmap, completed),
    [roadmap, completed],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      proOptions={proOptions}
      fitView
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
      minZoom={0.3}
      maxZoom={1.6}
      nodesDraggable={false}
      nodesConnectable={false}
      onNodeClick={(_, node) => onSelect(node.id)}
      className="bg-transparent"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={26}
        size={1}
        color="rgba(255,255,255,0.06)"
      />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  );
}
