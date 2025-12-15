import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Orb, Platform, Question } from '../types';
import { 
  GRAVITY, FRICTION, MOVE_SPEED, JUMP_FORCE, 
  WORLD_WIDTH, PLATFORM_DATA, ORB_DATA, GOAL_X, QUESTIONS,
  DESIGN_HEIGHT, CHECKPOINTS
} from '../constants';
import QuizModal from './QuizModal';
import LoreModal from './LoreModal';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dimensions state
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [score, setScore] = useState(0);
  const [activeOrb, setActiveOrb] = useState<Orb | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // Mutable Game State
  const playerRef = useRef<Player>({
    x: 50, y: 0, width: 30, height: 45, 
    vx: 0, vy: 0, 
    isGrounded: false, 
    color: '#ffffff', 
    facing: 1, 
    jumpCount: 0,
    coyoteTimer: 0 
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  const orbsStateRef = useRef<Set<number>>(new Set()); // IDs of inactive orbs
  
  // Checkpoint State
  const lastCheckpointRef = useRef({ x: 50, y: DESIGN_HEIGHT - 100 });
  
  // Camera now tracks X and Y
  const cameraRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Asset Loading
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});

  // --- Initialization & Resize ---
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDimensions({ w, h });
      setIsPortrait(h > w);
    };
    
    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize player Y when dimensions change
  useEffect(() => {
    // Reset player if init
    if (playerRef.current.y === 0) {
        playerRef.current.y = DESIGN_HEIGHT - 100; 
        playerRef.current.isGrounded = false;
        playerRef.current.vy = 0;
        playerRef.current.jumpCount = 0;
    }
  }, []);

  // Preload Sprites
  useEffect(() => {
    const uniqueKeys = Array.from(new Set(ORB_DATA.map(o => o.spriteKey)));
    uniqueKeys.forEach(key => {
        const img = new Image();
        img.src = `/sprites/${key}.png`;
        spritesRef.current[key] = img;
    });
  }, []);

  // --- Sound ---
  const playSound = (type: 'jump' | 'collect' | 'error' | 'win' | 'lore') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'lore') {
      // Mystical chord
      const freqs = [330, 440, 554]; // A Major
      freqs.forEach(f => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.05, now);
          g.gain.linearRampToValueAtTime(0, now + 1.0);
          o.start(now);
          o.stop(now + 1.0);
      });
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  };

  // Reusable Jump Logic
  const executeJump = () => {
    const p = playerRef.current;
    // Allow jump if grounded OR within coyote time
    if (p.isGrounded || p.coyoteTimer > 0) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.jumpCount = 1;
      p.coyoteTimer = 0; // Consume coyote time immediately
      playSound('jump');
    } else if (p.jumpCount < 2) {
      // Double Jump
      p.vy = JUMP_FORCE; // Reset vertical velocity for snappy response
      p.jumpCount++;
      playSound('jump');
    }
  };

  // Input Listeners (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      // Handle Jump (Single press)
      if (e.code === 'Space' && !e.repeat) {
        executeJump();
      }
      keysRef.current[e.code] = true; 
    };

    const handleKeyUp = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = false; 
      
      // Variable Jump Height: Cut velocity if key released early
      if (e.code === 'Space' && playerRef.current.vy < 0) {
        playerRef.current.vy *= 0.5;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- DRAWING HELPERS ---

  // Procedural Stone Texture Generator
  const drawStoneBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    isRough: boolean
  ) => {
    // 1. Base Fill
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    ctx.save();
    // Clip to ensure pattern stays inside
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // 2. Brick Pattern
    const brickH = 20;
    const brickW = 40;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Subtle Mortar
    ctx.lineWidth = 1;

    // Iterate rows
    const startRow = Math.floor(y / brickH);
    const endRow = Math.floor((y + h) / brickH) + 1;

    for (let row = startRow; row < endRow; row++) {
        const rowY = row * brickH;
        
        // Horizontal Line (Mortar)
        ctx.beginPath();
        ctx.moveTo(x, rowY);
        ctx.lineTo(x + w, rowY);
        ctx.stroke();

        // Vertical Lines (Bricks)
        // Offset logic
        let offset = 0;
        if (isRough) {
            // Deterministic chaos based on row index for Rough Ashlar
            offset = Math.abs(Math.sin(row * 432.1)) * brickW; 
        } else {
            // Perfect running bond for Perfect Ashlar
            offset = (row % 2 === 0) ? 0 : (brickW / 2);
        }

        const startCol = Math.floor((x - offset) / brickW);
        const endCol = Math.floor((x + w - offset) / brickW) + 1;

        for (let col = startCol; col < endCol; col++) {
            let brickX = col * brickW + offset;
            
            // Jitter brick position for rough look
            if (isRough) {
                brickX += Math.sin(row * col * 12.3) * 5;
            }

            if (brickX > x && brickX < x + w) {
                ctx.beginPath();
                ctx.moveTo(brickX, rowY);
                ctx.lineTo(brickX, rowY + brickH);
                ctx.stroke();
            }
        }
    }

    // 3. Noise / Texture Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    // Simple noise pattern (prime steps to avoid repeating)
    for (let nx = x; nx < x + w; nx += 13) {
        for (let ny = y; ny < y + h; ny += 17) {
            if (Math.sin(nx * ny) > 0.5) {
                ctx.fillRect(nx, ny, 2, 2);
            }
        }
    }

    ctx.restore(); // Remove clip

    // 4. 3D Bevel (Highlight & Shadow)
    const bevelSize = 4;
    
    // Top & Left (Highlight)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; 
    ctx.lineWidth = bevelSize;
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Bottom & Right (Shadow)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = bevelSize;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    ctx.stroke();
  };

  const drawPlayerSprite = (ctx: CanvasRenderingContext2D, p: Player) => {
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(p.facing, 1); 

    // 1. Head
    ctx.fillStyle = '#fca5a5'; 
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Body
    ctx.fillStyle = '#1e293b'; 
    ctx.fillRect(-7, -10, 14, 20);

    // 3. Legs
    ctx.fillStyle = '#0f172a'; 
    ctx.fillRect(-6, 10, 5, 12); 
    ctx.fillRect(1, 10, 5, 12);  

    // 4. Arms
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-9, -8, 3, 14); 
    ctx.fillRect(6, -8, 3, 14);  

    // 5. Apron
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-6, -2);  
    ctx.lineTo(6, -2);   
    ctx.lineTo(7, 8);    
    ctx.lineTo(-7, 8);   
    ctx.closePath();
    ctx.fill();

    // Apron Flap
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6, -2);
    ctx.lineTo(6, -2);
    ctx.lineTo(0, 4); 
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(3, -17, 1, 0, Math.PI * 2); 
    ctx.fill();

    ctx.restore();
  };

  const drawCastleBackground = (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, width: number, height: number) => {
    const GRID_SIZE = 400; 
    const WALL_COLOR = '#1e293b'; // Slate 800
    const ACCENT_COLOR = '#334155'; // Slate 700

    // Calculate visible grid range
    const startCol = Math.floor(cameraX / GRID_SIZE);
    const endCol = Math.floor((cameraX + width) / GRID_SIZE) + 1;
    
    const startRow = Math.floor(cameraY / GRID_SIZE);
    const endRow = Math.floor((cameraY + height) / GRID_SIZE) + 1;

    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        const x = col * GRID_SIZE;
        const y = row * GRID_SIZE;

        const winW = 140;
        const winH = 220;
        const winX = x + (GRID_SIZE - winW) / 2;
        const winY = y + (GRID_SIZE - winH) / 2;

        // Draw Window Bars (Foreground structure)
        // Note: We DO NOT fill the window background anymore, letting the Sky Gradient show through!
        
        ctx.strokeStyle = '#0f172a'; // Slate 900
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Vertical
        ctx.moveTo(winX + winW/2, winY);
        ctx.lineTo(winX + winW/2, winY + winH);
        // Horizontal
        ctx.moveTo(winX, winY + winH*0.6);
        ctx.lineTo(winX + winW, winY + winH*0.6);
        ctx.stroke();

        // Stone Texture (Pillars & Beams)
        
        // Vertical Pillar (Left of cell)
        ctx.fillStyle = WALL_COLOR;
        ctx.fillRect(x - 20, y, 40, GRID_SIZE);
        
        // Horizontal Beam (Top of cell)
        ctx.fillRect(x, y - 20, GRID_SIZE, 40);

        // Junction Block
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillRect(x - 25, y - 25, 50, 50);
        ctx.strokeRect(x - 25, y - 25, 50, 50);

        // Torch
        if ((col + row) % 2 === 0) {
            ctx.fillStyle = '#451a03'; // Wood
            ctx.fillRect(x - 5, y + 150, 10, 30);
            
            // Flame
            const flicker = Math.random() * 5;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(x, y + 145, 8 + flicker, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y + 145, 4 + flicker/2, 0, Math.PI * 2);
            ctx.fill();
        }
      }
    }
  };

  // --- Main Loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use current dimensions state
    const { w, h } = dimensions;
    
    // Scale-to-Fit Logic
    const scaleRatio = h / DESIGN_HEIGHT;
    
    // Virtual Viewport Dimensions (Logic Space)
    const viewW = w / scaleRatio;
    const viewH = DESIGN_HEIGHT;

    const player = playerRef.current;
    const keys = keysRef.current;
    
    // Ground level in Logical Space
    const groundRefY = DESIGN_HEIGHT - 40;
    
    // Build platforms relative to groundRefY
    const platforms: Platform[] = PLATFORM_DATA.map(p => ({
      x: p.x,
      y: groundRefY + p.yOffset,
      width: p.width,
      height: p.height,
      color: p.color
    }));

    // Build orbs
    const orbs: Orb[] = ORB_DATA.map(o => ({
      ...o,
      x: o.x,
      y: groundRefY + o.yOffset,
      active: !orbsStateRef.current.has(o.id)
    }));

    // --- PHYSICS ---

    // Horizontal Movement
    if (keys['ArrowLeft']) {
      player.vx -= 1; // Acceleration
      player.facing = -1;
    }
    if (keys['ArrowRight']) {
      player.vx += 1; // Acceleration
      player.facing = 1;
    }

    // Clamp speed
    if (player.vx > MOVE_SPEED) player.vx = MOVE_SPEED;
    if (player.vx < -MOVE_SPEED) player.vx = -MOVE_SPEED;

    player.vx *= FRICTION;
    // Snap to 0 if very slow
    if (Math.abs(player.vx) < 0.1) player.vx = 0;
    
    player.x += player.vx;

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Checkpoints Update
    for (const cpX of CHECKPOINTS) {
        if (player.x > cpX && cpX > lastCheckpointRef.current.x) {
            // Update last checkpoint
            lastCheckpointRef.current = { x: cpX + 50, y: groundRefY - 100 };
        }
    }

    // World Boundary Checks
    if (player.x < 0) { player.x = 0; player.vx = 0; }
    if (player.x > WORLD_WIDTH - player.width) { player.x = WORLD_WIDTH - player.width; player.vx = 0; }
    
    // Pit Death (using absolute world coord roughly)
    if (player.y > groundRefY + 600) { 
      // Respawn at Checkpoint
      player.x = lastCheckpointRef.current.x;
      player.y = lastCheckpointRef.current.y;
      player.vx = 0;
      player.vy = 0;
      player.jumpCount = 0;
      player.coyoteTimer = 0;
      playSound('error');
    }

    // Platform Collision
    let wasGrounded = player.isGrounded;
    player.isGrounded = false; // Assume false, prove true

    for (const plat of platforms) {
      // Simple AABB
      if (
        player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y < plat.y + plat.height &&
        player.y + player.height > plat.y
      ) {
        // Determine overlap
        const overlapX = (player.width + plat.width) / 2 - Math.abs((player.x + player.width / 2) - (plat.x + plat.width / 2));
        const overlapY = (player.height + plat.height) / 2 - Math.abs((player.y + player.height / 2) - (plat.y + plat.height / 2));

        if (overlapX < overlapY) {
          // Horizontal collision
          if (player.vx > 0) player.x = plat.x - player.width;
          else player.x = plat.x + plat.width;
          player.vx = 0;
        } else {
          // Vertical collision
          if (player.vy > 0) {
            // Landed on top
            player.y = plat.y - player.height;
            player.isGrounded = true;
            player.vy = 0;
            player.jumpCount = 0; // Reset double jump
          } else {
            // Hit head on bottom
            player.y = plat.y + plat.height;
            player.vy = 0;
          }
        }
      }
    }

    // Coyote Time Logic
    if (player.isGrounded) {
        player.coyoteTimer = 6; // 6 frames ~100ms
    } else {
        if (player.coyoteTimer > 0) {
            player.coyoteTimer--;
        }
    }

    // Goal Collision
    if (player.x + player.width > GOAL_X) {
      setGameState(GameState.VICTORY);
      playSound('win');
      return; 
    }

    // Orb Collision (Working Tools)
    for (const orb of orbs) {
      if (!orb.active) continue;
      const dx = (player.x + player.width / 2) - orb.x;
      const dy = (player.y + player.height / 2) - orb.y;
      // Increased collision radius slightly for tools
      if (Math.sqrt(dx * dx + dy * dy) < orb.radius + player.width / 2 + 10) {
        setActiveOrb(orb);
        setGameState(GameState.LORE); // Go to LORE first
        playSound('lore');
        
        // Stop movement
        playerRef.current.vx = 0;
        keysRef.current = {};
        
        return;
      }
    }

    // --- CAMERA ---
    
    // Target X: Center player horizontally in the VIEW space
    let targetCamX = player.x - viewW / 2 + player.width / 2;
    
    // Target Y: Center player vertically but use velocity to "look ahead"
    const lookAheadY = player.vy * 10; 
    let targetCamY = (player.y - viewH * 0.5) + lookAheadY;

    // Clamp X
    if (targetCamX < 0) targetCamX = 0;
    const maxScrollX = WORLD_WIDTH - viewW;
    if (targetCamX > maxScrollX) targetCamX = maxScrollX;

    // Smooth Camera 
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1; 

    // --- RENDER ---
    
    // Reset any previous state for a clear slate
    ctx.resetTransform(); 
    
    // 1. ATMOSPHERIC BACKGROUND (Vertical Gradient)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#020617'); // Dark Blue/Black (Night Sky)
    bgGradient.addColorStop(1, '#1e293b'); // Slate (Horizon/Cave)
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    
    // Apply Scale to Fit
    ctx.scale(scaleRatio, scaleRatio);
    
    // Apply Camera Translate (In logical coordinates)
    ctx.translate(-Math.floor(cameraRef.current.x), -Math.floor(cameraRef.current.y));

    // Draw Background Layer (Castle)
    // We pass logical width/height (viewW, viewH)
    drawCastleBackground(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH);

    // Draw Platforms (Updated with Procedural Stone)
    platforms.forEach(plat => {
      // Determine roughness based on progression
      // < 4500 is "Starting/Rough", > 4500 approaches "Perfect"
      const isRough = plat.x < 4500;
      drawStoneBlock(ctx, plat.x, plat.y, plat.width, plat.height, plat.color, isRough);
    });

    // Draw Goal (The East)
    ctx.fillStyle = '#fbbf24';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(GOAL_X, groundRefY - 150, 50, 150);
    ctx.beginPath();
    ctx.arc(GOAL_X + 25, groundRefY - 150, 25, Math.PI, 0);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw Orbs (Now Sprites)
    orbs.forEach(orb => {
      if (!orb.active) return;
      
      const img = spritesRef.current[orb.spriteKey];
      const size = 40; // 40px sprite size
      
      if (img && img.complete && img.naturalHeight !== 0) {
          // Draw loaded sprite
          // Draw Glow
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#fbbf24'; // Amber glow for tools
          ctx.drawImage(img, orb.x - size/2, orb.y - size/2, size, size);
          ctx.shadowBlur = 0;
      } else {
          // Fallback: Draw Amber Circle with Letter if image missing
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#f59e0b';
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'black';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(orb.name[0], orb.x, orb.y);
          ctx.closePath();
      }
    });

    // Draw Player Sprite
    drawPlayerSprite(ctx, player);

    ctx.restore();

    // 2. VIGNETTE OVERLAY (Post-Processing)
    // Draw on top of everything in screen coordinates to focus the eye
    ctx.resetTransform();
    const radius = Math.max(w, h) * 0.8;
    const vignette = ctx.createRadialGradient(w/2, h/2, radius * 0.4, w/2, h/2, radius);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); // Transparent center
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)'); // Dark corners
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, dimensions]);

  // Loop Control
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, gameLoop]);

  const resetGame = () => {
    playerRef.current = { 
        x: 50, y: DESIGN_HEIGHT - 100, width: 30, height: 45, 
        vx: 0, vy: 0, 
        isGrounded: false, 
        color: '#ffffff', 
        facing: 1, 
        jumpCount: 0,
        coyoteTimer: 0 
    };
    keysRef.current = {};
    orbsStateRef.current.clear();
    setScore(0);
    lastCheckpointRef.current = { x: 50, y: DESIGN_HEIGHT - 100 }; // Reset checkpoint to start
    cameraRef.current = { x: 0, y: 0 };
    setGameState(GameState.PLAYING);
  };

  // Lore Handler
  const handleLoreContinue = () => {
      if (activeOrb) {
        const question = QUESTIONS.find(q => q.id === activeOrb.questionId);
        if (question) {
            setActiveQuestion(question);
            setGameState(GameState.QUIZ);
        } else {
            // Fallback if no question found, just collect
            handleCorrectAnswer();
        }
      }
  };

  // Quiz Handlers
  const handleCorrectAnswer = () => {
    playSound('collect');
    setScore(s => s + 100);
    if (activeOrb) orbsStateRef.current.add(activeOrb.id);
    setActiveOrb(null);
    setActiveQuestion(null);

    // CRITICAL FIX: Reset keys and velocity so player doesn't auto-run after quiz
    keysRef.current = {};
    playerRef.current.vx = 0;

    setGameState(GameState.PLAYING);
  };

  const handleIncorrectAnswer = () => {
    playSound('error');
    // Hardcore Mode: Reset entire game on wrong answer
    resetGame();
  };

  // Touch Handlers
  const handleTouchStart = (key: string) => (e: React.TouchEvent) => {
    e.preventDefault(); 
    if (key === 'Space') {
      executeJump();
    }
    keysRef.current[key] = true;
  };

  const handleTouchEnd = (key: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    keysRef.current[key] = false;
    // Add variable jump for touch too
    if (key === 'Space' && playerRef.current.vy < 0) {
      playerRef.current.vy *= 0.5;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden no-select">
      
      {/* Rotation Warning */}
      {isPortrait && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Please Rotate Device</h2>
            <p className="text-slate-400">This game is designed for landscape mode.</p>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="px-4 py-2">
          {/* Title removed for clean UI */}
        </div>
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600 backdrop-blur-sm">
          <span className="text-cyan-400 font-mono text-xl">{score}</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        className="block bg-slate-900"
      />

      {/* Touch Controls Overlay */}
      {gameState === GameState.PLAYING && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-4 px-4">
            <div className="flex justify-between items-end w-full select-none mb-2">
                {/* D-Pad (Larger for mobile) */}
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-md border-2 border-white/20 active:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        onTouchStart={handleTouchStart('ArrowLeft')}
                        onTouchEnd={handleTouchEnd('ArrowLeft')}
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-md border-2 border-white/20 active:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        onTouchStart={handleTouchStart('ArrowRight')}
                        onTouchEnd={handleTouchEnd('ArrowRight')}
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                
                {/* Jump (Larger for mobile) */}
                <div className="pointer-events-auto pl-8">
                    <button 
                        className="w-28 h-28 bg-blue-500/20 rounded-full backdrop-blur-md border-2 border-blue-400/40 active:bg-blue-500/40 flex items-center justify-center transition-all active:scale-95 shadow-lg"
                        onTouchStart={handleTouchStart('Space')}
                        onTouchEnd={handleTouchEnd('Space')}
                    >
                        <span className="font-bold text-white tracking-wider text-lg">JUMP</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Lore Modal */}
      {gameState === GameState.LORE && activeOrb && (
        <LoreModal 
          orb={activeOrb}
          onNext={handleLoreContinue}
        />
      )}

      {/* Quiz Modal */}
      {gameState === GameState.QUIZ && activeQuestion && (
        <QuizModal 
          question={activeQuestion}
          onCorrect={handleCorrectAnswer}
          onIncorrect={handleIncorrectAnswer}
        />
      )}

      {/* Victory Screen */}
      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-amber-400 mb-6 animate-bounce">Level 1 Complete</h2>
            <div className="h-1 w-32 bg-amber-600 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-200 text-xl md:text-2xl mb-8 font-light leading-relaxed">
              You have successfully completed the Entered Apprentice stage.
              <br/>
              <span className="font-bold text-white mt-2 block">Proceed to Fellowcraft</span>
            </p>
            <p className="text-blue-300 text-xl mb-8 font-mono">Final Score: {score}</p>
            <button 
              onClick={resetGame}
              className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-xl shadow-amber-900/50"
            >
              Restart Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;