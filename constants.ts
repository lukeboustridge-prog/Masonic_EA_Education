import { Question, Platform, Orb, OrbDefinition } from './types';

// Physics Tweaks for "Smoother" feel
// Lower gravity and jump force makes the jump arc slower and easier to control
export const GRAVITY = 0.4; 
export const FRICTION = 0.82; // Slightly more friction for tighter stopping
export const MOVE_SPEED = 5.0; // Slightly faster to compensate for longer air time
export const JUMP_FORCE = -11; 

export const WORLD_WIDTH = 8000; 

// Logical height for Scale-to-Fit
// Reduced to 360 to zoom in the camera for better mobile visibility
export const DESIGN_HEIGHT = 360;

// Checkpoints with visual coordinates (x, yOffset from ground)
export const CHECKPOINTS = [
  { x: 50, yOffset: 0 },   // Start
  { x: 1200, yOffset: 0 }, // Tower Base
  { x: 2150, yOffset: 0 }, // Hills
  { x: 3000, yOffset: 150 }, // Mines (Lower)
  { x: 4300, yOffset: -50 }, // Bridge
  { x: 5100, yOffset: 0 }, // High Tower Base
  { x: 6900, yOffset: 0 }  // Final Stretch
];

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the first care of every Freemason?",
    answers: ["To see that the Lodge is properly tyled", "To sign the attendance book", "To clothe himself properly"],
    correctAnswer: "To see that the Lodge is properly tyled"
  },
  {
    id: 2,
    text: "How many principal Officers are there in the Lodge?",
    answers: ["Five", "Seven", "Three"],
    correctAnswer: "Three"
  },
  {
    id: 3,
    text: "Where is the constant place of the Junior Warden?",
    answers: ["The South", "The West", "The East"],
    correctAnswer: "The South"
  },
  {
    id: 4,
    text: "Where is the situation of the Tyler?",
    answers: ["Within the entrance", "Outside the door of the Lodge", "At the Secretary's table"],
    correctAnswer: "Outside the door of the Lodge"
  },
  {
    id: 5,
    text: "What is the duty of the Inner Guard?",
    answers: ["To admit Freemasons on proof", "To prepare the candidate", "To collect subscriptions"],
    correctAnswer: "To admit Freemasons on proof"
  },
  {
    id: 6,
    text: "Why is the Senior Warden placed in the West?",
    answers: ["To mark the setting sun", "To instruct the Brethren", "To guard the entrance"],
    correctAnswer: "To mark the setting sun"
  },
  {
    id: 7,
    text: "Who represents the Sun to rule the day?",
    answers: ["The Worshipful Master", "The Senior Warden", "The Chaplain"],
    correctAnswer: "The Worshipful Master"
  },
  {
    id: 8,
    text: "What are the three great emblematical lights?",
    answers: ["Sun, Moon, Master", "V.S.L., Square, and Compasses", "Wisdom, Strength, Beauty"],
    correctAnswer: "V.S.L., Square, and Compasses"
  },
  {
    id: 9,
    text: "What are the three lesser lights?",
    answers: ["Sun, Moon, and Master", "Candles, Stars, and Sun", "Faith, Hope, and Charity"],
    correctAnswer: "Sun, Moon, and Master"
  },
  {
    id: 10,
    text: "What is the 24-inch Gauge used for?",
    answers: ["To measure the work", "To smooth the stone", "To lay lines"],
    correctAnswer: "To measure the work"
  },
  {
    id: 11,
    text: "What does the Common Gavel represent?",
    answers: ["Force of conscience", "Authority", "Hard labour"],
    correctAnswer: "Force of conscience"
  },
  {
    id: 12,
    text: "What are the immovable jewels?",
    answers: ["Square, Level, Plumb", "Tracing Board, Rough and Perfect Ashlars", "Collar, Apron, Gauntlets"],
    correctAnswer: "Tracing Board, Rough and Perfect Ashlars"
  },
  {
    id: 13,
    text: "What does the Rough Ashlar represent?",
    answers: ["Man in his infant or primitive state", "The finished building", "The mind of man in old age"],
    correctAnswer: "Man in his infant or primitive state"
  },
  {
    id: 14,
    text: "What are the three great pillars?",
    answers: ["Wisdom, Strength, Beauty", "Faith, Hope, Charity", "Ionic, Doric, Tuscan"],
    correctAnswer: "Wisdom, Strength, Beauty"
  },
  {
    id: 15,
    text: "What rests on top of Jacob's Ladder?",
    answers: ["The Heavens", "The Blazing Star"],
    correctAnswer: "The Heavens"
  },
  {
    id: 16,
    text: "What do the seven stars represent?",
    answers: ["Seven regularly made Freemasons", "Seven liberal arts", "Seven days of creation"],
    correctAnswer: "Seven regularly made Freemasons"
  },
  {
    id: 17,
    text: "What are the ornaments of the Lodge?",
    answers: ["Mosaic Pavement, Blazing Star, Indented Border", "The Officers", "The Candles"],
    correctAnswer: "Mosaic Pavement, Blazing Star, Indented Border"
  },
  {
    id: 18,
    text: "What does the Lewis denote?",
    answers: ["Strength", "Wisdom", "Beauty"],
    correctAnswer: "Strength"
  },
  {
    id: 19,
    text: "What are the four cardinal virtues?",
    answers: ["Temperance, Fortitude, Prudence, Justice", "Faith, Hope, Charity, Love", "Honour, Virtue, Mercy, Truth"],
    correctAnswer: "Temperance, Fortitude, Prudence, Justice"
  },
  {
    id: 20,
    text: "What are the distinguishing characteristics of a good Freemason?",
    answers: ["Virtue, Honour, and Mercy", "Wealth, Rank, and Power", "Strength, Speed, and Agility"],
    correctAnswer: "Virtue, Honour, and Mercy"
  }
];

