"use client";
import { useEffect, useState } from 'react';

// Accept the prop
export default function TimeAllocator({ exam }: { exam: string }) {
  const [mounted, setMounted] = useState(false);

  // Our 3 Master Templates
  const getSyllabus = (selectedExam: string) => {
    if (selectedExam === "GATE Computer Science") {
      return [
        { topic: "Data Structures & Algorithms", priority: 95, hours: 0, trend: "up", color: "bg-red-500" },
        { topic: "Operating Systems", priority: 80, hours: 0, trend: "down", color: "bg-indigo-500" },
        { topic: "Computer Networks", priority: 60, hours: 0, trend: "stable", color: "bg-emerald-500" }
      ];
    } else if (selectedExam === "Class 12 Board (PCM)") {
      return [
        { topic: "Calculus (Integration)", priority: 90, hours: 0, trend: "up", color: "bg-red-500" },
        { topic: "Electromagnetism", priority: 85, hours: 0, trend: "down", color: "bg-indigo-500" },
        { topic: "Organic Chemistry", priority: 70, hours: 0, trend: "stable", color: "bg-emerald-500" }
      ];
    } else {
      return [
        { topic: "Quadratic Equations", priority: 85, hours: 0, trend: "up", color: "bg-red-500" },
        { topic: "Light: Reflection & Refraction", priority: 75, hours: 0, trend: "stable", color: "bg-indigo-500" },
        { topic: "Life Processes", priority: 60, hours: 0, trend: "down", color: "bg-emerald-500" }
      ];
    }
  };

  const initialAllocations = getSyllabus(exam);
  const [allocations, setAllocations] = useState(initialAllocations);

  useEffect(() => {
    setMounted(true);
    // Simulate AI calculating the dynamic hours based on priority
    const calculated = initialAllocations.map(a => ({
      ...a,
      hours: Math.round((a.priority / 100) * 15) // Allocating out of 15 total study hours
    })).sort((a, b) => b.priority - a.priority);
    setAllocations(calculated);
  }, [exam]); // Re-run if exam changes

  if (!mounted) return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64 animate-pulse"></div>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Dynamic Study Allocator
        </h3>
        <span className="text-xs font-medium bg-slate-800 text-slate-300 px-2 py-1 rounded-md">AI Generated</span>
      </div>

      <div className="space-y-5">
        {allocations.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex justify-between text-sm mb-1 text-slate-300">
              <span className="font-medium">{item.topic}</span>
              <span>{item.hours} hrs <span className="text-slate-500 text-xs">({item.priority}% priority)</span></span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${item.priority}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}