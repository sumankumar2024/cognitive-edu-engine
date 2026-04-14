"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the graph to prevent Next.js hydration crashes
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => <div className="text-cyan-400 text-sm animate-pulse flex items-center justify-center h-full">Waking up Neural Network...</div>
});

export default function GraphVisualizer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulated Graph Data (Will connect to Neo4j later)
  const graphData = {
    nodes: [
      { id: "Physics", group: 1, val: 20 },
      { id: "Optics", group: 2, val: 10, color: "#10B981" }, // Mastered (Green)
      { id: "Calculus", group: 3, val: 15, color: "#EF4444" }, // Struggling (Red)
      { id: "Electromagnetism", group: 2, val: 10, color: "#8B5CF6" } // Purple
    ],
    links: [
      { source: "Physics", target: "Optics" },
      { source: "Physics", target: "Electromagnetism" },
      { source: "Calculus", target: "Physics" }
    ]
  };

  if (!isMounted) return null;

  return (
    <div className="w-full h-64 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="id"
        nodeColor={node => node.color || "#06b6d4"} // Default Cyan
        linkColor={() => "rgba(255,255,255,0.2)"}
        backgroundColor="#111827"
        nodeRelSize={6}
        linkDirectionalParticles={2} // Glowing data particles flowing between nodes!
        linkDirectionalParticleSpeed={0.01}
      />
      <div className="absolute top-3 left-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Live Cognitive Map
      </div>
    </div>
  );
}