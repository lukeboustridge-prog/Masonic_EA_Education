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
    // 1. Centering: fixed inset-0 ensures viewport coverage. Flex centers the child.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        // 2. Remove Fixed Sizes: w-[90%] for mobile, max-w-xl for bounds. 
        // max-h-[95vh] + overflow-y-auto ensures it fits on small landscape screens without clipping.
        className={`
          relative w-[90%] md:w-full max-w-xl max-h-[95vh] overflow-y-auto
          flex flex-col
          p-5 md:p-8 rounded-xl shadow-2xl border-4 transition-colors duration-200
          ${flashError ? 'bg-red-950 border-red-500' : 'bg-slate-900 border-blue-500'}
        `}
      >
        {/* Header */}
        <div className="mb-4 text-center shrink-0">
          {/* 3. Font Scaling: text-xl on mobile, text-3xl on desktop */}
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Knowledge Orb</h2>
          <div className="h-1 w-16 md:w-24 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Question Text */}
        <div className="grow flex items-center justify-center mb-6">
          <p className="text-base md:text-xl text-slate-100 font-medium text-center leading-relaxed">
            {question.text}
          </p>
        </div>

        {/* 4. Button Layout: Grid that changes based on orientation */}
        <div className="grid gap-3 shrink-0 grid-cols-1 landscape:grid-cols-3 md:landscape:grid-cols-1">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              className="group relative w-full p-3 md:p-4 text-left rounded-lg bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-400 transition-all active:scale-95 flex items-center"
            >
               <span className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-blue-500 text-blue-400 group-hover:text-white font-bold text-xs md:text-sm mr-3 border border-slate-600 group-hover:border-blue-300 transition-colors">
                 {String.fromCharCode(65 + index)}
               </span>
               <span className="text-white text-sm md:text-lg font-medium leading-tight">
                 {answer}
               </span>
            </button>
          ))}
        </div>

        {flashError && (
          <p className="mt-4 text-center text-red-400 font-bold animate-pulse text-sm md:text-base shrink-0">
            Incorrect! Try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;