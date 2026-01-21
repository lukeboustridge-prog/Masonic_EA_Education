import { Question, Platform, Orb, OrbDefinition, PlatformType } from './types';

// Temple Visual Theme Colors
export const TEMPLE_COLORS = {
  STONE_DARK: '#2d2a26',
  STONE_MID: '#4a4540',
  STONE_LIGHT: '#6b6560',
  STONE_ACCENT: '#8b8580',
  CANDLE_GLOW: '#ffb347',
  TORCH_GLOW: '#ff8c00',
  AMBIENT_WARM: '#3d3428',
  GOLD: '#d4af37',
  GOLD_BRIGHT: '#ffd700',
  ROYAL_BLUE: '#1e3a5f',
  MOSAIC_WHITE: '#e8e4df',
  MOSAIC_BLACK: '#1a1a1a',
  CEILING_DARK: '#1a1510',
  NIGHT_SKY: '#0d1117',
};

// Room definitions for the temple journey
export const ROOM_DEFINITIONS = [
  { id: 1, name: 'Preparation Room', xStart: 0, xEnd: 800 },
  { id: 2, name: 'Entrance Porch', xStart: 800, xEnd: 1200 },
  { id: 3, name: 'Lodge Room West', xStart: 1200, xEnd: 2150 },
  { id: 4, name: 'Lodge Center', xStart: 2150, xEnd: 3000 },
  { id: 5, name: 'North Passage', xStart: 3000, xEnd: 4000 },
  { id: 6, name: 'Winding Stairs', xStart: 4000, xEnd: 5100 },
  { id: 7, name: 'Middle Chamber', xStart: 5100, xEnd: 5500 },
  { id: 8, name: 'Celestial Canopy', xStart: 5500, xEnd: 6900 },
  { id: 9, name: 'The East', xStart: 6900, xEnd: 8000 },
];

