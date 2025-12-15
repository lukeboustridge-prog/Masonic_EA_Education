import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuizModalProps {
  question: Question;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ question, onCorrect, onIncorrect }) => {
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [flashError, setFlashError] = useState(false);

  useEffect(() => {
    // Shuffle answers when question changes to avoid pattern matching
    const shuffled = [...question.answers].sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
    setFlashError(false);
  }, [question]);

  const handleAnswerClick = (answer: string) => {
    if (answer === question.correctAnswer) {
      onCorrect();
    } else {
      triggerError();
    }
  };

  const triggerError = () => {
    setFlashError(true);
    onIncorrect();
    setTimeout(() => setFlashError(false), 500);
  };

  return (
    // 1. Overlay: Fixed centering
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        // 2. Container: Mobile-First Sizing
        // Mobile: 90% width, Max Height 85vh to prevent edge touching
        // Desktop: Max width 2xl
        className={`
          relative w-[90%] md:w-full max-w-2xl max-h-[85vh] overflow-y-auto
          flex flex-col
          p-3 md:p-8 rounded-xl shadow-2xl border-4 md:border-8 transition-colors duration-200
          ${flashError ? 'bg-red-950 border-red-500' : 'bg-slate-900 border-blue-500'}
        `}
      >
        {/* Header - Scaled Typography */}
        <div className="mb-3 md:mb-6 text-center shrink-0">
          <h2 className="text-xl md:text-5xl font-bold text-white mb-1 md:mb-3 tracking-wide">Knowledge Orb</h2>
          <div className="h-1 md:h-2 w-16 md:w-32 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Question Text - Scaled for readability */}
        <div className="grow flex items-center justify-center mb-3 md:mb-8">
          <p className="text-base md:text-3xl text-slate-100 font-bold text-center leading-snug tracking-wide">
            {question.text}
          </p>
        </div>

        {/* Answers - Grid with tight gap on mobile */}
        <div className="grid gap-2 md:gap-4 shrink-0 grid-cols-1">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              // Button Sizing: py-3/px-3 on mobile for touch targets
              className="group relative w-full py-3 md:py-5 px-3 md:px-6 text-left rounded-lg bg-slate-800 hover:bg-blue-600 border-2 md:border-4 border-slate-700 hover:border-blue-300 transition-all active:scale-95 flex items-center"
            >
               {/* Circle Indicator - Scaled Down */}
               <span className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-blue-500 text-blue-400 group-hover:text-white font-black text-sm md:text-xl mr-3 md:mr-4 border md:border-2 border-slate-600 group-hover:border-blue-300 transition-colors shadow-lg">
                 {String.fromCharCode(65 + index)}
               </span>
               {/* Answer Text - Text-sm on mobile */}
               <span className="text-white text-sm md:text-2xl font-semibold leading-tight">
                 {answer}
               </span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {flashError && (
          <p className="mt-2 md:mt-4 text-center text-red-400 font-bold animate-pulse text-sm md:text-xl shrink-0">
            Incorrect! Level Reset.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;