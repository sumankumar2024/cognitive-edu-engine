"use client";
import { useState } from "react";
import { BookOpen, Sparkles, BrainCircuit, Target, Download, CheckCircle2, ChevronRight, FileText } from "lucide-react";

// Mock Database of student's current cognitive state
const cognitiveState = {
  "Calculus Integration": { level: "Beginner", gap: "U-Substitution & Limits" },
  "Thermodynamics": { level: "Intermediate", gap: "Adiabatic Processes" },
  "Chemical Bonding": { level: "Advanced", gap: "Sp3 Hybridization" },
};

export default function AINotesView() {
  const [selectedTopic, setSelectedTopic] = useState<string>("Calculus Integration");
  const [status, setStatus] = useState<"idle" | "generating" | "complete">("idle");

  const handleGenerate = () => {
    setStatus("generating");
    // Simulate AI synthesis time
    setTimeout(() => {
      setStatus("complete");
    }, 3000);
  };

  const topicData = cognitiveState[selectedTopic as keyof typeof cognitiveState];

  // 🖨️ PDF DOWNLOAD FUNCTION (Zero Dependencies)
  const handleDownloadPdf = () => {
    const content = document.getElementById("notes-content")?.innerHTML;
    if (!content) return;

    // Open a temporary print window
    const printWindow = window.open("", "_blank", "height=800,width=800");
    if (!printWindow) return;

    // Inject clean, printable HTML
    printWindow.document.write(`
      <html>
        <head>
          <title>ExpoLearn Smart Notes - ${selectedTopic}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h3, h4 { color: #333; margin-top: 24px; }
            .intervention-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .code-block { background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; }
            .text-gray-500 { color: #6b7280; }
            .text-green-400 { color: #10b981; }
            .text-red-300 { color: #ef4444; font-weight: bold; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>${selectedTopic}: Master Review</h1>
          <p><strong>Targeted Focus:</strong> ${topicData.gap}</p>
          <hr/>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Trigger the print dialog (User can select "Save as PDF")
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    // CRITICAL FIX: Changed overflow-y-auto to overflow-hidden on the root container
    <div className="flex flex-col h-full bg-[#050505] overflow-hidden p-8 relative">
      
      {/* Header - Locked to top */}
      <header className="mb-8 shrink-0">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <BookOpen className="text-blue-400" size={28} />
          Cognitive Study Hub
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Generate hyper-personalized AI Smart Notes based on your Knowledge Graph weaknesses.
        </p>
      </header>

      {/* Main Grid - min-h-0 prevents flexbox blowout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl w-full mx-auto flex-1 min-h-0">
        
        {/* LEFT PANEL: Topic Selection */}
        <div className="col-span-1 h-full min-h-0 flex flex-col">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl h-full flex flex-col min-h-0">
            
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 shrink-0">
              <Network size={16} /> Target Synapses
            </h3>
            
            {/* Scrollable list of topics */}
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide pr-2">
              {Object.keys(cognitiveState).map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setStatus("idle"); // Reset on change
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 border ${
                    selectedTopic === topic 
                      ? "bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "bg-[#1A1A1A] border-transparent text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <span className="block font-bold text-sm mb-1">{topic}</span>
                  {selectedTopic === topic && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500">
                      <Target size={12} className="text-red-400" /> Focus: {cognitiveState[topic as keyof typeof cognitiveState].gap}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Button locked to bottom of left panel */}
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

        {/* RIGHT PANEL: The AI Note Editor */}
        <div className="col-span-3 h-full min-h-0 flex flex-col">
          
          {status === "idle" && (
            <div className="h-full border border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-600 bg-[#0A0A0A]/50">
              <FileText size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium text-gray-300">Ready to Synthesize</p>
              <p className="text-sm mt-2 max-w-sm text-center text-gray-500">
                Select a topic on the left. The Cognitive Engine will generate notes prioritizing your specific weakness: <span className="text-red-400">{topicData.gap}</span>.
              </p>
            </div>
          )}

          {status === "generating" && (
            <div className="border border-gray-800 bg-[#111] rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-2xl h-full relative overflow-hidden">
               <div className="w-full max-w-2xl space-y-6 opacity-30">
                 <div className="h-10 bg-gray-700 rounded-lg w-3/4 animate-pulse"></div>
                 <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
                 <div className="space-y-3 pt-6">
                   <div className="h-4 bg-gray-700 rounded w-full animate-pulse" style={{animationDelay: '100ms'}}></div>
                   <div className="h-4 bg-gray-700 rounded w-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                   <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" style={{animationDelay: '300ms'}}></div>
                 </div>
                 <div className="p-6 bg-blue-900/20 rounded-xl mt-8 border border-blue-500/20">
                    <div className="h-6 bg-blue-500/40 rounded w-1/3 animate-pulse mb-4"></div>
                    <div className="h-4 bg-blue-500/20 rounded w-full animate-pulse"></div>
                 </div>
               </div>
               
               <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-[#111]/80 z-10">
                 <BrainCircuit size={48} className="text-blue-500 animate-pulse mb-6" />
                 <h3 className="text-2xl font-bold text-white mb-2">Compiling Cognitive Notes...</h3>
                 <p className="text-gray-400 text-sm flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span> Extracting RAG Context for {topicData.gap}
                 </p>
               </div>
            </div>
          )}

          {status === "complete" && (
            <div className="bg-[#111] border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col h-full min-h-0">
              
              {/* FIXED Document Header - Will not scroll */}
              <div className="p-8 border-b border-gray-800 bg-gradient-to-r from-[#1A1A1A] to-[#111] flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-widest uppercase">
                      AI Generated
                    </span>
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1">
                      <Target size={10}/> Focus: {topicData.gap}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">{selectedTopic}: Master Review</h1>
                  <p className="text-sm text-gray-500">Synthesized instantly from your Neural Knowledge Map.</p>
                </div>
                <button 
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700 shadow-lg group shrink-0"
                >
                  <Download size={18} className="group-hover:text-white transition-colors" />
                  <span className="text-sm font-bold group-hover:text-white">Save PDF</span>
                </button>
              </div>

              {/* SCROLLABLE Document Content - Scrolls independently! */}
              <div id="notes-content" className="p-8 overflow-y-auto flex-1 prose prose-invert max-w-none text-gray-300">
                <h3 className="text-white text-xl font-semibold mb-4">1. Core Concept Overview</h3>
                <p className="mb-6 leading-relaxed">
                  Integration is essentially the reverse process of differentiation. While derivatives find the rate of change, integrals help us calculate the accumulation of quantities, such as the area under a curve. You can think of it as summing up an infinite number of infinitely small slices.
                </p>
                <p className="mb-6 leading-relaxed">
                  When dealing with definite integrals, we use the Fundamental Theorem of Calculus. However, when dealing with indefinite integrals, we must always remember to add the constant of integration, <code className="bg-gray-800 px-1 rounded">C</code>, because the derivative of any constant is zero.
                </p>

                {/* Highly targeted AI intervention block */}
                <div className="intervention-box my-8 p-6 bg-red-500/5 border-l-4 border-red-500 rounded-r-2xl shadow-lg relative">
                  <div className="absolute -left-[14px] top-6 bg-red-500 p-1 rounded-full text-[#111]">
                    <Target size={16} />
                  </div>
                  <h4 className="text-red-400 font-bold text-lg mt-0 mb-2">Targeted Intervention: {topicData.gap}</h4>
                  <p className="text-sm leading-relaxed mb-4 text-gray-300">
                    The Knowledge Graph detected repeated errors when dealing with composite functions. You often forget to define <code className="bg-gray-800 px-1 rounded text-red-300">du</code> accurately before substituting.
                  </p>
                  <div className="code-block bg-[#0A0A0A] p-4 rounded-xl border border-gray-800 font-mono text-sm text-blue-300">
                    <span className="text-gray-500">// Example Flow: ∫ 2x * cos(x²) dx</span><br/>
                    Let u = x²<br/>
                    du/dx = 2x  <span className="text-green-400">➔ This is the crucial step you skip!</span><br/>
                    dx = du / 2x<br/>
                    <br/>
                    <span className="text-gray-500">// Substitute back:</span><br/>
                    ∫ 2x * cos(u) * (du / 2x) = ∫ cos(u) du = sin(u) + C
                  </div>
                </div>

                <h3 className="text-white text-xl font-semibold mb-4 mt-8">2. Standard Formulas to Memorize</h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> <strong>Power Rule:</strong> ∫ xⁿ dx = xⁿ⁺¹ / (n+1) + C</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> <strong>Exponential:</strong> ∫ eˣ dx = eˣ + C</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> <strong>Reciprocal:</strong> ∫ (1/x) dx = ln|x| + C</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> <strong>Trigonometric:</strong> ∫ cos(x) dx = sin(x) + C</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-green-500"/> <strong>Trigonometric:</strong> ∫ sin(x) dx = -cos(x) + C</li>
                </ul>

                <p className="mb-6 leading-relaxed">
                  <strong>Final tip for your next quiz:</strong> Whenever you see a function multiplied by its own derivative, immediately use U-Substitution. Do not try to expand or use Integration by Parts.
                </p>

                {/* Adding extra space to demonstrate scrolling */}
                <div className="h-32"></div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Network(props: any) {
  return <BrainCircuit {...props} />;
}