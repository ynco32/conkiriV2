// src/hooks/useSuccessRate.ts
import { GAME_CONFIG, GameMode } from '@/lib/constants/minigameConfig';

// [React] 성공률 계산 커스텀 훅
export const useSuccessRate = (mode: GameMode) => {
  const calculateSuccessRate = (reactionTime: number): number => {
    // mode가 undefined이거나 존재하지 않는 경우 처리
    if (!mode || !GAME_CONFIG[mode]) {
      console.error(`Invalid mode: ${mode}`);
      return 5; // 기본값 반환
    }

    const config = GAME_CONFIG[mode];
    const { ranges, correction, maxReactionTime: timeLimit } = config;

    // 시간 초과 체크
    if (reactionTime >= timeLimit) {
      return 5; // 시간 초과시 5% 성공률
    }

    const sortedRanges = [...ranges].sort((a, b) => a.time - b.time);

    // 범위를 벗어나는 경우 처리
    if (reactionTime <= sortedRanges[0].time) return sortedRanges[0].rate;
    if (reactionTime >= sortedRanges[sortedRanges.length - 1].time) {
      return Math.max(5, sortedRanges[sortedRanges.length - 1].rate); // 최소 5%
    }

    // 구간 찾기 및 선형 보간법 적용
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      const currentRange = sortedRanges[i];
      const nextRange = sortedRanges[i + 1];

      if (reactionTime >= currentRange.time && reactionTime <= nextRange.time) {
        const timeRatio =
          (reactionTime - currentRange.time) /
          (nextRange.time - currentRange.time);
        const rateRange = nextRange.rate - currentRange.rate;

        // 보정 계수 적용
        const correctedRatio = Math.pow(1 - timeRatio, correction);

        return Math.max(
          5,
          Math.round(currentRange.rate - rateRange * (1 - correctedRatio))
        ); // 최소 5% 보장
      }
    }

    return 5; // 기본값도 5%로 설정
  };

  return { calculateSuccessRate };
};
