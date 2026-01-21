export interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PlatformType = 'floor' | 'step' | 'pillar_base' | 'platform' | 'altar' | 'ladder_rung' | 'celestial';

export interface Player extends Entity {
  vx: number;
  vy: number;
  isGrounded: boolean;
  color: string;
  facing: 1 | -1; // 1 = Right, -1 = Left
  jumpCount: number;
  coyoteTimer: number; // Frames allowed to jump after leaving a platform
  rank?: string;
  initiationDate?: string;
  isGrandOfficer?: boolean;
}

export interface Platform extends Entity {
  color: string;
  type?: PlatformType;
}

export interface Orb {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  questionId?: number;
  // New Lore Fields
  name: string;
  spriteKey: string;
  blurb: string;
}

export interface OrbDefinition {
  id: number;
  x: number;
  yOffset: number;
  radius: number;
  questionId?: number;
  name: string;
  spriteKey: string;
  blurb: string;
}

export enum GameState {
  START_MENU,
  PLAYING,
  PAUSED,
  LORE,
  QUIZ,
  GAME_OVER,
  VICTORY
}
