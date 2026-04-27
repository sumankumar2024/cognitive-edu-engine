'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  PieChart, Pie, Cell, Tooltip 
} from 'recharts';
import { 
  Activity, Target, AlertTriangle, Loader2, BrainCircuit, 
  Zap, ShieldAlert, FileText, ChevronRight, Sparkles 
} from 'lucide-react';

const MASTER_CHAPTERS = [
  "Chemical Reactions",
  "Acids & Bases",
  "Life Processes",
  "Light & Refraction",
  "Electricity",
  "Magnetic Effects"
];

interface StudyHubProps {
  onNavigateToAllocator?: () => void;
}

export default function StudyHubView({ onNavigateToAllocator }: StudyHubProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRealtimeAnalytics = () => {
      const savedWeaknessesStr = localStorage.getItem("expoLearn_weaknesses");
      const weakChapters: string[] = savedWeaknessesStr ? JSON.parse(savedWeaknessesStr) : ["Electricity", "Life Processes"];
      
      const radarStats = MASTER_CHAPTERS.map(chapter => {
        const isWeak = weakChapters.some(w => w.includes(chapter.split(" ")[0])); 
        return {
          subject: chapter,
          score: isWeak ? Math.floor(Math.random() * 15) + 30 : Math.floor(Math.random() * 13) + 85
        };
      });

      const strongCount = MASTER_CHAPTERS.length - weakChapters.length;
      const completionRate = Math.floor((strongCount / MASTER_CHAPTERS.length) * 100);

      setData({
        radar_stats: radarStats,
        completion_rate: completionRate,
        weak_areas: weakChapters
      });
      setLoading(false);
    };

    setTimeout(generateRealtimeAnalytics, 800);
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-cyan-400 bg-slate-950 rounded-3xl">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <Loader2 className="w-16 h-16 animate-spin relative z-10" />
        </div>
        <p className="font-black text-xl animate-pulse tracking-[0.2em] uppercase text-white">Neural Sync in Progress...</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Mastered', value: data.completion_rate },
    { name: 'Remaining Gap', value: 100 - data.completion_rate },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 pb-24">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">
            Cognitive Hub
          </h1>
          <p className="text-slate-400 mt-2 font-bold text-lg">Neural performance mapping & gap analysis</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-xl relative z-10">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
          <span className="font-black text-slate-200 uppercase tracking-widest text-sm text-white">Engine Status: Live</span>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Knowledge Radar Matrix (Fixed Width & Levitation) */}
        <div className="lg:col-span-8 bg-slate-900 border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden min-w-0">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 shadow-inner">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Knowledge Radar</h3>
          </div>
          
          <div className="h-[450px] w-full pt-4 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart 
                cx="50%" 
                cy="42%" 
                outerRadius="60%" 
                data={data.radar_stats}
                margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
              >
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Mastery" dataKey="score" stroke="#22d3ee" strokeWidth={4} 
                  fill="url(#radarGradient)" fillOpacity={0.6} 
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Pie Progress */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-white/5 flex flex-col items-center relative overflow-hidden group">
            <div className="w-full flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white">Syllabus Mastery</h3>
            </div>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={105} paddingAngle={8} dataKey="value" stroke="none">
                    <Cell fill="#10b981" />
                    <Cell fill="#1e293b" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-6xl font-black text-white tracking-tighter">{data.completion_rate}%</span>
                <span className="text-[10px] font-black text-emerald-400 mt-2 uppercase tracking-[0.3em]">Mastered</span>
              </div>
            </div>
          </div>

          {/* Adaptive Mock Test (Coming Soon) */}
          <div className="relative group">
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce uppercase border border-white/20">
              Coming Soon
            </div>
            <button disabled className="w-full p-8 rounded-3xl bg-slate-800/40 border border-white/5 flex flex-col items-center text-center gap-4 opacity-60 cursor-not-allowed">
               <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-md">
                 <FileText className="w-10 h-10 text-slate-500" />
               </div>
               <div>
                 <h3 className="text-2xl font-black text-slate-400 tracking-tight">Mock Tests</h3>
                 <p className="text-slate-500 font-bold mt-1 text-sm">Full adaptive board simulation</p>
               </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- FOOTER: CRITICAL GAPS --- */}
      <div className="bg-slate-900 border-2 border-red-500/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/40 via-orange-500/40 to-red-500/40"></div>
         <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 shadow-inner">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-400 tracking-tight">Critical Gaps</h3>
                <p className="text-slate-400 font-bold">Priority focus required for these chapters</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 flex-1 justify-center px-4">
              {data.weak_areas.map((area: string, index: number) => (
                <div key={index} className="flex items-center gap-3 bg-red-500/5 backdrop-blur-sm px-5 py-3 rounded-2xl border border-red-500/20">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
                  <span className="font-black text-slate-100 text-sm">{area}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={onNavigateToAllocator}
              className="whitespace-nowrap px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all transform hover:scale-[1.05] active:scale-95 shadow-2xl uppercase tracking-widest text-xs flex items-center gap-3 group"
            >
              Fix Gaps Now <Zap className="w-5 h-5 fill-current group-hover:animate-bounce text-black" />
            </button>
         </div>
      </div>
    </div>
  );
}