// yOffset: 0 is the ground level. Negative is Up. Positive is Down (Mines).
export const PLATFORM_DATA = [
  // --- SECTION 1: The Preparation Room (Start) ---
  { x: 0, yOffset: 0, width: 800, height: 600, color: '#64748b' }, 
  { x: 500, yOffset: -80, width: 100, height: 20, color: '#94a3b8' },
  { x: 650, yOffset: -180, width: 100, height: 20, color: '#94a3b8' },
  { x: 800, yOffset: -250, width: 150, height: 20, color: '#475569' }, // Orb 1 spot

  // The Pit (Gap)
  { x: 1000, yOffset: -150, width: 80, height: 20, color: '#94a3b8' }, 

  // --- SECTION 2: The First Tower ---
  { x: 1200, yOffset: 0, width: 400, height: 600, color: '#64748b' }, // Base
  { x: 1200, yOffset: -120, width: 100, height: 20, color: '#94a3b8' },
  { x: 1400, yOffset: -220, width: 100, height: 20, color: '#94a3b8' },
  { x: 1300, yOffset: -340, width: 100, height: 20, color: '#94a3b8' },
  { x: 1450, yOffset: -460, width: 100, height: 20, color: '#94a3b8' },
  { x: 1300, yOffset: -580, width: 300, height: 20, color: '#cbd5e1' }, // High platform Orb 2

  // Descent Steps
  { x: 1700, yOffset: -450, width: 80, height: 20, color: '#94a3b8' },
  { x: 1850, yOffset: -300, width: 80, height: 20, color: '#94a3b8' },
  { x: 2000, yOffset: -150, width: 80, height: 20, color: '#94a3b8' },

  // --- SECTION 3: The Rolling Hills ---
  { x: 2150, yOffset: 0, width: 800, height: 600, color: '#64748b' },
  { x: 2300, yOffset: -100, width: 100, height: 20, color: '#475569' },
  { x: 2500, yOffset: -200, width: 100, height: 20, color: '#475569' },
  { x: 2700, yOffset: -100, width: 100, height: 20, color: '#475569' },

  // --- SECTION 4: The Mines (Lower Route) ---
  // Player must drop down
  { x: 3000, yOffset: 150, width: 200, height: 20, color: '#334155' }, // Drop platform
  { x: 3250, yOffset: 250, width: 200, height: 20, color: '#334155' },
  { x: 3500, yOffset: 350, width: 400, height: 20, color: '#1e293b' }, // Deep bottom
  { x: 3700, yOffset: 250, width: 100, height: 20, color: '#334155' }, // Climbing out
  { x: 3850, yOffset: 100, width: 100, height: 20, color: '#334155' },
  { x: 4000, yOffset: 0, width: 200, height: 600, color: '#64748b' }, // Back to surface

  // --- SECTION 5: The Bridge of Sighs ---
  { x: 4300, yOffset: -50, width: 80, height: 20, color: '#94a3b8' },
  { x: 4450, yOffset: -50, width: 80, height: 20, color: '#94a3b8' },
  { x: 4600, yOffset: -150, width: 80, height: 20, color: '#94a3b8' }, // Orb spot
  { x: 4750, yOffset: -50, width: 80, height: 20, color: '#94a3b8' },
  { x: 4900, yOffset: -50, width: 80, height: 20, color: '#94a3b8' },

  // --- SECTION 6: The High Tower (The hardest climb) ---
  { x: 5100, yOffset: 0, width: 200, height: 600, color: '#64748b' },
  { x: 5150, yOffset: -150, width: 80, height: 20, color: '#94a3b8' },
  { x: 5350, yOffset: -250, width: 80, height: 20, color: '#94a3b8' },
  { x: 5150, yOffset: -350, width: 80, height: 20, color: '#94a3b8' },
  { x: 5350, yOffset: -450, width: 80, height: 20, color: '#94a3b8' },
  { x: 5150, yOffset: -550, width: 80, height: 20, color: '#94a3b8' },
  { x: 5350, yOffset: -650, width: 80, height: 20, color: '#94a3b8' },
  { x: 5200, yOffset: -750, width: 300, height: 20, color: '#cbd5e1' }, // Peak

  // --- SECTION 7: The Floating Isles (Wide Gaps) ---
  { x: 5700, yOffset: -600, width: 100, height: 20, color: '#475569' },
  { x: 6000, yOffset: -500, width: 100, height: 20, color: '#475569' },
  { x: 6300, yOffset: -400, width: 100, height: 20, color: '#475569' },
  { x: 6600, yOffset: -300, width: 100, height: 20, color: '#475569' },
  
  // --- SECTION 8: The Final Stretch ---
  { x: 6900, yOffset: 0, width: 1100, height: 600, color: '#64748b' },
  { x: 7200, yOffset: -150, width: 150, height: 20, color: '#cbd5e1' }, // Archway base
  { x: 7500, yOffset: -250, width: 150, height: 20, color: '#cbd5e1' },

  // Goal Pillars
  { x: 7750, yOffset: -150, width: 50, height: 150, color: '#cbd5e1' },
  { x: 7900, yOffset: -150, width: 50, height: 150, color: '#cbd5e1' },
];

