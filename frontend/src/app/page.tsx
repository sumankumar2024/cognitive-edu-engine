"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import QuizModule from '@/components/QuizModule';
import StudyHub from '@/components/StudyHub';
import UnifiedTutor from '@/components/UnifiedTutor';
import DropzoneGrader from '@/components/DropzoneGrader';
import TimeAllocator from '@/components/TimeAllocator';
import GraphVisualizer from '@/components/GraphVisualizer';
import OnboardingModal from '@/components/OnboardingModal';

export default function Home() {
  // 1. Add NextAuth 'status' tracker
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [userConfig, setUserConfig] = useState<{exam: string, level: string} | null>(null);

  // 2. Hydration Sync (Fixes Error #425)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOnboardingComplete = async (data: { exam: string; level: string }) => {
    setUserConfig(data);
    try {
      console.log("🚀 Firing RAG Pipeline...");
      const response = await fetch("http://127.0.0.1:8000/api/build-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email || "demo_user@startup.com",
          exam: data.exam,
          level: data.level,
        }),
      });
      const result = await response.json();
      console.log("🧠 Neo4j Graph Result:", result);
    } catch (error) {
      console.error("❌ API Connection Failed:", error);
    }
  };

  // 3. THE GATEKEEPER: Show loading screen until hydration matches
  if (!mounted || status === "loading") {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 mt-4 text-sm tracking-widest font-bold">INITIALIZING COGNITIVE ENGINE...</p>
      </main>
    );
  }

  // 4. MAIN UI RENDERS SAFELY
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center p-8 font-sans selection:bg-indigo-500/30 text-slate-100">
      
      {session && !userConfig && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <div className="max-w-7xl w-full relative animate-fade-in-up">
        <header className="mb-10 text-center relative pt-12 lg:pt-0">
          <div className="absolute top-0 right-0 z-10 flex items-center gap-3">
            
            {userConfig && (
              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold tracking-wide backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {userConfig.exam} • {userConfig.level}
              </div>
            )}

            {!session ? (
              <button onClick={() => signIn("google")} className="bg-white text-black px-6 py-2 rounded-lg font-bold shadow-md hover:bg-slate-200 transition-all">
                Continue with Google
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-slate-900/50 p-2 pr-4 rounded-full border border-slate-800 backdrop-blur-md">
                <img src={session.user?.image || ""} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
                <div className="text-right hidden sm:block">
                  <p className="text-slate-100 font-semibold text-sm">{session.user?.name}</p>
                  <button onClick={() => { signOut(); setUserConfig(null); }} className="text-slate-400 text-xs font-medium hover:text-red-400 transition-all">Sign Out</button>
                </div>
              </div>
            )}
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold mb-4 tracking-tighter">
            Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Edu Engine</span>
          </h1>
        </header>

        {!session ? (
          <div className="max-w-3xl mx-auto mt-12 text-center">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
               <h3 className="text-2xl font-bold text-white mb-4">Unlock God Mode</h3>
               <UnifiedTutor /> 
             </div>
          </div>
        ) : userConfig ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-6">
              <GraphVisualizer exam={userConfig.exam} />
              <TimeAllocator exam={userConfig.exam} /> 
              <DropzoneGrader /> 
              <QuizModule exam={userConfig.exam} level={userConfig.level} />
              <StudyHub exam={userConfig.exam} /> 
            </div>
            <div className="lg:col-span-7 h-full sticky top-8">
              <UnifiedTutor />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}