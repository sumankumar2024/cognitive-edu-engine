"use client";

export default function KnowledgeGraphView() {
  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* HEADER WITH LEGEND */}
      <div className="p-6 border-b border-gray-800/50 flex justify-between items-center backdrop-blur-md z-10 relative">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Neural Knowledge Map</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time visualization of your cognitive state</p>
        </div>
        
        {/* GRAPH LEGEND */}
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div> Strong</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div> Needs Practice</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div> Weakness</div>
        </div>
      </div>

      {/* GRAPH CONTAINER */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505]">
        
        {/* YOUR EXISTING GRAPH COMPONENT GOES HERE!
          If you are using ForceGraph2D or React Flow, render it here.
          Ensure its width and height are set to 100% so it fills this massive space.
        */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
          <p className="text-gray-600 animate-pulse tracking-widest">[ Graph Rendering Engine ]</p>
        </div>

      </div>
    </div>
  );
}