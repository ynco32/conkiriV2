// src/hooks/useArenas.ts
'use client';
import { useState, useEffect } from 'react';
import { arenaApi } from '@/api/sight/arena';
import { ArenaInfo } from '../types/arena';

interface UseArenasResult {
  arenas: ArenaInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useArenas = (): UseArenasResult => {
  const [arenas, setArenas] = useState<ArenaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArenas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await arenaApi.getArenas();
      setArenas(response.data.arenas);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('알 수 없는 에러가 발생했습니다.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArenas();
  }, []);

  return {
    arenas,
    isLoading,
    error,
    refetch: fetchArenas,
  };
};
