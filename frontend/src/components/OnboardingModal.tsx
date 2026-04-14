"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface OnboardingModalProps {
  onComplete: (data: { exam: string; level: string }) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { data: session } = useSession();
  const [exam, setExam] = useState("");
  const [level, setLevel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!exam || !level) return;
    setIsSubmitting(true);
    
    // Simulate network delay for the hackathon demo effect
    setTimeout(() => {
      onComplete({ exam, level });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"></div>

        <div className="text-center mb-6">
          <img 
            src={session?.user?.image || "https://via.placeholder.com/150"} 
            alt="Profile" 
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome, {session?.user?.name ? session.user.name.split(' ')[0] : "Founder"}!</h2>
          <p className="text-slate-400 text-sm">Let's configure your Cognitive Engine.</p>
        </div>

        <div className="space-y-5">
          {/* Goal Selection */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">What are you preparing for?</label>
            <div className="grid grid-cols-1 gap-2">
              {["GATE Computer Science", "Class 12 Board (PCM)", "Class 10 Board"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExam(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                    exam === opt 
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Current Knowledge Level</label>
            <div className="flex gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLevel(opt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                    level === opt 
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!exam || !level || isSubmitting}
            className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              !exam || !level 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:shadow-indigo-500/25"
            }`}
          >
            {isSubmitting ? "Initializing Brain Map..." : "Generate My Curriculum"}
          </button>
        </div>
      </div>
    </div>
  );
}