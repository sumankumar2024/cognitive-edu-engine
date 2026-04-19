"use client";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Target, Award, Zap, Brain, Network, ChevronRight } from "lucide-react";

export default function StudyHubView() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Trigger entrance animations
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { label: "Cognitive XP", value: "12,450", icon: <Zap size={20} className="text-yellow-400"/>, color: "border-yellow-500/30 bg-yellow-500/10" },
    { label: "Active Synapses", value: "847", icon: <Network size={20} className="text-blue-400"/>, color: "border-blue-500/30 bg-blue-500/10" },
    { label: "Study Hours", value: "42.5", icon: <Clock size={20} className="text-purple-400"/>, color: "border-purple-500/30 bg-purple-500/10" },
    { label: "Global Rank", value: "Top 4%", icon: <Award size={20} className="text-green-400"/>, color: "border-green-500/30 bg-green-500/10" },
  ];

  const masteryLevels = [
    { subject: "Calculus Integration", level: 85, color: "from-blue-500 to-cyan-400" },
    { subject: "Thermodynamics", level: 62, color: "from-purple-500 to-pink-500" },
    { subject: "Chemical Bonding", level: 91, color: "from-green-500 to-emerald-400" },
    { subject: "Electromagnetism", level: 45, color: "from-red-500 to-orange-500" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto scrollbar-hide p-8 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <header className="mb-10 relative z-10">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          Cognitive Command Center
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Real-time analytics of your Neural Knowledge Map and learning trajectory.
        </p>
      </header>

      <div className="max-w-6xl w-full mx-auto space-y-8 relative z-10">
        
        {/* TOP ROW: Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-3xl border bg-[#111] shadow-xl transition-all duration-700 transform ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${stat.color}`}>
                {stat.icon}
              </div>
              <h4 className="text-3xl font-bold text-white mb-1">{stat.value}</h4>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* MIDDLE ROW: Charts & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart: Subject Mastery */}
          <div className="lg:col-span-2 bg-[#111] border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-gray-400" size={20} /> Domain Mastery
              </h3>
              <button className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View Full Graph <ChevronRight size={16} />
              </button>
            </div>

            <div className="space-y-6">
              {masteryLevels.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-300">{item.subject}</span>
                    <span className="text-sm font-bold text-white">{item.level}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out relative`}
                      style={{ width: isLoaded ? `${item.level}%` : "0%" }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: AI Insights */}
          <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
             {/* Scanner effect background */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
             
             <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Brain className="text-purple-400" size={20} /> AI Synthesis
             </h3>

             <div className="space-y-5 relative z-10">
               <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 items-start">
                 <TrendingUp className="text-green-400 shrink-0 mt-0.5" size={18} />
                 <div>
                   <h4 className="text-sm font-bold text-green-100">Calculus Breakthrough</h4>
                   <p className="text-xs text-green-200/70 mt-1">Your recent quiz performance shows a 34% increase in integration retention.</p>
                 </div>
               </div>

               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5 shrink-0"></div>
                 <div>
                   <h4 className="text-sm font-bold text-red-100">Electromagnetism Warning</h4>
                   <p className="text-xs text-red-200/70 mt-1">Knowledge decay detected. Recommend scheduling a 20-min review session today.</p>
                 </div>
               </div>
             </div>

             <button className="w-full mt-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
               GENERATE STUDY PLAN
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}