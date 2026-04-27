"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Network, Brain, Zap, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

// 🚀 CRITICAL FIX: Dynamically import the graph so Next.js doesn't crash on SSR
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function KnowledgeGraphView() {
  const { user } = useUser();
  const [graphData, setGraphData] = useState<{nodes: any[], links: any[]}>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref to measure the container so the canvas fits perfectly
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, [containerRef, isLoading]);

  // 🛡️ THE GUARANTEED RENDER FAILSAFE
  const loadFallbackData = () => {
     console.log("🛡️ Loading Graph from Local Storage Failsafe...");
     const weaknesses = JSON.parse(localStorage.getItem("expoLearn_weaknesses") || "[]");
     const exam = localStorage.getItem("expoLearn_exam") || "Target Exam";

     // Center Node
     const nodes = [{ id: exam, name: exam, val: 12, color: "#3b82f6" }]; 
     const links: any[] = [];

     if (weaknesses.length > 0) {
        weaknesses.forEach((w: string) => {
           nodes.push({ id: w, name: w, val: 8, color: "#ef4444" }); // Weaknesses are Red
           links.push({ source: exam, target: w });
        });
     } else {
        nodes.push(
           { id: "Calculus", name: "Calculus", val: 8, color: "#ef4444" },
           { id: "Physics", name: "Physics", val: 6, color: "#eab308" }
        );
        links.push({ source: exam, target: "Calculus" }, { source: exam, target: "Physics" });
     }
     
     setGraphData({ nodes, links });
     setIsLoading(false);
  };

  useEffect(() => {
    const fetchGraphData = async () => {
      if (!user) return;
      const userEmail = user.primaryEmailAddress?.emailAddress || "anonymous@student.com";

      try {
        const response = await fetch("http://localhost:8000/api/build-brain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            exam: localStorage.getItem("expoLearn_exam") || "Class 10 Board",
            level: localStorage.getItem("expoLearn_level") || "Beginner",
            critical_chapters: JSON.parse(localStorage.getItem("expoLearn_weaknesses") || "[]")
          })
        });

        const data = await response.json();

        // Map AI JSON directly into the format react-force-graph expects
        if (data.source === "local_engine" && data.graph_data && data.graph_data.concepts.length > 0) {
           const formattedNodes = data.graph_data.concepts.map((c: any) => ({
              id: c.name,
              name: c.name,
              val: c.weight * 1.5, // Scale up for visual size
              // Red for critical (>8), Yellow for intermediate, Green for mastered
              color: c.weight >= 8 ? "#ef4444" : (c.weight >= 5 ? "#eab308" : "#22c55e")
           }));
           
           const formattedLinks = data.graph_data.prerequisites.map((p: any) => ({
              source: p.source,
              target: p.target
           }));

           setGraphData({ nodes: formattedNodes, links: formattedLinks });
           setIsLoading(false);
        } else {
           loadFallbackData();
        }
      } catch (error) {
        console.error("Backend offline, triggering fallback...", error);
        loadFallbackData();
      }
    };

    fetchGraphData();
  }, [user]);

  return (
    <div className="flex flex-col h-full bg-[#020617] p-8">
      {/* Header */}
      <header className="mb-6 shrink-0">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Network className="text-blue-500" size={28} />
          Cognitive Neural Map
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          A dynamic, real-time visualization of your knowledge architecture and cognitive gaps.
        </p>
      </header>

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* The Graph Canvas Container */}
        <div 
          ref={containerRef} 
          className="flex-1 bg-[#0F172A] border border-gray-800 rounded-3xl overflow-hidden relative shadow-2xl"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A] z-10">
              <Brain size={48} className="text-blue-500 animate-pulse mb-4" />
              <p className="text-gray-400 animate-pulse tracking-widest font-medium">MAPPING SYNAPSES...</p>
            </div>
          ) : (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="name"
              nodeColor="color"
              nodeRelSize={6}
              linkColor={() => "#334155"} // Gray links
              linkWidth={2}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={0.005}
              backgroundColor="#111111"
              onNodeDragEnd={node => {
                // Pin nodes in place after dragging for a cool UX interaction
                node.fx = node.x;
                node.fy = node.y;
              }}
            />
          )}
          
          {/* Overlay UI Badge */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-gray-700 p-3 rounded-xl flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Critical Nodes Identified</span>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-80 shrink-0 bg-[#0F172A] border border-gray-800 rounded-3xl p-6 flex flex-col">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap size={16} /> Neural Metrics
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-gray-800">
              <p className="text-xs text-gray-500 mb-1">Target Architecture</p>
              <p className="text-lg font-bold text-white">{localStorage.getItem("expoLearn_exam") || "Exam"}</p>
            </div>
            
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-xs text-red-400 mb-2 font-bold uppercase tracking-wider">Critical Interventions</p>
              <ul className="space-y-2">
                {graphData.nodes.filter(n => n.color === "#ef4444").map((node, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {node.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => setIsLoading(true)} 
            className="mt-auto w-full py-4 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> RECALIBRATE GRAPH
          </button>
        </div>

      </div>
    </div>
  );
}