'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, PenTool, Download, RefreshCcw } from 'lucide-react';

export default function HandwritingNotes({ aiNotes = "" }: { aiNotes?: string }) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready'>('idle');
  const [style, setStyle] = useState<any>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setStatus('processing');

    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('http://localhost:8000/api/v1/analyze-handwriting', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setStyle(data.style);
      setStatus('ready');
    } catch (err) {
      console.error("Analysis failed", err);
      setStatus('idle');
    }
  };

  // 🚀 THE PDF EXPORT ENGINE: Creates a hidden styled document for printing
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // We inject the Caveat font and Paper styling directly into the new window
    const htmlContent = `
      <html>
        <head>
          <title>Handwritten Notes - Neural Clone</title>
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { 
              background-color: #fcfaf2; 
              padding: 50px; 
              margin: 0;
            }
            .paper {
              width: 100%;
              max-width: 800px;
              margin: auto;
              line-height: 2.2;
              font-size: 24px;
              color: #1a1a1a;
              font-family: 'Caveat', cursive;
              transform: ${style.slant};
              letter-spacing: ${style.spacing};
              background-image: linear-gradient(#d1d1d1 1px, transparent 1px);
              background-size: 100% 2.2em;
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="paper">
            ${aiNotes.replace(/\n/g, '<br>')}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
            <div className="p-4 bg-indigo-500/10 rounded-2xl">
                <PenTool className="text-indigo-400 w-12 h-12" />
            </div>
            <div className="text-center">
                <h3 className="text-2xl font-black text-white">Neural Handwriting Clone</h3>
                <p className="text-slate-400 text-sm mt-2">Personalize your generated notes with your own script.</p>
            </div>
            <label className="cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 px-10 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 text-white">
              Sync My Script
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div className="flex flex-col items-center py-10">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
            <p className="text-cyan-400 font-black tracking-widest animate-pulse">EXTRACTING STROKE VECTORS...</p>
          </motion.div>
        )}

        {status === 'ready' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" />
                <span className="text-emerald-400 font-black uppercase text-xs tracking-widest">Style Synced Successfully</span>
              </div>
              <button onClick={() => setStatus('idle')} className="text-slate-500 hover:text-white transition-colors">
                <RefreshCcw size={16} />
              </button>
            </div>
            
            {/* REAL-TIME PREVIEW WINDOW */}
            <div className="bg-[#fcfaf2] p-10 rounded-2xl shadow-inner border border-orange-100 min-h-[300px] relative overflow-hidden">
              {/* Paper Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-10 opacity-[0.05] pointer-events-none">
                 {[...Array(12)].map((_, i) => <div key={i} className="h-px bg-blue-900 w-full" />)}
              </div>

              <p className="text-gray-800 text-3xl leading-relaxed italic relative z-10" 
                 style={{ 
                    fontFamily: "'Caveat', cursive",
                    transform: style.slant,
                    letterSpacing: style.spacing,
                    fontWeight: style.weight,
                    filter: `drop-shadow(1px 1px 1px rgba(0,0,0,0.1))`
                }}>
                {aiNotes ? aiNotes.substring(0, 500) + "..." : "Generating script analysis..."}
              </p>
            </div>
            
            <button 
              onClick={handleExportPDF}
              className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              <Download size={18} /> Download Handwritten PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}