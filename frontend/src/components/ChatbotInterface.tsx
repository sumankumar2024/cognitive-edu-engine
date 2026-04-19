"use client";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, History, Bot, User, Mic } from "lucide-react";

export default function ChatbotInterface() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // Ref to hold the speech recognition instance

  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am StudyPilot. What are we exploring on ExpoLearn today?" }
  ]);

  // 1. AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 2. INITIALIZE SPEECH RECOGNITION (Runs once on mount)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Cross-browser support for Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening until toggled off
        recognition.interimResults = true; // Show words as they are being spoken
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          // Update the input field with the transcribed text
          setInput(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Microphone error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (isHistoryOpen) setIsHistoryOpen(false); 
  };

  // 3. TOGGLE MICROPHONE LOGIC
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice recognition. Please use Google Chrome or Microsoft Edge for the demo.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput(""); // Clear input before starting new dictation
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // 4. SEND BUTTON LOGIC
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // If still listening when sending, stop the mic
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setIsHistoryOpen(false);

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "I've analyzed the Knowledge Graph for that topic. Here is the breakdown you need..." 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const loadHistory = (title: string) => {
    setMessages([
      { role: "ai", text: `Retrieving cognitive context for: ${title}...` },
      { role: "user", text: `Let's review my weak points in ${title}.` },
      { role: "ai", text: `I have loaded your exact state. You are currently at a Beginner level here. Should we start with a quick quiz or visual notes?` }
    ]);
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      {/* TOP HEADER */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <Bot size={16} className="text-white"/>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">StudyPilot</h2>
        </div>
        
        {/* HISTORY TOGGLE BUTTON */}
        <button 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
        >
          <History size={16} />
          <span className="text-sm font-medium">History</span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-300 ${isHistoryOpen ? "rotate-180" : ""}`} 
          />
        </button>
      </header>

      {/* FLOATING HISTORY DROPDOWN */}
      <div 
        className={`absolute top-24 right-6 w-80 bg-[#1A1A1A] border border-gray-800 rounded-2xl shadow-2xl p-4 z-50 transition-all duration-300 ease-in-out origin-top-right ${
          isHistoryOpen 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
        }`}
      >
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Recent Cognitive Sessions</h3>
        <ul className="space-y-1">
          {["Thermodynamics Review", "Calculus Integration", "Python OOP Concepts"].map((chat, i) => (
            <li 
              key={i} 
              onClick={() => loadHistory(chat)}
              className="p-3 rounded-xl hover:bg-blue-600/20 hover:text-blue-400 cursor-pointer text-sm text-gray-300 transition-all border border-transparent hover:border-blue-500/30"
            >
              {chat}
            </li>
          ))}
        </ul>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === "ai" ? "" : "flex-row-reverse"}`}>
            <div className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gray-700"}`}>
              {msg.role === "ai" ? <Bot size={20} className="text-white"/> : <User size={20} className="text-white"/>}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed ${msg.role === "ai" ? "bg-[#111] border border-gray-800 text-gray-200" : "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* TYPING INDICATOR */}
        {isTyping && (
          <div className="flex gap-4">
             <div className="p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot size={20} className="text-white"/>
            </div>
            <div className="p-4 rounded-2xl bg-[#111] border border-gray-800 flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INTERACTIVE INPUT AREA */}
      <div className="p-6 max-w-4xl mx-auto w-full bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center bg-[#1A1A1A] border border-gray-700 focus-within:border-blue-500 focus-within:shadow-[0_0_20px_rgba(37,99,235,0.1)] transition-all rounded-full p-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={handleTyping}
            placeholder={isListening ? "Listening... Speak now." : "Message StudyPilot..."}
            className="w-full bg-transparent text-white pl-4 pr-24 py-3 rounded-full outline-none placeholder-gray-500"
          />
          
          {/* THE BUTTONS */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* VOICE ASSISTANT BUTTON */}
            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isListening 
                  ? "bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <Mic size={20} />
            </button>

            {/* SEND BUTTON */}
            <button 
              type="submit"
              disabled={!input.trim()}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                input.trim() 
                  ? "bg-white text-black hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer" 
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
            </button>
          </div>
        </form>
        <p className="text-center text-[11px] text-gray-600 mt-3 uppercase tracking-widest font-semibold">
          ExpoLearn AI • Verified Cognitive Engine
        </p>
      </div>
    </div>
  );
}