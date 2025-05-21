'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketing } from '@/app/minigame/TicketingContext';
import { GAME_CONFIG, GameMode } from '@/lib/constants/minigameConfig';

type GameState = 'counting' | 'waiting' | 'completed';

interface UseReactionGameOptions {
  gameMode: GameMode;
}

interface UseReactionGameReturn {
  gameState: GameState;
  countdown: number;
  startGame: () => void;
  completeGame: () => void;
  isTimeOut: () => boolean;
}

const useReactionGame = (
  options: UseReactionGameOptions
): UseReactionGameReturn => {
  const router = useRouter();
  const { setReactionTime, setGameMode } = useTicketing();

  const { gameMode } = options;
  const config = GAME_CONFIG[gameMode];

  const [gameState, setGameState] = useState<GameState>('counting');
  const [countdown, setCountdown] = useState(
    Math.ceil(config.countdownDuration / 1000)
  );
  const startTimeRef = useRef<number>(0);
  const autoRedirectTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isGameCompletedRef = useRef(false);

  // 게임 모드 설정 (queue, grape, capcha로 변환)
  useEffect(() => {
    setGameMode(gameMode);
  }, [setGameMode, gameMode]);

  // 카운트다운 시작
  const startGame = () => {
    const startTimestamp = performance.now();
    const endTimestamp = startTimestamp + config.countdownDuration;

    const intervalId = setInterval(() => {
      const now = performance.now();
      const remaining = Math.ceil((endTimestamp - now) / 1000);

      if (remaining <= 0) {
        clearInterval(intervalId);
        setCountdown(0);
        setGameState('waiting');
        startTimeRef.current = performance.now();

        // 제한 시간 설정
        autoRedirectTimerRef.current = setTimeout(() => {
          if (!isGameCompletedRef.current) {
            setReactionTime(config.maxReactionTime);
            router.push('/minigame/complete');
          }
        }, config.maxReactionTime);
      } else {
        setCountdown(remaining);
      }
    }, config.countdownInterval);

    return () => {
      clearInterval(intervalId);
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
      }
    };
  };

  // 게임 완료 처리
  const completeGame = () => {
    if (gameState !== 'waiting') return;

    isGameCompletedRef.current = true;
    const endTime = performance.now();
    const reactionTime = endTime - startTimeRef.current;

    // 비정상적인 반응 시간 필터링
    if (reactionTime > config.maxReactionTime) {
      console.warn('Invalid reaction time detected');
      setReactionTime(config.maxReactionTime);
    } else {
      setReactionTime(reactionTime);
    }

    if (autoRedirectTimerRef.current) {
      clearTimeout(autoRedirectTimerRef.current);
    }

    setGameState('completed');
    router.push('/minigame/complete');
  };

  // 시간 초과 확인
  const isTimeOut = () => {
    if (gameState !== 'waiting') return false;
    const currentTime = performance.now();
    return currentTime - startTimeRef.current > config.maxReactionTime;
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
      }
    };
  }, []);

  // 카운트다운 시작
  useEffect(() => {
    const cleanup = startGame();
    return cleanup;
  }, [config]);

  return {
    gameState,
    countdown,
    startGame,
    completeGame,
    isTimeOut,
  };
};

export default useReactionGame;
