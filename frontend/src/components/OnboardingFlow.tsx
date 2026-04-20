"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Target, CheckCircle2, AlertTriangle, Zap, ArrowRight, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const class10Chapters = [
  "Chemical Reactions & Equations",
  "Acids, Bases and Salts",
  "Life Processes",
  "Light: Reflection and Refraction",
  "Electricity",
  "Magnetic Effects of Electric Current"
];

// CRITICAL FIX: Updated the interface to pass data back to the dashboard
export default function OnboardingFlow({ onComplete }: { onComplete: (data: { exam: string; level: string }) => void }) {
  const [step, setStep] = useState(1);
  const { user } = useUser();
  
  // Step 1 State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [exam, setExam] = useState("Class 10 Science Board");
  
  // Step 2 & 3 State
  const [level, setLevel] = useState<string | null>(null);
  const [criticalChapters, setCriticalChapters] = useState<string[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const toggleChapter = (chapter: string) => {
    setCriticalChapters(prev => 
      prev.includes(chapter) ? prev.filter(c => c !== chapter) : [...prev, chapter]
    );
  };

 const handleFinalize = async () => {
    setIsSeeding(true);
    
    // Fallback email just in case Clerk hasn't loaded
    const userEmail = user?.primaryEmailAddress?.emailAddress || "anonymous@student.com";
    
    try {
      // 🚀 1. CREATE THE GRAPH IN NEO4J FOR THIS SPECIFIC USER
      const response = await fetch("http://localhost:8000/api/build-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail, // PASS THE REAL EMAIL
          exam: exam,
          level: level || "Beginner",
          critical_chapters: criticalChapters
        })
      });

      localStorage.setItem("expoLearn_weaknesses", JSON.stringify(criticalChapters));

      setTimeout(() => {
        onComplete({ exam, level: level || "Beginner" });
      }, 1000);

    } catch (error) {
      console.error("Backend offline, running failsafe...", error);
      localStorage.setItem("expoLearn_weaknesses", JSON.stringify(criticalChapters));
      onComplete({ exam, level: level || "Beginner" });
    }
  };

  if (isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0A] text-white">
        <BrainCircuit size={64} className="text-blue-500 animate-pulse mb-6" />
        <h2 className="text-3xl font-bold mb-2">Seeding Knowledge Graph...</h2>
        <p className="text-gray-400">Mapping {name}'s cognitive baseline to the neural network.</p>
        <div className="w-64 h-2 bg-gray-800 rounded-full mt-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "100%" }} 
            transition={{ duration: 2.5 }}
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#050505] text-white p-6">
      <div className="max-w-2xl w-full bg-[#111] border border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* STEP 1: Basic Intel */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 text-blue-400 mb-4">
              <User size={24} />
              <span className="font-bold tracking-widest uppercase text-sm">Step 1 of 3</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Create Your Profile</h2>
            <p className="text-gray-400 mb-8">Tell the Cognitive Engine who it is adapting to.</p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="text-gray-400 text-sm mb-1 block font-medium">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="Enter your name" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block font-medium">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                    placeholder="e.g. 15" 
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block font-medium">Target Exam</label>
                  <select 
                    value={exam} 
                    onChange={(e) => setExam(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="Class 10 Science Board">Class 10 Science Board</option>
                    <option value="JEE Mains">JEE Mains</option>
                    <option value="NEET">NEET</option>
                    <option value="SAT">SAT</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!name || !age}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: Baseline */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 text-purple-400 mb-4">
              <Target size={24} />
              <span className="font-bold tracking-widest uppercase text-sm">Step 2 of 3</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Establish Cognitive Baseline</h2>
            <p className="text-gray-400 mb-8">You are targeting <strong className="text-white">{exam}</strong>. How would you rate your overall preparation level right now?</p>
            
            <div className="grid grid-cols-1 gap-4 mb-8">
              {["Beginner (Starting from scratch)", "Intermediate (Know the basics, need practice)", "Advanced (Ready for mock tests)"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLevel(opt)}
                  className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                    level === opt ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "bg-[#1A1A1A] border-gray-800 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <span className="font-semibold">{opt}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setStep(3)}
              disabled={!level}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 3: Weaknesses */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex items-center gap-3 text-red-400 mb-4">
              <Zap size={24} />
              <span className="font-bold tracking-widest uppercase text-sm">Step 3 of 3</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Identify Knowledge Gaps</h2>
            <p className="text-gray-400 mb-6">Select the {exam} chapters you find most difficult. Our AI will automatically prioritize these.</p>
            
            <button 
              onClick={() => setCriticalChapters(class10Chapters)}
              className="mb-6 text-sm text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
            >
              <AlertTriangle size={14} /> Mark all chapters as critical (I need full review)
            </button>

            <div className="grid grid-cols-2 gap-3 mb-8 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
              {class10Chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => toggleChapter(chapter)}
                  className={`p-4 rounded-xl border text-left text-sm transition-all duration-300 flex items-start gap-3 ${
                    criticalChapters.includes(chapter) 
                      ? "bg-red-500/10 border-red-500/50 text-red-400" 
                      : "bg-[#1A1A1A] border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <div className="mt-0.5">
                    {criticalChapters.includes(chapter) ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} className="opacity-50" />}
                  </div>
                  <span className="font-medium leading-tight">{chapter}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleFinalize}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
            >
              Initialize Knowledge Graph <BrainCircuit size={18} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}