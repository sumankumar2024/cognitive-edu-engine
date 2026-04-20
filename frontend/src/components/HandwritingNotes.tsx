"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle2, Loader2, PenTool, Download } from "lucide-react";

export default function HandwritingNotes() {
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "ready">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // The sample notes that will be generated
  const sampleNotes = "These are my generated study notes. The AI has analyzed my unique stroke patterns, baseline slant, and pressure geometry to synthesize this exact replica of my handwriting. This is the future of personalized education!";

  const handleUpload = () => {
    setStatus("uploading");
    
    // Simulate file upload
    setTimeout(() => {
      setStatus("analyzing");
      
      // Simulate AI Vision extracting stroke geometry
      setTimeout(() => {
        setStatus("ready");
      }, 2500);
    }, 1500);
  };

  const generateNotes = () => {
    setIsGenerating(true);
  };

  // 🖨️ ZERO-DEPENDENCY HANDWRITING EXPORT
  const handleDownloadHandwriting = () => {
    const printWindow = window.open("", "_blank", "height=800,width=800");
    if (!printWindow) return;

    // We inject the Caveat font directly into the print window so the PDF captures it perfectly
    printWindow.document.write(`
      <html>
        <head>
          <title>My Neural Handwritten Notes</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Caveat', cursive; 
              font-size: 28px; 
              line-height: 1.6; 
              padding: 50px; 
              color: #111; 
              max-width: 800px; 
              margin: 0 auto; 
            }
            .document-header {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 12px;
              color: #888;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 30px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="document-header">ExpoLearn - Neural Handwriting Export</div>
          <div>${sampleNotes}</div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure the Google Font fully loads before capturing the PDF
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 750);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-gray-800 w-full mx-auto overflow-hidden">
      
      {status === "idle" && (
        <div 
          onClick={handleUpload}
          className="border-2 border-dashed border-gray-700 m-6 rounded-lg p-8 text-center cursor-pointer hover:bg-[#222] transition-all group"
        >
          <UploadCloud className="w-12 h-12 text-gray-500 mx-auto mb-3 group-hover:text-purple-400 transition-colors" />
          <p className="font-semibold text-gray-300">Upload Handwriting Sample</p>
          <p className="text-sm text-gray-500 mt-1">JPEG, PNG or PDF (Max 5MB)</p>
        </div>
      )}

      {status === "uploading" && (
        <div className="flex flex-col items-center justify-center p-12 m-6 border-2 border-gray-800 rounded-lg bg-[#111]">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
          <p className="font-medium text-gray-300">Uploading sample to secure vault...</p>
        </div>
      )}

      {status === "analyzing" && (
        <div className="flex flex-col items-center justify-center p-12 m-6 border-2 border-gray-800 rounded-lg bg-[#111]">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <PenTool className="w-10 h-10 text-purple-500 mb-4" />
          </motion.div>
          <p className="font-medium text-purple-400">Extracting stroke geometry & slant...</p>
          <p className="text-xs text-gray-500 mt-2">Mapping to Few-Shot GAN matrix</p>
        </div>
      )}

      {status === "ready" && !isGenerating && (
        <div className="p-8 m-6 bg-green-900/10 border border-green-500/20 rounded-lg text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="font-bold text-green-400 mb-1">Handwriting Profile Synced!</h3>
          <p className="text-sm text-green-500/70 mb-6">Your unique font signature is locked in.</p>
          <button 
            onClick={generateNotes}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]"
          >
            Generate Notes in My Handwriting
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="m-6">
          <div className="p-8 bg-[#E8E6E1] rounded-lg border border-[#D3D0C8] min-h-[200px] shadow-inner relative">
            <p 
              className="text-3xl text-gray-800 leading-relaxed"
              style={{ fontFamily: "var(--font-caveat), cursive" }}
            >
              {sampleNotes.split("").map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    duration: 0.1, 
                    delay: index * 0.03 
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </p>
          </div>
          
          {/* THE NEW DOWNLOAD BUTTON */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }} // Appears after the writing animation finishes
            className="mt-4 flex justify-end"
          >
            <button 
              onClick={handleDownloadHandwriting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#222] hover:bg-[#333] text-purple-400 rounded-lg transition-colors border border-purple-500/30 shadow-lg group"
            >
              <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
              <span className="font-semibold text-sm">Download Handwritten PDF</span>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}