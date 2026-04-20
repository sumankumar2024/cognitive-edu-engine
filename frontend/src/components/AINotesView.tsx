"use client";
import { useState, useEffect } from "react";
import { BookOpen, Sparkles, BrainCircuit, Target, Download, FileText, PenTool } from "lucide-react";
import HandwritingNotes from "@/components/HandwritingNotes";
import ReactMarkdown from "react-markdown";

export default function AINotesView() {
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "generating" | "complete">("idle");
  const [generatedNotes, setGeneratedNotes] = useState<string>("");

  // 1. DYNAMICALLY LOAD USER'S REAL WEAKNESSES
  useEffect(() => {
    const savedWeaknesses = localStorage.getItem("expoLearn_weaknesses");
    if (savedWeaknesses) {
      const parsed = JSON.parse(savedWeaknesses);
      setWeaknesses(parsed);
      if (parsed.length > 0) setSelectedTopic(parsed[0]);
    } else {
      // Failsafe
      setWeaknesses(["Light: Reflection and Refraction", "Electricity"]);
      setSelectedTopic("Light: Reflection and Refraction");
    }
  }, []);

  // 2. CONNECT TO YOUR LIVE FASTAPI BACKEND
  const handleGenerate = async () => {
    setStatus("generating");
    
    try {
      const exam = localStorage.getItem("expoLearn_exam") || "Class 10 Board";
      const level = localStorage.getItem("expoLearn_level") || "Beginner";

      const response = await fetch("http://localhost:8000/api/v1/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          exam: exam,
          level: level
        })
      });
      
      const data = await response.json();
      setGeneratedNotes(data.notes || "Error generating notes.");
      setStatus("complete");
      
    } catch (error) {
      console.error("Backend Error:", error);
      setGeneratedNotes("⚠️ AI Engine offline. Please ensure your FastAPI backend is running on port 8000.");
      setStatus("complete");
    }
  };

  const handleDownloadPdf = () => {
    const content = document.getElementById("notes-text-content")?.innerHTML;
    if (!content) return;
    const printWindow = window.open("", "_blank", "height=800,width=800");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ExpoLearn Smart Notes - ${selectedTopic}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2, h3 { color: #333; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${selectedTopic}: Master Review</h1>
          <hr/>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-hidden p-8 relative">
      
      {/* Header */}
      <header className="mb-8 shrink-0">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BookOpen className="text-blue-400" size={28} />
          Cognitive Study Hub
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Generate hyper-personalized AI Smart Notes based on your Knowledge Graph weaknesses.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl w-full mx-auto flex-1 min-h-0">
        
        {/* LEFT PANEL: Dynamic Topic Selection */}
        <div className="col-span-1 h-full min-h-0 flex flex-col">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl h-full flex flex-col min-h-0">
            
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <Target size={16} /> Critical Gaps
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-2">
              {weaknesses.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setStatus("idle");
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 border ${
                    selectedTopic === topic 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <span className="block font-bold text-sm mb-1">{topic}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={status === "generating"}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shrink-0 ${
                status === "generating" 
                  ? "bg-blue-600/50 text-blue-200 cursor-not-allowed" 
                  : "bg-white hover:scale-105 text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              }`}
            >
              {status === "generating" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles size={18} />
              )}
              {status === "generating" ? "SYNTHESIZING..." : "GENERATE SMART NOTES"}
            </button>

          </div>
        </div>

        {/* RIGHT PANEL: Note Editor */}
        <div className="col-span-3 h-full min-h-0 flex flex-col">
          
          {status === "idle" && (
            <div className="h-full border border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-600 bg-[#0A0A0A]/50">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-300">Ready to Synthesize</p>
              <p className="text-sm mt-2 max-w-sm text-center text-gray-500">
                Select a topic on the left to engage the Groq LPU engine.
              </p>
            </div>
          )}

          {status === "generating" && (
            <div className="border border-gray-800 bg-[#111] rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl h-full relative overflow-hidden">
               <BrainCircuit size={48} className="text-blue-500 animate-pulse mb-6" />
               <h3 className="text-2xl font-bold text-white mb-2">Compiling Cognitive Notes...</h3>
               <p className="text-gray-400 text-sm">Extracting high-yield concepts via Groq Llama 3.1...</p>
            </div>
          )}

          {status === "complete" && (
            <div className="bg-[#111] border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full min-h-0">
              
              {/* FIXED Document Header */}
              <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-[#1A1A1A] to-[#111] flex justify-between items-start shrink-0">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedTopic}</h1>
                  <p className="text-sm text-gray-500">Synthesized instantly via Groq API.</p>
                </div>
                <button 
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700 shadow-lg group shrink-0"
                >
                  <Download size={18} className="group-hover:text-white transition-colors" />
                  <span className="text-sm font-bold group-hover:text-white">Save PDF</span>
                </button>
              </div>

              {/* SCROLLABLE Content */}
              <div className="p-8 overflow-y-auto flex-1 text-gray-300">
                {/* ID added here so the PDF generator grabs the rendered HTML */}
                <div id="notes-text-content" className="prose prose-invert max-w-none prose-headings:text-blue-400 prose-a:text-blue-500">
                   <ReactMarkdown>{generatedNotes}</ReactMarkdown>
                </div>

                {/* --- NEURAL HANDWRITING INTEGRATION --- */}
                <div className="mt-12 border-t border-gray-800 pt-8 print:hidden">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <PenTool className="text-purple-400" size={20} />
                      Personalize Your Notes
                    </h3>
                    <p className="text-gray-400 text-sm">Want these notes written in your own handwriting? Upload a sample below to engage our Neural Handwriting Engine.</p>
                  </div>
                  <HandwritingNotes />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}