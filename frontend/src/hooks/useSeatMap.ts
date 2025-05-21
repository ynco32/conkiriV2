// src/hooks/useSeatMap.ts
import { useState, useEffect } from 'react';
import { arenaApi } from '@/api/sight/arena';
import { SectionSeatsApi } from '@/types/arena';

export const useSeatMap = (
  arenaId: string,
  sectionId: string,
  initialData?: SectionSeatsApi
) => {
  const [seatData, setSeatData] = useState<SectionSeatsApi | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 초기 데이터가 있으면 API 호출을 건너뛰기
    if (initialData) {
      setSeatData(initialData);
      setIsLoading(false);
      return;
    }

    // 초기 데이터가 없을 경우 클라이언트에서 API 호출
    const fetchSeatData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await arenaApi.getSectionSeats(arenaId, sectionId);
        setSeatData(response.data.data);
      } catch (err: any) {
        console.error('좌석 데이터 가져오기 실패:', err);
        setError(
          err.message || '좌석 데이터를 불러오는 중 오류가 발생했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeatData();
  }, [arenaId, sectionId, initialData]);

  return { seatData, isLoading, error };
};
