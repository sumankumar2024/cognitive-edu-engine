"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Mic, MicOff, Volume2, Loader2, Square } from 'lucide-react';
import axios from 'axios';

export default function UnifiedTutor() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice & API State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // THE FIX: This holds the kill-switch for our API request
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setTimeout(() => {
            const finalInput = document.getElementById("chat-input") as HTMLInputElement;
            if (finalInput && finalInput.value.trim().length > 0) {
               sendMessage(finalInput.value);
            }
        }, 500);
      };
    }
  }, []);

  const toggleMicrophone = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(''); 
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // THE FIX: The Kill Switch Function
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Severs the HTTP connection
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel(); // Kills audio if it started
  };

  const sendMessage = async (textToSend: string = input) => {
    if (!textToSend.trim() || isLoading) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Create a new kill-switch for this specific request
    abortControllerRef.current = new AbortController();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/chat', {
        user_id: "student_123",
        message: textToSend,
        session_id: "unified_session"
      }, {
        // Attach the kill-switch to the Axios request
        signal: abortControllerRef.current.signal 
      });
      
      const botReply = response.data.reply;
      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
      
      if (userMsg.content === textToSend && ('speechSynthesis' in window)) {
         speakText(botReply);
      }

    } catch (error) {
      // Check if the error was caused by the user hitting the stop button
      if (axios.isCancel(error)) {
        console.log("Request canceled by user");
        setMessages(prev => [...prev, { role: 'bot', content: "⏸️ Generation stopped." }]);
      } else {
        console.error("Brain Connection Failed", error);
        setMessages(prev => [...prev, { role: 'bot', content: "Error connecting to Socratic Engine." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.name.includes('Google') || v.lang === 'en-US') || voices[0];
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full min-h-[600px] w-full bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
      
      {isListening && (
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute inset-0 bg-indigo-500 pointer-events-none"
        />
      )}

      <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wide">Socratic Engine</h2>
            <p className="text-xs text-indigo-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online & Monitoring Knowledge Graph
            </p>
          </div>
        </div>
        
        {isSpeaking && (
           <button onClick={stopGeneration} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 flex items-center gap-2 transition-colors">
              <Volume2 className="w-3 h-3 text-indigo-400 animate-pulse" />
              Stop Audio
           </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50">
            <Bot className="w-16 h-16" />
            <p>How can I help you master Thermodynamics today?</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl flex gap-4 shadow-md ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-bl-sm'
              }`}>
                {msg.role === 'bot' && <Bot className="w-6 h-6 mt-0.5 text-indigo-400 flex-shrink-0" />}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'user' && <User className="w-6 h-6 mt-0.5 text-indigo-200 flex-shrink-0" />}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-12">
               <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl rounded-bl-sm flex gap-3 items-center">
                 <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                 <span className="text-slate-400 text-sm">Consulting Knowledge Graph...</span>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area with Floating Stop Button */}
      <div className="p-4 bg-slate-800/80 border-t border-slate-700 z-10 relative">
        
        {/* THE FIX: Floating ChatGPT-style Stop Button */}
        {isLoading && (
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
             <button 
                onClick={stopGeneration} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
             >
                <Square className="w-3 h-3 fill-current" />
                Stop generating
             </button>
          </div>
        )}

        <div className="flex items-end gap-2 relative">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={isListening ? "Listening intently..." : "Type your answer or ask a doubt..."}
            className={`flex-1 min-h-[60px] max-h-32 bg-slate-900 border ${isListening ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-600'} rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none custom-scrollbar`}
          />
          
          <button 
            onClick={toggleMicrophone}
            className={`absolute right-14 bottom-2 p-2 rounded-lg transition-colors ${
              isListening ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
            }`}
            title={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => sendMessage()}
            disabled={isLoading || (!input.trim() && !isListening)}
            className="bg-indigo-600 hover:bg-indigo-500 transition-all p-3.5 rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg flex-shrink-0 h-[60px] w-[60px] flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-500 mt-3">Shift+Enter for new line. Hit Enter to send.</p>
      </div>
    </div>
  );
}