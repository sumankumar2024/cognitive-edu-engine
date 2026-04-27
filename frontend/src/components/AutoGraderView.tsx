'use client';
import { useState, useRef } from "react";
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  XCircle, BrainCircuit, Loader2, ShieldAlert, RefreshCw, Download 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutoGraderView() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "complete" | "invalid">("idle");
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

const handleFileUpload = async (e: any) => {
    const selectedFile = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus("scanning");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("exam", localStorage.getItem("expoLearn_exam") || "Class 10 Board");
    formData.append("level", localStorage.getItem("expoLearn_level") || "Intermediate");

    try {
      const res = await fetch("http://localhost:8000/api/grade-submission", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // 🚀 THE CRITICAL LOGIC FIX:
      // If the backend says 'success' BUT the AI marks it as not an assignment...
      if (data.status === "success" && data.data.is_assignment === true) {
        setResult(data.data);
        setStatus("complete");
      } else {
        // This triggers the red 'Action Denied' screen instead of the 0% Report
        const reason = data.data?.feedback || data.message || "Invalid document structure.";
        setErrorMessage(`Neural Check: ${reason}`);
        setStatus("invalid");
      }
    } catch (err) {
      setErrorMessage("Neural link severed. Ensure backend is active.");
      setStatus("invalid");
    }
};

  return (
    <div className="flex flex-col h-full bg-[#050505] p-6 md:p-8 text-white overflow-y-auto custom-scrollbar">
      
      <AnimatePresence mode="wait">
        
        {/* 1. IDLE STATE: DROPZONE */}
        {status === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center"
          >
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e); }}
              className="w-full max-w-3xl border-2 border-dashed border-slate-800 rounded-[3rem] p-16 flex flex-col items-center gap-8 bg-slate-900/10 hover:bg-blue-600/5 hover:border-blue-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="p-8 bg-blue-600/10 rounded-3xl border border-blue-500/20 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <UploadCloud size={64} className="text-blue-500" />
              </div>
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Neural Evaluation Dropzone</h3>
                <p className="text-slate-500 mt-3 text-lg font-medium">Upload solved Assignments or MCQs for real-time grading</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all transform hover:scale-105 active:scale-95 shadow-2xl uppercase tracking-widest text-sm relative z-10"
              >
                Select Document
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".pdf" />
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Supports PDF format</p>
            </div>
          </motion.div>
        )}

        {/* 2. SCANNING STATE: ANIMATION */}
        {status === "scanning" && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-8"
          >
            <div className="relative w-64 h-80 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-transparent animate-scan"></div>
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <FileText size={80} className="text-slate-700" />
                <div className="flex flex-col items-center gap-2">
                    <p className="text-blue-400 font-black tracking-[0.2em] animate-pulse uppercase">AI SCANNING</p>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Classifying Content...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. INVALID STATE: REJECTION */}
        {status === "invalid" && (
          <motion.div 
            key="invalid"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
          >
            <div className="p-8 bg-red-500/10 rounded-full border-2 border-red-500/20 mb-8 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in zoom-in duration-300">
              <ShieldAlert size={80} className="text-red-500" />
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Action Denied</h3>
            <p className="text-red-400 font-bold text-xl max-w-xl leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => setStatus("idle")} 
              className="mt-10 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black transition-all flex items-center gap-3 uppercase tracking-widest text-xs border border-white/5"
            >
              <RefreshCw size={18} /> Re-upload Correct File
            </button>
          </motion.div>
        )}

        {/* 4. COMPLETE STATE: RESULTS */}
        {status === "complete" && result && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto w-full py-8"
          >
            <div className="bg-slate-900 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              
              {/* Header with Score */}
              <div className="p-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                   <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10">
                     <CheckCircle2 size={40} className="text-white" />
                   </div>
                   <div>
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Evaluation Report</h2>
                     <p className="text-blue-100 font-bold text-lg opacity-90 mt-1">Topic: {result.topic_detected}</p>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] text-center shadow-2xl min-w-[180px]">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Grade</span>
                  <span className="text-7xl font-black text-slate-950">{result.score}%</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="p-12 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 relative group">
                    <div className="absolute top-4 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={60} />
                    </div>
                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6">AI Feedback</h4>
                    <p className="text-slate-200 text-lg font-medium leading-relaxed italic">"{result.feedback}"</p>
                  </div>

                  <div className="bg-orange-500/5 p-8 rounded-[2rem] border border-orange-500/20">
                    <h4 className="text-xs font-black text-orange-400 uppercase tracking-[0.3em] mb-6">Gaps Identified</h4>
                    <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></div>
                        <p className="text-white font-black text-2xl tracking-tight">{result.weakness_detected || result.topic_detected}</p>
                    </div>
                    <p className="text-slate-500 font-bold mt-4 text-sm uppercase tracking-wider">Added to Knowledge Graph</p>
                  </div>
                </div>

                {/* Graph Sync Notification */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="p-5 bg-indigo-500/20 rounded-3xl border border-indigo-500/30">
                        <BrainCircuit className="text-indigo-400" size={48} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white tracking-tight">Synapse Calibration Complete</h4>
                      <p className="text-indigo-300/70 font-medium text-lg mt-1 italic">Your neural learning map has been updated with these results.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStatus("idle")} 
                    className="whitespace-nowrap px-10 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-cyan-400 hover:scale-105 transition-all shadow-2xl uppercase tracking-widest text-xs"
                  >
                    Next Submission
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Global CSS for the scanning animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          height: 100%;
          width: 100%;
          animation: scan 3s linear infinite;
          background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5), transparent);
        }
      `}} />
    </div>
  );
}