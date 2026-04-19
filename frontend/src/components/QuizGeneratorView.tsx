"use client";
import { useState } from "react";
import { Lightbulb, Play, CheckCircle2, XCircle, Trophy, Brain, Target, ArrowRight, RefreshCw, Network } from "lucide-react";

// Mock Database of AI-Generated questions per topic
const quizDatabase: Record<string, any[]> = {
  "Thermodynamics & Kinematics": [
    {
      question: "If a system absorbs 500J of heat and does 200J of work, what is the change in internal energy?",
      options: ["300J", "700J", "-300J", "0J"],
      correct: 0,
      explanation: "ΔU = Q - W. So, 500J - 200J = 300J."
    },
    {
      question: "Which of the following describes an adiabatic process?",
      options: ["Constant Volume", "Constant Pressure", "No Heat Exchange", "Constant Temperature"],
      correct: 2,
      explanation: "In an adiabatic process, heat (Q) transferred is zero."
    },
    {
      question: "A car accelerates from rest at 4 m/s² for 5 seconds. What is its final velocity?",
      options: ["10 m/s", "20 m/s", "40 m/s", "9 m/s"],
      correct: 1,
      explanation: "v = u + at. v = 0 + (4)(5) = 20 m/s."
    }
  ],
  "Calculus Integration": [
    {
      question: "What is the integral of 2x with respect to x?",
      options: ["x² + C", "2 + C", "x + C", "2x² + C"],
      correct: 0,
      explanation: "Using the power rule: ∫ x^n dx = (x^(n+1))/(n+1) + C. So ∫ 2x dx = x² + C."
    },
    {
      question: "Evaluate the definite integral of cos(x) from 0 to π/2.",
      options: ["0", "1", "-1", "π"],
      correct: 1,
      explanation: "∫ cos(x) dx = sin(x). sin(π/2) - sin(0) = 1 - 0 = 1."
    },
    {
      question: "Which integration technique is best for ∫ x*e^x dx?",
      options: ["U-Substitution", "Partial Fractions", "Integration by Parts", "Trig Substitution"],
      correct: 2,
      explanation: "Integration by parts is used for products of algebraic and exponential functions (LIATE rule)."
    }
  ],
  "Chemical Bonding": [
    {
      question: "Which type of bond involves the sharing of electron pairs between atoms?",
      options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
      correct: 1,
      explanation: "Covalent bonds form when nonmetals share electrons to achieve a full valence shell."
    },
    {
      question: "What is the molecular geometry of Methane (CH4)?",
      options: ["Linear", "Bent", "Tetrahedral", "Trigonal Planar"],
      correct: 2,
      explanation: "CH4 has 4 bonding pairs and 0 lone pairs around the central Carbon, forming a tetrahedral shape."
    },
    {
      question: "Which element has the highest electronegativity?",
      options: ["Oxygen", "Chlorine", "Fluorine", "Nitrogen"],
      correct: 2,
      explanation: "Fluorine is the most electronegative element on the periodic table (value of 4.0)."
    }
  ]
};

