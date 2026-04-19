"use client";
import { useState } from "react";
import { 
  MessageSquare, Network, Clock, CheckCircle, 
  Lightbulb, BookOpen, BarChart2 
} from "lucide-react";
import ChatbotInterface from "@/components/ChatbotInterface";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import QuizGeneratorView from "@/components/QuizGeneratorView";
import AutoGraderView from "@/components/AutoGraderView"; // <-- ADD THIS LINE
import StudyHubView from "@/components/StudyHubView";
import StudyAllocatorView from "@/components/StudyAllocatorView"; // <-- ADD THIS LINE
import AINotesView from "@/components/AINotesView";

// We will import the other components here as we build them!

export default function MasterDashboard() {
  const [activeFeature, setActiveFeature] = useState("chatbot");

  const navItems = [
    { id: "chatbot", label: "StudyPilot", icon: <MessageSquare size={20} /> },
    { id: "knowledge-graph", label: "Knowledge Graph", icon: <Network size={20} /> },
    { id: "study-allocator", label: "Study Allocator", icon: <Clock size={20} /> },
    { id: "auto-grader", label: "Auto-Grader", icon: <CheckCircle size={20} /> },
    { id: "quiz", label: "Quiz Generator", icon: <Lightbulb size={20} /> },
    { id: "study-hub", label: "Study Hub", icon: <BookOpen size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* SLEEK SIDEBAR */}
      <aside className="w-64 border-r border-gray-800 bg-[#111] flex flex-col">
        {/* Logo / Title */}
        <div className="p-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ExpoLearn
          </h1>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
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
          ))}
        </nav>

        {/* --- USER PROFILE FOOTER --- */}
        <div className="p-6 mt-auto border-t border-gray-800/50 flex flex-col items-center justify-center text-center bg-gradient-to-t from-[#0A0A0A] to-transparent">
          {/* Glowing Avatar Circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] mb-3 border-2 border-gray-900">
            A
          </div>
          
          {/* User Details */}
          <p className="text-xs font-medium text-gray-400 mb-2">
            Class 10 Board
          </p>
          
          {/* Level Badge */}
          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
            Beginner Level
          </span>
        </div>
      </aside>

      {/* DYNAMIC MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden">
        {activeFeature === "chatbot" && <ChatbotInterface />}
        {activeFeature === "knowledge-graph" && <KnowledgeGraphView />}
        {activeFeature === "study-allocator" && <StudyAllocatorView />}
        {activeFeature === "auto-grader" && <AutoGraderView />}
        {activeFeature === "quiz" && <QuizGeneratorView />}
        
        {/* THE FIX: Separation of powers */}
        {activeFeature === "study-hub" && <AINotesView />} {/* <-- Routes to the new AI Notes feature */}
        {activeFeature === "analytics" && <StudyHubView />} {/* <-- Routes to the Dashboard we built earlier */}
        
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