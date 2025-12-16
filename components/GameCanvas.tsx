import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Orb, Platform, Question, LeaderboardEntry } from '../types';
import { 
  GRAVITY, FRICTION, MOVE_SPEED, JUMP_FORCE, 
  WORLD_WIDTH, PLATFORM_DATA, ORB_DATA, GOAL_X, QUESTIONS,
  DESIGN_HEIGHT, CHECKPOINTS
} from '../constants';
import QuizModal from './QuizModal';
import LoreModal from './LoreModal';
import { generateSpriteUrl } from '../utils/assetGenerator';
import { fetchLeaderboard, submitScore } from '../api/leaderboard';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dimensions state - Initialize safely for SSR/Window to prevent 0x0
  const [dimensions, setDimensions] = useState({ 
    w: typeof window !== 'undefined' ? (window.innerWidth || 800) : 800, 
    h: typeof window !== 'undefined' ? (window.innerHeight || 600) : 600 
  });
  
  const [isPortrait, setIsPortrait] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false); // User override for preview/desktop
  
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [score, setScore] = useState(0);
  const [activeOrb, setActiveOrb] = useState<Orb | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [checkpointPopup, setCheckpointPopup] = useState(false);
  
  // Player Identity & Leaderboard
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Level Completion Warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);

  // Player Progression State
  const [hasApron, setHasApron] = useState(false);
  const [isRestored, setIsRestored] = useState(false); // Track if Master has restored comforts
  
  // JW Interaction State (0: Start, 1: Q801 done, 2: Q802 done, 3: Completed)
  const [jwProgress, setJwProgress] = useState(0);

  // Standalone Mode State
  const [isStandalone, setIsStandalone] = useState(false);

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
  
  // Lore State Logic: Track which lore types (sprite keys) have been seen in this run
  const seenLoreRef = useRef<Set<string>>(new Set());

  // Checkpoint State
  const lastCheckpointRef = useRef({ x: 50, y: DESIGN_HEIGHT - 100 });
  const checkpointTimeoutRef = useRef<number | null>(null);
  
  // Camera now tracks X and Y
  const cameraRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Asset Loading
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});

  // Fullscreen tracking
  const hasTriedFullscreenRef = useRef(false);

  // Load Leaderboard on mount
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      const data = await fetchLeaderboard();
      setLeaderboard(data);
      setIsLoadingLeaderboard(false);
    };
    loadLeaderboard();
  }, []);

  // Updated to use Supabase API
  const saveScoreToLeaderboard = async (finalScore: number, completed: boolean) => {
    const name = playerName.trim() || 'Anonymous';
    
    // Submit to Supabase
    await submitScore(name, finalScore, completed);
    
    // Refresh local leaderboard display
    setIsLoadingLeaderboard(true);
    const updatedData = await fetchLeaderboard();
    setLeaderboard(updatedData);
    setIsLoadingLeaderboard(false);
  };

  // --- Initialization & Resize ---
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Safety check for 0 dimensions to prevent blank screen
      if (w > 0 && h > 0) {
        setDimensions({ w, h });
        // Only trigger portrait mode on narrow screens (phones)
        // This allows desktop windows to be narrow without blocking gameplay
        const isNarrow = w < 768; 
        setIsPortrait(isNarrow && h > w);
      }
    };
    
    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Standalone Mode Detection ---
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };
    checkStandalone();
  }, []);

 
  // Preload Sprites
  useEffect(() => {
    const uniqueKeys = Array.from(new Set(ORB_DATA.map(o => o.spriteKey)));
    
    // We explicitly include 'square_compass', 'worshipful_master', and 'junior_warden'
    const assetsToLoad = [
        ...uniqueKeys,
        'square_compass', 
        'worshipful_master',
        'junior_warden',
        'pillar_ionic', 
        'pillar_doric', 
        'pillar_corinthian'
    ];

    assetsToLoad.forEach(key => {
        const img = new Image();
        img.src = generateSpriteUrl(key);
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
    
    // Resume if suspended (PC/Browser requirement)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

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

  // Helper to trigger fullscreen with vendor prefixes
  const enterFullscreen = () => {
    if (hasTriedFullscreenRef.current) return;
    hasTriedFullscreenRef.current = true;

    try {
      const docEl = document.documentElement as any;
      const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (request) {
        request.call(docEl).catch(() => {});
      }
    } catch (e) { }
  };

  // Toggle Function with comprehensive prefix support
  const toggleFullscreen = () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;
      
      const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      
      if (!isFullscreen) {
        const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (request) {
            request.call(docEl).catch((e: any) => console.log("Fullscreen request failed", e));
        }
      } else {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) exit.call(doc).catch((e: any) => console.log("Fullscreen exit failed", e));
      }
    } catch (e) {
      console.log('Fullscreen API error', e);
    }
  };

  // Reusable Jump Logic
  const executeJump = () => {
    const p = playerRef.current;
    if (p.isGrounded || p.coyoteTimer > 0) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.jumpCount = 1;
      p.coyoteTimer = 0; 
      playSound('jump');
    } else if (p.jumpCount < 2) {
      p.vy = JUMP_FORCE;
      p.jumpCount++;
      playSound('jump');
    }
  };

  // Input Listeners (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.code === 'Space' && !e.repeat) executeJump();
      keysRef.current[e.code] = true; 
    };

    const handleKeyUp = (e: KeyboardEvent) => { 
      keysRef.current[e.code] = false; 
      if (e.code === 'Space' && playerRef.current.vy < 0) playerRef.current.vy *= 0.5;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Input Handler for both Touch and Mouse
  const handleInputStart = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    enterFullscreen();
    if (key === 'Space') executeJump();
    keysRef.current[key] = true;
  };

  const handleInputEnd = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    keysRef.current[key] = false;
    if (key === 'Space' && playerRef.current.vy < 0) playerRef.current.vy *= 0.5;
  };

  // --- DRAWING HELPERS ---
  // (Helpers omitted for brevity, they remain unchanged)
  const drawStoneBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = '#cbd5e1'; 
    ctx.fillRect(x, y, w, h);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for(let i=0; i<w; i+=15) {
        ctx.beginPath(); ctx.moveTo(x + i, y); ctx.lineTo(x + i - 20, y + h); ctx.stroke();
    }
    ctx.restore();

    const TILE_SIZE = 15;
    const cols = Math.ceil(w / TILE_SIZE);
    
    for(let c=0; c<cols; c++) {
        const tx = x + c * TILE_SIZE;
        const tw = Math.min(TILE_SIZE, x + w - tx);
        ctx.fillStyle = (c % 2 === 0) ? '#1e293b' : '#f8fafc'; 
        ctx.fillRect(tx, y, tw, TILE_SIZE);
    }
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  };

  const drawPlayerSprite = (ctx: CanvasRenderingContext2D, p: Player, showApron: boolean, isRestored: boolean) => {
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(p.facing, 1); 

    // ANIMATION LOGIC
    // Calculate leg swing based on time
    const walkSpeed = 150; // ms per cycle
    const isMoving = Math.abs(p.vx) > 0.1;
    const walkCycle = Date.now() / walkSpeed;
    
    // Leg Offsets (in pixels)
    let leftLegOffset = 0;
    let rightLegOffset = 0;

    if (!p.isGrounded) {
        // Jump Pose: Splay legs slightly
        leftLegOffset = -4; // Back leg kick
        rightLegOffset = 5;  // Front leg reach
    } else if (isMoving) {
        // Walk Cycle: Oscillate
        leftLegOffset = Math.sin(walkCycle) * 4;
        rightLegOffset = Math.sin(walkCycle + Math.PI) * 4;
    }

    // Head (Flesh tone)
    ctx.fillStyle = '#fca5a5'; 
    ctx.beginPath(); ctx.arc(0, -16, 7, 0, Math.PI * 2); ctx.fill();

    // Hair (Dark Suit Color) - Fuller, completely covering top
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(7, -20); 
    ctx.bezierCurveTo(4, -27, -9, -27, -10, -20);
    ctx.lineTo(-10, -9); 
    ctx.lineTo(-3, -9);
    ctx.lineTo(-3, -14);
    ctx.lineTo(7, -20);
    ctx.fill();

    if (!isRestored) {
        // --- CANDIDATE STATE ---
        // Blindfold (White cloth across eyes)
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(2, -19, 6, 5); 
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 0.5; ctx.strokeRect(2, -19, 6, 5);
        // Tie goes around back
        ctx.beginPath(); ctx.moveTo(2, -17); ctx.lineTo(-7, -17); ctx.stroke();

        // Cable Tow (Rope around neck)
        ctx.strokeStyle = '#d97706'; // Rope color
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Loop around neck
        ctx.moveTo(3, -9); 
        ctx.bezierCurveTo(3, -5, -3, -5, -3, -9);
        // Trailing end (hanging down back or chest)
        ctx.moveTo(0, -5); ctx.lineTo(-2, 5);
        ctx.stroke();

        // Suit Body (Dark Navy)
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(-7, -10, 14, 20);

        // Right Breast Bare (Flesh patch on chest)
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(0, -8, 6, 6); 

        // Left Arm Bare (Flesh color) - Background Arm
        ctx.fillStyle = '#fca5a5'; 
        ctx.fillRect(-9 + (isMoving ? leftLegOffset * 0.5 : 0), -8, 3, 14); // Slight arm swing
        
        // Clothed Right Arm (Front)
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(6 + (isMoving ? rightLegOffset * 0.5 : 0), -8, 3, 14);  

        // Hands
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-9 + (isMoving ? leftLegOffset * 0.5 : 0), 6, 3, 3); 
        ctx.fillRect(6 + (isMoving ? rightLegOffset * 0.5 : 0), 6, 3, 3);

        // Legs (Trousers) - Animated
        // Left Leg (Back)
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(-6 + leftLegOffset, 10, 5, 12); 
        // Left Knee Bare (Flesh patch on Left/Back leg)
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-6 + leftLegOffset, 14, 5, 4);

        // Right Leg (Front)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(1 + rightLegOffset, 10, 5, 12);  

        // Shoes
        // Left Foot (Back): Slipshod (Heel exposed)
        ctx.fillStyle = '#000000'; 
        ctx.fillRect(-6 + leftLegOffset, 22, 4, 3); // Toe only
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-2 + leftLegOffset, 22, 3, 3); // Heel bare

        // Right Foot (Front): Shoe on
        ctx.fillStyle = '#000000';
        ctx.fillRect(1 + rightLegOffset, 22, 7, 3);

    } else {
        // --- RESTORED (Original) STATE ---
        // Eye
        ctx.fillStyle = '#000000';
        ctx.fillRect(4, -17, 2, 2); 

        // Suit Body
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(-7, -10, 14, 20);

        // White Shirt
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-4, -10); ctx.lineTo(4, -10); ctx.lineTo(0, 0); 
        ctx.fill();

        // Black Tie
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-1, -10); ctx.lineTo(1, -10); ctx.lineTo(0.5, -2); ctx.lineTo(-0.5, -2);
        ctx.fill();

        // Legs - Animated
        ctx.fillStyle = '#0f172a'; 
        ctx.fillRect(-6 + leftLegOffset, 10, 5, 12); // Left Leg
        ctx.fillRect(1 + rightLegOffset, 10, 5, 12); // Right Leg

        // Shoes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6 + leftLegOffset, 22, 7, 3); 
        ctx.fillRect(1 + rightLegOffset, 22, 7, 3);

        // Arms - Animated slightly inverse to legs
        ctx.fillStyle = '#0f172a'; 
        // Arm swing is usually opposite to leg. Left leg forward -> Left arm back.
        // We used leg offsets for simplicity before, let's just use opposite phase
        const leftArmSwing = isMoving ? Math.sin(walkCycle + Math.PI) * 3 : 0;
        const rightArmSwing = isMoving ? Math.sin(walkCycle) * 3 : 0;
        
        ctx.fillRect(-9 + leftArmSwing, -8, 3, 14); 
        ctx.fillRect(6 + rightArmSwing, -8, 3, 14);  

        // Hands
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-9 + leftArmSwing, 6, 3, 3); 
        ctx.fillRect(6 + rightArmSwing, 6, 3, 3);
    }

    // Apron Overlay (If equipped)
    if (showApron && isRestored) {
        // Waist Band
        ctx.fillStyle = '#f8fafc'; // White Leather
        ctx.strokeStyle = '#cbd5e1'; // Subtle border
        ctx.lineWidth = 1;

        // Main Square (Skirt)
        ctx.fillRect(-7, 0, 14, 10);
        ctx.strokeRect(-7, 0, 14, 10);

        // Flap (Triangle DOWN for NZ Style)
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.lineTo(0, 5); // Points Down
        ctx.closePath();
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
  };

  const drawMaster = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    
    // Suit Body (Black/Dark Navy)
    ctx.fillStyle = '#0f172a'; 
    ctx.fillRect(-9, -25, 18, 25);

    // --- LOUNGE SUIT DETAILS (Shirt & Tie) ---
    // White Shirt (Triangle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -25); // Top Left Collar
    ctx.lineTo(4, -25);  // Top Right Collar
    ctx.lineTo(0, -15);  // Bottom V
    ctx.fill();
    
    // Black Tie
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, -24); // Knot top
    ctx.lineTo(-1, -15); // Left side
    ctx.lineTo(0, -12); // Bottom tip
    ctx.lineTo(1, -15); // Right side
    ctx.fill();
    // ----------------------------------------
    
    // Head (Flesh)
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.arc(0, -34, 8, 0, Math.PI*2); ctx.fill();
    
    // Facial Features (Eyes)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, -35, 2, 2); // Left Eye
    ctx.fillRect(1, -35, 2, 2);  // Right Eye

    // Hair (White/Grey Balding)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    // Sideburns/Back
    ctx.moveTo(-8, -36); ctx.lineTo(-9, -30); ctx.lineTo(-9, -28); // Left side
    ctx.moveTo(8, -36); ctx.lineTo(9, -30); ctx.lineTo(9, -28); // Right side
    ctx.fill();
    // Specifically draw hair tufts on side
    ctx.fillRect(-9, -36, 2, 6);
    ctx.fillRect(7, -36, 2, 6);

    // Master's Apron (NZ Style: Light Blue Border, Silver Tassels/Taus)
    // Waistband
    ctx.fillStyle = '#38bdf8'; // Light Blue
    ctx.fillRect(-8, -15, 16, 2); 
    // Apron Body (White)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, -13, 16, 10);
    // Borders (Light Blue)
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.strokeRect(-8, -13, 16, 10);
    
    // Taus (Inverted T: ⊥) for Installed Master (Moved UP to avoid border overlap)
    ctx.fillStyle = '#38bdf8'; 
    // Left Tau (⊥) - Shifted up by 2px (y: -6 bottom bar, -9 top stem)
    ctx.fillRect(-7, -6, 3, 1); // Bottom bar
    ctx.fillRect(-6, -9, 1, 3); // Stem going up
    // Right Tau (⊥)
    ctx.fillRect(4, -6, 3, 1); // Bottom bar
    ctx.fillRect(5, -9, 1, 3); // Stem going up
    
    // Collar (V-Shape, Light Blue)
    ctx.strokeStyle = '#38bdf8'; // Sky Blue
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(0, -15); ctx.lineTo(9, -25); ctx.stroke();
    
    // Jewel (Square, Chevron UP ^)
    ctx.strokeStyle = '#cbd5e1'; // Silver
    ctx.lineWidth = 2;
    // Draw ^ shape at bottom of collar
    ctx.beginPath(); ctx.moveTo(-3, -11); ctx.lineTo(0, -15); ctx.lineTo(3, -11); ctx.stroke();

    // Gauntlets (Cuffs) - Light Blue
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-11, -18, 2, 6); // Left Arm cuff (visible side)
    ctx.fillRect(9, -18, 2, 6);   // Right Arm cuff

    ctx.restore();
  };

  const drawJuniorWarden = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Suit Body (Dark)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-9, -25, 18, 25);

    // --- LOUNGE SUIT DETAILS (Shirt & Tie) ---
    // White Shirt (Triangle)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -25); // Top Left Collar
    ctx.lineTo(4, -25);  // Top Right Collar
    ctx.lineTo(0, -15);  // Bottom V
    ctx.fill();
    
    // Black Tie
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(0, -24); // Knot top
    ctx.lineTo(-1, -15); // Left side
    ctx.lineTo(0, -12); // Bottom tip
    ctx.lineTo(1, -15); // Right side
    ctx.fill();
    // ----------------------------------------

    // Head (Flesh)
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.arc(0, -34, 8, 0, Math.PI*2); ctx.fill();

    // Facial Features (Eyes)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, -35, 2, 2); // Left Eye
    ctx.fillRect(1, -35, 2, 2);  // Right Eye

    // Hair (Dark Brown - Natural, no headband)
    ctx.fillStyle = '#78350f';
    // Draw hair cap/top
    ctx.beginPath();
    ctx.arc(0, -34, 8, Math.PI, 0); // Top half of head
    ctx.lineTo(8, -32); // Sideburn right
    ctx.lineTo(6, -32); // Sideburn inner
    ctx.lineTo(-6, -32); // Sideburn inner
    ctx.lineTo(-8, -32); // Sideburn left
    ctx.fill();

    // Master Mason Apron (3 Rosettes)
    // Waistband
    ctx.fillStyle = '#38bdf8'; // Light Blue
    ctx.fillRect(-8, -15, 16, 2);
    // Body
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, -13, 16, 10);
    // Border
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.strokeRect(-8, -13, 16, 10);
    // Rosettes
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(-5, -6, 1.5, 0, Math.PI*2); ctx.fill(); // Left
    ctx.beginPath(); ctx.arc(5, -6, 1.5, 0, Math.PI*2); ctx.fill();  // Right
    ctx.beginPath(); ctx.arc(0, -14, 1.5, 0, Math.PI*2); ctx.fill(); // Flap (Approx)

    // Collar (Light Blue)
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-9, -25); ctx.lineTo(0, -15); ctx.lineTo(9, -25); ctx.stroke();

    // Jewel (Plumb Rule)
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(0, -8); ctx.stroke(); // Vertical Line
    ctx.beginPath(); ctx.arc(0, -8, 1, 0, Math.PI*2); ctx.stroke(); // Bob

    // Gauntlets
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-11, -18, 2, 6);
    ctx.fillRect(9, -18, 2, 6);

    ctx.restore();
  };

  const drawTempleBackground = (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, width: number, height: number) => {
    ctx.save();
    
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(cameraX, cameraY, width, height);

    const STAR_CELL = 200;
    const startX = Math.floor(cameraX / STAR_CELL) * STAR_CELL;
    const endX = startX + width + STAR_CELL;
    const startY = Math.floor(cameraY / STAR_CELL) * STAR_CELL;
    const endY = startY + height + STAR_CELL;

    for (let x = startX; x < endX; x += STAR_CELL) {
        for (let y = startY; y < endY; y += STAR_CELL) {
            const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            const val = n - Math.floor(n); 
            if (val > 0.7) { 
                const starX = x + (val * 100) % 150; 
                const starY = y + ((val * 1000) % 150);
                const size = val * 1.5;
                const alpha = 0.3 + 0.7 * Math.abs(Math.sin(Date.now() / 1500 + val * 10));
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath(); ctx.arc(starX, starY, size, 0, Math.PI * 2); ctx.fill();
            }
        }
    }

    const PILLAR_GAP = 400;
    const pStart = Math.floor(cameraX / PILLAR_GAP);
    const pEnd = Math.floor((cameraX + width) / PILLAR_GAP) + 1;

    for (let i = pStart; i <= pEnd; i++) {
        const px = i * PILLAR_GAP;
        
        let pillarKey = '';
        if (px < 2000) pillarKey = 'pillar_ionic';
        else if (px < 5000) pillarKey = 'pillar_doric';
        else pillarKey = 'pillar_corinthian';

        const img = spritesRef.current[pillarKey];
        if (img) {
            const pWidth = 60;
            const pX = px - pWidth/2;
            ctx.globalAlpha = 0.8;
            ctx.drawImage(img, pX, -200, pWidth, DESIGN_HEIGHT + 400);
            ctx.globalAlpha = 1.0;
        }
    }

    if (cameraY < 100) { 
        const cY = 0;
        const cH = 60;
        
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cameraX, cY, width, cH);
        
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cameraX, cY + 10); ctx.lineTo(cameraX + width, cY + 10);
        ctx.moveTo(cameraX, cY + 50); ctx.lineTo(cameraX + width, cY + 50);
        ctx.stroke();
        
        ctx.fillStyle = '#475569';
        const dentilSize = 20;
        const dStart = Math.floor(cameraX / dentilSize);
        const dEnd = Math.floor((cameraX + width) / dentilSize) + 1;
        for(let i=dStart; i<=dEnd; i++) {
            if (i%2 === 0) ctx.fillRect(i*dentilSize, cY + 30, dentilSize, 10);
        }
    }

    ctx.restore();
  };

  // --- Main Loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    // Safety Try-Catch for Render Loop
    try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = false;

        const { w, h } = dimensions;
        // Safety for zero dimensions
        if (w === 0 || h === 0) return;

        const scaleRatio = h / DESIGN_HEIGHT;
        const viewW = w / scaleRatio;
        const viewH = DESIGN_HEIGHT;

        const player = playerRef.current;
        const keys = keysRef.current;
        
        const groundRefY = DESIGN_HEIGHT - 40;
        
        const platforms: Platform[] = PLATFORM_DATA.map(p => ({
        x: p.x,
        y: groundRefY + p.yOffset,
        width: p.width,
        height: p.height,
        color: p.color
        }));

        const orbs: Orb[] = ORB_DATA.map(o => ({
        ...o,
        x: o.x,
        y: groundRefY + o.yOffset,
        active: !orbsStateRef.current.has(o.id)
        }));

        // --- PHYSICS ---
        if (keys['ArrowLeft']) { player.vx -= 1; player.facing = -1; }
        if (keys['ArrowRight']) { player.vx += 1; player.facing = 1; }

        // MOVEMENT LIMIT FOR BLINDFOLDED CANDIDATE
        const currentSpeedLimit = isRestored ? MOVE_SPEED : 1.5; // Slow crawl if not restored

        if (player.vx > currentSpeedLimit) player.vx = currentSpeedLimit;
        if (player.vx < -currentSpeedLimit) player.vx = -currentSpeedLimit;
        
        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
        player.x += player.vx;
        player.vy += GRAVITY;
        player.y += player.vy;

        // --- NPC INTERACTIONS ---

        // 1. WORSHIPFUL MASTER INTERACTION
        const masterX = 250; 
        const masterY = groundRefY; // On the ground
        if (!isRestored) {
            const distToMaster = Math.abs((player.x + player.width/2) - masterX);
            if (distToMaster < 50 && Math.abs((player.y + player.height) - masterY) < 50) {
                // Trigger Interaction
                player.vx = 0;
                keysRef.current = {}; // Stop movement
                
                // Use Lore logic to show Master Dialogue
                const masterOrbMock: Orb = {
                    id: 999,
                    x: 0, y: 0, radius: 0, active: true,
                    name: "Worshipful Master",
                    spriteKey: "worshipful_master",
                    blurb: "Congratulation on your Initiation. I now remove your blindfold and cable-tow, and restore you to your personal comforts. Seek the hidden knowledge within this level to prove your proficiency."
                };
                setActiveOrb(masterOrbMock);
                setGameState(GameState.LORE);
                playSound('lore');
            }
        }

        // 2. JUNIOR WARDEN INTERACTION (Replaces Orb 8)
        const jwX = 2700;
        // Fix: Place JW on the platform at yOffset -100.
        // Platform top is groundRefY - 100. Sprite draws upwards from origin.
        const jwY = groundRefY - 100; 
        
        // Track interaction based on progress state
        if (jwProgress < 3) {
            const distToJW = Math.abs((player.x + player.width/2) - jwX);
            const heightDiff = Math.abs((player.y + player.height) - jwY); // Check feet relative to platform

            if (distToJW < 40 && heightDiff < 50) {
                 player.vx = 0;
                 keysRef.current = {};

                 const jwOrbMock: Orb = {
                    id: 998,
                    x: 0, y: 0, radius: 0, active: true,
                    name: "Junior Warden",
                    spriteKey: "junior_warden",
                    blurb: "Brother, before you proceed further, I must ask you a few questions regarding your entrance into the Lodge."
                 };
                 setActiveOrb(jwOrbMock);
                 setGameState(GameState.LORE);
                 playSound('lore');
            }
        }

        for (const cp of CHECKPOINTS) {
            if (player.x > cp.x && cp.x > lastCheckpointRef.current.x) {
                lastCheckpointRef.current = { x: cp.x, y: groundRefY + cp.yOffset - 100 };
                setCheckpointPopup(true);
                playSound('lore');
                
                if (checkpointTimeoutRef.current) window.clearTimeout(checkpointTimeoutRef.current);
                checkpointTimeoutRef.current = window.setTimeout(() => {
                    setCheckpointPopup(false);
                }, 3000);
            }
        }

        if (player.x < 0) { player.x = 0; player.vx = 0; }
        if (player.x > WORLD_WIDTH - player.width) { player.x = WORLD_WIDTH - player.width; player.vx = 0; }
        
        if (player.y > groundRefY + 600) { 
        player.x = lastCheckpointRef.current.x;
        player.y = lastCheckpointRef.current.y;
        player.vx = 0; player.vy = 0; player.jumpCount = 0; player.coyoteTimer = 0;
        playSound('error');
        }

        player.isGrounded = false;
        for (const plat of platforms) {
        if (
            player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y < plat.y + plat.height &&
            player.y + player.height > plat.y
        ) {
            const overlapX = (player.width + plat.width) / 2 - Math.abs((player.x + player.width / 2) - (plat.x + plat.width / 2));
            const overlapY = (player.height + plat.height) / 2 - Math.abs((player.y + player.height / 2) - (plat.y + plat.height / 2));

            if (overlapX < overlapY) {
            if (player.vx > 0) player.x = plat.x - player.width;
            else player.x = plat.x + plat.width;
            player.vx = 0;
            } else {
            if (player.vy > 0) {
                player.y = plat.y - player.height;
                player.isGrounded = true;
                player.vy = 0;
                player.jumpCount = 0; 
            } else {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
            }
        }
        }

        if (player.isGrounded) player.coyoteTimer = 6;
        else if (player.coyoteTimer > 0) player.coyoteTimer--;

        if (player.x + player.width > GOAL_X) {
        const maxScore = ORB_DATA.length * 100;
        if (score >= maxScore) {
            setGameState(GameState.VICTORY);
            saveScoreToLeaderboard(score + 500, true); 
            playSound('win');
            return; 
        } else {
            player.x = GOAL_X - player.width - 5;
            player.vx = 0;
            if (!warningMessage) {
                const missing = maxScore - score;
                setWarningMessage(`Access Denied. Need ${missing} more points.`);
                playSound('error');
                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                warningTimeoutRef.current = window.setTimeout(() => setWarningMessage(null), 3000);
            }
        }
        }

        for (const orb of orbs) {
        if (!orb.active) continue;
        const dx = (player.x + player.width / 2) - orb.x;
        const dy = (player.y + player.height / 2) - orb.y;
        if (Math.sqrt(dx * dx + dy * dy) < orb.radius + player.width / 2 + 10) {
            setActiveOrb(orb);
            playerRef.current.vx = 0;
            keysRef.current = {};
            if (seenLoreRef.current.has(orb.spriteKey)) {
                if (orb.questionId !== undefined) {
                    const question = QUESTIONS.find(q => q.id === orb.questionId);
                    if (question) {
                        setActiveQuestion(question);
                        setGameState(GameState.QUIZ);
                        playSound('lore'); 
                    } else handleCorrectAnswer(); 
                } else handleCorrectAnswer();
            } else {
                seenLoreRef.current.add(orb.spriteKey);
                setGameState(GameState.LORE); 
                playSound('lore');
            }
            return;
        }
        }

        let targetCamX = player.x - viewW / 2 + player.width / 2;
        const lookAheadY = player.vy * 10; 
        let targetCamY = (player.y - viewH * 0.5) + lookAheadY;
        if (targetCamX < 0) targetCamX = 0;
        const maxScrollX = WORLD_WIDTH - viewW;
        if (targetCamX > maxScrollX) targetCamX = maxScrollX;
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1; 

        ctx.resetTransform(); 
        ctx.clearRect(0,0,w,h);
        ctx.save();
        ctx.scale(scaleRatio, scaleRatio);
        ctx.translate(-Math.floor(cameraRef.current.x), -Math.floor(cameraRef.current.y));

        drawTempleBackground(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH);

        // Draw Master of the Lodge
        drawMaster(ctx, masterX, masterY);

        // Draw Junior Warden
        drawJuniorWarden(ctx, jwX, jwY);

        CHECKPOINTS.forEach(cp => {
            // Load Square and Compass (generated as 'square_compass')
            const cpImg = spritesRef.current['square_compass'];
            const isPassed = lastCheckpointRef.current.x >= cp.x;
            const cpX = cp.x;
            const cpY = groundRefY + cp.yOffset - 50; 
            
            if (cpImg && cpImg.complete && cpImg.naturalWidth > 0) {
                ctx.save();
                ctx.globalAlpha = isPassed ? 1.0 : 0.3; 
                if (isPassed) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#fbbf24';
                }
                ctx.drawImage(cpImg, cpX - 20, cpY, 40, 40);
                ctx.restore();
            } else {
                ctx.fillStyle = isPassed ? '#fbbf24' : '#475569';
                ctx.beginPath(); ctx.arc(cpX, cpY + 20, 10, 0, Math.PI * 2); ctx.fill();
            }
        });

        platforms.forEach(plat => {
        drawStoneBlock(ctx, plat.x, plat.y, plat.width, plat.height, plat.color);
        });

        const isGoalUnlocked = score >= ORB_DATA.length * 100;
        ctx.fillStyle = isGoalUnlocked ? '#fbbf24' : '#ef4444'; 
        ctx.globalAlpha = 0.8;
        ctx.fillRect(GOAL_X, groundRefY - 150, 50, 150);
        ctx.beginPath(); ctx.arc(GOAL_X + 25, groundRefY - 150, 25, Math.PI, 0); ctx.fill();
        ctx.globalAlpha = 1.0;

        orbs.forEach(orb => {
        if (!orb.active) return;
        const img = spritesRef.current[orb.spriteKey];
        const size = 40; 
        
        if (img && img.complete && img.naturalHeight !== 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24'; 
            ctx.drawImage(img, orb.x - size/2, orb.y - size/2, size, size);
            ctx.shadowBlur = 0;
        } else {
            ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b'; ctx.fill();
            ctx.fillStyle = 'black'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(orb.name[0], orb.x, orb.y);
        }
        });

        drawPlayerSprite(ctx, player, hasApron, isRestored);
        ctx.restore();

        ctx.resetTransform();
        
        // --- VISUAL EFFECTS ---
        if (!isRestored) {
            // BLINDFOLD EFFECT (Hoodwink)
            // Simulates limited vision through a blindfold
            const pCenterX = (player.x + player.width/2 - cameraRef.current.x) * scaleRatio;
            const pCenterY = (player.y + player.height/2 - cameraRef.current.y) * scaleRatio;
            
            // Create a radial gradient centered on player
            // Inner radius: somewhat visible
            // Outer radius: pitch black
            const visionRadius = Math.max(w, h) * 0.4; // How far they can see
            const blindfold = ctx.createRadialGradient(pCenterX, pCenterY, 20 * scaleRatio, pCenterX, pCenterY, 300 * scaleRatio);
            
            blindfold.addColorStop(0, 'rgba(0, 0, 0, 0.3)'); // Center (Player visible but dim)
            blindfold.addColorStop(0.3, 'rgba(0, 0, 0, 0.8)'); // Mid-range drops off
            blindfold.addColorStop(1, 'rgba(0, 0, 0, 0.98)'); // Periphery is very dark
            
            ctx.fillStyle = blindfold;
            ctx.fillRect(0, 0, w, h);
        } else {
            // NORMAL VIGNETTE
            const radius = Math.max(w, h) * 0.8;
            const vignette = ctx.createRadialGradient(w/2, h/2, radius * 0.4, w/2, h/2, radius);
            vignette.addColorStop(0, 'rgba(0,0,0,0)'); 
            vignette.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, w, h);
        }

    } catch (e) {
        console.error("Game Loop Error:", e);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, dimensions, hasApron, warningMessage, score, leaderboard, playerName, isRestored, jwProgress]); 

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, gameLoop]);

  const handleLoreContinue = () => {
      // Special check for Master NPC (Fake Orb ID 999)
      if (activeOrb && activeOrb.id === 999) {
          setIsRestored(true);
          setActiveOrb(null);
          setGameState(GameState.PLAYING);
          return;
      }

      // Special check for Junior Warden NPC (Fake Orb ID 998)
      if (activeOrb && activeOrb.id === 998) {
          // Check progress to determine which question to ask next
          let nextQId = 801;
          if (jwProgress === 1) nextQId = 802;
          if (jwProgress === 2) nextQId = 8; // Original Rite of Destitution Question

          const question = QUESTIONS.find(q => q.id === nextQId);
          if (question) {
              setActiveQuestion(question);
              setGameState(GameState.QUIZ);
          } else {
              setGameState(GameState.PLAYING); // Fallback
          }
          return;
      }

      if (activeOrb) {
        if (activeOrb.questionId === undefined) {
             handleCorrectAnswer();
             return;
        }
        const question = QUESTIONS.find(q => q.id === activeOrb.questionId);
        if (question) {
            setActiveQuestion(question);
            setGameState(GameState.QUIZ);
        } else handleCorrectAnswer();
      }
  };

  const handleCorrectAnswer = () => {
    playSound('collect');
    setScore(s => s + 100);
    
    // Check if this was the JW Interaction
    if (activeQuestion && (activeQuestion.id === 801 || activeQuestion.id === 802 || activeQuestion.id === 8)) {
        // Advance JW Progress
        const nextProgress = jwProgress + 1;
        setJwProgress(nextProgress);
        
        setActiveOrb(null);
        setActiveQuestion(null);
        keysRef.current = {};
        playerRef.current.vx = 0;
        setGameState(GameState.PLAYING);
        return;
    }

    if (activeOrb) {
        orbsStateRef.current.add(activeOrb.id);
        if (activeOrb.spriteKey === 'apron') setHasApron(true);
    }
    setActiveOrb(null);
    setActiveQuestion(null);
    keysRef.current = {};
    playerRef.current.vx = 0;
    setGameState(GameState.PLAYING);
  };

  const handleIncorrectAnswer = () => {
    playSound('error');
    saveScoreToLeaderboard(score, false);
    setGameState(GameState.GAME_OVER);
  };

  const startGame = () => {
    if (playerName.trim().length > 0) setGameState(GameState.PLAYING);
  };

  const resetGame = (goToMenu: boolean = false) => {
    playerRef.current = { x: 50, y: DESIGN_HEIGHT - 100, width: 30, height: 45, vx: 0, vy: 0, isGrounded: false, color: '#ffffff', facing: 1, jumpCount: 0, coyoteTimer: 0 };
    keysRef.current = {};
    orbsStateRef.current.clear();
    setScore(0);
    lastCheckpointRef.current = { x: 50, y: DESIGN_HEIGHT - 100 };
    setCheckpointPopup(false);
    setWarningMessage(null);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setActiveQuestion(null);
    cameraRef.current = { x: 0, y: 0 };
    setHasApron(false);
    setIsRestored(false); // Reset to candidate state
    setJwProgress(0); // Reset JW flow
    seenLoreRef.current.clear();
    setGameState(goToMenu ? GameState.START_MENU : GameState.PLAYING);
  };

  if (gameState === GameState.START_MENU) {
    const completedList = leaderboard.filter(e => e.completed).sort((a,b) => b.score - a.score || b.date - a.date).slice(0, 5);
    const recentList = [...leaderboard].sort((a,b) => b.date - a.date).slice(0, 5);

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] p-2 md:p-4 overflow-y-auto">
        {/* Force Landscape Warning for Preview/Desktop */}
        {isPortrait && !forceLandscape && (
          <div className="absolute inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
             <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
             <h2 className="text-2xl font-bold text-amber-400 mb-2">Best Experience in Landscape</h2>
             <p className="text-slate-400 mb-6">If you are on a phone, please rotate it.<br/>If you are on PC, you can continue.</p>
             <button onClick={() => setForceLandscape(true)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold transition-colors">Play Anyway</button>
          </div>
        )}

        <div className="w-full max-w-5xl max-h-full md:max-h-[90vh] flex flex-col md:flex-row landscape:flex-row gap-4 md:gap-8 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border-2 border-amber-600 shadow-2xl overflow-y-auto landscape:overflow-hidden">
          
          {/* Left Column: Intro & Controls */}
          <div className="flex-1 flex flex-col items-center text-center justify-center">
             <div className="mb-2 landscape:mb-0">
                {/* Logo: Square and Compass (Procedural) */}
                <img 
                    src={generateSpriteUrl('square_compass')}
                    className="w-16 h-16 md:w-24 md:h-24 landscape:w-14 landscape:h-14 mx-auto mb-2 landscape:mb-1 object-contain" 
                    style={{imageRendering:'pixelated'}}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.getElementById('logo-fallback');
                        if (fallback) fallback.style.display = 'block';
                    }}
                />
                <div id="logo-fallback" className="hidden text-4xl mb-2">🏛️</div>
                <h1 className="text-2xl md:text-4xl landscape:text-2xl font-bold text-amber-500 font-serif tracking-widest uppercase leading-tight">The Entered Apprentice<br/>Challenge</h1>
                <p className="text-slate-400 mt-1 italic text-sm md:text-base landscape:text-xs">A Journey to Master the First Degree</p>
             </div>
             
             <div className="w-full max-w-xs space-y-2 landscape:space-y-1 mt-4 landscape:mt-2">
                <input type="text" placeholder="Enter Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full px-4 py-2 landscape:py-1 rounded bg-slate-800 border border-slate-600 focus:border-amber-500 focus:outline-none text-white text-center font-bold text-sm md:text-base" maxLength={15} />
                <button onClick={startGame} disabled={!playerName.trim()} className="w-full py-3 landscape:py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded transition-colors uppercase tracking-widest shadow-lg text-sm md:text-base">Begin Journey</button>
             </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="flex-1 landscape:border-l landscape:border-slate-700 landscape:pl-4 flex flex-col min-h-[200px] md:min-h-[300px]">
             <h2 className="text-xl md:text-2xl landscape:text-lg font-bold text-slate-200 mb-2 text-center border-b border-slate-700 pb-2">The Trestleboard</h2>
             {isLoadingLeaderboard ? (
               <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div></div>
             ) : (
               <div className="grid grid-cols-2 gap-2 h-full overflow-hidden">
                  <div className="flex flex-col min-h-0">
                      <h3 className="text-amber-400 text-[10px] md:text-xs uppercase font-bold mb-1 text-center">Masters of the Work</h3>
                      <div className="flex-1 bg-slate-800/50 rounded p-1 space-y-1 overflow-y-auto">
                          {completedList.length === 0 && <p className="text-center text-slate-500 text-[10px] mt-2">None have passed.</p>}
                          {completedList.map(entry => (
                              <div key={entry.id} className="flex justify-between items-center text-[10px] md:text-xs p-1 bg-slate-800 rounded border border-amber-900/30">
                                  <span className="font-bold text-slate-200 truncate max-w-[60px] md:max-w-[80px]">{entry.name}</span>
                                  <span className="text-amber-500">{entry.score}</span>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="flex flex-col min-h-0">
                      <h3 className="text-slate-400 text-[10px] md:text-xs uppercase font-bold mb-1 text-center">Recent Workmen</h3>
                      <div className="flex-1 bg-slate-800/50 rounded p-1 space-y-1 overflow-y-auto">
                          {recentList.length === 0 && <p className="text-center text-slate-500 text-[10px] mt-2">No records found.</p>}
                          {recentList.map(entry => (
                              <div key={entry.id} className="flex justify-between items-center text-[10px] md:text-xs p-1 bg-slate-800 rounded border border-slate-700">
                                  <span className="text-slate-300 truncate max-w-[50px] md:max-w-[70px]">{entry.name}</span>
                                  <div className="flex items-center gap-1 md:gap-2">
                                      <span className="text-slate-400 font-mono">{entry.score}</span>
                                      <span className={`${entry.completed ? 'text-green-500' : 'text-red-400'} font-bold text-[8px] md:text-[10px] uppercase`}>
                                          {entry.completed ? 'Pass' : 'Fail'}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden no-select">
      {isPortrait && !forceLandscape && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Please Rotate Device</h2>
            <p className="text-slate-400 mb-6">This game is designed for landscape mode.</p>
            {/* Added for Preview/Desktop users */}
            <button onClick={() => setForceLandscape(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 text-sm">Play Anyway (Desktop/Preview)</button>
        </div>
      )}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="px-4 py-2 pointer-events-auto">
          {!isStandalone && (
            <button onClick={toggleFullscreen} className="bg-slate-800/80 p-2 rounded-lg border border-slate-600 pointer-events-auto transition active:scale-95 text-slate-300 hover:text-white" title="Toggle Fullscreen">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          )}
        </div>
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600 backdrop-blur-sm flex items-center gap-3">
          {hasApron && <img src={generateSpriteUrl('apron')} className="w-6 h-6 object-contain" style={{imageRendering:'pixelated'}} title="Apron Equipped"/>}
          <div className="flex flex-col items-end leading-none">
              <span className="text-cyan-400 font-mono text-xl">{score}</span>
              <span className="text-slate-500 font-mono text-xs">/ {ORB_DATA.length * 100}</span>
          </div>
        </div>
      </div>
      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 ${checkpointPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 border-2 border-amber-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
           <img src={generateSpriteUrl('square_compass')} className="w-8 h-8 md:w-12 md:h-12 animate-pulse" style={{ imageRendering: 'pixelated' }} />
           <div><h3 className="text-amber-400 font-bold text-lg md:text-xl uppercase tracking-widest">Checkpoint</h3><p className="text-slate-400 text-xs md:text-sm">Progress Saved</p></div>
        </div>
      </div>
      <div className={`absolute top-32 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${warningMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-red-900/90 border-2 border-red-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-md">
           <div className="text-2xl">⚠️</div>
           <div><h3 className="text-red-400 font-bold text-lg uppercase tracking-widest">Access Denied</h3><p className="text-slate-300 text-sm">{warningMessage}</p></div>
        </div>
      </div>
      <canvas ref={canvasRef} width={dimensions.w} height={dimensions.h} className="block bg-slate-900" />
      {gameState === GameState.PLAYING && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-4 px-4">
            <div className="flex justify-between items-end w-full select-none mb-2">
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-md border-2 border-white/20 active:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg" 
                        onMouseDown={handleInputStart('ArrowLeft')} onMouseUp={handleInputEnd('ArrowLeft')} onMouseLeave={handleInputEnd('ArrowLeft')}
                        onTouchStart={handleInputStart('ArrowLeft')} onTouchEnd={handleInputEnd('ArrowLeft')}
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        className="w-24 h-24 bg-white/10 rounded-full backdrop-blur-md border-2 border-white/20 active:bg-white/30 flex items-center justify-center transition-all active:scale-95 shadow-lg" 
                        onMouseDown={handleInputStart('ArrowRight')} onMouseUp={handleInputEnd('ArrowRight')} onMouseLeave={handleInputEnd('ArrowRight')}
                        onTouchStart={handleInputStart('ArrowRight')} onTouchEnd={handleInputEnd('ArrowRight')}
                    >
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="pointer-events-auto pl-8">
                    <button 
                        className="w-28 h-28 bg-blue-500/20 rounded-full backdrop-blur-md border-2 border-blue-400/40 active:bg-blue-500/40 flex items-center justify-center transition-all active:scale-95 shadow-lg" 
                        onMouseDown={handleInputStart('Space')} onMouseUp={handleInputEnd('Space')} onMouseLeave={handleInputEnd('Space')}
                        onTouchStart={handleInputStart('Space')} onTouchEnd={handleInputEnd('Space')}
                    >
                        <span className="font-bold text-white tracking-wider text-lg">JUMP</span>
                    </button>
                </div>
            </div>
        </div>
      )}
      {gameState === GameState.LORE && activeOrb && <LoreModal orb={activeOrb} onNext={handleLoreContinue} />}
      {gameState === GameState.QUIZ && activeQuestion && <QuizModal question={activeQuestion} onCorrect={handleCorrectAnswer} onIncorrect={handleIncorrectAnswer} />}
      {gameState === GameState.GAME_OVER && activeQuestion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl max-h-[95vh] flex flex-col items-center bg-slate-900 border-2 md:border-4 border-amber-600 rounded-xl p-4 md:p-8 shadow-2xl text-center overflow-y-auto">
            <div className="shrink-0 w-14 h-14 md:w-20 md:h-20 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 md:mb-6 border-2 md:border-4 border-amber-500">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h2 className="shrink-0 text-xl md:text-3xl font-bold text-amber-400 mb-2 uppercase tracking-wider leading-tight">Further Light Required</h2>
            <div className="shrink-0 w-full text-left bg-slate-800/50 p-3 md:p-4 rounded border border-slate-700 my-3 md:my-6">
                <p className="text-slate-400 text-xs md:text-sm uppercase font-bold mb-1">Question:</p>
                <p className="text-slate-200 mb-3 md:mb-4 font-serif text-sm md:text-base leading-snug">{activeQuestion.text}</p>
                <p className="text-amber-400 text-xs md:text-sm uppercase font-bold mb-1">Correct Answer:</p>
                <p className="text-white font-bold text-base md:text-lg leading-snug">{activeQuestion.correctAnswer}</p>
            </div>
            <p className="shrink-0 text-slate-300 text-xs md:text-base mb-4 md:mb-6 leading-relaxed italic">"We learn through patience and perseverance. Let us return to the West Gate and try again."</p>
            <div className="flex gap-4">
                <button onClick={() => resetGame(false)} className="shrink-0 px-6 py-3 md:px-8 bg-amber-700 hover:bg-amber-600 text-white font-bold text-base md:text-lg rounded-lg transition-all uppercase tracking-widest shadow-lg">Restart Level</button>
                <button onClick={() => resetGame(true)} className="shrink-0 px-6 py-3 md:px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold text-base md:text-lg rounded-lg transition-all uppercase tracking-widest shadow-lg">Main Menu</button>
            </div>
          </div>
        </div>
      )}
      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="text-center max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-amber-400 mb-6 animate-bounce">Level 1 Complete</h2>
            <div className="h-1 w-32 bg-amber-600 mx-auto rounded-full mb-6"></div>
            <p className="text-slate-200 text-xl md:text-2xl mb-8 font-light leading-relaxed">
              You have successfully completed the Entered Apprentice stage.<br/><span className="font-bold text-white mt-2 block">Proceed to Fellowcraft</span>
            </p>
            <p className="text-blue-300 text-xl mb-8 font-mono">Final Score: {score + 500}</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => resetGame(false)} className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-xl shadow-amber-900/50">Restart Journey</button>
                <button onClick={() => resetGame(true)} className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-xl">View Leaderboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;