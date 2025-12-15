export interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswer: string;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  vx: number;
  vy: number;
  isGrounded: boolean;
  color: string;
  facing: 1 | -1; // 1 = Right, -1 = Left
  jumpCount: number;
  coyoteTimer: number; // Frames allowed to jump after leaving a platform
}

export interface Platform extends Entity {
  color: string;
}

export interface Orb {
  id: number;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  questionId: number;
}

export enum GameState {
  PLAYING,
  QUIZ,
  GAME_OVER,
  VICTORY
}