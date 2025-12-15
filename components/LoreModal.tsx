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

  return (
    // 1. Overlay: Fixed centering with padding
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div 
        // 2. Container: Mobile-First Sizing
        // Mobile: 85% width to show background context, constrained height
        // Padding reduced to p-4 on mobile
        className="
          relative w-[85%] md:w-full max-w-xl max-h-[85vh] overflow-y-auto
          flex flex-col items-center
          p-4 md:p-8 rounded-xl shadow-2xl border-4 md:border-8 border-amber-500 bg-slate-900
          transition-all duration-200
        "
      >
        {/* Header - Compact on mobile */}
        <div className="mb-2 md:mb-4 text-center shrink-0">
          <h2 className="text-lg md:text-4xl font-bold text-amber-400 mb-1 md:mb-2 tracking-wide uppercase">{orb.name}</h2>
          <div className="h-1 md:h-1.5 w-16 md:w-32 bg-amber-600 mx-auto rounded-full"></div>
        </div>

        {/* Sprite Display - Significantly smaller on mobile (w-20) */}
        <div className="my-3 md:my-6 p-2 md:p-4 bg-slate-800 rounded-full border-4 border-slate-700 shadow-inner shrink-0">
            <img 
                src={spriteUrl} 
                alt={orb.name}
                // Mobile: w-20 h-20 (80px), Desktop: w-32 h-32 (128px)
                className="w-20 h-20 md:w-32 md:h-32 object-contain"
                style={{ imageRendering: 'pixelated' }}
            />
        </div>

        {/* Blurb Text - Small and readable on mobile */}
        <div className="grow mb-4 md:mb-6">
          <p className="text-sm md:text-xl text-slate-200 font-serif italic text-center leading-relaxed">
            "{orb.blurb}"
          </p>
        </div>

        {/* Continue Button - Touch friendly */}
        <button
          onClick={onNext}
          className="
            shrink-0
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