"use client";
import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, BrainCircuit, ScanSearch } from "lucide-react";

export default function AutoGraderView() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "complete">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Triggered when user drops a file or clicks to upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    let selectedFile = null;
    
    if ('dataTransfer' in e) {
      selectedFile = e.dataTransfer.files[0];
    } else if ('target' in e && e.target.files) {
      selectedFile = e.target.files[0];
    }

    if (selectedFile) {
      setFile(selectedFile as any);
      setStatus("scanning");
      
      // Simulate AI processing time (3.5 seconds of UI Magic)
      setTimeout(() => {
        setStatus("complete");
      }, 3500);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto scrollbar-hide p-8 relative">
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BrainCircuit className="text-purple-500" size={28} />
          Cognitive Auto-Grader
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Drop assignments here. Powered by RAG and Neural Vision to evaluate, grade, and map weaknesses.
        </p>
      </header>

      <div className="max-w-5xl w-full mx-auto">
        
        {/* STATE 1: IDLE (The Dropzone) */}
        {status === "idle" && (
          <div 
            onDrop={handleFileUpload}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-700 hover:border-purple-500 bg-[#111] hover:bg-[#1a1a1a] transition-all duration-300 rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer group shadow-2xl relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="w-24 h-24 rounded-full bg-gray-800 group-hover:bg-purple-500/20 flex items-center justify-center mb-6 transition-colors shadow-lg">
              <UploadCloud size={48} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop Assignment</h3>
            <p className="text-gray-500 mb-8 max-w-md">
              Upload PDF, DOCX, or handwritten JPGs. The Cognitive Engine will instantly evaluate the answers against the master rubric.
            </p>
            <button className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Browse Files
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
              accept=".pdf,.png,.jpg,.jpeg"
            />
          </div>
        )}

        {/* STATE 2: SCANNING (The "Wow" Animation) */}
        {status === "scanning" && (
          <div className="border border-gray-800 bg-[#111] rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
             {/* Sweeping Scanner Line */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent via-purple-500/20 to-purple-500/40 animate-[scan_2s_ease-in-out_infinite] border-b border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]"></div>
             
             <ScanSearch size={64} className="text-purple-500 animate-pulse mb-6 relative z-10" />
             <h3 className="text-2xl font-bold text-white mb-2 relative z-10 animate-pulse">Running Neural Evaluation...</h3>
             <div className="flex items-center gap-2 text-gray-400 text-sm mt-4 relative z-10">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
               Extracting text via Vision API
             </div>
             <div className="flex items-center gap-2 text-gray-400 text-sm mt-2 relative z-10 opacity-70">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" style={{ animationDelay: '0.5s' }}></div>
               Cross-referencing RAG Vector Database
             </div>
          </div>
        )}

        {/* STATE 3: COMPLETE (The Results) */}
        {status === "complete" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Document Preview Panel */}
            <div className="col-span-1 bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
                <FileText className="text-purple-400" size={24} />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-white truncate">{file?.name || "Physics_Assignment_Final.pdf"}</h3>
                  <p className="text-xs text-gray-500">Evaluated in 3.4s</p>
                </div>
              </div>
              
              {/* Mock Document Outline */}
              <div className="space-y-4 opacity-80">
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="p-3 border border-red-500/30 bg-red-500/5 rounded-lg mt-4 relative">
                   <div className="absolute -right-2 -top-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-2 pts</div>
                   <div className="h-3 bg-red-500/20 rounded w-full mb-2"></div>
                   <div className="h-3 bg-red-500/20 rounded w-2/3"></div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-4/5"></div>
              </div>
            </div>

            {/* AI Feedback Panel */}
            <div className="col-span-2 space-y-6">
              
              {/* Score Card */}
              <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-300 mb-1">Total Score</h3>
                  <p className="text-sm text-gray-500">Proficiency Level: <span className="text-blue-400 font-semibold">Intermediate</span></p>
                </div>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-purple-500 animate-[dash_2s_ease-out_forwards]" strokeDasharray="85, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                  <span className="absolute text-2xl font-bold text-white">85<span className="text-sm text-gray-500">/100</span></span>
                </div>
              </div>

              {/* Feedback Breakdown */}
              <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Cognitive Feedback</h3>
                <ul className="space-y-4">
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-white font-medium">Strong Conceptual Grasp</h4>
                      <p className="text-sm text-gray-400 mt-1">Excellent derivation of the Kinematic equations in Question 2. Your step-by-step logic aligns perfectly with standard theorems.</p>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start">
                    <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-white font-medium">Unit Conversion Error</h4>
                      <p className="text-sm text-gray-400 mt-1">In Question 4, you forgot to convert grams to kilograms before applying $F=ma$, resulting in an incorrect final magnitude by a factor of 1000.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Knowledge Graph Hook */}
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg"><BrainCircuit className="text-blue-400" size={20} /></div>
                  <div>
                    <h4 className="text-blue-100 font-bold text-sm">Knowledge Graph Updated</h4>
                    <p className="text-xs text-blue-300/70 mt-0.5">"Unit Conversions" marked as Area for Improvement.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setStatus("idle")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  GRADE ANOTHER
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      
      {/* Required for the scanning animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(200%); }
          100% { transform: translateY(-100%); }
        }
      `}} />
    </div>
  );
}