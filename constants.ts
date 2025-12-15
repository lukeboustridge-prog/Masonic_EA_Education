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
    text: "What is the \"first care\" of every Freemason upon opening the Lodge?",
    answers: [
      "To see that the Brethren are clothed.",
      "To pay the Tyler.",
      "To see that the Lodge is properly tyled.",
      "To sign the attendance book."
    ],
    correctAnswer: "To see that the Lodge is properly tyled."
  },
  {
    id: 2,
    text: "Where is the constant place of the Senior Warden in the Lodge?",
    answers: [
      "The East",
      "The South",
      "The West",
      "The North"
    ],
    correctAnswer: "The West"
  },
  {
    id: 3,
    text: "What are the Three Great Emblematical Lights in Freemasonry?",
    answers: [
      "The Sun, the Moon, and the Master of the Lodge.",
      "Wisdom, Strength, and Beauty.",
      "The Volume of the Sacred Law, the Square, and the Compasses.",
      "The 24-inch Gauge, the Gavel, and the Chisel."
    ],
    correctAnswer: "The Volume of the Sacred Law, the Square, and the Compasses."
  },
  {
    id: 4,
    text: "What does the 24-inch Gauge represent in its speculative sense?",
    answers: [
      "The 24 inches of the rough ashlar.",
      "The 24 hours of the day.",
      "The 24 ancient landmarks.",
      "The 24 elders of Israel."
    ],
    correctAnswer: "The 24 hours of the day."
  },
  {
    id: 5,
    text: "Whom does the Junior Deacon carry messages from and to?",
    answers: [
      "From the Senior Warden to the Junior Warden.",
      "From the Master to the Senior Warden.",
      "From the Junior Warden to the Inner Guard.",
      "From the Secretary to the Treasurer."
    ],
    correctAnswer: "From the Senior Warden to the Junior Warden."
  },
  {
    id: 6,
    text: "What are the \"Immovable Jewels\" of the Lodge?",
    answers: [
      "The Square, Level, and Plumb Rule.",
      "The V.S.L., Square, and Compasses.",
      "The Tracing Board, and the Rough and Perfect Ashlars.",
      "The Collar, the Jewel, and the Apron."
    ],
    correctAnswer: "The Tracing Board, and the Rough and Perfect Ashlars."
  },
  {
    id: 7,
    text: "Why does the Senior Warden sit in the West?",
    answers: [
      "To open the Lodge.",
      "To mark the setting sun and close the Lodge.",
      "To call the Brethren from labour to refreshment.",
      "To admit candidates in due form."
    ],
    correctAnswer: "To mark the setting sun and close the Lodge."
  },
  {
    id: 8,
    text: "During the Rite of Destitution (Charity Charge) in the N.E. Corner, what is the candidate asked to deposit?",
    answers: [
      "His Signed Declaration.",
      "A coin of the realm.",
      "Whatever he feels disposed to give.",
      "His metallic substances."
    ],
    correctAnswer: "Whatever he feels disposed to give."
  },
  {
    id: 9,
    text: "The \"Rough Ashlar\" represents man in his infant or primitive state. What represents the mind of man in the decline of his years?",
    answers: [
      "The Tracing Board.",
      "The Perfect Ashlar.",
      "The Smooth Ashlar.",
      "The Cornerstone."
    ],
    correctAnswer: "The Perfect Ashlar."
  },
  {
    id: 10,
    text: "What is the distinguishing Badge of an Entered Apprentice more ancient than?",
    answers: [
      "The Star and Garter.",
      "The Golden Fleece or Roman Eagle.",
      "The Crown and Sceptre.",
      "The Sword and Trowel."
    ],
    correctAnswer: "The Golden Fleece or Roman Eagle."
  },
  {
    id: 11,
    text: "Which architectural order is assigned to the pillar of Wisdom?",
    answers: [
      "Doric",
      "Ionic",
      "Corinthian",
      "Tuscan"
    ],
    correctAnswer: "Ionic"
  },
  {
    id: 12,
    text: "What does \"Lewis\" denote in the lecture on the Tracing Board?",
    answers: [
      "Wisdom.",
      "Strength.",
      "Beauty.",
      "Justice."
    ],
    correctAnswer: "Strength."
  },
  {
    id: 13,
    text: "In the ancient biblical custom referred to regarding the candidate's preparation (slipshod), what did removing a shoe signify?",
    answers: [
      "Humility before God.",
      "Entering holy ground.",
      "The ratification of a bargain.",
      "A sign of poverty."
    ],
    correctAnswer: "The ratification of a bargain."
  },
  {
    id: 14,
    text: "Who represents the pillar of \"Beauty\" in the building of King Solomon's Temple?",
    answers: [
      "King Solomon.",
      "Hiram, King of Tyre.",
      "Hiram Abif.",
      "Adoniram."
    ],
    correctAnswer: "Hiram Abif."
  },
  {
    id: 15,
    text: "According to the Charge after Initiation, what are the three \"distinguishing characteristics of a good Freemason\"?",
    answers: [
      "Faith, Hope, and Charity.",
      "Secrecy, Fidelity, and Obedience.",
      "Virtue, Honour, and Mercy.",
      "Brotherly Love, Relief, and Truth."
    ],
    correctAnswer: "Virtue, Honour, and Mercy."
  },
  {
    id: 16,
    text: "The \"Movable Jewels\" (Square, Level, Plumb Rule) are so called because:",
    answers: [
      "They are used by the operative mason to move stones.",
      "They move from the Master to the Wardens during the ceremony.",
      "They are worn by the Master and Wardens and transferable to successors.",
      "They are carried by the Deacons during the procession."
    ],
    correctAnswer: "They are worn by the Master and Wardens and transferable to successors."
  },
  {
    id: 17,
    text: "What specifically rests on top of Jacob's Ladder in the Tracing Board lecture?",
    answers: [
      "The Volume of the Sacred Law.",
      "A Blazing Star.",
      "The Heavens.",
      "The Seven Stars."
    ],
    correctAnswer: "The Heavens."
  },
  {
    id: 18,
    text: "In the \"First Grand Offering\" which consecrated the ground of the Lodge, what did the Almighty substitute for Isaac?",
    answers: [
      "A Lamb.",
      "A more agreeable victim.",
      "A Ram caught in a thicket.",
      "A burnt offering."
    ],
    correctAnswer: "A more agreeable victim."
  },
  {
    id: 19,
    text: "The \"Ornaments\" of the Lodge are the Mosaic Pavement, the Blazing Star, and the Indented Border. What does the \"Indented Border\" refer to?",
    answers: [
      "The difference between day and night.",
      "The bond of friendship.",
      "The manifold blessings of nature.",
      "The Planets in their various revolutions."
    ],
    correctAnswer: "The Planets in their various revolutions."
  },
  {
    id: 20,
    text: "When discussing the \"Secrets\" of this degree, the Worshipful Master states that the \"Grip or Token\" demands a \"Word\". How must this Word be given?",
    answers: [
      "At length, but only in a whisper.",
      "Only by letter.",
      "Never at length (except in open Lodge), but always by letters or syllables.",
      "By halving it with a Brother."
    ],
    correctAnswer: "Never at length (except in open Lodge), but always by letters or syllables."
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