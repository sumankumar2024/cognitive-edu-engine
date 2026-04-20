"use client";
import { useState, useEffect } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { 
  MessageSquare, Network, Clock, CheckCircle, 
  Lightbulb, BookOpen, BarChart2, Lock
} from "lucide-react";
import ChatbotInterface from "@/components/ChatbotInterface";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import QuizGeneratorView from "@/components/QuizGeneratorView";
import AutoGraderView from "@/components/AutoGraderView"; 
import StudyHubView from "@/components/StudyHubView";
import StudyAllocatorView from "@/components/StudyAllocatorView"; 
import AINotesView from "@/components/AINotesView";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function MasterDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeFeature, setActiveFeature] = useState("chatbot");
  const [hasOnboarded, setHasOnboarded] = useState(false);
  
  // State to hold the dynamic profile data
  const [userExam, setUserExam] = useState("Class 10 Board");
  const [userLevel, setUserLevel] = useState("Beginner");

  useEffect(() => {
    if (!isSignedIn) {
      localStorage.removeItem("expoLearn_onboarded");
      setHasOnboarded(false);
    } else if (localStorage.getItem("expoLearn_onboarded") === "true") {
      setHasOnboarded(true);
      // Retrieve the saved data so it persists across refreshes
      setUserExam(localStorage.getItem("expoLearn_exam") || "Class 10 Board");
      setUserLevel(localStorage.getItem("expoLearn_level") || "Beginner");
    }
  }, [isSignedIn]);

  // Capture the data passed from the OnboardingFlow
  const handleOnboardingComplete = (data: { exam: string; level: string }) => {
    localStorage.setItem("expoLearn_onboarded", "true");
    localStorage.setItem("expoLearn_exam", data.exam);
    localStorage.setItem("expoLearn_level", data.level);
    
    setUserExam(data.exam);
    setUserLevel(data.level);
    setHasOnboarded(true);
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Trap them in the Onboarding Flow if they are logged in but haven't completed it
  if (isSignedIn && !hasOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const navItems = [
    { id: "chatbot", label: "StudyPilot", icon: <MessageSquare size={20} />, requiresAuth: false },
    { id: "knowledge-graph", label: "Knowledge Graph", icon: <Network size={20} />, requiresAuth: true },
    { id: "study-allocator", label: "Study Allocator", icon: <Clock size={20} />, requiresAuth: true },
    { id: "auto-grader", label: "Auto-Grader", icon: <CheckCircle size={20} />, requiresAuth: true },
    { id: "quiz", label: "Quiz Generator", icon: <Lightbulb size={20} />, requiresAuth: true },
    { id: "study-hub", label: "Study Hub", icon: <BookOpen size={20} />, requiresAuth: true },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={20} />, requiresAuth: true },
  ];

  // Quick helper to grab just the first word of the level (e.g., "Beginner" from "Beginner (Starting from scratch)")
  const displayLevel = userLevel.split(" ")[0];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      
      {/* SLEEK SIDEBAR */}
      <aside className="w-64 border-r border-gray-800 bg-[#111] flex flex-col">
        {/* Logo / Title */}
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ExpoLearn
          </h1>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isLocked = !isSignedIn && item.requiresAuth;

            return (
              <div key={item.id} className="relative w-full">
                {isLocked ? (
                  <SignInButton mode="modal">
                    <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 text-gray-500 hover:bg-gray-800/50 hover:text-gray-400 border border-transparent group">
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Lock size={14} className="text-gray-600 group-hover:text-red-400 transition-colors" />
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    onClick={() => setActiveFeature(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeFeature === item.id 
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* --- USER PROFILE FOOTER --- */}
        <div className="p-4 mt-auto border-t border-gray-800/50 flex flex-col items-center justify-center text-center bg-gradient-to-t from-[#0A0A0A] to-transparent min-h-[140px]">
          {isSignedIn ? (
            <div className="flex flex-col items-center w-full mt-2">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-12 h-12 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-2" } }} />
              <p className="text-sm font-bold text-gray-200 mt-1">{user?.fullName || "Student"}</p>
              
              {/* DYNAMIC EXAM & LEVEL RENDERING */}
              <p className="text-xs font-medium text-gray-400 mb-2">{userExam}</p>
              <span className="inline-block px-3 py-1 mb-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                {displayLevel} LEVEL
              </span>
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] mt-4">
                Sign In to Unlock
              </button>
            </SignInButton>
          )}
        </div>
      </aside>

      {/* DYNAMIC MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden overflow-y-auto">
        
        {!isSignedIn && activeFeature === "chatbot" && (
          <div className="absolute top-4 right-8 z-50 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 backdrop-blur-md">
            <Lock size={12} /> TEASER MODE
          </div>
        )}

        {activeFeature === "chatbot" && <ChatbotInterface />}
        {activeFeature === "knowledge-graph" && isSignedIn && <KnowledgeGraphView />}
        {activeFeature === "study-allocator" && isSignedIn && <StudyAllocatorView />}
        {activeFeature === "auto-grader" && isSignedIn && <AutoGraderView />}
        {activeFeature === "quiz" && isSignedIn && <QuizGeneratorView />}
        {activeFeature === "study-hub" && isSignedIn && <AINotesView />} 
        {activeFeature === "analytics" && isSignedIn && <StudyHubView />} 
        
        {/* Placeholder for anything else */}
        {!["chatbot", "knowledge-graph", "study-allocator", "auto-grader", "quiz", "study-hub", "analytics"].includes(activeFeature) && ( 
          <div className="flex h-full flex-col items-center justify-center text-gray-500 bg-[#050505]">
            <div className="w-16 h-16 mb-4 rounded-full border-t-2 border-blue-500 animate-spin"></div>
            <h2 className="text-2xl animate-pulse tracking-widest">INITIALIZING MODULE...</h2>
          </div>
        )}
      </main>
    </div>
  );
}