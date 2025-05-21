import { useState, useEffect } from 'react';
import { apiRequest } from '@/api/api';
import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';

interface TicketingResult {
  concertName: string;
  ticketingPlatform: string;
  section: string;
  seat: string;
  reserveTime: string;
}

export const useTicketingResult = () => {
  const [ticketingResult, setTicketingResult] =
    useState<TicketingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getResult = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<TicketingResult>(
        'GET',
        `/api/v1/ticketing/result`
      );
      if (response) {
        setTicketingResult(response);
      } else {
        setError('응답 데이터가 없습니다.');
      }
    } catch (err: any) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || '티켓팅 결과 조회 실패');
      } else {
        setError(err.message || '알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getResult();
  }, []);

  const saveResult = async (section: string, seat: string) => {
    try {
      await apiRequest('POST', `/api/v1/ticketing/result`, {
        section,
        seat,
      });
      return true;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data?.message || '티켓팅 결과 저장 실패');
      }
      throw new Error('알 수 없는 오류가 발생했습니다.');
    }
  };

  return {
    ticketingResult,
    loading,
    error,
    saveResult,
    refreshResult: getResult,
  };
};
