"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Disc3 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [botResponse, setBotResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If we stopped listening and have text, send it to the brain
        if (transcript.length > 2) {
          handleVoiceSubmit(transcript);
        }
      };
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setBotResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleVoiceSubmit = async (text: string) => {
    setIsThinking(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/chat', {
        user_id: "student_123",
        message: text,
        session_id: "voice_session"
      });
      
      const reply = response.data.reply;
      setBotResponse(reply);
      speakResponse(reply);
    } catch (error) {
      console.error("Voice Engine Failed", error);
    } finally {
      setIsThinking(false);
      setTranscript('');
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: change voice to something more natural if available
      const voices = window.speechSynthesis.getVoices();
      utterance.voice = voices.find(v => v.name.includes('Google') || v.lang === 'en-US') || voices[0];
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Pulse Effect when listening */}
      {isListening && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl pointer-events-none"
        />
      )}

      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Volume2 className="text-indigo-400" />
          Voice Tutor Mode
        </h3>
        {isThinking && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 z-10 py-8">
        
        {/* The Microphone Button */}
        <button 
          onClick={toggleListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isListening ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }`}
        >
          {isListening ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
        </button>

        {/* Status Text */}
        <p className="text-sm font-medium tracking-wide uppercase text-slate-400">
          {isListening ? 'Listening...' : isThinking ? 'Analyzing...' : 'Tap to Speak'}
        </p>

      </div>

      {/* Transcript and Response Display */}
      <div className="h-32 bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 overflow-y-auto z-10">
        {transcript && (
           <p className="text-slate-300 text-sm italic mb-2">"{transcript}"</p>
        )}
        {botResponse && (
           <p className="text-indigo-300 text-sm">{botResponse}</p>
        )}
      </div>
    </div>
  );
}