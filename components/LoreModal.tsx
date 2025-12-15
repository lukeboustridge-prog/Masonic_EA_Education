import React, { useMemo } from 'react';
import { Orb } from '../types';
import { generateSpriteUrl } from '../utils/assetGenerator';

interface LoreModalProps {
  orb: Orb;
  onNext: () => void;
}

const LoreModal: React.FC<LoreModalProps> = ({ orb, onNext }) => {
  // Generate the sprite URL on the fly based on the orb's sprite key
  const spriteUrl = useMemo(() => generateSpriteUrl(orb.spriteKey), [orb.spriteKey]);

  // Determine button text based on context
  const buttonText = useMemo(() => {
    if (orb.questionId !== undefined) return "Proceed to Quiz";
    if (orb.spriteKey === 'apron') return "Put On Apron";
    return "Collect";
  }, [orb.questionId, orb.spriteKey]);

  return (
    // 1. Overlay: Fixed centering with padding
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div 
        // 2. Container: Compact Layout
        // max-h-[90vh] ensures it never goes off screen
        // Flex column to distribute space
        className="
          relative w-[95%] md:w-full max-w-xl max-h-[90vh]
          flex flex-col items-center
          p-4 md:p-6 rounded-xl shadow-2xl border-2 md:border-4 border-amber-500 bg-slate-900
          transition-all duration-200
        "
      >
        {/* Header - Compact */}
        <div className="mb-2 text-center shrink-0">
          <h2 className="text-lg md:text-3xl font-bold text-amber-400 leading-tight tracking-wide uppercase">{orb.name}</h2>
          <div className="h-1 w-12 md:w-24 bg-amber-600 mx-auto rounded-full mt-1"></div>
        </div>

        {/* Content Container - Flex-1 allows it to take available space, overflow-y-auto handles small screens gracefully */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full my-2 md:my-4 overflow-y-auto px-1">
             {/* Sprite Display - Reduced Size */}
            <div className="p-2 bg-slate-800 rounded-full border-2 border-slate-700 shadow-inner shrink-0 mb-3 md:mb-5">
                <img 
                    src={spriteUrl} 
                    alt={orb.name}
                    // Reduced sizes: 64px mobile, 96px desktop
                    className="w-16 h-16 md:w-24 md:h-24 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>

            {/* Blurb Text - Tighter leading */}
            <p className="text-sm md:text-lg text-slate-200 font-serif italic text-center leading-snug">
                "{orb.blurb}"
            </p>
        </div>

        {/* Continue Button - Compact padding */}
        <button
          onClick={onNext}
          className="
            shrink-0
            w-full py-3 md:py-3 px-4
            bg-amber-600 hover:bg-amber-500 active:bg-amber-700
            text-white font-bold text-sm md:text-lg tracking-wider uppercase
            rounded-lg border-b-4 border-amber-800 active:border-b-0 active:translate-y-1
            transition-all shadow-lg
          "
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default LoreModal;