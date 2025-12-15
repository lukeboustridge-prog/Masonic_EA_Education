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
        // 2. Big Pixel Styling: w-[95%] for max mobile width, border-8 for chunky look
        className={`
          relative w-[95%] md:w-full max-w-2xl max-h-[95vh] overflow-y-auto
          flex flex-col
          p-6 md:p-8 rounded-xl shadow-2xl border-8 transition-colors duration-200
          ${flashError ? 'bg-red-950 border-red-500' : 'bg-slate-900 border-blue-500'}
        `}
      >
        {/* Header */}
        <div className="mb-6 text-center shrink-0">
          {/* 3. Massive Text Scaling */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-wide">Knowledge Orb</h2>
          <div className="h-2 w-24 md:w-32 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        {/* Question Text */}
        <div className="grow flex items-center justify-center mb-8">
          <p className="text-2xl md:text-4xl text-slate-100 font-bold text-center leading-snug tracking-wide">
            {question.text}
          </p>
        </div>

        {/* 4. Button Layout: Grid that changes based on orientation */}
        <div className="grid gap-4 shrink-0 grid-cols-1 landscape:grid-cols-3 md:landscape:grid-cols-1">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              // Chunky Buttons with lots of padding
              className="group relative w-full py-6 px-4 text-left rounded-lg bg-slate-800 hover:bg-blue-600 border-4 border-slate-700 hover:border-blue-300 transition-all active:scale-95 flex items-center"
            >
               {/* Large Letter Circle */}
               <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-700 group-hover:bg-blue-500 text-blue-400 group-hover:text-white font-black text-xl mr-4 border-2 border-slate-600 group-hover:border-blue-300 transition-colors shadow-lg">
                 {String.fromCharCode(65 + index)}
               </span>
               {/* Large Answer Text */}
               <span className="text-white text-xl md:text-2xl font-semibold leading-tight">
                 {answer}
               </span>
            </button>
          ))}
        </div>

        {flashError && (
          <p className="mt-4 text-center text-red-400 font-bold animate-pulse text-lg md:text-xl shrink-0">
            Incorrect! Level Reset.
          </p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;