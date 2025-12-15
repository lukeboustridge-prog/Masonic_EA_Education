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

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Dimensions state
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
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

  // --- Standalone Mode Detection ---
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };
    checkStandalone();
  }, []);

  // --- Leaderboard Fetching ---
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        } else {
          throw new Error('API Error');
        }
      } catch (e) {
        console.error("Failed to fetch global leaderboard, falling back to local", e);
        const stored = localStorage.getItem('masonic_leaderboard');
        if (stored) {
          try {
            setLeaderboard(JSON.parse(stored));
          } catch (err) {
            console.error(err);
          }
        }
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const saveScoreToLeaderboard = async (finalScore: number, isComplete: boolean) => {
    const newEntry: LeaderboardEntry = {
      id: Date.now().toString(), // Temporary ID for optimistic update
      name: playerName.trim() || "Unknown Brother",
      score: finalScore,
      date: Date.now(),
      completed: isComplete
    };
    
    // 1. Optimistic UI Update
    const updated = [...leaderboard, newEntry];
    setLeaderboard(updated);
    
    // 2. Local Backup
    localStorage.setItem('masonic_leaderboard', JSON.stringify(updated));

    // 3. Send to Global DB
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      // Optionally re-fetch to ensure sync, but optimistic is smoother for games
    } catch (e) {
      console.error("Failed to save score to global DB", e);
    }
  };

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
    // Orb/Item Sprites
    const uniqueKeys = Array.from(new Set(ORB_DATA.map(o => o.spriteKey)));
    // Add Checkpoint Sprite
    uniqueKeys.push('square_compass');
    // Ensure Apron is loaded if not explicitly in ORB_DATA (it is, but safe to keep logic)
    if (!uniqueKeys.includes('apron')) uniqueKeys.push('apron');
    
    // Add Pillars
    uniqueKeys.push('pillar_ionic', 'pillar_doric', 'pillar_corinthian');

    uniqueKeys.forEach(key => {
        const img = new Image();
        // Generate sprite on the fly
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
        request.call(docEl).catch(() => {
          // Silent fail for browsers that don't support or deny it
        });
      }
    } catch (e) {
      // Ignore errors 
    }
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
        } else {
            console.log("Fullscreen API not available");
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

  // Mosaic Pavement Texture Generator
  const drawStoneBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    color: string
  ) => {
    // 1. Draw Side/Body (Marble)
    ctx.fillStyle = '#cbd5e1'; // Light grey marble base
    ctx.fillRect(x, y, w, h);
    
    // Marble veining
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    for(let i=0; i<w; i+=15) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i - 20, y + h);
        ctx.stroke();
    }
    ctx.restore();

    // 2. Mosaic Pavement Top (Checkered)
    const TILE_SIZE = 15;
    const cols = Math.ceil(w / TILE_SIZE);
    const rows = 1; // Only top surface
    
    for(let c=0; c<cols; c++) {
        const tx = x + c * TILE_SIZE;
        // Don't draw past width
        const tw = Math.min(TILE_SIZE, x + w - tx);
        
        // Checkered pattern
        ctx.fillStyle = (c % 2 === 0) ? '#1e293b' : '#f8fafc'; // Dark Slate vs White
        ctx.fillRect(tx, y, tw, TILE_SIZE);
    }
    
    // Border for definition
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  };

  const drawPlayerSprite = (ctx: CanvasRenderingContext2D, p: Player, showApron: boolean) => {
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(p.facing, 1); 

    // 1. Head
    ctx.fillStyle = '#fca5a5'; 
    ctx.beginPath();
    ctx.arc(0, -16, 7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Body (Dark Suit)
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

    // 5. Apron (Conditional)
    if (showApron) {
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
    }

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(3, -17, 1, 0, Math.PI * 2); 
    ctx.fill();

    ctx.restore();
  };

  const drawTempleBackground = (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, width: number, height: number) => {
    // 1. The Ceiling (Architrave/Cornice) & Starry Deck
    ctx.save();
    
    // Deep Blue Sky Background (The Starry Deck)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0f172a'); // Night Sky
    skyGrad.addColorStop(1, '#1e293b'); // Horizon
    ctx.fillStyle = skyGrad;
    ctx.fillRect(cameraX, cameraY, width, height);

    // Stars
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

    // 2. The Pillars (Background Layer)
    const PILLAR_GAP = 400;
    const pStart = Math.floor(cameraX / PILLAR_GAP);
    const pEnd = Math.floor((cameraX + width) / PILLAR_GAP) + 1;
    const ceilingHeight = 60; // Height of cornice

    for (let i = pStart; i <= pEnd; i++) {
        const px = i * PILLAR_GAP;
        
        // Determine Pillar Type based on Progression (Masonic Orders)
        let pillarKey = '';
        if (px < 2000) {
            pillarKey = 'pillar_ionic'; // Start: Wisdom (Master/East technically, but used as sequence here)
        } else if (px < 5000) {
            pillarKey = 'pillar_doric'; // Middle: Strength
        } else {
            pillarKey = 'pillar_corinthian'; // End: Beauty
        }

        const img = spritesRef.current[pillarKey];
        if (img) {
            // Draw tall pillar stretching from floor to ceiling
            const pWidth = 60;
            const pX = px - pWidth/2;
            
            ctx.globalAlpha = 0.8; // Slightly faded for background
            // Better: Draw in world space
            ctx.drawImage(img, pX, -200, pWidth, DESIGN_HEIGHT + 400);
            ctx.globalAlpha = 1.0;
        }
    }

    // 3. The Ceiling Cornice (Architrave) - Fixed Top
    // We draw this in World Space Y=0 to Y=60 roughly
    if (cameraY < 100) { // Only visible if we look up
        const cY = 0;
        const cH = 60;
        
        // Main Stone Block
        ctx.fillStyle = '#1e293b'; // Dark Stone
        ctx.fillRect(cameraX, cY, width, cH);
        
        // Detail Lines
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cameraX, cY + 10); ctx.lineTo(cameraX + width, cY + 10);
        ctx.moveTo(cameraX, cY + 50); ctx.lineTo(cameraX + width, cY + 50);
        ctx.stroke();
        
        // Dentils (Small blocks)
        ctx.fillStyle = '#475569';
        const dentilSize = 20;
        const dStart = Math.floor(cameraX / dentilSize);
        const dEnd = Math.floor((cameraX + width) / dentilSize) + 1;
        for(let i=dStart; i<=dEnd; i++) {
            if (i%2 === 0) {
                ctx.fillRect(i*dentilSize, cY + 30, dentilSize, 10);
            }
        }
    }

    ctx.restore();
  };

  // --- Main Loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // CRITICAL: Ensure we get pixelated scaling for our generated retro sprites
    ctx.imageSmoothingEnabled = false;

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
    for (const cp of CHECKPOINTS) {
        // Only update if we passed it AND it's further than the last one
        if (player.x > cp.x && cp.x > lastCheckpointRef.current.x) {
            // Update last checkpoint
            lastCheckpointRef.current = { x: cp.x, y: groundRefY + cp.yOffset - 100 };

            // Trigger UI Notification
            setCheckpointPopup(true);
            playSound('lore'); // Use existing pleasant sound
            
            // Auto-hide after 3 seconds
            if (checkpointTimeoutRef.current) window.clearTimeout(checkpointTimeoutRef.current);
            checkpointTimeoutRef.current = window.setTimeout(() => {
                setCheckpointPopup(false);
            }, 3000);
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

    // Goal Collision & Level Completion Check
    if (player.x + player.width > GOAL_X) {
      const maxScore = ORB_DATA.length * 100;
      
      if (score >= maxScore) {
        setGameState(GameState.VICTORY);
        saveScoreToLeaderboard(score + 500, true); // Bonus 500 for finishing
        playSound('win');
        return; 
      } else {
         // Push player back
         player.x = GOAL_X - player.width - 5;
         player.vx = 0;
         
         // Trigger Warning
         if (!warningMessage) {
            const missing = maxScore - score;
            const msg = `Access Denied. Need ${missing} more points.`;
            setWarningMessage(msg);
            playSound('error');
            
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = window.setTimeout(() => {
                setWarningMessage(null);
            }, 3000);
         }
      }
    }

    // Orb Collision (Working Tools)
    for (const orb of orbs) {
      if (!orb.active) continue;
      const dx = (player.x + player.width / 2) - orb.x;
      const dy = (player.y + player.height / 2) - orb.y;
      // Increased collision radius slightly for tools
      if (Math.sqrt(dx * dx + dy * dy) < orb.radius + player.width / 2 + 10) {
        setActiveOrb(orb);
        
        // Stop movement
        playerRef.current.vx = 0;
        keysRef.current = {};
        
        // Logic: Have we seen this lore type (spriteKey) before?
        if (seenLoreRef.current.has(orb.spriteKey)) {
            // Yes: Skip Lore, go straight to Quiz (if questionId exists)
            // If it's a "no question" orb (like the first apron), just equip it.
            if (orb.questionId !== undefined) {
                 const question = QUESTIONS.find(q => q.id === orb.questionId);
                 if (question) {
                     setActiveQuestion(question);
                     setGameState(GameState.QUIZ);
                     playSound('lore'); 
                 } else {
                     handleCorrectAnswer(); 
                 }
            } else {
                // No question, just collect/equip
                handleCorrectAnswer();
            }
        } else {
            // No: Show Lore Modal
            seenLoreRef.current.add(orb.spriteKey);
            setGameState(GameState.LORE); 
            playSound('lore');
        }

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
    
    // 1. CLEAR AND PREP
    ctx.clearRect(0,0,w,h);

    ctx.save();
    
    // Apply Scale to Fit
    ctx.scale(scaleRatio, scaleRatio);
    
    // Apply Camera Translate (In logical coordinates)
    ctx.translate(-Math.floor(cameraRef.current.x), -Math.floor(cameraRef.current.y));

    // Draw Background Layer (Temple Interior)
    drawTempleBackground(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH);

    // Draw Checkpoints
    CHECKPOINTS.forEach(cp => {
        // Draw the Square and Compass sprite
        const cpImg = spritesRef.current['square_compass'];
        // Check if passed (active)
        const isPassed = lastCheckpointRef.current.x >= cp.x;
        
        const cpX = cp.x;
        const cpY = groundRefY + cp.yOffset - 50; // Float slightly above ground
        
        if (cpImg) {
            ctx.save();
            ctx.globalAlpha = isPassed ? 1.0 : 0.3; // Dim if not reached
            if (isPassed) {
                // Glow if active
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#fbbf24';
            }
            // Draw slightly larger
            ctx.drawImage(cpImg, cpX - 20, cpY, 40, 40);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = isPassed ? '#fbbf24' : '#475569';
            ctx.beginPath();
            ctx.arc(cpX, cpY + 20, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Platforms (Updated with Mosaic Pavement)
    platforms.forEach(plat => {
      drawStoneBlock(ctx, plat.x, plat.y, plat.width, plat.height, plat.color);
    });

    // Draw Goal (The East)
    const maxScore = ORB_DATA.length * 100;
    const isGoalUnlocked = score >= maxScore;
    
    ctx.fillStyle = isGoalUnlocked ? '#fbbf24' : '#ef4444'; // Gold if unlocked, Red if locked
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

    // Draw Player Sprite (With Conditional Apron)
    drawPlayerSprite(ctx, player, hasApron);

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
  }, [gameState, dimensions, hasApron, warningMessage, score, leaderboard, playerName]); 

  // Loop Control
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, gameLoop]);

  const resetGame = (goToMenu: boolean = false) => {
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
    setCheckpointPopup(false);
    
    // Clear warnings
    setWarningMessage(null);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    setActiveQuestion(null); // Clear question state
    cameraRef.current = { x: 0, y: 0 };
    setHasApron(false); // Reset Apron State
    
    // Clear Seen Lore State for a fresh "run" where you can read definitions again
    seenLoreRef.current.clear();
    
    setGameState(goToMenu ? GameState.START_MENU : GameState.PLAYING);
  };

  // Lore Handler
  const handleLoreContinue = () => {
      if (activeOrb) {
        // If questionId is missing, skip quiz
        if (activeOrb.questionId === undefined) {
             handleCorrectAnswer();
             return;
        }

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
    
    if (activeOrb) {
        orbsStateRef.current.add(activeOrb.id);
        // UNLOCK APRON if this was an Apron Orb
        if (activeOrb.spriteKey === 'apron') {
            setHasApron(true);
        }
    }

    setActiveOrb(null);
    setActiveQuestion(null);

    // CRITICAL FIX: Reset keys and velocity so player doesn't auto-run after quiz
    keysRef.current = {};
    playerRef.current.vx = 0;

    setGameState(GameState.PLAYING);
  };

  const handleIncorrectAnswer = () => {
    playSound('error');
    // Save current progress on failure
    saveScoreToLeaderboard(score, false);
    setGameState(GameState.GAME_OVER);
  };

  // Touch Handlers
  const handleTouchStart = (key: string) => (e: React.TouchEvent) => {
    e.preventDefault(); 
    
    // Attempt fullscreen on first touch
    enterFullscreen();

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

  const startGame = () => {
    if (playerName.trim().length > 0) {
      setGameState(GameState.PLAYING);
    }
  };

  // Render Start Screen
  if (gameState === GameState.START_MENU) {
    const completedList = leaderboard
        .filter(e => e.completed)
        .sort((a,b) => b.score - a.score || b.date - a.date)
        .slice(0, 5);
        
    const recentList = [...leaderboard]
        .sort((a,b) => b.date - a.date)
        .slice(0, 5);

    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] overflow-hidden p-4">
        <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 bg-slate-900/80 backdrop-blur-md p-6 md:p-8 rounded-xl border-2 border-amber-600 shadow-2xl">
          
          {/* Left: Login & Intro */}
          <div className="flex-1 flex flex-col items-center text-center space-y-6">
             <div>
                <img src={generateSpriteUrl('square_compass')} className="w-20 h-20 mx-auto mb-4" style={{imageRendering:'pixelated'}}/>
                <h1 className="text-3xl md:text-4xl font-bold text-amber-500 font-serif tracking-widest uppercase">The Entered Apprentice Challenge</h1>
                <p className="text-slate-400 mt-2 italic">A Journey to Master the First Degree</p>
             </div>
             
             <div className="w-full max-w-xs space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Your Name" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-slate-800 border border-slate-600 focus:border-amber-500 focus:outline-none text-white text-center font-bold"
                  maxLength={15}
                />
                <button 
                  onClick={startGame}
                  disabled={!playerName.trim()}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded transition-colors uppercase tracking-widest shadow-lg"
                >
                  Begin Journey
                </button>
             </div>
          </div>

          {/* Right: Leaderboard */}
          <div className="flex-1 border-l-0 md:border-l border-slate-700 md:pl-8 flex flex-col min-h-[300px]">
             <h2 className="text-2xl font-bold text-slate-200 mb-4 text-center border-b border-slate-700 pb-2">The Trestleboard</h2>
             
             {isLoadingLeaderboard ? (
               <div className="flex-1 flex items-center justify-center">
                 <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Completed Column */}
                  <div className="flex flex-col">
                      <h3 className="text-amber-400 text-xs uppercase font-bold mb-2 text-center">Masters of the Work</h3>
                      <div className="flex-1 bg-slate-800/50 rounded p-2 space-y-2 overflow-y-auto">
                          {completedList.length === 0 && <p className="text-center text-slate-500 text-xs mt-4">None have passed.</p>}
                          {completedList.map(entry => (
                              <div key={entry.id} className="flex justify-between items-center text-xs p-2 bg-slate-800 rounded border border-amber-900/30">
                                  <span className="font-bold text-slate-200 truncate max-w-[80px]">{entry.name}</span>
                                  <span className="text-amber-500">{entry.score}</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Recent Column */}
                  <div className="flex flex-col">
                      <h3 className="text-slate-400 text-xs uppercase font-bold mb-2 text-center">Recent Workmen</h3>
                      <div className="flex-1 bg-slate-800/50 rounded p-2 space-y-2 overflow-y-auto">
                          {recentList.length === 0 && <p className="text-center text-slate-500 text-xs mt-4">No records found.</p>}
                          {recentList.map(entry => (
                              <div key={entry.id} className="flex justify-between items-center text-xs p-2 bg-slate-800 rounded border border-slate-700">
                                  <span className="text-slate-300 truncate max-w-[70px]">{entry.name}</span>
                                  <div className="flex items-center gap-2">
                                      <span className="text-slate-400 font-mono">{entry.score}</span>
                                      <span className={`${entry.completed ? 'text-green-500' : 'text-red-400'} font-bold text-[10px] uppercase`}>
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
        <div className="px-4 py-2 pointer-events-auto">
          {!isStandalone && (
            <button 
              onClick={toggleFullscreen}
              className="bg-slate-800/80 p-2 rounded-lg border border-slate-600 pointer-events-auto transition active:scale-95 text-slate-300 hover:text-white"
              title="Toggle Fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
        <div className="bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-600 backdrop-blur-sm flex items-center gap-3">
          {hasApron && (
             <img src={generateSpriteUrl('apron')} className="w-6 h-6 object-contain" style={{imageRendering:'pixelated'}} title="Apron Equipped"/>
          )}
          <div className="flex flex-col items-end leading-none">
              <span className="text-cyan-400 font-mono text-xl">{score}</span>
              <span className="text-slate-500 font-mono text-xs">/ {ORB_DATA.length * 100}</span>
          </div>
        </div>
      </div>

      {/* Checkpoint Notification */}
      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 ${checkpointPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 border-2 border-amber-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
           <img 
             src={generateSpriteUrl('square_compass')} 
             className="w-8 h-8 md:w-12 md:h-12 animate-pulse" 
             style={{ imageRendering: 'pixelated' }}
           />
           <div>
             <h3 className="text-amber-400 font-bold text-lg md:text-xl uppercase tracking-widest">Checkpoint</h3>
             <p className="text-slate-400 text-xs md:text-sm">Progress Saved</p>
           </div>
        </div>
      </div>

      {/* Warning Notification */}
      <div className={`absolute top-32 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${warningMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-red-900/90 border-2 border-red-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-md">
           <div className="text-2xl">⚠️</div>
           <div>
             <h3 className="text-red-400 font-bold text-lg uppercase tracking-widest">Access Denied</h3>
             <p className="text-slate-300 text-sm">{warningMessage}</p>
           </div>
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

      {/* Game Over / Education Screen */}
      {gameState === GameState.GAME_OVER && activeQuestion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="
            relative w-full max-w-xl max-h-[95vh]
            flex flex-col items-center 
            bg-slate-900 border-2 md:border-4 border-amber-600 rounded-xl 
            p-4 md:p-8 
            shadow-2xl text-center
            overflow-y-auto
          ">
            
            <div className="shrink-0 w-14 h-14 md:w-20 md:h-20 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 md:mb-6 border-2 md:border-4 border-amber-500">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>

            <h2 className="shrink-0 text-xl md:text-3xl font-bold text-amber-400 mb-2 uppercase tracking-wider leading-tight">
              Further Light Required
            </h2>
            
            <div className="shrink-0 w-full text-left bg-slate-800/50 p-3 md:p-4 rounded border border-slate-700 my-3 md:my-6">
                <p className="text-slate-400 text-xs md:text-sm uppercase font-bold mb-1">Question:</p>
                <p className="text-slate-200 mb-3 md:mb-4 font-serif text-sm md:text-base leading-snug">{activeQuestion.text}</p>
                
                <p className="text-amber-400 text-xs md:text-sm uppercase font-bold mb-1">Correct Answer:</p>
                <p className="text-white font-bold text-base md:text-lg leading-snug">{activeQuestion.correctAnswer}</p>
            </div>
            
            <p className="shrink-0 text-slate-300 text-xs md:text-base mb-4 md:mb-6 leading-relaxed italic">
              "We learn through patience and perseverance. Let us return to the West Gate and try again."
            </p>

            <div className="flex gap-4">
                <button 
                  onClick={() => resetGame(false)}
                  className="
                    shrink-0
                    px-6 py-3 md:px-8
                    bg-amber-700 hover:bg-amber-600 
                    text-white font-bold text-base md:text-lg rounded-lg 
                    transition-all uppercase tracking-widest shadow-lg
                  "
                >
                  Restart Level
                </button>
                <button 
                  onClick={() => resetGame(true)}
                  className="
                    shrink-0
                    px-6 py-3 md:px-8
                    bg-slate-700 hover:bg-slate-600 
                    text-white font-bold text-base md:text-lg rounded-lg 
                    transition-all uppercase tracking-widest shadow-lg
                  "
                >
                  Main Menu
                </button>
            </div>
          </div>
        </div>
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
            <p className="text-blue-300 text-xl mb-8 font-mono">Final Score: {score + 500}</p>
            
            <div className="flex justify-center gap-4">
                <button 
                  onClick={() => resetGame(false)}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-xl shadow-amber-900/50"
                >
                  Restart Journey
                </button>
                <button 
                  onClick={() => resetGame(true)}
                  className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-full transition transform hover:scale-105 shadow-xl"
                >
                  View Leaderboard
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;