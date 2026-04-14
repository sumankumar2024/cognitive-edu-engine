"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";

// Dynamically import the graph to prevent Next.js hydration crashes
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { 
  ssr: false,
  loading: () => <div className="text-cyan-400 text-sm animate-pulse flex items-center justify-center h-full">Waking up Neural Network...</div>
});

export default function GraphVisualizer({ exam }: { exam?: string }) {
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      // Don't fetch until we have the user's email
      if (!session?.user?.email) return;

      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/graph', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session.user.email })
        });
        
        const data = await response.json();
        if (data.nodes && data.nodes.length > 0) {
           setGraphData(data);
        }
      } catch (error) {
        console.error("Failed to fetch Live Map:", error);
      }
    };

    if (isMounted) fetchGraph();
  }, [session, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-64 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 relative">
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="label"
          nodeColor={node => node.group === 1 ? "#3B82F6" : "#10B981"} // Blue for user, Green for concepts
          linkColor={() => "rgba(255,255,255,0.2)"}
          backgroundColor="#111827"
        />
      ) : (
        <div className="text-slate-500 text-sm flex items-center justify-center h-full">
          No map data yet. Upload an assignment or set a goal!
        </div>
      )}
    </div>
  );
}