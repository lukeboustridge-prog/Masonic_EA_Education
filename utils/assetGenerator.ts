'use client';

import { BASE64_SPRITES } from './base64Assets';

export const generateSpriteUrl = (key: string): string => {
  // 1. Check if a static Base64 string exists (Priority)
  if (BASE64_SPRITES[key] && BASE64_SPRITES[key].length > 0) {
      return BASE64_SPRITES[key];
  }

  // 2. Fallback: Procedural Canvas Generation
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  
  const isPillar = key.startsWith('pillar');
  // 32x32 for icons, 40x160 for pillars
  canvas.width = isPillar ? 40 : 32;
  canvas.height = isPillar ? 160 : 32;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Ensure crisp pixel art edges
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Drawing Helpers
  const fillRect = (x: number, y: number, w: number, h: number, c: string) => { 
      ctx.fillStyle = c; 
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h)); 
  };

  switch(key) {
    case 'gauge': // 24 Inch Gauge
        ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
        // Body (Gold/Wood)
        fillRect(-14, -4, 28, 8, '#fbbf24'); // Amber 400
        fillRect(-14, -4, 28, 2, '#fcd34d'); // Highlight
        fillRect(-14, 2, 28, 2, '#d97706');  // Shadow
        // Ticks
        ctx.fillStyle = '#78350f'; 
        for(let i=-12; i<=12; i+=4) ctx.fillRect(i, -4, 1, 4);
        break;

    case 'gavel': // Common Gavel
        ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
        
        // Handle (Dark Wood)
        fillRect(-2, 0, 4, 14, '#78350f'); 
        
        // Head (Wood - Setting Maul/Gavel Style)
        // Main Block (Rich Wood)
        ctx.fillStyle = '#92400e'; 
        ctx.beginPath();
        // Mallet shape: wider in middle, tapered slightly or cylindrical
        ctx.moveTo(-4, -12); ctx.lineTo(-10, -10); ctx.lineTo(-10, -2); ctx.lineTo(-4, 0); // Striking Face
        ctx.lineTo(4, 0); ctx.lineTo(10, -2); ctx.lineTo(10, -10); ctx.lineTo(4, -12); // Back Face
        ctx.closePath();
        ctx.fill();

        // Highlight/Grain
        ctx.fillStyle = '#b45309'; 
        ctx.fillRect(-8, -9, 16, 2);

        // Cutting Edge / Chisel Point (Optional but traditional for stone gavel)
        // If we want "wooden mallet", the above cylindrical shape is better. 
        // If we want "Common Gavel" (stone hammer), it has a sharp edge.
        // User asked for "Wooden", implies a Master's Gavel or Maul.
        // Let's stick to the mallet block shape above.
        break;

    case 'chisel': // Chisel
        ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
        // Handle
        fillRect(-2, -10, 4, 10, '#78350f'); 
        // Blade (Steel)
        fillRect(-2, 0, 4, 12, '#94a3b8'); 
        // Beveled Edge
        ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(2, 12); ctx.lineTo(0, 15); 
        ctx.fillStyle = '#cbd5e1'; ctx.fill();
        break;

    case 'rough_ashlar': // Rough Ashlar
        // Base Block
        fillRect(4, 8, 24, 20, '#475569'); 
        // Rough Texture details
        ctx.fillStyle = '#1e293b'; // Dark cracks
        ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(10, 12); ctx.lineTo(4, 16); ctx.fill();
        ctx.beginPath(); ctx.moveTo(28, 28); ctx.lineTo(22, 24); ctx.lineTo(28, 20); ctx.fill();
        // Highlight Edge
        fillRect(6, 8, 18, 2, '#64748b');
        break;

    case 'perfect_ashlar': // Perfect Ashlar
        // Cube
        fillRect(6, 8, 20, 20, '#cbd5e1'); 
        // Outline
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(6.5, 8.5, 19, 19);
        // Lewis (Hook) on top
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(14, 4, 4, 4); // Base of hook
        ctx.beginPath(); ctx.arc(16, 4, 3, Math.PI, 0); ctx.stroke(); // Loop
        break;

    case 'ladder': // Jacob's Ladder
        // Rails
        fillRect(8, 2, 3, 28, '#854d0e'); 
        fillRect(21, 2, 3, 28, '#854d0e');
        // Rungs
        ctx.fillStyle = '#ca8a04';
        for(let y=6; y<28; y+=6) fillRect(8, y, 16, 2, '#ca8a04');
        break;

    case 'apron': // Masonic Apron
        ctx.translate(cx, cy);
        
        // Strings/Belt
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -8); ctx.lineTo(16, -8); // Waist string
        ctx.stroke();

        // Main Body (White Square)
        ctx.fillStyle = '#ffffff'; 
        ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 4;
        ctx.fillRect(-11, -8, 22, 18);
        ctx.shadowBlur = 0;
        
        // Border/Outline
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
        ctx.strokeRect(-11, -8, 22, 18);

        // Flap (Triangle DOWN for NZ Style)
        ctx.beginPath(); 
        ctx.moveTo(-11, -8); 
        ctx.lineTo(11, -8); 
        ctx.lineTo(0, 2); // Points Down into the apron body
        ctx.closePath();
        ctx.fillStyle = '#ffffff'; 
        ctx.fill(); 
        ctx.stroke();
        break;

    case 'square_compass': // Logo/Checkpoint
        ctx.translate(cx, cy);
        // Compass (Points Down) - Gold
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-8, 9); ctx.lineTo(0, -9); ctx.lineTo(8, 9); ctx.stroke();
        // Square (Angle Down) - Silver/Steel
        ctx.strokeStyle = '#cbd5e1'; 
        ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(0, 6); ctx.lineTo(10, -3); ctx.stroke();
        break;

    case 'pillar_ionic': // Wisdom
        // Base
        fillRect(4, 140, 32, 20, '#cbd5e1');
        // Shaft (Gradient)
        const gI = ctx.createLinearGradient(6,0,34,0);
        gI.addColorStop(0, '#94a3b8'); gI.addColorStop(0.5, '#f1f5f9'); gI.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gI; ctx.fillRect(6, 25, 28, 115);
        // Capital (Volutes/Scrolls)
        fillRect(2, 10, 36, 15, '#cbd5e1');
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(10, 18, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, 18, 5, 0, Math.PI*2); ctx.fill();
        break;

    case 'pillar_doric': // Strength
        // Base
        fillRect(4, 140, 32, 20, '#cbd5e1');
        // Shaft
        const gD = ctx.createLinearGradient(6,0,34,0);
        gD.addColorStop(0, '#94a3b8'); gD.addColorStop(0.5, '#f1f5f9'); gD.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gD; ctx.fillRect(6, 20, 28, 120);
        // Capital (Simple Slab)
        fillRect(2, 10, 36, 10, '#cbd5e1');
        fillRect(4, 20, 32, 5, '#94a3b8');
        break;

    case 'pillar_corinthian': // Beauty
        // Base
        fillRect(4, 140, 32, 20, '#cbd5e1');
        // Shaft
        const gC = ctx.createLinearGradient(6,0,34,0);
        gC.addColorStop(0, '#94a3b8'); gC.addColorStop(0.5, '#f1f5f9'); gC.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gC; ctx.fillRect(6, 35, 28, 105);
        // Capital (Ornate Leaves)
        fillRect(4, 5, 32, 30, '#cbd5e1');
        ctx.fillStyle = '#64748b'; // Leaf details
        ctx.beginPath(); ctx.moveTo(4, 35); ctx.lineTo(4, 15); ctx.lineTo(10, 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(36, 35); ctx.lineTo(36, 15); ctx.lineTo(30, 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(18, 35); ctx.lineTo(20, 15); ctx.lineTo(22, 35); ctx.fill();
        break;
        
    default:
        fillRect(0,0,32,32,'#ef4444'); 
  }

  return canvas.toDataURL();
};