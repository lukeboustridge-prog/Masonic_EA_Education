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
      "To see that the Lodge is properly tyled.",
      "To sign the attendance book."
    ],
    correctAnswer: "To see that the Lodge is properly tyled.",
    explanation: "Source: Opening Ritual. The Junior Warden affirms it is the first care of every Freemason to see that the Lodge is properly tyled, a duty directed by the WM and performed by the Inner Guard."
  },
  {
    id: 2,
    text: "Where is the constant place of the Senior Warden in the Lodge?",
    answers: [
      "The East",
      "The South",
      "The West"
    ],
    correctAnswer: "The West",
    explanation: "Source: Opening Ritual. The Senior Warden is placed in the West to mark the setting sun, to close the Lodge by command of the Worshipful Master, and to see that every Brother has had his due."
  },
  {
    id: 3,
    text: "What are the Three Great Emblematical Lights in Freemasonry?",
    answers: [
      "The Sun, the Moon, and the Master of the Lodge.",
      "Wisdom, Strength, and Beauty.",
      "The Volume of the Sacred Law, the Square, and the Compasses."
    ],
    correctAnswer: "The Volume of the Sacred Law, the Square, and the Compasses.",
    explanation: "Source: Ceremony of Initiation. These are the three great emblematical lights in Freemasonry. The Sacred Writings govern our faith, the Square regulates our actions, and the Compasses keep us within due bounds with all mankind."
  },
  {
    id: 4,
    text: "What does the 24-inch Gauge represent in its speculative sense?",
    answers: [
      "The 24 hours of the day.",
      "The 24 ancient landmarks.",
      "The 24 elders of Israel."
    ],
    correctAnswer: "The 24 hours of the day.",
    explanation: "Source: Working Tools. It represents the 24 hours of the day, part to be spent in prayer to Almighty God, part in labour and refreshment, and part in serving a friend or Brother in time of need."
  },
  {
    id: 5,
    text: "Whom does the Junior Deacon carry messages from and to?",
    answers: [
      "From the Senior Warden to the Junior Warden.",
      "From the Master to the Senior Warden.",
      "From the Secretary to the Treasurer."
    ],
    correctAnswer: "From the Senior Warden to the Junior Warden.",
    explanation: "Source: Opening Ritual. The Junior Deacon's duty is to carry all messages and communications of the Worshipful Master from the Senior to the Junior Warden."
  },
  {
    id: 6,
    text: "What are the \"Immovable Jewels\" of the Lodge?",
    answers: [
      "The Square, Level, and Plumb Rule.",
      "The V.S.L., Square, and Compasses.",
      "The Tracing Board, and the Rough and Perfect Ashlars."
    ],
    correctAnswer: "The Tracing Board, and the Rough and Perfect Ashlars.",
    explanation: "Source: Tracing Board Lecture. They are called 'Immovable Jewels' because they lie open and immovable in the Lodge for the Brethren to moralise upon."
  },
  {
    id: 7,
    text: "Why does the Senior Warden sit in the West?",
    answers: [
      "To open the Lodge.",
      "To mark the setting sun and close the Lodge.",
      "To call the Brethren from labour to refreshment."
    ],
    correctAnswer: "To mark the setting sun and close the Lodge.",
    explanation: "Source: Opening Ritual. As the sun sets in the West to close the day, so the Senior Warden is placed in the West to close the Lodge by the Worshipful Master's command."
  },
  {
    id: 8,
    text: "During the Rite of Destitution (Charity Charge), what is the candidate asked to deposit?",
    answers: [
      "A coin of the realm.",
      "Whatever he feels disposed to give.",
      "His metallic substances."
    ],
    correctAnswer: "Whatever he feels disposed to give.",
    explanation: "Source: Charge in North-East. The Candidate is asked to deposit whatever he feels disposed to give, to put his principles to the test and remind him of the moment he was received into Freemasonry poor and penniless."
  },
  {
    id: 801,
    text: "Before you were admitted into the Lodge, you were divested of all metallic substances. Why?",
    answers: [
      "Because they are valuable.",
      "To show my poverty.",
      "That I might bring nothing offensive or defensive into the Lodge."
    ],
    correctAnswer: "That I might bring nothing offensive or defensive into the Lodge.",
    explanation: "Source: Reasons for Preparation. You were divested of all metals... to show that you had no weapon of offence or defence about you."
  },
  {
    id: 802,
    text: "There is a second reason for being divested of metals, referring to the building of King Solomon's Temple. What is it?",
    answers: [
      "Metal tools were too expensive.",
      "There was not heard the sound of any axe, hammer, or other metal tool.",
      "The stones were cut in the quarry using lasers."
    ],
    correctAnswer: "There was not heard the sound of any axe, hammer, or other metal tool.",
    explanation: "Source: Reasons for Preparation. At the building of King Solomon's Temple, there was not heard the sound of any hammer or other implement of iron, the materials being prepared in the quarries and forest."
  },
  {
    id: 9,
    text: "The \"Rough Ashlar\" represents man in his infant state. What represents the mind of man in the decline of his years?",
    answers: [
      "The Perfect Ashlar.",
      "The Smooth Ashlar.",
      "The Cornerstone."
    ],
    correctAnswer: "The Perfect Ashlar.",
    explanation: "Source: Tracing Board Lecture. The Perfect Ashlar represents the mind of man in the decline of his years, after a life well spent in acts of piety and virtue."
  },
  {
    id: 10,
    text: "What is the distinguishing Badge of an Entered Apprentice more ancient than?",
    answers: [
      "The Star and Garter.",
      "The Golden Fleece or Roman Eagle.",
      "The Sword and Trowel."
    ],
    correctAnswer: "The Golden Fleece or Roman Eagle.",
    explanation: "Source: Presentation of Apron. It is more ancient than the Golden Fleece or Roman Eagle, more honourable than the Garter... being the Badge of Innocence and the Bond of Friendship."
  },
  {
    id: 11,
    text: "Which architectural order is assigned to the pillar of Wisdom?",
    answers: [
      "Doric",
      "Ionic",
      "Corinthian"
    ],
    correctAnswer: "Ionic",
    explanation: "Source: Tracing Board Lecture. The three great pillars are of the Ionic, Doric, and Corinthian orders, symbolising Wisdom, Strength, and Beauty respectively."
  },
  {
    id: 12,
    text: "What does \"Lewis\" denote in the lecture on the Tracing Board?",
    answers: [
      "Wisdom.",
      "Strength.",
      "Beauty."
    ],
    correctAnswer: "Strength.",
    explanation: "Source: Tracing Board Lecture. Lewis denotes Strength. It also denotes the son of a Mason, whose duty is to bear the heat and burden of the day for his aged parents."
  },
  {
    id: 13,
    text: "In the ancient biblical custom regarding the candidate's preparation (slipshod), what did removing a shoe signify?",
    answers: [
      "Humility before God.",
      "Entering holy ground.",
      "The ratification of a bargain."
    ],
    correctAnswer: "The ratification of a bargain.",
    explanation: "Source: Reasons for Preparation. The slipshod preparation was in allusion to an ancient Biblical custom in the ratification of a bargain (Ruth iv., 7)."
  },
  {
    id: 14,
    text: "Who represents the pillar of \"Beauty\" in the building of King Solomon's Temple?",
    answers: [
      "King Solomon.",
      "Hiram, King of Tyre.",
      "Hiram Abif."
    ],
    correctAnswer: "Hiram Abif.",
    explanation: "Source: Tracing Board Lecture. Hiram Abif represents the pillar of Beauty for his curious and masterly workmanship in beautifying and adorning the Temple."
  },
  {
    id: 15,
    text: "According to the Charge after Initiation, what are the three \"distinguishing characteristics of a good Freemason\"?",
    answers: [
      "Faith, Hope, and Charity.",
      "Secrecy, Fidelity, and Obedience.",
      "Virtue, Honour, and Mercy."
    ],
    correctAnswer: "Virtue, Honour, and Mercy.",
    explanation: "Source: Tracing Board Lecture. The distinguishing characteristics of a good Freemason are Virtue, Honour, and Mercy, and may they ever be found in a Freemason's breast."
  },
  {
    id: 16,
    text: "The \"Movable Jewels\" (Square, Level, Plumb Rule) are so called because:",
    answers: [
      "They are used by the operative mason to move stones.",
      "They are worn by the Master and Wardens and transferable to successors.",
      "They are carried by the Deacons during the procession."
    ],
    correctAnswer: "They are worn by the Master and Wardens and transferable to successors.",
    explanation: "Source: Tracing Board Lecture. They are called Movable Jewels because they are worn by the Master and his Wardens, and are transferable to their successors on the day of Installation."
  },
  {
    id: 17,
    text: "What specifically rests on top of Jacob's Ladder in the Tracing Board lecture?",
    answers: [
      "The Volume of the Sacred Law.",
      "A Blazing Star.",
      "The Heavens."
    ],
    correctAnswer: "The Heavens.",
    explanation: "Source: Tracing Board Lecture. The Ladder reaches to the heavens, and rests on the V.S.L., because by the doctrines contained in that Holy Book we are taught to believe in Divine Providence."
  },
  {
    id: 18,
    text: "In the \"First Grand Offering\", what did the Almighty substitute for Isaac?",
    answers: [
      "A Lamb.",
      "A more agreeable victim.",
      "A Ram caught in a thicket."
    ],
    correctAnswer: "A more agreeable victim.",
    explanation: "Source: Tracing Board Lecture. It pleased the Almighty to substitute a more agreeable victim in his stead (traditionally a ram caught in a thicket)."
  },
  {
    id: 19,
    text: "What does the \"Indented Border\" refer to?",
    answers: [
      "The bond of friendship.",
      "The manifold blessings of nature.",
      "The Planets in their various revolutions."
    ],
    correctAnswer: "The Planets in their various revolutions.",
    explanation: "Source: Tracing Board Lecture. The Indented or Tesselated Border refers to the Planets, which in their various revolutions form a beautiful border round that grand luminary, the Sun."
  },
  {
    id: 20,
    text: "How must the \"Word\" be given?",
    answers: [
      "At length, but only in a whisper.",
      "Never at length (except in open Lodge), but always by letters or syllables.",
      "By halving it with a Brother."
    ],
    correctAnswer: "Never at length (except in open Lodge), but always by letters or syllables.",
    explanation: "Source: Secrets of the Degree. You must never give it at length (except in open Lodge), but always by letters or syllables, teaching caution."
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
  // REMOVED ID 8 (Ladder/Question 8) - Replaced by Junior Warden NPC encounter
  // { id: 8, x: 2700, yOffset: -150, radius: 20, questionId: 8, ...TOOLS.LADDER }, 

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