export const GOAL_X = 7800;

// Dictionary of Tools
const TOOLS = {
  APRON: {
    name: "Masonic Apron",
    spriteKey: "apron",
    blurb: "The Lambskin Apron is the badge of innocence and the bond of friendship, more ancient than the Golden Fleece or Roman Eagle."
  },
  GAUGE: {
    name: "24 Inch Gauge",
    spriteKey: "gauge",
    blurb: "The 24 Inch Gauge represents the 24 hours of the day, teaching us to divide our time into prayer, labor, refreshment, and sleep."
  },
  GAVEL: {
    name: "Common Gavel",
    spriteKey: "gavel",
    blurb: "The Common Gavel represents the force of conscience, used to knock off all superfluous knobs and excrescences from the rude material."
  },
  CHISEL: {
    name: "Chisel",
    spriteKey: "chisel",
    blurb: "The Chisel points out to us the advantages of education, by which means alone we are rendered fit members of regularly organised society."
  },
  ROUGH: {
    name: "Rough Ashlar",
    spriteKey: "rough_ashlar",
    blurb: "The Rough Ashlar represents man in his infant or primitive state, rough and unpolished, until by education his mind becomes cultivated."
  },
  PERFECT: {
    name: "Perfect Ashlar",
    spriteKey: "perfect_ashlar",
    blurb: "The Perfect Ashlar is a stone of a true die or square, representing the mind of man in the decline of his years, after a life well spent."
  },
  LADDER: {
    name: "Jacob's Ladder",
    spriteKey: "ladder",
    blurb: "Jacob's Ladder represents the moral virtues, principally Faith, Hope, and Charity, reaching to the heavens."
  }
};

