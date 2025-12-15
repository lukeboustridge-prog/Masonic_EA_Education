export const generateSpriteUrl = (key: string): string => {
  const canvas = document.createElement('canvas');
  
  // Default dimensions
  let width = 32;
  let height = 32;

  // Custom dimensions for tall structures
  if (key.startsWith('pillar')) {
      width = 40;
      height = 160;
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Disable smoothing for crisp pixel art drawing
  ctx.imageSmoothingEnabled = false;

  // Helper for drawing rectangles
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Helper for Pillar Shaft
  const drawShaft = () => {
      // Main shaft
      rect(6, 20, 28, 130, '#e2e8f0'); // slate-200 marble
      // Fluting (Vertical shadows)
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      rect(10, 20, 2, 130, null as any);
      rect(16, 20, 2, 130, null as any);
      rect(22, 20, 2, 130, null as any);
      rect(28, 20, 2, 130, null as any);
      // Base
      rect(4, 150, 32, 10, '#cbd5e1'); // slate-300
      rect(2, 155, 36, 5, '#94a3b8'); // slate-400
  };

  switch(key) {
    case 'gauge':
        // 24 Inch Gauge: Diagonal Ruler
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);
        rect(-14, -3, 28, 6, '#d97706'); // amber-600
        rect(-14, -3, 28, 1, '#fcd34d'); // Highlight top
        rect(-14, 2, 28, 1, '#92400e'); // Shadow bottom
        ctx.fillStyle = '#78350f';
        for(let i = -12; i <= 12; i+=4) {
            ctx.fillRect(i, -3, 1, 3);
        }
        ctx.restore();
        break;

    case 'gavel':
        // Common Gavel
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4); 
        rect(-2, 0, 4, 14, '#92400e'); 
        rect(-6, -8, 12, 8, '#94a3b8'); 
        rect(-6, -8, 1, 8, '#cbd5e1'); 
        rect(5, -8, 1, 8, '#475569'); 
        rect(-7, -7, 1, 6, '#64748b');
        rect(6, -7, 1, 6, '#64748b');
        ctx.restore();
        break;

    case 'chisel':
        // Chisel
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(Math.PI / 4); 
        rect(-2, -8, 4, 8, '#78350f');
        rect(-2, 0, 4, 12, '#cbd5e1'); 
        rect(-2, 0, 1, 12, '#f1f5f9'); 
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-2, 12);
        ctx.lineTo(2, 12);
        ctx.lineTo(0, 15);
        ctx.fill();
        ctx.restore();
        break;

    case 'rough_ashlar':
        // Rough Ashlar
        rect(6, 8, 20, 18, '#64748b');
        rect(8, 10, 4, 4, '#475569'); 
        rect(20, 22, 3, 3, '#334155'); 
        rect(7, 7, 2, 2, '#94a3b8'); 
        rect(22, 12, 2, 2, '#1e293b'); 
        rect(15, 15, 6, 2, '#475569'); 
        rect(6, 6, 2, 2, '#64748b');
        rect(24, 24, 2, 2, '#64748b');
        break;

    case 'perfect_ashlar':
        // Perfect Ashlar
        rect(7, 7, 18, 18, '#cbd5e1'); 
        rect(7, 7, 18, 1, '#f8fafc'); 
        rect(7, 7, 1, 18, '#f8fafc'); 
        rect(7, 24, 18, 1, '#475569'); 
        rect(24, 7, 1, 18, '#475569'); 
        rect(9, 9, 14, 14, '#e2e8f0');
        rect(14, 5, 4, 2, '#334155'); 
        break;

    case 'ladder':
        // Jacob's Ladder
        rect(9, 2, 3, 28, '#854d0e');
        rect(20, 2, 3, 28, '#854d0e');
        for(let y=6; y<28; y+=5) {
            rect(9, y, 14, 2, '#ca8a04'); 
            rect(9, y+2, 14, 1, '#713f12'); 
        }
        break;

    case 'apron':
        // Masonic Apron
        ctx.save();
        ctx.translate(16, 16);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(-8, -6, 20, 18);
        rect(-10, -8, 20, 18, '#ffffff'); 
        ctx.strokeStyle = '#e2e8f0'; 
        ctx.lineWidth = 1;
        ctx.strokeRect(-10, -8, 20, 18);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.lineTo(10, -8);
        ctx.lineTo(0, 0); 
        ctx.closePath();
        ctx.fill();
        ctx.stroke(); 
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -8); ctx.lineTo(-14, -6);
        ctx.moveTo(10, -8); ctx.lineTo(14, -6);
        ctx.stroke();
        ctx.restore();
        break;

    case 'square_compass':
        // Square and Compass
        ctx.save();
        ctx.translate(16, 16);
        ctx.strokeStyle = '#cbd5e1'; 
        ctx.lineWidth = 4;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(0, 8);
        ctx.lineTo(12, -4);
        ctx.stroke();
        ctx.strokeStyle = '#f1f5f9'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, -5);
        ctx.lineTo(0, 7);
        ctx.lineTo(12, -5);
        ctx.stroke();
        ctx.strokeStyle = '#fbbf24'; 
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-9, 12);
        ctx.moveTo(0, -12);
        ctx.lineTo(9, 12);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -12, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
    
    // --- NEW PILLAR TYPES ---
    
    case 'pillar_ionic':
        // Wisdom: Slender, Scroll Capital
        drawShaft();
        // Capital
        rect(2, 5, 36, 15, '#cbd5e1');
        // Volutes (Scrolls)
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath(); ctx.arc(8, 10, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(32, 10, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath(); ctx.arc(8, 10, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(32, 10, 3, 0, Math.PI*2); ctx.fill();
        break;

    case 'pillar_doric':
        // Strength: Stout, Simple
        drawShaft();
        // Simple Capital (Abacus & Echinus)
        rect(2, 10, 36, 10, '#94a3b8'); // Echinus (Bowl)
        rect(0, 0, 40, 10, '#cbd5e1');  // Abacus (Slab)
        break;

    case 'pillar_corinthian':
        // Beauty: Ornate, Leaves
        drawShaft();
        // Capital
        rect(4, 5, 32, 20, '#cbd5e1'); // Core
        // Leaves (Stylized)
        ctx.fillStyle = '#94a3b8';
        // Bottom row
        ctx.beginPath(); ctx.arc(10, 20, 4, 0, Math.PI, true); ctx.fill();
        ctx.beginPath(); ctx.arc(20, 20, 4, 0, Math.PI, true); ctx.fill();
        ctx.beginPath(); ctx.arc(30, 20, 4, 0, Math.PI, true); ctx.fill();
        // Top row (Volutes)
        ctx.beginPath(); ctx.moveTo(4, 5); ctx.quadraticCurveTo(0, 0, 8, 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(36, 5); ctx.quadraticCurveTo(40, 0, 32, 5); ctx.stroke();
        // Abacus
        rect(0, 0, 40, 5, '#e2e8f0');
        break;

    default:
        rect(0,0,32,32,'#ef4444');
        break;
  }

  return canvas.toDataURL();
};