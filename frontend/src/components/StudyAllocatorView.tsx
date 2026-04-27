'use client';

import { useState, useEffect } from "react";
import { 
  Clock, Brain, Target, Zap, Play, CheckCircle2, AlertTriangle, Loader2, BookOpen, ChevronRight
} from "lucide-react";

export default function StudyAllocatorView() {
  const [hours, setHours] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<any[] | null>(null);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Dynamically pull weaknesses on load
  useEffect(() => {
    const saved = localStorage.getItem("expoLearn_weaknesses");
    if (saved) {
      setWeaknesses(JSON.parse(saved));
    } else {
      // Emergency failsafe for hackathon demo
      setWeaknesses(["Chemical Reactions", "Electricity", "Carbon Compounds"]);
    }
  }, []);

  const generatePathway = async () => {
    if (weaknesses.length === 0) {
      setError("No weak topics found. Please complete the cognitive diagnostic.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSchedule(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/generate-pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          weaknesses: weaknesses,
          hours: hours 
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setSchedule(result.pathway);
      } else {
        setError(result.message || "AI failed to generate pathway.");
      }
    } catch (err) {
      setError("Server connection failed. Is FastAPI running on port 8000?");
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    // Removed h-full so it doesn't restrict scrolling contexts
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* Dashboard Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Dynamic Study Allocator
            </h2>
            <p className="text-cyan-100/60 text-base mt-1 font-medium">
              AI-driven time management based on cognitive gaps
            </p>
          </div>
        </div>
      </div>

      {/* THE FIX: Changed grid layout to 5/7 ratio to make left side bigger, and forced self-start */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Column: Input Parameters (WIDER & FULLY STICKY) */}
        <div className="lg:col-span-5 sticky top-6 self-start space-y-6 z-20">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col">
            
            {/* Target Weaknesses (ENLARGED TEXT & PADDING) */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" /> Critical Focus Areas
              </h3>
              <div className="flex flex-wrap gap-3">
                {weaknesses.map((w, i) => (
                  <span key={i} className="px-4 py-2.5 bg-slate-800 border border-slate-600 text-white text-sm font-bold rounded-xl shadow-sm hover:border-cyan-500/50 transition-colors">
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {/* Time Slider */}
            <div className="py-8 border-t border-b border-slate-800/60 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" /> Time Block
                </h3>
                <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-lg shadow-inner">
                  <span className="text-cyan-400 font-black text-lg">{hours} hrs</span>
                </div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="8" 
                step="0.5"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded-full appearance-none h-3 cursor-pointer hover:bg-slate-700 transition-all shadow-inner"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-4 font-black uppercase tracking-wider">
                <span>1 hr</span>
                <span>4 hrs</span>
                <span>8 hrs</span>
              </div>
            </div>

            {/* The CTA Button */}
            <button 
              onClick={generatePathway}
              disabled={isGenerating || weaknesses.length === 0}
              className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base uppercase tracking-wide rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />}
              {isGenerating ? "Compiling Matrix..." : "Generate Focus Pathway"}
            </button>

            {error && <p className="text-red-400 text-sm font-bold mt-5 text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
          </div>
        </div>

        {/* Right Column: Output Schedule */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl min-h-[600px]">
          
          {!schedule && !isGenerating && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-500 text-center space-y-6">
              <div className="p-8 bg-slate-800/30 rounded-full border border-slate-800 shadow-inner">
                <Brain className="w-20 h-20 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-300 mb-2">Awaiting Parameters</p>
                <p className="text-base text-slate-500 leading-relaxed max-w-md mx-auto">
                  Adjust your time block on the left panel and let the AI generate a custom, mathematically-weighted learning schedule.
                </p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-cyan-500 animate-spin relative z-10" />
              </div>
              <p className="text-slate-300 font-bold text-lg animate-pulse tracking-wide">AI analyzing volume & complexity...</p>
            </div>
          )}

          {schedule && !isGenerating && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <Play className="w-7 h-7 text-cyan-400 fill-cyan-400/20" /> Optimal Session Plan
                </h3>
                <span className="text-sm font-black uppercase tracking-widest bg-slate-800 text-cyan-400 px-5 py-2.5 rounded-xl border border-slate-700 shadow-sm">
                  Total: {hours} Hours
                </span>
              </div>

              <div className="space-y-5 pt-2">
                {schedule.map((task, idx) => (
                  <div key={idx} className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6 transition-all group">
                    
                    {/* Weightage Badge */}
                    <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-2xl min-w-[100px] h-[100px] shrink-0 shadow-inner">
                      <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500">
                        {task.weightage_percentage}%
                      </span>
                      <span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mt-1">Weight</span>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="text-white font-bold text-xl leading-tight pr-4">{task.topic}</h4>
                        <span className="text-sm font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-xl shrink-0">
                          {formatTime(task.duration_minutes)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{task.type}</span>
                      </div>

                      {/* Dynamic AI Progress Bar */}
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-700 shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 ease-out relative"
                          style={{ width: `${task.weightage_percentage}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800 flex justify-end">
                <button className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-8 py-4 rounded-xl hover:bg-emerald-500/20 hover:scale-[1.02] transition-all border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] group">
                  <CheckCircle2 className="w-6 h-6 group-hover:fill-emerald-400/20" /> Initiate Session <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}