export const ORB_DATA: OrbDefinition[] = [
  // --- Start / Preparation ---
  // Orb 1: The First Apron (No Question, Instructional)
  { 
    id: 1, 
    x: 400, 
    yOffset: -50, 
    radius: 20, 
    ...TOOLS.APRON,
    blurb: "The Lambskin Apron is the badge of innocence and the bond of friendship. It is the first gift bestowed upon you. You are now permitted to wear it."
    // No questionId provided -> Skips Quiz
  },
  
  // New Orb 21: Recycled Question 1 (The First Care)
  { 
    id: 21, 
    x: 700, // On the platform at x:650
    yOffset: -200, 
    radius: 20, 
    questionId: 1, 
    ...TOOLS.APRON 
  },

  { id: 2, x: 800, yOffset: -300, radius: 20, questionId: 2, ...TOOLS.APRON },
  
  // --- Tower 1 ---
  // Introduce Tools 1st time
  { id: 3, x: 1250, yOffset: -170, radius: 20, questionId: 3, ...TOOLS.GAUGE }, // Gauge Intro
  { id: 4, x: 1350, yOffset: -390, radius: 20, questionId: 4, ...TOOLS.GAVEL }, // Gavel Intro
  { id: 5, x: 1450, yOffset: -650, radius: 20, questionId: 5, ...TOOLS.CHISEL }, // Chisel Intro

  // --- Hills ---
  { id: 6, x: 1850, yOffset: -350, radius: 20, questionId: 6, ...TOOLS.ROUGH }, // Rough Intro
  { id: 7, x: 2300, yOffset: -150, radius: 20, questionId: 7, ...TOOLS.PERFECT }, // Perfect Intro
  { id: 8, x: 2700, yOffset: -150, radius: 20, questionId: 8, ...TOOLS.LADDER }, // Ladder Intro

  // --- Mines ---
  // Specific Questions (Gauge Q10, Gavel Q11) matched to their 2nd appearance
  { id: 9, x: 3100, yOffset: 100, radius: 20, questionId: 9, ...TOOLS.APRON }, 
  { id: 10, x: 3500, yOffset: 300, radius: 20, questionId: 10, ...TOOLS.GAUGE }, // Q10: Gauge Question -> Gauge Tool
  { id: 11, x: 3850, yOffset: 50, radius: 20, questionId: 11, ...TOOLS.GAVEL }, // Q11: Gavel Question -> Gavel Tool

  // --- Bridge ---
  { id: 12, x: 4450, yOffset: -100, radius: 20, questionId: 12, ...TOOLS.CHISEL }, // Q12: Jewels -> Chisel
  { id: 13, x: 4750, yOffset: -100, radius: 20, questionId: 13, ...TOOLS.ROUGH }, // Q13: Rough Ashlar Q -> Rough Tool

  // --- High Tower ---
  { id: 14, x: 5150, yOffset: -200, radius: 20, questionId: 14, ...TOOLS.PERFECT },
  { id: 15, x: 5250, yOffset: -800, radius: 20, questionId: 15, ...TOOLS.LADDER }, // Q15: Ladder Q -> Ladder Tool

  // --- Floating Isles ---
  { id: 16, x: 5750, yOffset: -650, radius: 20, questionId: 16, ...TOOLS.APRON },
  { id: 17, x: 6350, yOffset: -450, radius: 20, questionId: 17, ...TOOLS.APRON },
  { id: 18, x: 6650, yOffset: -350, radius: 20, questionId: 18, ...TOOLS.APRON },

  // --- Final Stretch ---
  { id: 19, x: 7200, yOffset: -200, radius: 20, questionId: 19, ...TOOLS.APRON },
  { id: 20, x: 7500, yOffset: -300, radius: 20, questionId: 20, ...TOOLS.APRON },
];