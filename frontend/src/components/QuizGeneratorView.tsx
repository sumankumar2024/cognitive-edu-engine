'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Loader2, CheckCircle2, XCircle, Trophy, Target, Zap } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function QuizGeneratorView() {
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState("Intermediate");
  const [selectedTopic, setSelectedTopic] = useState("");
  
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🚀 THE FIX: Syncing exactly with your Study Allocator's memory
  useEffect(() => {
    // 1. Pull the exact weaknesses saved during Onboarding
    const savedWeaknesses = localStorage.getItem('expoLearn_weaknesses');
    // 2. Pull the level saved during Onboarding (Fallback to Intermediate if not found)
    const savedLevel = localStorage.getItem('expoLearn_level');

    if (savedWeaknesses) {
      setAvailableTopics(JSON.parse(savedWeaknesses));
    } else {
      // Emergency hackathon failsafe
      setAvailableTopics(["Chemical Reactions", "Life Processes", "Electricity"]);
    }

    if (savedLevel) {
      setUserLevel(savedLevel);
    }
  }, []);

  const generateQuiz = async (topicToGenerate: string) => {
    setLoading(true);
    setError("");
    setQuiz(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setSelectedTopic(topicToGenerate);

    try {
      const response = await fetch('http://localhost:8000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topicToGenerate,
          level: userLevel 
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setQuiz(result.data);
      } else {
        setError(result.message || "Failed to generate quiz.");
      }
    } catch (err) {
      setError("Server connection failed. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qIndex: number, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    return quiz.filter((q, i) => selectedAnswers[i] === q.answer).length;
  };

  return (
    <div className="w-full h-full max-w-5xl mx-auto p-6 space-y-6">
      
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Dynamic Assessment Engine
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Generating <span className="text-indigo-400 font-bold">{userLevel}</span>-level questions for your weak areas
            </p>
          </div>
        </div>
      </div>

      {/* Topic Allocator Grid (Matches your Study Allocator UI) */}
      {!quiz && !loading && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Select Focus Area to Evaluate</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => generateQuiz(topic)}
                className="p-5 text-left bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-indigo-900/30 hover:border-indigo-500/50 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[120px]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <span className="relative font-bold text-slate-200 group-hover:text-white text-lg">{topic}</span>
                
                <div className="mt-4 flex items-center justify-between w-full relative">
                  <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-300">AI Generation Mode</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-indigo-400/20">
                    <Zap className="w-3 h-3 fill-indigo-400" /> Generate
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="w-full py-24 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white">Compiling Cognitive Assessment</h3>
          <p className="text-slate-400 mt-2">Formulating targeted {userLevel} questions for {selectedTopic}...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-900/50 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* The Active Quiz */}
      {quiz && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/30">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Active Module</span>
              <span className="font-bold text-white text-lg">{selectedTopic}</span>
            </div>
            <button 
              onClick={() => setQuiz(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors border border-slate-700"
            >
              Change Topic
            </button>
          </div>

          <div className="space-y-6">
            {quiz.map((q, qIndex) => (
              <div key={qIndex} className="p-6 bg-slate-900 rounded-2xl shadow-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-5 leading-relaxed">
                  <span className="text-indigo-400 mr-2">{qIndex + 1}.</span> {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, oIndex) => {
                    const isSelected = selectedAnswers[qIndex] === opt;
                    const isCorrect = q.answer === opt;
                    
                    let bgClass = "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300";
                    
                    if (isSubmitted) {
                      if (isCorrect) bgClass = "bg-green-900/30 border-green-500/50 text-green-400 font-medium";
                      else if (isSelected && !isCorrect) bgClass = "bg-red-900/30 border-red-500/50 text-red-400 font-medium";
                    } else if (isSelected) {
                      bgClass = "bg-indigo-900/50 border-indigo-500 text-white font-medium ring-1 ring-indigo-500/50";
                    }

                    return (
                      <div
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, opt)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${bgClass} flex justify-between items-center`}
                      >
                        <span className="text-sm">{opt}</span>
                        {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-3" />}
                        {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-3" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => setIsSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < quiz.length}
              className="w-full py-4 mt-6 bg-indigo-600 text-white font-bold text-lg rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg"
            >
              Submit Cognitive Assessment
            </button>
          ) : (
            <div className="mt-8 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">Assessment Complete</h3>
                <p className="text-indigo-300 mt-2 font-medium text-sm">Knowledge graph updated based on synapse retention.</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-900/80 px-8 py-4 rounded-xl border border-slate-700 min-w-[150px]">
                <div className="flex items-center gap-3 mb-1">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-4xl font-black">{calculateScore()}<span className="text-slate-500 text-2xl">/{quiz.length}</span></span>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}