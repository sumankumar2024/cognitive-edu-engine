"use client";
import { useState } from 'react';

export default function StudyHub({ exam = "General" }: { exam?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pathReady, setPathReady] = useState(false);

  const handleGeneratePath = () => {
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); setPathReady(true); }, 1500);
  };

  const content = exam === "GATE Computer Science" 
    ? { mod1: "Deep Dive: Big-O Notation", mod2: "OS Memory Management" }
    : { mod1: "Integration by Parts", mod2: "Electromagnetic Induction" };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        AI Study Hub
      </h3>

      {!pathReady ? (
        <div className="text-center py-4">
          <button onClick={handleGeneratePath} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold w-full">
            {isGenerating ? "Synthesizing Modules..." : "Generate AI Path"}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in-up">
          <div className="p-3 bg-slate-800 rounded-lg border-l-4 border-emerald-500">
            <p className="text-emerald-400 text-xs font-bold mb-1">MODULE 1 • RECOMMENDED</p>
            <p className="text-white text-sm">{content.mod1}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border-l-4 border-indigo-500 opacity-50">
            <p className="text-indigo-400 text-xs font-bold mb-1">MODULE 2 • LOCKED</p>
            <p className="text-white text-sm">{content.mod2}</p>
          </div>
        </div>
      )}
    </div>
  );
}