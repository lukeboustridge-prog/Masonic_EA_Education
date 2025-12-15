import React from 'react';
import { Orb } from '../types';

interface LoreModalProps {
  orb: Orb;
  onNext: () => void;
}

const LoreModal: React.FC<LoreModalProps> = ({ orb, onNext }) => {
  return (
    // 1. Overlay: Flex centering with padding
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div 
        // 2. Container: Compact on mobile, wider on desktop
        className="
          relative w-[85%] md:w-full max-w-xl max-h-[90vh] overflow-y-auto
          flex flex-col items-center
          p-4 md:p-8 rounded-xl shadow-2xl border-4 md:border-8 border-amber-500 bg-slate-900
          transition-all duration-200
        "
      >
        {/* Header */}
        <div className="mb-4 text-center shrink-0">
          <h2 className="text-xl md:text-4xl font-bold text-amber-400 mb-2 tracking-wide uppercase">{orb.name}</h2>
          <div className="h-0.5 md:h-1 w-24 md:w-48 bg-amber-600 mx-auto rounded-full"></div>
        </div>

        {/* Sprite Display */}
        <div className="my-4 p-4 bg-slate-800 rounded-full border-4 border-slate-700 shadow-inner">
            <img 
                src={`/sprites/${orb.spriteKey}.png`} 
                alt={orb.name}
                className="w-24 h-24 md:w-32 md:h-32 object-contain pixelated rendering-pixelated"
                onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerText = orb.name[0];
                    e.currentTarget.parentElement!.className = "my-4 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center text-4xl font-bold text-amber-500 bg-slate-800 rounded-full border-4 border-slate-700";
                }}
            />
        </div>

        {/* Blurb Text */}
        <div className="grow mb-6">
          <p className="text-sm md:text-xl text-slate-200 font-serif italic text-center leading-relaxed">
            "{orb.blurb}"
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onNext}
          className="
            w-full py-3 md:py-4 px-6 
            bg-amber-600 hover:bg-amber-500 active:bg-amber-700
            text-white font-bold text-sm md:text-xl tracking-wider uppercase
            rounded-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1
            transition-all shadow-lg
          "
        >
          Proceed to Quiz
        </button>
      </div>
    </div>
  );
};

export default LoreModal;