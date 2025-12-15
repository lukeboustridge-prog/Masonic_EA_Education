'use client';

export const generateSpriteUrl = (key: string): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  
  // Pillars are tall (40x160), others are 32x32
  const isPillar = key.startsWith('pillar');
  canvas.width = isPillar ? 40 : 32;
  canvas.height = isPillar ? 160 : 32;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Helper for Pillar Shafts
  const drawShaft = () => {
      rect(6, 20, 28, 130, '#e2e8f0'); // Shaft
      ctx.fillStyle = 'rgba(0,0,0,0.1)'; // Fluting
      rect(10, 20, 2, 130, null as any); rect(16, 20, 2, 130, null as any);
      rect(22, 20, 2, 130, null as any); rect(28, 20, 2, 130, null as any);
      rect(4, 150, 32, 10, '#cbd5e1'); // Base
  };

  switch(key) {
    case 'gauge': // 24 Inch Gauge
        ctx.save(); ctx.translate(16, 16); ctx.rotate(-Math.PI / 4);
        rect(-14, -3, 28, 6, '#d97706'); rect(-14, -3, 28, 1, '#fcd34d');
        ctx.fillStyle = '#78350f'; for(let i=-12; i<=12; i+=4) ctx.fillRect(i, -3, 1, 3);
        ctx.restore(); break;
    case 'gavel': // Gavel
        ctx.save(); ctx.translate(16, 16); ctx.rotate(-Math.PI / 4);
        rect(-2, 0, 4, 14, '#92400e'); rect(-6, -8, 12, 8, '#94a3b8'); rect(5, -8, 1, 8, '#475569');
        ctx.restore(); break;
    case 'chisel': // Chisel
        ctx.save(); ctx.translate(16, 16); ctx.rotate(Math.PI / 4); 
        rect(-2, -8, 4, 8, '#78350f'); rect(-2, 0, 4, 12, '#cbd5e1'); 
        ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(2, 12); ctx.lineTo(0, 15); ctx.fill();
        ctx.restore(); break;
    case 'rough_ashlar': // Rough Ashlar
        rect(6, 8, 20, 18, '#64748b'); rect(8, 10, 4, 4, '#475569'); rect(7, 7, 2, 2, '#94a3b8');
        break;
    case 'perfect_ashlar': // Perfect Ashlar
        rect(7, 7, 18, 18, '#cbd5e1'); rect(7, 7, 18, 1, '#f8fafc'); rect(7, 24, 18, 1, '#475569');
        rect(14, 5, 4, 2, '#334155'); // Hook
        break;
    case 'ladder': // Ladder
        rect(9, 2, 3, 28, '#854d0e'); rect(20, 2, 3, 28, '#854d0e');
        for(let y=6; y<28; y+=5) rect(9, y, 14, 2, '#ca8a04');
        break;
    case 'apron': // Apron
        ctx.save(); ctx.translate(16, 16);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-8, -6, 20, 18);
        rect(-10, -8, 20, 18, '#ffffff'); ctx.strokeRect(-10, -8, 20, 18);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(10, -8); ctx.lineTo(0, 0); ctx.fill(); ctx.stroke();
        ctx.restore(); break;
    case 'square_compass': // Checkpoint
        ctx.save(); ctx.translate(16, 16);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(0, 6); ctx.lineTo(10, -4); ctx.stroke();
        ctx.strokeStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-8, 10); ctx.moveTo(0, -10); ctx.lineTo(8, 10); ctx.stroke();
        ctx.restore(); break;
    case 'pillar_ionic': // Wisdom
        drawShaft();
        rect(2, 5, 36, 15, '#cbd5e1'); // Capital
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(8, 10, 6, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(32, 10, 6, 0, Math.PI*2); ctx.fill();
        break;
    case 'pillar_doric': // Strength
        drawShaft();
        rect(2, 10, 36, 10, '#94a3b8'); rect(0, 0, 40, 10, '#cbd5e1');
        break;
    case 'pillar_corinthian': // Beauty
        drawShaft();
        rect(4, 5, 32, 20, '#cbd5e1');
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(10, 20, 4, 0, Math.PI, true); ctx.fill(); ctx.beginPath(); ctx.arc(30, 20, 4, 0, Math.PI, true); ctx.fill();
        rect(0, 0, 40, 5, '#e2e8f0');
        break;
    default:
        rect(0,0,32,32,'#ef4444'); break;
  }
  return canvas.toDataURL();
};