// Light sources for candlelit atmosphere
export const LIGHT_SOURCES = [
  // Preparation Room - dim, single candle
  { x: 400, y: 280, radius: 120, intensity: 0.4, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Entrance Porch - torches by pillars
  { x: 850, y: 200, radius: 150, intensity: 0.6, color: TEMPLE_COLORS.TORCH_GLOW },
  { x: 1150, y: 200, radius: 150, intensity: 0.6, color: TEMPLE_COLORS.TORCH_GLOW },

  // Lodge Room West - multiple candles
  { x: 1300, y: 250, radius: 140, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 1500, y: 180, radius: 130, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 1700, y: 250, radius: 140, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 1900, y: 200, radius: 130, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Lodge Center - brighter, central area
  { x: 2300, y: 220, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 2550, y: 180, radius: 150, intensity: 0.6, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 2800, y: 220, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.CANDLE_GLOW },

  // North Passage - darker, fewer lights (mines area)
  { x: 3200, y: 350, radius: 100, intensity: 0.3, color: TEMPLE_COLORS.TORCH_GLOW },
  { x: 3600, y: 400, radius: 100, intensity: 0.3, color: TEMPLE_COLORS.TORCH_GLOW },
  { x: 3900, y: 300, radius: 120, intensity: 0.4, color: TEMPLE_COLORS.TORCH_GLOW },

  // Winding Stairs - ascending lights
  { x: 4150, y: 250, radius: 120, intensity: 0.4, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 4400, y: 220, radius: 120, intensity: 0.4, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 4650, y: 190, radius: 120, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 4900, y: 160, radius: 130, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Middle Chamber - Jacob's Ladder area, golden glow
  { x: 5150, y: 200, radius: 180, intensity: 0.7, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 5350, y: 100, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 5250, y: -100, radius: 180, intensity: 0.7, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 5300, y: -300, radius: 200, intensity: 0.8, color: TEMPLE_COLORS.GOLD_BRIGHT },

  // Celestial Canopy - ethereal starlight
  { x: 5700, y: -400, radius: 200, intensity: 0.5, color: '#aabbff' },
  { x: 6000, y: -350, radius: 180, intensity: 0.5, color: '#aabbff' },
  { x: 6300, y: -300, radius: 180, intensity: 0.5, color: '#aabbff' },
  { x: 6600, y: -250, radius: 200, intensity: 0.5, color: '#aabbff' },

  // The East - blazing sunlight
  { x: 7000, y: 180, radius: 200, intensity: 0.7, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 7300, y: 150, radius: 220, intensity: 0.8, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 7600, y: 120, radius: 250, intensity: 0.9, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 7850, y: 100, radius: 300, intensity: 1.0, color: TEMPLE_COLORS.GOLD_BRIGHT },
];

// Physics Tweaks for better feel
export const GRAVITY = 0.35;      // Slightly floatier jumps
export const FRICTION = 0.85;     // Slightly more slide (feels faster)
export const MOVE_SPEED = 5.5;    // Slightly faster
export const JUMP_FORCE = -11.5;  // Slightly higher jumps

export const WORLD_WIDTH = 8000;

// Logical height for Scale-to-Fit
export const DESIGN_HEIGHT = 360;

// Checkpoints with visual coordinates (x, yOffset from ground)
export const CHECKPOINTS = [
  { x: 50, yOffset: 0 },      // Start
  { x: 1200, yOffset: 0 },    // Tower Base
  { x: 2150, yOffset: 0 },    // Hills
  { x: 3000, yOffset: 150 },  // Mines entrance
  { x: 4280, yOffset: -50 },  // Bridge start
  { x: 5100, yOffset: 0 },    // Jacob's Ladder base
  { x: 6850, yOffset: 0 }     // Final Stretch
];

// NPC Locations
export const NPC_CONFIG = {
  INNER_GUARD: { x: 200, yOffset: 0 },
  MASTER: { x: 350, yOffset: 0 },
  JUNIOR_WARDEN: { x: 2700, yOffset: -100 },
  SENIOR_WARDEN: { x: 7800, yOffset: 0 },
};

// Tassels (Cardinal Virtues) - Located on DISTINCT platforms away from orbs
export const TASSELS = [
  {
    id: 101,
    name: "Temperance",
    x: 2560, yOffset: -230, // Rolling Hills platform at 2500, width 120. Center is 2560.
    blurb: "Temperance is that due restraint upon our affections and passions which renders the body tame and governable, and frees the mind from the allurements of vice."
  },
  {
    id: 102,
    name: "Fortitude",
    x: 1440, yOffset: -250, // Tower platform at 1380, width 120. Center is 1440.
    blurb: "Fortitude is that noble and steady purpose of the mind, whereby we are enabled to undergo any pain, peril, or danger, when prudentially deemed expedient."
  },
  {
    id: 103,
    name: "Prudence",
    x: 4670, yOffset: -130, // Bridge peak platform at 4620, width 100. Center is 4670.
    blurb: "Prudence teaches us to regulate our lives and actions agreeably to the dictates of reason, and is that habit by which we wisely judge."
  },
  {
    id: 104,
    name: "Justice",
    x: 6025, yOffset: -550, // Floating isle at 5950, width 150. Center is 6025.
    blurb: "Justice is that station or boundary of right which enables us to render to every man his just due without distinction."
  }
];

// Jacob's Ladder Visuals
export const JACOBS_LADDER_LABELS = [
  { text: "FAITH", x: 5150, yOffset: -200 },
  { text: "HOPE", x: 5150, yOffset: -400 },
  { text: "CHARITY", x: 5150, yOffset: -600 }
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
// Platform types: 'floor' | 'step' | 'pillar_base' | 'platform' | 'altar' | 'ladder_rung' | 'celestial'
export const PLATFORM_DATA: Array<{
  x: number;
  yOffset: number;
  width: number;
  height: number;
  color: string;
  type?: PlatformType;
}> = [
  // --- SECTION 1: Preparation Room (Starting Area) ---
  { x: 0, yOffset: 0, width: 800, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  { x: 500, yOffset: -80, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 650, yOffset: -180, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 800, yOffset: -250, width: 180, height: 20, color: TEMPLE_COLORS.STONE_MID, type: 'platform' },

  // Entrance Porch - stepping stones
  { x: 950, yOffset: -100, width: 100, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1080, yOffset: -50, width: 100, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },

  // --- SECTION 2: Lodge Room West (The First Tower) ---
  { x: 1200, yOffset: 0, width: 400, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  { x: 1200, yOffset: -120, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1380, yOffset: -220, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1280, yOffset: -340, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1420, yOffset: -460, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1280, yOffset: -580, width: 320, height: 20, color: TEMPLE_COLORS.STONE_ACCENT, type: 'platform' },

  // Descent Steps
  { x: 1680, yOffset: -450, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1850, yOffset: -300, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 2020, yOffset: -150, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },

  // --- SECTION 3: Lodge Center (Rolling Hills) ---
  { x: 2150, yOffset: 0, width: 800, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  { x: 2300, yOffset: -100, width: 120, height: 20, color: TEMPLE_COLORS.STONE_MID, type: 'step' },
  { x: 2500, yOffset: -200, width: 120, height: 20, color: TEMPLE_COLORS.STONE_MID, type: 'step' },
  { x: 2700, yOffset: -100, width: 120, height: 20, color: TEMPLE_COLORS.STONE_MID, type: 'platform' }, // JW platform

  // --- SECTION 4: North Passage (The Mines) ---
  { x: 3000, yOffset: 150, width: 220, height: 20, color: TEMPLE_COLORS.STONE_DARK, type: 'step' },
  { x: 3250, yOffset: 250, width: 220, height: 20, color: TEMPLE_COLORS.STONE_DARK, type: 'step' },
  { x: 3500, yOffset: 350, width: 450, height: 20, color: TEMPLE_COLORS.STONE_DARK, type: 'platform' },
  { x: 3700, yOffset: 250, width: 120, height: 20, color: TEMPLE_COLORS.STONE_DARK, type: 'step' },
  { x: 3850, yOffset: 100, width: 120, height: 20, color: TEMPLE_COLORS.STONE_DARK, type: 'step' },
  { x: 4000, yOffset: 0, width: 250, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },

  // --- SECTION 5: Winding Stairs (Bridge of Sighs) ---
  { x: 4280, yOffset: -50, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 4450, yOffset: -50, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 4620, yOffset: -100, width: 100, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 4750, yOffset: -50, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 4920, yOffset: -50, width: 120, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },

  // --- SECTION 6: Middle Chamber (Jacob's Ladder) ---
  { x: 5100, yOffset: 0, width: 220, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  { x: 5130, yOffset: -150, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5320, yOffset: -250, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5130, yOffset: -350, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5320, yOffset: -450, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5130, yOffset: -550, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5320, yOffset: -650, width: 100, height: 20, color: TEMPLE_COLORS.GOLD, type: 'ladder_rung' },
  { x: 5180, yOffset: -750, width: 340, height: 20, color: TEMPLE_COLORS.GOLD_BRIGHT, type: 'altar' },

  // --- SECTION 7: Celestial Canopy (Floating Isles) ---
  { x: 5650, yOffset: -600, width: 150, height: 20, color: TEMPLE_COLORS.ROYAL_BLUE, type: 'celestial' },
  { x: 5950, yOffset: -520, width: 150, height: 20, color: TEMPLE_COLORS.ROYAL_BLUE, type: 'celestial' },
  { x: 6250, yOffset: -440, width: 150, height: 20, color: TEMPLE_COLORS.ROYAL_BLUE, type: 'celestial' },
  { x: 6550, yOffset: -360, width: 150, height: 20, color: TEMPLE_COLORS.ROYAL_BLUE, type: 'celestial' },

  // --- SECTION 8: The East (Final Stretch) ---
  { x: 6850, yOffset: 0, width: 1150, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  { x: 7200, yOffset: -150, width: 180, height: 20, color: TEMPLE_COLORS.STONE_ACCENT, type: 'step' },
  { x: 7500, yOffset: -250, width: 180, height: 20, color: TEMPLE_COLORS.STONE_ACCENT, type: 'altar' },

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
  // Platform at x:500 yOffset:-80 - orb floats 30 above
  {
    id: 1,
    x: 560,
    yOffset: -115,
    radius: 20,
    ...TOOLS.APRON,
    blurb: "The Lambskin Apron is the badge of innocence and the bond of friendship. It is the first gift bestowed upon you. You are now permitted to wear it."
  },

  // Platform at x:650 yOffset:-180 - orb floats 35 above
  { id: 21, x: 710, yOffset: -215, radius: 20, questionId: 1, ...TOOLS.APRON },

  // Platform at x:800 yOffset:-250 - orb floats 35 above
  { id: 2, x: 890, yOffset: -285, radius: 20, questionId: 2, ...TOOLS.APRON },

  // --- Tower 1 ---
  // Platform at x:1200 yOffset:-120 - orb floats 35 above
  { id: 3, x: 1260, yOffset: -155, radius: 20, questionId: 3, ...TOOLS.GAUGE },

  // Platform at x:1280 yOffset:-340 - orb floats 35 above
  { id: 4, x: 1340, yOffset: -375, radius: 20, questionId: 4, ...TOOLS.GAVEL },

  // Platform at x:1280 yOffset:-580 - orb floats 35 above
  { id: 5, x: 1440, yOffset: -615, radius: 20, questionId: 5, ...TOOLS.CHISEL },

  // --- Descent/Hills ---
  // Platform at x:1850 yOffset:-300 - orb floats 35 above
  { id: 6, x: 1910, yOffset: -335, radius: 20, questionId: 6, ...TOOLS.ROUGH },

  // Platform at x:2300 yOffset:-100 - orb floats 35 above
  { id: 7, x: 2360, yOffset: -135, radius: 20, questionId: 7, ...TOOLS.PERFECT },

  // --- Mines ---
  // Platform at x:3000 yOffset:150 - orb floats 35 above (less positive = higher)
  { id: 9, x: 3110, yOffset: 115, radius: 20, questionId: 9, ...TOOLS.APRON },

  // Platform at x:3500 yOffset:350 - orb floats 35 above
  { id: 10, x: 3725, yOffset: 315, radius: 20, questionId: 10, ...TOOLS.GAUGE },

  // Platform at x:3850 yOffset:100 - orb floats 35 above
  { id: 11, x: 3910, yOffset: 65, radius: 20, questionId: 11, ...TOOLS.GAVEL },

  // --- Bridge (WIDENED PLATFORMS) ---
  // Platform at x:4450 yOffset:-50 - orb floats 35 above
  { id: 12, x: 4510, yOffset: -85, radius: 20, questionId: 12, ...TOOLS.CHISEL },

  // Platform at x:4750 yOffset:-50 - orb floats 35 above
  { id: 13, x: 4810, yOffset: -85, radius: 20, questionId: 13, ...TOOLS.ROUGH },

  // --- High Tower ---
  // Platform at x:5130 yOffset:-150 - orb floats 35 above
  { id: 14, x: 5180, yOffset: -185, radius: 20, questionId: 14, ...TOOLS.PERFECT },

  // Peak platform at x:5180 yOffset:-750 - orb floats 35 above
  { id: 15, x: 5350, yOffset: -785, radius: 20, questionId: 15, ...TOOLS.LADDER },

  // --- Floating Isles (WIDENED PLATFORMS) ---
  // Platform at x:5650 yOffset:-600 - orb floats 35 above
  { id: 16, x: 5725, yOffset: -635, radius: 20, questionId: 16, ...TOOLS.APRON },

  // Platform at x:6250 yOffset:-440 - orb floats 35 above
  { id: 17, x: 6325, yOffset: -475, radius: 20, questionId: 17, ...TOOLS.APRON },

  // Platform at x:6550 yOffset:-360 - orb floats 35 above
  { id: 18, x: 6625, yOffset: -395, radius: 20, questionId: 18, ...TOOLS.APRON },

  // --- Final Stretch ---
  // Platform at x:7200 yOffset:-150 - orb floats 35 above
  { id: 19, x: 7290, yOffset: -185, radius: 20, questionId: 19, ...TOOLS.APRON },

  // Platform at x:7500 yOffset:-250 - orb floats 35 above
  { id: 20, x: 7590, yOffset: -285, radius: 20, questionId: 20, ...TOOLS.APRON },
];