export default function QuizGeneratorView() {
  const [quizState, setQuizState] = useState<"setup" | "generating" | "active" | "results">("setup");
  const [targetTopic, setTargetTopic] = useState<string>("Thermodynamics & Kinematics");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Dynamically load questions based on selected topic
  const questions = quizDatabase[targetTopic];

  const handleGenerate = () => {
    setQuizState("generating");
    setTimeout(() => {
      setQuizState("active");
    }, 2500);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizState("results");
    }
  };

  const resetQuiz = () => {
    setQuizState("setup");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] overflow-y-auto scrollbar-hide p-8 relative">
      {/* Header */}
      <header className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Lightbulb className="text-yellow-400" size={28} />
          Adaptive Quiz Generator
        </h2>
        <p className="text-gray-400 mt-2 text-sm">
          Dynamically synthesizing questions based on your Neural Knowledge Map gaps.
        </p>
      </header>

      <div className="max-w-4xl w-full mx-auto">
        
        {/* STATE 1: SETUP */}
        {quizState === "setup" && (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gray-800/50 rounded-2xl"><Network className="text-yellow-400" size={32} /></div>
              <div>
                <h3 className="text-2xl font-bold text-white">Target Weak Nodes</h3>
                <p className="text-gray-400">Select an identified weakness from your Knowledge Graph to patch.</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              
              {/* TOPIC SELECTOR (NEW!) */}
              <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-gray-800">
                <span className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target size={16} className="text-red-400"/> Select Target Node
                </span>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(quizDatabase).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setTargetTopic(topic)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-300 ${
                        targetTopic === topic 
                          ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                          : "bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Curve Info */}
              <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Difficulty Curve</span>
                <span className="text-blue-400 font-bold bg-blue-400/10 px-3 py-1 rounded-full text-sm">Adaptive (Level 2 → 4)</span>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full py-4 bg-white text-black rounded-xl font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" /> GENERATE NEURAL QUIZ
            </button>
          </div>
        )}

        {/* STATE 2: GENERATING */}
        {quizState === "generating" && (
          <div className="border border-gray-800 bg-[#111] rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-2xl h-[400px]">
            <div className="relative w-24 h-24 mb-8">
               <div className="absolute inset-0 rounded-full border-t-4 border-yellow-400 animate-spin"></div>
               <div className="absolute inset-2 rounded-full border-r-4 border-blue-500 animate-spin border-opacity-50" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
               <Brain size={32} className="absolute inset-0 m-auto text-gray-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 animate-pulse">Synthesizing {targetTopic}...</h3>
            <p className="text-gray-500 max-w-sm">Cross-referencing RAG database with your weak Knowledge Graph vectors.</p>
          </div>
        )}

        {/* STATE 3: ACTIVE QUIZ */}
        {quizState === "active" && (
          <div className="bg-[#111] border border-gray-800 rounded-3xl p-10 shadow-2xl">
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-6 text-sm font-bold text-gray-500">
              <span className="text-blue-400 uppercase tracking-widest">{targetTopic}</span>
              <span className="flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> {score * 10} XP Potential</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full mb-10 overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <h3 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
              {questions[currentQuestion].question}
            </h3>

            {/* Options */}
            <div className="space-y-4 mb-10">
              {questions[currentQuestion].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(i)}
                  className={`w-full p-5 rounded-2xl border text-left font-medium transition-all duration-200 flex justify-between items-center ${
                    selectedAnswer === i 
                      ? "bg-yellow-400/10 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)]" 
                      : "bg-[#1A1A1A] border-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-800"
                  }`}
                >
                  {option}
                  {selectedAnswer === i && <CheckCircle2 size={20} />}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm font-bold">Q {currentQuestion + 1} of {questions.length}</span>
              <button 
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  selectedAnswer !== null 
                    ? "bg-white text-black hover:scale-105" 
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
              >
                {currentQuestion === questions.length - 1 ? "FINISH QUIZ" : "NEXT QUESTION"} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STATE 4: RESULTS */}
        {quizState === "results" && (
          <div className="bg-gradient-to-b from-[#1A1A1A] to-[#111] border border-gray-800 rounded-3xl p-12 shadow-2xl text-center relative overflow-hidden">
            {/* Confetti Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-b ${score > 1 ? 'from-green-500/20' : 'from-red-500/20'} to-transparent blur-3xl pointer-events-none`}></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-8 border-gray-800 flex items-center justify-center mb-6 relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path 
                    className={`${score > 1 ? 'text-green-500' : 'text-red-500'} animate-[dash_1.5s_ease-out_forwards]`}
                    strokeDasharray={`${(score / questions.length) * 100}, 100`} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="currentColor" strokeWidth="3" 
                  />
                </svg>
                <span className="text-4xl font-bold text-white">{Math.round((score / questions.length) * 100)}%</span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                {score === questions.length ? "Perfect Mastery!" : score > 1 ? "Great Progress!" : "Needs More Review"}
              </h2>
              <p className="text-gray-400 mb-8 max-w-md">
                You scored {score} out of {questions.length} in <span className="text-white font-semibold">{targetTopic}</span>. The Cognitive Engine has updated your Knowledge Graph accordingly.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">XP Earned</span>
                  <span className="text-xl font-bold text-yellow-400">+{score * 50}</span>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                  <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Graph Synapses</span>
                  <span className={`text-xl font-bold ${score > 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {score > 1 ? '+ Upgraded' : 'Unchanged'}
                  </span>
                </div>
              </div>

              <button 
                onClick={resetQuiz}
                className="px-8 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCw size={18} /> GENERATE NEW QUIZ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}