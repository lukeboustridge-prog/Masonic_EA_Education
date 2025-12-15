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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4">
      <div 
        // 2. Container Configuration
        // Base (Mobile Portrait): 90% width, vertical flow, tight padding
        // Desktop (md): Max width 2xl, larger padding
        // Landscape Mobile (landscape): Max width 4xl (wide), very tight vertical padding, optimized for height
        className={`
          relative flex flex-col
          w-[95%] max-h-[90vh]
          
          md:w-full md:max-w-2xl
          
          landscape:w-[95%] landscape:max-w-4xl landscape:max-h-[95vh]
          
          p-4 md:p-10 landscape:p-4
          
          overflow-y-auto
          rounded-xl shadow-2xl border-4 md:border-8 transition-colors duration-200
          ${flashError ? 'bg-red-950 border-red-500' : 'bg-slate-900 border-blue-500'}
        `}
      >
        {/* Question Text - Centered and Prominent (Replaces Header) */}
        <div className="grow flex items-center justify-center mb-6 md:mb-10 landscape:mb-4 px-2 pt-2">
          <p className="text-lg md:text-3xl landscape:text-xl text-slate-100 font-bold text-center leading-snug tracking-wide font-serif">
            {question.text}
          </p>
        </div>

        {/* Answers Grid */}
        <div className="
          grid gap-2 md:gap-4 landscape:gap-3 shrink-0
          grid-cols-1 
          landscape:grid-cols-3
        ">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              // Button Layout
              className="
                group relative w-full 
                py-3 md:py-5 landscape:py-3 
                px-3 md:px-6 landscape:px-3
                rounded-lg bg-slate-800 hover:bg-blue-600 
                border-2 md:border-4 border-slate-700 hover:border-blue-300 
                transition-all active:scale-95 
                flex items-center landscape:flex-col landscape:justify-center landscape:text-center
              "
            >
               {/* Circle Indicator */}
               <span className="
                 flex-shrink-0 
                 w-8 h-8 md:w-12 md:h-12 landscape:w-8 landscape:h-8
                 flex items-center justify-center rounded-full 
                 bg-slate-700 group-hover:bg-blue-500 
                 text-blue-400 group-hover:text-white 
                 font-black text-sm md:text-xl landscape:text-sm
                 mr-3 md:mr-4 landscape:mr-0 landscape:mb-2
                 border md:border-2 border-slate-600 group-hover:border-blue-300 
                 transition-colors shadow-lg
               ">
                 {String.fromCharCode(65 + index)}
               </span>
               
               {/* Answer Text */}
               <span className="text-white text-sm md:text-2xl landscape:text-sm font-semibold leading-tight">
                 {answer}
               </span>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {flashError && (
          <p className="mt-4 md:mt-6 landscape:mt-2 text-center text-red-400 font-bold animate-pulse text-sm md:text-xl landscape:text-sm shrink-0">
            Incorrect! Level Reset.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;