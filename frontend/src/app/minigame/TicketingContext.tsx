// minigame/TicketingContext.tsx
'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 게임 모드 타입 정의
export type GameMode = 'GRAPE' | 'QUEUE' | 'CAPCHA' | null;

type TicketingContextType = {
  reactionTime: number;
  gameMode: GameMode;
  setReactionTime: (time: number) => void;
  setGameMode: (mode: GameMode) => void;
};

const TicketingContext = createContext<TicketingContextType | undefined>(
  undefined
);

export const TicketingProvider = ({ children }: { children: ReactNode }) => {
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [gameMode, setGameMode] = useState<GameMode>(null);

  return (
    <TicketingContext.Provider
      value={{
        reactionTime,
        gameMode,
        setReactionTime,
        setGameMode,
      }}
    >
      {children}
    </TicketingContext.Provider>
  );
};

export const useTicketing = () => {
  const context = useContext(TicketingContext);
  if (context === undefined) {
    throw new Error('useTicketing must be used within a TicketingProvider');
  }
  return context;
};
