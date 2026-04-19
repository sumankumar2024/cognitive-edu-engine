"use client";
import { useState } from "react";
import { Clock, Brain, Target, Zap, Play, CheckCircle2, AlertTriangle } from "lucide-react";

export default function StudyAllocatorView() {
  const [hours, setHours] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<any[] | null>(null);

  // Mock data representing the AI reading the Knowledge Graph
  const weakSpots = ["Thermodynamics Laws", "Calculus Integration", "Chemical Bonding"];

  const generatePathway = () => {
    setIsGenerating(true);
    setSchedule(null);
    
    // Simulate API call to AI Backend
    setTimeout(() => {
      // Math to divide time (MVP Magic)
      const baseMinutes = (hours * 60) / 3; 
      
      setSchedule([
        { title: "Thermodynamics Laws", type: "Core Concept", duration: Math.floor(baseMinutes * 1.2), color: "from-red-500 to-orange-500", icon: <AlertTriangle size={18} /> },
        { title: "Calculus Integration", type: "Active Recall", duration: Math.floor(baseMinutes * 1.0), color: "from-yellow-400 to-yellow-600", icon: <Brain size={18} /> },
        { title: "Chemical Bonding", type: "Quick Quiz", duration: Math.floor(baseMinutes * 0.8), color: "from-blue-500 to-cyan-500", icon: <Target size={18} /> },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto scrollbar-hide p-8">
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Zap className="text-yellow-400" size={28} />
          Dynamic Study Allocator
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          AI-driven time allocation based on your Neural Knowledge Map weaknesses.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        
        {/* LEFT PANEL: The Engine Controls */}
        <div className="col-span-1 space-y-6">
          {/* Target Weaknesses Card */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target size={16} /> Targeted Weaknesses
            </h3>
            <div className="space-y-3">
              {weakSpots.map((spot, i) => (
                <div key={i} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-400 text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  {spot}
                </div>
              ))}
            </div>
          </div>

          {/* Time Input Card */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} /> Available Time Today
            </h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-bold text-white">{hours}</span>
              <span className="text-gray-400 mb-1 font-medium">Hours</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="8" 
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-4"
            />
            
            <button 
              onClick={generatePathway}
              disabled={isGenerating}
              className={`w-full mt-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                isGenerating 
                  ? "bg-blue-600/50 text-blue-200 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:scale-[1.02]"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ANALYZING SYNAPSES...
                </>
              ) : (
                <>
                  <Play size={18} /> GENERATE PATHWAY
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: The Generated Timeline */}
        <div className="col-span-2">
          {schedule ? (
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-xl font-bold text-white mb-6">Optimized Cognitive Pathway</h3>
              
              <div className="relative border-l-2 border-gray-800 ml-4 space-y-8 pb-4">
                {schedule.map((task, i) => (
                  <div key={i} className="relative pl-8 group">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-gradient-to-br ${task.color} shadow-[0_0_10px_currentColor] border-2 border-[#111]`}></div>
                    
                    <div className="bg-[#1A1A1A] border border-gray-800 hover:border-gray-600 transition-colors rounded-xl p-5 shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${task.color} text-white`}>
                            {task.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-200">{task.title}</h4>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">{task.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-sm font-bold text-white">{task.duration} min</span>
                        </div>
                      </div>

                      {/* Progress Bar visual */}
                      <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
                        <div className={`h-1.5 rounded-full bg-gradient-to-r ${task.color} w-0 group-hover:w-full transition-all duration-1000 ease-out`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                 <button className="flex items-center gap-2 text-sm font-bold text-green-400 bg-green-400/10 px-6 py-3 rounded-full hover:bg-green-400/20 transition-colors border border-green-400/20">
                   <CheckCircle2 size={18} /> START SESSION
                 </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center text-gray-600 bg-[#0A0A0A]/50">
              <Brain size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Awaiting Input Parameters</p>
              <p className="text-sm mt-2 max-w-sm text-center">Adjust your available time and generate a custom learning pathway tailored to your cognitive weaknesses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}