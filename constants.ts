import { Question, Platform, Orb } from './types';

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

export const CHECKPOINTS = [0, 1200, 2150, 3000, 4300, 5100, 6900];

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
    answers: ["The V.S.L.", "The Heavens", "The Blazing Star"],
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

export const ORB_DATA = [
  // Section 1
  { id: 1, x: 875, yOffset: -300, radius: 20, questionId: 1 }, 
  // Section 2
  { id: 2, x: 1450, yOffset: -630, radius: 20, questionId: 2 },
  // Section 3
  { id: 3, x: 2550, yOffset: -250, radius: 20, questionId: 3 },
  // Section 4 (Mines)
  { id: 4, x: 3700, yOffset: 300, radius: 20, questionId: 4 },
  // Section 5
  { id: 5, x: 4640, yOffset: -200, radius: 20, questionId: 5 },
  // Section 6 (Peak)
  { id: 6, x: 5350, yOffset: -800, radius: 20, questionId: 6 },
  // Section 7
  { id: 7, x: 6050, yOffset: -550, radius: 20, questionId: 7 },
  { id: 8, x: 6650, yOffset: -350, radius: 20, questionId: 8 },
  // Section 8
  { id: 9, x: 7275, yOffset: -200, radius: 20, questionId: 9 },
  { id: 10, x: 7575, yOffset: -300, radius: 20, questionId: 10 },
];

export const GOAL_X = 7800;