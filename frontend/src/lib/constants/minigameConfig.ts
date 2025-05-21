// src/lib/constants/minigameConfig.ts
interface ScoreRange {
  time: number;
  rate: number;
}

interface GameConfig {
  countdownDuration: number;
  maxReactionTime: number;
  countdownInterval: number;
  ranges: ScoreRange[];
  correction: number;
}

// 순환 참조를 피하기 위해 먼저 객체를 정의합니다
export const GAME_CONFIG = {
  QUEUE: {
    countdownDuration: 5000, // 5초
    maxReactionTime: 5000, // 5초 제한
    countdownInterval: 100, // 100ms로 정밀하게 업데이트
    ranges: [
      { time: 30, rate: 99 }, // 최상급
      { time: 50, rate: 95 }, // 매우 빠름
      { time: 100, rate: 85 }, // 빠름
      { time: 150, rate: 70 }, // 양호
      { time: 200, rate: 55 }, // 보통
      { time: 300, rate: 35 }, // 느림
      { time: 400, rate: 20 }, // 매우 느림
    ],
    correction: 0.7,
  },
  GRAPE: {
    countdownDuration: 3000, // 3초
    maxReactionTime: 5000, // 5초 제한
    countdownInterval: 100, // 100ms로 정밀하게 업데이트
    ranges: [
      { time: 300, rate: 99 },
      { time: 500, rate: 95 },
      { time: 800, rate: 85 },
      { time: 1000, rate: 70 },
      { time: 1300, rate: 55 },
      { time: 1600, rate: 35 },
      { time: 2000, rate: 20 },
    ],
    correction: 0.9,
  },
  CAPCHA: {
    countdownDuration: 3000, // 3초
    maxReactionTime: 10000, // 10초 제한
    countdownInterval: 50, // 50ms로 정밀하게 업데이트
    ranges: [
      { time: 2000, rate: 99 },
      { time: 3000, rate: 95 },
      { time: 4000, rate: 85 },
      { time: 6000, rate: 70 },
      { time: 8000, rate: 55 },
      { time: 9000, rate: 35 },
      { time: 10000, rate: 20 },
    ],
    correction: 0.8,
  },
} as const satisfies Record<string, GameConfig>;

// 게임 모드 타입 정의 - GAME_CONFIG 정의 후에 위치
export type GameMode = keyof typeof GAME_CONFIG;

// 게임별 설정 타입 추출
export type GameConfigType = (typeof GAME_CONFIG)[GameMode];
