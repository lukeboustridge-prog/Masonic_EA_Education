export const generateSpriteUrl = (key: string): string => {
  const canvas = document.createElement('canvas');
  // 32x32 is a standard retro sprite size
  canvas.width = 32;
  canvas.height = 32;
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
  ctx.clearRect(0, 0, 32, 32);

  switch(key) {
    case 'gauge':
        // 24 Inch Gauge: Diagonal Ruler
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);
        // Wood body
        rect(-14, -3, 28, 6, '#d97706'); // amber-600
        rect(-14, -3, 28, 1, '#fcd34d'); // Highlight top
        rect(-14, 2, 28, 1, '#92400e'); // Shadow bottom
        // Ticks representing 24 hours
        ctx.fillStyle = '#78350f';
        for(let i = -12; i <= 12; i+=4) {
            ctx.fillRect(i, -3, 1, 3);
        }
        ctx.restore();
        break;

    case 'gavel':
        // Common Gavel: Stone Mason's Mallet
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4); // Handle points bottom-left
        // Handle
        rect(-2, 0, 4, 14, '#92400e'); 
        // Head (Stone)
        rect(-6, -8, 12, 8, '#94a3b8'); // slate-400
        rect(-6, -8, 1, 8, '#cbd5e1'); // highlight left
        rect(5, -8, 1, 8, '#475569'); // shadow right
        // Bevels
        rect(-7, -7, 1, 6, '#64748b');
        rect(6, -7, 1, 6, '#64748b');
        ctx.restore();
        break;

    case 'chisel':
        // Chisel: Sharp steel tool
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(Math.PI / 4); 
        // Handle
        rect(-2, -8, 4, 8, '#78350f');
        // Metal Blade
        rect(-2, 0, 4, 12, '#cbd5e1'); // silver
        rect(-2, 0, 1, 12, '#f1f5f9'); // highlight
        // Sharp Tip
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(-2, 12);
        ctx.lineTo(2, 12);
        ctx.lineTo(0, 15);
        ctx.fill();
        ctx.restore();
        break;

    case 'rough_ashlar':
        // Rough Ashlar: Irregular Stone Block
        // Main block
        rect(6, 8, 20, 18, '#64748b');
        // Rough edges details (Noise)
        rect(8, 10, 4, 4, '#475569'); // deep pit
        rect(20, 22, 3, 3, '#334155'); // shadow corner
        rect(7, 7, 2, 2, '#94a3b8'); // bump
        rect(22, 12, 2, 2, '#1e293b'); // crack
        rect(15, 15, 6, 2, '#475569'); // groove
        // Irregular outline
        rect(6, 6, 2, 2, '#64748b');
        rect(24, 24, 2, 2, '#64748b');
        break;

    case 'perfect_ashlar':
        // Perfect Ashlar: Smooth Cube
        rect(7, 7, 18, 18, '#cbd5e1'); // Light stone
        // Bevel/Border for 3D effect
        rect(7, 7, 18, 1, '#f8fafc'); // Top High
        rect(7, 7, 1, 18, '#f8fafc'); // Left High
        rect(7, 24, 18, 1, '#475569'); // Bottom Shadow
        rect(24, 7, 1, 18, '#475569'); // Right Shadow
        // Inner face flatness
        rect(9, 9, 14, 14, '#e2e8f0');
        // Lifting hook (Lewis) attachment point
        rect(14, 5, 4, 2, '#334155'); 
        break;

    case 'ladder':
        // Jacob's Ladder
        // Rails
        rect(9, 2, 3, 28, '#854d0e');
        rect(20, 2, 3, 28, '#854d0e');
        // Rungs
        for(let y=6; y<28; y+=5) {
            rect(9, y, 14, 2, '#ca8a04'); // brighter wood for rungs
            rect(9, y+2, 14, 1, '#713f12'); // shadow
        }
        break;

    case 'square_compass':
        // Square and Compass (No G)
        ctx.save();
        ctx.translate(16, 16);
        
        // 1. The Square (Silver, 90 degrees)
        // A 'V' shape pointing down
        ctx.strokeStyle = '#cbd5e1'; // slate-300
        ctx.lineWidth = 4;
        ctx.lineJoin = 'miter';
        ctx.beginPath();
        // Left arm
        ctx.moveTo(-12, -4);
        ctx.lineTo(0, 8);
        // Right arm
        ctx.lineTo(12, -4);
        ctx.stroke();

        // Highlight for Square
        ctx.strokeStyle = '#f1f5f9'; // white-ish
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12, -5);
        ctx.lineTo(0, 7);
        ctx.lineTo(12, -5);
        ctx.stroke();

        // 2. The Compass (Gold, Points down)
        // Inverted 'V' shape over the square
        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Pivot
        ctx.moveTo(0, -12);
        // Left leg
        ctx.lineTo(-9, 12);
        // Pivot
        ctx.moveTo(0, -12);
        // Right leg
        ctx.lineTo(9, 12);
        ctx.stroke();

        // Compass Pivot Head
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        break;
        
    default:
        // Fallback placeholder
        rect(0,0,32,32,'#ef4444');
        break;
  }

  return canvas.toDataURL();
};