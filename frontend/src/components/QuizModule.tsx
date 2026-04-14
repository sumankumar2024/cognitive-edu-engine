"use client";
import { useState, useEffect } from 'react';

// We structure it this way so we can easily swap this with a real API call later
const getMockQuestions = (exam: string) => {
  if (exam === "GATE Computer Science") {
    return [
      { q: "What is the worst-case time complexity of QuickSort?", options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"], answer: "O(n^2)", explanation: "QuickSort degrades to O(n^2) when the pivot chosen is consistently the smallest or largest element." },
      { q: "Which scheduling algorithm is non-preemptive?", options: ["Round Robin", "Shortest Remaining Time First", "First Come First Serve", "Multilevel Queue"], answer: "First Come First Serve", explanation: "FCFS executes processes to completion without interruption." }
    ];
  }
  return [
    { q: "What is the derivative of sin(x)?", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], answer: "cos(x)", explanation: "The rate of change of the sine function is the cosine function." },
    { q: "Which law states that V = IR?", options: ["Newton's Law", "Faraday's Law", "Ohm's Law", "Boyle's Law"], answer: "Ohm's Law", explanation: "Ohm's Law defines the relationship between voltage, current, and resistance." }
  ];
};

export default function QuizModule({ exam = "General", level = "Beginner" }: { exam?: string, level?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API fetch delay
    setTimeout(() => {
      setQuestions(getMockQuestions(exam));
      setCurrentQ(0);
      setScore(0);
      setSelectedAns(null);
      setIsCorrect(null);
      setQuizFinished(false);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSelect = (option: string) => {
    if (selectedAns) return; // Prevent changing answer
    setSelectedAns(option);
    if (option === questions[currentQ].answer) {
      setIsCorrect(true);
      setScore(s => s + 1);
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setSelectedAns(null);
      setIsCorrect(null);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[280px]">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Targeted Quiz Engine
      </h3>

      {/* State 1: Ready to Generate */}
      {questions.length === 0 && !isGenerating && (
        <div className="text-center mt-8 animate-fade-in-up">
          <p className="text-slate-400 text-sm mb-6">Ready to test your <span className="text-indigo-300">{exam}</span> knowledge?</p>
          <button onClick={handleGenerate} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl w-full transition-all shadow-lg">
            Generate Quiz from Graph
          </button>
        </div>
      )}

      {/* State 2: Loading */}
      {isGenerating && (
        <div className="flex flex-col justify-center items-center h-40 animate-pulse">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">Querying AI Agents...</p>
        </div>
      )}

      {/* State 3: Taking the Quiz */}
      {questions.length > 0 && !quizFinished && (
        <div className="animate-fade-in-up">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-bold tracking-widest">
            <span>QUESTION {currentQ + 1} OF {questions.length}</span>
            <span>SCORE: {score}</span>
          </div>
          <p className="text-white font-medium text-sm mb-4 leading-relaxed">{questions[currentQ].q}</p>
          
          <div className="space-y-2 mb-4">
            {questions[currentQ].options.map((opt: string) => {
              let btnClass = "bg-slate-800 text-slate-300 border-slate-700 hover:border-indigo-500";
              if (selectedAns === opt) {
                btnClass = isCorrect ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-red-500/20 text-red-400 border-red-500";
              } else if (selectedAns && opt === questions[currentQ].answer) {
                btnClass = "bg-emerald-500/10 text-emerald-300 border-emerald-500/50 border-dashed"; // Highlight correct answer if they got it wrong
              }

              return (
                <button 
                  key={opt} 
                  onClick={() => handleSelect(opt)}
                  disabled={!!selectedAns}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedAns && (
            <div className="animate-fade-in-up">
              <p className={`text-xs mb-3 font-medium ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {isCorrect ? "✅ Correct!" : "❌ Incorrect."} <span className="text-slate-400 font-normal">{questions[currentQ].explanation}</span>
              </p>
              <button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-bold">
                {currentQ + 1 === questions.length ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 4: Finished */}
      {quizFinished && (
        <div className="text-center animate-fade-in-up pt-4">
          <h4 className="text-2xl font-bold text-white mb-2">{score}/{questions.length}</h4>
          <p className="text-emerald-400 font-bold text-sm mb-1">Knowledge Graph Updated!</p>
          <p className="text-slate-400 text-xs mb-6">The AI has logged your weak areas.</p>
          <button onClick={() => setQuestions([])} className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-6 rounded-lg font-bold text-sm border border-slate-700 w-full transition-all">
            Generate Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}